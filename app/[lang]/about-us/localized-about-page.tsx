"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollAnimationWrapper } from "@/components/scroll-animation-wrapper"
import { AngledSeparator } from "@/components/angled-separator"
import { Shield, Eye, Users, Building } from "lucide-react"
import { useLocale } from "@/lib/locale-context"

interface LocalizedAboutPageProps {
  dict: any
  lang: 'en' | 'bg'
}

export function LocalizedAboutPage({ dict, lang }: LocalizedAboutPageProps) {
  const locale = useLocale()

  // Helper function to generate localized URLs
  const href = (en: string, bg: string) => {
    return locale === 'bg' ? `/bg/${bg}` : `/${en}`
  }

  const features = [
    {
      icon: Shield,
      title: dict.about.verifiedDevelopers,
      description: dict.about.verifiedDevelopersDesc,
    },
    {
      icon: Eye,
      title: dict.about.transparentListings,
      description: dict.about.transparentListingsDesc,
    },
    {
      icon: Users,
      title: dict.about.directConnection,
      description: dict.about.directConnectionDesc,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#e8edf0] via-[#f0f4f6] to-[#eaf0f2]">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full">
            <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="about-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#111827" strokeWidth="0.5" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#about-grid)" />
            </svg>
          </div>
        </div>

        <div className="container relative py-20 md:py-32">
          <ScrollAnimationWrapper>
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white text-[#111827] px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-md border border-[#e5e7eb]">
                <Building className="w-4 h-4" />
                {dict.about.ourMission}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-[#111827] mb-6 leading-tight">
                {dict.about.pageTitle}
              </h1>
              <p className="text-xl text-[#374151] leading-relaxed max-w-3xl mx-auto">
                {dict.about.pageDescription}
              </p>
            </div>
          </ScrollAnimationWrapper>
        </div>
        <AngledSeparator />
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <ScrollAnimationWrapper>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#111827] mb-4">{dict.about.ourMission}</h2>
              <p className="text-lg text-[#374151] max-w-3xl mx-auto">
                {dict.about.missionDescription}
              </p>
            </div>
          </ScrollAnimationWrapper>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-20 bg-gradient-to-br from-muted to-muted/50">
        <div className="container">
          <ScrollAnimationWrapper>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#111827] mb-4">{dict.about.whatWeDo}</h2>
            </div>
          </ScrollAnimationWrapper>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <ScrollAnimationWrapper key={index} delay={index * 0.1}>
                <Card className="group bg-white shadow-lg hover:shadow-2xl border border-[#e5e7eb] transition-all duration-300 hover:-translate-y-2 h-full">
                  <CardContent className="p-8 text-center h-full flex flex-col">
                    <div className="w-16 h-16 bg-[#111827] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[#111827] mb-4">{feature.title}</h3>
                    <p className="text-[#374151] flex-grow">{feature.description}</p>
                  </CardContent>
                </Card>
              </ScrollAnimationWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <ScrollAnimationWrapper>
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-[#111827] mb-6">{dict.about.ourStory}</h2>
              <p className="text-lg text-[#374151] leading-relaxed">
                {dict.about.storyDescription}
              </p>
            </div>
          </ScrollAnimationWrapper>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#374151] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="cta-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.6" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#cta-grid)" />
            </svg>
          </div>
        </div>

        <div className="container relative">
          <ScrollAnimationWrapper>
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {lang === 'bg' ? 'Готови да започнете?' : "Ready to Get Started?"}
              </h2>
              <p className="text-xl text-white/90 mb-8">
                {lang === 'bg' 
                  ? 'Присъединете се към хилядите доволни клиенти, които са намерили идеалния си имот чрез Mr. Imot.'
                  : "Join thousands of satisfied clients who have found their perfect property through Mr. Imot."
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-[#111827] hover:bg-[#f3f4f6] px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <a href={href('listings', 'obiavi')}>{dict.about.browseProperties}</a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white hover:text-[#111827] px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 bg-transparent"
                >
                  <a href={href('developers', 'stroiteli')}>{dict.about.meetDevelopers}</a>
                </Button>
              </div>
            </div>
          </ScrollAnimationWrapper>
        </div>
      </section>
    </div>
  )
}
