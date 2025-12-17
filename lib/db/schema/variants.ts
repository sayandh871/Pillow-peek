import { pgTable, text, uuid, timestamp, integer, decimal, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { products } from './products';
import { sizes } from './filters/sizes';
import { firmness } from './filters/firmness';
import { materials } from './filters/materials';
import { productImages } from './product_images';

export const productVariants = pgTable('product_variants', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  sizeId: varchar('size_id', { length: 20 }).references(() => sizes.id).notNull(),
  firmnessId: varchar('firmness_id', { length: 20 }).references(() => firmness.id).notNull(),
  materialId: varchar('material_id', { length: 20 }).references(() => materials.id).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  stockQuantity: integer('stock_quantity').notNull().default(0),
  sku: text('sku').unique().notNull(),
  weight: decimal('weight').notNull(), // in kg or lbs
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  // Composite indexes for efficient filtering
  // Optimized for filtering by size, sorting by price, and checking stock
  filterIndex: index('variant_filter_idx').on(t.sizeId, t.price, t.stockQuantity),
  priceIndex: index('variant_price_idx').on(t.price),
  stockIndex: index('variant_stock_idx').on(t.stockQuantity),
}));

import { varchar } from 'drizzle-orm/pg-core'; // Import needed for FKs

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
  size: one(sizes, {
    fields: [productVariants.sizeId],
    references: [sizes.id],
  }),
  firmness: one(firmness, {
    fields: [productVariants.firmnessId],
    references: [firmness.id],
  }),
  material: one(materials, {
    fields: [productVariants.materialId],
    references: [materials.id],
  }),
  images: many(productImages),
}));

export const insertProductVariantSchema = createInsertSchema(productVariants);
export const selectProductVariantSchema = createSelectSchema(productVariants);
