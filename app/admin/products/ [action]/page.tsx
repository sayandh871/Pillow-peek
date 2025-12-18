import { getAdminMetadata, getProducts } from "@/lib/actions/admin";
import { ProductForm } from "@/components/admin/ProductForm";
import { getProduct } from "@/lib/db/queries";
import { notFound } from "next/navigation";

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-dark-900">
          {isEdit ? `Edit ${product?.name}` : "Create New Product"}
        </h1>
        <p className="text-body-medium text-dark-500">
          {isEdit 
            ? "Update product details, manage variants, and refine descriptions." 
            : "Fill in the details below to add a new mattress to your catalog."}
        </p>
      </div>

      <div className="rounded-2xl border border-light-300 bg-white p-6 shadow-sm sm:p-8">
        <ProductForm 
          initialData={product as any} 
          metadata={metadata} 
        />
      </div>
    </div>
  );
}
