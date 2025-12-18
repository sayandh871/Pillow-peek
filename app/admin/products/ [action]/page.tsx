import { getAdminMetadata, getProducts } from "@/lib/actions/admin";
import { ProductForm } from "@/components/admin/ProductForm";
import { getProduct } from "@/lib/db/queries";
import { notFound } from "next/navigation";
import type { ProductFormValues } from "@/lib/schemas/admin";

export default async function AdminProductActionPage({
  params,
}: {
  params: { action: string };
}) {
  const { action } = await params;
  const isEdit = action !== "create";
  
  const [metadata, product] = await Promise.all([
    getAdminMetadata(),
    isEdit ? getProduct(action) : Promise.resolve(null),
  ]);

  if (isEdit && !product) {
    notFound();
  }

  // Transform database product to ProductFormValues format
  const initialData: Partial<ProductFormValues> | undefined = product ? {
    name: product.name,
    description: product.description ?? undefined,
    categoryId: product.categoryId ?? "",
    basePrice: product.basePrice,
    isPublished: product.isPublished,
    images: product.images.map(img => img.url),
    variants: product.variants.map(v => ({
      id: v.id,
      sizeId: v.sizeId,
      firmnessId: v.firmnessId,
      materialId: v.materialId,
      price: v.price,
      stockQuantity: v.stockQuantity,
      sku: v.sku,
      weight: v.weight,
    })),
  } : undefined;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-dark-900">
            {action === "create" ? "Create Product" : "Edit Product"}
          </h1>
          <p className="text-body-medium text-dark-500">
            {action === "create" 
              ? "Add a new product to your catalog" 
              : "Update product details and variants"}
          </p>
        </div>
      </div>

      <ProductForm 
        metadata={metadata} 
        initialData={initialData}
      />
    </div>
  );
}
