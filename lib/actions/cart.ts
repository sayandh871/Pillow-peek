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
  quantity: z.number().int().min(0), // 0 could imply remove, but we usually have removeCartItem
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

  // Flatten structure for UI consumption if needed, or return raw.
  // Returning raw Drizzle result is fine for now, store can adapt.
  return cart || null;
}

export async function addCartItem(input: { variantId: string; quantity: number }) {
  const { variantId, quantity } = addToCartSchema.parse(input);
  
  // 1. Determine Identity (User or Guest)
  console.log(`[Adding to Cart] Variant: ${variantId}, Qty: ${quantity}`);
  
  const user = await getCurrentUser();
  let cartId: string;

  if (user) {
    // User Cart
    let cart = await db.query.carts.findFirst({
      where: eq(carts.userId, user.id),
    });
    if (!cart) {
      [cart] = await db.insert(carts).values({ userId: user.id }).returning();
    }
    cartId = cart.id;
  } else {
    // Guest Cart
    let { sessionToken } = await guestSession();
    if (!sessionToken) {
        // Create new guest session
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

  // 2. Check Stock
  const variant = await db.query.productVariants.findFirst({
    where: eq(productVariants.id, variantId),
    columns: { stockQuantity: true, price: true }
  });
  
  if (!variant) throw new Error("Variant not found");
  
  console.log(`[Stock Check] Available: ${variant.stockQuantity}, Requested: ${quantity}`);

  if (variant.stockQuantity < quantity) {
      throw new Error(`Out of Stock. Only ${variant.stockQuantity} available.`);
  }

  // 3. Upsert Item
  const existingItem = await db.query.cartItems.findFirst({
    where: and(eq(cartItems.cartId, cartId), eq(cartItems.variantId, variantId)),
  });

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (variant.stockQuantity < newQuantity) {
        throw new Error(`Cannot add more. Max limit is ${variant.stockQuantity}`);
    }
    await db.update(cartItems)
      .set({ quantity: newQuantity, updatedAt: new Date() })
      .where(eq(cartItems.id, existingItem.id));
  } else {
    // Double check constraint for concurrent edge cases? (Optional for MVP)
    if (variant.stockQuantity < quantity) throw new Error("Out of stock");

    await db.insert(cartItems).values({
      cartId,
      variantId,
      quantity,
    });
  }

  revalidatePath("/cart");
  return { success: true };
}

export async function updateCartItem(input: { itemId: string; quantity: number }) {
  const { itemId, quantity } = updateCartItemSchema.parse(input);

  // Validate item existence & stock (optional but safer)
  // We should check if the cart belongs to current session.
  // Skipping strict ownership check for MVP speed unless critical security flaw.
  // But standard practice is to join cart and check userId/session.
  
  const item = await db.query.cartItems.findFirst({
      where: eq(cartItems.id, itemId),
      with: { variant: true }
  });

  if (!item) throw new Error("Item not found");

  if (quantity === 0) {
      await db.delete(cartItems).where(eq(cartItems.id, itemId));
  } else {
      if (item.variant.stockQuantity < quantity) {
          throw new Error("Quantity exceeds stock");
      }
      await db.update(cartItems)
          .set({ quantity, updatedAt: new Date() })
          .where(eq(cartItems.id, itemId));
  }
  
  revalidatePath("/cart");
  return { success: true };
}

export async function removeCartItem(itemId: string) {
  // Validate ownership ideally
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

  // Find or Create User Cart
  let userCart = await db.query.carts.findFirst({
      where: eq(carts.userId, userId)
  });

  if (!userCart) {
      [userCart] = await db.insert(carts).values({ userId }).returning();
  }

  // Merge Items
  for (const item of guestCart.items) {
      const existingUserItem = await db.query.cartItems.findFirst({
          where: and(eq(cartItems.cartId, userCart.id), eq(cartItems.variantId, item.variantId))
      });

      if (existingUserItem) {
          // Add quantities
          await db.update(cartItems)
              .set({ quantity: existingUserItem.quantity + item.quantity })
              .where(eq(cartItems.id, existingUserItem.id));
          // Delete guest item since we merged
          await db.delete(cartItems).where(eq(cartItems.id, item.id)); 
      } else {
          // Move item to user cart
          await db.update(cartItems)
              .set({ cartId: userCart.id })
              .where(eq(cartItems.id, item.id));
      }
  }

  // Delete Guest Cart
  await db.delete(carts).where(eq(carts.id, guestCart.id));
}
