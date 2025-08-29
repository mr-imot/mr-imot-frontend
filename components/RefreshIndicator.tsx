import { RefreshCw } from "lucide-react"

interface RefreshIndicatorProps {
  isVisible: boolean
  isRefreshing: boolean
  style: React.CSSProperties
}

export function RefreshIndicator({ isVisible, isRefreshing, style }: RefreshIndicatorProps) {
  if (!isVisible) return null

  return (
    <div 
      className="absolute top-0 left-0 right-0 flex items-center justify-center py-4 z-10"
      style={style}
    >
      <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200">
        <RefreshCw 
          className={`w-5 h-5 text-brand transition-transform duration-300 ${
            isRefreshing ? 'animate-spin' : ''
          }`} 
        />
        <span className="text-sm font-medium text-gray-700">
          {isRefreshing ? 'Refreshing...' : 'Pull to refresh'}
        </span>
      </div>
    </div>
  )
}

