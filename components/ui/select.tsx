
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const SelectContext = React.createContext<{
  value?: string
  onChange?: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}>({ open: false, setOpen: () => {} })

export const Select = ({ children, value, onValueChange }: any) => {
  const [open, setOpen] = React.useState(false)
  return (
    <SelectContext.Provider value={{ value, onChange: onValueChange, open, setOpen }}>
      <div className="relative inline-block w-full">{children}</div>
    </SelectContext.Provider>
  )
}

export const SelectTrigger = ({ className, children }: any) => {
  const { open, setOpen } = React.useContext(SelectContext)
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {children}
    </button>
  )
}

export const SelectValue = ({ placeholder }: any) => {
  const { value } = React.useContext(SelectContext)
  return <span>{value ? value : placeholder}</span> // Simplified label lookup not implemented for generic value
}

export const SelectContent = ({ className, children }: any) => {
  const { open } = React.useContext(SelectContext)
  if (!open) return null
  return (
    <div className={cn("absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-popover-foreground shadow-md animate-in fade-in-80", className)}>
      <div className="w-full p-1">{children}</div>
    </div>
  )
}

export const SelectItem = ({ value, children, className }: any) => {
  const { onChange, setOpen } = React.useContext(SelectContext)
  return (
    <div
      onClick={() => {
        onChange?.(value)
        setOpen(false)
      }}
      className={cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-gray-100 cursor-pointer", className)}
    >
      {children}
    </div>
  )
}
