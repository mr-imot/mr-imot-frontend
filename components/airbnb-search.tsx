"use client"

import { useEffect, useRef, useState } from "react"
import { Search, X, MapPin, Navigation, SlidersHorizontal } from "lucide-react"
import { ensureGoogleMaps } from "@/lib/google-maps"

interface CityOption {
  name: string
  nameEn: string
  subtitle: string
  lat: number
  lng: number
  zoom: number
  icon: string
}

const SUGGESTED_CITIES: CityOption[] = [
  {
    name: "София",
    nameEn: "Sofia",
    subtitle: "Столицата на България",
    lat: 42.6977,
    lng: 23.3219,
    zoom: 11,
    icon: "🏛️"
  },
  {
    name: "Пловдив",
    nameEn: "Plovdiv",
    subtitle: "Втори по големина град",
    lat: 42.1354,
    lng: 24.7453,
    zoom: 11,
    icon: "🏺"
  },
  {
    name: "Варна",
    nameEn: "Varna",
    subtitle: "Морската столица",
    lat: 43.2141,
    lng: 27.9147,
    zoom: 11,
    icon: "🏖️"
  },
  {
    name: "Бургас",
    nameEn: "Burgas",
    subtitle: "Черноморски град",
    lat: 42.5048,
    lng: 27.4626,
    zoom: 11,
    icon: "⛵"
  }
]

interface AirbnbSearchProps {
  onPlaceSelected: (place: { lat: number; lng: number; zoom: number; name: string }) => void
  onFilterClick: () => void
  placeholder?: string
  locale: 'en' | 'bg'
  defaultExpanded?: boolean
}

export function AirbnbSearch({
  onPlaceSelected,
  onFilterClick,
  placeholder = "Where?",
  locale,
  defaultExpanded
}: AirbnbSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [value, setValue] = useState("")
  const [isExpanded, setIsExpanded] = useState(!!defaultExpanded)
  const [isTyping, setIsTyping] = useState(false)
  const [filteredCities, setFilteredCities] = useState<CityOption[]>(SUGGESTED_CITIES)

  // Custom Places Autocomplete (no default widget)
  const predictionsRef = useRef<google.maps.places.AutocompletePrediction[]>([])
  const [predictionsVersion, setPredictionsVersion] = useState(0)
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null)
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null)

  function debounce<T extends (...args: any[]) => void>(fn: T, wait: number) {
    let t: any
    return ((...args: any[]) => {
      clearTimeout(t)
      t = setTimeout(() => fn(...args), wait)
    }) as T
  }

  // Handle geolocation
  const handleNearby = () => {
    if (!navigator.geolocation) {
      alert(locale === 'bg' ? 'Геолокацията не е поддържана от вашия браузър' : 'Geolocation not supported')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        onPlaceSelected({
          lat: latitude,
          lng: longitude,
          zoom: 13,
          name: locale === 'bg' ? 'Вашето местоположение' : 'Your location'
        })
        setValue(locale === 'bg' ? 'Наблизо' : 'Nearby')
        setIsExpanded(false)
      },
      (error) => {
        console.error('Geolocation error:', error)
        alert(locale === 'bg' ? 'Не може да се определи местоположението ви' : 'Unable to get your location')
      }
    )
  }

  // Initialize PlacesService and session token
  useEffect(() => {
    const init = async () => {
      try {
        await ensureGoogleMaps()
        if (!placesServiceRef.current) {
          placesServiceRef.current = new google.maps.places.PlacesService(document.createElement('div'))
        }
        sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken()
      } catch (e) {
        console.error('Failed to init Google Places:', e)
      }
    }
    init()
  }, [])

  const fetchPredictions = useRef(
    debounce((query: string) => {
      if (!query || !placesServiceRef.current) return
      const service = new google.maps.places.AutocompleteService()
      service.getPlacePredictions(
        {
          input: query,
          // Do not constrain to a single type to allow cities/regions/localities
          componentRestrictions: { country: ['bg'] },
          sessionToken: sessionTokenRef.current || undefined,
        },
        (preds) => {
          predictionsRef.current = preds || []
          setPredictionsVersion((v) => v + 1)
        }
      )
    }, 200)
  ).current

  // Handle input changes for filtering suggestions + predictions
  useEffect(() => {
    if (value.trim() === '') {
      setFilteredCities(SUGGESTED_CITIES)
      setIsTyping(false)
    } else {
      const searchValue = value.toLowerCase()
      const filtered = SUGGESTED_CITIES.filter(city => 
        city.name.toLowerCase().includes(searchValue) ||
        city.nameEn.toLowerCase().includes(searchValue)
      )
      setFilteredCities(filtered)
      setIsTyping(true)
      fetchPredictions(value)
    }
  }, [value])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false)
      }
    }

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isExpanded])

  const handleClear = () => {
    setValue('')
    setFilteredCities(SUGGESTED_CITIES)
    setIsTyping(false)
    // Clear Google predictions
    predictionsRef.current = []
    setPredictionsVersion((v) => v + 1)
    if (inputRef.current) {
      inputRef.current.focus()
      inputRef.current.value = ''
    }
  }

  const handleCitySelect = (city: CityOption) => {
    onPlaceSelected({
      lat: city.lat,
      lng: city.lng,
      zoom: city.zoom,
      name: city.name
    })
    setValue(city.name)
    setIsExpanded(false)
    inputRef.current?.blur()
  }

  const handleExpand = () => {
    setIsExpanded(true)
    setTimeout(() => inputRef.current?.focus(), 100)
    // New token for a new session
    sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken()
  }

  // Auto-focus input when defaultExpanded is true on mount
  useEffect(() => {
    if (defaultExpanded) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [defaultExpanded])

  const nearbyText = {
    en: {
      nearby: 'Nearby',
      subtitle: 'Discover what\'s around you',
      suggested: 'Suggested Destinations',
      searchPlaceholder: 'Search Sofia, Plovdiv, Varna...'
    },
    bg: {
      nearby: 'Наблизо',
      subtitle: 'Открийте какво има около вас',
      suggested: 'Предложени Дестинации',
      searchPlaceholder: 'Търси София, Пловдив, Варна...'
    }
  }

  const t = nearbyText[locale]

  if (!isExpanded) {
    return (
      <div className="flex items-center gap-2 w-full">
        {/* Collapsed Search Field */}
        <button
          onClick={handleExpand}
          className="flex-1 flex items-center gap-3 px-4 py-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <span className="text-left text-sm font-medium text-gray-900 truncate">
            {value || placeholder}
          </span>
        </button>

        {/* Filter Button */}
        <button
          onClick={onFilterClick}
          className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <SlidersHorizontal className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Expanded Search Field */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 relative flex items-center bg-white rounded-full shadow-lg ring-2 ring-blue-500">
          <div className="absolute left-4 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-12 pr-12 py-3 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-900 placeholder-gray-400 text-base font-medium rounded-full"
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

        {/* Filter Button (when expanded) */}
        <button
          onClick={onFilterClick}
          className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <SlidersHorizontal className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Suggestions Dropdown */}
      <div
        ref={dropdownRef}
        className="bg-white rounded-2xl shadow-2xl max-h-[60vh] overflow-y-auto"
      >
        {/* Nearby Option */}
        {!isTyping && (
          <>
            <button
              onClick={handleNearby}
              className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex-shrink-0">
                <Navigation className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-base text-gray-900">{t.nearby}</p>
                <p className="text-sm text-gray-500">{t.subtitle}</p>
              </div>
            </button>

            <div className="px-6 py-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t.suggested}
              </p>
            </div>
          </>
        )}

        {/* City Suggestions */}
        {filteredCities.map((city) => (
          <button
            key={city.nameEn}
            onClick={() => handleCitySelect(city)}
            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full text-2xl flex-shrink-0">
              {city.icon}
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-base text-gray-900">{city.name}</p>
              <p className="text-sm text-gray-500">{city.subtitle}</p>
            </div>
          </button>
        ))}

        {/* Google Predictions */}
        {isTyping && predictionsRef.current.length > 0 && (
          <div className="border-t border-gray-100">
            {predictionsRef.current.map((p) => (
              <button
                key={p.place_id}
                onClick={() => {
                  if (!placesServiceRef.current) return
                  placesServiceRef.current.getDetails(
                    {
                      placeId: p.place_id,
                      fields: ['name', 'geometry'],
                      sessionToken: sessionTokenRef.current || undefined,
                    },
                    (place) => {
                      if (place && place.geometry && place.geometry.location) {
                        onPlaceSelected({
                          lat: place.geometry.location.lat(),
                          lng: place.geometry.location.lng(),
                          zoom: 12,
                          name: place.name || p.description,
                        })
                        setValue(place.name || p.description)
                        setIsExpanded(false)
                        inputRef.current?.blur()
                        // End session
                        sessionTokenRef.current = null
                      }
                    }
                  )
                }}
                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
                  <MapPin className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{p.structured_formatting?.main_text || p.description}</p>
                  {p.structured_formatting?.secondary_text && (
                    <p className="text-sm text-gray-500">{p.structured_formatting.secondary_text}</p>
                  )}
                </div>
              </button>
            ))}
            {/* Attribution */}
            <div className="px-6 py-2 text-right">
              <span className="text-[10px] uppercase tracking-wider text-gray-400">powered by Google</span>
            </div>
          </div>
        )}

        {/* No results */}
        {isTyping && filteredCities.length === 0 && predictionsRef.current.length === 0 && (
          <div className="px-6 py-8 text-center">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              {locale === 'bg' 
                ? 'Няма резултати. Опитайте друго търсене.' 
                : 'No results. Try another search.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

