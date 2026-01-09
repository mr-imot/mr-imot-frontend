"use client"

import Link from "next/link"
import { Image } from "@imagekit/next"
import { CheckCircle, Target, TrendingUp, Users, Lightbulb } from "lucide-react"
import { ScrollAnimationWrapper } from "@/components/scroll-animation-wrapper"
import { AngledSeparator } from "@/components/angled-separator"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/lib/locale-context"
import { RoadmapTimeline } from "@/components/roadmap-timeline"
import { toIkPath } from "@/lib/imagekit"

interface AboutClientProps {
  dict: any
  lang: 'en' | 'bg' | 'ru' | 'gr'
}

export default function AboutClient({ dict, lang }: AboutClientProps) {
  const locale = useLocale()

  // Helper function to generate localized URLs
  const href = (en: string, bg: string) => {
    return locale === 'bg' ? `/bg/${bg}` : `/${en}`
  }

  const roadmapItems = dict.about?.roadmap?.items || []
  const approachPoints = [
    {
      icon: TrendingUp,
      title: dict.about?.ourApproach?.point1?.title || "Continuous Improvements",
      description: dict.about?.ourApproach?.point1?.description || "We continuously develop features and UX design."
    },
    {
      icon: Users,
      title: dict.about?.ourApproach?.point2?.title || "Feedback",
      description: dict.about?.ourApproach?.point2?.description || "We listen to the community and implement their ideas."
    },
    {
      icon: Lightbulb,
      title: dict.about?.ourApproach?.point3?.title || "Growth Investments",
      description: dict.about?.ourApproach?.point3?.description || "We build strong marketing and partnerships with real builders."
    },
  ]

  return (
    <main className="min-h-screen" style={{backgroundColor: '#ffffff'}}>
      {/* About Mister Imot Section - First Section */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <ScrollAnimationWrapper>
              <div className="text-center mb-12 md:mb-16">
                <div className="inline-flex items-center gap-2 bg-white text-[#111827] px-4 py-2 md:px-5 md:py-2.5 rounded-full text-xs md:text-sm font-semibold mb-6 md:mb-8 shadow-lg border border-[#e5e7eb] max-w-[90%] md:max-w-none">
                  <Target className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                  <span className="text-center">{dict.about?.hero?.subtitle || "Modernizing Bulgaria's new construction market"}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-[#111827] mb-6 font-serif">
                  {dict.about?.aboutMisterImot?.title || dict.about?.hero?.title || "About Mister Imot"}
                </h1>
                <p className="text-lg md:text-xl text-[#374151] leading-relaxed max-w-3xl mx-auto font-sans">
                  {dict.about?.aboutMisterImot?.description || "Mister Imot is a platform created with a vision to modernize the new construction market in Bulgaria and make it transparent, direct, and accessible."}
                </p>
              </div>
            </ScrollAnimationWrapper>

            {/* Split Layout: Content on Left, Dashboard on Right */}
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Left: Content Cards */}
              <div className="space-y-6">
                <ScrollAnimationWrapper delay={0.1}>
                  <div className="flex items-start gap-5 bg-gradient-to-br from-[#f0f4f6] to-[#e8edf0] rounded-2xl p-6 md:p-8 border border-[#e5e7eb] shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#111827] to-[#1f2937] rounded-full flex items-center justify-center mt-1 shadow-md">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-[#374151] leading-relaxed flex-1 text-base md:text-lg font-sans">
                      {dict.about?.aboutMisterImot?.point1 || "We connect buyers directly with investors and builders — without brokers, hidden commissions, or fake listings."}
                    </p>
                  </div>
                </ScrollAnimationWrapper>
                
                <ScrollAnimationWrapper delay={0.2}>
                  <div className="flex items-start gap-5 bg-gradient-to-br from-[#f0f4f6] to-[#e8edf0] rounded-2xl p-6 md:p-8 border border-[#e5e7eb] shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#111827] to-[#1f2937] rounded-full flex items-center justify-center mt-1 shadow-md">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-[#374151] leading-relaxed flex-1 text-base md:text-lg font-sans">
                      {dict.about?.aboutMisterImot?.point2 || "We verify the builders and investors who publish their projects."}
                    </p>
                  </div>
                </ScrollAnimationWrapper>
                
                <ScrollAnimationWrapper delay={0.3}>
                  <div className="flex items-start gap-5 bg-gradient-to-br from-[#f0f4f6] to-[#e8edf0] rounded-2xl p-6 md:p-8 border border-[#e5e7eb] shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#111827] to-[#1f2937] rounded-full flex items-center justify-center mt-1 shadow-md">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-[#374151] leading-relaxed flex-1 text-base md:text-lg font-sans">
                      {dict.about?.aboutMisterImot?.point3 || "Each of them is responsible for the accuracy of their listings, and our team monitors and responds to user reports to maintain a high level of trust and quality."}
                    </p>
                  </div>
                </ScrollAnimationWrapper>
              </div>

              {/* Right: Desktop Dashboard Mockup */}
              <ScrollAnimationWrapper delay={0.2}>
                <div className="relative w-full md:max-w-[640px] md:ml-auto md:mt-2">
                  <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden ring-1 ring-black/10 shadow-[0_20px_60px_rgba(2,6,23,0.15)] bg-white">
                    <Image
                      src={toIkPath("https://ik.imagekit.io/ts59gf2ul/about-us/372shots_so.png")}
                      alt={dict.about?.imageAlt?.dashboard || "Mister Imot Dashboard - Property Management"}
                      fill
                      transformation={[{ width: 1920, height: 1200, quality: 95, format: "webp", focus: "auto" }]}
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 640px"
                      priority
                    />
                  </div>
                  {/* Decorative glow effect - hidden on mobile to prevent overflow */}
                  <div className="hidden md:block pointer-events-none absolute -inset-6 -z-10 rounded-[28px] bg-[radial-gradient(40%_40%_at_60%_40%,rgba(139,92,246,0.18),transparent_60%)]" />
                </div>
              </ScrollAnimationWrapper>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 md:py-32 bg-gradient-to-br from-[#f0f4f6] to-[#e8edf0] relative overflow-hidden">
        {/* Subtle background SVG pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="mission-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#111827" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mission-grid)" />
          </svg>
        </div>

        <div className="container relative">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <ScrollAnimationWrapper>
              <div className="text-center mb-10 md:mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-[#111827] mb-6 font-serif">
                  {dict.about?.mission?.title || "Our Mission"}
                </h2>
                <p className="text-xl md:text-2xl text-[#374151] leading-relaxed font-medium font-sans max-w-3xl mx-auto">
                  {dict.about?.mission?.description || "To create the most reliable and modern ecosystem for new construction in Bulgaria."}
                </p>
              </div>
            </ScrollAnimationWrapper>

            {/* Split Layout: Map Image on Left, Mission Content on Right */}
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
              {/* Left: Map Image */}
              <ScrollAnimationWrapper delay={0.1}>
                <div className="relative w-full max-w-[320px] mx-auto md:mx-0 md:sticky md:top-24">
                  <div className="relative aspect-[9/16] w-full rounded-[2rem] overflow-hidden ring-1 ring-black/10 shadow-[0_12px_40px_rgba(2,6,23,0.16)] bg-white">
                    <Image
                      src={toIkPath("https://ik.imagekit.io/ts59gf2ul/about-us/108shots_so.png")}
                      alt={dict.about?.imageAlt?.mapView || "Mister Imot Mobile - Map View"}
                      fill
                      transformation={[{ width: 900, height: 1600, quality: 95, format: "webp", focus: "auto" }]}
                      className="object-cover"
                      sizes="(max-width: 768px) 80vw, 320px"
                      loading="lazy"
                    />
                  </div>
                </div>
              </ScrollAnimationWrapper>

              {/* Right: Mission Points + Goal */}
              <div className="space-y-6 flex flex-col">
                <ScrollAnimationWrapper delay={0.2}>
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-[#e5e7eb]">
                    <p className="text-[#374151] leading-relaxed text-base md:text-lg font-sans">
                      {dict.about?.mission?.point1 || "We work daily to improve the platform, listen to users, and implement their ideas."}
                    </p>
                  </div>
                </ScrollAnimationWrapper>
                
                <ScrollAnimationWrapper delay={0.3}>
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-[#e5e7eb]">
                    <p className="text-[#374151] leading-relaxed text-base md:text-lg font-sans">
                      {dict.about?.mission?.point2 || "We invest in technology, security, and marketing, because we believe that good projects deserve real visibility."}
                    </p>
                  </div>
                </ScrollAnimationWrapper>

                {/* Goal Card - Integrated in Right Column */}
                <ScrollAnimationWrapper delay={0.4}>
                  <div className="bg-gradient-to-br from-[#111827] to-[#1f2937] rounded-2xl p-6 md:p-8 shadow-2xl border border-[#374151] mt-2">
                    <p className="text-white text-base md:text-lg leading-relaxed font-medium font-sans">
                      {dict.about?.mission?.goal || "Our goal is clear — to become the largest platform for new construction in Bulgaria and one of the leaders on a global scale."}
                    </p>
                  </div>
                </ScrollAnimationWrapper>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="py-24 md:py-32 bg-gradient-to-br from-[#f0f4f6] to-[#e8edf0] relative overflow-hidden">
        <div className="container relative">
          <ScrollAnimationWrapper>
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-[#111827] mb-6 font-serif">
                {dict.about?.roadmap?.title || "Roadmap"}
              </h2>
              <p className="text-lg md:text-xl text-[#374151] leading-relaxed font-sans">
                {dict.about?.roadmap?.subtitle || "Our journey from concept to global platform"}
              </p>
            </div>
          </ScrollAnimationWrapper>
          
          <div className="max-w-6xl mx-auto">
            <RoadmapTimeline items={roadmapItems} />
          </div>
        </div>
      </section>

      {/* Our Approach Section */}
      <section className="py-24 md:py-32 bg-gradient-to-br from-[#f0f4f6] to-[#e8edf0]">
        <div className="container">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#111827] mb-4 font-serif">
                {dict.about?.ourApproach?.title || "Our Approach"}
              </h2>
            </div>

            {/* Unified White Container */}
            <div className="bg-white rounded-2xl shadow-lg border border-[#e5e7eb] overflow-hidden">
              {/* Top Section: Image and Cards */}
              <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-stretch p-6 md:p-8 lg:p-10">
                {/* Left: Mobile Location View */}
                <div className="relative w-full max-w-[320px] mx-auto md:mx-0">
                  <div className="relative aspect-[9/16] w-full rounded-[2rem] overflow-hidden ring-1 ring-black/10 shadow-[0_12px_40px_rgba(2,6,23,0.16)] bg-white">
                    <Image
                      src={toIkPath("https://ik.imagekit.io/ts59gf2ul/about-us/701shots_so.png")}
                      alt={dict.about?.imageAlt?.locationView || "Mister Imot Mobile - Location View"}
                      fill
                      transformation={[{ width: 900, height: 1600, quality: 95, format: "webp", focus: "auto" }]}
                      className="object-cover"
                      sizes="(max-width: 768px) 80vw, 320px"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Right: Approach Cards - Stacked to match image height */}
                <div className="flex flex-col h-full">
                  <div className="space-y-4 flex flex-col h-full">
                    {approachPoints.map((point, index) => (
                      <div key={index} className="bg-gradient-to-br from-[#f9fafb] to-white rounded-xl p-6 md:p-7 border border-[#e5e7eb] flex-1 flex flex-col">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#111827] to-[#1f2937] rounded-xl flex items-center justify-center mb-4 flex-shrink-0 shadow-md">
                          <point.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-[#111827] mb-2 font-serif">{point.title}</h3>
                        <p className="text-[#374151] leading-relaxed text-sm md:text-base flex-grow font-sans">{point.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Section: Closing Statement - Integrated */}
              <div className="border-t border-[#e5e7eb] bg-gradient-to-br from-[#f9fafb] to-white px-6 md:px-8 lg:px-10 py-6 md:py-8">
                <p className="text-lg md:text-xl text-[#111827] leading-relaxed font-medium font-sans text-center">
                  {dict.about?.ourApproach?.closing || "Mister Imot is not just a real estate website — it is the new standard for transparency and accessibility in the new construction market."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#374151] text-white relative overflow-hidden">
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
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-serif">
                {dict.about?.cta?.title || "Ready to Find Your Perfect Property?"}
              </h2>
              <p className="text-xl text-white/90 mb-10 font-sans">
                {dict.about?.cta?.description || "Don't wait! Start exploring verified projects and connect directly with developers today."}
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-[#111827] hover:bg-[#f3f4f6] px-10 py-5 text-lg font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-sans"
                >
                  <Link href={href('listings', 'obiavi')}>
                    {dict.about?.cta?.browseProperties || "Browse Properties"}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white hover:text-[#111827] px-10 py-5 text-lg font-semibold rounded-xl transition-all duration-300 bg-transparent font-sans"
                >
                  <Link href={href('developers', 'stroiteli')}>
                    {dict.about?.cta?.meetDevelopers || "Meet Developers"}
                  </Link>
                </Button>
              </div>
            </div>
          </ScrollAnimationWrapper>
        </div>
      </section>
    </main>
  )
}
