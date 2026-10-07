import React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-landing-border/30 text-landing-graphite",
    success: "bg-landing-success/20 text-landing-success border border-landing-success/30",
    warning: "bg-landing-champagne/20 text-landing-champagne border border-landing-champagne/30",
    error: "bg-landing-failure/20 text-landing-failure border border-landing-failure/30",
    info: "bg-landing-deep/10 text-landing-deep border border-landing-deep/20",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
