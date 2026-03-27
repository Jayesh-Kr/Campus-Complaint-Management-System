import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-sm border border-neutral-800 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2",
        {
          "border-transparent bg-neutral-100 text-neutral-900 shadow hover:bg-neutral-200": variant === "default",
          "border-transparent bg-neutral-800 text-neutral-100 hover:bg-neutral-700": variant === "secondary",
          "border-transparent bg-red-900 text-neutral-100 hover:bg-red-800": variant === "destructive",
          "text-neutral-50": variant === "outline",
          "border-transparent bg-emerald-900/40 text-emerald-400 hover:bg-emerald-900/60": variant === "success",
          "border-transparent bg-amber-900/40 text-amber-400 hover:bg-amber-900/60": variant === "warning",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
