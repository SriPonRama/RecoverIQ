import React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-landing-champagne disabled:opacity-50 disabled:pointer-events-none"
    
    const variants = {
      primary: "bg-landing-champagne text-landing-deep hover:bg-landing-champagne-light shadow-md",
      secondary: "bg-landing-graphite text-landing-surface hover:bg-landing-deep shadow-sm",
      outline: "border border-landing-border bg-transparent hover:bg-landing-surface text-landing-graphite",
      ghost: "hover:bg-landing-surface text-landing-text-sec hover:text-landing-graphite",
      danger: "bg-landing-failure text-landing-surface hover:bg-landing-failure/90 shadow-sm",
    }
    
    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 py-2 text-sm",
      lg: "h-12 px-8 text-base",
    }

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
