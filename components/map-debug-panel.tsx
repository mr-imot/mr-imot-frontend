'use client'

import { useState, useEffect } from 'react'
import { boundsCache } from '@/lib/property-cache'
import { MapFetchController } from '@/lib/map-fetch-controller'

interface MapDebugPanelProps {
  fetchController?: MapFetchController | null
  show?: boolean
}

/**
 * Debug panel for map performance monitoring
 * Shows fetch metrics, cache stats, and listener counts
 * 
 * Enable with ?debug=map query param
 */
export function MapDebugPanel({ fetchController, show }: MapDebugPanelProps) {
  const [cacheStats, setCacheStats] = useState<{
    memoryCacheSize: number
    sessionStorageKeys: string[]
  }>({ memoryCacheSize: 0, sessionStorageKeys: [] })
  
  const [metrics, setMetrics] = useState<{
    calls: number
    cacheHits: number
    cacheMisses: number
    aborted: number
    lastDurationMs: number
  }>({ calls: 0, cacheHits: 0, cacheMisses: 0, aborted: 0, lastDurationMs: 0 })

  // Update stats every second
  useEffect(() => {
    if (!show) return
    
    const interval = setInterval(() => {
      setCacheStats(boundsCache.getCacheStats())
      if (fetchController) {
        setMetrics({ ...fetchController.metrics })
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }, [show, fetchController])

  if (!show) return null

  const hitRate = metrics.calls > 0 
    ? Math.round((metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100) 
    : 0

  return (
    <div className="fixed bottom-4 left-4 z-[9999] bg-black/90 text-green-400 font-mono text-xs p-3 rounded-lg shadow-xl max-w-sm">
      <div className="font-bold text-white mb-2">📊 Map Debug</div>
      
      <div className="space-y-1">
        <div>
          <span className="text-gray-400">Fetch calls:</span> {metrics.calls}
        </div>
        <div>
          <span className="text-gray-400">Cache hits:</span> {metrics.cacheHits}
        </div>
        <div>
          <span className="text-gray-400">Cache misses:</span> {metrics.cacheMisses}
        </div>
        <div>
          <span className="text-gray-400">Aborted:</span> {metrics.aborted}
        </div>
        <div>
          <span className="text-gray-400">Hit rate:</span>{' '}
          <span className={hitRate > 50 ? 'text-green-400' : 'text-yellow-400'}>
            {hitRate}%
          </span>
        </div>
        <div>
          <span className="text-gray-400">Last fetch:</span> {metrics.lastDurationMs}ms
        </div>
        
        <div className="border-t border-gray-700 mt-2 pt-2">
          <span className="text-gray-400">Memory cache:</span> {cacheStats.memoryCacheSize} tiles
        </div>
        <div>
          <span className="text-gray-400">Session storage:</span> {cacheStats.sessionStorageKeys.length} tiles
        </div>
      </div>
    </div>
  )
}

