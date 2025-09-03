import * as React from "react"
import { cn } from "../../lib/utils"

// Apple Health-inspired pastel colors
const healthCardColors = [
  'bg-gradient-to-br from-red-100 to-rose-200 border-rose-200',    // Soft red (brand color)
  'bg-gradient-to-br from-blue-100 to-sky-200 border-sky-200',     // Soft blue
  'bg-gradient-to-br from-green-100 to-emerald-200 border-emerald-200', // Soft green
  'bg-gradient-to-br from-purple-100 to-violet-200 border-violet-200', // Soft purple
  'bg-gradient-to-br from-orange-100 to-amber-200 border-amber-200', // Soft orange
  'bg-gradient-to-br from-teal-100 to-cyan-200 border-cyan-200',   // Soft teal
  'bg-gradient-to-br from-indigo-100 to-blue-200 border-blue-200', // Soft indigo
  'bg-gradient-to-br from-pink-100 to-rose-200 border-pink-200',   // Soft pink
  'bg-gradient-to-br from-yellow-100 to-amber-200 border-amber-200', // Soft yellow (for history)
  'bg-gradient-to-br from-slate-100 to-gray-200 border-gray-200'   // Soft gray
] as const

export interface HealthCardProps extends React.HTMLAttributes<HTMLDivElement> {
  colorIndex?: number
  variant?: 'default' | 'compact' | 'large'
}

const HealthCard = React.forwardRef<HTMLDivElement, HealthCardProps>(
  ({ className, colorIndex, variant = 'default', children, ...props }, ref) => {
    // Use provided colorIndex or generate from content hash for consistency
    const selectedColorIndex = colorIndex ?? Math.abs(hashCode(children?.toString() || '')) % healthCardColors.length
    const colorClass = healthCardColors[selectedColorIndex]
    
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
          colorClass,
          variantClasses[variant],
          className
        )}
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