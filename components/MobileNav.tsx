"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ShoppingCart, User, Package, LogOut } from "lucide-react";
import { type Session } from "better-auth";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signOut } from "@/lib/auth/actions";
import { useCartStore } from "@/store/cart.store";

interface MobileNavProps {
  navLinks: readonly { label: string; href: string }[];
  session: any;
}

export function MobileNav({ navLinks, session: initialSession }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const { data: session } = authClient.useSession();
  
  const currentSession = session || initialSession;
  const router = useRouter();
  const { clear: clearCart } = useCartStore();

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-md p-2 text-dark-900 md:hidden outline-none"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="sr-only">Toggle navigation</span>
        {open ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile Backdrop */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-dark-900/20 backdrop-blur-sm md:hidden animate-in fade-in" 
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-light-100 p-6 shadow-2xl transition-transform duration-300 md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="outline-none" onClick={() => setOpen(false)}>
             <Image src="/logo.svg" alt="Logo" width={32} height={32} className="invert" />
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="rounded-full p-2 text-dark-900 hover:bg-light-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mt-8 flex flex-col gap-6">
          {currentSession ? (
            <div className="flex items-center gap-4 rounded-xl border border-light-300 bg-white p-4">
                {currentSession.user.image ? (
                    <img 
                        src={currentSession.user.image} 
                        alt={currentSession.user.name || "User"} 
                        className="h-12 w-12 rounded-full object-cover"
                    />
                ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-light-200 text-dark-500">
                        <User size={24} />
                    </div>
                )}
                <div className="flex-1 overflow-hidden">
                    <p className="text-body-medium font-semibold text-dark-900 truncate">{currentSession.user.name}</p>
                    <p className="text-footnote text-dark-500 truncate">{currentSession.user.email}</p>
                </div>
            </div>
          ) : (
            <Link
                href="/sign-in"
                className="flex h-12 w-full items-center justify-center rounded-xl border border-light-300 text-body-medium font-medium text-dark-900 hover:bg-light-200 transition-colors"
                onClick={() => setOpen(false)}
            >
                Sign In
            </Link>
          )}

          <nav>
            <ul className="space-y-4">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="flex items-center py-2 text-lg font-medium text-dark-900 transition-colors hover:text-dark-700"
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-light-300 pt-6 space-y-4">
               {currentSession && (
                   <>
                    <Link
                        href="/profile"
                        className="flex items-center gap-3 text-body-medium text-dark-700 hover:text-dark-900 transition-colors"
                        onClick={() => setOpen(false)}
                    >
                        <User size={20} />
                        Account Settings
                    </Link>
                    <Link
                        href="/orders"
                        className="flex items-center gap-3 text-body-medium text-dark-700 hover:text-dark-900 transition-colors"
                        onClick={() => setOpen(false)}
                    >
                        <Package size={20} />
                        My Orders
                    </Link>
                    <button
                        onClick={async () => {
                            await signOut();
                            clearCart();
                            setOpen(false);
                            router.refresh();
                        }}
                        className="flex w-full items-center gap-3 text-body-medium text-red-600 hover:text-red-700 transition-colors"
                    >
                        <LogOut size={20} />
                        Sign Out
                    </button>
                   </>
               )}
               <Link
                href="/cart"
                className="flex items-center justify-between rounded-xl bg-light-200 px-4 py-3 outline-none"
                onClick={() => setOpen(false)}
              >
                <span className="flex items-center gap-2 font-medium">
                  <ShoppingCart size={20} />
                  My Cart
                </span>
                <span className="text-dark-500">→</span>
              </Link>
          </div>
        </div>
      </div>
    </>
  );
}
