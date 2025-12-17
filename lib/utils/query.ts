import { z } from "zod";

export const ProductFilterSchema = z.object({
  search: z.string().optional(),
  sizes: z.union([z.string(), z.array(z.string())]).transform((val) => {
    if (Array.isArray(val)) return val;
    return val ? val.split(",") : [];
  }).optional(),
  firmness: z.union([z.string(), z.array(z.string())]).transform((val) => {
    if (Array.isArray(val)) return val;
    return val ? val.split(",") : [];
  }).optional(),
  materials: z.union([z.string(), z.array(z.string())]).transform((val) => {
    if (Array.isArray(val)) return val;
    return val ? val.split(",") : [];
  }).optional(),
  minPrice: z.string().optional().transform((val) => val ? Number(val) : undefined),
  maxPrice: z.string().optional().transform((val) => val ? Number(val) : undefined),
  sort: z.enum(["newest", "price_asc", "price_desc"]).optional().default("newest"),
  page: z.string().optional().transform((val) => val ? Number(val) : 1),
});

export type ProductFilters = z.infer<typeof ProductFilterSchema>;

export function parseSearchParams(params: Record<string, string | string[] | undefined>): ProductFilters {
  const result = ProductFilterSchema.safeParse(params);
  if (!result.success) {
    console.error("Invalid search params:", result.error);
    return {
      sizes: [],
      firmness: [],
      materials: [],
      page: 1,
      sort: "newest",
      minPrice: undefined,
      maxPrice: undefined,
    };
  }
  return result.data;
}
