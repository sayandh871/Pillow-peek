"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { carts, cartItems, productVariants, products, productImages } from "@/lib/db/schema";
import { getCurrentUser, createGuestSession, guestSession } from "@/lib/auth/actions";

// -----------------------------------------------------------------------------
// Schemas
// -----------------------------------------------------------------------------

const addToCartSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

const updateCartItemSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.number().int().min(0),
});

// -----------------------------------------------------------------------------
// Actions
// -----------------------------------------------------------------------------

export async function getCart() {
  const user = await getCurrentUser();
  let cart;

  if (user) {
    cart = await db.query.carts.findFirst({
      where: eq(carts.userId, user.id),
      with: {
        items: {
          with: {
            variant: {
              with: {
                product: {
                    with: {
                        images: { limit: 1 }
                    }
                },
                size: true,
                firmness: true,
              }
            }
          },
          orderBy: (items, { asc }) => [asc(items.createdAt)],
        }
      }
    });
  } else {
    const { sessionToken } = await guestSession();
    if (sessionToken) {
      cart = await db.query.carts.findFirst({
        where: eq(carts.sessionToken, sessionToken),
        with: {
            items: {
              with: {
                variant: {
                  with: {
                    product: {
                         with: {
                            images: { limit: 1 }
                        }
                    },
                    size: true,
                    firmness: true,
                  }
                }
              },
              orderBy: (items, { asc }) => [asc(items.createdAt)],
            }
          }
      });
    }
  }

  return cart || null;
}

export async function addCartItem(input: { variantId: string; quantity: number }) {
  const { variantId, quantity } = addToCartSchema.parse(input);
  console.log(`[Adding to Cart] Variant: ${variantId}, Qty: ${quantity}`);
  
  const user = await getCurrentUser();
  let cartId: string;

  // 1. Get or Create Cart
  if (user) {
    let cart = await db.query.carts.findFirst({
      where: eq(carts.userId, user.id),
    });
    if (!cart) {
      [cart] = await db.insert(carts).values({ userId: user.id }).returning();
    }
    cartId = cart.id;
  } else {
    let { sessionToken } = await guestSession();
    if (!sessionToken) {
        const res = await createGuestSession();
        if (res.ok && res.sessionToken) sessionToken = res.sessionToken;
        else throw new Error("Failed to create guest session");
    }
    
    let cart = await db.query.carts.findFirst({
      where: eq(carts.sessionToken, sessionToken),
    });
    if (!cart) {
      [cart] = await db.insert(carts).values({ sessionToken }).returning();
    }
    cartId = cart.id;
  }

  // 2. Stock Check & Insert (neon-http doesn't support transactions)
  // Check current stock
  const variant = await db.query.productVariants.findFirst({
      where: eq(productVariants.id, variantId),
      columns: { stockQuantity: true }
  });
  
  if (!variant) throw new Error("Variant not found");
  
  // Check if item already exists in cart
  const existingItem = await db.query.cartItems.findFirst({
      where: and(eq(cartItems.cartId, cartId), eq(cartItems.variantId, variantId)),
  });

  const currentQty = existingItem ? existingItem.quantity : 0;
  const totalRequested = currentQty + quantity;

  // Validate stock before insert/update
  if (variant.stockQuantity < totalRequested) {
       throw new Error(`Out of Stock. Max available: ${variant.stockQuantity}`);
  }

  // Perform update or insert
  if (existingItem) {
      await db.update(cartItems)
          .set({ quantity: totalRequested, updatedAt: new Date() })
          .where(eq(cartItems.id, existingItem.id));
  } else {
      await db.insert(cartItems).values({
          cartId,
          variantId,
          quantity,
      });
  }

  revalidatePath("/cart");
  return { success: true };
}

async function verifyCartOwnership(itemId: string) {
    const user = await getCurrentUser();
    
    const item = await db.query.cartItems.findFirst({
        where: eq(cartItems.id, itemId),
        with: {
            cart: true,
            variant: true
        }
    });

    if (!item) throw new Error("Item not found");

    if (user) {
        if (item.cart.userId !== user.id) {
            throw new Error("Unauthorized: Cart does not belong to user");
        }
    } else {
        const { sessionToken } = await guestSession();
        if (!sessionToken || item.cart.sessionToken !== sessionToken) {
            throw new Error("Unauthorized: Cart does not belong to session");
        }
    }
    return item;
}

export async function updateCartItem(input: { itemId: string; quantity: number }) {
  const { itemId, quantity } = updateCartItemSchema.parse(input);

  // Authorization Check
  const item = await verifyCartOwnership(itemId);

  if (quantity === 0) {
      await db.delete(cartItems).where(eq(cartItems.id, itemId));
  } else {
      // Stock Check
      if (item.variant.stockQuantity < quantity) {
          throw new Error(`Quantity exceeds stock. Max: ${item.variant.stockQuantity}`);
      }
      await db.update(cartItems)
          .set({ quantity, updatedAt: new Date() })
          .where(eq(cartItems.id, itemId));
  }
  
  revalidatePath("/cart");
  return { success: true };
}

export async function removeCartItem(itemId: string) {
  // Authorization Check
  await verifyCartOwnership(itemId);
  
  await db.delete(cartItems).where(eq(cartItems.id, itemId));
  revalidatePath("/cart");
  return { success: true };
}

export async function mergeCart(guestToken: string, userId: string) {
  if (!guestToken || !userId) return;

  const guestCart = await db.query.carts.findFirst({
      where: eq(carts.sessionToken, guestToken),
      with: { items: true }
  });

  if (!guestCart || guestCart.items.length === 0) return;

  let userCart = await db.query.carts.findFirst({
      where: eq(carts.userId, userId)
  });

  if (!userCart) {
      [userCart] = await db.insert(carts).values({ userId }).returning();
  }

  for (const item of guestCart.items) {
      const existingUserItem = await db.query.cartItems.findFirst({
          where: and(eq(cartItems.cartId, userCart.id), eq(cartItems.variantId, item.variantId))
      });

      if (existingUserItem) {
          await db.update(cartItems)
              .set({ quantity: existingUserItem.quantity + item.quantity })
              .where(eq(cartItems.id, existingUserItem.id));
          await db.delete(cartItems).where(eq(cartItems.id, item.id)); 
      } else {
          await db.update(cartItems)
              .set({ cartId: userCart.id })
              .where(eq(cartItems.id, item.id));
      }
  }

  await db.delete(carts).where(eq(carts.id, guestCart.id));
}
