import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || (session.user as any).role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-light-100">
      <AdminSidebar />
      <main className="md:ml-64 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
        </div>
      </main>
    </div>
  );
}
