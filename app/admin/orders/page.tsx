import { getOrders } from "@/lib/actions/admin";
import { OrderTable } from "@/components/admin/OrderTable";

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-dark-900">Orders</h1>
        <p className="text-body-medium text-dark-500">
          Manage customer orders and track fulfillment status.
        </p>
      </div>

      <OrderTable orders={orders} />
    </div>
  );
}
