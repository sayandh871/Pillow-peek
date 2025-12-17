
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Simplified Checkbox wrapping a real input for accessibility handling without Radix
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ className, onCheckedChange, ...props }, ref) => (
  <input
    type="checkbox"
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 accent-black",
      className
    )}
    onChange={(e) => onCheckedChange?.(e.target.checked)}
    {...props}
  />
))
Checkbox.displayName = "Checkbox"

export { Checkbox }
