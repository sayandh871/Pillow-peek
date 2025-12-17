DROP INDEX "variant_filter_idx";--> statement-breakpoint
CREATE INDEX "variant_filter_idx" ON "product_variants" USING btree ("size_id","price","stock_quantity");