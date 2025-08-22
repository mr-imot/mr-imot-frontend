"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollAnimationWrapper } from "@/components/scroll-animation-wrapper"
import { MapPin, Building, Star, Award, CheckCircle, Phone, Mail, ExternalLink } from "lucide-react"
import { useDevelopers } from "@/hooks/use-developers"

export default function DevelopersPage() {
  const { developers, loading, error } = useDevelopers()

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading developers...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Error Loading Developers</h1>
            <p className="text-gray-600">Unable to load developer information. Please try again later.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <ScrollAnimationWrapper>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Verified Developers
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover Bulgaria's leading real estate developers, all verified and trusted by the Mr. Imot community.
            </p>
          </ScrollAnimationWrapper>
        </div>
      </section>

      {/* Developers Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {developers && developers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {developers.map((developer, index) => (
                <ScrollAnimationWrapper key={developer.id} delay={index * 100}>
                  <Card className="group hover:shadow-xl transition-all duration-300 h-full">
                    <CardContent className="p-0">
                      {/* Cover Image */}
                      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-t-lg">
                        <div className="absolute inset-0 bg-black/20 rounded-t-lg"></div>
                        <div className="absolute top-4 left-4 flex gap-2">
                          {developer.is_verified && (
                            <Badge className="bg-green-500 text-white">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Developer Info */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                              {developer.company_name}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500 mb-2">
                              <MapPin className="w-4 h-4 mr-1" />
                              {developer.city}
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {developer.description}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <div className="flex items-center">
                            <Building className="w-4 h-4 mr-1" />
                            <span>Active Projects</span>
                          </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-2 mb-4">
                          {developer.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="w-4 h-4 mr-2" />
                              <span>{developer.phone}</span>
                            </div>
                          )}
                          {developer.email && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="w-4 h-4 mr-2" />
                              <span>{developer.email}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <Button asChild className="w-full">
                          <Link href={`/developer/${developer.id}`}>
                            View Profile
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </ScrollAnimationWrapper>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Building className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Developers Found</h3>
              <p className="text-gray-600">No verified developers are currently available.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
