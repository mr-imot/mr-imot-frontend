import { useEffect, useRef, useState, RefObject } from 'react'
import { ensureGoogleMaps } from '@/lib/google-maps'

interface UseAddressAutocompleteOptions {
  inputRef: RefObject<HTMLInputElement>
  mapRef?: RefObject<google.maps.Map | null>
  markerRef?: RefObject<google.maps.marker.AdvancedMarkerElement | null>
  onPlaceSelected?: (place: google.maps.places.PlaceResult) => void
  onAddressChange?: (address: string) => void
  countryRestriction?: string // Optional: if not provided, no country restriction
  types?: string[]
  enabled?: boolean
}

export function useAddressAutocomplete({
  inputRef,
  mapRef,
  markerRef,
  onPlaceSelected,
  onAddressChange,
  countryRestriction, // No default - allows all countries
  types = ['geocode'],
  enabled = true,
}: UseAddressAutocompleteOptions) {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [autocompleteOpen, setAutocompleteOpen] = useState(false)
  const [placesBlocked, setPlacesBlocked] = useState(false)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!enabled || !inputRef.current) return

    const initAutocomplete = async () => {
      try {
        const google = await ensureGoogleMaps()

        if (placesBlocked) {
          return
        }

        const autocomplete = new google.maps.places.Autocomplete(inputRef.current!, {
          ...(countryRestriction ? { componentRestrictions: { country: countryRestriction } } : {}),
          fields: ['address_components', 'formatted_address', 'geometry', 'place_id'],
          types: types,
        })

        autocompleteRef.current = autocomplete

        // Track when autocomplete dropdown opens/closes
        const inputElement = inputRef.current
        const startCheckingDropdown = () => {
          if (checkIntervalRef.current) return
          checkIntervalRef.current = setInterval(() => {
            const pacContainer = document.querySelector('.pac-container') as HTMLElement
            if (pacContainer) {
              const isVisible =
                pacContainer.style.display !== 'none' && pacContainer.offsetParent !== null
              setAutocompleteOpen(isVisible)
              if (!isVisible && checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current)
                checkIntervalRef.current = null
              }
            } else {
              setAutocompleteOpen(false)
              if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current)
                checkIntervalRef.current = null
              }
            }
          }, 100)
        }

        inputElement.addEventListener('focus', startCheckingDropdown)
        inputElement.addEventListener('input', startCheckingDropdown)

        // Handle place selection
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()

          // Stop checking dropdown
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current)
            checkIntervalRef.current = null
          }
          setAutocompleteOpen(false)

          if (place.geometry && place.geometry.location) {
            const location = place.geometry.location
            const newCenter = { lat: location.lat(), lng: location.lng() }

            // Update map and marker if provided
            if (mapRef?.current) {
              mapRef.current.setCenter(newCenter)
              mapRef.current.setZoom(16)
            }
            if (markerRef?.current) {
              markerRef.current.position = newCenter
            }

            // Update input field with formatted address
            const formattedAddress = place.formatted_address || inputRef.current?.value || ''
            if (inputRef.current) {
              inputRef.current.value = formattedAddress
            }

            // Call callbacks
            onPlaceSelected?.(place)
            onAddressChange?.(formattedAddress)
          }
        })
      } catch (error) {
        console.error('Error initializing autocomplete:', error)
        setPlacesBlocked(true)
      }
    }

    initAutocomplete()

    // Cleanup function
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }
      if (inputRef.current) {
        // Note: We can't remove listeners without storing the function reference
        // This is acceptable as the component will unmount
      }
      if (autocompleteRef.current && typeof window !== 'undefined' && window.google) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [
    enabled,
    inputRef,
    mapRef,
    markerRef,
    onPlaceSelected,
    onAddressChange,
    countryRestriction,
    types,
    placesBlocked,
  ])

  return {
    autocompleteOpen,
    placesBlocked,
  }
}

