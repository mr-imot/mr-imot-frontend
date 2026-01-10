"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Search, X, MapPin, Navigation, Building, Home, SlidersHorizontal } from "lucide-react"
import { ensurePlacesLibrary } from "@/lib/google-maps"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

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

type PropertyTypeFilter = "all" | "apartments" | "houses"

interface DesktopSearchProps {
  onPlaceSelected: (place: { lat: number; lng: number; zoom: number; name: string }) => void
  onPropertyTypeChange: (type: PropertyTypeFilter) => void
  propertyTypeFilter: PropertyTypeFilter
  placeholder?: string
  locale: 'en' | 'bg' | 'ru'
  dict: {
    filters: {
      all: string
      apartments: string
      houses: string
      propertyTypeLabel: string
    }
  }
}

export function DesktopSearch({
  onPlaceSelected,
  onPropertyTypeChange,
  propertyTypeFilter,
  placeholder = "Search location...",
  locale,
  dict
}: DesktopSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [value, setValue] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [filteredCities, setFilteredCities] = useState<CityOption[]>(SUGGESTED_CITIES)
  const [selectedCityName, setSelectedCityName] = useState("")

  // Custom Places Autocomplete (new Place AutocompleteSuggestion API)
  type NormalizedPrediction = {
    placeId: string
    mainText: string
    secondaryText?: string
    description: string
  }

  const predictionsRef = useRef<NormalizedPrediction[]>([])
  const [predictionsVersion, setPredictionsVersion] = useState(0)
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null)
  const autocompleteSuggestionRef = useRef<typeof google.maps.places.AutocompleteSuggestion | null>(null)
  const placesLibraryRef = useRef<google.maps.PlacesLibrary | null>(null)
  const placesReadyRef = useRef(false)

  const getPlacesLibrary = useCallback(async () => {
    if (!placesLibraryRef.current) {
      placesLibraryRef.current = await ensurePlacesLibrary()
    }
    return placesLibraryRef.current
  }, [])

  const ensurePlacesReady = useCallback(async () => {
    if (placesReadyRef.current) return true
    try {
      await getPlacesLibrary()
      if (!autocompleteSuggestionRef.current) {
        autocompleteSuggestionRef.current = google.maps.places.AutocompleteSuggestion
      }
      placesReadyRef.current = true
      return true
    } catch (e) {
      console.error('Failed to init Google Places:', e)
      return false
    }
  }, [getPlacesLibrary])

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
        setSelectedCityName(locale === 'bg' ? 'Наблизо' : 'Nearby')
        setValue("")
        setIsExpanded(false)
      },
      (error) => {
        console.error('Geolocation error:', error)
        alert(locale === 'bg' ? 'Не може да се определи местоположението ви' : 'Unable to get your location')
      }
    )
  }

  useEffect(() => {
    if (isExpanded) {
      void ensurePlacesReady()
    }
  }, [isExpanded, ensurePlacesReady])

  const fetchPredictions = useRef(
    debounce(async (query: string) => {
      if (!query) return
      try {
        const ready = await ensurePlacesReady()
        if (!ready || !autocompleteSuggestionRef.current) return
        // Reuse token within a session; create if missing
        if (!sessionTokenRef.current) {
          sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken()
        }

        const { suggestions = [] } = await autocompleteSuggestionRef.current.fetchAutocompleteSuggestions({
          input: query,
          sessionToken: sessionTokenRef.current,
          // No region restriction - allows global search
        })

        predictionsRef.current = suggestions
          .map((s: any) => s.placePrediction)
          .filter(Boolean)
          .map((p: any) => ({
            placeId: p.placeId || p.place_id,
            mainText:
              p.text?.text ||
              p.structuredFormat?.mainText?.text ||
              p.structured_formatting?.main_text ||
              '',
            secondaryText:
              p.secondaryText?.text ||
              p.structuredFormat?.secondaryText?.text ||
              p.structured_formatting?.secondary_text,
            description:
              p.text?.text ||
              p.structuredFormat?.mainText?.text ||
              p.description ||
              '',
          }))

        setPredictionsVersion((v) => v + 1)
      } catch (error) {
        console.error('Failed to fetch autocomplete suggestions', error)
      }
    }, 200)
  ).current

  // Handle input changes
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
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
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
    setSelectedCityName(locale === 'bg' ? city.name : city.nameEn)
    setValue("")
    setIsExpanded(false)
    inputRef.current?.blur()
  }

  const handleExpand = () => {
    setIsExpanded(true)
    setTimeout(() => inputRef.current?.focus(), 100)
    void ensurePlacesReady().then((ready) => {
      if (ready) {
        sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken()
      }
    })
  }

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
    },
    ru: {
      nearby: 'Рядом',
      subtitle: 'Узнайте, что рядом с вами',
      suggested: 'Предложенные направления',
      searchPlaceholder: 'Ищите София, Пловдив, Варна...'
    }
  }

  const t = nearbyText[locale]

  return (
    <div ref={containerRef} className="flex flex-row items-center gap-6 xl:gap-8 w-full">
      {/* Search Section */}
      <div className="relative flex-1 max-w-md">
        {/* Search Input - Collapsed or Expanded */}
        <div 
          className={`relative flex items-center bg-white rounded-full shadow-md transition-all duration-200 ${
            isExpanded ? 'ring-2 ring-gray-900' : 'hover:shadow-lg cursor-pointer'
          }`}
          onClick={() => !isExpanded && handleExpand()}
        >
          <div className="absolute left-4 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          
          {isExpanded ? (
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-12 pr-12 py-3 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-900 placeholder-gray-400 text-sm font-medium rounded-full"
            />
          ) : (
            <div className="w-full pl-12 pr-4 py-3 text-gray-900 text-sm font-medium">
              {selectedCityName || placeholder}
            </div>
          )}
          
          {isExpanded && value && (
            <button
              onClick={handleClear}
              className="absolute right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
              type="button"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {isExpanded && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl max-h-[400px] overflow-y-auto z-50 border border-gray-100"
          >
            {/* Nearby Option */}
            {!isTyping && (
              <>
                <button
                  onClick={handleNearby}
                  className="w-full flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex-shrink-0">
                    <Navigation className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-sm text-gray-900">{t.nearby}</p>
                    <p className="text-xs text-gray-500">{t.subtitle}</p>
                  </div>
                </button>

                <div className="px-5 py-2 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
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
                className="w-full flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full text-xl flex-shrink-0">
                  {city.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm text-gray-900">{locale === 'bg' ? city.name : city.nameEn}</p>
                  <p className="text-xs text-gray-500">{city.subtitle}</p>
                </div>
              </button>
            ))}

            {/* Google Predictions */}
            {isTyping && predictionsRef.current.length > 0 && (
              <div className="border-t border-gray-100">
                {predictionsRef.current.map((p) => (
                  <button
                    key={p.placeId}
                    onClick={async () => {
                      try {
                        const placesLibrary = await getPlacesLibrary()
                        const place = new placesLibrary.Place({ id: p.placeId })

                        await place.fetchFields({
                          fields: ['displayName', 'location'],
                          sessionToken: sessionTokenRef.current || undefined,
                        } as any)

                        const location = place.location
                        if (location) {
                          const lat = (typeof location.lat === 'function' ? location.lat() : location.lat) as number
                          const lng = (typeof location.lng === 'function' ? location.lng() : location.lng) as number
                          const name = (place as any).displayName?.text || p.description

                          onPlaceSelected({
                            lat,
                            lng,
                            zoom: 16,
                            name,
                          })
                          setSelectedCityName(name)
                          setValue("")
                          setIsExpanded(false)
                          inputRef.current?.blur()
                          sessionTokenRef.current = null
                        }
                      } catch (error) {
                        console.error('Failed to fetch place details', error)
                      }
                    }}
                    className="w-full flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                      <MapPin className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{p.mainText || p.description}</p>
                      {p.secondaryText && (
                        <p className="text-xs text-gray-500">{p.secondaryText}</p>
                      )}
                    </div>
                  </button>
                ))}
                <div className="px-5 py-2 text-right">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400">powered by Google</span>
                </div>
              </div>
            )}

            {/* No results */}
            {isTyping && filteredCities.length === 0 && predictionsRef.current.length === 0 && (
              <div className="px-5 py-6 text-center">
                <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500">
                  {locale === 'bg' 
                    ? 'Няма резултати. Опитайте друго търсене.' 
                    : 'No results. Try another search.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Vertical Divider */}
      <div className="hidden xl:block h-10 w-px bg-gray-200" />

      {/* Property Type Filter */}
      <div className="flex items-center gap-3">
        <Building className="w-4 h-4 text-gray-700 hidden laptop:block" />
        <ToggleGroup
          type="single"
          value={propertyTypeFilter}
          onValueChange={(val) => val && onPropertyTypeChange(val as PropertyTypeFilter)}
          className="flex gap-2"
        >
          <ToggleGroupItem 
            value="all" 
            className="h-10 px-4 rounded-full border-2 font-medium text-sm shadow-sm hover:shadow-md transition-all duration-300 ease-out bg-transparent border-gray-700 text-gray-900 data-[state=on]:bg-gray-900 data-[state=on]:text-white data-[state=on]:border-gray-900"
          >
            {dict.filters.all}
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="apartments" 
            className="h-10 px-3 rounded-full border-2 font-medium text-sm shadow-sm hover:shadow-md transition-all duration-300 ease-out flex items-center gap-1 bg-transparent border-gray-700 text-gray-900 data-[state=on]:bg-gray-900 data-[state=on]:text-white data-[state=on]:border-gray-900"
          >
            <Building className="w-3 h-3" /> {dict.filters.apartments}
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="houses" 
            className="h-10 px-3 rounded-full border-2 font-medium text-sm shadow-sm hover:shadow-md transition-all duration-300 ease-out flex items-center gap-1 bg-transparent border-gray-700 text-gray-900 data-[state=on]:bg-gray-900 data-[state=on]:text-white data-[state=on]:border-gray-900"
          >
            <Home className="w-3 h-3" /> {dict.filters.houses}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  )
}
