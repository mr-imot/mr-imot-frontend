// Marker management utilities for Airbnb-style maps
import { createPricePillElement, createSvgMarkerIcon, createSvgHouseIcon, createClusterMarkerIcon, clusterProperties, PropertyCluster } from './google-maps'
import { getDeviceType } from './device-detection'

export interface PropertyData {
  id: string
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
  rating: number
  reviews: number
  shortPrice: string
}

export interface MarkerManagerConfig {
  maps: google.maps.Map[]
  properties: PropertyData[]
  onPropertySelect: (propertyId: string | null) => void
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
  private markerStates: Record<string, "default" | "hovered" | "selected"> = {} // Track current state of each marker
  private clusters: PropertyCluster[] = []
  private markerCache: Record<string, google.maps.marker.AdvancedMarkerElement> = {}
  private isInitialized: boolean = false

  constructor(config: MarkerManagerConfig) {
    this.config = config
    

  }

  // Main method to render all markers with clustering
  renderMarkers() {
    // Always re-render when called (for map switching)
    this.clearAllMarkers()
    this.isInitialized = false

    if (this.isInitialized) {
      return
    }

    this.clearAllMarkers()

    // Get zoom from the first available map
    const currentZoom = this.config.maps[0]?.getZoom() || 10
    const shouldCluster = currentZoom < 12 && this.config.properties.length > 3

    if (shouldCluster) {
      this.renderClustered()
    } else {
      this.renderIndividual()
    }

    this.isInitialized = true
  }

  // Update marker states based on hover/selection (unified approach)
  updateMarkerStates() {
    Object.entries(this.markerContents).forEach(([propertyId, markerContent]) => {
      if (markerContent) {
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

          // Update z-index
          const marker = this.markers[propertyId]
          if (marker) {
            marker.zIndex = newZIndex
          }

          // Update SVG colors directly
          const svg = markerContent.querySelector('svg')
          if (svg) {
            const paths = svg.querySelectorAll('path, polyline')

            if (newState === "hovered" || newState === "selected") {
              // Hovered/Selected: Black house with white lines
              paths.forEach(path => {
                if (path.getAttribute('fill') !== 'none') {
                  path.setAttribute('fill', '#000000') // Black house
                }
                path.setAttribute('stroke', '#FFFFFF') // White lines
              })
            } else {
              // Default: White house with black lines
              paths.forEach(path => {
                if (path.getAttribute('fill') !== 'none') {
                  path.setAttribute('fill', '#FFFFFF') // White house
                }
                path.setAttribute('stroke', '#000000') // Black lines
              })
            }

            // Apply CSS classes for scaling/shadow effects
            markerContent.className = `map-marker-icon map-marker-${newState}`
          }
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
  }

  // Check if markers already exist
  hasMarkers(): boolean {
    return Object.keys(this.markers).length > 0
  }

  // Update properties without recreating markers
  updateProperties(newProperties: PropertyData[]) {
    const newPropertyIds = new Set(newProperties.map(p => p.id))
    const currentPropertyIds = new Set(Object.keys(this.markers))
    
    // Remove markers for properties that are no longer in the list
    currentPropertyIds.forEach(id => {
      if (!newPropertyIds.has(id)) {
        this.removeMarker(id)
      }
    })
    
    // Add markers for new properties
    newProperties.forEach(property => {
      if (!this.markers[property.id]) {
        this.createSingleMarker(property)
      }
    })
    
    // Update marker states
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
    this.config.properties.forEach((property) => {
      this.createSingleMarker(property)
    })
  }

  private createSingleMarker(property: PropertyData) {
    if (typeof property.lat !== "number" || typeof property.lng !== "number") {
      return
    }

    // Check if marker is already cached
    if (this.markerCache[property.id]) {
      // For cached markers, we need to recreate them for each map
      // since AdvancedMarkerElement can only be on one map at a time
      const cachedMarker = this.markerCache[property.id]
      const originalElement = this.markerContents[property.id]
      
      if (originalElement) {
        // Create new markers for each map using the cached marker as reference
        this.config.maps.forEach((map, index) => {
          if (map) {
            const clonedElement = originalElement.cloneNode(true) as HTMLElement
            const marker = new google.maps.marker.AdvancedMarkerElement({
              position: { lat: property.lat, lng: property.lng },
              map: map,
              content: clonedElement,
              title: property.title,
              zIndex: 1,
            })
            
            // Add event listeners to the new marker
            this.addMarkerEventListeners(marker, property, clonedElement)
          }
        })
      }

      this.markers[property.id] = cachedMarker
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
    


    // Create separate markers for each map (AdvancedMarkerElement can only be on one map)
    const markers: google.maps.marker.AdvancedMarkerElement[] = []
    
    this.config.maps.forEach((map, index) => {
      if (map) {
        // Clone the marker element for each map
        const clonedElement = markerElement.cloneNode(true) as HTMLElement
        
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
    marker.addListener("click", () => {
      if (this.config.selectedPropertyId === property.id) {
        this.config.onPropertySelect(null)
        this.config.onAriaAnnouncement("Property details closed")
      } else {
        this.config.onPropertySelect(property.id)
        this.config.onAriaAnnouncement(`Selected property: ${property.title} - ${property.shortPrice || 'Contact for price'}`)

        // Airbnb-style: Only pan/zoom if marker is not visible in current viewport
        const bounds = this.config.maps[0]?.getBounds()
        if (bounds && this.config.maps[0]) {
          const markerLatLng = new google.maps.LatLng(property.lat, property.lng)
          const isVisible = bounds.contains(markerLatLng)
          const currentZoom = this.config.maps[0].getZoom() || 10

          // Only move map if marker is outside viewport OR zoom is too low
          if (!isVisible || currentZoom < 12) {
            const targetZoom = Math.max(currentZoom, 14)
            this.config.maps[0].panTo({ lat: property.lat, lng: property.lng })
            if (targetZoom > currentZoom) {
              this.config.maps[0].setZoom(targetZoom)
            }
          }
        }
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

    if (isTouchDevice) {
      // Touch device: Use touch events with preventDefault to avoid map gesture conflicts
      let touchStartTime = 0
      let touchStartX = 0
      let touchStartY = 0

      pillElement.addEventListener('touchstart', (e: TouchEvent) => {
        e.preventDefault() // Prevent map gestures
        touchStartTime = Date.now()
        const touch = e.touches[0]
        touchStartX = touch.clientX
        touchStartY = touch.clientY
        this.config.onPropertyHover(property.id)
      }, { passive: false })

      pillElement.addEventListener('touchend', (e: TouchEvent) => {
        e.preventDefault() // Prevent map gestures
        const touchEndTime = Date.now()
        const touchDuration = touchEndTime - touchStartTime

        // Only trigger click if touch duration is short (not a long press) and minimal movement
        if (touchDuration < 300) { // Less than 300ms
          const touch = e.changedTouches[0]
          const deltaX = Math.abs(touch.clientX - touchStartX)
          const deltaY = Math.abs(touch.clientY - touchStartY)

          if (deltaX < 10 && deltaY < 10) { // Minimal movement threshold
            // Trigger the marker click
            google.maps.event.trigger(marker, 'click')
          }
        }

        this.config.onPropertyHover(null)
      }, { passive: false })

      // Handle touch cancel (user moved finger away)
      pillElement.addEventListener('touchcancel', () => {
        this.config.onPropertyHover(null)
      }, { passive: false })
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
