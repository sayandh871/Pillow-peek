"use server";

import { db } from "@/lib/db";
import { products, productVariants, categories, productImages, reviews } from "@/lib/db/schema";
import { eq, and, sql, inArray, gte, lte, desc, asc, count } from "drizzle-orm";
import { type ProductFilters } from "@/lib/utils/query";

export async function getAllProducts(filters: ProductFilters) {
  const { search, sizes, firmness, materials, minPrice, maxPrice, sort, page } = filters;
  const limit = 12;
  const offset = (page - 1) * limit;

  // Conditions array
  const conditions = [eq(products.isPublished, true)];

  if (search) {
    conditions.push(sql`to_tsvector('english', ${products.name} || ' ' || ${products.description}) @@ plainto_tsquery('english', ${search})`);
  }

  // We need to filter based on variants availability
  // If sizes, firmness, or materials are present, we filter the JOIN
  // But strictly speaking, the main query is on PRODUCTS
  // We'll use the WHERE clause on the joined variants to filter the PRODUCTS returned.
  // Note: innerJoin already restricts products to those that have matching variants.

  if (sizes && sizes.length > 0) {
    conditions.push(inArray(productVariants.sizeId, sizes));
  }
  if (firmness && firmness.length > 0) {
    conditions.push(inArray(productVariants.firmnessId, firmness));
  }
  if (materials && materials.length > 0) {
    conditions.push(inArray(productVariants.materialId, materials));
  }
  
  // Price filtering usually applies to the "Starting From" price, which we calculate.
  // However, for SQL performance, we often filter on the variant price itself.
  // "Find products that have at least one variant within this price range".
  if (minPrice !== undefined) {
    conditions.push(gte(productVariants.price, minPrice.toString()));
  }
  if (maxPrice !== undefined) {
    conditions.push(lte(productVariants.price, maxPrice.toString()));
  }

  // Sorting
  let orderBy;
  switch (sort) {
    case "price_asc":
      // ordering by aggregated min price is tricky in standard Drizzle without subqueries or having clauses
      // but we can try ordering by the min(variant.price)
      orderBy = asc(sql`min(${productVariants.price})`); 
      break;
    case "price_desc":
      orderBy = desc(sql`min(${productVariants.price})`);
      break;
    case "newest":
    default:
      orderBy = desc(products.createdAt);
      break;
  }

  const data = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      slug: products.name, // TODO: Add real slug column
      basePrice: products.basePrice, // Keeping for reference, but UI uses calculated minPrice
      // Precise aggregation used for display
      minPrice: sql<number | null>`min(CASE WHEN ${productVariants.stockQuantity} > 0 THEN ${productVariants.price} ELSE NULL END)`,
      // We also want to know if it's completely out of stock to show overlay? 
      // If minPrice is null, it effectively means no in-stock variants found.
      imageUrl: sql<string>`(SELECT url FROM product_images WHERE product_id = ${products.id} ORDER BY "order" LIMIT 1)`,
      availableSizes: sql<string[]>`array_agg(distinct (SELECT name FROM sizes WHERE id = ${productVariants.sizeId}))`,
    })
    .from(products)
    // Inner join ensures we only get products that HAVE variants matching criteria
    .innerJoin(productVariants, eq(products.id, productVariants.productId))
    .where(and(...conditions))
    .groupBy(products.id)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  // Total count for pagination
  // This is a bit separate because of the group by and join. 
  // We can do a simpler count query or window function. 
  // For simplicity and speed on moderate datasets, a separate count query is often used.
  // But with complex joins, it's best to wrap the main query as a subquery for count, or approximate.
  // Let's do a separate count query matching the same conditions.
  const countResult = await db
    .select({ count: count(products.id) })
    .from(products)
    .innerJoin(productVariants, eq(products.id, productVariants.productId))
    .where(and(...conditions))
    // We must group by to simulate the distinct products, then count standard SQL way is tricky.
    // Actually, count(distinct products.id) is key here.
    // Drizzle: count(distinct(products.id))
  
  // Re-write count query to handle distinct
  const totalCountResult = await db
      .select({ value: count(products.id) }) // Drizzle's count() usually is COUNT(*) or COUNT(col)
      .from(products)
      .innerJoin(productVariants, eq(products.id, productVariants.productId))
      .where(and(...conditions))
      .groupBy(products.id)
      
      // The above returns a row per product. The length of array is the count.
      // This is inefficient for HUGE datasets but accurate for filtering.
      // Better: select count(distinct products.id)
 
  // Optimized count query
  const totalRows = await db
      .select({ count: sql<number>`count(distinct ${products.id})` })
      .from(products)
      .innerJoin(productVariants, eq(products.id, productVariants.productId))
      .where(and(...conditions));

  const totalCount = Number(totalRows[0]?.count || 0);

  return {
    products: data,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
  };
}

export async function getProductBySlug(slug: string) {
  // Assuming 'name' is being used as slug for now based on previous files, 
  // but we should match how it's stored.
  // The user prompt asked to use db.query.products.findFirst
  
  const product = await db.query.products.findFirst({
    where: eq(products.name, slug), // matching by name as placeholder for slug
    with: {
      variants: {
        with: {
          size: true,
          firmness: true,
          material: true,
        }
      },
      images: {
        orderBy: (images, { asc }) => [asc(images.order)]
      },
      category: true,
      reviews: {
          with: {
              user: true // assuming we want reviewer name
          },
          limit: 10,
          orderBy: (reviews, { desc }) => [desc(reviews.createdAt)]
      }
    }
  });

  return product;
}
