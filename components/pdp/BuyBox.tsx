"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { type ProductWithRelations, type ProductVariantWithRelations } from "@/lib/db/queries";

interface BuyBoxProps {
  product: ProductWithRelations;
  selectedVariant: ProductVariantWithRelations | undefined;
}

export function BuyBox({ product, selectedVariant }: BuyBoxProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
      if (!selectedVariant) return;
      setIsAdding(true);
      // Simulate API call
      setTimeout(() => {
          setIsAdding(false);
          alert(`Added ${product.name} (${selectedVariant.size.name} - ${selectedVariant.firmness.name}) to cart!`);
          // Here we would call a cart action
      }, 800);
  };
    
  const price = selectedVariant ? selectedVariant.price : product.basePrice;
  const isOutOfStock = selectedVariant && selectedVariant.stockQuantity <= 0;
  
  return (
    <div className="rounded-lg border bg-gray-50 p-6 shadow-sm">
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
           <span className="text-3xl font-bold text-gray-900">
             ${Number(price).toFixed(2)}
           </span>
           {/* Maybe show savings if basePrice > price? (Sales logic) */}
        </div>
        <p className="mt-1 text-sm text-gray-500">
           {selectedVariant ? `In stock: ${selectedVariant.stockQuantity}` : "Select options to see availability"}
        </p>
      </div>

      <div className="space-y-4">
        <Button 
            size="lg" 
            className="w-full text-lg" 
            disabled={!selectedVariant || isOutOfStock || isAdding}
            onClick={handleAddToCart}
        >
          {isAdding ? (
              "Adding..."
          ) : isOutOfStock ? (
              "Out of Stock"
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
