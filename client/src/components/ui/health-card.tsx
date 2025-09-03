import * as React from "react"
import { cn } from "../../lib/utils"

// Apple Health-inspired BRIGHT gradients using CSS custom properties
// Now globally controlled - change theme in index.css :root variables!

export interface HealthCardProps extends React.HTMLAttributes<HTMLDivElement> {
  colorIndex?: number
  variant?: 'default' | 'compact' | 'large'
}

const HealthCard = React.forwardRef<HTMLDivElement, HealthCardProps>(
  ({ className, colorIndex, variant = 'default', children, ...props }, ref) => {
    // Use provided colorIndex or generate from content hash for consistency  
    const selectedColorIndex = colorIndex ?? Math.abs(hashCode(children?.toString() || '')) % 10 // 10 color options
    
    const variantClasses = {
      default: 'p-6 rounded-2xl',
      compact: 'p-4 rounded-xl', 
      large: 'p-8 rounded-3xl'
    }

    return (
      <div
        ref={ref}
        className={cn(
          'border shadow-sm hover:shadow-md transition-all duration-200',
          'backdrop-blur-sm border-opacity-50',
          variantClasses[variant],
          className
        )}
        style={{
          background: `var(--health-card-${selectedColorIndex})`,
          borderColor: `var(--health-border-${selectedColorIndex})`,
          color: `var(--health-text-${selectedColorIndex})`
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
HealthCard.displayName = "HealthCard"

// Simple hash function for consistent color selection
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

const HealthCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
))
HealthCardHeader.displayName = "HealthCardHeader"

const HealthCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight text-gray-900 dark:text-gray-100",
      className
    )}
    {...props}
  />
))
HealthCardTitle.displayName = "HealthCardTitle"

const HealthCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-600 dark:text-gray-400", className)}
    {...props}
  />
))
HealthCardDescription.displayName = "HealthCardDescription"

const HealthCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("", className)} 
    {...props}
  />
))
HealthCardContent.displayName = "HealthCardContent"

const HealthCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
))
HealthCardFooter.displayName = "HealthCardFooter"

export { HealthCard, HealthCardHeader, HealthCardTitle, HealthCardDescription, HealthCardContent, HealthCardFooter }