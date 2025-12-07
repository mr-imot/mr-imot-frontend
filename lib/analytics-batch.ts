// Debounced batch analytics system to prevent request spam
// Batches multiple view tracking requests and sends them together

import { recordProjectView } from '@/lib/api'

interface PendingView {
  projectId: string
  timestamp: number
}

class AnalyticsBatcher {
  private pendingViews: Map<string, PendingView> = new Map()
  private batchTimeout: NodeJS.Timeout | null = null
  private readonly BATCH_DELAY = 2000 // 2 seconds
  private readonly MAX_BATCH_SIZE = 10
  private readonly DEBOUNCE_DELAY = 500 // 500ms debounce per project

  // Track a project view (debounced and batched)
  async trackView(projectId: string): Promise<void> {
    const now = Date.now()
    const existing = this.pendingViews.get(projectId)

    // Debounce: if same project was tracked recently, update timestamp
    if (existing && now - existing.timestamp < this.DEBOUNCE_DELAY) {
      existing.timestamp = now
      return
    }

    // Add to pending batch
    this.pendingViews.set(projectId, { projectId, timestamp: now })

    // Clear existing timeout
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
    }

    // If batch is full, send immediately
    if (this.pendingViews.size >= this.MAX_BATCH_SIZE) {
      this.flushBatch()
      return
    }

    // Otherwise, schedule batch send
    this.batchTimeout = setTimeout(() => {
      this.flushBatch()
    }, this.BATCH_DELAY)
  }

  // Send all pending views
  private async flushBatch(): Promise<void> {
    if (this.pendingViews.size === 0) return

    const viewsToSend = Array.from(this.pendingViews.values())
    this.pendingViews.clear()

    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
      this.batchTimeout = null
    }

    // Send all views in parallel (but with slight stagger to avoid overwhelming server)
    const promises = viewsToSend.map((view, index) => 
      new Promise<void>((resolve) => {
        setTimeout(async () => {
          try {
            await recordProjectView(view.projectId)
          } catch (error) {
            console.warn(`Analytics tracking failed for ${view.projectId}:`, error)
          }
          resolve()
        }, index * 50) // 50ms stagger between requests
      })
    )

    await Promise.all(promises)
  }

  // Force flush (for cleanup)
  async flush(): Promise<void> {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
      this.batchTimeout = null
    }
    await this.flushBatch()
  }
}

// Export singleton instance
export const analyticsBatcher = new AnalyticsBatcher()

// Export convenience function
export const trackProjectView = (projectId: string) => {
  analyticsBatcher.trackView(projectId)
}









