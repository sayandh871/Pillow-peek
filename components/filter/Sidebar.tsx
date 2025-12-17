
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useDebouncedCallback } from "use-debounce";
import qs from "query-string";
import { cn } from "@/lib/utils"; // Assuming standard utils

// Types for options passed from Server Component
type FilterOption = {
  id: string;
  label: string;
};

type FilterSidebarProps = {
  sizes: FilterOption[];
  firmness: FilterOption[];
  materials: FilterOption[];
  className?: string; // for mobile usage
};

export function FilterSidebar({ sizes, firmness, materials, className }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Helper to get array from searchParams (which might be string or array)
  const getParamArray = (key: string) => {
    const param = searchParams.getAll(key);
    // query-string might parse as string if only one, but searchParams.getAll gives array always?
    // wait, Next.js RO useSearchParams.getAll() returns string[]. Correct.
    // If using qs.parse on URL string it might differ.
    // Let's stick to useSearchParams for initial state.
    // Actually, handling "multiple" with search parameters: ?size=a&size=b
    return param;
  };

  // Local state for immediate UI feedback (optimistic)
  const [selectedSizes, setSelectedSizes] = useState<string[]>(getParamArray("sizes"));
  const [selectedFirmness, setSelectedFirmness] = useState<string[]>(getParamArray("firmness"));
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(getParamArray("materials"));

  // Sync with URL if it changes externally (e.g. browser back button)
  useEffect(() => {
    setSelectedSizes(getParamArray("sizes"));
    setSelectedFirmness(getParamArray("firmness"));
    setSelectedMaterials(getParamArray("materials"));
  }, [searchParams]);

  // Debounced URL update
  const updateUrl = useDebouncedCallback((newSizes, newFirmness, newMaterials) => {
    const current = qs.parse(searchParams.toString());
    const query = {
      ...current,
      sizes: newSizes,
      firmness: newFirmness,
      materials: newMaterials,
      page: 1, // Reset page on filter change
    };

    // Remove empty arrays/undefined
    if (!newSizes?.length) delete query.sizes;
    if (!newFirmness?.length) delete query.firmness;
    if (!newMaterials?.length) delete query.materials;

    const url = qs.stringifyUrl({
        url: window.location.pathname,
        query,
    }, { arrayFormat: 'none' }); // 'none' means ?sizes=a&sizes=b. Wait, user example: ?size=king,queen (comma)
    // The user requirement: "For example, if "King" is already in the URL and the user clicks "Queen," the new URL should be ?size=king,queen."
    // qs 'comma' format: ?sizes=a,b
    
    const urlComma = qs.stringifyUrl({
        url: window.location.pathname,
        query,
    }, { arrayFormat: 'comma' });

    router.push(urlComma, { scroll: false });
  }, 500);

  const handleToggle = (
    type: "sizes" | "firmness" | "materials",
    value: string,
    current: string[],
    setter: (val: string[]) => void
  ) => {
    const newValues = current.includes(value)
      ? current.filter((i) => i !== value)
      : [...current, value];
    
    setter(newValues);
    
    // Trigger update with LATEST values for all
    // Since state update is async, we use the `newValues` for the changed one, 
    // and `currentX` state for others.
    // Caution: Closure capture might see old values if we aren't careful.
    // Better to use a single "apply" function or reference state correctly.
    // Actually, useDebouncedCallback will use the arguments passed to it.
    
    const s = type === "sizes" ? newValues : selectedSizes;
    const f = type === "firmness" ? newValues : selectedFirmness;
    const m = type === "materials" ? newValues : selectedMaterials;
    
    updateUrl(s, f, m);
  };
  
 const clearAll = () => {
      setSelectedSizes([]);
      setSelectedFirmness([]);
      setSelectedMaterials([]);
      router.push(window.location.pathname); // Clear search params
 };

  return (
    <div className={cn("space-y-8", className)}>
      <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Filters</h3>
          <Button variant="ghost" size="sm" onClick={clearAll} className="h-auto p-0 text-gray-500">
              Clear All
          </Button>
      </div>

      {/* SIZES */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Size</Label>
        <div className="space-y-2">
          {sizes.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox
                id={`size-${option.id}`}
                checked={selectedSizes.includes(option.id)}
                onCheckedChange={() =>
                  handleToggle("sizes", option.id, selectedSizes, setSelectedSizes)
                }
              />
              <Label htmlFor={`size-${option.id}`} className="leading-none cursor-pointer text-sm text-gray-600">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* FIRMNESS */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Firmness</Label>
        <div className="space-y-2">
          {firmness.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
               <Checkbox
                id={`firmness-${option.id}`}
                checked={selectedFirmness.includes(option.id)}
                onCheckedChange={() =>
                  handleToggle("firmness", option.id, selectedFirmness, setSelectedFirmness)
                }
              />
              <Label htmlFor={`firmness-${option.id}`} className="leading-none cursor-pointer text-sm text-gray-600">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* MATERIALS */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Material</Label>
        <div className="space-y-2">
          {materials.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
               <Checkbox
                id={`material-${option.id}`}
                checked={selectedMaterials.includes(option.id)}
                onCheckedChange={() =>
                  handleToggle("materials", option.id, selectedMaterials, setSelectedMaterials)
                }
              />
              <Label htmlFor={`material-${option.id}`} className="leading-none cursor-pointer text-sm text-gray-600">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
