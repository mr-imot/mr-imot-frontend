"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, Search, X } from "lucide-react"
import { ensureGoogleMaps, ensurePlacesLibrary } from "@/lib/google-maps"
import { cn } from "@/lib/utils"

type NormalizedPrediction = {
  placeId: string
  mainText: string
  secondaryText?: string
  description: string
}

export interface AddressSearchFieldProps {
  value: string
  onChange: (value: string) => void
  onSelect: (payload: { lat: number; lng: number; address: string; placeId?: string }) => void
  placeholder?: string
  regionCodes?: string[] // Optional: if not provided, no country restriction
  className?: string
  inputClassName?: string
  onBlur?: (value: string) => void
}

export function AddressSearchField({
  value,
  onChange,
  onSelect,
  placeholder = "Search address...",
  regionCodes, // No default - allows all countries
  className,
  inputClassName,
  onBlur,
}: AddressSearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [predictions, setPredictions] = useState<NormalizedPrediction[]>([])
  const [predictionsVersion, setPredictionsVersion] = useState(0)
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null)
  const autocompleteSuggestionRef = useRef<typeof google.maps.places.AutocompleteSuggestion | null>(null)
  const placesLibraryRef = useRef<google.maps.PlacesLibrary | null>(null)

  const getPlacesLibrary = async () => {
    if (!placesLibraryRef.current) {
      placesLibraryRef.current = await ensurePlacesLibrary()
    }
    return placesLibraryRef.current
  }

  // Init library + session token
  useEffect(() => {
    const init = async () => {
      try {
        await ensureGoogleMaps()
        await getPlacesLibrary()
        if (!autocompleteSuggestionRef.current) {
          autocompleteSuggestionRef.current = google.maps.places.AutocompleteSuggestion
        }
        if (!sessionTokenRef.current) {
          sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken()
        }
      } catch (e) {
        console.error("Failed to init places autocomplete", e)
      }
    }
    init()
  }, [])

  // Simple debounce
  const debounce = <T extends (...args: any[]) => void>(fn: T, wait: number) => {
    let t: any
    return (...args: any[]) => {
      clearTimeout(t)
      t = setTimeout(() => fn(...args), wait)
    }
  }

  const fetchPredictions = useRef(
    debounce(async (query: string) => {
      if (!query || !autocompleteSuggestionRef.current) return
      try {
        if (!sessionTokenRef.current) {
          sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken()
        }
        const { suggestions = [] } = await autocompleteSuggestionRef.current.fetchAutocompleteSuggestions({
          input: query,
          ...(regionCodes && regionCodes.length > 0 ? { includedRegionCodes: regionCodes } : {}),
          sessionToken: sessionTokenRef.current,
        })
        const normalized = suggestions
          .map((s: any) => s.placePrediction)
          .filter(Boolean)
          .map((p: any) => ({
            placeId: p.placeId || p.place_id,
            mainText: p.text?.text || p.structuredFormat?.mainText?.text || p.structured_formatting?.main_text || "",
            secondaryText:
              p.secondaryText?.text || p.structuredFormat?.secondaryText?.text || p.structured_formatting?.secondary_text,
            description: p.text?.text || p.structuredFormat?.mainText?.text || p.description || "",
          }))
        setPredictions(normalized)
        setPredictionsVersion((v) => v + 1)
      } catch (error) {
        console.error("Failed to fetch autocomplete suggestions", error)
      }
    }, 200)
  ).current

  // Close dropdown on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsExpanded(false)
      }
    }
    if (isExpanded) {
      document.addEventListener("mousedown", onClick)
    }
    return () => document.removeEventListener("mousedown", onClick)
  }, [isExpanded, predictionsVersion])

  const handleSelect = async (prediction: NormalizedPrediction) => {
    try {
      const placesLibrary = await getPlacesLibrary()
      const place = new placesLibrary.Place({ id: prediction.placeId })
      await place.fetchFields({
        fields: ["displayName", "location", "formattedAddress"],
        sessionToken: sessionTokenRef.current || undefined,
      } as any)

      const location = place.location
      if (!location) return
      const lat = (typeof location.lat === "function" ? location.lat() : location.lat) as number
      const lng = (typeof location.lng === "function" ? location.lng() : location.lng) as number
      const address = (place as any).formattedAddress || (place as any).displayName?.text || prediction.description

      onChange(address)
      onSelect({ lat, lng, address, placeId: prediction.placeId })
      setIsExpanded(false)
      setPredictions([])
      sessionTokenRef.current = null // end session
    } catch (error) {
      console.error("Failed to fetch place details", error)
    }
  }

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "relative flex items-center bg-white rounded-full shadow-md transition-all duration-200",
          isExpanded ? "ring-2 ring-gray-900" : "hover:shadow-lg"
        )}
      >
        <div className="absolute left-4 pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onFocus={() => setIsExpanded(true)}
          onChange={(e) => {
            onChange(e.target.value)
            setIsExpanded(true)
            fetchPredictions(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              if (predictions[0]) {
                handleSelect(predictions[0])
              }
            }
          }}
          onBlur={() => {
            if (onBlur && value) {
              onBlur(value)
            }
          }}
          placeholder={placeholder}
          className={cn(
            "w-full pl-12 pr-12 py-3 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-900 placeholder-gray-400 text-sm font-medium rounded-full",
            inputClassName
          )}
          autoComplete="street-address"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("")
              setPredictions([])
              setPredictionsVersion((v) => v + 1)
            }}
            className="absolute right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {isExpanded && predictions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl max-h-[320px] overflow-y-auto z-50 border border-gray-100"
        >
          {predictions.map((p) => (
            <button
              key={p.placeId}
              type="button"
              onClick={() => handleSelect(p)}
              className="w-full flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                <MapPin className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900">{p.mainText || p.description}</p>
                {p.secondaryText && <p className="text-xs text-gray-500">{p.secondaryText}</p>}
              </div>
            </button>
          ))}
          <div className="px-5 py-2 text-right">
            <span className="text-[10px] uppercase tracking-wider text-gray-400">powered by Google</span>
          </div>
        </div>
      )}
    </div>
  )
}
