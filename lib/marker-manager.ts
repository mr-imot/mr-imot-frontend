// Marker management utilities for Airbnb-style maps
import { createPricePillElement, createSvgMarkerIcon, createSvgHouseIcon, createClusterMarkerIcon, clusterProperties, PropertyCluster } from './google-maps'

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
  map: google.maps.Map
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
  private clusters: PropertyCluster[] = []
  private markerCache: Record<string, google.maps.marker.AdvancedMarkerElement | google.maps.Marker> = {}
  private isInitialized: boolean = false

  constructor(config: MarkerManagerConfig) {
    this.config = config
  }

  // Main method to render all markers with clustering
  renderMarkers() {
    // Only render if not initialized yet
    if (this.isInitialized) {
      return
    }

    this.clearAllMarkers()

    const currentZoom = this.config.map.getZoom() || 10
    const shouldCluster = currentZoom < 12 && this.config.properties.length > 3

    if (shouldCluster) {
      this.renderClustered()
    } else {
      this.renderIndividual()
    }

    this.isInitialized = true
  }

  // Update marker states based on hover/selection
  updateMarkerStates() {
    Object.entries(this.markers).forEach(([id, marker]) => {
      const propertyId = Number(id)
      const pillElement = this.markerElements[propertyId]
      
      if (pillElement) {
        // Remove all state classes
        pillElement.classList.remove('map-price-pill--active')
        
        // Add appropriate state class
        if (this.config.selectedPropertyId === propertyId) {
          pillElement.classList.add('map-price-pill--active')
          marker.zIndex = 999
        } else if (this.config.hoveredPropertyId === propertyId) {
          // Hover state is handled by CSS :hover
          marker.zIndex = 500
        } else {
          marker.zIndex = 1
        }
      } else {
        // Update house/apartment icon markers based on state
        if ('setIcon' in marker) {
          let state: "default" | "hovered" | "selected" = "default"
          
          if (this.config.selectedPropertyId === propertyId) {
            state = "selected"
          } else if (this.config.hoveredPropertyId === propertyId) {
            state = "hovered"
          }
          
          // Find the property to get its type
          const property = this.config.properties.find(p => p.id === propertyId)
          if (property) {
            const iconType = property.type === "Residential Houses" ? "house" : "apartment"
            const icon = createSvgHouseIcon(iconType, state)
            ;(marker as any).setIcon(icon)
            ;(marker as any).setZIndex(state === "selected" ? 999 : state === "hovered" ? 500 : 1)
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
  getMarker(propertyId: string): google.maps.marker.AdvancedMarkerElement | google.maps.Marker | null {
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
    }
  }

  // Update configuration without recreating manager
  updateConfig(config: Partial<MarkerManagerConfig>) {
    this.config = { ...this.config, ...config }
  }

  private clearAllMarkers() {
    Object.values(this.markers).forEach((m) => {
      if ('setMap' in m) {
        m.setMap(null) // Legacy Marker
      } else {
        m.map = null // AdvancedMarkerElement
      }
    })
    this.clusterMarkers.forEach((m) => {
      if ('setMap' in m) {
        m.setMap(null) // Legacy Marker
      } else {
        m.map = null // AdvancedMarkerElement
      }
    })
    this.markers = {}
    this.clusterMarkers = []
    this.markerElements = {}
    // Note: We preserve markerCache for reuse
  }

  private renderClustered() {
    const clusters = clusterProperties(this.config.properties, this.config.map)
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
      const cachedMarker = this.markerCache[property.id]
      if ('setMap' in cachedMarker) {
        cachedMarker.setMap(this.config.map)
      } else {
        cachedMarker.map = this.config.map
      }
      this.markers[property.id] = cachedMarker
      return
    }
    
    // Use house icon for houses, building icon for apartments
    const iconType = property.type === "Residential Houses" ? "house" : "apartment"
    const markerIcon = createSvgHouseIcon(iconType, "default")
    
    const marker = new google.maps.Marker({
      position: { lat: property.lat, lng: property.lng },
      map: this.config.map,
      icon: markerIcon,
      title: property.title,
      zIndex: 1,
    })
    
    // Cache the marker for future use
    this.markerCache[property.id] = marker
    this.markers[property.id] = marker
    this.addLegacyMarkerEventListeners(marker, property)
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
        map: this.config.map,
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
      const fallbackMarker = new google.maps.Marker({
        position: { lat: cluster.lat, lng: cluster.lng },
        map: this.config.map,
        icon: clusterIcon,
        zIndex: 100,
        title: `${count} properties`,
      }) as any
      
      this.clusterMarkers.push(fallbackMarker)
      this.addLegacyClusterEventListeners(fallbackMarker, cluster, count)
    }
  }

  private addMarkerEventListeners(marker: google.maps.marker.AdvancedMarkerElement, property: PropertyData, pillElement: HTMLElement) {
    // Add accessibility attributes to the pill element
    pillElement.setAttribute('aria-label', `Property: ${property.title} - ${property.shortPrice || 'Contact for price'}`)
    
    // Click marker to select/deselect
    marker.addListener("click", () => {
      if (this.config.selectedPropertyId === property.id) {
        this.config.onPropertySelect(null)
        this.config.onAriaAnnouncement("Property details closed")
      } else {
        this.config.onPropertySelect(property.id)
        this.config.onAriaAnnouncement(`Selected property: ${property.title} - ${property.shortPrice || 'Contact for price'}`)
        
        // Airbnb-style: Only pan/zoom if marker is not visible in current viewport
        const bounds = this.config.map.getBounds()
        if (bounds) {
          const markerLatLng = new google.maps.LatLng(property.lat, property.lng)
          const isVisible = bounds.contains(markerLatLng)
          const currentZoom = this.config.map.getZoom() || 10
          
          // Only move map if marker is outside viewport OR zoom is too low
          if (!isVisible || currentZoom < 12) {
            const targetZoom = Math.max(currentZoom, 14)
            this.config.map.panTo({ lat: property.lat, lng: property.lng })
            if (targetZoom > currentZoom) {
              this.config.map.setZoom(targetZoom)
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

    // Hover events on pill element (CSS handles visual effects)
    pillElement.addEventListener('mouseenter', () => {
      this.config.onPropertyHover(property.id)
    })
    
    pillElement.addEventListener('mouseleave', () => {
      this.config.onPropertyHover(null)
    })
  }

  // Legacy fallback for old Marker API
  private addLegacyMarkerEventListeners(marker: google.maps.Marker, property: PropertyData) {
    // Add accessibility attributes
    marker.set('aria-label', `Property: ${property.title} - ${property.shortPrice || 'Contact for price'}`)
    marker.set('role', 'button')
    marker.set('tabindex', '0')
    
    // Click marker to select/deselect
    marker.addListener("click", () => {
      if (this.config.selectedPropertyId === property.id) {
        this.config.onPropertySelect(null)
        this.config.onAriaAnnouncement("Property details closed")
      } else {
        this.config.onPropertySelect(property.id)
        this.config.onAriaAnnouncement(`Selected property: ${property.title} - ${property.shortPrice || 'Contact for price'}`)
        
        // Airbnb-style: Only pan/zoom if marker is not visible in current viewport
        const bounds = this.config.map.getBounds()
        if (bounds) {
          const markerLatLng = new google.maps.LatLng(property.lat, property.lng)
          const isVisible = bounds.contains(markerLatLng)
          const currentZoom = this.config.map.getZoom() || 10
          
          // Only move map if marker is outside viewport OR zoom is too low
          if (!isVisible || currentZoom < 12) {
            const targetZoom = Math.max(currentZoom, 14)
            this.config.map.panTo({ lat: property.lat, lng: property.lng })
            if (targetZoom > currentZoom) {
              this.config.map.setZoom(targetZoom)
            }
          }
        }
      }
    })
    
    // Hover events with debouncing to prevent jittery behavior
    let hoverTimeout: NodeJS.Timeout | null = null
    
    marker.addListener("mouseover", () => {
      if (hoverTimeout) clearTimeout(hoverTimeout)
      hoverTimeout = setTimeout(() => {
        this.config.onPropertyHover(property.id)
      }, 50) // Small delay to prevent jitter
    })
    
    marker.addListener("mouseout", () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout)
        hoverTimeout = null
      }
      setTimeout(() => {
        this.config.onPropertyHover(null)
      }, 50)
    })
  }

  private addClusterEventListeners(marker: google.maps.marker.AdvancedMarkerElement, cluster: PropertyCluster, count: number, clusterElement: HTMLElement) {
    // Add accessibility attributes to the cluster element
    clusterElement.setAttribute('aria-label', `Cluster of ${count} properties. Click to zoom in and expand.`)
    
    // Click cluster to zoom in
    marker.addListener("click", () => {
      this.config.map.fitBounds(cluster.bounds)
      this.config.onAriaAnnouncement(`Expanded cluster of ${count} properties. Zooming to show individual listings.`)
      setTimeout(() => {
        const newZoom = this.config.map.getZoom() || 10
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
    
    // Hover effects on cluster element (CSS handles visual effects)
    clusterElement.addEventListener('mouseenter', () => {
      clusterElement.style.transform = 'scale(1.06)'
      clusterElement.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.18)'
    })
    
    clusterElement.addEventListener('mouseleave', () => {
      clusterElement.style.transform = 'scale(1)'
      clusterElement.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.12)'
    })
  }

  // Legacy fallback for old Marker API clusters
  private addLegacyClusterEventListeners(marker: google.maps.Marker, cluster: PropertyCluster, count: number) {
    // Add accessibility attributes
    marker.set('aria-label', `Cluster of ${count} properties. Click to zoom in and expand.`)
    marker.set('role', 'button')
    marker.set('tabindex', '0')
    
    // Click cluster to zoom in
    marker.addListener("click", () => {
      this.config.map.fitBounds(cluster.bounds)
      this.config.onAriaAnnouncement(`Expanded cluster of ${count} properties. Zooming to show individual listings.`)
      setTimeout(() => {
        const newZoom = this.config.map.getZoom() || 10
        if (newZoom >= 12) {
          // console.log('🔍 Zoomed in enough to show individual markers')
        }
      }, 500)
    })
    
    // Hover effects
    marker.addListener("mouseover", () => {
      const hoverIcon = createClusterMarkerIcon(count, "hovered")
      marker.setIcon(hoverIcon)
    })
    
    marker.addListener("mouseout", () => {
      const defaultIcon = createClusterMarkerIcon(count, "default")
      marker.setIcon(defaultIcon)
    })
  }
}
