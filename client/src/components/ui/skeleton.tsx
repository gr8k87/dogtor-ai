import { cn } from "../../lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("loading-skeleton rounded-xl bg-muted", className)}
      {...props}
    />
  )
}

function SkeletonCard() {
  return (
    <div className="card-elevated p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[160px]" />
        </div>
      </div>
      <Skeleton className="h-[200px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[80%]" />
      </div>
    </div>
  )
}

function SkeletonButton() {
  return (
    <Skeleton className="h-10 w-[120px] rounded-lg" />
  )
}

function SkeletonInput() {
  return (
    <Skeleton className="h-10 w-full rounded-lg" />
  )
}

export { Skeleton, SkeletonCard, SkeletonButton, SkeletonInput }