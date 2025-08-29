import { Skeleton } from "@/components/ui/skeleton"

export function ListingCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Image skeleton */}
      <div className="relative aspect-[4/3] w-full">
        <Skeleton className="w-full h-full rounded-t-xl" />
      </div>
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        
        {/* Location skeleton */}
        <Skeleton className="h-4 w-2/3" />
        
        {/* Price and type skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
        
        {/* Developer info skeleton */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  )
}

export function ListingCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <ListingCardSkeleton key={index} />
      ))}
    </div>
  )
}

