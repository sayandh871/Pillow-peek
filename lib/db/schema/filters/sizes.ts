import { pgTable, text, varchar, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const sizes = pgTable('sizes', {
  id: varchar('id', { length: 20 }).primaryKey(), // e.g., 'queen', 'twin'
  name: text('name').notNull(), // Display name e.g. "Queen"
  dimensions: text('dimensions').notNull(), // e.g. "60\" x 80\""
});

export const insertSizeSchema = createInsertSchema(sizes);
export const selectSizeSchema = createSelectSchema(sizes);
