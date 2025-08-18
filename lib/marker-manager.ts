// Marker management utilities for Airbnb-style maps
import { createSvgMarkerIcon, createClusterMarkerIcon, clusterProperties, PropertyCluster } from './google-maps'

export interface PropertyData {
  id: number
  title: string
  priceRange: string
  location: string
  image: string
  images?: string[]
  description: string
  lat: number
  lng: number
  type: "Apartment Complex" | "Residential Houses" | "Mixed-Use Building"
  status: string
  rating: number
  reviews: number
  shortPrice: string
}

export interface MarkerManagerConfig {
  map: google.maps.Map
  properties: PropertyData[]
  onPropertySelect: (propertyId: number | null) => void
  onPropertyHover: (propertyId: number | null) => void
  onAriaAnnouncement: (message: string) => void
  selectedPropertyId: number | null
  hoveredPropertyId: number | null
}

export class MarkerManager {
  private config: MarkerManagerConfig
  private markers: Record<number, google.maps.Marker> = {}
  private clusterMarkers: google.maps.Marker[] = []
  private markerTypes: Record<number, "house" | "apartment"> = {}
  private markerPrices: Record<number, string> = {}
  private clusters: PropertyCluster[] = []

  constructor(config: MarkerManagerConfig) {
    this.config = config
  }

  // Main method to render all markers with clustering
  renderMarkers() {
    this.clearAllMarkers()

    const currentZoom = this.config.map.getZoom() || 10
    const shouldCluster = currentZoom < 12 && this.config.properties.length > 3

    if (shouldCluster) {
      console.log('🎯 Using clustering at zoom level', currentZoom)
      this.renderClustered()
    } else {
      console.log('🎯 Not clustering - showing individual markers')
      this.renderIndividual()
    }

    console.log('✅ Created', Object.keys(this.markers).length, 'individual markers and', this.clusterMarkers.length, 'cluster markers')
  }

  // Update marker states based on hover/selection
  updateMarkerStates() {
    Object.entries(this.markers).forEach(([id, marker]) => {
      const propertyId = Number(id)
      const markerPrice = this.markerPrices[propertyId]
      if (markerPrice) {
        let state: "default" | "hovered" | "selected" = "default"
        
        if (this.config.selectedPropertyId === propertyId) {
          state = "selected"
        } else if (this.config.hoveredPropertyId === propertyId) {
          state = "hovered"
        }
        
        const icon = createSvgMarkerIcon(markerPrice, state)
        marker.setIcon(icon)
        marker.setZIndex(state === "selected" ? 999 : state === "hovered" ? 500 : 1)
      }
    })
  }

  // Get clusters for external use
  getClusters(): PropertyCluster[] {
    return this.clusters
  }

  // Get individual marker by property ID
  getMarker(propertyId: number): google.maps.Marker | null {
    return this.markers[propertyId] || null
  }

  // Clean up all markers
  cleanup() {
    this.clearAllMarkers()
  }

  private clearAllMarkers() {
    Object.values(this.markers).forEach((m) => m.setMap(null))
    this.clusterMarkers.forEach((m) => m.setMap(null))
    this.markers = {}
    this.clusterMarkers = []
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
      console.log('🚫 Skipping property due to invalid coordinates:', property.id)
      return
    }
    
    let marker: google.maps.Marker
    const markerType = property.type === "Residential Houses" ? "house" : "apartment"
    const markerPrice = property.shortPrice || "Request price"
    
    try {
      const markerIcon = createSvgMarkerIcon(markerPrice, "default")
      
      marker = new google.maps.Marker({
        position: { lat: property.lat, lng: property.lng },
        map: this.config.map,
        icon: markerIcon,
        zIndex: 1,
        title: property.title,
      })
    } catch (error) {
      console.error('❌ Error creating custom marker:', error)
      // Fallback: create basic marker without custom icon
      marker = new google.maps.Marker({
        position: { lat: property.lat, lng: property.lng },
        map: this.config.map,
        zIndex: 1,
        title: property.title,
      })
    }
    
    this.markers[property.id] = marker
    this.markerTypes[property.id] = markerType
    this.markerPrices[property.id] = markerPrice

    this.addMarkerEventListeners(marker, property)
  }

  private createClusterMarker(cluster: PropertyCluster, clusterIndex: number) {
    const count = cluster.properties.length
    const clusterIcon = createClusterMarkerIcon(count, "default")
    
    const marker = new google.maps.Marker({
      position: { lat: cluster.lat, lng: cluster.lng },
      map: this.config.map,
      icon: clusterIcon,
      zIndex: 100,
      title: `${count} properties`,
    })
    
    this.clusterMarkers.push(marker)
    this.addClusterEventListeners(marker, cluster, count)
  }

  private addMarkerEventListeners(marker: google.maps.Marker, property: PropertyData) {
    // Add accessibility attributes
    marker.set('aria-label', `Property: ${property.title} - ${property.shortPrice || 'Request price'}`)
    marker.set('role', 'button')
    marker.set('tabindex', '0')
    
    // Click marker to select/deselect
    marker.addListener("click", () => {
      if (this.config.selectedPropertyId === property.id) {
        this.config.onPropertySelect(null)
        this.config.onAriaAnnouncement("Property details closed")
      } else {
        this.config.onPropertySelect(property.id)
        this.config.onAriaAnnouncement(`Selected property: ${property.title} - ${property.shortPrice || 'Request price'}`)
      }
    })
    
    // Add keyboard support
    const markerElement = marker.get('element')
    if (markerElement) {
      markerElement.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          marker.trigger('click')
        }
      })
    }

    // Hover events
    marker.addListener("mouseover", () => this.config.onPropertyHover(property.id))
    marker.addListener("mouseout", () => this.config.onPropertyHover(null))
  }

  private addClusterEventListeners(marker: google.maps.Marker, cluster: PropertyCluster, count: number) {
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
          console.log('🔍 Zoomed in enough to show individual markers')
        }
      }, 500)
    })
    
    // Add keyboard support
    const clusterElement = marker.get('element')
    if (clusterElement) {
      clusterElement.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          marker.trigger('click')
        }
      })
    }
    
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
