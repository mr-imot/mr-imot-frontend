"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollAnimationWrapper } from "@/components/scroll-animation-wrapper"
import { MapPin, Building, Star, Award, CheckCircle, Phone, Mail, ExternalLink } from "lucide-react"

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

const developers: Developer[] = [
  {
    id: 1,
    slug: "seaside-properties",
    name: "Seaside Properties Ltd",
    description:
      "Leading coastal development company specializing in luxury beachfront properties. With over 15 years of experience, we create exceptional living spaces that blend modern comfort with stunning sea views.",
    shortDescription: "Luxury beachfront developments with 15+ years of coastal expertise.",
    logo: "/placeholder.svg?height=80&width=80&text=SP",
    coverImage: "/placeholder.svg?height=300&width=600&text=Seaside+Properties",
    location: "Varna, Bulgaria",
    city: "Varna",
    founded: "2008",
    totalProjects: 12,
    activeProjects: 3,
    completedProjects: 9,
    rating: 4.9,
    reviews: 47,
    specialties: ["Beachfront Properties", "Luxury Apartments", "Resort Development"],
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
      "Premier urban development company focused on creating luxury residential and commercial spaces in Sofia's most desirable locations. We combine innovative design with premium materials and finishes.",
    shortDescription: "Premium urban developments in Sofia's prime locations.",
    logo: "/placeholder.svg?height=80&width=80&text=SPD",
    coverImage: "/placeholder.svg?height=300&width=600&text=Sofia+Premium",
    location: "Sofia, Bulgaria",
    city: "Sofia",
    founded: "2010",
    totalProjects: 18,
    activeProjects: 5,
    completedProjects: 13,
    rating: 4.8,
    reviews: 63,
    specialties: ["Luxury Apartments", "City Center Development", "Premium Finishes"],
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
  {
    id: 3,
    slug: "ecoliving-bulgaria",
    name: "EcoLiving Bulgaria",
    description:
      "Sustainable development company pioneering eco-friendly residential projects. We specialize in energy-efficient homes with solar panels, green spaces, and sustainable materials.",
    shortDescription: "Sustainable and eco-friendly residential developments.",
    logo: "/placeholder.svg?height=80&width=80&text=ECO",
    coverImage: "/placeholder.svg?height=300&width=600&text=EcoLiving",
    location: "Sofia, Bulgaria",
    city: "Sofia",
    founded: "2015",
    totalProjects: 8,
    activeProjects: 4,
    completedProjects: 4,
    rating: 4.9,
    reviews: 32,
    specialties: ["Eco-Friendly Homes", "Solar Energy", "Sustainable Materials"],
    contact: {
      phone: "+359 2 987 6543",
      email: "info@ecoliving.bg",
      website: "www.ecoliving.bg",
      address: "15 Vitosha Nature Park, Sofia 1164, Bulgaria",
    },
    verified: true,
    featured: true,
    projectTypes: ["Residential Houses"],
    priceRange: "€180,000 - €380,000",
    establishedYear: 2015,
  },
  {
    id: 4,
    slug: "mountain-living-development",
    name: "Mountain Living Development",
    description:
      "Specialized mountain resort developer creating cozy retreats in Bulgaria's most beautiful mountain locations. Expert in ski-access properties and mountain view homes.",
    shortDescription: "Mountain retreats and ski-access properties specialist.",
    logo: "/placeholder.svg?height=80&width=80&text=ML",
    coverImage: "/placeholder.svg?height=300&width=600&text=Mountain+Living",
    location: "Bansko, Bulgaria",
    city: "Bansko",
    founded: "2012",
    totalProjects: 6,
    activeProjects: 2,
    completedProjects: 4,
    rating: 4.7,
    reviews: 28,
    specialties: ["Mountain Properties", "Ski Access", "Traditional Design"],
    contact: {
      phone: "+359 749 123 789",
      email: "info@mountainliving.bg",
      website: "www.mountainliving.bg",
      address: "45 Pirin Street, Bansko 2770, Bulgaria",
    },
    verified: true,
    featured: false,
    projectTypes: ["Residential Houses"],
    priceRange: "€150,000 - €320,000",
    establishedYear: 2012,
  },
  {
    id: 5,
    slug: "riverside-developments",
    name: "Riverside Developments",
    description:
      "Luxury high-rise developer specializing in premium towers with water views. Known for exceptional amenities, concierge services, and architectural excellence.",
    shortDescription: "Luxury high-rise towers with premium amenities.",
    logo: "/placeholder.svg?height=80&width=80&text=RD",
    coverImage: "/placeholder.svg?height=300&width=600&text=Riverside",
    location: "Sofia, Bulgaria",
    city: "Sofia",
    founded: "2009",
    totalProjects: 10,
    activeProjects: 3,
    completedProjects: 7,
    rating: 4.7,
    reviews: 41,
    specialties: ["High-Rise Towers", "Luxury Amenities", "River Views"],
    contact: {
      phone: "+359 2 987 6543",
      email: "info@riverside-dev.bg",
      website: "www.riverside-developments.bg",
      address: "42 Iskar River Boulevard, Sofia 1407, Bulgaria",
    },
    verified: true,
    featured: false,
    projectTypes: ["Mixed-Use Building", "Apartment Complex"],
    priceRange: "€300,000 - €650,000",
    establishedYear: 2009,
  },
  {
    id: 6,
    slug: "plovdiv-heritage",
    name: "Plovdiv Heritage Developments",
    description:
      "Historic preservation and modern development company specializing in converting heritage buildings into contemporary living spaces while preserving cultural significance.",
    shortDescription: "Heritage building conversions and historic preservation.",
    logo: "/placeholder.svg?height=80&width=80&text=PH",
    coverImage: "/placeholder.svg?height=300&width=600&text=Plovdiv+Heritage",
    location: "Plovdiv, Bulgaria",
    city: "Plovdiv",
    founded: "2013",
    totalProjects: 7,
    activeProjects: 2,
    completedProjects: 5,
    rating: 4.6,
    reviews: 23,
    specialties: ["Historic Conversion", "Cultural Preservation", "Modern Lofts"],
    contact: {
      phone: "+359 32 456 789",
      email: "info@plovdivheritage.bg",
      website: "www.plovdivheritage.bg",
      address: "12 Saborna Street, Plovdiv 4000, Bulgaria",
    },
    verified: true,
    featured: false,
    projectTypes: ["Mixed-Use Building"],
    priceRange: "€180,000 - €350,000",
    establishedYear: 2013,
  },
  {
    id: 7,
    slug: "smart-living-ltd",
    name: "Smart Living Ltd",
    description:
      "Technology-forward developer creating smart homes with integrated automation systems. Pioneers in IoT-enabled residential buildings and energy-efficient design.",
    shortDescription: "Smart home technology and automation specialists.",
    logo: "/placeholder.svg?height=80&width=80&text=SL",
    coverImage: "/placeholder.svg?height=300&width=600&text=Smart+Living",
    location: "Sofia, Bulgaria",
    city: "Sofia",
    founded: "2017",
    totalProjects: 5,
    activeProjects: 3,
    completedProjects: 2,
    rating: 4.6,
    reviews: 19,
    specialties: ["Smart Home Technology", "IoT Integration", "Energy Efficiency"],
    contact: {
      phone: "+359 2 456 7890",
      email: "info@smartliving.bg",
      website: "www.smartliving.bg",
      address: "25 Mladost Boulevard, Sofia 1712, Bulgaria",
    },
    verified: true,
    featured: false,
    projectTypes: ["Apartment Complex"],
    priceRange: "€220,000 - €420,000",
    establishedYear: 2017,
  },
  {
    id: 8,
    slug: "heritage-lofts",
    name: "Heritage Lofts",
    description:
      "Industrial conversion specialists transforming historic buildings into unique loft-style living spaces. Expert in preserving architectural character while adding modern amenities.",
    shortDescription: "Industrial loft conversions and historic transformations.",
    logo: "/placeholder.svg?height=80&width=80&text=HL",
    coverImage: "/placeholder.svg?height=300&width=600&text=Heritage+Lofts",
    location: "Sofia, Bulgaria",
    city: "Sofia",
    founded: "2014",
    totalProjects: 4,
    activeProjects: 2,
    completedProjects: 2,
    rating: 4.8,
    reviews: 16,
    specialties: ["Industrial Conversion", "Loft Design", "Historic Preservation"],
    contact: {
      phone: "+359 2 321 6547",
      email: "info@heritagelofts.bg",
      website: "www.heritagelofts.bg",
      address: "7 Serdika Street, Sofia 1000, Bulgaria",
    },
    verified: true,
    featured: false,
    projectTypes: ["Mixed-Use Building"],
    priceRange: "€350,000 - €750,000",
    establishedYear: 2014,
  },
]

// Consistent Developer Card Component
function DeveloperCard({
  developer,
  index,
  isFeatured = false,
}: { developer: Developer; index: number; isFeatured?: boolean }) {
  return (
    <ScrollAnimationWrapper delay={300 + index * 50}>
      <Card className="group bg-white shadow-md hover:shadow-2xl border border-ds-neutral-200 hover:border-ds-primary-300 transition-all duration-300 hover:-translate-y-2 overflow-hidden h-full">
        <CardContent className="p-6 h-full flex flex-col">
          <div className="flex items-start space-x-4 mb-4">
            {/* Logo */}
            <div className="relative w-16 h-16 bg-ds-neutral-100 rounded-xl p-2 flex-shrink-0 group-hover:bg-ds-primary-50 transition-colors duration-300">
              <Image
                src={developer.logo || "/placeholder.svg"}
                alt={`${developer.name} logo`}
                fill
                className="object-contain rounded-xl"
              />
            </div>

            {/* Header Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold text-ds-neutral-900 group-hover:text-ds-primary-600 transition-colors duration-300 line-clamp-2 leading-tight">
                  {developer.name}
                </h3>
                <div className="flex flex-col items-end space-y-1 ml-2">
                  {isFeatured && (
                    <Badge className="bg-ds-accent-500 text-white text-xs font-semibold whitespace-nowrap">
                      <Award className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {developer.verified && (
                    <Badge
                      variant="outline"
                      className="text-xs whitespace-nowrap border-ds-primary-200 text-ds-primary-600"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center text-ds-neutral-600 mb-2">
                <MapPin className="h-3 w-3 mr-1 text-ds-accent-500 flex-shrink-0" />
                <span className="text-sm truncate">{developer.location}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-ds-neutral-700 leading-relaxed line-clamp-3 mb-4 flex-grow">
            {developer.shortDescription}
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 py-3 mb-4 bg-ds-neutral-50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-ds-primary-600">{developer.totalProjects}</div>
              <div className="text-xs text-ds-neutral-600">Projects</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-ds-primary-600">{developer.rating}</div>
              <div className="text-xs text-ds-neutral-600">Rating</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-ds-primary-600">{developer.reviews}</div>
              <div className="text-xs text-ds-neutral-600">Reviews</div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-ds-neutral-600">
                <Building className="h-4 w-4 mr-1 text-ds-primary-600" />
                <span>{developer.activeProjects} active projects</span>
              </div>
              <div className="flex items-center text-ds-neutral-600">
                <Star className="h-4 w-4 mr-1 text-amber-400 fill-amber-400" />
                <span>Since {developer.founded}</span>
              </div>
            </div>
            <div className="text-sm font-semibold text-ds-primary-600">{developer.priceRange}</div>
          </div>

          {/* CTA Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-auto">
            <Button
              asChild
              className="bg-ds-primary-600 hover:bg-ds-primary-700 text-white font-semibold py-2 text-sm rounded-lg transition-all duration-300 group-hover:bg-ds-primary-700"
            >
              <Link href={`/developer/${developer.id}`}>View Profile</Link>
            </Button>
            <Button
              variant="outline"
              className="border-ds-primary-600 text-ds-primary-600 hover:bg-ds-primary-50 font-semibold py-2 text-sm rounded-lg transition-all duration-300 bg-transparent"
              onClick={() => window.open(`tel:${developer.contact.phone}`)}
            >
              <Phone className="h-3 w-3 mr-1" />
              Contact
            </Button>
          </div>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-ds-neutral-300 text-ds-neutral-600 hover:bg-ds-neutral-50 bg-transparent"
              onClick={() => window.open(`mailto:${developer.contact.email}`)}
            >
              <Mail className="h-3 w-3 mr-1" />
              Email
            </Button>
            {developer.contact.website && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-ds-neutral-300 text-ds-neutral-600 hover:bg-ds-neutral-50 bg-transparent"
                onClick={() => window.open(`https://${developer.contact.website}`, "_blank")}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Website
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </ScrollAnimationWrapper>
  )
}

export default function DevelopersPage() {
  const featuredDevelopers = developers.filter((dev) => dev.featured)
  const allDevelopers = developers.sort((a, b) => b.rating - a.rating)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <ScrollAnimationWrapper>
        <section className="relative w-full py-16 md:py-20 lg:py-24 bg-gradient-to-br from-ds-primary-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-ds-neutral-900">
                Meet Our
                <span className="text-ds-primary-600 block">Verified Developers</span>
              </h1>
              <p className="text-xl md:text-2xl text-ds-neutral-600 leading-relaxed max-w-3xl mx-auto">
                Connect directly with Bulgaria's most trusted real estate developers. No middlemen, no commissions, just
                direct access to quality projects.
              </p>
              <div className="flex items-center justify-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-ds-primary-600">{developers.length}</div>
                  <div className="text-sm text-ds-neutral-600">Verified Developers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-ds-primary-600">
                    {developers.reduce((sum, dev) => sum + dev.totalProjects, 0)}
                  </div>
                  <div className="text-sm text-ds-neutral-600">Total Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-ds-primary-600">
                    {developers.reduce((sum, dev) => sum + dev.activeProjects, 0)}
                  </div>
                  <div className="text-sm text-ds-neutral-600">Active Projects</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollAnimationWrapper>

      {/* Featured Developers */}
      {featuredDevelopers.length > 0 && (
        <ScrollAnimationWrapper delay={200}>
          <section className="py-16 md:py-20 bg-white relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-full h-full">
                <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="featured-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e40af" strokeWidth="0.5" opacity="0.3" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#featured-grid)" />
                </svg>
              </div>
            </div>

            <div className="container px-4 md:px-6 relative z-10">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center bg-ds-accent-50 text-ds-accent-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                    <Award className="h-4 w-4 mr-2" />
                    Top Rated Developers
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-ds-neutral-900 mb-4">Featured Developers</h2>
                  <p className="text-lg text-ds-neutral-600 max-w-2xl mx-auto">
                    Our highest-rated developers with exceptional track records and outstanding projects.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {featuredDevelopers.map((developer, index) => (
                    <DeveloperCard key={developer.id} developer={developer} index={index} isFeatured={true} />
                  ))}
                </div>
              </div>
            </div>

            {/* Smooth Transition Element */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-ds-neutral-50"></div>
          </section>
        </ScrollAnimationWrapper>
      )}

      {/* All Developers */}
      <ScrollAnimationWrapper delay={400}>
        <section className="py-16 md:py-20 bg-ds-neutral-50 relative">
          {/* Smooth Transition from Featured */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent"></div>

          <div className="container px-4 md:px-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-ds-neutral-900 mb-4">All Developers</h2>
                <p className="text-lg text-ds-neutral-600 max-w-2xl mx-auto">
                  Browse our complete directory of verified real estate developers across Bulgaria.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {allDevelopers.map((developer, index) => (
                  <DeveloperCard
                    key={developer.id}
                    developer={developer}
                    index={index}
                    isFeatured={developer.featured}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </ScrollAnimationWrapper>

      {/* CTA Section */}
      <ScrollAnimationWrapper delay={600}>
        <section className="py-16 md:py-20 bg-gradient-to-br from-ds-primary-600 via-ds-primary-700 to-ds-primary-800 text-white relative overflow-hidden">
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
          </div>

          <div className="container px-4 md:px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">Are You a Developer?</h2>
              <p className="text-xl text-white/90 leading-relaxed">
                Join our platform and connect directly with buyers. No commissions, no middlemen, just direct access to
                your target market.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-ds-accent-500 hover:bg-ds-accent-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Link href="/register?type=developer">Join as Developer</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-ds-primary-700 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 bg-transparent"
                >
                  <Link href="/contact">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </ScrollAnimationWrapper>
    </div>
  )
}
