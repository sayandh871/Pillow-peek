
import * as React from "react"
import { cn } from "@/lib/utils"

function Badge({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "secondary" }) {
  const variantClass = variant === "secondary" 
    ? "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 bg-gray-100 text-gray-900"
    : "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 bg-black text-white";
    
  return (
    <div className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      variantClass,
      className
    )} {...props} />
  )
}

export { Badge }
