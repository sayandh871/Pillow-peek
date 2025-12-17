
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FilterSidebar, type FilterOption } from "./Sidebar";
import { Menu } from "lucide-react"; // Or simple SVG text

type MobileDrawerProps = {
  sizes: FilterOption[];
  firmness: FilterOption[];
  materials: FilterOption[];
};

export function MobileDrawer({ sizes, firmness, materials }: MobileDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="lg:hidden"
        onClick={() => setIsOpen(true)}
      >
        Filters
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
             <FilterSidebar 
                sizes={sizes} 
                firmness={firmness} 
                materials={materials} 
             />
             <Button className="w-full mt-6" onClick={() => setIsOpen(false)}>
                View Results
             </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
