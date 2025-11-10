"use client"

import Link from "next/link"
import { CheckCircle, Target, TrendingUp, Users, Lightbulb } from "lucide-react"
import { ScrollAnimationWrapper } from "@/components/scroll-animation-wrapper"
import { AngledSeparator } from "@/components/angled-separator"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/lib/locale-context"
import { RoadmapTimeline } from "@/components/roadmap-timeline"

interface AboutClientProps {
  dict: any
  lang: 'en' | 'bg'
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
    <div className="min-h-screen" style={{backgroundColor: '#ffffff'}}>
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

        <div className="container relative py-28 md:py-40">
          <ScrollAnimationWrapper>
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white text-[#111827] px-5 py-2.5 rounded-full text-sm font-semibold mb-8 shadow-lg border border-[#e5e7eb] hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Target className="w-4 h-4" />
                {dict.about?.hero?.subtitle || "Modernizing Bulgaria's new construction market"}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-[#111827] mb-8 leading-tight font-serif">
                {dict.about?.hero?.title || "About Mister Imot"}
              </h1>
            </div>
          </ScrollAnimationWrapper>
        </div>
        <AngledSeparator />
      </section>

      {/* About Mister Imot Section */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container">
          <ScrollAnimationWrapper>
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-[#111827] mb-6 text-center font-serif">
                {dict.about?.aboutMisterImot?.title || "About Mister Imot"}
              </h2>
              <p className="text-lg md:text-xl text-[#374151] leading-relaxed mb-12 text-center max-w-3xl mx-auto font-sans">
                {dict.about?.aboutMisterImot?.description || "Mister Imot is a platform created with a vision to modernize the new construction market in Bulgaria and make it transparent, direct, and accessible."}
              </p>
              
              <div className="space-y-8">
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
            </div>
          </ScrollAnimationWrapper>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 md:py-32 bg-gradient-to-br from-[#f0f4f6] to-[#e8edf0]">
        <div className="container">
          <ScrollAnimationWrapper>
            <div className="max-w-5xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-[#111827] mb-6 font-serif">
                {dict.about?.mission?.title || "Our Mission"}
              </h2>
              <p className="text-xl md:text-2xl text-[#374151] leading-relaxed mb-12 font-medium font-sans">
                {dict.about?.mission?.description || "To create the most reliable and modern ecosystem for new construction in Bulgaria."}
              </p>
              
              <div className="space-y-8 text-left max-w-4xl mx-auto">
                <ScrollAnimationWrapper delay={0.1}>
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#e5e7eb] bg-gradient-to-br from-white to-[#f9fafb]">
                    <p className="text-[#374151] leading-relaxed text-base md:text-lg font-sans">
                      {dict.about?.mission?.point1 || "We work daily to improve the platform, listen to users, and implement their ideas."}
                    </p>
                  </div>
                </ScrollAnimationWrapper>
                
                <ScrollAnimationWrapper delay={0.2}>
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#e5e7eb] bg-gradient-to-br from-white to-[#f9fafb]">
                    <p className="text-[#374151] leading-relaxed text-base md:text-lg font-sans">
                      {dict.about?.mission?.point2 || "We invest in technology, security, and marketing, because we believe that good projects deserve real visibility."}
                    </p>
                  </div>
                </ScrollAnimationWrapper>
                
                <ScrollAnimationWrapper delay={0.3}>
                  <div className="bg-gradient-to-br from-[#111827] to-[#1f2937] rounded-2xl p-8 md:p-10 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02]">
                    <p className="text-white text-lg md:text-xl leading-relaxed font-medium font-sans">
                      {dict.about?.mission?.goal || "Our goal is clear — to become the largest platform for new construction in Bulgaria and one of the leaders on a global scale."}
                    </p>
                  </div>
                </ScrollAnimationWrapper>
              </div>
            </div>
          </ScrollAnimationWrapper>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container">
          <ScrollAnimationWrapper>
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-[#111827] mb-4 font-serif">
                {dict.about?.roadmap?.title || "Roadmap"}
              </h2>
              <p className="text-lg text-[#374151] leading-relaxed font-sans">
                {dict.about?.roadmap?.subtitle}
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
          <ScrollAnimationWrapper>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#111827] mb-4 font-serif">
                {dict.about?.ourApproach?.title || "Our Approach"}
              </h2>
            </div>
          </ScrollAnimationWrapper>
          
          <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto mb-16">
            {approachPoints.map((point, index) => (
              <ScrollAnimationWrapper key={index} delay={index * 0.1}>
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 group h-full flex flex-col border border-[#e5e7eb] transform hover:scale-105">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#111827] to-[#1f2937] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 flex-shrink-0 shadow-md">
                    <point.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#111827] mb-4 font-serif">{point.title}</h3>
                  <p className="text-[#374151] leading-relaxed flex-grow font-sans">{point.description}</p>
                </div>
              </ScrollAnimationWrapper>
            ))}
          </div>
          
          <ScrollAnimationWrapper delay={0.4}>
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-white rounded-2xl p-8 md:p-10 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#e5e7eb] bg-gradient-to-br from-white to-[#f9fafb]">
                <p className="text-lg md:text-xl text-[#111827] leading-relaxed font-medium font-sans">
                  {dict.about?.ourApproach?.closing || "Mister Imot is not just a real estate website — it is the new standard for transparency and accessibility in the new construction market."}
                </p>
              </div>
            </div>
          </ScrollAnimationWrapper>
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
    </div>
  )
}
