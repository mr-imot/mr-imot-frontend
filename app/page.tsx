"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { TestimonialCarousel } from "@/components/testimonial-carousel"
import { EnhancedFeatureCard } from "@/components/enhanced-feature-card"
import { ScrollAnimationWrapper } from "@/components/scroll-animation-wrapper"
import { AngledSeparator } from "@/components/angled-separator"
import { useState, useRef, useEffect } from "react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  CheckCircle,
  Users,
  UserX,
  Zap,
  MapPin,
  ChevronRight,
  Loader2,
  X,
  ExternalLink,
  Shield,
  Clock,
} from "lucide-react"

interface PropertyData {
  id: string
  title: string
  priceRange: string
  location: string
  image: string
  description: string
  lat: number
  lng: number
  color: string
}

export default function HomePage() {
  const [selectedCity, setSelectedCity] = useState("Sofia")
  const [isMapLoading, setIsMapLoading] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<PropertyData | null>(null)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
  const mapRef = useRef<HTMLDivElement>(null)

  const properties: PropertyData[] = [
    {
      id: "luxury-apartments-central",
      title: "Luxury Apartments Central",
      priceRange: "€250,000 - €450,000",
      location: "Sofia Center, Bulgaria",
      image: "/placeholder.svg?height=200&width=300",
      description: "Modern luxury apartments in the heart of Sofia with premium finishes and city views.",
      lat: 42.6977,
      lng: 23.3219,
      color: "from-ds-primary-500 to-ds-primary-700",
    },
    {
      id: "green-valley-residences",
      title: "Green Valley Residences",
      priceRange: "€180,000 - €320,000",
      location: "Vitosha District, Sofia",
      image: "/placeholder.svg?height=200&width=300",
      description: "Eco-friendly residential complex surrounded by green spaces and mountain views.",
      lat: 42.7105,
      lng: 23.3341,
      color: "from-ds-accent-500 to-ds-accent-700",
    },
    {
      id: "riverside-towers",
      title: "Riverside Towers",
      priceRange: "€300,000 - €550,000",
      location: "Lozenets, Sofia",
      image: "/placeholder.svg?height=200&width=300",
      description: "Premium high-rise towers with river views and luxury amenities.",
      lat: 42.6794,
      lng: 23.3192,
      color: "from-orange-500 to-orange-700",
    },
    {
      id: "modern-living-complex",
      title: "Modern Living Complex",
      priceRange: "€220,000 - €380,000",
      location: "Mladost, Sofia",
      image: "/placeholder.svg?height=200&width=300",
      description: "Contemporary apartments with smart home technology and modern amenities.",
      lat: 42.7038,
      lng: 23.337,
      color: "from-purple-500 to-purple-700",
    },
    {
      id: "city-center-lofts",
      title: "City Center Lofts",
      priceRange: "€350,000 - €650,000",
      location: "Serdika, Sofia",
      image: "/placeholder.svg?height=200&width=300",
      description: "Industrial-style lofts in the historic center with high ceilings and exposed brick.",
      lat: 42.6935,
      lng: 23.3281,
      color: "from-red-500 to-red-700",
    },
  ]

  const cities = [
    { name: "Sofia", id: "sofia" },
    { name: "Plovdiv", id: "plovdiv" },
    { name: "Varna", id: "varna" },
  ]

  const features = [
    {
      icon: UserX,
      title: "Skip the Middleman",
      description: "Connect directly with developers and builders. No brokers, no commissions, no runaround.",
      benefit: "Save 3-5% in broker fees on every purchase",
      isPrimary: true,
    },
    {
      icon: Shield,
      title: "100% Verified Projects",
      description: "Every listing is personally verified by our team. No fake properties, no outdated information.",
      benefit: "Zero risk of scams or misleading listings",
      isPrimary: false,
    },
    {
      icon: Clock,
      title: "Get There First",
      description:
        "Access new projects before they hit the general market. Early bird pricing and best unit selection.",
      benefit: "Up to 15% better prices than market launch",
      isPrimary: true,
    },
    {
      icon: MapPin,
      title: "Smart Location Search",
      description: "Interactive maps show exactly where projects are located with neighborhood insights and amenities.",
      benefit: "Make informed decisions about your investment",
      isPrimary: false,
    },
  ]

  const testimonials = [
    {
      quote:
        "My family wanted to love our neighborhood but wanted to stop renting and buy something. We found a project near us via Mr imot and contacted the developer without brokers. It was so easy!",
      author: "The Ivanovi Family",
      role: "First-time Homebuyers",
      imageSrc: "/placeholder.svg?height=48&width=48",
      rating: 5,
    },
    {
      quote:
        "I wanted to invest directly with a developer for the best prices, without fake listings from brokers. I don't like paying for commissions or wasting my time. Mr imot delivered exactly that.",
      author: "Ivan Ivanov",
      role: "Savvy Investor",
      imageSrc: "/placeholder.svg?height=48&width=48",
      rating: 5,
    },
    {
      quote:
        "Finding an apartment for my daughter studying medicine in Plovdiv was a breeze. Mr imot connected me directly to a reputable developer, ensuring a smooth and transparent process.",
      author: "Georgi Petrov",
      role: "Father & Investor",
      imageSrc: "/placeholder.svg?height=48&width=48",
      rating: 5,
    },
    {
      quote:
        "Mr imot helped us discover a fantastic new development that perfectly matched our needs as a young couple. The direct communication with the builder saved us so much time and money.",
      author: "Maria & Alex",
      role: "Young Couple",
      imageSrc: "/placeholder.svg?height=48&width=48",
      rating: 5,
    },
    {
      quote:
        "As a real estate investor, I've used many platforms, but Mr imot's direct developer access has saved me thousands in broker fees. The transparency is unmatched.",
      author: "Stefan Dimitrov",
      role: "Property Investor",
      imageSrc: "/placeholder.svg?height=48&width=48",
      rating: 5,
    },
    {
      quote:
        "We were skeptical about buying off-plan, but Mr imot's verified listings and direct developer communication gave us confidence. Our new home exceeded expectations!",
      author: "Elena & Dimitar",
      role: "New Homeowners",
      imageSrc: "/placeholder.svg?height=48&width=48",
      rating: 5,
    },
  ]

  // Simulate map loading when city changes
  const handleCityChange = (value: string) => {
    if (value && value !== selectedCity) {
      setIsMapLoading(true)
      setSelectedCity(value)
      setSelectedProperty(null) // Close popup when changing cities

      // Simulate API loading time
      setTimeout(() => {
        setIsMapLoading(false)
      }, 1500)
    }
  }

  // Handle property pin click with smart positioning
  const handlePinClick = (property: PropertyData, event: React.MouseEvent) => {
    event.stopPropagation()

    if (!mapRef.current) return

    const mapRect = mapRef.current.getBoundingClientRect()
    const pinElement = event.currentTarget as HTMLElement
    const pinRect = pinElement.getBoundingClientRect()

    // Calculate position relative to map container
    const pinX = pinRect.left - mapRect.left + pinRect.width / 2
    const pinY = pinRect.top - mapRect.top

    // Popup dimensions (approximate)
    const popupWidth = 320
    const popupHeight = 400
    const mapPadding = 32 // 8 * 4 (p-8 padding)
    const mapWidth = mapRect.width - mapPadding * 2
    const mapHeight = mapRect.height - mapPadding * 2

    // Smart positioning logic
    let x = pinX
    let y = pinY - popupHeight - 16 // Default: above the pin

    // Horizontal positioning
    if (x - popupWidth / 2 < mapPadding) {
      // Too far left, align to left edge with padding
      x = mapPadding + popupWidth / 2
    } else if (x + popupWidth / 2 > mapWidth + mapPadding) {
      // Too far right, align to right edge with padding
      x = mapWidth + mapPadding - popupWidth / 2
    }

    // Vertical positioning
    if (y < mapPadding) {
      // Not enough space above, show below the pin
      y = pinY + 40 // Below the pin

      // Check if it fits below
      if (y + popupHeight > mapHeight + mapPadding) {
        // If it doesn't fit below either, center it vertically
        y = mapHeight / 2 - popupHeight / 2 + mapPadding
      }
    }

    setPopupPosition({ x, y })
    setSelectedProperty(property)
  }

  // Close popup when clicking outside
  const handleMapClick = () => {
    setSelectedProperty(null)
  }

  // Close popup with escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedProperty(null)
      }
    }

    document.addEventListener("keydown", handleEscapeKey)
    return () => document.removeEventListener("keydown", handleEscapeKey)
  }, [])

  return (
    <div className="flex flex-col min-h-[calc(100vh-72px)]">
      {/* Optimized Hero Section with Google Maps Ready Container */}
      <ScrollAnimationWrapper>
        <section className="relative w-full py-16 md:py-20 lg:py-24 bg-gradient-to-br from-blue-50 to-white text-nova-text-primary overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-full h-full">
              <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="hero-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5" opacity="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hero-grid)" />
              </svg>
            </div>
          </div>

          <div className="container px-4 md:px-6 grid md:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
            {/* Left Column: Streamlined Text Content */}
            <div className="text-center md:text-left space-y-4">
              {/* Headline */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mt-16">
                Real estate projects in one place—
                <br className="hidden sm:inline" />
                <span className="text-ds-accent-500 text-[1.05em] font-extrabold drop-shadow-sm bg-gradient-to-r from-ds-accent-500 to-ds-accent-600 bg-clip-text text-transparent">
                  no brokers, no BS,
                </span>{" "}
                contact developers directly.
              </h1>

              {/* Description */}
              <p className="text-lg md:text-xl text-nova-text-secondary leading-relaxed max-w-2xl">
                Discover new homes and apartments under construction near you. Connect directly with builders for the
                best prices.
              </p>
              {/* Trust Indicator */}
              <div className="flex items-center justify-center md:justify-start space-x-4 pt-2">
                <div className="bg-ds-accent-50 border border-ds-accent-200 rounded-full px-4 py-2 flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-ds-accent-500" />
                  <span className="text-sm font-medium text-ds-accent-700">100% Verified Listings</span>
                </div>
                <div className="bg-ds-primary-50 border border-ds-primary-200 rounded-full px-4 py-2 flex items-center space-x-2">
                  <Users className="h-4 w-4 text-ds-primary-500" />
                  <span className="text-sm font-medium text-ds-primary-700">Direct Developer Contact</span>
                </div>
              </div>
            </div>

            {/* Right Column: Google Maps Ready Container with Interactive City Selector */}
            <div className="relative">
              {/* Google Maps Ready Container */}
              <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl border border-ds-neutral-200 transition-all duration-500 transform hover:scale-[1.02] group">
                {/* Map Container - Ready for Google Maps API */}
                <div
                  ref={mapRef}
                  id="map"
                  data-city={selectedCity.toLowerCase()}
                  className="relative w-full bg-gray-100 cursor-pointer p-8" // Added p-8 for padding
                  style={{ height: "650px" }} // Increased height
                  onClick={handleMapClick}
                >
                  {/* Placeholder Image (will be replaced by Google Maps) */}
                  <Image
                    src="/placeholder.svg?height=600&width=800"
                    alt={`Interactive map of real estate projects in ${selectedCity}`}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-3xl transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Interactive City Selector - Overlay on top of map */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40">
                    <div className="bg-white/95 backdrop-blur-sm p-2 rounded-2xl border border-ds-neutral-200 shadow-lg">
                      <ToggleGroup
                        type="single"
                        value={selectedCity}
                        onValueChange={handleCityChange}
                        className="flex gap-1"
                      >
                        {cities.map((city) => (
                          <ToggleGroupItem
                            key={city.id}
                            value={city.name}
                            className="group relative px-6 py-3 rounded-xl font-semibold text-base transition-all duration-300 data-[state=on]:bg-green-400 data-[state=on]:text-white data-[state=on]:shadow-lg data-[state=off]:text-ds-neutral-600 hover:data-[state=off]:text-ds-neutral-800 hover:data-[state=off]:bg-gray-50 hover:scale-105 data-[state=on]:scale-105"
                          >
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 transition-all duration-300 group-data-[state=on]:text-white group-data-[state=off]:text-ds-accent-500 group-hover:scale-110" />
                              <span>{city.name}</span>
                            </div>

                            {/* Active state indicator */}
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-400 rounded-full opacity-0 group-data-[state=on]:opacity-100 transition-opacity duration-300"></div>
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                    </div>
                  </div>

                  {/* Property Pins - Positioned absolutely on the map */}
                  {properties.map((property, index) => {
                    const positions = [
                      { top: "30%", left: "40%" }, // Adjusted for padding
                      { top: "45%", left: "65%" },
                      { top: "65%", left: "30%" },
                      { top: "40%", left: "75%" },
                      { top: "55%", left: "50%" },
                    ]

                    return (
                      <div key={property.id} className={`absolute z-30`} style={positions[index]}>
                        <div
                          className={`property-pin group cursor-pointer transform transition-all duration-300 hover:scale-125 hover:z-40 ${
                            selectedProperty?.id === property.id ? "scale-125 z-40" : ""
                          }`}
                          data-lat={property.lat}
                          data-lng={property.lng}
                          data-property={property.id}
                          onClick={(e) => handlePinClick(property, e)}
                        >
                          <div className="relative">
                            {/* Pin Shadow */}
                            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-6 h-3 bg-black/20 rounded-full blur-sm"></div>

                            {/* Main Pin Body */}
                            <div
                              className={`w-8 h-10 bg-gradient-to-b ${property.color} rounded-t-full rounded-b-sm shadow-lg border-2 border-white relative`}
                            >
                              {/* Pin Icon */}
                              <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2">
                                <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 bg-current rounded-full opacity-70"></div>
                                </div>
                              </div>

                              {/* Pin Point */}
                              <div
                                className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent ${
                                  property.color.includes("primary")
                                    ? "border-t-ds-primary-700"
                                    : property.color.includes("accent")
                                      ? "border-t-ds-accent-700"
                                      : property.color.includes("orange")
                                        ? "border-t-orange-700"
                                        : property.color.includes("purple")
                                          ? "border-t-purple-700"
                                          : "border-t-red-700"
                                }`}
                              ></div>
                            </div>

                            {/* Simple Hover Tooltip (only when no popup is shown) */}
                            {!selectedProperty && (
                              <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                <div className="bg-white px-3 py-2 rounded-lg shadow-xl border border-ds-neutral-200 whitespace-nowrap">
                                  <p className="text-sm font-semibold text-ds-neutral-900">{property.title}</p>
                                  <p className="text-xs text-ds-neutral-600">{property.priceRange}</p>
                                </div>
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-white"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {/* Airbnb-style Property Popup */}
                  {selectedProperty && (
                    <div
                      className="absolute z-50 animate-in fade-in-0 zoom-in-95 duration-300"
                      style={{
                        left: `${popupPosition.x - 160}px`, // Center the popup (320px width / 2)
                        top: `${popupPosition.y}px`,
                        maxWidth: "320px",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Popup Card */}
                      <div className="bg-white rounded-2xl shadow-2xl border border-ds-neutral-200 overflow-hidden w-80 max-w-sm">
                        {/* Property Image */}
                        <div className="relative h-48 w-full">
                          <Image
                            src={selectedProperty.image || "/placeholder.svg"}
                            alt={selectedProperty.title}
                            layout="fill"
                            objectFit="cover"
                            className="transition-transform duration-300 hover:scale-105"
                          />

                          {/* Close Button */}
                          <button
                            onClick={() => setSelectedProperty(null)}
                            className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                          >
                            <X className="h-4 w-4 text-ds-neutral-600" />
                          </button>

                          {/* Price Badge */}
                          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full">
                            <p className="text-sm font-bold text-ds-neutral-900">{selectedProperty.priceRange}</p>
                          </div>
                        </div>

                        {/* Property Details */}
                        <div className="p-6 space-y-4">
                          {/* Title and Location */}
                          <div className="space-y-2">
                            <h3 className="text-xl font-bold text-ds-neutral-900 leading-tight">
                              {selectedProperty.title}
                            </h3>
                            <div className="flex items-center text-ds-neutral-600">
                              <MapPin className="h-4 w-4 mr-2 text-ds-accent-500" />
                              <p className="text-sm">{selectedProperty.location}</p>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-ds-neutral-700 leading-relaxed">{selectedProperty.description}</p>

                          {/* View Details Button */}
                          <Button
                            asChild
                            className="w-full bg-ds-primary-600 hover:bg-ds-primary-700 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 group"
                          >
                            <Link href={`/listings/${selectedProperty.id}`}>
                              View Details
                              <ExternalLink className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                            </Link>
                          </Button>
                        </div>
                      </div>

                      {/* Popup Arrow */}
                      {/* <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-white drop-shadow-sm"></div> */}
                    </div>
                  )}

                  {/* Loading Spinner Overlay */}
                  {isMapLoading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20 rounded-3xl">
                      <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="h-8 w-8 text-ds-primary-600 animate-spin" />
                        <p className="text-sm font-medium text-ds-neutral-700">Loading {selectedCity} projects...</p>
                      </div>
                    </div>
                  )}

                  {/* Dynamic location badge */}
                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl text-sm font-semibold text-ds-accent-500 shadow-xl border border-white/20 transition-all duration-300 hover:scale-105 z-10">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>Projects in {selectedCity}</span>
                    </div>
                  </div>

                  {/* Subtle overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollAnimationWrapper>

      {/* Angled Separator */}
      <AngledSeparator direction="down" color="bg-ds-neutral-50" angle={0.75} />

      {/* Redesigned Features Section with Visual Hierarchy */}
      <ScrollAnimationWrapper delay={200}>
        <section className="w-full py-24 md:py-32 bg-ds-neutral-50 text-nova-text-primary">
          <div className="container px-4 md:px-6">
            <div className="max-w-7xl mx-auto">
              {/* Enhanced Section Header */}
              <div className="text-center mb-20 md:mb-24 space-y-6">
                <h2 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight text-ds-neutral-900">
                  Why Smart Buyers Choose Mr imot
                </h2>
                <p className="text-xl md:text-2xl text-ds-neutral-600 max-w-4xl mx-auto leading-relaxed">
                  Stop overpaying brokers and dealing with fake listings. Get direct access to the best new projects
                  before anyone else, with verified information and transparent pricing.
                </p>
              </div>

              {/* Asymmetric Grid Layout with Visual Hierarchy */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                {/* Primary Feature - Large Card */}
                <div className="lg:col-span-7">
                  <ScrollAnimationWrapper delay={300}>
                    <EnhancedFeatureCard
                      icon={features[0].icon}
                      title={features[0].title}
                      description={features[0].description}
                      benefit={features[0].benefit}
                      isPrimary={features[0].isPrimary}
                      delay={0}
                    />
                  </ScrollAnimationWrapper>
                </div>

                {/* Secondary Feature - Medium Card */}
                <div className="lg:col-span-5">
                  <ScrollAnimationWrapper delay={400}>
                    <EnhancedFeatureCard
                      icon={features[1].icon}
                      title={features[1].title}
                      description={features[1].description}
                      benefit={features[1].benefit}
                      isPrimary={features[1].isPrimary}
                      delay={0}
                    />
                  </ScrollAnimationWrapper>
                </div>

                {/* Third Feature - Medium Card */}
                <div className="lg:col-span-5">
                  <ScrollAnimationWrapper delay={500}>
                    <EnhancedFeatureCard
                      icon={features[2].icon}
                      title={features[2].title}
                      description={features[2].description}
                      benefit={features[2].benefit}
                      isPrimary={features[2].isPrimary}
                      delay={0}
                    />
                  </ScrollAnimationWrapper>
                </div>

                {/* Fourth Feature - Large Card */}
                <div className="lg:col-span-7">
                  <ScrollAnimationWrapper delay={600}>
                    <EnhancedFeatureCard
                      icon={features[3].icon}
                      title={features[3].title}
                      description={features[3].description}
                      benefit={features[3].benefit}
                      isPrimary={features[3].isPrimary}
                      delay={0}
                    />
                  </ScrollAnimationWrapper>
                </div>
              </div>

              {/* Bottom CTA */}
              <ScrollAnimationWrapper delay={700}>
                <div className="text-center mt-16 md:mt-20">
                  <div className="bg-white rounded-2xl p-8 md:p-10 shadow-lg border border-ds-neutral-200 max-w-4xl mx-auto">
                    <h3 className="text-2xl md:text-3xl font-bold text-ds-neutral-900 mb-4">
                      Ready to Skip the Broker Fees?
                    </h3>
                    <p className="text-lg text-ds-neutral-600 mb-8 leading-relaxed">
                      Join thousands of smart buyers who are saving money and time by connecting directly with
                      developers.
                    </p>
                    <Button
                      asChild
                      size="lg"
                      className="bg-ds-primary-600 hover:bg-ds-primary-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Link href="/listings">
                        Browse Verified Projects
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </ScrollAnimationWrapper>
            </div>
          </div>
        </section>
      </ScrollAnimationWrapper>

      {/* Angled Separator */}
      <AngledSeparator direction="down" color="bg-white" angle={0.75} />

      {/* Enhanced Testimonials Section with Better Margins */}
      <ScrollAnimationWrapper delay={400}>
        <section className="w-full py-24 md:py-32 bg-white text-nova-text-primary">
          <div className="container px-4 md:px-6">
            {/* Enhanced Section Header */}
            <div className="text-center max-w-4xl mx-auto mb-24 space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight text-ds-neutral-900">
                Hear from Our Happy Users
              </h2>
              <p className="text-xl md:text-2xl text-ds-neutral-600 leading-relaxed">
                Real stories from people who found their dream property or investment through Mr imot. See why thousands
                trust us for their real estate needs.
              </p>
            </div>

            <TestimonialCarousel testimonials={testimonials} />
          </div>
        </section>
      </ScrollAnimationWrapper>

      {/* Angled Separator */}
      <AngledSeparator
        direction="down"
        color="bg-gradient-to-br from-ds-primary-600 via-ds-primary-700 to-ds-primary-800"
        angle={0.75}
      />

      {/* Maximum Conversion CTA Section */}
      <ScrollAnimationWrapper delay={600}>
        <section className="w-full py-24 md:py-32 bg-gradient-to-br from-ds-primary-600 via-ds-primary-700 to-ds-primary-800 text-white relative overflow-hidden">
          {/* Enhanced Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full">
              <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="cta-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#60a5fa" strokeWidth="0.5" opacity="0.6" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#cta-grid)" />
              </svg>
            </div>
          </div>

          {/* Floating geometric shapes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-6 h-6 bg-white/10 rounded-full animate-float"></div>
            <div
              className="absolute top-40 right-20 w-8 h-8 bg-white/10 rounded-full animate-float"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute bottom-32 left-20 w-4 h-4 bg-white/10 rounded-full animate-float"
              style={{ animationDelay: "2s" }}
            ></div>
            <div
              className="absolute bottom-20 right-10 w-7 h-7 bg-white/10 rounded-full animate-float"
              style={{ animationDelay: "0.5s" }}
            ></div>
            {/* Additional geometric elements */}
            <div
              className="absolute top-1/3 left-1/4 w-3 h-3 bg-ds-accent-400/20 rotate-45 animate-float"
              style={{ animationDelay: "1.5s" }}
            ></div>
            <div
              className="absolute bottom-1/3 right-1/4 w-5 h-5 bg-ds-accent-400/20 rotate-45 animate-float"
              style={{ animationDelay: "2.5s" }}
            ></div>
          </div>

          <div className="container px-4 md:px-6 relative z-10">
            <div className="max-w-7xl mx-auto">
              {/* Enhanced Main Headline */}
              <div className="text-center mb-20 md:mb-24 space-y-8">
                <h2 className="text-4xl md:text-5xl font-bold leading-[1.05] tracking-tight text-white">
                  Ready to Showcase
                  <br />
                  <span className="bg-gradient-to-r from-ds-accent-400 to-ds-accent-500 bg-clip-text text-transparent">
                    Your Projects?
                  </span>
                </h2>
                <p className="text-xl md:text-2xl leading-relaxed max-w-5xl mx-auto text-white/90 font-medium">
                  Join hundreds of developers who are already connecting directly with buyers. No middlemen, no
                  commissions, just direct access to your target market.
                </p>
              </div>

              {/* Enhanced Benefits Cards with Hover Effects */}
              <div className="grid md:grid-cols-3 gap-8 lg:gap-10 mb-20 md:mb-24">
                <ScrollAnimationWrapper delay={800}>
                  <div className="bg-white rounded-2xl p-8 lg:p-10 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 group">
                    <div className="text-center space-y-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-ds-primary-500 to-ds-primary-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                        <Users className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-2xl lg:text-3xl font-bold text-ds-neutral-900 group-hover:text-ds-primary-600 transition-colors duration-300">
                        Direct Access
                      </h3>
                      <p className="text-lg text-ds-neutral-600 leading-relaxed">
                        Connect straight with serious buyers, no brokers involved. Build relationships that matter
                      </p>
                    </div>
                  </div>
                </ScrollAnimationWrapper>

                <ScrollAnimationWrapper delay={900}>
                  <div className="bg-white rounded-2xl p-8 lg:p-10 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 group">
                    <div className="text-center space-y-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-ds-accent-500 to-ds-accent-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                        <Zap className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-2xl lg:text-3xl font-bold text-ds-neutral-900 group-hover:text-ds-accent-600 transition-colors duration-300">
                        Quick Setup
                      </h3>
                      <p className="text-lg text-ds-neutral-600 leading-relaxed">
                        List your projects in minutes, start getting qualified leads today. Simple and efficient.
                      </p>
                    </div>
                  </div>
                </ScrollAnimationWrapper>

                <ScrollAnimationWrapper delay={1000}>
                  <div className="bg-white rounded-2xl p-8 lg:p-10 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 group">
                    <div className="text-center space-y-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                        <CheckCircle className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-2xl lg:text-3xl font-bold text-ds-neutral-900 group-hover:text-emerald-600 transition-colors duration-300">
                        100% Free
                      </h3>
                      <p className="text-lg text-ds-neutral-600 leading-relaxed">
                        Currently free during our launch phase. No hidden costs, no setup fees, no surprises.
                      </p>
                    </div>
                  </div>
                </ScrollAnimationWrapper>
              </div>

              {/* Enhanced CTA Buttons */}
              <ScrollAnimationWrapper delay={1100}>
                <div className="flex justify-center items-center mb-20">
                  <Button
                    asChild
                    size="lg"
                    className="relative bg-ds-accent-500 hover:bg-ds-accent-600 text-white px-12 py-8 text-2xl font-bold rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-3 border-0 min-w-[320px] group overflow-hidden"
                  >
                    <Link href="/register?type=developer">
                      {/* Animated background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-r from-ds-accent-600 via-ds-accent-500 to-ds-accent-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {/* Shimmer effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"></div>

                      {/* Button content */}
                      <span className="relative z-10 flex items-center">
                        🚀 List Your First Project FREE
                        <ChevronRight className="ml-4 h-7 w-7 transition-transform duration-300 group-hover:translate-x-2 group-hover:scale-125" />
                      </span>
                    </Link>
                  </Button>
                </div>
              </ScrollAnimationWrapper>

              {/* Enhanced Trust Indicators */}
              <ScrollAnimationWrapper delay={1200}>
                <div className="pt-16 border-t border-white/20">
                  <p className="text-xl md:text-2xl text-white/90 mb-10 text-center font-medium">
                    Trusted by developers across Bulgaria
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="flex flex-col items-center space-y-3 group hover:scale-105 transition-transform duration-300">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                        <CheckCircle className="h-6 w-6 text-ds-accent-400" />
                      </div>
                      <span className="text-lg font-semibold text-white">Verified Projects Only</span>
                      <span className="text-sm text-white/70">100% authentic listings</span>
                    </div>
                    <div className="flex flex-col items-center space-y-3 group hover:scale-105 transition-transform duration-300">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                        <Users className="h-6 w-6 text-ds-accent-400" />
                      </div>
                      <span className="text-lg font-semibold text-white">Direct Communication</span>
                      <span className="text-sm text-white/70">No middlemen involved</span>
                    </div>
                    <div className="flex flex-col items-center space-y-3 group hover:scale-105 transition-transform duration-300">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                        <Zap className="h-6 w-6 text-ds-accent-400" />
                      </div>
                      <span className="text-lg font-semibold text-white">No Commission Fees</span>
                      <span className="text-sm text-white/70">Keep 100% of your profits</span>
                    </div>
                  </div>
                </div>
              </ScrollAnimationWrapper>
            </div>
          </div>
        </section>
      </ScrollAnimationWrapper>
    </div>
  )
}
