"use client"

import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollAnimationWrapper } from "@/components/scroll-animation-wrapper"
import {
  MapPin,
  Star,
  Building,
  Home,
  Phone,
  Mail,
  Globe,
  Calendar,
  Award,
  TrendingUp,
  CheckCircle,
  ArrowLeft,
  ExternalLink,
  Heart,
} from "lucide-react"

interface Developer {
  id: number
  slug: string
  name: string
  description: string
  shortDescription: string
  logo: string
  coverImage: string
  location: string
  city: string
  founded: string
  totalProjects: number
  activeProjects: number
  completedProjects: number
  rating: number
  reviews: number
  specialties: string[]
  contact: {
    phone: string
    email: string
    website?: string
    address: string
  }
  verified: boolean
  featured: boolean
  projectTypes: string[]
  priceRange: string
  establishedYear: number
}

interface Property {
  id: number
  title: string
  priceRange: string
  location: string
  image: string
  description: string
  type: "Apartment Complex" | "Residential Houses" | "Mixed-Use Building"
  status: "Under Construction" | "Foundation Laid" | "Framing Complete" | "Pre-Sales Open" | "Nearly Complete"
  completionDate: string
  rating: number
  reviews: number
  features: string[]
}

// Mock data - in real app this would come from API/database
const developers: Developer[] = [
  {
    id: 1,
    slug: "seaside-properties",
    name: "Seaside Properties Ltd",
    description:
      "Leading coastal development company specializing in luxury beachfront properties. With over 15 years of experience in coastal development, Seaside Properties has established itself as the premier developer of luxury beachfront residences along Bulgaria's Black Sea coast. Our commitment to excellence is reflected in every project we undertake, from initial design concepts to final construction details. We understand that waterfront living represents more than just a home – it's a lifestyle choice that demands the highest standards of quality, design, and service. Our team of experienced architects, engineers, and project managers work together to create exceptional living spaces that seamlessly blend modern comfort with the natural beauty of coastal environments. Each of our developments features premium materials, cutting-edge construction techniques, and thoughtful amenities designed to enhance the coastal living experience.",
    shortDescription: "Luxury beachfront developments with 15+ years of coastal expertise.",
    logo: "/placeholder.svg?height=120&width=120&text=SP",
    coverImage: "/placeholder.svg?height=400&width=800&text=Seaside+Properties+Cover",
    location: "Varna, Bulgaria",
    city: "Varna",
    founded: "2008",
    totalProjects: 12,
    activeProjects: 3,
    completedProjects: 9,
    rating: 4.9,
    reviews: 47,
    specialties: ["Beachfront Properties", "Luxury Apartments", "Resort Development", "Marina Projects"],
    contact: {
      phone: "+359 52 123 456",
      email: "info@seasideproperties.bg",
      website: "www.seasideproperties.bg",
      address: "123 Seaside Boulevard, Varna 9000, Bulgaria",
    },
    verified: true,
    featured: true,
    projectTypes: ["Apartment Complex", "Mixed-Use Building"],
    priceRange: "€200,000 - €500,000",
    establishedYear: 2008,
  },
  {
    id: 2,
    slug: "sofia-premium-developments",
    name: "Sofia Premium Developments",
    description:
      "Premier urban development company focused on creating luxury residential and commercial spaces in Sofia's most desirable locations. We combine innovative design with premium materials and finishes to deliver exceptional urban living experiences.",
    shortDescription: "Premium urban developments in Sofia's prime locations.",
    logo: "/placeholder.svg?height=120&width=120&text=SPD",
    coverImage: "/placeholder.svg?height=400&width=800&text=Sofia+Premium+Cover",
    location: "Sofia, Bulgaria",
    city: "Sofia",
    founded: "2010",
    totalProjects: 18,
    activeProjects: 5,
    completedProjects: 13,
    rating: 4.8,
    reviews: 63,
    specialties: ["Luxury Apartments", "City Center Development", "Premium Finishes", "Commercial Spaces"],
    contact: {
      phone: "+359 2 123 4567",
      email: "info@sofiapremium.bg",
      website: "www.sofiapremium.bg",
      address: "88 Vitosha Boulevard, Sofia 1000, Bulgaria",
    },
    verified: true,
    featured: true,
    projectTypes: ["Apartment Complex", "Mixed-Use Building"],
    priceRange: "€250,000 - €650,000",
    establishedYear: 2010,
  },
  // Add other developers as needed...
]

// Mock properties data for each developer
const getPropertiesByDeveloper = (developerId: number): Property[] => {
  const propertiesMap: Record<number, Property[]> = {
    1: [
      // Seaside Properties
      {
        id: 1,
        title: "Seaside Apartments Varna",
        priceRange: "€200,000 - €400,000",
        location: "Varna Beach, Bulgaria",
        image: "/placeholder.svg?height=300&width=400&text=Seaside+Apartments",
        description: "Beachfront apartments with stunning sea views and resort-style amenities.",
        type: "Apartment Complex",
        status: "Under Construction",
        completionDate: "Q1 2026",
        rating: 4.9,
        reviews: 12,
        features: ["Sea Views", "Beach Access", "Resort Amenities", "Pool"],
      },
      {
        id: 11,
        title: "Marina Bay Residences",
        priceRange: "€300,000 - €550,000",
        location: "Varna Marina, Bulgaria",
        image: "/placeholder.svg?height=300&width=400&text=Marina+Bay",
        description: "Luxury waterfront residences with private marina access.",
        type: "Mixed-Use Building",
        status: "Pre-Sales Open",
        completionDate: "Q3 2025",
        rating: 4.8,
        reviews: 8,
        features: ["Marina Access", "Luxury Finishes", "Concierge", "Spa"],
      },
      {
        id: 12,
        title: "Coastal Gardens",
        priceRange: "€250,000 - €450,000",
        location: "Golden Sands, Varna",
        image: "/placeholder.svg?height=300&width=400&text=Coastal+Gardens",
        description: "Garden-style apartments near the beach with resort amenities.",
        type: "Apartment Complex",
        status: "Foundation Laid",
        completionDate: "Q2 2026",
        rating: 4.7,
        reviews: 5,
        features: ["Garden Views", "Beach Proximity", "Pool", "Fitness Center"],
      },
    ],
    2: [
      // Sofia Premium Developments
      {
        id: 4,
        title: "Luxury Apartments Central",
        priceRange: "€250,000 - €450,000",
        location: "Sofia Center, Bulgaria",
        image: "/placeholder.svg?height=300&width=400&text=Luxury+Central",
        description: "Modern luxury apartments in the heart of Sofia with premium finishes and city views.",
        type: "Apartment Complex",
        status: "Under Construction",
        completionDate: "Q2 2025",
        rating: 4.8,
        reviews: 24,
        features: ["City Views", "Premium Finishes", "Parking", "Gym"],
      },
      {
        id: 13,
        title: "Vitosha Boulevard Towers",
        priceRange: "€400,000 - €800,000",
        location: "Vitosha Boulevard, Sofia",
        image: "/placeholder.svg?height=300&width=400&text=Vitosha+Towers",
        description: "Premium high-rise towers on Sofia's main shopping street.",
        type: "Mixed-Use Building",
        status: "Pre-Sales Open",
        completionDate: "Q4 2025",
        rating: 4.9,
        reviews: 15,
        features: ["Shopping Access", "City Views", "Luxury Amenities", "Concierge"],
      },
    ],
  }

  return propertiesMap[developerId] || []
}

const getDeveloperById = (id: number): Developer | undefined => {
  return developers.find((dev) => dev.id === id)
}

interface PageProps {
  params: {
    id: string
  }
}

export default function DeveloperDetailPage({ params }: PageProps) {
  const developerId = Number.parseInt(params.id, 10)

  if (isNaN(developerId)) {
    notFound()
  }

  const developer = getDeveloperById(developerId)

  if (!developer) {
    notFound()
  }

  const properties = getPropertiesByDeveloper(developerId)

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Back Button */}
      <div className="sticky top-16 z-40 bg-white border-b border-ds-neutral-200 shadow-sm">
        <div className="container px-4 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Developers</span>
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <ScrollAnimationWrapper>
        <section className="relative">
          {/* Cover Image */}
          <div className="relative h-64 md:h-80 lg:h-96 w-full overflow-hidden">
            <Image
              src={developer.coverImage || "/placeholder.svg"}
              alt={`${developer.name} cover`}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>

          {/* Developer Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="container">
              <div className="flex items-end space-x-6">
                {/* Logo */}
                <div className="relative w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl p-4 shadow-xl flex-shrink-0">
                  <Image
                    src={developer.logo || "/placeholder.svg"}
                    alt={`${developer.name} logo`}
                    fill
                    className="object-contain rounded-2xl"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 text-white space-y-2">
                  <div className="flex items-center space-x-3">
                    <h1 className="text-3xl md:text-4xl font-bold">{developer.name}</h1>
                    {developer.verified && (
                      <Badge className="bg-ds-primary-600 text-white">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {developer.featured && (
                      <Badge className="bg-ds-accent-500 text-white">
                        <Award className="h-4 w-4 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-white/90">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span>{developer.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      <span>Since {developer.founded}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-5 w-5 mr-1 text-amber-400 fill-amber-400" />
                      <span className="font-semibold">{developer.rating}</span>
                      <span className="ml-1">({developer.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollAnimationWrapper>

      <div className="container px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              <ScrollAnimationWrapper delay={200}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building className="h-5 w-5 mr-2 text-ds-primary-600" />
                      About {developer.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-ds-neutral-700 leading-relaxed mb-6">{developer.description}</p>

                    {/* Specialties */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-ds-neutral-900 mb-3">Specialties</h4>
                      <div className="flex flex-wrap gap-2">
                        {developer.specialties.map((specialty, index) => (
                          <Badge key={index} variant="outline" className="text-ds-accent-600 border-ds-accent-200">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Project Types */}
                    <div>
                      <h4 className="font-semibold text-ds-neutral-900 mb-3">Project Types</h4>
                      <div className="flex flex-wrap gap-2">
                        {developer.projectTypes.map((type, index) => (
                          <Badge key={index} variant="outline" className="text-ds-primary-600 border-ds-primary-200">
                            {type === "Residential Houses" ? (
                              <Home className="h-3 w-3 mr-1" />
                            ) : (
                              <Building className="h-3 w-3 mr-1" />
                            )}
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollAnimationWrapper>

              {/* Projects Section */}
              <ScrollAnimationWrapper delay={300}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-ds-primary-600" />
                        Current Projects ({properties.length})
                      </div>
                      <Link
                        href="/listings"
                        className="text-ds-primary-600 hover:text-ds-primary-700 text-sm font-medium"
                      >
                        View All Projects →
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {properties.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {properties.map((property) => (
                          <Link key={property.id} href={`/listing/${property.id}`}>
                            <Card className="group border border-ds-neutral-200 hover:border-ds-primary-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                              <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                                <Image
                                  src={property.image || "/placeholder.svg"}
                                  alt={property.title}
                                  fill
                                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <button
                                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                  }}
                                >
                                  <Heart className="h-4 w-4 text-ds-neutral-600 hover:text-red-500" />
                                </button>
                                <div className="absolute bottom-3 left-3 bg-ds-accent-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                  {property.status}
                                </div>
                              </div>
                              <CardContent className="p-4 space-y-3">
                                <div className="space-y-1">
                                  <h3 className="text-lg font-bold text-ds-neutral-900 group-hover:text-ds-primary-600 transition-colors duration-300 line-clamp-1">
                                    {property.title}
                                  </h3>
                                  <p className="text-sm text-ds-neutral-600 flex items-center">
                                    <MapPin className="h-3 w-3 mr-1 text-ds-accent-500" />
                                    {property.location}
                                  </p>
                                </div>
                                <p className="text-sm text-ds-neutral-700 line-clamp-2">{property.description}</p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                                    <span className="font-semibold text-sm">{property.rating}</span>
                                    <span className="text-xs text-ds-neutral-500">({property.reviews})</span>
                                  </div>
                                  <div className="text-sm font-bold text-ds-primary-600">
                                    {property.priceRange.split(" - ")[0]}
                                  </div>
                                </div>
                                <div className="text-xs text-ds-neutral-600">Completion: {property.completionDate}</div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-ds-neutral-600">
                        <Building className="h-12 w-12 mx-auto mb-4 text-ds-neutral-400" />
                        <p>No active projects at the moment.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </ScrollAnimationWrapper>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats Card */}
              <ScrollAnimationWrapper delay={400}>
                <Card>
                  <CardHeader>
                    <CardTitle>Company Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-ds-primary-50 rounded-lg">
                        <div className="text-2xl font-bold text-ds-primary-600">{developer.totalProjects}</div>
                        <div className="text-sm text-ds-neutral-600">Total Projects</div>
                      </div>
                      <div className="text-center p-4 bg-ds-accent-50 rounded-lg">
                        <div className="text-2xl font-bold text-ds-accent-600">{developer.activeProjects}</div>
                        <div className="text-sm text-ds-neutral-600">Active Projects</div>
                      </div>
                      <div className="text-center p-4 bg-ds-neutral-50 rounded-lg">
                        <div className="text-2xl font-bold text-ds-neutral-700">{developer.completedProjects}</div>
                        <div className="text-sm text-ds-neutral-600">Completed</div>
                      </div>
                      <div className="text-center p-4 bg-amber-50 rounded-lg">
                        <div className="text-2xl font-bold text-amber-600">{developer.rating}</div>
                        <div className="text-sm text-ds-neutral-600">Rating</div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-ds-neutral-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Price Range</span>
                        <span className="font-bold text-ds-primary-600">{developer.priceRange}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollAnimationWrapper>

              {/* Contact Card */}
              <ScrollAnimationWrapper delay={500}>
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      className="w-full bg-ds-primary-600 hover:bg-ds-primary-700 text-white"
                      onClick={() => window.open(`tel:${developer.contact.phone}`)}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call {developer.contact.phone}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => window.open(`mailto:${developer.contact.email}`)}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                    {developer.contact.website && (
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() => window.open(`https://${developer.contact.website}`, "_blank")}
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Visit Website
                        <ExternalLink className="h-3 w-3 ml-2" />
                      </Button>
                    )}
                    <div className="pt-4 border-t border-ds-neutral-200">
                      <p className="text-sm text-ds-neutral-600 mb-1">Office Address:</p>
                      <p className="text-sm text-ds-neutral-800">{developer.contact.address}</p>
                    </div>
                  </CardContent>
                </Card>
              </ScrollAnimationWrapper>

              {/* Reviews Summary */}
              <ScrollAnimationWrapper delay={600}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Star className="h-5 w-5 mr-2 text-amber-400 fill-amber-400" />
                      Reviews & Rating
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-2">
                      <div className="text-4xl font-bold text-ds-primary-600">{developer.rating}</div>
                      <div className="flex justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.floor(developer.rating) ? "text-amber-400 fill-amber-400" : "text-ds-neutral-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-ds-neutral-600">Based on {developer.reviews} reviews</p>
                    </div>
                  </CardContent>
                </Card>
              </ScrollAnimationWrapper>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
