import { z } from "zod";

export const variantFormSchema = z.object({
  id: z.string().uuid().optional(), // For updates
  sizeId: z.string().min(1, "Size is required"),
  firmnessId: z.string().min(1, "Firmness is required"),
  materialId: z.string().min(1, "Material is required"),
  price: z.string().min(1, "Price is required").regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  stockQuantity: z.number().int().min(0, "Stock cannot be negative"),
  sku: z.string().min(3, "SKU must be at least 3 characters"),
  weight: z.string().min(1, "Weight is required").regex(/^\d+(\.\d{1,2})?$/, "Invalid weight format"),
});

export const productFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  categoryId: z.string().uuid("Invalid category"),
  basePrice: z.string().min(1, "Base price is required").regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  isPublished: z.boolean(),
  images: z.array(z.string()).min(1, "At least one image is required"),
  variants: z.array(variantFormSchema).min(1, "At least one variant is required"),
}).superRefine((data, ctx) => {
  const seen = new Set();
  data.variants.forEach((v, index) => {
    const key = `${v.sizeId}-${v.firmnessId}`;
    if (seen.has(key)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Duplicate Size/Firmness combination",
        path: ["variants", index, "sizeId"], // Point to the sizeId input
      });
    }
    seen.add(key);
  });
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
export type VariantFormValues = z.infer<typeof variantFormSchema>;
