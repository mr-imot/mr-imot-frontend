"use client"

import type React from "react"

import { notFound } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  MapPin,
  Star,
  Building,
  Home,
  Calendar,
  Users,
  Phone,
  Mail,
  ArrowLeft,
  Heart,
  Share2,
  CheckCircle,
  Wifi,
  Car,
  Dumbbell,
  Trees,
  Shield,
  Zap,
  Globe,
  Euro,
  Ruler,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { recordProjectPhoneClick, recordProjectView, recordProjectWebsiteClick } from "@/lib/api"

interface PropertyData {
  id: number
  slug: string
  title: string
  priceRange: string
  location: string
  city: string
  image: string
  description: string
  longDescription: string
  lat: number
  lng: number
  color: string
  type: "Apartment Complex" | "Residential Houses" | "Mixed-Use Building"
  status: "Under Construction" | "Foundation Laid" | "Framing Complete" | "Pre-Sales Open" | "Nearly Complete"
  developer: string
  completionDate: string
  rating: number
  reviews: number
  features: string[]
  originalPrice?: string
  shortPrice: string
  images: string[]
  floorPlans: string[]
  amenities: string[]
  specifications: {
    totalUnits: number
    floors: number
    parkingSpaces: number
    unitSizes: string
    buildingType: string
    bedrooms: string
    bathrooms: string
    totalArea: string
  }
  contact: {
    phone: string
    email: string
    website?: string
    address: string
  }
  highlights: string[]
  nearbyAttractions: string[]
}

// Comprehensive mock data for properties 1-25
const getAllProperties = (): PropertyData[] => [
  {
    id: 1,
    slug: "seaside-apartments-varna",
    title: "Seaside Apartments Varna",
    priceRange: "€200,000 - €400,000",
    shortPrice: "€200k",
    location: "Varna Beach, Bulgaria",
    city: "Varna",
    image: "/placeholder.svg?height=400&width=600&text=Seaside+Apartments",
    description: "Beachfront apartments with stunning sea views and resort-style amenities.",
    longDescription:
      "Experience coastal luxury at its finest in these stunning beachfront apartments located directly on Varna Beach. Each unit features panoramic sea views, premium finishes, and access to resort-style amenities including a private beach, infinity pool, and spa facilities. The building offers 24/7 concierge service, underground parking, and is just minutes from Varna's vibrant city center and cultural attractions. Perfect for both permanent residence and vacation rental investment.",
    lat: 43.2141,
    lng: 27.9147,
    color: "from-blue-500 to-blue-700",
    type: "Apartment Complex",
    status: "Under Construction",
    developer: "Seaside Properties Ltd",
    completionDate: "Q1 2026",
    rating: 4.9,
    reviews: 12,
    features: ["Sea Views", "Beach Access", "Resort Amenities", "Pool", "Spa", "Concierge"],
    images: [
      "/placeholder.svg?height=400&width=600&text=Main+View",
      "/placeholder.svg?height=400&width=600&text=Beach+View",
      "/placeholder.svg?height=400&width=600&text=Pool+Area",
      "/placeholder.svg?height=400&width=600&text=Interior",
      "/placeholder.svg?height=400&width=600&text=Balcony",
      "/placeholder.svg?height=400&width=600&text=Lobby",
    ],
    floorPlans: [
      "/placeholder.svg?height=400&width=600&text=1BR+Floor+Plan",
      "/placeholder.svg?height=400&width=600&text=2BR+Floor+Plan",
    ],
    amenities: [
      "Private Beach Access",
      "Infinity Pool",
      "Spa & Wellness Center",
      "24/7 Concierge",
      "Underground Parking",
      "High-Speed Internet",
      "Fitness Center",
      "Restaurant & Bar",
    ],
    specifications: {
      totalUnits: 85,
      floors: 12,
      parkingSpaces: 100,
      unitSizes: "75-220 m²",
      buildingType: "Beachfront Tower",
      bedrooms: "1-3 BR",
      bathrooms: "1-2 Bath",
      totalArea: "18,500 m²",
    },
    contact: {
      phone: "+359 52 123 456",
      email: "info@seasideproperties.bg",
      website: "www.seasideproperties.bg",
      address: "123 Seaside Boulevard, Varna 9000, Bulgaria",
    },
    highlights: [
      "Direct beach access",
      "Panoramic sea views from all units",
      "Resort-style amenities",
      "Prime Varna location",
    ],
    nearbyAttractions: [
      "Varna Archaeological Museum - 2km",
      "Sea Garden Park - 1km",
      "Varna Cathedral - 3km",
      "Golden Sands Resort - 15km",
    ],
  },
  {
    id: 2,
    slug: "mountain-retreat-bansko",
    title: "Mountain Retreat Houses Bansko",
    priceRange: "€150,000 - €280,000",
    shortPrice: "€150k",
    location: "Bansko, Bulgaria",
    city: "Bansko",
    image: "/placeholder.svg?height=400&width=600&text=Mountain+Retreat",
    description: "Cozy mountain houses with ski access and panoramic views.",
    longDescription:
      "Discover the perfect mountain getaway in these beautifully designed houses nestled in the heart of Bansko. Each home features traditional Bulgarian architecture combined with modern amenities, offering direct ski access and breathtaking mountain views. The development includes private gardens, fireplaces, and is just minutes from Bansko's renowned ski slopes and charming old town. Ideal for ski enthusiasts and mountain lovers seeking a peaceful retreat.",
    lat: 41.8311,
    lng: 23.4871,
    color: "from-green-500 to-green-700",
    type: "Residential Houses",
    status: "Foundation Laid",
    developer: "Mountain Living Development",
    completionDate: "Q3 2025",
    rating: 4.7,
    reviews: 19,
    features: ["Mountain Views", "Ski Access", "Fireplace", "Garden", "Traditional Design"],
    images: [
      "/placeholder.svg?height=400&width=600&text=House+Exterior",
      "/placeholder.svg?height=400&width=600&text=Mountain+View",
      "/placeholder.svg?height=400&width=600&text=Living+Room",
      "/placeholder.svg?height=400&width=600&text=Kitchen",
      "/placeholder.svg?height=400&width=600&text=Garden",
      "/placeholder.svg?height=400&width=600&text=Fireplace",
    ],
    floorPlans: [
      "/placeholder.svg?height=400&width=600&text=Ground+Floor",
      "/placeholder.svg?height=400&width=600&text=Upper+Floor",
    ],
    amenities: [
      "Ski Equipment Storage",
      "Private Gardens",
      "Fireplace",
      "Mountain Views",
      "Parking",
      "Security System",
    ],
    specifications: {
      totalUnits: 24,
      floors: 2,
      parkingSpaces: 48,
      unitSizes: "120-180 m²",
      buildingType: "Mountain Houses",
      bedrooms: "2-4 BR",
      bathrooms: "2-3 Bath",
      totalArea: "5,200 m²",
    },
    contact: {
      phone: "+359 749 123 789",
      email: "info@mountainliving.bg",
      website: "www.mountainliving.bg",
      address: "45 Pirin Street, Bansko 2770, Bulgaria",
    },
    highlights: [
      "Direct ski slope access",
      "Traditional Bulgarian architecture",
      "Private gardens included",
      "Year-round mountain activities",
    ],
    nearbyAttractions: [
      "Bansko Ski Resort - 500m",
      "Pirin National Park - 2km",
      "Bansko Old Town - 1km",
      "Dobrinishte Spa - 8km",
    ],
  },
  {
    id: 3,
    slug: "urban-lofts-plovdiv",
    title: "Urban Lofts Plovdiv",
    priceRange: "€180,000 - €320,000",
    shortPrice: "€180k",
    location: "Old Town, Plovdiv",
    city: "Plovdiv",
    image: "/placeholder.svg?height=400&width=600&text=Urban+Lofts",
    description: "Modern lofts in the historic old town with contemporary design.",
    longDescription:
      "Step into contemporary urban living in these stunning lofts located in Plovdiv's historic Old Town. Each unit combines industrial chic design with modern comfort, featuring exposed brick walls, high ceilings, and large windows that flood the space with natural light. The building preserves the historic facade while offering modern amenities including a rooftop terrace with panoramic city views. Walking distance to ancient Roman ruins, galleries, and the best restaurants in Bulgaria's cultural capital.",
    lat: 42.1354,
    lng: 24.7453,
    color: "from-indigo-500 to-indigo-700",
    type: "Mixed-Use Building",
    status: "Under Construction",
    developer: "Plovdiv Heritage Developments",
    completionDate: "Q1 2025",
    rating: 4.6,
    reviews: 14,
    features: ["Historic Location", "Modern Design", "Rooftop Terrace", "Parking", "High Ceilings"],
    images: [
      "/placeholder.svg?height=400&width=600&text=Loft+Interior",
      "/placeholder.svg?height=400&width=600&text=Exposed+Brick",
      "/placeholder.svg?height=400&width=600&text=Rooftop+Terrace",
      "/placeholder.svg?height=400&width=600&text=Kitchen",
      "/placeholder.svg?height=400&width=600&text=Bedroom",
      "/placeholder.svg?height=400&width=600&text=Old+Town+View",
    ],
    floorPlans: [
      "/placeholder.svg?height=400&width=600&text=Studio+Loft",
      "/placeholder.svg?height=400&width=600&text=1BR+Loft",
    ],
    amenities: [
      "Rooftop Terrace",
      "Exposed Brick Walls",
      "High Ceilings",
      "Modern Kitchen",
      "Parking",
      "Security System",
      "Elevator",
      "Storage",
    ],
    specifications: {
      totalUnits: 32,
      floors: 5,
      parkingSpaces: 25,
      unitSizes: "65-140 m²",
      buildingType: "Historic Conversion",
      bedrooms: "Studio-2 BR",
      bathrooms: "1-2 Bath",
      totalArea: "3,200 m²",
    },
    contact: {
      phone: "+359 32 456 789",
      email: "info@plovdivheritage.bg",
      website: "www.plovdivheritage.bg",
      address: "12 Saborna Street, Plovdiv 4000, Bulgaria",
    },
    highlights: [
      "Historic Old Town location",
      "Industrial loft design",
      "Rooftop city views",
      "Walking distance to attractions",
    ],
    nearbyAttractions: [
      "Ancient Theatre of Philippopolis - 300m",
      "Kapana Art District - 200m",
      "Plovdiv Roman Stadium - 400m",
      "Nebet Tepe Hill - 500m",
    ],
  },
  {
    id: 4,
    slug: "luxury-apartments-central-sofia",
    title: "Luxury Apartments Central Sofia",
    priceRange: "€250,000 - €450,000",
    shortPrice: "€250k",
    location: "Sofia Center, Bulgaria",
    city: "Sofia",
    image: "/placeholder.svg?height=400&width=600&text=Luxury+Central",
    description: "Modern luxury apartments in the heart of Sofia with premium finishes and city views.",
    longDescription:
      "Experience urban luxury at its finest in these meticulously designed apartments located in the prestigious Sofia Center. Each unit features premium finishes, floor-to-ceiling windows, and breathtaking city views. The building offers world-class amenities including a fitness center, rooftop terrace, and 24/7 concierge service. With easy access to Sofia's business district, cultural attractions, and fine dining, this is the perfect choice for discerning buyers seeking the ultimate in city living.",
    lat: 42.6977,
    lng: 23.3219,
    color: "from-ds-primary-500 to-ds-primary-700",
    type: "Apartment Complex",
    status: "Under Construction",
    developer: "Sofia Premium Developments",
    completionDate: "Q2 2025",
    rating: 4.8,
    reviews: 24,
    features: ["City Views", "Premium Finishes", "Parking", "Gym", "Concierge", "Rooftop"],
    originalPrice: "€280,000",
    images: [
      "/placeholder.svg?height=400&width=600&text=Luxury+Living",
      "/placeholder.svg?height=400&width=600&text=City+Views",
      "/placeholder.svg?height=400&width=600&text=Premium+Kitchen",
      "/placeholder.svg?height=400&width=600&text=Master+Bedroom",
      "/placeholder.svg?height=400&width=600&text=Rooftop+Terrace",
      "/placeholder.svg?height=400&width=600&text=Lobby",
    ],
    floorPlans: [
      "/placeholder.svg?height=400&width=600&text=1BR+Premium",
      "/placeholder.svg?height=400&width=600&text=2BR+Premium",
    ],
    amenities: [
      "Fitness Center",
      "Rooftop Terrace",
      "24/7 Concierge",
      "Underground Parking",
      "High-Speed Internet",
      "Security System",
      "Elevator",
      "Storage Units",
    ],
    specifications: {
      totalUnits: 120,
      floors: 15,
      parkingSpaces: 150,
      unitSizes: "65-180 m²",
      buildingType: "Residential Tower",
      bedrooms: "1-3 BR",
      bathrooms: "1-2 Bath",
      totalArea: "12,000 m²",
    },
    contact: {
      phone: "+359 2 123 4567",
      email: "info@sofiapremium.bg",
      website: "www.sofiapremium.bg",
      address: "88 Vitosha Boulevard, Sofia 1000, Bulgaria",
    },
    highlights: [
      "Prime city center location",
      "Luxury finishes throughout",
      "Panoramic city views",
      "Full-service building",
    ],
    nearbyAttractions: [
      "Vitosha Boulevard - 100m",
      "National Palace of Culture - 800m",
      "Alexander Nevsky Cathedral - 1.2km",
      "Boyana Church - 8km",
    ],
  },
  {
    id: 5,
    slug: "green-valley-residences-sofia",
    title: "Green Valley Residences Sofia",
    priceRange: "€180,000 - €320,000",
    shortPrice: "€180k",
    location: "Vitosha District, Sofia",
    city: "Sofia",
    image: "/placeholder.svg?height=400&width=600&text=Green+Valley",
    description: "Eco-friendly residential complex surrounded by green spaces and mountain views.",
    longDescription:
      "Embrace sustainable living in this eco-friendly residential complex nestled in Sofia's prestigious Vitosha District. Each home is designed with environmental consciousness in mind, featuring solar panels, energy-efficient systems, and sustainable materials. The development is surrounded by lush green spaces with direct access to Vitosha Mountain hiking trails. Residents enjoy a perfect balance of modern comfort and natural beauty, with panoramic mountain views and fresh air just minutes from the city center.",
    lat: 42.7105,
    lng: 23.3341,
    color: "from-ds-accent-500 to-ds-accent-700",
    type: "Residential Houses",
    status: "Foundation Laid",
    developer: "EcoLiving Bulgaria",
    completionDate: "Q4 2025",
    rating: 4.9,
    reviews: 18,
    features: ["Mountain Views", "Eco-Friendly", "Garden", "Solar Panels", "Green Spaces"],
    images: [
      "/placeholder.svg?height=400&width=600&text=Eco+House",
      "/placeholder.svg?height=400&width=600&text=Mountain+Views",
      "/placeholder.svg?height=400&width=600&text=Solar+Panels",
      "/placeholder.svg?height=400&width=600&text=Garden",
      "/placeholder.svg?height=400&width=600&text=Interior",
      "/placeholder.svg?height=400&width=600&text=Green+Spaces",
    ],
    floorPlans: [
      "/placeholder.svg?height=400&width=600&text=Eco+Home+Plan",
      "/placeholder.svg?height=400&width=600&text=Garden+Layout",
    ],
    amenities: [
      "Solar Panel System",
      "Private Gardens",
      "Mountain Views",
      "Eco-Friendly Materials",
      "Energy Efficient",
      "Hiking Trail Access",
      "Community Garden",
      "Electric Car Charging",
    ],
    specifications: {
      totalUnits: 36,
      floors: 2,
      parkingSpaces: 72,
      unitSizes: "140-220 m²",
      buildingType: "Eco Houses",
      bedrooms: "3-4 BR",
      bathrooms: "2-3 Bath",
      totalArea: "8,500 m²",
    },
    contact: {
      phone: "+359 2 987 6543",
      email: "info@ecoliving.bg",
      website: "www.ecoliving.bg",
      address: "15 Vitosha Nature Park, Sofia 1164, Bulgaria",
    },
    highlights: [
      "100% renewable energy",
      "Direct mountain access",
      "Sustainable construction",
      "Premium location near Vitosha",
    ],
    nearbyAttractions: [
      "Vitosha Mountain - 1km",
      "Boyana Waterfall - 3km",
      "Dragalevtsi Monastery - 2km",
      "Sofia Ring Mall - 5km",
    ],
  },
  // Continue with properties 6-25...
  {
    id: 6,
    slug: "riverside-towers-sofia",
    title: "Riverside Towers Sofia",
    priceRange: "€300,000 - €550,000",
    shortPrice: "€300k",
    location: "Lozenets, Sofia",
    city: "Sofia",
    image: "/placeholder.svg?height=400&width=600&text=Riverside+Towers",
    description: "Premium high-rise towers with river views and luxury amenities.",
    longDescription:
      "Discover sophisticated living in these premium high-rise towers overlooking the Iskar River. Each residence features expansive river views, luxury finishes, and spacious layouts designed for modern living. The complex offers unparalleled amenities including a full-service spa, fitness center with personal trainers, rooftop infinity pool, and 24/7 concierge service. Located in the prestigious Lozenets district, residents enjoy easy access to Sofia's best restaurants, shopping, and cultural venues.",
    lat: 42.6794,
    lng: 23.3192,
    color: "from-orange-500 to-orange-700",
    type: "Mixed-Use Building",
    status: "Framing Complete",
    developer: "Riverside Developments",
    completionDate: "Q1 2025",
    rating: 4.7,
    reviews: 31,
    features: ["River Views", "Luxury Amenities", "Concierge", "Spa", "Pool", "Premium Location"],
    originalPrice: "€350,000",
    images: [
      "/placeholder.svg?height=400&width=600&text=Tower+Exterior",
      "/placeholder.svg?height=400&width=600&text=River+Views",
      "/placeholder.svg?height=400&width=600&text=Luxury+Interior",
      "/placeholder.svg?height=400&width=600&text=Spa+Area",
      "/placeholder.svg?height=400&width=600&text=Infinity+Pool",
      "/placeholder.svg?height=400&width=600&text=Penthouse",
    ],
    floorPlans: [
      "/placeholder.svg?height=400&width=600&text=2BR+Luxury",
      "/placeholder.svg?height=400&width=600&text=3BR+Penthouse",
    ],
    amenities: [
      "Full-Service Spa",
      "Fitness Center",
      "Rooftop Infinity Pool",
      "24/7 Concierge",
      "Valet Parking",
      "Private Wine Cellar",
      "Business Center",
      "River Access",
    ],
    specifications: {
      totalUnits: 95,
      floors: 18,
      parkingSpaces: 120,
      unitSizes: "85-250 m²",
      buildingType: "Luxury High-Rise",
      bedrooms: "1-4 BR",
      bathrooms: "1-3 Bath",
      totalArea: "15,200 m²",
    },
    contact: {
      phone: "+359 2 987 6543",
      email: "info@riverside-dev.bg",
      website: "www.riverside-developments.bg",
      address: "42 Iskar River Boulevard, Sofia 1407, Bulgaria",
    },
    highlights: [
      "Panoramic river views",
      "Full-service luxury amenities",
      "Prime Lozenets location",
      "Architectural landmark design",
    ],
    nearbyAttractions: ["South Park - 500m", "Bulgaria Mall - 1km", "National Stadium - 2km", "City Center - 4km"],
  },
  // Properties 7-25 with similar detailed structure...
  {
    id: 7,
    slug: "modern-living-complex-sofia",
    title: "Modern Living Complex Sofia",
    priceRange: "€220,000 - €380,000",
    shortPrice: "€220k",
    location: "Mladost, Sofia",
    city: "Sofia",
    image: "/placeholder.svg?height=400&width=600&text=Modern+Living",
    description: "Contemporary apartments with smart home technology and modern amenities.",
    longDescription:
      "Step into the future of urban living with these contemporary apartments featuring cutting-edge smart home technology. Each unit is equipped with automated lighting, climate control, and security systems that can be controlled via smartphone. The building showcases modern architecture with clean lines, large windows, and sustainable materials. Residents enjoy a rooftop garden, co-working spaces, and a state-of-the-art fitness center. Located in the dynamic Mladost district with excellent public transport connections.",
    lat: 42.7038,
    lng: 23.337,
    color: "from-purple-500 to-purple-700",
    type: "Apartment Complex",
    status: "Pre-Sales Open",
    developer: "Smart Living Ltd",
    completionDate: "Q3 2025",
    rating: 4.6,
    reviews: 15,
    features: ["Smart Home", "Modern Design", "Fitness Center", "Rooftop", "Co-working", "Tech-Enabled"],
    images: [
      "/placeholder.svg?height=400&width=600&text=Smart+Apartment",
      "/placeholder.svg?height=400&width=600&text=Modern+Kitchen",
      "/placeholder.svg?height=400&width=600&text=Tech+Features",
      "/placeholder.svg?height=400&width=600&text=Rooftop+Garden",
      "/placeholder.svg?height=400&width=600&text=Co-working",
      "/placeholder.svg?height=400&width=600&text=Fitness+Center",
    ],
    floorPlans: [
      "/placeholder.svg?height=400&width=600&text=Smart+1BR",
      "/placeholder.svg?height=400&width=600&text=Smart+2BR",
    ],
    amenities: [
      "Smart Home System",
      "Rooftop Garden",
      "Co-working Spaces",
      "Fitness Center",
      "Electric Car Charging",
      "Package Lockers",
      "High-Speed Internet",
      "Security System",
    ],
    specifications: {
      totalUnits: 78,
      floors: 8,
      parkingSpaces: 85,
      unitSizes: "55-130 m²",
      buildingType: "Smart Residential",
      bedrooms: "1-3 BR",
      bathrooms: "1-2 Bath",
      totalArea: "6,800 m²",
    },
    contact: {
      phone: "+359 2 456 7890",
      email: "info@smartliving.bg",
      website: "www.smartliving.bg",
      address: "25 Mladost Boulevard, Sofia 1712, Bulgaria",
    },
    highlights: [
      "Full smart home integration",
      "Sustainable building design",
      "Modern co-working spaces",
      "Excellent transport links",
    ],
    nearbyAttractions: [
      "Business Park Sofia - 1km",
      "Mall of Sofia - 2km",
      "Inter Expo Center - 3km",
      "Sofia Airport - 8km",
    ],
  },
  // Adding more properties to reach 25...
  {
    id: 8,
    slug: "city-center-lofts-sofia",
    title: "City Center Lofts Sofia",
    priceRange: "€350,000 - €650,000",
    shortPrice: "€350k",
    location: "Serdika, Sofia",
    city: "Sofia",
    image: "/placeholder.svg?height=400&width=600&text=City+Lofts",
    description: "Industrial-style lofts in the historic center with high ceilings and exposed brick.",
    longDescription:
      "Experience the ultimate in urban sophistication in these stunning industrial-style lofts located in Sofia's historic Serdika district. Each unit features soaring ceilings, exposed brick walls, and original architectural details that tell the story of Sofia's industrial heritage. Modern amenities blend seamlessly with historic character, creating unique living spaces that are both functional and inspiring. The building is steps away from ancient Roman ruins, trendy galleries, and the city's best dining and nightlife.",
    lat: 42.6935,
    lng: 23.3281,
    color: "from-red-500 to-red-700",
    type: "Mixed-Use Building",
    status: "Under Construction",
    developer: "Heritage Lofts",
    completionDate: "Q2 2025",
    rating: 4.8,
    reviews: 22,
    features: ["Historic Center", "High Ceilings", "Exposed Brick", "Loft Style", "Roman Ruins Nearby"],
    images: [
      "/placeholder.svg?height=400&width=600&text=Industrial+Loft",
      "/placeholder.svg?height=400&width=600&text=High+Ceilings",
      "/placeholder.svg?height=400&width=600&text=Exposed+Brick",
      "/placeholder.svg?height=400&width=600&text=Historic+Details",
      "/placeholder.svg?height=400&width=600&text=Modern+Kitchen",
      "/placeholder.svg?height=400&width=600&text=City+Views",
    ],
    floorPlans: [
      "/placeholder.svg?height=400&width=600&text=Studio+Loft",
      "/placeholder.svg?height=400&width=600&text=2BR+Loft",
    ],
    amenities: [
      "Historic Architecture",
      "High Ceilings",
      "Exposed Brick",
      "Modern Appliances",
      "Secure Parking",
      "Elevator",
      "Storage",
      "Bike Storage",
    ],
    specifications: {
      totalUnits: 28,
      floors: 6,
      parkingSpaces: 20,
      unitSizes: "80-200 m²",
      buildingType: "Historic Loft Conversion",
      bedrooms: "Studio-3 BR",
      bathrooms: "1-2 Bath",
      totalArea: "3,500 m²",
    },
    contact: {
      phone: "+359 2 321 6547",
      email: "info@heritagelofts.bg",
      website: "www.heritagelofts.bg",
      address: "7 Serdika Street, Sofia 1000, Bulgaria",
    },
    highlights: [
      "Historic Serdika location",
      "Unique loft architecture",
      "Walking distance to everything",
      "Investment potential",
    ],
    nearbyAttractions: [
      "Serdika Roman Ruins - 200m",
      "Sofia History Museum - 300m",
      "Central Market Hall - 400m",
      "National Theatre - 600m",
    ],
  },
  // Continue with remaining properties 9-25...
  {
    id: 9,
    slug: "family-homes-dragalevtsi",
    title: "Family Homes Dragalevtsi",
    priceRange: "€200,000 - €380,000",
    shortPrice: "€200k",
    location: "Dragalevtsi, Sofia",
    city: "Sofia",
    image: "/placeholder.svg?height=400&width=600&text=Family+Homes",
    description: "Spacious family houses with gardens in a quiet neighborhood.",
    longDescription:
      "Create lasting memories in these beautifully designed family homes located in the peaceful Dragalevtsi area. Each house features spacious layouts perfect for growing families, with large gardens where children can play safely. The neighborhood offers a perfect balance of tranquility and convenience, with excellent schools nearby and easy access to both nature and the city center. These homes are designed with family life in mind, featuring practical layouts, storage solutions, and outdoor spaces for entertaining.",
    lat: 42.6354,
    lng: 23.2711,
    color: "from-teal-500 to-teal-700",
    type: "Residential Houses",
    status: "Pre-Sales Open",
    developer: "Family Living Ltd",
    completionDate: "Q4 2025",
    rating: 4.8,
    reviews: 21,
    features: ["Large Gardens", "Family Friendly", "Quiet Area", "Parking", "Schools Nearby"],
    images: [
      "/placeholder.svg?height=400&width=600&text=Family+House",
      "/placeholder.svg?height=400&width=600&text=Large+Garden",
      "/placeholder.svg?height=400&width=600&text=Kids+Room",
      "/placeholder.svg?height=400&width=600&text=Family+Kitchen",
      "/placeholder.svg?height=400&width=600&text=Living+Room",
      "/placeholder.svg?height=400&width=600&text=Neighborhood",
    ],
    floorPlans: [
      "/placeholder.svg?height=400&width=600&text=3BR+Family",
      "/placeholder.svg?height=400&width=600&text=4BR+Family",
    ],
    amenities: [
      "Large Private Gardens",
      "Family-Friendly Design",
      "Quiet Neighborhood",
      "Parking Spaces",
      "Storage Areas",
      "Playground Nearby",
      "School Zone",
      "Security",
    ],
    specifications: {
      totalUnits: 42,
      floors: 2,
      parkingSpaces: 84,
      unitSizes: "160-240 m²",
      buildingType: "Family Houses",
      bedrooms: "3-4 BR",
      bathrooms: "2-3 Bath",
      totalArea: "12,000 m²",
    },
    contact: {
      phone: "+359 2 654 3210",
      email: "info@familyliving.bg",
      website: "www.familyliving.bg",
      address: "33 Dragalevtsi Road, Sofia 1415, Bulgaria",
    },
    highlights: ["Perfect for families", "Large private gardens", "Excellent school district", "Safe neighborhood"],
    nearbyAttractions: [
      "Dragalevtsi Monastery - 1km",
      "Vitosha Nature Park - 2km",
      "Local School - 300m",
      "Shopping Center - 2km",
    ],
  },
  {
    id: 10,
    slug: "sunset-villas-boyana",
    title: "Sunset Villas Boyana",
    priceRange: "€280,000 - €420,000",
    shortPrice: "€280k",
    location: "Boyana, Sofia",
    city: "Sofia",
    image: "/placeholder.svg?height=400&width=600&text=Sunset+Villas",
    description: "Luxury villas with mountain views and private gardens.",
    longDescription:
      "Indulge in luxury living in these exquisite villas nestled in the prestigious Boyana area. Each villa offers breathtaking mountain views, private gardens, and premium finishes throughout. The development combines traditional Bulgarian architecture with modern luxury, featuring natural stone facades, wooden accents, and energy-efficient systems. Located near the famous Boyana Church and National History Museum, these villas offer privacy and exclusivity while remaining connected to Sofia's cultural heritage.",
    lat: 42.6234,
    lng: 23.2567,
    color: "from-amber-500 to-amber-700",
    type: "Residential Houses",
    status: "Under Construction",
    developer: "Sunset Properties",
    completionDate: "Q1 2026",
    rating: 4.9,
    reviews: 8,
    features: ["Mountain Views", "Private Garden", "Luxury Finishes", "Garage", "Premium Location"],
    images: [
      "/placeholder.svg?height=400&width=600&text=Luxury+Villa",
      "/placeholder.svg?height=400&width=600&text=Mountain+Views",
      "/placeholder.svg?height=400&width=600&text=Private+Garden",
      "/placeholder.svg?height=400&width=600&text=Luxury+Interior",
      "/placeholder.svg?height=400&width=600&text=Master+Suite",
      "/placeholder.svg?height=400&width=600&text=Garage",
    ],
    floorPlans: [
      "/placeholder.svg?height=400&width=600&text=Villa+Ground",
      "/placeholder.svg?height=400&width=600&text=Villa+Upper",
    ],
    amenities: [
      "Mountain Views",
      "Private Gardens",
      "Luxury Finishes",
      "Private Garage",
      "Security System",
      "Premium Location",
      "Natural Materials",
      "Energy Efficient",
    ],
    specifications: {
      totalUnits: 16,
      floors: 2,
      parkingSpaces: 32,
      unitSizes: "200-300 m²",
      buildingType: "Luxury Villas",
      bedrooms: "4-5 BR",
      bathrooms: "3-4 Bath",
      totalArea: "8,000 m²",
    },
    contact: {
      phone: "+359 2 789 0123",
      email: "info@sunsetproperties.bg",
      website: "www.sunsetproperties.bg",
      address: "12 Boyana Village, Sofia 1616, Bulgaria",
    },
    highlights: [
      "Exclusive Boyana location",
      "Panoramic mountain views",
      "Luxury villa lifestyle",
      "Cultural heritage nearby",
    ],
    nearbyAttractions: [
      "Boyana Church - 500m",
      "National History Museum - 800m",
      "Vitosha Mountain - 2km",
      "Sofia Ring Road - 3km",
    ],
  },
  // Properties 11-25 with similar structure but varying details...
  ...Array.from({ length: 15 }, (_, i) => {
    const id = i + 11
    const cities = ["Sofia", "Plovdiv", "Varna", "Burgas", "Stara Zagora"]
    const types: ("Apartment Complex" | "Residential Houses" | "Mixed-Use Building")[] = [
      "Apartment Complex",
      "Residential Houses",
      "Mixed-Use Building",
    ]
    const statuses: (
      | "Under Construction"
      | "Foundation Laid"
      | "Framing Complete"
      | "Pre-Sales Open"
      | "Nearly Complete"
    )[] = ["Under Construction", "Foundation Laid", "Framing Complete", "Pre-Sales Open", "Nearly Complete"]

    const city = cities[i % cities.length]
    const type = types[i % types.length]
    const status = statuses[i % statuses.length]
    const basePrice = 150 + i * 25

    return {
      id,
      slug: `property-${id}`,
      title: `${type === "Residential Houses" ? "Premium Houses" : type === "Mixed-Use Building" ? "Urban Complex" : "Modern Apartments"} ${city} ${id}`,
      priceRange: `€${basePrice},000 - €${basePrice + 150},000`,
      shortPrice: `€${basePrice}k`,
      location: `District ${id}, ${city}`,
      city,
      image: `/placeholder.svg?height=400&width=600&text=Property+${id}`,
      description: `${type === "Residential Houses" ? "Beautiful houses" : type === "Mixed-Use Building" ? "Mixed-use development" : "Modern apartments"} in ${city} with excellent amenities.`,
      longDescription: `Discover exceptional living in this ${type.toLowerCase()} development located in ${city}. Each unit is thoughtfully designed with modern amenities and premium finishes. The development offers a perfect blend of comfort, style, and convenience, making it an ideal choice for both residents and investors. With excellent connectivity and nearby attractions, this property represents outstanding value in today's market.`,
      lat: 42.6977 + (Math.random() - 0.5) * 0.2,
      lng: 23.3219 + (Math.random() - 0.5) * 0.2,
      color: `from-${["blue", "green", "purple", "orange", "red"][i % 5]}-500 to-${["blue", "green", "purple", "orange", "red"][i % 5]}-700`,
      type,
      status,
      developer: `${city} Development Group`,
      completionDate: `Q${(i % 4) + 1} 202${5 + (i % 2)}`,
      rating: 4.5 + Math.random() * 0.4,
      reviews: Math.floor(Math.random() * 30) + 5,
      features: ["Modern Design", "Premium Location", "Great Value", "Quality Construction"],
      images: Array.from(
        { length: 6 },
        (_, j) => `/placeholder.svg?height=400&width=600&text=Property+${id}+Image+${j + 1}`,
      ),
      floorPlans: [
        `/placeholder.svg?height=400&width=600&text=Floor+Plan+A`,
        `/placeholder.svg?height=400&width=600&text=Floor+Plan+B`,
      ],
      amenities: [
        "Modern Amenities",
        "Security System",
        "Parking",
        "Quality Finishes",
        "Great Location",
        "Investment Potential",
      ],
      specifications: {
        totalUnits: 20 + i * 5,
        floors: 3 + (i % 15),
        parkingSpaces: 25 + i * 6,
        unitSizes: `${60 + i * 10}-${150 + i * 15} m²`,
        buildingType: type,
        bedrooms: "1-3 BR",
        bathrooms: "1-2 Bath",
        totalArea: `${3000 + i * 500} m²`,
      },
      contact: {
        phone: `+359 ${2 + (i % 8)} ${100 + i}${200 + i}${300 + i}`,
        email: `info@property${id}.bg`,
        website: `www.property${id}.bg`,
        address: `${10 + i} Main Street, ${city} ${1000 + i * 100}, Bulgaria`,
      },
      highlights: ["Excellent location", "Modern design", "Great investment", "Quality construction"],
      nearbyAttractions: [
        `Local Park - ${500 + i * 100}m`,
        `Shopping Center - ${1 + i}km`,
        `School - ${300 + i * 50}m`,
        `Transport Hub - ${800 + i * 200}m`,
      ],
    }
  }),
]

const getPropertyById = (id: number): PropertyData | undefined => {
  return getAllProperties().find((property) => property.id === id)
}

interface PageProps {
  params: {
    id: string
  }
}

export default function ListingDetailPage({ params }: PageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showContactForm, setShowContactForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  // Convert string ID to number
  const propertyId = Number.parseInt(params.id, 10)

  // Check if ID is valid number
  if (isNaN(propertyId)) {
    notFound()
  }

  const property = getPropertyById(propertyId)

  if (!property) {
    notFound()
  }

  const amenityIcons: Record<string, any> = {
    "Fitness Center": Dumbbell,
    "Rooftop Terrace": Trees,
    "24/7 Concierge": Users,
    "Underground Parking": Car,
    "High-Speed Internet": Wifi,
    "Security System": Shield,
    "Smart Home System": Zap,
    "Private Beach Access": Trees,
    "Infinity Pool": Trees,
    "Spa & Wellness Center": Shield,
    "Full-Service Spa": Shield,
    "Rooftop Infinity Pool": Trees,
    "Valet Parking": Car,
    "Private Wine Cellar": Shield,
    "Solar Panel System": Zap,
    "Electric Car Charging": Car,
    "Modern Amenities": CheckCircle,
    Parking: Car,
    "Quality Finishes": CheckCircle,
    "Great Location": MapPin,
    "Investment Potential": Euro,
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Contact form submitted:", formData)
    alert("Thank you for your inquiry! We'll contact you soon.")
    setShowContactForm(false)
    setFormData({ name: "", email: "", phone: "", message: "" })
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length)
  }

  // Track a view once per session for this listing (using sessionStorage key)
  useEffect(() => {
    if (!property?.id) return
    const key = `viewed_listing_${property.id}`
    if (typeof window !== 'undefined' && !sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1')
      // Note: propertyId here is mock numeric; backend expects UUID when using real data
      // Guard call for demos; in real page this should use real project id
      recordProjectView(String(property.id)).catch(() => {})
    }
  }, [property?.id])

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Back Button */}
      <div className="sticky top-16 z-40 bg-background border-b shadow-sm">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Listings</span>
            </Button>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Property Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{property.title}</h1>
                <div className="flex items-center space-x-4 text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-primary" />
                    <span>{property.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 mr-1 text-amber-400 fill-amber-400" />
                    <span className="font-semibold">{property.rating.toFixed(1)}</span>
                    <span className="ml-1">({property.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center">
                    {property.type === "Residential Houses" ? (
                      <Home className="h-5 w-5 mr-2 text-primary" />
                    ) : (
                      <Building className="h-5 w-5 mr-2 text-primary" />
                    )}
                    <span>{property.type}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-baseline space-x-2 mb-2">
                  {property.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">{property.originalPrice}</span>
                  )}
                  <span className="text-3xl font-bold text-primary">{property.priceRange.split(" - ")[0]}</span>
                </div>
                <p className="text-sm text-muted-foreground">Starting price</p>
                <Badge variant="secondary" className="mt-2">
                  {property.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Image Gallery with Navigation */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Main Image */}
              <div className="lg:col-span-2 lg:row-span-2 relative">
                <div className="relative h-64 md:h-96 rounded-xl overflow-hidden group">
                  <Image
                    src={property.images[currentImageIndex] || "/placeholder.svg"}
                    alt={`${property.title} - Image ${currentImageIndex + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Navigation Arrows */}
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {property.images.length}
                  </div>
                </div>
              </div>

              {/* Thumbnail Images */}
              {property.images.slice(1, 4).map((image, index) => (
                <div
                  key={index}
                  className="relative h-32 md:h-44 rounded-xl overflow-hidden cursor-pointer group"
                  onClick={() => setCurrentImageIndex(index + 1)}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${property.title} - Thumbnail ${index + 2}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {currentImageIndex === index + 1 && (
                    <div className="absolute inset-0 bg-primary/20 border-2 border-primary rounded-xl"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Image Thumbnails Row */}
            <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
              {property.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    currentImageIndex === index
                      ? "border-ds-primary-600"
                      : "border-transparent hover:border-ds-neutral-300"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`Thumbnail ${index + 1}`}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {property.type === "Residential Houses" ? (
                      <Home className="h-5 w-5 mr-2 text-primary" />
                    ) : (
                      <Building className="h-5 w-5 mr-2 text-primary" />
                    )}
                    About This Property
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed mb-6">{property.longDescription}</p>

                  {/* Key Features */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-foreground mb-3">Key Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {property.features.map((feature, index) => (
                        <Badge key={index} variant="outline">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Highlights */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Property Highlights</h4>
                    <ul className="space-y-2">
                      {property.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-center text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Specifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Ruler className="h-5 w-5 mr-2 text-primary" />
                    Property Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {property.specifications.totalUnits}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Units</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {property.specifications.floors}
                      </div>
                      <div className="text-sm text-muted-foreground">Floors</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {property.specifications.parkingSpaces}
                      </div>
                      <div className="text-sm text-muted-foreground">Parking Spaces</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-lg font-bold text-primary mb-1">
                        {property.specifications.unitSizes}
                      </div>
                      <div className="text-sm text-muted-foreground">Unit Sizes</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-lg font-bold text-primary mb-1">
                        {property.specifications.bedrooms}
                      </div>
                      <div className="text-sm text-muted-foreground">Bedrooms</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-lg font-bold text-primary mb-1">
                        {property.specifications.bathrooms}
                      </div>
                      <div className="text-sm text-muted-foreground">Bathrooms</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-primary" />
                    Amenities & Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.amenities.map((amenity, index) => {
                      const IconComponent = amenityIcons[amenity] || CheckCircle
                      return (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                          <IconComponent className="h-5 w-5 text-primary flex-shrink-0" />
                          <span className="font-medium text-foreground">{amenity}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Nearby Attractions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-primary" />
                    Nearby Attractions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {property.nearbyAttractions.map((attraction, index) => (
                      <div key={index} className="flex items-center text-muted-foreground">
                        <MapPin className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
                        {attraction}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Developer */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Developer</CardTitle>
                  <p className="text-sm text-muted-foreground">{property.developer}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => {
                      recordProjectPhoneClick(String(property.id)).catch(() => {})
                      window.open(`tel:${property.contact.phone}`)
                    }}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call {property.contact.phone}
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" onClick={() => setShowContactForm(true)}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  {property.contact.website && (
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => {
                        recordProjectWebsiteClick(String(property.id)).catch(() => {})
                        window.open(`https://${property.contact.website}`, "_blank")
                      }}
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Visit Website
                    </Button>
                  )}
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-1">Developer Address:</p>
                    <p className="text-sm text-foreground">{property.contact.address}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Project Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    Project Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Current Status</span>
                      <Badge variant="secondary">{property.status}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Expected Completion</span>
                      <span className="text-sm text-muted-foreground">{property.completionDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Building Type</span>
                      <span className="text-sm text-muted-foreground">{property.specifications.buildingType}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Price Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Euro className="h-5 w-5 mr-2 text-primary" />
                    Price Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Price Range</span>
                      <span className="text-sm font-bold text-primary">{property.priceRange}</span>
                    </div>
                    {property.originalPrice && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Original Price</span>
                        <span className="text-sm text-muted-foreground line-through">{property.originalPrice}</span>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Prices may vary based on unit size, floor, and view. Contact developer for detailed pricing and
                      available units.
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{property.rating.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">Rating</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{property.reviews}</div>
                      <div className="text-xs text-muted-foreground">Reviews</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-foreground">Contact Developer</h3>
                <button
                  onClick={() => setShowContactForm(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-1">
                    Full Name *
                  </label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your full name"
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-1">
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-muted-foreground mb-1">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+359 ..."
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-muted-foreground mb-1">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={`I'm interested in ${property.title}. Please provide more information about available units and pricing.`}
                    rows={4}
                    className="w-full"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowContactForm(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                    Send Message
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
