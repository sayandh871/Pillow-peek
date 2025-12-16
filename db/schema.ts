import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  priceCents: integer("price_cents").notNull(),
  firmness: text("firmness").notNull(), // e.g. soft, medium, firm
  size: text("size").notNull(), // e.g. Twin, Queen, King
  heightInches: numeric("height_inches", { precision: 4, scale: 1 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});


