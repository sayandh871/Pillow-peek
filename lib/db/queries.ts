
import { db } from "./index";
import { products, productVariants, categories } from "./schema";
import { and, eq, gte, lte, inArray, sql, asc, desc, count } from "drizzle-orm";

export type ProductFilterParams = {
  sizes?: string[]; // Array of size IDs
  firmness?: string[]; // Array of firmness IDs
  materials?: string[]; // Array of material IDs
  minPrice?: number;
  maxPrice?: number;
  sort?: "price_asc" | "price_desc" | "newest";
  page?: number;
  limit?: number;
};

export async function getFilteredProducts(params: ProductFilterParams) {
  const { sizes, firmness, materials, minPrice, maxPrice, sort = "newest", page = 1, limit = 12 } = params;
  const offset = (page - 1) * limit;

  // Base conditions for the variants table
  const variantConditions = [];
  if (sizes && sizes.length > 0) variantConditions.push(inArray(productVariants.sizeId, sizes));
  if (firmness && firmness.length > 0) variantConditions.push(inArray(productVariants.firmnessId, firmness));
  if (materials && materials.length > 0) variantConditions.push(inArray(productVariants.materialId, materials));
  
  // Price filtering applies to variants
  if (minPrice !== undefined) variantConditions.push(gte(productVariants.price, minPrice.toString()));
  if (maxPrice !== undefined) variantConditions.push(lte(productVariants.price, maxPrice.toString()));

  // We want to return Products, but filter/sort based on Variants
  // Strategy:
  // 1. Find matching Product IDs from variants table (using filter index)
  // 2. Fetch products + aggregate stats (min price)

  // Construct the WHERE clause for variants
  const whereClause = variantConditions.length > 0 ? and(...variantConditions) : undefined;

  // Query builder
  const query = db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      basePrice: products.basePrice,
      slug: products.name, // Assuming name as slug for now, ideally add slug to schema
      imageUrl: sql<string>`(SELECT url FROM product_images WHERE product_id = ${products.id} ORDER BY "order" LIMIT 1)`,
      minPrice: sql<number>`min(${productVariants.price})`, // Start from price
      maxPrice: sql<number>`max(${productVariants.price})`,
      variantCount: count(productVariants.id),
      // Aggregated available options for swatches
      availableSizes: sql<string[]>`array_agg(distinct ${productVariants.sizeId})`,
      availableMaterials: sql<string[]>`array_agg(distinct ${productVariants.materialId})`,
    })
    .from(products)
    .innerJoin(productVariants, eq(products.id, productVariants.productId))
    .where(and(
       eq(products.isPublished, true),
       whereClause
    ))
    .groupBy(products.id);

    // Filter "valid" start price (stock > 0 check could be here or in WHERE). 
    // Ideally we filter variants where stock > 0 for the price calculation,
    // but Drizzle "min" aggregation works on the joined rows.
    // If we want "Starting from X (where X is in stock)", we should add stock > 0 to the WHERE clause.
    // But if we do that, we hide out-of-stock variants completely (which might be intended or not).
    // User requested: "Refinement: "Starting From" Logic... calculate min(price) only for variants where stock_quantity > 0"
    // So we should add a holistic filter on the join or a CASE statement.
    // A strict WHERE clause effectively removes products that have NO in-stock variants matching criteria.
    // Let's modify the join or aggregation. 
    // Simple approach: Add (stock > 0) to the WHERE. This means products with 0 stock variants are excluded from list?
    // Or just excluded from price calculation?
    // "Adjustment: Your Drizzle query should calculate the min(price) only for variants where stock_quantity > 0."
    // This implies using a filtered aggregation or filtering the join.
    // Filtering the JOIN/WHERE is cleaner for performance. We only want to sell available stuff.
    // So distinct product listing will be "Products that have at least one variant fitting criteria AND in stock".
    
    // Adding stock check to WHERE
    // variantConditions.push(gt(productVariants.stockQuantity, 0)); // Aggressive
    
    // Better: We want to show the product even if OOS? "Out of Stock overlay if all variants... have stock=0".
    // So we CANNOT filter out OOS rows entirely if we want to show "OOS" badge.
    // However, for "Starting From", we want Min Price of In-Stock items.
    // We can use a CASE statement inside MIN().
    
    // Refined Query with CASE for Min Price
    const refinedQuery = db.select({
      id: products.id,
      name: products.name,
      description: products.description,
      basePrice: products.basePrice,
      imageUrl: sql<string>`(SELECT url FROM product_images WHERE product_id = ${products.id} ORDER BY "order" LIMIT 1)`,
      // ensure we cast price to numeric for sorting
      startingPrice: sql<number>`min(CASE WHEN ${productVariants.stockQuantity} > 0 THEN ${productVariants.price} ELSE NULL END)`,
      totalStock: sql<number>`sum(${productVariants.stockQuantity})`,
      // For swatches
      availableSizes: sql<string[]>`array_agg(distinct ${productVariants.sizeId})`,
      availableFirmness: sql<string[]>`array_agg(distinct ${productVariants.firmnessId})`,
    })
    .from(products)
    .innerJoin(productVariants, eq(products.id, productVariants.productId))
    .where(and(
        eq(products.isPublished, true),
        // variants need to match filter criteria (size/firmness etc)
        ...variantConditions
    ))
    .groupBy(products.id);

  // Sorting
  if (sort === "price_asc") {
    refinedQuery.orderBy(sql`min(CASE WHEN ${productVariants.stockQuantity} > 0 THEN ${productVariants.price} ELSE NULL END) asc`);
  } else if (sort === "price_desc") {
    refinedQuery.orderBy(sql`min(CASE WHEN ${productVariants.stockQuantity} > 0 THEN ${productVariants.price} ELSE NULL END) desc`);
  } else {
    refinedQuery.orderBy(desc(products.createdAt));
  }

  // Pagination
  refinedQuery.limit(limit).offset(offset);

  const data = await refinedQuery;
  return data;
}

import { sizes as sizesTable, firmness as firmnessTable, materials as materialsTable } from "./schema";

export async function getFilterMetadata() {
  const [sizesData, firmnessData, materialsData] = await Promise.all([
    db.select({ id: sizesTable.id, label: sizesTable.name }).from(sizesTable),
    db.select({ id: firmnessTable.id, label: firmnessTable.name }).from(firmnessTable),
    db.select({ id: materialsTable.id, label: materialsTable.name }).from(materialsTable),
  ]);

  return {
    sizes: sizesData,
    firmness: firmnessData,
    materials: materialsData,
  };
}
