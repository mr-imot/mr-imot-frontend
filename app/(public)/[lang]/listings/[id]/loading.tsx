/**
 * Loading state for listing detail pages (legacy [id] route)
 * Prevents blank flash while SSR content hydrates
 */

export default function ListingDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-pulse">
      {/* Gallery skeleton */}
      <div className="h-96 bg-gray-200 rounded-lg mb-6" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="space-y-2 mt-6">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <div className="h-48 bg-gray-200 rounded-lg" />
          <div className="h-32 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

