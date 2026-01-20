// Marker management utilities for Airbnb-style maps
import { createPricePillElement, createSvgMarkerIcon, createSvgHouseIcon, createClusterMarkerIcon, clusterProperties, PropertyCluster } from './google-maps'
import { getDeviceType } from './device-detection'

export interface PropertyData {
  id: string
  slug?: string // SEO-friendly URL slug from database
  title: string
  priceRange: string
  location: string
  image: string
  images?: string[]
  description: string
  lat: number
  lng: number
  type: "Apartment Complex" | "Residential Houses"
  status: string
  shortPrice: string
}

export interface MarkerManagerConfig {
  maps: google.maps.Map[]
  properties: PropertyData[]
  onPropertySelect: (propertyId: string | null, property?: PropertyData) => void
  onPropertyHover: (propertyId: string | null) => void
  onAriaAnnouncement: (message: string) => void
  selectedPropertyId: string | null
  hoveredPropertyId: string | null
}

export class MarkerManager {
  private config: MarkerManagerConfig
  private markers: Record<string, google.maps.marker.AdvancedMarkerElement> = {}
  private clusterMarkers: google.maps.marker.AdvancedMarkerElement[] = []
  private markerElements: Record<string, HTMLElement> = {}
  private markerPrices: Record<string, string> = {}
  private markerContents: Record<string, HTMLElement> = {} // Store marker content elements for state updates
  private allMarkerInstances: Record<string, HTMLElement[]> = {} // Store ALL marker instances (original + clones) for each property
  private markerStates: Record<string, "default" | "hovered" | "selected"> = {} // Track current state of each marker
  private clusters: PropertyCluster[] = []
  private markerCache: Record<string, google.maps.marker.AdvancedMarkerElement> = {}
  private isInitialized: boolean = false
  private previousShouldCluster: boolean | null = null

  constructor(config: MarkerManagerConfig) {
    this.config = config
    

  }

  // Main method to render all markers (clustering enabled)
  renderMarkers(force: boolean = false) {
    const timestamp = new Date().toISOString()
    console.log('🟠 MARKER RENDER:', {
      timestamp,
      force,
      propertyCount: this.config.properties.length,
      isInitialized: this.isInitialized,
      existingMarkerCount: Object.keys(this.markers).length
    })
    
    // Get current zoom from first available map
    const currentZoom = this.config.maps.length > 0 && this.config.maps[0] 
      ? this.config.maps[0].getZoom() ?? null
      : null
    
    // Re-enable clustering: zoom < 12 and properties.length > 20
    const shouldCluster = currentZoom !== null && currentZoom < 12 && this.config.properties.length > 20

    // Skip re-render if already initialized and not forced
    if (!force && this.isInitialized && this.previousShouldCluster === shouldCluster) {
      // Just update marker states for hover/selection
      this.updateMarkerStates()
      return
    }

    // Clear and re-render on force or first init
    if (!this.isInitialized || force) {
      this.clearAllMarkers()
    }

    // Update clustering state
    this.previousShouldCluster = shouldCluster

    // Render clustered or individual markers based on zoom and property count
    if (shouldCluster) {
      this.renderClustered()
    } else {
      this.renderIndividual()
    }

    this.isInitialized = true
  }

  // Update marker states based on hover/selection
  updateMarkerStates() {
    // Use allMarkerInstances to update ALL visible markers (clones + originals)
    Object.entries(this.allMarkerInstances).forEach(([propertyId, markerElements]) => {
      if (markerElements && markerElements.length > 0) {
        // Determine the current state
        let newState: "default" | "hovered" | "selected" = "default"
        let newZIndex = 1

        if (this.config.selectedPropertyId === propertyId) {
          newState = "selected"
          newZIndex = 999
        } else if (this.config.hoveredPropertyId === propertyId) {
          newState = "hovered"
          newZIndex = 500
        }

        // Only update if state has actually changed
        const currentState = this.markerStates[propertyId] || "default"
        if (currentState !== newState) {
          // Update stored state
          this.markerStates[propertyId] = newState

          // Update z-index on the primary marker
          const marker = this.markers[propertyId]
          if (marker) {
            marker.zIndex = newZIndex
          }

          // Update all marker instances by modifying SVG elements
          markerElements.forEach((markerElement) => {
            const svg = markerElement.querySelector('svg')
            
            if (svg) {
              // High contrast colors: teal brand color for active states
              const isActive = newState === "hovered" || newState === "selected"
              const mainFillColor = isActive ? "#0d9488" : "#FFFFFF"  // Teal for hover/selected
              const strokeColor = isActive ? "#FFFFFF" : "#1f2937"    // White stroke on teal, dark gray on white
              const windowColor = isActive ? "rgba(255,255,255,0.8)" : "#1f2937"
              const strokeWidth = "2"

              // Update main building elements (path, polyline, main rect)
              const mainElements = svg.querySelectorAll('path, polyline')
              mainElements.forEach((element) => {
                const currentFill = element.getAttribute('fill')
                if (currentFill && currentFill !== 'none') {
                  element.setAttribute('fill', mainFillColor)
                }
                if (element.hasAttribute('stroke')) {
                  element.setAttribute('stroke', strokeColor)
                }
                if (element.hasAttribute('stroke-width')) {
                  element.setAttribute('stroke-width', strokeWidth)
                }
              })

              // Update building frame (first rect - the main building outline)
              const rects = svg.querySelectorAll('rect')
              if (rects.length > 0) {
                const mainBuilding = rects[0] // First rect is the main building
                mainBuilding.setAttribute('fill', mainFillColor)
                mainBuilding.setAttribute('stroke', strokeColor)
                mainBuilding.setAttribute('stroke-width', strokeWidth)

                // Update window elements (remaining rects are windows)
                for (let i = 1; i < rects.length; i++) {
                  const windowEl = rects[i]
                  windowEl.setAttribute('fill', windowColor)
                }
              }

              // Apply CSS classes for any additional styling
              markerElement.className = `map-marker-icon map-marker-${newState}`
            }
          })
        }
      }
    })
  }

  // Get clusters for external use
  getClusters(): PropertyCluster[] {
    return this.clusters
  }

  // Get individual marker by property ID
  getMarker(propertyId: string): google.maps.marker.AdvancedMarkerElement | null {
    return this.markers[propertyId] || null
  }

  // Clean up all markers
  cleanup() {
    this.clearAllMarkers()
    this.clearCache()
  }

  // Clear marker cache (use when properties are fundamentally changed)
  clearCache() {
    Object.values(this.markerCache).forEach((m) => {
      if ('setMap' in m) {
        m.setMap(null)
      } else {
        m.map = null
      }
    })
    this.markerCache = {}
    this.isInitialized = false
    this.previousShouldCluster = null // Reset clustering state
  }

  // Check if markers already exist
  hasMarkers(): boolean {
    return Object.keys(this.markers).length > 0
  }

  // Update properties without recreating markers
  updateProperties(newProperties: PropertyData[]) {
    const timestamp = new Date().toISOString()
    console.log('🟠 MARKER UPDATE (updateProperties):', {
      timestamp,
      newPropertyCount: newProperties.length,
      existingMarkerCount: Object.keys(this.markers).length,
      newPropertyIds: newProperties.map(p => p.id),
      reason: 'properties changed'
    })
    
    const newPropertyIds = new Set(newProperties.map(p => p.id))
    const primaryMap = this.config.maps[0]
    if (!primaryMap) return
    
    // Batch 1: Identify what needs to be done (no DOM operations yet)
    const toShow: PropertyData[] = []
    const toCreate: PropertyData[] = []
    const toHide: string[] = []
    
    // Check which existing markers need to be shown or hidden
    Object.keys(this.markers).forEach(id => {
      if (!newPropertyIds.has(id)) {
        toHide.push(id)
      }
    })
    
    // Check which new properties need markers shown or created
    newProperties.forEach(property => {
      const existing = this.markers[property.id]
      if (existing) {
        toShow.push(property)
      } else {
        toCreate.push(property)
      }
    })
    
    
    // Batch 2: Execute all DOM operations together
    // Hide markers first (fast - just setting map to null)
    toHide.forEach(id => {
      const marker = this.markers[id]
      if (marker) {
        if ('setMap' in marker) {
          marker.setMap(null)
        } else {
          marker.map = null
        }
      }
    })
    
    // Show existing markers (fast - just setting map reference)
    toShow.forEach(property => {
      const marker = this.markers[property.id]
      if (marker) {
        if ('setMap' in marker) {
          marker.setMap(primaryMap)
        } else {
          marker.map = primaryMap
        }
      }
    })
    
    // Create new markers (slower - creates DOM elements)
    toCreate.forEach(property => {
      this.createSingleMarker(property)
    })
    
    // Update marker states once at the end
    this.updateMarkerStates()
  }

  // Remove a specific marker
  private removeMarker(propertyId: string) {
    const marker = this.markers[propertyId]
    if (marker) {
      if ('setMap' in marker) {
        marker.setMap(null)
      } else {
        marker.map = null
      }
      delete this.markers[propertyId]
      delete this.markerElements[propertyId]
      delete this.markerPrices[propertyId]

      // Clean up all marker contents (including cloned ones)
      Object.keys(this.markerContents).forEach(contentId => {
        if (contentId.startsWith(`${propertyId}_`) || contentId === propertyId) {
          delete this.markerContents[contentId]
          delete this.markerStates[contentId]
        }
      })
    }
  }

  // Update configuration without recreating manager
  updateConfig(config: Partial<MarkerManagerConfig>) {
    this.config = { ...this.config, ...config }
  }

  private clearAllMarkers() {
    const timestamp = new Date().toISOString()
    const markerCount = Object.keys(this.markers).length
    console.log('🟠 CLEAR ALL MARKERS:', {
      timestamp,
      markerCount,
      markerIds: Object.keys(this.markers)
    })
    
    // Clear all markers from maps (unified approach - no clones to clean up)
    Object.values(this.markers).forEach((marker) => {
      if ('setMap' in marker) {
        marker.setMap(null)
      } else {
        marker.map = null
      }
    })

    this.clusterMarkers.forEach((marker) => {
      if ('setMap' in marker) {
        marker.setMap(null)
      } else {
        marker.map = null
      }
    })

    // Clear all marker data (simplified - no cloned elements)
    this.markers = {}
    this.clusterMarkers = []
    this.markerElements = {}
    this.markerContents = {}
    this.markerStates = {}
    this.allMarkerInstances = {} // Clear all marker instances
    // Note: We preserve markerCache for reuse
  }

  private renderClustered() {
    const clusters = clusterProperties(this.config.properties, this.config.maps[0])
    this.clusters = clusters
    
    clusters.forEach((cluster, clusterIndex) => {
      if (cluster.properties.length === 1) {
        // Single property - create normal marker
        const property = cluster.properties[0]
        this.createSingleMarker(property)
      } else {
        // Multiple properties - create cluster marker
        this.createClusterMarker(cluster, clusterIndex)
      }
    })
  }

  private renderIndividual() {
    this.clusters = []
    
    // Batch create all markers for better performance
    // Use requestAnimationFrame to avoid blocking the main thread
    const properties = this.config.properties
    
    if (properties.length === 0) return
    
    // Create all markers synchronously for instant display
    // This is faster than using requestAnimationFrame which causes staggered appearance
    properties.forEach((property) => {
      this.createSingleMarker(property)
    })
    
    // Update all marker states in one pass
    this.updateMarkerStates()
  }

  private createSingleMarker(property: PropertyData) {
    if (typeof property.lat !== "number" || typeof property.lng !== "number") {
      return
    }
    
    const timestamp = new Date().toISOString()
    console.log('🟠 CREATE MARKER:', {
      timestamp,
      propertyId: property.id,
      propertyTitle: property.title,
      lat: property.lat,
      lng: property.lng,
      alreadyExists: !!this.markers[property.id],
      fromCache: !!(this.markerCache[property.id] && this.markerContents[property.id])
    })

    // Check if marker is already cached AND we have its original content to clone
    if (this.markerCache[property.id] && this.markerContents[property.id]) {
      const originalElement = this.markerContents[property.id]
      const clonedElements: HTMLElement[] = []
      
      // Create new markers for each map using the cached content as reference
      this.config.maps.forEach((map) => {
        if (map && originalElement) {
          const clonedElement = originalElement.cloneNode(true) as HTMLElement
          clonedElements.push(clonedElement)
          
          const marker = new google.maps.marker.AdvancedMarkerElement({
            position: { lat: property.lat, lng: property.lng },
            map: map,
            content: clonedElement,
            title: property.title,
            zIndex: 1,
          })
          this.addMarkerEventListeners(marker, property, clonedElement)
        }
      })
      
      // Store all cloned instances for state updates
      this.allMarkerInstances[property.id] = clonedElements
      
      // Ensure primary reference exists
      if (!this.markers[property.id]) {
        this.markers[property.id] = this.markerCache[property.id]
      }
      return
    }

    // Use house icon for houses, building icon for apartments
    const iconType = property.type === "Residential Houses" ? "house" : "apartment"
    const markerIcon = createSvgHouseIcon(iconType, "default")

    // Create HTML element for the marker
    const markerElement = document.createElement('div')
    markerElement.className = 'map-marker-icon map-marker-default'
    markerElement.innerHTML = markerIcon
    markerElement.setAttribute('role', 'button')
    markerElement.setAttribute('tabindex', '0')
    markerElement.setAttribute('data-property-id', property.id)
    markerElement.style.cursor = 'pointer'
    


    // Create separate markers for each map (AdvancedMarkerElement can only be on one map)
    const markers: google.maps.marker.AdvancedMarkerElement[] = []
    const allMarkerElements: HTMLElement[] = []
    
    this.config.maps.forEach((map, index) => {
      if (map) {
        // Clone the marker element for each map
        const clonedElement = markerElement.cloneNode(true) as HTMLElement
        clonedElement.style.cursor = 'pointer'
        allMarkerElements.push(clonedElement)
        
        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: { lat: property.lat, lng: property.lng },
          map: map,
          content: clonedElement,
          title: property.title,
          zIndex: 1,
        })
        
        markers.push(marker)
        
        // Add event listeners to each marker
        this.addMarkerEventListeners(marker, property, clonedElement)
      }
    })

    // Store the first marker as the primary one for state management
    this.markerCache[property.id] = markers[0]
    this.markers[property.id] = markers[0]
    this.markerContents[property.id] = markerElement
    this.allMarkerInstances[property.id] = allMarkerElements // Track all instances for state updates
    this.markerStates[property.id] = "default"
  }

  private createClusterMarker(cluster: PropertyCluster, clusterIndex: number) {
    const count = cluster.properties.length
    
    try {
      // Create HTML cluster pill element
      const clusterElement = document.createElement('div')
      clusterElement.className = 'map-price-pill map-price-pill--cluster'
      clusterElement.textContent = count.toString()
      clusterElement.setAttribute('role', 'button')
      clusterElement.setAttribute('tabindex', '0')
      clusterElement.style.cursor = 'pointer'
      
      // Create AdvancedMarkerElement for cluster
      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: { lat: cluster.lat, lng: cluster.lng },
        map: this.config.maps[0],
        content: clusterElement,
        title: `${count} properties`,
        zIndex: 100,
      })
      
      this.clusterMarkers.push(marker)
      this.addClusterEventListeners(marker, cluster, count, clusterElement)
    } catch (error) {
      console.error('❌ Error creating cluster AdvancedMarkerElement:', error)
      // Fallback to legacy SVG cluster
      const clusterIcon = createClusterMarkerIcon(count, "default")
      const clusterElement = document.createElement('div')
      clusterElement.className = 'map-price-pill map-price-pill--cluster'
      clusterElement.innerHTML = clusterIcon
      clusterElement.setAttribute('role', 'button')
      clusterElement.setAttribute('tabindex', '0')
      clusterElement.style.cursor = 'pointer'
      
      const fallbackMarker = new google.maps.marker.AdvancedMarkerElement({
        position: { lat: cluster.lat, lng: cluster.lng },
        map: this.config.maps[0],
        content: clusterElement,
        zIndex: 100,
        title: `${count} properties`,
      })
      
      this.clusterMarkers.push(fallbackMarker)
      this.addClusterEventListeners(fallbackMarker, cluster, count, clusterElement)
    }
  }

  private addMarkerEventListeners(marker: google.maps.marker.AdvancedMarkerElement, property: PropertyData, pillElement: HTMLElement) {
        // Add accessibility attributes to the pill element
    pillElement.setAttribute('aria-label', `Property: ${property.title} - ${property.shortPrice || 'Contact for price'}`)

    // Detect if this is a touch device
    const isTouchDevice = getDeviceType() === 'mobile' || getDeviceType() === 'tablet'

    // Click marker to select/deselect
    marker.addListener("click", (e: google.maps.MapMouseEvent) => {
      const timestamp = new Date().toISOString()
      const currentConfigSelectedId = this.config.selectedPropertyId
      const willOpen = currentConfigSelectedId !== property.id
      const willClose = currentConfigSelectedId === property.id
      
      // FIX: Stop propagation to prevent pill element touch/click handlers from also firing
      // This prevents double-firing and race conditions where card opens then immediately closes
      if (e.domEvent) {
        e.domEvent.stopPropagation()
        e.domEvent.preventDefault()
      }
      
      console.log('🔵 MARKER CLICK FIRED:', {
        timestamp,
        propertyId: property.id,
        propertyTitle: property.title,
        currentConfigSelectedId,
        willOpen,
        willClose,
        action: willOpen ? 'OPENING card' : 'CLOSING card'
      })
      
      if (currentConfigSelectedId === property.id) {
        console.log('🔵 MARKER CLICK: Calling onPropertySelect(null) to close')
        this.config.onPropertySelect(null)
        this.config.onAriaAnnouncement("Property details closed")
      } else {
        console.log('🔵 MARKER CLICK: Calling onPropertySelect(property.id, property) to open')
        // FIX: Pass the full property object to avoid stale closure issues
        // The callback can use this directly instead of searching filteredProperties
        this.config.onPropertySelect(property.id, property)
        this.config.onAriaAnnouncement(`Selected property: ${property.title} - ${property.shortPrice || 'Contact for price'}`)
      }
    })

    // Add keyboard support directly to pill element
    pillElement.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        // Trigger click on marker
        google.maps.event.trigger(marker, 'click')
      }
    })

    // FIX: Remove duplicate touch/click handlers on pill element
    // The marker click handler already handles all selection logic
    // Having both causes race conditions where both fire and the card closes immediately
    // We only need visual hover effects on the pill, not selection logic
    if (isTouchDevice) {
      // Touch device: Only add visual feedback, no selection logic
      // Selection is handled by marker click handler which stops propagation
      pillElement.addEventListener('touchstart', (e: TouchEvent) => {
        // Just visual feedback, don't prevent default (let marker click handle it)
        pillElement.style.transform = 'scale(1.05)'
      }, { passive: true })

      pillElement.addEventListener('touchend', (e: TouchEvent) => {
        // Reset visual feedback
        pillElement.style.transform = 'scale(1)'
      }, { passive: true })

      pillElement.addEventListener('touchcancel', () => {
        // Reset visual feedback
        pillElement.style.transform = 'scale(1)'
      }, { passive: true })
    } else {
      // Desktop: Use mouse events
      pillElement.addEventListener('mouseenter', () => {
        this.config.onPropertyHover(property.id)
      })

      pillElement.addEventListener('mouseleave', () => {
        this.config.onPropertyHover(null)
      })
    }
  }



  private addClusterEventListeners(marker: google.maps.marker.AdvancedMarkerElement, cluster: PropertyCluster, count: number, clusterElement: HTMLElement) {
    // Add accessibility attributes to the cluster element
    clusterElement.setAttribute('aria-label', `Cluster of ${count} properties. Click to zoom in and expand.`)

    // Detect if this is a touch device
    const isTouchDevice = getDeviceType() === 'mobile' || getDeviceType() === 'tablet'

    // Click cluster to zoom in
    marker.addListener("click", () => {
      this.config.maps[0]?.fitBounds(cluster.bounds)
      this.config.onAriaAnnouncement(`Expanded cluster of ${count} properties. Zooming to show individual listings.`)
      setTimeout(() => {
        const newZoom = this.config.maps[0]?.getZoom() || 10
        if (newZoom >= 12) {
          // console.log('🔍 Zoomed in enough to show individual markers')
        }
      }, 500)
    })

    // Add keyboard support directly to cluster element
    clusterElement.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        google.maps.event.trigger(marker, 'click')
      }
    })

    if (isTouchDevice) {
      // Touch device: Use touch events with preventDefault
      let touchStartTime = 0
      let touchStartX = 0
      let touchStartY = 0

      clusterElement.addEventListener('touchstart', (e: TouchEvent) => {
        e.preventDefault() // Prevent map gestures
        touchStartTime = Date.now()
        const touch = e.touches[0]
        touchStartX = touch.clientX
        touchStartY = touch.clientY

        // Apply hover effect
        clusterElement.style.transform = 'scale(1.06)'
        clusterElement.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.18)'
      }, { passive: false })

      clusterElement.addEventListener('touchend', (e: TouchEvent) => {
        e.preventDefault() // Prevent map gestures
        const touchEndTime = Date.now()
        const touchDuration = touchEndTime - touchStartTime

        // Reset hover effect
        clusterElement.style.transform = 'scale(1)'
        clusterElement.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.12)'

        // Only trigger click if touch duration is short and minimal movement
        if (touchDuration < 300) {
          const touch = e.changedTouches[0]
          const deltaX = Math.abs(touch.clientX - touchStartX)
          const deltaY = Math.abs(touch.clientY - touchStartY)

          if (deltaX < 10 && deltaY < 10) {
            // Trigger the cluster click
            google.maps.event.trigger(marker, 'click')
          }
        }
      }, { passive: false })

      // Handle touch cancel
      clusterElement.addEventListener('touchcancel', () => {
        clusterElement.style.transform = 'scale(1)'
        clusterElement.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.12)'
      }, { passive: false })
    } else {
      // Desktop: Use mouse events
      clusterElement.addEventListener('mouseenter', () => {
        clusterElement.style.transform = 'scale(1.06)'
        clusterElement.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.18)'
      })

      clusterElement.addEventListener('mouseleave', () => {
        clusterElement.style.transform = 'scale(1)'
        clusterElement.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.12)'
      })
    }
  }


}
