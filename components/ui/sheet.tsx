
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Simplified Sheet to act as a Drawer
export const Sheet = ({ children, open, onOpenChange }: any) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
       <div className="fixed inset-0 bg-black/80" onClick={() => onOpenChange(false)} />
       <div className={cn("relative z-50 h-full w-full max-w-sm border-l bg-white p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm ml-auto border-l")}>
          {children}
       </div>
    </div>
  );
}

export const SheetContent = ({ children }: any) => <div>{children}</div>
export const SheetHeader = ({ children }: any) => <div className="flex flex-col space-y-2 text-center sm:text-left mb-4">{children}</div>
export const SheetTitle = ({ children }: any) => <h3 className="text-lg font-semibold text-foreground">{children}</h3>
export const SheetTrigger = ({ asChild, children, ...props }: any) => {
    // This is tricky without fully wiring state. MobileDrawer usually controls state.
    // For simplicity, we assume MobileDrawer controls 'open'.
    return <button {...props}>{children}</button>
}
