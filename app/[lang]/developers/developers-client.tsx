"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollAnimationWrapper } from "@/components/scroll-animation-wrapper"
import { MapPin, Building, CheckCircle, Globe, ExternalLink } from "lucide-react"
import { useDevelopers } from "@/hooks/use-developers"

interface DevelopersClientProps {
  dict: any
  lang: 'en' | 'bg'
}

export default function DevelopersClient({ dict, lang }: DevelopersClientProps) {
  const { developers, loading, error, pagination } = useDevelopers({ per_page: 20 })

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{dict.developers.loading}</p>
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
            <h1 className="text-3xl font-bold text-destructive mb-4">{dict.developers.errorTitle}</h1>
            <p className="text-muted-foreground">{dict.developers.errorMessage}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section (i18n) */}
      <section className="bg-gradient-to-br from-muted to-muted/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <ScrollAnimationWrapper>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              {dict.developers.pageTitle}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {dict.developers.pageDescription}
            </p>
          </ScrollAnimationWrapper>
        </div>
      </section>

      {/* Developers Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {developers && developers.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {developers.map((developer: any, index: number) => (
                  <ScrollAnimationWrapper key={developer.id} delay={index * 100}>
                    <Card className="group hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                      <CardContent className="p-0 flex flex-col h-full">
                        {/* Cover Image */}
                        <div className="relative h-48 bg-gradient-to-br from-primary to-primary/80 rounded-t-lg overflow-hidden">
                          {developer.profile_image_url ? (
                            <>
                              <Image
                                src={developer.profile_image_url}
                                alt={`${developer.company_name} profile`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                              <div className="absolute inset-0 bg-black/20"></div>
                            </>
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80"></div>
                          )}

                          {/* Verification Badge */}
                          <div className="absolute top-4 left-4 flex gap-2">
                            {developer.is_verified && (
                              <Badge className="bg-green-500 text-white">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {dict.developers.verified}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Developer Info */}
                        <div className="p-6 flex flex-col flex-grow">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-grow">
                              <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                {developer.company_name}
                              </h3>
                              {developer.contact_person && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {dict.developers.contact}: {developer.contact_person}
                                </p>
                              )}
                              <div className="flex items-center text-sm text-muted-foreground mb-2">
                                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                                <span className="break-words">{developer.office_address}</span>
                              </div>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                            <div className="flex items-center">
                              <Building className="w-4 h-4 mr-1 flex-shrink-0" />
                              <span>{developer.project_count || 0} {dict.developers.activeProjects}</span>
                            </div>
                          </div>

                          {/* Contact Info */}
                          <div className="space-y-2 mb-4 flex-grow">
                            {developer.phone && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span>{developer.phone}</span>
                              </div>
                            )}
                            {developer.website ? (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Globe className="w-4 h-4 mr-2 flex-shrink-0" />
                                <a
                                  href={developer.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-primary/80 hover:underline"
                                >
                                  {dict.developers.website}
                                </a>
                              </div>
                            ) : (
                              <div className="flex items-center text-sm text-muted-foreground opacity-0">
                                <Globe className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span>{dict.developers.website}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Button */}
                          <Button asChild className="w-full mt-auto">
                            <Link href={`/${lang}/developers/${developer.id}`}>
                              {dict.developers.viewProfile}
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </ScrollAnimationWrapper>
                ))}
              </div>

              {/* Pagination Info */}
              {pagination && pagination.total_pages > 1 && (
                <div className="mt-8 text-center text-muted-foreground">
                  <p>
                    {dict.developers.showingResults
                      .replace('{{count}}', String(developers.length))
                      .replace('{{total}}', String(pagination.total))}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <Building className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">{dict.developers.noDevelopersFound}</h3>
              <p className="text-muted-foreground">{dict.developers.noDevelopersMessage}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}


