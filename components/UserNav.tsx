"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { User, LogOut, Package, LayoutDashboard } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { signOut } from "@/lib/auth/actions";
import { useCartStore } from "@/store/cart.store";

export function UserNav({ session: initialSession }: { session: any }) {
  const { data: session, isPending } = authClient.useSession();
  
  // Use server-side session as fallback during initial render to prevent flickering
  const currentSession = session || initialSession;
  const currentIsPending = isPending && !initialSession;

  const router = useRouter();
  const { clear: clearCart } = useCartStore();

  if (currentIsPending) {
    return (
      <div className="flex items-center gap-4">
        <div className="h-6 w-16 animate-pulse rounded bg-light-300" />
        <div className="h-10 w-24 animate-pulse rounded-full bg-light-300" />
      </div>
    );
  }

  if (!currentSession) {
    return (
      <Link
        href="/sign-in"
        className="text-body text-dark-900 transition-colors hover:text-dark-700 font-medium"
      >
        Sign In
      </Link>
    );
  }

  const user = currentSession.user;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex h-10 w-10 overflow-hidden rounded-full border border-light-300 transition-colors hover:border-dark-400 outline-none focus-visible:ring-2 focus-visible:ring-dark-900 group">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || "User avatar"}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-light-200 text-dark-500">
              <User size={20} />
            </div>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-[100] mt-2 min-w-[240px] overflow-hidden rounded-xl border border-light-300 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-200"
          align="end"
          sideOffset={8}
        >
          <div className="px-3 py-3 border-b border-light-200 mb-1.5">
            <p className="text-body-medium font-semibold text-dark-900 truncate">
              {user.name}
            </p>
            <p className="text-footnote text-dark-500 truncate mt-0.5">
              {user.email}
            </p>
          </div>

          {(user as any).role === "admin" && (
            <DropdownMenu.Item asChild>
              <Link
                href="/admin"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-body-medium text-dark-900 bg-light-100 font-semibold hover:bg-light-200 outline-none cursor-pointer transition-colors mb-1.5"
              >
                <LayoutDashboard size={18} className="text-dark-900" />
                Admin Dashboard
              </Link>
            </DropdownMenu.Item>
          )}

          <DropdownMenu.Item asChild>
            <Link
              href="/profile"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-body-medium text-dark-700 hover:bg-light-200 hover:text-dark-900 outline-none cursor-pointer transition-colors"
            >
              <User size={18} className="text-dark-400" />
              Account Settings
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <Link
              href="/orders"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-body-medium text-dark-700 hover:bg-light-200 hover:text-dark-900 outline-none cursor-pointer transition-colors"
            >
              <Package size={18} className="text-dark-400" />
              My Orders
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Item
            onClick={async () => {
              await signOut();
              clearCart();
              router.refresh();
            }}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-body-medium text-red-600 hover:bg-red-50 outline-none cursor-pointer transition-colors mt-1"
          >
            <LogOut size={18} />
            Sign Out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
