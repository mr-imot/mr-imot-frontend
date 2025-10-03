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

// Dynamic header height + resilient viewport unit fallback (iOS, orientation, bfcache)
const useHeaderHeight = () => {
  useEffect(() => {
    const computeAndSetVars = () => {
      const viewportH = (window.visualViewport?.height ?? window.innerHeight)
      const vh = viewportH * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)

      const header = document.querySelector('header') as HTMLElement | null
      const headerH = header?.offsetHeight ?? 0
      document.documentElement.style.setProperty('--header-height', `${headerH}px`)
    }

    // First paint + next frame (layout settled)
    computeAndSetVars()
    requestAnimationFrame(() => computeAndSetVars())
    setTimeout(computeAndSetVars, 200)

    // Events that can change available height
    const onResize = () => computeAndSetVars()
    const onPageShow = () => computeAndSetVars()
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    window.addEventListener('pageshow', onPageShow)
    window.visualViewport?.addEventListener('resize', onResize)

    // React to DOM mutations that alter header size
    const observer = new MutationObserver(computeAndSetVars)
    observer.observe(document.body, { childList: true, subtree: true, attributes: true })

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
      window.removeEventListener('pageshow', onPageShow)
      window.visualViewport?.removeEventListener('resize', onResize)
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
      
      <div className="relative">
        {/* Etched Glass Background */}
        <EtchedGlassBackground />
      
      {/* Hero Section - Exactly 100vh (perfectly above the fold) */}
      <section className="hero-section" style={{ 
        height: 'calc(var(--vh, 1vh) * 100)',
        paddingTop: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div className="container mx-auto px-3 xs:px-4 sm:px-6 md:px-8 w-full">
          <div className="hero-grid grid grid-rows-[auto_1fr] lg:grid-cols-2 lg:grid-rows-none gap-2 sm:gap-4 md:gap-6 lg:gap-8 items-center w-full">
            {/* Left Column - Content */}
            <div className="hero-content space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-5 order-2 lg:order-none">
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
              
              {/* Subtitle */}
              <div className="space-y-2">
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal text-gray-600 leading-relaxed" style={{
                  fontFamily: 'Inter, system-ui, sans-serif'
                }}>
                  {dict.hero.subtitle}
                </p>
              </div>
              
              {/* Tagline */}
              <div className="space-y-2">
                <p className="text-base sm:text-lg md:text-xl font-light text-gray-500 leading-relaxed italic" style={{
                  fontFamily: 'Inter, system-ui, sans-serif'
                }}>
                  {dict.hero.tagline}
                </p>
              </div>

              {/* Single CTA - Positioned under text, left-aligned */}
              <div className="hero-cta mt-2 sm:mt-4 lg:mt-6">
                <Link href={`/${lang}/listings`}>
                  <button className="w-full sm:w-auto px-6 py-3 min-h-[48px] rounded-xl bg-slate-900 text-white font-medium text-lg transition-all duration-200 ease-in-out hover:bg-slate-800 hover:shadow-lg active:scale-[0.98] cursor-pointer" style={{
                    fontFamily: 'Playfair Display, serif',
                    backgroundColor: '#0f172a'
                  }}>
                    {dict.hero.cta}
                  </button>
                </Link>
              </div>
            </div>

            {/* Right Column - Supporting Mascot */}
            <div className="hero-visual order-1 lg:order-none lg:flex lg:items-center lg:justify-end lg:h-full">
              {/* Hero Image - Resized and repositioned as supporting element */}
              <div className="w-full flex justify-center lg:justify-end">
                <img
                  src="https://ik.imagekit.io/ts59gf2ul/Logo/Generated%20Image%20September%2012,%202025%20-%205_13PM.png?updatedAt=1757686598043"
                  alt={dict.hero.imageAlt}
                  className="w-auto h-auto max-w-[300px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[550px] xl:max-w-[600px] transition-all duration-700 hover:scale-105 hover:rotate-1"
                  style={{
                    willChange: 'transform',
                    transform: 'translateZ(0)',
                    filter: 'drop-shadow(0 4px 15px rgba(0, 0, 0, 0.1))'
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

             {/* 3-Step Process Section - Moved up for better psychological flow */}
       <section className="relative overflow-hidden py-12 sm:py-16 md:py-20 lg:py-24" style={{backgroundColor: 'var(--brand-glass-light)'}}>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
           {/* Section Header */}
           <div className="text-center mb-6 sm:mb-8 md:mb-12 lg:mb-20">
                                         <div className="inline-block px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8 uppercase tracking-wide border" style={{
                backgroundColor: 'var(--brand-badge-bg)',
                color: 'var(--brand-badge-text)',
                borderColor: 'var(--brand-badge-border)'
              }}>
                {dict.threeSteps.badge}
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black max-w-4xl mx-auto leading-tight tracking-tight" style={{
                color: 'var(--brand-text-primary)',
                fontFamily: 'var(--font-instrument-serif)'
              }} dangerouslySetInnerHTML={{ __html: dict.threeSteps.heading }}>
              </h2>
           </div>

           {/* Steps Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
             
             {/* Step 1 - DISCOVER HIDDEN GEMS */}
             <div className="relative w-full max-w-sm mx-auto md:max-w-none">
               <div className="p-6 sm:p-8 relative min-h-[15.625rem] sm:min-h-[17.5rem] md:min-h-[18.75rem] flex flex-col rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl border" style={{
                 backgroundColor: '#ffffff',
                 borderColor: 'var(--brand-gray-200)'
               }}>
                 {/* Number */}
                 <div className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-3 leading-none" style={{
                   color: 'var(--brand-btn-primary-bg)'
                 }}>
                   {dict.threeSteps.step1.number}
                 </div>
                 
                                   {/* Label */}
                  <div className="text-xs font-medium uppercase tracking-wider mb-4" style={{
                    color: 'var(--brand-text-muted)'
                  }}>
                    {dict.threeSteps.step1.label}
                  </div>
                  
                                     {/* Content */}
                   <div className="text-sm sm:text-base leading-relaxed font-medium flex-1" style={{
                     color: 'var(--brand-text-primary)'
                   }} dangerouslySetInnerHTML={{ __html: dict.threeSteps.step1.content }}>
                   </div>
               </div>
               
               {/* Arrow */}
               <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10 w-8 h-4 items-center justify-center hidden xl:flex">
                 <svg width="16" height="8" viewBox="0 0 16 8" fill="none">
                   <path d="M1 4L15 4M15 4L12 1M15 4L12 7" stroke="var(--brand-gray-400)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                 </svg>
               </div>
             </div>

             {/* Step 2 - NEGOTIATE LIKE AN INSIDER */}
             <div className="relative w-full max-w-sm mx-auto md:max-w-none">
               <div className="p-6 sm:p-8 relative min-h-[15.625rem] sm:min-h-[17.5rem] md:min-h-[18.75rem] flex flex-col rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl border" style={{
                 backgroundColor: '#ffffff',
                 borderColor: 'var(--brand-gray-200)'
               }}>
                 {/* Number */}
                 <div className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-3 leading-none" style={{
                   color: 'var(--brand-warning)'
                 }}>
                   {dict.threeSteps.step2.number}
                 </div>
                 
                                   {/* Label */}
                  <div className="text-xs font-medium uppercase tracking-wider mb-4" style={{
                    color: 'var(--brand-text-muted)'
                  }}>
                    {dict.threeSteps.step2.label}
                  </div>
                  
                                     {/* Content */}
                   <div className="text-sm sm:text-base leading-relaxed font-medium flex-1" style={{
                     color: 'var(--brand-text-primary)'
                   }} dangerouslySetInnerHTML={{ __html: dict.threeSteps.step2.content }}>
                   </div>
               </div>
               
               {/* Arrow */}
               <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10 w-8 h-4 items-center justify-center hidden xl:flex">
                 <svg width="16" height="8" viewBox="0 0 16 8" fill="none">
                   <path d="M1 4L15 4M15 4L12 1M15 4L12 7" stroke="var(--brand-gray-400)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                 </svg>
               </div>
             </div>

             {/* Step 3 - LOCK IN FUTURE VALUE */}
             <div className="relative w-full max-w-sm mx-auto md:max-w-none">
               <div className="p-6 sm:p-8 relative min-h-[15.625rem] sm:min-h-[17.5rem] md:min-h-[18.75rem] flex flex-col rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl border" style={{
                 backgroundColor: '#ffffff',
                 borderColor: 'var(--brand-gray-200)'
               }}>
                 {/* Number */}
                 <div className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-3 leading-none" style={{
                   color: 'var(--brand-success)'
                 }}>
                   {dict.threeSteps.step3.number}
                 </div>
                 
                                   {/* Label */}
                  <div className="text-xs font-medium uppercase tracking-wider mb-4" style={{
                    color: 'var(--brand-text-muted)'
                  }}>
                    {dict.threeSteps.step3.label}
                  </div>
                  
                                     {/* Content */}
                   <div className="text-sm sm:text-base leading-relaxed font-medium flex-1" style={{
                     color: 'var(--brand-text-primary)'
                   }}>
                     {dict.threeSteps.step3.content}
                   </div>
               </div>
             </div>
           </div>

                       {/* Honest MVP Messaging */}
            <div className="text-center mt-8 sm:mt-12 md:mt-16">
              <p className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4">
                {dict.threeSteps.mvp.heading}
              </p>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                {dict.threeSteps.mvp.subheading}
              </p>
            </div>
         </div>
       </section>

      {/* What Makes Mr. Imot Different Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24" style={{backgroundColor: 'var(--brand-glass-primary)'}}>
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
                     <div className="text-center mb-6 sm:mb-8 md:mb-12">
             <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3" style={{color: 'var(--brand-text-primary)'}}>
               {dict.whatMakesDifferent.heading}
             </h2>
             <p className="text-base sm:text-lg max-w-3xl mx-auto mb-3 sm:mb-4" style={{color: 'var(--brand-text-secondary)'}}>
               {dict.whatMakesDifferent.subheading}
             </p>
           </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            <div className="text-center group p-4 sm:p-6 md:p-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform" style={{backgroundColor: 'var(--brand-btn-primary-bg)'}}>
                <MapPin className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" style={{color: 'var(--brand-btn-primary-text)'}} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4" style={{color: 'var(--brand-text-primary)'}}>{dict.whatMakesDifferent.features.realLocations.title}</h3>
              <p className="text-sm sm:text-base leading-relaxed" style={{color: 'var(--brand-text-secondary)'}}>
                {dict.whatMakesDifferent.features.realLocations.description}
              </p>
            </div>

            <div className="text-center group p-4 sm:p-6 md:p-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform" style={{backgroundColor: 'var(--brand-btn-primary-bg)'}}>
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" style={{color: 'var(--brand-btn-primary-text)'}} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4" style={{color: 'var(--brand-text-primary)'}}>{dict.whatMakesDifferent.features.noFakeListings.title}</h3>
              <p className="text-sm sm:text-base leading-relaxed" style={{color: 'var(--brand-text-secondary)'}}>
                {dict.whatMakesDifferent.features.noFakeListings.description}
              </p>
            </div>

            <div className="text-center group p-4 sm:p-6 md:p-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform" style={{backgroundColor: 'var(--brand-btn-primary-bg)'}}>
                <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" style={{color: 'var(--brand-btn-primary-text)'}} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4" style={{color: 'var(--brand-text-primary)'}}>{dict.whatMakesDifferent.features.zeroCommission.title}</h3>
              <p className="text-sm sm:text-base leading-relaxed" style={{color: 'var(--brand-text-secondary)'}}>
                {dict.whatMakesDifferent.features.zeroCommission.description}
              </p>
            </div>
          </div>

          {/* Single CTA - Enhanced prominence */}
          <div className="text-center mt-6 sm:mt-8 md:mt-10">
            <button className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-3 md:px-10 md:py-4 rounded-full font-bold text-sm sm:text-base transition-all duration-200 shadow-xl hover:shadow-2xl inline-flex items-center justify-center transform hover:scale-105" style={{
              backgroundColor: 'var(--brand-btn-primary-bg)',
              color: 'var(--brand-btn-primary-text)'
            }}>
              <Link href={`/${lang}/listings`} className="flex items-center">
                {dict.whatMakesDifferent.cta}
                <ExternalLink className="ml-2 w-5 h-5" />
              </Link>
            </button>
          </div>
        </div>
      </section>

      {/* Developer Join Section */}
      <section className="py-16 sm:py-20 md:py-24" style={{backgroundColor: 'var(--brand-glass-light)'}}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6" style={{
                fontFamily: 'Playfair Display, serif',
                color: 'var(--brand-text-primary)'
              }}>
                {dict.developerJoin.heading}
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-6 sm:mb-8 leading-relaxed" style={{
                fontFamily: 'Inter, system-ui, sans-serif'
              }}>
                {dict.developerJoin.description}
                <span className="font-semibold text-gray-900"> {dict.developerJoin.descriptionBold}</span>
              </p>
              <div className="flex justify-center lg:justify-start">
                <Link href={`/${lang}/register?type=developer`}>
                  <button className="px-8 py-4 rounded-xl bg-slate-900 text-white font-semibold text-lg transition-all duration-200 ease-in-out hover:bg-slate-800 hover:shadow-lg active:scale-[0.98] cursor-pointer" style={{
                    fontFamily: 'Playfair Display, serif',
                    backgroundColor: '#0f172a'
                  }}>
                    {dict.developerJoin.cta}
                  </button>
                </Link>
              </div>
            </div>

            {/* Right Mascot */}
            <div className="flex-shrink-0">
              <img
                src="https://ik.imagekit.io/ts59gf2ul/Logo/join-us-mr-imot-no-bg?updatedAt=1757692449277"
                alt={dict.developerJoin.imageAlt}
                className="w-auto h-auto max-w-[300px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[400px] xl:max-w-[450px] transition-all duration-700 hover:scale-105 hover:rotate-1"
                style={{
                  willChange: 'transform',
                  transform: 'translateZ(0)',
                  filter: 'drop-shadow(0 8px 25px rgba(0, 0, 0, 0.15))'
                }}
              />
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
