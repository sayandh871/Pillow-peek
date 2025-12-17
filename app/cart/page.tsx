import { Suspense } from "react";
import { getCart } from "@/lib/actions/cart";
import CartView from "@/components/cart/CartView";

// We could add metadata
export const metadata = {
  title: "Shopping Cart | Pillow Peek",
};

export default async function CartPage() {
  const cart = await getCart();

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Shopping Cart
        </h1>
        <div className="mt-12">
            {/* 
               We pass initial cart data. 
               The store will hydrate.
               Suspense boundary implies we stream this if wrapped, 
               but Cart needs to be consistent, so blocking fetch is fine or stream entire view.
            */}
            <CartView initialCart={cart} />
        </div>
      </div>
    </div>
  );
}
