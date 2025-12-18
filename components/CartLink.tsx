"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart.store";
import { useEffect } from "react";
import { ShoppingCart } from "lucide-react";

export function CartLink() {
  const { items, sync } = useCartStore();

  useEffect(() => {
    sync();
  }, [sync]);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Link 
      href="/cart" 
      className="group relative flex items-center gap-2 text-body text-dark-900 transition-colors hover:text-dark-700 font-medium"
    >
      <ShoppingCart size={20} className="transition-transform group-hover:scale-110" />
      <span className="hidden sm:inline">My Cart</span>
      {itemCount > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-dark-900 text-[10px] text-light-100 shadow-sm animate-in zoom-in">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
