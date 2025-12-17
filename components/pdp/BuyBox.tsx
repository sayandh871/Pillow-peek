"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import { type ProductVariantWithRelations } from "@/lib/db/queries";
import { useCartStore } from "@/store/cart.store";
import { addCartItem } from "@/lib/actions/cart";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BuyBoxProps {
  product: { name: string; basePrice: string | number };
  selectedVariant: ProductVariantWithRelations | undefined;
}

export function BuyBox({ product, selectedVariant }: BuyBoxProps) {
  const [isPending, startTransition] = useTransition();
  const { sync } = useCartStore();

  const isAvailable = (variant: ProductVariantWithRelations | undefined) => {
      if (!variant) return false;
      return variant.stockQuantity > 0;
  };

  const handleAddToCart = () => {
      if (!selectedVariant) return;
      
      startTransition(async () => {
          try {
              const res = await addCartItem({ 
                  variantId: selectedVariant.id, 
                  quantity: 1 
              });
              
              if (res.success) {
                  // Sync local store
                  await sync();
                  toast.success(`Added ${product.name} to your cart!`);
              } else {
                  toast.error("Could not add item to cart.");
              }
          } catch (error: any) {
              console.error(error);
              toast.error(error.message || "Sorry, this combination is currently unavailable.");
          }
      });
  };
    
  // Handle price type potentially being string or number
  const price = selectedVariant ? Number(selectedVariant.price) : Number(product.basePrice);
  const isOutOfStock = !isAvailable(selectedVariant);
  
  const isDisabled = !selectedVariant || isOutOfStock || isPending;

  return (
    <div className="rounded-lg border bg-gray-50 p-6 shadow-sm">
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
           <span className="text-3xl font-bold text-gray-900">
             ${price.toFixed(2)}
           </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
           {selectedVariant 
             ? (isOutOfStock ? "Out of Stock" : `In stock: ${selectedVariant.stockQuantity}`) 
             : "Select options to see availability"}
        </p>
      </div>

      <div className="space-y-4">
        <Button 
            size="lg" 
            className={cn(
                "w-full text-lg transition-all",
                isOutOfStock && "grayscale opacity-80 cursor-not-allowed"
            )}
            disabled={isDisabled}
            onClick={handleAddToCart}
        >
          {isPending ? (
              <span className="flex items-center gap-2">
                   <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                   Adding...
              </span>
          ) : isOutOfStock ? (
              "Out of Stock"
          ) : !selectedVariant ? (
              "Select Options"
          ) : (
              <>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </>
          )}
        </Button>
        <p className="text-center text-xs text-gray-500">
          Free shipping & 100-night trial explicitly included.
        </p>
      </div>
    </div>
  );
}
