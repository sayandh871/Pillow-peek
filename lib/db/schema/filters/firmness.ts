import { pgTable, text, integer, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const firmness = pgTable('firmness', {
  id: varchar('id', { length: 20 }).primaryKey(), // e.g. 'medium-firm'
  name: text('name').notNull(), // Display name e.g. "Medium Firm"
  rating: integer('rating').notNull(), // 1-10 scale
  description: text('description'),
});

export const insertFirmnessSchema = createInsertSchema(firmness);
export const selectFirmnessSchema = createSelectSchema(firmness);
