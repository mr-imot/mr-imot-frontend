"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Shield,
  MapPin,
  DollarSign,
  ExternalLink,
  Search,
  Phone,
  CheckCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { EtchedGlassBackground } from "@/components/etched-glass-background"
import { FaqSection } from "@/components/faq-section"

// Dynamic header height calculation + robust viewport unit fallback
const useHeaderHeight = () => {
  useEffect(() => {
    const setVhUnit = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }

    const updateHeaderHeight = () => {
      const header = document.querySelector('header')
      if (header) {
        const height = header.offsetHeight
        document.documentElement.style.setProperty('--header-height', `${height}px`)
        
        // Debug: Log the calculated height for verification
        console.log(`Header height calculated: ${height}px`)
      }
    }

    // Initial calculation with a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      setVhUnit()
      updateHeaderHeight()
    }, 100)

    // Recalculate on resize
    window.addEventListener('resize', setVhUnit)
    window.addEventListener('resize', updateHeaderHeight)
    
    // Recalculate when DOM changes
    const observer = new MutationObserver(updateHeaderHeight)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', setVhUnit)
      window.removeEventListener('resize', updateHeaderHeight)
      observer.disconnect()
    }
  }, [])
}

interface LocalizedHomePageProps {
  dict: any
  lang: string
}

export function LocalizedHomePage({ dict, lang }: LocalizedHomePageProps) {
  // Dynamic header height calculation
  useHeaderHeight()

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <div className="min-h-screen relative">
        {/* Etched Glass Background */}
        <EtchedGlassBackground />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container mx-auto px-3 xs:px-4 sm:px-6 md:px-8 w-full">
          <div className="hero-grid grid grid-rows-[auto_1fr] lg:grid-cols-2 lg:grid-rows-none gap-2 sm:gap-4 md:gap-6 lg:gap-8 items-center w-full">
            {/* Left Column - Content */}
            <div className="hero-content order-2 lg:order-none flex flex-col" style={{ 
              minHeight: 'calc(100vh - 80px)', // Use min-height instead of height
              paddingTop: 'clamp(60px, 15vh, 120px)', 
              paddingBottom: 'clamp(60px, 12vh, 100px)', // Increased bottom padding
              justifyContent: 'space-between'
            }}>
              {/* Top Section - Title + Subtitle */}
              <div className="flex-1 flex flex-col justify-center">
              {/* Main Headline */}
              <div className="space-y-2">
                <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl laptop:text-6xl lg:text-7xl leading-[1.1] tracking-tight text-gray-900" style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: 'clamp(2rem, 5vw, 4.5rem)'
                }}>
                  <span className="font-normal text-gray-600 italic">{dict.hero.title.find}</span> {dict.hero.title.your}
                  <br />
                  <span className="font-bold text-gray-900">{dict.hero.title.perfectProperty}</span>
                  <br />
                  <span className="font-semibold text-gray-800">{dict.hero.title.directlyFromDevelopers}</span>
                </h1>
              </div>
              
                {/* Combined Subtitle + Promise */}
                <div className="space-y-2" style={{ marginTop: 'clamp(16px, 4vh, 32px)' }}>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal text-gray-600 leading-relaxed" style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: '20px',
                    lineHeight: '1.6',
                    maxWidth: '520px'
                  }}>
                    <span className="font-semibold text-gray-800">{dict.hero.description.intro}</span> {dict.hero.description.platform} <span className="font-semibold text-gray-800">{dict.hero.description.noBrokers}</span>.
                  </p>
                  
                  {/* Promise - Separate line like CloudCart */}
                  <div style={{ marginTop: 'clamp(16px, 4vh, 32px)' }}>
                    <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal text-gray-600 leading-relaxed" style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '20px',
                      lineHeight: '1.6',
                      maxWidth: '520px'
                    }}>
                      <p className="font-semibold text-gray-800 mb-3">{dict.hero.promises.heading}</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span>{dict.hero.promises.noFakeListings}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
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
              <div className="flex-shrink-0" style={{ 
                marginTop: 'clamp(20px, 5vh, 40px)',
                marginBottom: 'clamp(40px, 8vh, 80px)' // Add bottom margin to CTA container
              }}>
                <Link href={`/${lang}/listings`}>
                  <button className="w-full sm:w-auto px-8 py-4 rounded-2xl text-white font-bold text-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-105 active:scale-[0.98] cursor-pointer uppercase tracking-wide relative overflow-hidden group" style={{
                    fontFamily: 'Playfair Display, serif',
                    backgroundColor: '#0f172a'
                  }}>
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
                  src="https://ik.imagekit.io/ts59gf2ul/Logo/Generated%20Image%20September%2012,%202025%20-%205_13PM.png?updatedAt=1757686598043"
                  alt={dict.hero.imageAlt}
                  className="w-auto h-auto transition-all duration-700 hover:scale-105 hover:rotate-1"
                  style={{
                    willChange: 'transform',
                    transform: 'translateZ(0)',
                    filter: 'drop-shadow(0 4px 15px rgba(0, 0, 0, 0.1))',
                    maxWidth: 'clamp(900px, 40vw, 1200px)',
                    maxHeight: 'clamp(800px, 35vw, 1000px)',
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

      {/* Mobile Mascot Section - Below Hero */}
      <section className="lg:hidden py-12">
        <div className="container mx-auto px-3 xs:px-4 sm:px-6 md:px-8 w-full">
          <div className="flex justify-center">
            <img
              src="https://ik.imagekit.io/ts59gf2ul/Logo/Generated%20Image%20September%2012,%202025%20-%205_13PM.png?updatedAt=1757686598043"
              alt={dict.hero.imageAlt}
              className="w-auto h-auto transition-all duration-700 hover:scale-105 hover:rotate-1"
              style={{
                willChange: 'transform',
                transform: 'translateZ(0)',
                filter: 'drop-shadow(0 4px 15px rgba(0, 0, 0, 0.1))',
                maxWidth: 'clamp(300px, 70vw, 500px)',
                maxHeight: 'clamp(250px, 60vw, 400px)',
                animation: 'float 6s ease-in-out infinite'
              }}
            />
          </div>
        </div>
      </section>

             {/* 3-Step Process Section - Premium Design */}
       <section className="relative overflow-hidden py-16 sm:py-20 md:py-24 lg:py-32" style={{backgroundColor: '#f9fafb'}}>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
           {/* Section Header */}
           <div className="text-center mb-12 sm:mb-16 md:mb-20 lg:mb-24">
             <div className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-8 uppercase tracking-wide border-2" style={{
               backgroundColor: 'rgba(15, 23, 42, 0.05)',
               color: '#64748b',
               borderColor: 'rgba(15, 23, 42, 0.1)'
             }} dangerouslySetInnerHTML={{ __html: dict.threeSteps.badge }}>
             </div>
             <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6" style={{
               fontFamily: 'Playfair Display, serif',
               lineHeight: '1.1',
               fontSize: 'clamp(2.5rem, 5vw, 4.5rem)'
             }}>
               {dict.threeSteps.heading}
              </h2>
           </div>

           {/* 3-Step Cards */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
               {/* Step 1 */}
               <div className="group">
                 <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-300 group-hover:-translate-y-2">
                   <div className="text-center">
                     {/* Number + Icon Container */}
                     <div className="flex items-center justify-center gap-4 mb-6">
                 {/* Number */}
                       <div className="inline-flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold text-white bg-emerald-700">
                   {dict.threeSteps.step1.number}
                 </div>
                 
                       {/* Icon with Liquid Glass Effect */}
                       <div className="relative">
                         <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 bg-emerald-700 relative overflow-hidden">
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
                           <svg className="w-10 h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                           </svg>
                         </div>
                       </div>
                     </div>
                     
                     <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{
                       fontFamily: 'Playfair Display, serif'
                  }}>
                    {dict.threeSteps.step1.label}
                     </h3>
                     <p className="text-gray-600 leading-relaxed" style={{
                       fontFamily: 'Inter, system-ui, sans-serif',
                       fontSize: '16px',
                       lineHeight: '1.6'
                   }} dangerouslySetInnerHTML={{ __html: dict.threeSteps.step1.content }}>
                     </p>
                   </div>
                   </div>
               </div>
               
               {/* Step 2 */}
               <div className="group">
                 <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-400 group-hover:-translate-y-2">
                   <div className="text-center">
                     {/* Number + Icon Container */}
                     <div className="flex items-center justify-center gap-4 mb-6">
                       {/* Number */}
                       <div className="inline-flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold text-white bg-blue-700">
                         {dict.threeSteps.step2.number}
                       </div>
                       
                       {/* Icon with Liquid Glass Effect */}
                       <div className="relative">
                         <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 bg-blue-700 relative overflow-hidden">
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
                           <svg className="w-10 h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                 </svg>
               </div>
             </div>
                 </div>
                 
                     <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{
                       fontFamily: 'Playfair Display, serif'
                  }}>
                    {dict.threeSteps.step2.label}
                     </h3>
                     <p className="text-gray-600 leading-relaxed" style={{
                       fontFamily: 'Inter, system-ui, sans-serif',
                       fontSize: '16px',
                       lineHeight: '1.6'
                   }} dangerouslySetInnerHTML={{ __html: dict.threeSteps.step2.content }}>
                     </p>
                   </div>
                   </div>
               </div>
               
               {/* Step 3 */}
               <div className="group">
                 <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-300 group-hover:-translate-y-2">
                   <div className="text-center">
                     {/* Number + Icon Container */}
                     <div className="flex items-center justify-center gap-4 mb-6">
                       {/* Number */}
                       <div className="inline-flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold text-white bg-indigo-600">
                         {dict.threeSteps.step3.number}
                       </div>
                       
                       {/* Icon with Liquid Glass Effect */}
                       <div className="relative">
                         <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 bg-indigo-600 relative overflow-hidden">
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
                           <svg className="w-10 h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1 1 21 9z"/>
                 </svg>
               </div>
             </div>
                 </div>
                 
                     <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{
                       fontFamily: 'Playfair Display, serif'
                  }}>
                    {dict.threeSteps.step3.label}
                     </h3>
                     <p className="text-gray-600 leading-relaxed" style={{
                       fontFamily: 'Inter, system-ui, sans-serif',
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
               <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6" style={{
                 fontFamily: 'Playfair Display, serif',
                 lineHeight: '1.2',
                 letterSpacing: '-0.02em'
               }}>
                {dict.threeSteps.mvp.heading}
               </h3>
               
               <div className="flex justify-center">
                 <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-4 sm:flex sm:flex-row sm:items-center sm:gap-8">
                   <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center">
                     <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                     </svg>
                   </div>
                   <span className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
                     {dict.threeSteps.mvp.benefits.fast}
                   </span>
                   
                   <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                     <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                     </svg>
                   </div>
                   <span className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
                     {dict.threeSteps.mvp.benefits.easy}
                   </span>
                   
                   <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
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
        {/* Paper Shaders Background */}
        <EtchedGlassBackground />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16 md:mb-20 lg:mb-24">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6" style={{
              fontFamily: 'Playfair Display, serif',
              lineHeight: '1.1',
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)'
            }}>
               {dict.whatMakesDifferent.heading}
             </h2>
            <p className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-700 max-w-4xl mx-auto leading-relaxed" style={{
              fontFamily: 'Inter, system-ui, sans-serif',
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
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 bg-emerald-700 relative overflow-hidden">
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
                    <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{
                      fontFamily: 'Playfair Display, serif'
                    }}>
                      {dict.whatMakesDifferent.principles.verifiedDevelopers.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed" style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
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
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 bg-blue-700 relative overflow-hidden">
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
                    <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{
                      fontFamily: 'Playfair Display, serif'
                    }}>
                      {dict.whatMakesDifferent.principles.noFinancialBias.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed" style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
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
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 bg-white border-2 border-indigo-200 relative overflow-hidden">
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
                    <svg className="w-10 h-10 text-indigo-600 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{
                      fontFamily: 'Playfair Display, serif'
                    }}>
                      {dict.whatMakesDifferent.principles.cleanExperience.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed" style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
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
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 bg-indigo-600 relative overflow-hidden">
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
                    <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{
                      fontFamily: 'Playfair Display, serif'
                    }}>
                      {dict.whatMakesDifferent.principles.honestBrokers.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed" style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
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

          {/* CTA Button */}
          <div className="text-center mt-16 sm:mt-20 md:mt-24 lg:mt-28">
            <Link href={`/${lang}/listings`}>
              <button className="w-full sm:w-auto px-8 py-4 rounded-2xl text-white font-bold text-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-105 active:scale-[0.98] cursor-pointer uppercase tracking-wide relative overflow-hidden group" style={{
                fontFamily: 'Playfair Display, serif',
                backgroundColor: '#0f172a'
              }}>
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

      {/* Developer Join Section */}
      <section className="py-16 sm:py-20 md:py-24" style={{backgroundColor: 'var(--brand-glass-light)'}}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-16">
            {/* Left Content - Wider */}
            <div className="flex-1 text-center lg:text-left lg:max-w-2xl">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6" style={{
                fontFamily: 'Playfair Display, serif',
                color: 'var(--brand-text-primary)'
              }}>
                {dict.developerJoin.heading}
              </h2>
              
              <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-8 sm:mb-10 leading-relaxed" style={{
                fontFamily: 'Inter, system-ui, sans-serif'
              }}>
                {dict.developerJoin.subheading}
              </p>

              {/* Key Benefits - Better Spacing */}
              <div className="mb-10 sm:mb-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <span className="text-base sm:text-lg text-gray-800 font-medium leading-relaxed">
                      {dict.developerJoin.benefits.noCommissions}
                    </span>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <span className="text-base sm:text-lg text-gray-800 font-medium leading-relaxed">
                      {dict.developerJoin.benefits.qualifiedLeads}
                    </span>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <span className="text-base sm:text-lg text-gray-800 font-medium leading-relaxed">
                      {dict.developerJoin.benefits.professionalDashboard}
                    </span>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <span className="text-base sm:text-lg text-gray-800 font-medium leading-relaxed">
                      {dict.developerJoin.benefits.freeRegistration}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Offer Details - Subtle */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Bonus:</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {dict.developerJoin.specialOffer.example}
                </p>
              </div>
            </div>

            {/* Right Side - Narrower Banner + CTA */}
            <div className="flex-shrink-0 w-full lg:w-80 xl:w-96">
              {/* Mascot */}
              <div className="text-center mb-6">
                <img
                  src="https://ik.imagekit.io/ts59gf2ul/Logo/join-us-mr-imot-no-bg?updatedAt=1757692449277"
                  alt={dict.developerJoin.imageAlt}
                  className="w-auto h-auto max-w-[200px] sm:max-w-[250px] lg:max-w-[220px] xl:max-w-[250px] mx-auto transition-all duration-700 hover:scale-105 hover:rotate-1"
                  style={{
                    willChange: 'transform',
                    transform: 'translateZ(0)',
                    filter: 'drop-shadow(0 8px 25px rgba(0, 0, 0, 0.15))'
                  }}
                />
              </div>

              {/* Special Offer Banner - Compact */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 mb-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-700/90"></div>
                <div className="relative z-10 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wide">Limited Time</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold mb-2" style={{
                    fontFamily: 'Playfair Display, serif'
                  }}>
                    {dict.developerJoin.specialOffer.heading}
                  </h3>
                  <p className="text-xs text-blue-100 leading-relaxed">
                    {dict.developerJoin.specialOffer.benefits[0]}
                  </p>
                </div>
              </div>

              {/* Primary CTA - Compact */}
              <div className="text-center">
                <Link href={`/${lang}/register?type=developer`}>
                  <button className="w-full px-8 py-4 rounded-2xl text-white font-bold text-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-105 active:scale-[0.98] cursor-pointer uppercase tracking-wide relative overflow-hidden group" style={{
                    fontFamily: 'Playfair Display, serif',
                    backgroundColor: '#0f172a'
                  }}>
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

                    <span className="relative z-10">
                    {dict.developerJoin.cta}
                    </span>
                  </button>
                </Link>
              </div>
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
