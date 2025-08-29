import { Skeleton } from "@/components/ui/skeleton"

export function FilterSkeleton() {
  return (
    <div className="py-4 xs:py-6 lg:hidden bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
      <div className="container mx-auto px-4 max-w-[1800px]">
        <div className="border-0 shadow-sm bg-white/80 backdrop-blur-sm rounded-lg p-4 xs:p-6 lg:p-8">
          {/* Mobile Map/List Toggle skeleton */}
          <div className="md:hidden mb-4 xs:mb-6 flex justify-center">
            <Skeleton className="h-12 w-32 rounded-full" />
          </div>
          
          <div className="flex flex-col xs:flex-row lg:flex-row items-center justify-center gap-4 xs:gap-6 lg:gap-12">
            {/* City Selector skeleton */}
            <div className="flex flex-col items-center space-y-3 xs:space-y-4 w-full lg:w-auto">
              <div className="flex items-center gap-2 xs:gap-3">
                <Skeleton className="w-4 xs:w-5 h-4 xs:h-5 rounded-full" />
                <Skeleton className="h-5 xs:h-6 w-32" />
              </div>
              <div className="flex gap-2 xs:gap-3">
                <Skeleton className="h-12 w-20 rounded-full" />
                <Skeleton className="h-12 w-20 rounded-full" />
                <Skeleton className="h-12 w-20 rounded-full" />
              </div>
            </div>

            {/* Divider skeleton */}
            <div className="lg:hidden w-full">
              <Skeleton className="h-px w-full" />
            </div>

            {/* Property Type Filter skeleton */}
            <div className="flex flex-col items-center space-y-3 xs:space-y-4 w-full lg:w-auto">
              <div className="flex items-center gap-2 xs:gap-3">
                <Skeleton className="w-4 xs:w-5 h-4 xs:h-5 rounded-full" />
                <Skeleton className="h-5 xs:h-6 w-28" />
              </div>
              <div className="flex flex-wrap gap-2 xs:gap-3 justify-center">
                <Skeleton className="h-12 w-16 rounded-full" />
                <Skeleton className="h-12 w-24 rounded-full" />
                <Skeleton className="h-12 w-20 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

