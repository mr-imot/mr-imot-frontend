"use client"

import { useEffect, useRef, useState } from "react"
import { Search, X } from "lucide-react"
import { ensureGoogleMaps } from "@/lib/google-maps"

interface LocationSearchProps {
  onPlaceSelected: (place: google.maps.places.PlaceResult) => void
  placeholder?: string
  defaultValue?: string
}

export function LocationSearch({ onPlaceSelected, placeholder = "Search location...", defaultValue = "" }: LocationSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState(defaultValue)
  const [isFocused, setIsFocused] = useState(false)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  useEffect(() => {
    const initAutocomplete = async () => {
      if (!inputRef.current) return
      
      try {
        await ensureGoogleMaps()
        
        // Initialize autocomplete with Bulgaria bias
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['(cities)'],
          componentRestrictions: { country: 'bg' }, // Restrict to Bulgaria
          fields: ['name', 'geometry', 'formatted_address', 'place_id']
        })
        
        // Listen for place selection
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace()
          if (place && place.geometry) {
            onPlaceSelected(place)
            setValue(place.name || place.formatted_address || '')
            inputRef.current?.blur() // Close keyboard on mobile
          }
        })
      } catch (error) {
        console.error('Failed to initialize Google Places:', error)
      }
    }
    
    initAutocomplete()
    
    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [onPlaceSelected])

  const handleClear = () => {
    setValue('')
    if (inputRef.current) {
      inputRef.current.value = ''
      inputRef.current.focus()
    }
  }

  return (
    <div className={`relative flex items-center bg-white rounded-full shadow-lg transition-all duration-200 ${
      isFocused ? 'ring-2 ring-blue-500 shadow-xl' : ''
    }`}>
      <div className="absolute left-4 pointer-events-none">
        <Search className="w-5 h-5 text-gray-400" />
      </div>
      
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        placeholder={placeholder}
        className="w-full pl-12 pr-12 py-3 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-900 placeholder-gray-400 text-base font-medium"
      />
      
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
          type="button"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      )}
    </div>
  )
}

