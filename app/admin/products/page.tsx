import { getProducts } from "@/lib/actions/admin";
import { InventoryTable } from "@/components/admin/InventoryTable";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = await searchParams;
  const products = await getProducts(query);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-dark-900">Inventory Management</h1>
        <p className="text-body-medium text-dark-500">
          View, manage, and update your product catalog and stock levels.
        </p>
      </div>
      
      <InventoryTable products={products} />
    </div>
  );
}
