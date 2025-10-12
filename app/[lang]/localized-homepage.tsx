"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Shield,
  MapPin,
  DollarSign,
  ExternalLink,
  Search,
  Phone,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { EtchedGlassBackground } from "@/components/etched-glass-background"
import { FaqSection } from "@/components/faq-section"
import { PricingSection } from "@/components/pricing/PricingSection"
import { TestimonialsSection } from "@/components/TestimonialsSection"
import { getProjects } from "@/lib/api"

interface LocalizedHomePageProps {
  dict: any
  lang: string
}

export function LocalizedHomePage({ dict, lang }: LocalizedHomePageProps) {
  // State for recently added listings
  const [recentListings, setRecentListings] = useState<any[]>([])
  const [isLoadingListings, setIsLoadingListings] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    setIsMobile(window.matchMedia('(pointer: coarse)').matches)
  }, [])
  
  // Fetch recently added listings
  useEffect(() => {
    const fetchRecentListings = async () => {
      try {
        setIsLoadingListings(true)
        const response = await getProjects({ 
          sort_by: "created_at", 
          per_page: 6 
        })
        setRecentListings(response.projects || [])
      } catch (error) {
        console.error("Failed to fetch recent listings:", error)
        setRecentListings([])
      } finally {
        setIsLoadingListings(false)
      }
    }
    
    fetchRecentListings()
  }, [])

  // FAQ Schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": dict.faq.question1.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": dict.faq.question1.answer
        }
      },
      {
        "@type": "Question",
        "name": dict.faq.question2.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": dict.faq.question2.answer
        }
      },
      {
        "@type": "Question",
        "name": dict.faq.question3.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": dict.faq.question3.answer
        }
      },
      {
        "@type": "Question",
        "name": dict.faq.question4.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": dict.faq.question4.answer
        }
      },
      {
        "@type": "Question",
        "name": dict.faq.question5.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": dict.faq.question5.answer
        }
      },
      {
        "@type": "Question",
        "name": dict.faq.question6.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": dict.faq.question6.answer
        }
      },
      {
        "@type": "Question",
        "name": dict.faq.question7.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": dict.faq.question7.answer
        }
      },
      {
        "@type": "Question",
        "name": dict.faq.question8.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": dict.faq.question8.answer
        }
      },
      {
        "@type": "Question",
        "name": dict.faq.question9.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": dict.faq.question9.answer
        }
      }
    ]
  };

  return (
    <>
      {/* JSON-LD Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: lang === 'bg' ? 'Мистър Имот' : 'Mister Imot',
            url: lang === 'bg' ? 'https://mrimot.com/bg' : 'https://mrimot.com/en',
            inLanguage: lang === 'bg' ? 'bg' : 'en',
            logo: 'https://ik.imagekit.io/ts59gf2ul/Logo/mr-imot-logo.png',
            sameAs: [
              'https://facebook.com/mrimot',
              'https://www.linkedin.com/company/mrimot',
              'https://instagram.com/mrimot'
            ]
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: lang === 'bg' ? 'Мистър Имот' : 'Mister Imot',
            url: lang === 'bg' ? 'https://mrimot.com/bg' : 'https://mrimot.com/en',
            inLanguage: lang === 'bg' ? 'bg' : 'en',
            potentialAction: {
              "@type": "SearchAction",
              target: 'https://mrimot.com/{lang}/listings?query={search_term_string}',
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <div className="min-h-screen relative overflow-visible">
        {/* Etched Glass Background */}
        <EtchedGlassBackground />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="hero-grid grid grid-rows-[auto_1fr] lg:grid-cols-2 lg:grid-rows-none gap-2 sm:gap-4 md:gap-6 lg:gap-8 items-center w-full">
            {/* Left Column - Content */}
            <div className="hero-content order-2 lg:order-none flex flex-col" style={{ 
              // Ensure entire hero fits in viewport with proper CTA spacing
              height: isMobile 
                ? 'calc(var(--fixed-vh, 100vh) - var(--header-height, 80px))'
                : 'calc(100vh - var(--header-height, 80px))',
              paddingBottom: 'clamp(1.5rem, 6vh, 3rem)', // Consistent bottom padding for CTA
              justifyContent: 'space-between'
            }}>
              {/* Top Section - Title + Subtitle */}
              <div className="flex-1 flex flex-col justify-center" style={{ paddingTop: 'clamp(1rem, 4vh, 2rem)' }}>
              {/* Main Headline - premium gradient text */}
              <div className="space-y-1">
                <h1 className="headline-gradient hero-title leading-[0.72] tracking-tight font-serif" style={{
                  fontSize: 'clamp(2.25rem, 5vw, 4.75rem)'
                }}>
                  <span className="font-normal italic text-slate-900/70 drop-shadow-sm mr-2">
                    {dict.hero.title.find}
                  </span>
                  {dict.hero.title.your}
                  <br />
                  <span className="font-semibold">{dict.hero.title.perfectProperty}</span>
                  <br />
                  <span className="font-medium">{dict.hero.title.directlyFromDevelopers}</span>
                </h1>
              </div>
              
                {/* Combined Subtitle + Promise */}
                <div className="space-y-2" style={{ marginTop: 'clamp(16px, 4vh, 32px)' }}>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal text-gray-600 leading-relaxed font-sans" style={{
                    fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                    lineHeight: '1.6',
                    maxWidth: 'clamp(320px, 90%, 520px)'
                  }}>
                    <span className="font-semibold text-gray-800">{dict.hero.description.intro}</span> {dict.hero.description.platform} <span className="font-semibold text-gray-800">{dict.hero.description.noBrokers}</span>.
                  </p>
                  
                  {/* Promise - Separate line like CloudCart */}
                  <div style={{ marginTop: 'clamp(16px, 4vh, 32px)' }}>
                    <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal text-gray-600 leading-relaxed font-sans" style={{
                      fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                      lineHeight: '1.6',
                      maxWidth: 'clamp(320px, 90%, 520px)'
                    }}>
                      <p className="font-semibold text-gray-800 mb-3">{dict.hero.promises.heading}</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-green-600 flex items-center justify-center flex-shrink-0" style={{ width: 'clamp(1rem, 2vw, 1.25rem)', height: 'clamp(1rem, 2vw, 1.25rem)' }}>
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span>{dict.hero.promises.noFakeListings}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-green-600 flex items-center justify-center flex-shrink-0" style={{ width: 'clamp(1rem, 2vw, 1.25rem)', height: 'clamp(1rem, 2vw, 1.25rem)' }}>
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span>{dict.hero.promises.noWastedTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Section - CTA Button */}
              <div className="flex-shrink-0 hero-cta" style={{ 
                marginTop: 'clamp(0.75rem, 3vh, 1.5rem)',
                marginBottom: '0' // Remove bottom margin since we have paddingBottom on container
              }}>
                <Link href={`/${lang}/listings`}>
                  <button className="w-full sm:w-auto px-10 py-5 rounded-2xl text-white font-bold uppercase transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-105 active:scale-[0.98] cursor-pointer tracking-wider relative overflow-hidden group bg-charcoal-700 hover:bg-charcoal-800 focus:ring-2 focus:ring-charcoal-300 font-sans" style={{ fontSize: 'clamp(0.875rem, 2vw, 1.25rem)', padding: 'clamp(0.75rem, 2vw, 1.25rem) clamp(1.5rem, 4vw, 2.5rem)' }}>
                    {/* Liquid Glass Overlay - Always Visible */}
                    <div className="absolute inset-0 opacity-100 transition-opacity duration-300 ease-out" style={{
                      background: 'linear-gradient(135deg, rgba(38, 70, 83, 0.1) 0%, rgba(38, 70, 83, 0.2) 25%, rgba(38, 70, 83, 0.1) 50%, rgba(38, 70, 83, 0.05) 75%, rgba(38, 70, 83, 0.1) 100%)',
                      borderRadius: '16px',
                      animation: 'liquidFlow 2s ease-in-out infinite'
                    }} />

                    {/* Shimmer Effect - Always Visible */}
                    <div className="absolute inset-0 opacity-100 transition-opacity duration-500 ease-out" style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(38, 70, 83, 0.4) 50%, transparent 100%)',
                      transform: 'translateX(-100%)',
                      animation: 'shimmer 1.5s ease-in-out infinite'
                    }} />

                    <span className="relative z-10">
                      {dict.hero.cta}
                    </span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Right Column - Supporting Mascot (Desktop Only) */}
            <div className="hero-visual hidden lg:flex lg:items-center lg:justify-end lg:h-full">
              {/* Hero Image - Original Size + Dynamic Scaling */}
              <div className="w-full flex justify-center lg:justify-end">
                <img
                  src={lang === 'bg' 
                    ? "https://ik.imagekit.io/ts59gf2ul/Logo/0_-komisionna-mr-imot.png?updatedAt=1760104535412&tr=f-auto,q-90"
                    : "https://ik.imagekit.io/ts59gf2ul/Logo/0_-commissions-mr-imot.png?updatedAt=1760108287952&tr=f-auto,q-90"
                  }
                  alt={lang === 'bg' ? dict.hero.imageAlt : 'Mister Imot mascot holding flag with 0% commissions message for real estate platform'}
                  className="w-auto h-auto transition-all duration-700 hover:scale-105 hover:rotate-1"
                  style={{
                    willChange: 'transform',
                    transform: 'translateZ(0)',
                    filter: 'drop-shadow(0 4px 15px rgba(0, 0, 0, 0.1))',
                    // Responsive width to scale proportionally across desktop/laptop
                    width: 'clamp(1250px, 60vw, 1800px)',
                    height: 'auto',
                    animation: 'float 6s ease-in-out infinite'
                  }}
                />
              </div>
            </div>

            {/* Right Column - Video on large screens, hidden on mobile/tablet */}
            <div className="hidden lg:block">
              {/* This space allows the EtchedGlassBackground to be clearly visible on large screens */}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Mascot Section - Below Hero with Plain White Background */}
      <section className="lg:hidden py-16 sm:py-20 md:py-24 bg-white">
        <div className="container mx-auto px-3 sm:px-6 md:px-8 w-full">
          <div className="flex justify-center">
            <img
              src={lang === 'bg' 
                ? "https://ik.imagekit.io/ts59gf2ul/Logo/0_-komisionna-mr-imot.png?updatedAt=1760104535412&tr=f-auto,q-90"
                : "https://ik.imagekit.io/ts59gf2ul/Logo/0_-commissions-mr-imot.png?updatedAt=1760108287952&tr=f-auto,q-90"
              }
              alt={lang === 'bg' ? dict.hero.imageAlt : 'Mister Imot mascot holding flag with 0% commissions message for real estate platform'}
              className="w-auto h-auto transition-all duration-700 hover:scale-105 hover:rotate-1 drop-shadow-xl"
              style={{
                willChange: 'transform',
                transform: 'translateZ(0)',
                filter: 'drop-shadow(0 4px 15px rgba(0, 0, 0, 0.1))',
                width: 'clamp(180px, 68vw, 320px)',
                height: 'auto',
                animation: 'float 6s ease-in-out infinite',
                marginTop: 'clamp(8px, 2vh, 16px)'
              }}
            />
          </div>
        </div>
      </section>

             {/* 3-Step Process Section - Premium Design */}
       <section className="relative overflow-hidden py-16 sm:py-20 md:py-24 lg:py-32 bg-gray-50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative">
           {/* Section Header */}
           <div className="text-center mb-12 sm:mb-16 md:mb-20 lg:mb-24">
             <div className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-8 uppercase tracking-wide border-2 bg-slate-900/5 text-slate-500 border-slate-900/10" dangerouslySetInnerHTML={{ __html: dict.threeSteps.badge }}>
             </div>
            <h2 className="headline-gradient text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 font-serif" style={{
              lineHeight: '1.1',
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)'
            }}>
               {dict.threeSteps.heading}
              </h2>
           </div>

           {/* 3-Step Cards with subtle connector line on desktop */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 relative">
             <div className="hidden lg:block absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
               {/* Step 1 */}
               <div className="group">
                 <div className="card p-8 hover:shadow-2xl transition-all duration-500 hover:border-gray-300 group-hover:-translate-y-2">
                   <div className="text-center">
                     {/* Number + Icon Container */}
                     <div className="flex items-center justify-center gap-4 mb-6">
                 {/* Number */}
                       <div className="inline-flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold text-white bg-accent">
                   {dict.threeSteps.step1.number}
                 </div>
                 
                       {/* Icon with Liquid Glass Effect */}
                       <div className="relative">
                         <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 bg-accent relative overflow-hidden">
                           {/* Liquid Glass Overlay */}
                           <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out" style={{
                             background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.2) 25%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.1) 100%)',
                             borderRadius: '16px',
                             animation: 'liquidFlow 2s ease-in-out infinite'
                           }} />
                           
                           {/* Shimmer Effect */}
                           <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" style={{
                             background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                             transform: 'translateX(-100%)',
                             animation: 'shimmer 1.5s ease-in-out infinite'
                           }} />
                           
                           {/* Original Map SVG with White Color */}
                           <svg className="w-10 h-10 text-charcoal-500 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                           </svg>
                         </div>
                       </div>
                     </div>
                     
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 font-serif">
                    {dict.threeSteps.step1.label}
                     </h3>
                    <p className="text-gray-600 leading-relaxed font-sans" style={{
                      fontSize: '16px',
                      lineHeight: '1.6'
                  }} dangerouslySetInnerHTML={{ __html: dict.threeSteps.step1.content }}>
                     </p>
                   </div>
                   </div>
               </div>
               
               {/* Step 2 */}
               <div className="group">
                 <div className="card p-8 hover:shadow-2xl transition-all duration-500 hover:border-gray-400 group-hover:-translate-y-2">
                   <div className="text-center">
                     {/* Number + Icon Container */}
                     <div className="flex items-center justify-center gap-4 mb-6">
                       {/* Number */}
                       <div className="inline-flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold text-white bg-accent">
                         {dict.threeSteps.step2.number}
                       </div>
                       
                       {/* Icon with Liquid Glass Effect */}
                       <div className="relative">
                         <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 bg-accent relative overflow-hidden">
                           {/* Liquid Glass Overlay */}
                           <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out" style={{
                             background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.2) 25%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.1) 100%)',
                             borderRadius: '16px',
                             animation: 'liquidFlow 2s ease-in-out infinite'
                           }} />
                           
                           {/* Shimmer Effect */}
                           <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" style={{
                             background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                             transform: 'translateX(-100%)',
                             animation: 'shimmer 1.5s ease-in-out infinite'
                           }} />
                           
                           {/* SVG Icon */}
                           <svg className="w-10 h-10 text-charcoal-500 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                 </svg>
               </div>
             </div>
                 </div>
                 
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 font-serif">
                    {dict.threeSteps.step2.label}
                     </h3>
                    <p className="text-gray-600 leading-relaxed font-sans" style={{
                      fontSize: '16px',
                      lineHeight: '1.6'
                  }} dangerouslySetInnerHTML={{ __html: dict.threeSteps.step2.content }}>
                     </p>
                   </div>
                   </div>
               </div>
               
               {/* Step 3 */}
               <div className="group">
                 <div className="card p-8 hover:shadow-2xl transition-all duration-500 hover:border-gray-300 group-hover:-translate-y-2">
                   <div className="text-center">
                     {/* Number + Icon Container */}
                     <div className="flex items-center justify-center gap-4 mb-6">
                       {/* Number */}
                       <div className="inline-flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold text-white bg-accent">
                         {dict.threeSteps.step3.number}
                       </div>
                       
                       {/* Icon with Liquid Glass Effect */}
                       <div className="relative">
                         <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 bg-accent relative overflow-hidden">
                           {/* Liquid Glass Overlay */}
                           <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out" style={{
                             background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.2) 25%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.1) 100%)',
                             borderRadius: '16px',
                             animation: 'liquidFlow 2s ease-in-out infinite'
                           }} />
                           
                           {/* Shimmer Effect */}
                           <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" style={{
                             background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                             transform: 'translateX(-100%)',
                             animation: 'shimmer 1.5s ease-in-out infinite'
                           }} />
                           
                           {/* SVG Icon */}
                           <svg className="w-10 h-10 text-charcoal-500 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1 1 21 9z"/>
                 </svg>
               </div>
             </div>
                 </div>
                 
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 font-serif">
                    {dict.threeSteps.step3.label}
                     </h3>
                    <p className="text-gray-600 leading-relaxed font-sans" style={{
                      fontSize: '16px',
                      lineHeight: '1.6'
                    }} dangerouslySetInnerHTML={{ __html: dict.threeSteps.step3.content }}>
                     </p>
                   </div>
               </div>
             </div>
           </div>

           {/* Bottom Tagline */}
           <div className="text-center mt-16 sm:mt-20 md:mt-24 lg:mt-28">
             <div className="max-w-4xl mx-auto">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-serif" style={{
                lineHeight: '1.2',
                letterSpacing: '-0.02em'
              }}>
                {dict.threeSteps.mvp.heading}
               </h3>
               
               <div className="flex justify-center">
                 <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-4 sm:flex sm:flex-row sm:items-center sm:gap-8">
                   <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                     <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                     </svg>
                   </div>
                   <span className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
                     {dict.threeSteps.mvp.benefits.fast}
                   </span>
                   
                   <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                     <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                     </svg>
                   </div>
                   <span className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
                     {dict.threeSteps.mvp.benefits.easy}
                   </span>
                   
                   <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                     <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                     </svg>
                   </div>
                   <span className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
                     {dict.threeSteps.mvp.benefits.free}
                   </span>
                 </div>
               </div>
             </div>
            </div>
         </div>
       </section>

      {/* Platform Principles Section - Why We're Different */}
      <section className="py-16 sm:py-20 md:py-24 lg:py-32 relative overflow-hidden">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16 md:mb-20 lg:mb-24">
            <h2 className="headline-gradient text-4xl sm:text-5xl md:text-6xl lg:mb-6 lg:text-7xl font-bold mb-6 font-serif" style={{
              lineHeight: '1.1',
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)'
            }}>
               {dict.whatMakesDifferent.heading}
             </h2>
            <p className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-700 max-w-4xl mx-auto leading-relaxed font-sans" style={{
              fontSize: 'clamp(1.25rem, 3vw, 2rem)'
            }}>
               {dict.whatMakesDifferent.subheading}
             </p>
           </div>


          {/* 2x2 Platform Principles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {/* Principle 1: Verified Developers */}
            <div className="group">
              <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-300 group-hover:-translate-y-2 h-full">
                <div className="text-center h-full flex flex-col">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 bg-charcoal-500 relative overflow-hidden">
                    {/* Liquid Glass Overlay */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out" style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.2) 25%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.1) 100%)',
                      borderRadius: '16px',
                      animation: 'liquidFlow 2s ease-in-out infinite'
                    }} />
                    
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                      transform: 'translateX(-100%)',
                      animation: 'shimmer 1.5s ease-in-out infinite'
                    }} />
                    
                    {/* Shield Icon */}
                    <svg className="w-10 h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 font-serif">
                      {dict.whatMakesDifferent.principles.verifiedDevelopers.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed font-sans" style={{
                      fontSize: '16px',
                      lineHeight: '1.6'
                    }}>
                      {dict.whatMakesDifferent.principles.verifiedDevelopers.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Principle 2: No Financial Bias */}
            <div className="group">
              <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-300 group-hover:-translate-y-2 h-full">
                <div className="text-center h-full flex flex-col">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 bg-accent relative overflow-hidden">
                    {/* Liquid Glass Overlay */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out" style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.2) 25%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.1) 100%)',
                      borderRadius: '16px',
                      animation: 'liquidFlow 2s ease-in-out infinite'
                    }} />
                    
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                      transform: 'translateX(-100%)',
                      animation: 'shimmer 1.5s ease-in-out infinite'
                    }} />
                    
                    {/* Target Icon */}
                    <svg className="w-10 h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 font-serif">
                      {dict.whatMakesDifferent.principles.noFinancialBias.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed font-sans" style={{
                      fontSize: '16px',
                      lineHeight: '1.6'
                    }}>
                      {dict.whatMakesDifferent.principles.noFinancialBias.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Principle 3: Clean Experience */}
            <div className="group">
              <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-300 group-hover:-translate-y-2 h-full">
                <div className="text-center h-full flex flex-col">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 bg-accent relative overflow-hidden">
                    {/* Liquid Glass Overlay */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out" style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.2) 25%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.1) 100%)',
                      borderRadius: '16px',
                      animation: 'liquidFlow 2s ease-in-out infinite'
                    }} />
                    
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                      transform: 'translateX(-100%)',
                      animation: 'shimmer 1.5s ease-in-out infinite'
                    }} />
                    
                    {/* Sparkles Icon */}
                    <svg className="w-10 h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 font-serif">
                      {dict.whatMakesDifferent.principles.cleanExperience.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed font-sans" style={{
                      fontSize: '16px',
                      lineHeight: '1.6'
                    }}>
                      {dict.whatMakesDifferent.principles.cleanExperience.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Principle 4: Honest Brokers */}
            <div className="group">
              <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-300 group-hover:-translate-y-2 h-full">
                <div className="text-center h-full flex flex-col">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 bg-charcoal-500 relative overflow-hidden">
                    {/* Liquid Glass Overlay */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out" style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.2) 25%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.1) 100%)',
                      borderRadius: '16px',
                      animation: 'liquidFlow 2s ease-in-out infinite'
                    }} />
                    
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                      transform: 'translateX(-100%)',
                      animation: 'shimmer 1.5s ease-in-out infinite'
                    }} />
                    
                    {/* Handshake Icon */}
                    <svg className="w-10 h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 font-serif">
                      {dict.whatMakesDifferent.principles.honestBrokers.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed font-sans" style={{
                      fontSize: '16px',
                      lineHeight: '1.6'
                    }}>
                      {dict.whatMakesDifferent.principles.honestBrokers.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Projects Carousel */}
      <section className="py-16 sm:py-20 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center mb-10">
            <h3 className="headline-gradient text-4xl sm:text-5xl font-bold font-serif">
              {lang === 'bg' ? 'Наскоро добавени' : 'Recently added'}
            </h3>
          </div>
          <div className="relative">
            {isLoadingListings ? (
              <div className="flex gap-6 overflow-x-auto pb-2">
                {[1,2,3,4,5,6].map((i) => (
                  <div key={i} className="min-w-[340px] max-w-[360px] lg:min-w-[400px] lg:max-w-[400px] card p-4 animate-pulse">
                    <div className="h-48 md:h-56 lg:h-64 bg-gray-200 rounded-xl mb-4" />
                    <div className="h-6 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : recentListings.length > 0 ? (
              <div className="flex gap-6 lg:gap-8 overflow-x-auto snap-x snap-mandatory pb-2 edge-fade-l edge-fade-r scrollbar-thin" style={{ scrollSnapType: 'x mandatory' }}>
                {(recentListings.slice(0, 5)).map((listing) => (
                  <Link 
                    key={listing.id} 
                    href={`/${lang}/listings/${listing.id}`}
                    className="min-w-[340px] max-w-[360px] lg:min-w-[400px] lg:max-w-[400px] snap-start"
                  >
                    <article className="card p-4 hover:-translate-y-1 transition-transform cursor-pointer h-full">
                      <div className="relative h-48 md:h-56 lg:h-64 bg-muted rounded-xl mb-4 overflow-hidden">
                        {(() => {
                          // Try to get the best available image URL
                          const imageUrl = listing.cover_image_url || 
                                         (listing.images && listing.images[0] && listing.images[0].urls && listing.images[0].urls.card) ||
                                         (listing.images && listing.images[0] && listing.images[0].image_url);
                          
                          return imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={listing.name || 'Property'}
                              fill
                              className="object-cover cursor-pointer"
                              sizes="320px"
                              onError={(e) => {
                                // Fallback to placeholder if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                      <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                      </svg>
                                    </div>
                                  `;
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <MapPin className="w-12 h-12 text-gray-400" />
                            </div>
                          );
                        })()}
                      </div>
                      <h4 className="font-semibold text-lg mb-1 line-clamp-1">
                        {listing.name || (lang === 'bg' ? 'Проект' : 'Project')}
                      </h4>
                      <p className="text-muted-foreground text-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {listing.city || (lang === 'bg' ? 'България' : 'Bulgaria')}
                      </p>
                    </article>
                  </Link>
                ))}
                {/* View more tile as last item (6th) */}
                <Link
                  href={`/${lang}/listings`}
                  className="min-w-[340px] max-w-[360px] lg:min-w-[400px] lg:max-w-[400px] snap-start"
                >
                  <article className="card p-6 h-full flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform cursor-pointer">
                    <div className="w-full h-48 md:h-56 lg:h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl mb-4 grid place-items-center">
                      <ExternalLink className="w-10 h-10 text-gray-500" />
                    </div>
                    <h4 className="font-semibold text-lg mb-1">
                      {lang === 'bg' ? 'Виж повече' : 'View more'}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {lang === 'bg' ? 'Разгледай всички имоти' : 'Browse all properties'}
                    </p>
                  </article>
                </Link>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {lang === 'bg' ? 'Няма налични обяви в момента' : 'No listings available at the moment'}
                </p>
              </div>
            )}
          </div>

          {/* CTA moved here below cards */}
          <div className="mt-10 flex justify-center">
            <Link href={`/${lang}/listings`}>
              <button className="w-full sm:w-auto px-8 py-4 rounded-2xl text-white font-bold text-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-105 active:scale-[0.98] cursor-pointer uppercase tracking-wide relative overflow-hidden group bg-charcoal-700 hover:bg-charcoal-800 focus:ring-2 focus:ring-charcoal-300 font-sans">
                {/* Liquid Glass Overlay - Always Visible */}
                <div className="absolute inset-0 opacity-100 transition-opacity duration-300 ease-out" style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.2) 25%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.1) 100%)',
                  borderRadius: '16px',
                  animation: 'liquidFlow 2s ease-in-out infinite'
                }} />

                {/* Shimmer Effect - Always Visible */}
                <div className="absolute inset-0 opacity-100 transition-opacity duration-500 ease-out" style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                  transform: 'translateX(-100%)',
                  animation: 'shimmer 1.5s ease-in-out infinite'
                }} />

                <span className="relative z-10 flex items-center justify-center">
                  {dict.whatMakesDifferent.cta}
                  <ExternalLink className="ml-2 w-5 h-5" />
                </span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Developer Join Section - New 4-Part Funnel */}
      <section className="py-16 sm:py-20 md:py-24" style={{backgroundColor: 'var(--brand-glass-light)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          
          {/* 1️⃣ Section: "Why Join as Developer?" (Value Section) */}
          <div className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 rounded-3xl"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)] rounded-3xl"></div>
            
            <div className="relative z-10 px-8 py-16 sm:px-12 sm:py-20">
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent leading-tight font-serif">
                  {dict.developerJoin.heading}
                </h2>
                
                <p className="text-xl sm:text-2xl md:text-3xl text-gray-700 mb-8 leading-relaxed max-w-5xl mx-auto font-medium font-sans">
                  {dict.developerJoin.subheading}
                </p>

                <p className="text-lg sm:text-xl text-gray-600 mb-16 leading-relaxed max-w-4xl mx-auto font-sans">
                  {dict.developerJoin.description}
                </p>

                {/* Enhanced Benefits as Bullet List + Mascot Layout */}
                <div className="max-w-6xl mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
                    {/* Left Side - Mascot */}
                    <div className="flex justify-center lg:justify-start order-2 lg:order-1">
                      <img
                        src={lang === 'bg' 
                          ? "https://ik.imagekit.io/ts59gf2ul/Logo/stani-chats-ot-nas-mr-imot.png?updatedAt=1760104490964&tr=f-auto,q-90"
                          : "https://ik.imagekit.io/ts59gf2ul/Logo/join-us-mr-imot.png?updatedAt=1760105808199&tr=f-auto,q-90"
                        }
                        alt={lang === 'bg' ? dict.developerJoin.imageAlt : 'Mister Imot mascot inviting developers to join real estate platform with join us flag'}
                        className="w-auto h-auto mx-auto transition-all duration-700 hover:scale-110 hover:rotate-2"
                        style={{
                          willChange: 'transform',
                          transform: 'translateZ(0)',
                          filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.15))',
                          width: 'clamp(200px, 20vw, 320px)',
                          height: 'auto'
                        }}
                      />
                    </div>

                    {/* Right Side - Benefits List */}
                    <div className="space-y-6 order-1 lg:order-2">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-charcoal-500 to-charcoal-600 flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </div>
                        <p className="text-lg text-gray-700 font-medium leading-tight text-left">
                          {dict.developerJoin.benefits.qualityLeads}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-persian-green-500 to-persian-green-600 flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                          </svg>
                        </div>
                        <p className="text-lg text-gray-700 font-medium leading-tight text-left">
                          {dict.developerJoin.benefits.directContact}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-saffron-500 to-saffron-600 flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                          </svg>
                        </div>
                        <p className="text-lg text-gray-700 font-medium leading-tight text-left">
                          {dict.developerJoin.benefits.fullControl}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sandy-brown-500 to-sandy-brown-600 flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                          </svg>
                        </div>
                        <p className="text-lg text-gray-700 font-medium leading-tight text-left">
                          {dict.developerJoin.benefits.protectedListings}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-burnt-sienna-500 to-burnt-sienna-600 flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                          </svg>
                        </div>
                        <p className="text-lg text-gray-700 font-medium leading-tight text-left">
                          {dict.developerJoin.benefits.monthlySubscription}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-charcoal-500 to-charcoal-600 flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                          </svg>
                        </div>
                        <p className="text-lg text-gray-700 font-medium leading-tight text-left">
                          {dict.developerJoin.benefits.growthTogether}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-persian-green-500 to-persian-green-600 flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </div>
                        <p className="text-lg text-gray-700 font-medium leading-tight text-left">
                          {dict.developerJoin.benefits.competitiveAdvantage}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2️⃣ Section: "Pricing / Subscription Plans" */}
          <div className="mt-8 sm:mt-12 md:mt-16 lg:mt-20">
            <PricingSection lang={lang} />
          </div>



        </div>
      </section>

      {/* Testimonials below pricing */}
      <TestimonialsSection lang={lang} />

      {/* Ready to publish section - moved under testimonials */}
      <section className="py-16 sm:py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center">
            <div className="bg-gray-50 rounded-2xl p-12">
              <h3 className="text-2xl sm:text-3xl font-bold mb-6 font-serif" style={{
                color: 'var(--brand-text-primary)'
              }}>
                {dict.developerJoin.finalCta.heading}
              </h3>
              <Link href={`/${lang}/register?type=developer`}>
                <button className="group relative px-10 py-4 rounded-2xl bg-charcoal-500 text-white font-bold tracking-wider uppercase hover:bg-charcoal-600 transition-all duration-300 shadow-xl hover:shadow-2xl active:scale-95 overflow-hidden">
                  {/* Liquid Glass Overlay - Always Visible */}
                  <div className="absolute inset-0 opacity-100 transition-opacity duration-300 ease-out" style={{
                    background: 'linear-gradient(135deg, rgba(38, 70, 83, 0.1) 0%, rgba(38, 70, 83, 0.2) 25%, rgba(38, 70, 83, 0.1) 50%, rgba(38, 70, 83, 0.05) 75%, rgba(38, 70, 83, 0.1) 100%)',
                    borderRadius: '16px',
                    animation: 'liquidFlow 2s ease-in-out infinite'
                  }} />

                  {/* Shimmer Effect - Always Visible */}
                  <div className="absolute inset-0 opacity-100 transition-opacity duration-500 ease-out" style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(38, 70, 83, 0.4) 50%, transparent 100%)',
                    transform: 'translateX(-100%)',
                    animation: 'shimmer 1.5s ease-in-out infinite'
                  }} />

                  <span className="relative z-10">{dict.developerJoin.finalCta.button}</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FaqSection 
        heading={dict.faq.heading}
        subheading={dict.faq.subheading}
        items={[
          {
            id: "faq-1",
            question: dict.faq.question1.question,
            answer: dict.faq.question1.answer,
          },
          {
            id: "faq-2", 
            question: dict.faq.question2.question,
            answer: dict.faq.question2.answer,
          },
          {
            id: "faq-3",
            question: dict.faq.question3.question,
            answer: dict.faq.question3.answer,
          },
          {
            id: "faq-4",
            question: dict.faq.question4.question,
            answer: dict.faq.question4.answer,
          },
          {
            id: "faq-5",
            question: dict.faq.question5.question,
            answer: dict.faq.question5.answer,
          },
          {
            id: "faq-6",
            question: dict.faq.question6.question,
            answer: dict.faq.question6.answer,
          },
          {
            id: "faq-7",
            question: dict.faq.question7.question,
            answer: dict.faq.question7.answer,
          },
          {
            id: "faq-8",
            question: dict.faq.question8.question,
            answer: dict.faq.question8.answer,
          },
          {
            id: "faq-9",
            question: dict.faq.question9.question,
            answer: dict.faq.question9.answer,
          },
        ]}
      />

    </div>
    </>
  )
}

function PricingToggle({ lang }: { lang: string }) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(() => 'monthly')
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="inline-flex p-1 rounded-full bg-gray-100 border border-gray-200 shadow-sm">
        <button
          onClick={() => setBillingCycle('monthly')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${billingCycle === 'monthly' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-800'}`}
        >
          {lang === 'bg' ? 'Месечно' : 'Monthly'}
        </button>
        <button
          onClick={() => setBillingCycle('yearly')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${billingCycle === 'yearly' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-800'}`}
        >
          {lang === 'bg' ? 'Годишно (спестявате 2 месеца)' : 'Yearly (save 2 months)'}
        </button>
      </div>
    </div>
  )
}

function PremiumStandardCard({ dict, lang }: { dict: any, lang: string }) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  // Mirror global toggle if needed in future via context; keep local UX simple for now
  const monthlyLabel = lang === 'bg' ? '50 лв/месец' : '€25/month'
  const yearlyLabel = lang === 'bg' ? '500 лв/годишно' : '€250/year'
  const features = (lang === 'bg' ? [
    'До 5 активни обяви',
    'Директни лидове – без брокери',
    'Разширени статистики',
    'Приоритетно показване',
    'Имейл и чат поддръжка',
  ] : [
    'Up to 5 active listings',
    'Direct leads — no brokers',
    'Advanced analytics',
    'Priority placement',
    'Email & chat support',
  ])

  return (
    <div className="card p-8 border-2 border-primary relative">
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
          {lang === 'bg' ? 'Популярен' : 'Popular'}
        </span>
      </div>
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>
        <h4 className="text-xl font-bold text-gray-900 mb-2">
          {dict.developerJoin.pricing.standardPlan.name}
        </h4>
        <div className="text-4xl font-extrabold text-gray-900 mb-2">
          {billingCycle === 'yearly' ? yearlyLabel : monthlyLabel}
        </div>
        <p className="text-gray-600 mb-4">
          {dict.developerJoin.pricing.standardPlan.description}
        </p>
        <div className="bg-blue-50 rounded-lg p-3 mb-6">
          <p className="text-sm text-blue-800 font-medium">
            {dict.developerJoin.pricing.standardPlan.note}
          </p>
        </div>
        <ul className="text-left space-y-3 mb-6">
          {features.map((f: string, i: number) => (
            <li key={i} className="flex items-center gap-3 text-gray-700">
              <CheckCircle className="w-5 h-5 text-indigo-600" />
              <span className="text-sm">{f}</span>
            </li>
          ))}
        </ul>
        <Link href={`/${lang}/register?type=developer`}>
          <button className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            {dict.developerJoin.pricing.standardPlan.cta}
          </button>
        </Link>
      </div>
    </div>
  )
}
