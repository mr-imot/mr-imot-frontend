// Shared Google Maps loader to prevent multiple initializations across pages
// Uses a singleton Loader instance and exposes a helper to ensure Maps is loaded

import { Loader } from "@googlemaps/js-api-loader"

let loaderSingleton: Loader | null = null
let loadPromise: Promise<typeof google> | null = null

export async function ensureGoogleMaps(): Promise<typeof google> {
  if (typeof window === "undefined") {
    throw new Error("Google Maps can only be loaded in the browser")
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    throw new Error("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY")
  }

  if (!loaderSingleton) {
    loaderSingleton = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["places", "marker"], // Load Places API and Marker library for AdvancedMarkerElement
      language: "bg",
      region: "BG",
    })
  }

  if (!loadPromise) {
    loadPromise = loaderSingleton.load()
  }

  try {
    await loadPromise
    return window.google
  } catch (error) {
    console.error("Failed to load Google Maps:", error)
    throw error
  }
}

// Create house/apartment SVG icon for markers
export function createSvgHouseIcon(
  type: "house" | "apartment",
  state: "default" | "hovered" | "selected" = "default"
): google.maps.Icon {
  const fillColor = state === "default" ? "#FF385C" : "#E00B41"
  const strokeColor = "#FFFFFF"
  const size = state === "default" ? 32 : 36
  
  // House icon SVG path
  const houseIcon = `<path d="M12 2L2 8v13h7v-6h6v6h7V8L12 2zm0 2.5L18.5 9v10h-3v-6h-7v6h-3V9L12 4.5z" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1"/>`
  
  // Apartment building icon SVG path  
  const apartmentIcon = `<path d="M3 21h18V9l-9-7-9 7v12zm2-2V10l7-5.75L19 10v9h-4v-6h-6v6H5zm2-8h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-8 4h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1"/>`
  
  const iconPath = type === "house" ? houseIcon : apartmentIcon
  
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 24 24'>
    ${iconPath}
  </svg>`

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(size, size),
    anchor: new google.maps.Point(size / 2, size),
  }
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


