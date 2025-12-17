"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart.store";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CartViewProps {
  initialCart: any;
}

export default function CartView({ initialCart }: CartViewProps) {
  const router = useRouter();
  const { items, updateItem, removeItem, sync } = useCartStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Sync initial server data to store on mount
  useEffect(() => {
    useCartStore.setState({ items: initialCart?.items || [], isLoading: false });
    setIsHydrated(true);
  }, [initialCart]);

  if (!isHydrated) return null; // Avoid hydration mismatch

  const subtotal = items.reduce((acc, item) => {
    const price = parseFloat(item.variant.price);
    return acc + price * item.quantity;
  }, 0);

  const shipping = 0; // Free for now
  const tax = subtotal * 0.08; // Approx 8%
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="bg-gray-100 p-6 rounded-full mb-6">
                  <ShoppingCart className="h-10 w-10 text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Your cart is empty</h2>
              <p className="mt-2 text-gray-500 max-w-sm">Looks like you haven't added any mattresses yet.</p>
              <div className="mt-8">
                <Link href="/">
                    <Button>Start Shopping</Button>
                </Link>
              </div>
          </div>
      );
  }

  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start xl:gap-x-16">
      <section className="lg:col-span-7">
        <ul role="list" className="divide-y divide-gray-200 border-t border-b border-gray-200">
          {items.map((item) => {
             const isOutOfStock = item.variant.stockQuantity === 0;
             const isLimited = item.variant.stockQuantity < item.quantity;
             
            return (
              <li key={item.id} className="flex py-6 sm:py-10">
                <div className="flex-shrink-0">
                  <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                     <Image
                        src={item.variant.product.images[0]?.url || "/placeholder.jpg"}
                        alt={item.variant.product.name}
                        fill
                        className="object-cover object-center"
                     />
                  </div>
                </div>

                <div className="ml-4 flex-1 flex flex-col justify-between sm:ml-6">
                  <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                    <div>
                      <div className="flex justify-between">
                        <h3 className="text-sm">
                          <Link href={`/mattresses/${item.variant.product.name}`} className="font-medium text-gray-700 hover:text-gray-800">
                            {item.variant.product.name}
                          </Link>
                        </h3>
                      </div>
                      <div className="mt-1 flex text-sm">
                        <p className="text-gray-500">
                            {item.variant.size?.name} / {item.variant.firmness?.name}
                        </p>
                      </div>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                          ${parseFloat(item.variant.price).toFixed(2)}
                      </p>
                      {isOutOfStock && (
                          <div className="mt-2 inline-flex items-center rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                              Sold Out
                          </div>
                      )}
                    </div>

                    <div className="mt-4 sm:mt-0 sm:pr-9">
                      <div className="flex items-center border border-gray-300 rounded-md w-max">
                           <button 
                                onClick={() => updateItem(item.id, Math.max(0, item.quantity - 1))}
                                className="p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                disabled={item.quantity <= 1}
                           >
                               <Minus className="h-3 w-3" />
                           </button>
                           <span className="px-2 text-sm text-gray-900">{item.quantity}</span>
                           <button 
                                onClick={() => updateItem(item.id, item.quantity + 1)}
                                className="p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                disabled={item.quantity >= item.variant.stockQuantity}
                           >
                               <Plus className="h-3 w-3" />
                           </button>
                      </div>
                      {isLimited && (
                          <p className="mt-2 text-xs text-red-600 font-medium">
                              Only {item.variant.stockQuantity} left!
                          </p>
                      )}

                      <div className="absolute top-0 right-0">
                        <button 
                            onClick={() => removeItem(item.id)}
                            type="button" 
                            className="-m-2 p-2 inline-flex text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <span className="sr-only">Remove</span>
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Order Summary */}
      <section
        aria-labelledby="summary-heading"
        className="mt-16 bg-gray-50 rounded-lg px-4 py-6 sm:p-6 lg:p-8 lg:mt-0 lg:col-span-5"
      >
        <h2 id="summary-heading" className="text-lg font-medium text-gray-900">
          Order summary
        </h2>

        <dl className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <dt className="text-sm text-gray-600">Subtotal</dt>
            <dd className="text-sm font-medium text-gray-900">${subtotal.toFixed(2)}</dd>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <dt className="flex items-center text-sm text-gray-600">
              <span>Shipping estimate</span>
            </dt>
            <dd className="text-sm font-medium text-gray-900">Free</dd>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <dt className="text-sm text-gray-600">Tax estimate</dt>
            <dd className="text-sm font-medium text-gray-900">${tax.toFixed(2)}</dd>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <dt className="text-base font-medium text-gray-900">Order total</dt>
            <dd className="text-base font-medium text-gray-900">${total.toFixed(2)}</dd>
          </div>
        </dl>

        <div className="mt-6">
          <Button 
            className="w-full" 
            size="lg" 
            disabled={items.some(i => i.quantity > i.variant.stockQuantity)}
            onClick={() => router.push('/checkout')}
          >
            Checkout <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
