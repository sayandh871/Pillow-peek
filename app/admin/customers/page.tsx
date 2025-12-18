import { getCustomers } from "@/lib/actions/admin";
import { CustomerTable } from "@/components/admin/CustomerTable";

export default async function AdminCustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-dark-900">Customers</h1>
        <p className="text-body-medium text-dark-500">
          Analyze customer behavior and lifetime value.
        </p>
      </div>

      <CustomerTable customers={customers} />
    </div>
  );
}
