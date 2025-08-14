// Shared Google Maps loader to prevent multiple initializations across pages
// Uses a singleton Loader instance and exposes a helper to ensure Maps is loaded

import { Loader } from "@googlemaps/js-api-loader"

let loaderSingleton: Loader | null = null
let loadPromise: Promise<void> | null = null

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
      libraries: ["places"], // This loads the classic Places API for Maps
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


