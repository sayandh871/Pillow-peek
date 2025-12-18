"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-light-300 bg-white shadow-sm transition-transform md:translate-x-0">
      <div className="flex h-full flex-col overflow-y-auto px-4 py-6">
        <div className="mb-10 px-2">
            <Link href="/" className="flex items-center gap-2 group">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-dark-900 text-light-100 transition-transform group-hover:scale-110">
                    <span className="text-body-medium font-bold">PP</span>
                </div>
                <span className="text-body-large font-bold text-dark-900 tracking-tight">Admin Portal</span>
            </Link>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between rounded-xl px-3 py-3 text-body-medium font-medium transition-all duration-200",
                  isActive 
                    ? "bg-dark-900 text-light-100 shadow-md" 
                    : "text-dark-600 hover:bg-light-200 hover:text-dark-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon 
                    size={20} 
                    className={cn(
                        "transition-colors",
                        isActive ? "text-light-100" : "text-dark-400 group-hover:text-dark-900"
                    )} 
                  />
                  {item.label}
                </div>
                {isActive && <ChevronRight size={16} className="text-light-100/50" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-light-200 pt-6">
            <div className="flex items-center gap-3 px-2">
                <div className="h-10 w-10 rounded-full bg-light-200 border border-light-300 animate-pulse" />
                <div className="flex flex-col">
                    <div className="h-4 w-24 rounded bg-light-200 mb-1" />
                    <div className="h-3 w-32 rounded bg-light-200" />
                </div>
            </div>
        </div>
      </div>
    </aside>
  );
}
