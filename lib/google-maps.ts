// Shared Google Maps loader to prevent multiple initializations across pages
// Uses a singleton Loader instance and exposes a helper to ensure Maps is loaded

import { setOptions, importLibrary } from "@googlemaps/js-api-loader"

let isInitialized = false
let loadPromise: Promise<typeof google> | null = null

export async function ensureGoogleMaps(): Promise<typeof google> {
  if (typeof window === "undefined") {
    throw new Error("Google Maps can only be loaded in the browser")
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    throw new Error("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY")
  }

  if (!isInitialized) {
    setOptions({
      key: apiKey,
      v: "weekly",
      libraries: ["places", "marker"], // Load Places API and Marker library for AdvancedMarkerElement
      language: "bg",
      region: "BG",
    })
    isInitialized = true
  }

  if (!loadPromise) {
    // Load both maps and marker libraries since we use AdvancedMarkerElement
    loadPromise = Promise.all([
      importLibrary("maps"),
      importLibrary("marker")
    ]).then(() => window.google)
  }

  try {
    await loadPromise
    return window.google
  } catch (error) {
    console.error("Failed to load Google Maps:", error)
    throw error
  }
}

// Create house/apartment SVG icon for markers with white fill and black outlines
export function createSvgHouseIcon(
  type: "house" | "apartment",
  state: "default" | "hovered" | "selected" = "default"
): string {
  // White fill with black outlines for default, black fill with black outlines for hover
  const fillColor = state === "hovered" ? "#000000" : "#FFFFFF"
  const strokeColor = "#000000" // Always black outlines
  const size = 24 // Fixed size for cleaner look

  // House icon SVG path (matches Lucide Home icon used in property type buttons)
  const houseIcon = `<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1.5"/>
    <polyline points="9,22 9,12 15,12 15,22" fill="none" stroke="${strokeColor}" stroke-width="1.5"/>`

  // Apartment/Building icon SVG path - clean minimal design matching house icon style
  const apartmentIcon = `<rect x="6" y="4" width="12" height="18" rx="1" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1.5"/>
    <rect x="8" y="7" width="2" height="2" fill="${strokeColor}" opacity="0.7"/>
    <rect x="11" y="7" width="2" height="2" fill="${strokeColor}" opacity="0.7"/>
    <rect x="14" y="7" width="2" height="2" fill="${strokeColor}" opacity="0.7"/>
    <rect x="8" y="11" width="2" height="2" fill="${strokeColor}" opacity="0.7"/>
    <rect x="11" y="11" width="2" height="2" fill="${strokeColor}" opacity="0.7"/>
    <rect x="14" y="11" width="2" height="2" fill="${strokeColor}" opacity="0.7"/>
    <rect x="8" y="15" width="2" height="2" fill="${strokeColor}" opacity="0.7"/>
    <rect x="11" y="15" width="2" height="2" fill="${strokeColor}" opacity="0.7"/>
    <rect x="14" y="15" width="2" height="2" fill="${strokeColor}" opacity="0.7"/>`

  const iconPath = type === "house" ? houseIcon : apartmentIcon

  // Simple SVG with white fill and black outlines
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 24 24' fill="none">
    ${iconPath}
  </svg>`
}

// Create HTML price pill element for AdvancedMarkerElement (kept for compatibility)
export function createPricePillElement(price: string): HTMLElement {
  const pill = document.createElement('div')
  pill.className = 'map-price-pill'
  pill.textContent = price
  pill.setAttribute('role', 'button')
  pill.setAttribute('tabindex', '0')
  
  return pill
}

// Legacy SVG marker (kept for backward compatibility)
export function createSvgMarkerIcon(
  price: string,
  state: "default" | "hovered" | "selected" = "default"
): google.maps.Icon {
  // Airbnb-like color scheme
  const fillColor = state === "default" ? "#FFFFFF" : "var(--brand, #FF385C)"
  const textColor = state === "default" ? "var(--ink, #111111)" : "#FFFFFF"
  const strokeColor = state === "default" ? "var(--ink, #111111)" : "var(--brand, #FF385C)"

  // Slight zoom on hovered/selected
  const baseScale = state === "default" ? 1 : 1.1
  
  // Airbnb-exact dimensions and proportions
  const textLength = price.length
  const minWidth = 64 // Slightly larger minimum for better readability
  const maxWidth = 140 // Accommodate longer prices and fallback symbols
  const charWidth = 7.5 // Optimized for the system font
  const padding = 24 // More breathing room like Airbnb
  const calculatedWidth = Math.min(maxWidth, Math.max(minWidth, textLength * charWidth + padding))
  
  const width = Math.round(calculatedWidth * baseScale)
  const height = Math.round(34 * baseScale) // Slightly taller for better proportion
  const rx = Math.round(17 * baseScale) // Perfectly rounded like Airbnb pills

  // Text positioning (Airbnb-optimized)
  const fontSize = Math.round(13 * baseScale) // Slightly larger for better readability
  const textX = width / 2
  const textY = height / 2 + fontSize / 3.5 // Better vertical centering

  // Shadow configuration based on state
  const shadowConfig = {
    default: { dy: "1", blur: "2", opacity: "0.1" },
    hovered: { dy: "2", blur: "4", opacity: "0.15" },
    selected: { dy: "4", blur: "8", opacity: "0.25" }
  }
  const shadow = shadowConfig[state]

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'>
    <defs>
      <filter id="shadow-${state}" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="${shadow.dy}" stdDeviation="${shadow.blur}" flood-color="rgba(0,0,0,${shadow.opacity})"/>
      </filter>
    </defs>
    <rect rx='${rx}' ry='${rx}' width='${width}' height='${height}' 
          fill='${fillColor}' stroke='${strokeColor}' stroke-width='${state === "default" ? "1" : "0"}' 
          filter="url(#shadow-${state})"/>
    <text x='${textX}' y='${textY}' text-anchor='middle' 
          font-family='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' 
          font-size='${fontSize}' font-weight='600' fill='${textColor}'>${price}</text>
  </svg>`

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(width, height),
    anchor: new google.maps.Point(width / 2, height / 2),
  }
}

// Simple clustering utility for markers
export interface PropertyCluster {
  lat: number
  lng: number
  properties: any[]
  bounds: google.maps.LatLngBounds
}

export function clusterProperties(
  properties: any[], 
  map: google.maps.Map, 
  minDistance: number = 50 // pixels
): PropertyCluster[] {
  if (!properties.length) return []
  
  const clusters: PropertyCluster[] = []
  const processed = new Set<number>()
  
  for (let i = 0; i < properties.length; i++) {
    if (processed.has(i)) continue
    
    const property = properties[i]
    if (typeof property.lat !== 'number' || typeof property.lng !== 'number') continue
    
    const cluster: PropertyCluster = {
      lat: property.lat,
      lng: property.lng,
      properties: [property],
      bounds: new google.maps.LatLngBounds()
    }
    
    cluster.bounds.extend(new google.maps.LatLng(property.lat, property.lng))
    processed.add(i)
    
    // Find nearby properties to cluster
    for (let j = i + 1; j < properties.length; j++) {
      if (processed.has(j)) continue
      
      const other = properties[j]
      if (typeof other.lat !== 'number' || typeof other.lng !== 'number') continue
      
      // Convert lat/lng to pixel distance
      const point1 = map.getProjection()?.fromLatLngToPoint(new google.maps.LatLng(property.lat, property.lng))
      const point2 = map.getProjection()?.fromLatLngToPoint(new google.maps.LatLng(other.lat, other.lng))
      
      if (point1 && point2) {
        const zoom = map.getZoom() || 10
        const scale = Math.pow(2, zoom)
        const pixelDistance = Math.sqrt(
          Math.pow((point1.x - point2.x) * scale, 2) + 
          Math.pow((point1.y - point2.y) * scale, 2)
        )
        
        if (pixelDistance < minDistance) {
          cluster.properties.push(other)
          cluster.bounds.extend(new google.maps.LatLng(other.lat, other.lng))
          processed.add(j)
        }
      }
    }
    
    // Update cluster center to bounds center
    const center = cluster.bounds.getCenter()
    cluster.lat = center.lat()
    cluster.lng = center.lng()
    
    clusters.push(cluster)
  }
  
  return clusters
}

// Create cluster marker
export function createClusterMarkerIcon(
  count: number,
  state: "default" | "hovered" | "selected" = "default"
): google.maps.Icon {
  const baseScale = state === "default" ? 1 : 1.1
  const size = count > 10 ? 50 : count > 5 ? 44 : 38
  const width = Math.round(size * baseScale)
  const height = Math.round(size * baseScale)
  
  const fillColor = state === "default" ? "var(--brand, #FF385C)" : "var(--brand, #E00B41)"
  const textColor = "#FFFFFF"
  
  const fontSize = Math.round((size > 44 ? 14 : 12) * baseScale)
  
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'>
    <defs>
      <filter id="cluster-shadow-${state}" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="rgba(0,0,0,0.2)"/>
      </filter>
    </defs>
    <circle cx='${width/2}' cy='${height/2}' r='${width/2-1}' 
            fill='${fillColor}' stroke='white' stroke-width='2' 
            filter="url(#cluster-shadow-${state})"/>
    <text x='${width/2}' y='${height/2 + fontSize/3}' text-anchor='middle' 
          font-family='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' 
          font-size='${fontSize}' font-weight='700' fill='${textColor}'>${count}</text>
  </svg>`

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(width, height),
    anchor: new google.maps.Point(width / 2, height / 2),
  }
}


