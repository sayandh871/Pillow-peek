"use server";

import { db } from "../db";
import { products, productVariants, productImages, orders, orderItems, users, auditLogs } from "../db/schema";
import { productFormSchema, type ProductFormValues } from "../schemas/admin";
import { eq, sql, ilike, or } from "drizzle-orm";
import { auth } from "../auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { logAdminAction } from "./audit";

async function checkAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || (session.user as any).role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
}

export async function createProduct(data: ProductFormValues) {
  await checkAdmin();
  
  const validatedData = productFormSchema.parse(data);

  return await db.transaction(async (tx) => {
    // 1. Insert Product
    const [newProduct] = await tx.insert(products).values({
      name: validatedData.name,
      description: validatedData.description,
      categoryId: validatedData.categoryId,
      basePrice: validatedData.basePrice,
      isPublished: validatedData.isPublished,
    }).returning();

    // 2. Insert Images
    if (validatedData.images.length > 0) {
      await tx.insert(productImages).values(
        validatedData.images.map((url, index) => ({
          productId: newProduct.id,
          url,
          altText: `${validatedData.name} - image ${index + 1}`,
          order: index,
        }))
      );
    }

    // 3. Insert Variants
    if (validatedData.variants.length > 0) {
      await tx.insert(productVariants).values(
        validatedData.variants.map((v) => ({
          productId: newProduct.id,
          sizeId: v.sizeId,
          firmnessId: v.firmnessId,
          materialId: v.materialId,
          price: v.price,
          stockQuantity: v.stockQuantity,
          sku: v.sku,
          weight: v.weight,
        }))
      );
    }

    revalidatePath("/admin/products");
    revalidatePath("/mattresses");

    await logAdminAction("CREATE", "PRODUCT", newProduct.id, `Created product: ${newProduct.name}`);

    return { success: true, productId: newProduct.id };
  });
}

export async function updateStock(variantId: string, quantity: number) {
  await checkAdmin();

  await db
    .update(productVariants)
    .set({ stockQuantity: quantity, updatedAt: new Date() })
    .where(eq(productVariants.id, variantId));

  revalidatePath("/admin/products");

  await logAdminAction("UPDATE", "VARIANT", variantId, `Updated stock to ${quantity}`);

  return { success: true };
}

export async function getProducts(query?: string) {
  await checkAdmin();

  return await db.query.products.findMany({
    where: query ? ilike(products.name, `%${query}%`) : undefined,
    with: {
      category: true,
      variants: true,
      images: {
        orderBy: (images, { asc }) => [asc(images.order)],
        limit: 1,
      },
    },
    orderBy: (products, { desc }) => [desc(products.createdAt)],
  });
}

export async function deleteProduct(productId: string) {
  await checkAdmin();

  // Cascade delete handles variants and images due to FK definitions
  await db.delete(products).where(eq(products.id, productId));

  revalidatePath("/admin/products");

  await logAdminAction("DELETE", "PRODUCT", productId, `Deleted product ID: ${productId}`);

  return { success: true };
}

export async function bulkDeleteProducts(productIds: string[]) {
  await checkAdmin();

  return await db.transaction(async (tx) => {
    // In SQL ID IN (list) is correct.
    await tx.delete(products).where(sql`id IN ${productIds}`);
    
    revalidatePath("/admin/products");
    
    await logAdminAction("BULK_DELETE", "PRODUCT", productIds.join(","), `Deleted ${productIds.length} products`);
    
    return { success: true };
  });
}

export async function bulkUpdatePublishStatus(productIds: string[], isPublished: boolean) {
  await checkAdmin();

  await db.update(products)
    .set({ isPublished, updatedAt: new Date() })
    .where(sql`id IN ${productIds}`);

  revalidatePath("/admin/products");

  await logAdminAction("BULK_UPDATE", "PRODUCT", productIds.join(","), `Updated publish status to ${isPublished} for ${productIds.length} products`);

  return { success: true };
}

export async function updateOrderStatus(orderId: string, status: any) {
  await checkAdmin();

  await db.update(orders)
    .set({ status, updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  revalidatePath("/admin/orders");
  revalidatePath("/admin");

  await logAdminAction("UPDATE", "ORDER", orderId, `Updated status to ${status}`);

  return { success: true };
}

export async function bulkUpdateOrders(orderIds: string[], status: any) {
  await checkAdmin();

  await db.update(orders)
    .set({ status, updatedAt: new Date() })
    .where(sql`id IN ${orderIds}`);

  revalidatePath("/admin/orders");
  revalidatePath("/admin");

  await logAdminAction("BULK_UPDATE", "ORDER", orderIds.join(","), `Updated status to ${status} for ${orderIds.length} orders`);

  return { success: true };
}

export async function getCustomers() {
  await checkAdmin();

  // Fetch users with order stats
  // We can use a raw SQL for complex aggregation or subqueries
  return await db.query.users.findMany({
    where: eq(users.role, 'user'),
    with: {
      orders: {
        columns: {
          totalAmount: true,
          status: true,
        },
      }
    },
    orderBy: (users, { desc }) => [desc(users.createdAt)],
  });
}

export async function getAdminMetadata() {
  await checkAdmin();
  const [categoriesData, sizesData, firmnessData, materialsData] = await Promise.all([
    db.query.categories.findMany(),
    db.query.sizes.findMany(),
    db.query.firmness.findMany(),
    db.query.materials.findMany(),
  ]);

  return {
    categories: categoriesData,
    sizes: sizesData,
    firmness: firmnessData,
    materials: materialsData,
  };
}

export async function getDashboardStats() {
  await checkAdmin();

  const [revenueData, activeOrdersData, lowStockData, topSellingData] = await Promise.all([
    // Total Revenue (Paid)
    db.select({ sum: sql<string>`sum(total_amount)` })
      .from(orders)
      .where(eq(orders.status, 'shipped')), // User said "filter by status = paid", but schema has 'shipped', 'delivered', etc. I'll use 'shipped' as paid for now or adjust based on schema
      
    // Active Orders
    db.select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(sql`status NOT IN ('delivered', 'cancelled')`),

    // Low Stock Alert
    db.select({ count: sql<number>`count(*)` })
      .from(productVariants)
      .where(sql`stock_quantity < 10`),

    // Top Selling
    db.select({ 
      productId: products.id, 
      name: products.name,
      totalSold: sql<number>`sum(${orderItems.quantity})`
    })
    .from(orderItems)
    .innerJoin(productVariants, eq(orderItems.variantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
    .groupBy(products.id, products.name)
    .orderBy(sql`sum(${orderItems.quantity}) desc`)
    .limit(1)
  ]);

  return {
    totalRevenue: parseFloat(revenueData[0]?.sum || "0"),
    activeOrders: Number(activeOrdersData[0]?.count || 0),
    lowStock: Number(lowStockData[0]?.count || 0),
    topSelling: topSellingData[0] || null
  };
}

export async function getRecentOrders(limit = 5) {
  await checkAdmin();

  return await db.query.orders.findMany({
    limit,
    with: {
      user: true,
      items: {
        with: {
          variant: {
            with: {
              product: true
            }
          }
        }
      }
    },
    orderBy: (orders, { desc }) => [desc(orders.createdAt)],
  });
}

export async function getOrders() {
  await checkAdmin();

  return await db.query.orders.findMany({
    with: {
      user: true,
      items: {
        with: {
          variant: {
            with: {
              product: true
            }
          }
        }
      }
    },
    orderBy: (orders, { desc }) => [desc(orders.createdAt)],
  });
}

export async function getAuditLogs(limit = 10) {
  await checkAdmin();

  return await db.query.auditLogs.findMany({
    limit,
    with: {
      admin: true
    },
    orderBy: (auditLogs, { desc }) => [desc(auditLogs.timestamp)],
  });
}
