"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import qs from "query-string";
import { Button } from "@/components/ui/button";
import { type ProductVariantWithRelations } from "@/lib/db/queries";

interface VariantSelectorProps {
  variants: ProductVariantWithRelations[];
  // Derived state from URL or parent
}

export function VariantSelector({ variants }: VariantSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current selection from URL
  const currentSize = searchParams.get("size");
  const currentFirmness = searchParams.get("firmness");

  // Derive available options
  const sizes = Array.from(new Set(variants.map(v => v.sizeId)));
  
  // For firmness, we want valid options given the selected size (or all if none selected?)
  // Usually, we show all firmnesses valid for this product, but maybe disable ones not available in this size?
  const availableFirmnessForSize = currentSize 
    ? new Set(variants.filter(v => v.sizeId === currentSize).map(v => v.firmnessId))
    : new Set(variants.map(v => v.firmnessId));
    
  const firmnessOptions = Array.from(new Set(variants.map(v => v.firmnessId)));

  const handleSelection = (key: "size" | "firmness", value: string) => {
    const current = qs.parse(searchParams.toString());
    const query = { ...current, [key]: value };

    // If size changes, check if current firmness is valid. If not, pick first valid or reset?
    if (key === "size") {
        const validFirmness = variants.filter(v => v.sizeId === value).map(v => v.firmnessId);
        if (current.firmness && !validFirmness.includes(current.firmness as string)) {
            // Auto-select first available firmness or reset
             query.firmness = validFirmness[0];
        } else if (!current.firmness) {
            query.firmness = validFirmness[0];
        }
    }

    const url = qs.stringifyUrl({
        url: window.location.pathname,
        query,
    });
    router.replace(url, { scroll: false });
  };

  // Helper to get nice labels (could also come from variants if we join data, 
  // currently variants has sizeId/firmnessId. 
  // Ideally passed `variants` has joined relations: variant.size.name etc.
  // The query `getProduct` DOES include relations!)
  
  // We need to find the label for each ID.
  const getSizeLabel = (id: string) => {
      const v = variants.find(v => v.sizeId === id);
      return v?.size?.name || id;
  };
  
  const getFirmnessLabel = (id: string) => {
      const v = variants.find(v => v.firmnessId === id);
      return v?.firmness?.name || id;
  };

  return (
    <div className="space-y-6">
      {/* Size Selector */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-900">Select Size</h3>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {sizes.map((sizeId) => {
             const isSelected = currentSize === sizeId;
             return (
                <Button
                    key={sizeId}
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                        "w-full",
                        isSelected ? "ring-2 ring-offset-1 ring-black" : ""
                    )}
                    onClick={() => handleSelection("size", sizeId)}
                >
                    {getSizeLabel(sizeId)}
                </Button>
             );
          })}
        </div>
      </div>

      {/* Firmness Selector */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-900">Select Firmness</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
             {firmnessOptions.map((firmnessId) => {
                 const isSelected = currentFirmness === firmnessId;
                 const isAvailable = availableFirmnessForSize.has(firmnessId);
                 
                 return (
                    <Button
                        key={firmnessId}
                        variant={isSelected ? "default" : "outline"}
                        disabled={!isAvailable}
                        className={cn(
                            "w-full",
                            !isAvailable && "opacity-50 border-dashed border-gray-300",
                             isSelected ? "ring-2 ring-offset-1 ring-black" : ""
                        )}
                        onClick={() => handleSelection("firmness", firmnessId)}
                    >
                        {getFirmnessLabel(firmnessId)}
                    </Button>
                 );
             })}
        </div>
      </div>
    </div>
  );
}
