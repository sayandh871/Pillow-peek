import { pgTable, text, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const materials = pgTable('materials', {
  id: varchar('id', { length: 20 }).primaryKey(), // e.g. 'memory-foam'
  name: text('name').notNull(), // Display name
  description: text('description'),
});

export const insertMaterialSchema = createInsertSchema(materials);
export const selectMaterialSchema = createSelectSchema(materials);
