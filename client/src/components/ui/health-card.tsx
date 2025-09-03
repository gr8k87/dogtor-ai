import * as React from "react"
import { cn } from "../../lib/utils"

// Apple Health-inspired BRIGHT pastel colors - True Apple style!
const healthCardColors = [
  'bg-gradient-to-br from-red-300 to-rose-400 border-rose-300',      // Bright coral (matches logo theme)
  'bg-gradient-to-br from-sky-300 to-blue-400 border-sky-300',       // Bright sky blue  
  'bg-gradient-to-br from-emerald-300 to-green-400 border-emerald-300', // Bright emerald (medical)
  'bg-gradient-to-br from-violet-300 to-purple-400 border-violet-300', // Bright lavender
  'bg-gradient-to-br from-orange-300 to-amber-400 border-orange-300', // Bright orange
  'bg-gradient-to-br from-cyan-300 to-teal-400 border-cyan-300',     // Bright teal
  'bg-gradient-to-br from-indigo-300 to-blue-400 border-indigo-300', // Bright indigo
  'bg-gradient-to-br from-pink-300 to-rose-400 border-pink-300',     // Bright pink
  'bg-gradient-to-br from-yellow-300 to-amber-400 border-yellow-300', // Bright yellow (history)
  'bg-gradient-to-br from-slate-300 to-gray-400 border-slate-300'    // Professional gray
] as const

// Alternative: Use CSS custom properties for global color control
// Uncomment these lines and comment out the array above to use global CSS variables
/*
const healthCardColors = [
  'bg-gradient-to-br from-red-300 to-rose-400 border-rose-300',           // Brand red
  'bg-gradient-to-br from-sky-300 to-blue-400 border-sky-300',            // Sky blue
  'bg-[hsl(var(--health-tertiary))] border-[hsl(var(--health-primary))]', // Global theme color
  'bg-gradient-to-br from-violet-300 to-purple-400 border-violet-300',    // Lavender
  'bg-gradient-to-br from-orange-300 to-amber-400 border-orange-300',     // Orange
  'bg-gradient-to-br from-cyan-300 to-teal-400 border-cyan-300',          // Teal
  'bg-gradient-to-br from-indigo-300 to-blue-400 border-indigo-300',      // Indigo
  'bg-[hsl(var(--health-quaternary))] border-[hsl(var(--health-secondary))]', // Global theme color 2
  'bg-gradient-to-br from-yellow-300 to-amber-400 border-yellow-300',     // Yellow (history)
  'bg-gradient-to-br from-slate-300 to-gray-400 border-slate-300'         // Gray
] as const
*/

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