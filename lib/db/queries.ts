
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

export async function getProduct(id: string) {
  // Use query builder for relational fetching which is cleaner for deep nesting
  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      images: {
        orderBy: (images, { asc }) => [asc(images.order)],
      },
      variants: {
        with: {
          size: true,
          firmness: true,
          material: true,
        },
      },
      reviews: true,
    },
  });

  return product;
}

export type ProductWithRelations = NonNullable<Awaited<ReturnType<typeof getProduct>>>;
export type ProductVariantWithRelations = ProductWithRelations["variants"][number];
