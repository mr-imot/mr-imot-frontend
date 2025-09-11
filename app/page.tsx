"use client"

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

export default function HomePage() {
  // FAQ Schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How can I find new apartments or houses in my city?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Open the map at mrimot.com/listings and explore projects in your city. Each project is posted by a verified developer, not a broker. You can view location details, visit sites in person, and contact developers directly. No registration is required to browse and explore all listings."
        }
      },
      {
        "@type": "Question",
        "name": "Are the projects on the platform reliable?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Every project is posted by a verified developer. Developers are accountable for the accuracy of their listing details. Our verification confirms the developer identity, ensuring you can trust the source while connecting directly with legitimate builders without middlemen."
        }
      },
      {
        "@type": "Question",
        "name": "What does it cost to list a project?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Listing projects is completely free. Verified developers can post an unlimited number of residential projects at no charge, helping them reach buyers directly without middlemen."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need to register to browse listings?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No registration is required. You can search, explore, and view all projects completely open."
        }
      },
      {
        "@type": "Question",
        "name": "Does it cost money for buyers to use the platform?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Browsing listings, checking project details, and contacting developers directly is 100% free. Buyers can explore all verified developer projects without any fees, advertisements, or hidden costs."
        }
      },
      {
        "@type": "Question",
        "name": "What does it take to get verified as a developer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our team manually verifies developers through direct contact via phone or email. The process confirms your identity and role in the project, ensuring only genuine developers can post listings and that buyers see authentic sources."
        }
      },
      {
        "@type": "Question",
        "name": "Are only developers allowed on the platform?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Only verified real estate developers can post projects. Brokers or third parties are not allowed unless explicitly authorized by the developer, ensuring a trustworthy platform for buyers."
        }
      },
      {
        "@type": "Question",
        "name": "How long does verification take?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Verification is usually completed within 48 hours. We prioritize speed while ensuring accuracy, so developers can post projects quickly and buyers can access verified listings reliably."
        }
      },
      {
        "@type": "Question",
        "name": "How do I post a project after verification?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Once verified, developers gain access to a dashboard where they can post unlimited projects. Step-by-step video tutorials and support are available to assist with posting and managing listings effectively."
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
      <section className="py-16 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="container mx-auto px-3 xs:px-4 sm:px-6 md:px-8">
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 laptop:gap-8 lg:gap-12 items-center min-h-[50vh] sm:min-h-[60vh] md:min-h-[60vh] laptop:min-h-[55vh] lg:min-h-[80vh]">
            {/* Left Column - Content */}
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
                            {/* Main Headline */}
              <div className="space-y-1">
                <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-4xl laptop:text-5xl lg:text-6xl leading-tight tracking-tight font-bold text-gray-900 drop-shadow-sm">
                  <span className="font-bold italic instrument">Find</span> Your
                  <br />
                  <span className="font-bold tracking-tight text-gray-900">Perfect Property Directly from Developers</span>
                </h1>
                
                {/* Enhanced Directory Messaging */}
                <p className="text-base sm:text-lg md:text-lg laptop:text-xl lg:text-2xl font-semibold text-gray-800 leading-relaxed drop-shadow-sm">
                  Browse off-plan projects in Bulgaria.
                </p>
              </div>
              
              {/* Subline with better contrast - separated for better spacing control */}
              <div className="pt-2">
                <p className="text-sm sm:text-base font-medium text-gray-700 leading-relaxed drop-shadow-sm">
                  Skip the middleman. Skip the markup.
                </p>
              </div>

              {/* Enhanced Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 pt-3 sm:pt-4">
                <Link href="/listings">
                  <button className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-3 md:px-10 md:py-4 rounded-full bg-transparent border-2 border-gray-700 text-gray-900 font-bold text-sm sm:text-base transition-all duration-200 hover:bg-gray-900 hover:text-white shadow-lg hover:shadow-xl cursor-pointer transform hover:scale-105">
                    Browse Properties
                  </button>
                </Link>
                <Link href="/register?type=developer">
                  <button className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-3 md:px-10 md:py-4 rounded-full bg-gray-900 text-white font-bold text-sm sm:text-base transition-all duration-200 hover:bg-gray-800 shadow-lg hover:shadow-xl cursor-pointer transform hover:scale-105">
                    List Your Project
                  </button>
                </Link>
              </div>
            </div>

            {/* Right Column - Empty for background visibility */}
            <div className="hidden lg:block">
              {/* This space allows the EtchedGlassBackground to be clearly visible */}
              {/* TODO: Add mobile/tablet video alternative or fallback content for screens below lg breakpoint */}
            </div>
          </div>
          
          {/* Video Container - Responsive positioned relative to container */}
          <div className="hidden lg:block absolute inset-0 pointer-events-none">
            <div className="relative w-full h-full">
              {/* Video positioned responsively within container bounds */}
              <div className="absolute w-[25rem] h-[25rem] laptop:w-[21.875rem] laptop:h-[21.875rem] xl:w-[28.125rem] xl:h-[28.125rem] 2xl:w-[31.25rem] 2xl:h-[31.25rem]"
                   style={{
                     top: '10%',
                     right: 'max(2rem, calc((100vw - 100%) / 2 - 2rem))'
                   }}>
                <div className="relative w-full aspect-square overflow-hidden rounded-2xl transition-all duration-300 backdrop-blur-xl"
                     style={{
                       background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.1) 100%)',
                       border: '1px solid rgba(255,255,255,0.2)',
                       boxShadow: `
                         0 8px 32px rgba(31, 38, 135, 0.37),
                         0 0 0 1px rgba(255, 255, 255, 0.1),
                         inset 0 1px 0 rgba(255, 255, 255, 0.2),
                         inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                       `,
                       backdropFilter: 'blur(20px)',
                       WebkitBackdropFilter: 'blur(20px)'
                     }}>
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                      willChange: 'transform',
                      transform: 'translateZ(0)'
                    }}
                  >
                    <source src="https://ik.imagekit.io/ts59gf2ul/Video_hero/mr-imot-demo.mp4?updatedAt=1756133338645" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                
                {/* Video Caption - Underneath the video container */}
                <div className="mt-6 text-center pointer-events-auto">
                  <p className="text-lg xl:text-xl font-semibold text-gray-800 leading-relaxed" style={{
                    fontFamily: 'var(--font-instrument-serif)'
                  }}>
                    ✨ See exactly what's being built near you on our interactive map
                  </p>
                </div>
              </div>
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
                FROM SEARCH TO PURCHASE IN 3 SIMPLE STEPS
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black max-w-4xl mx-auto leading-tight tracking-tight" style={{
                color: 'var(--brand-text-primary)',
                fontFamily: 'var(--font-instrument-serif)'
              }}>
                From search to purchase<br />in three simple steps
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
                   01
                 </div>
                 
                                   {/* Label */}
                  <div className="text-xs font-medium uppercase tracking-wider mb-4" style={{
                    color: 'var(--brand-text-muted)'
                  }}>
                    DISCOVER NEW PROJECTS
                  </div>
                  
                                     {/* Content */}
                   <div className="text-sm sm:text-base leading-relaxed font-medium flex-1" style={{
                     color: 'var(--brand-text-primary)'
                   }}>
                     Discover new developments on our<br />
                     <span style={{color: 'var(--brand-btn-primary-bg)', fontWeight: '600'}}>interactive map</span> before they're<br />
                     publicly available. Access<br />
                     <span style={{color: 'var(--brand-btn-primary-bg)', fontWeight: '600'}}>verified</span> projects first.
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
                   02
                 </div>
                 
                                   {/* Label */}
                  <div className="text-xs font-medium uppercase tracking-wider mb-4" style={{
                    color: 'var(--brand-text-muted)'
                  }}>
                    CONNECT DIRECTLY
                  </div>
                  
                                     {/* Content */}
                   <div className="text-sm sm:text-base leading-relaxed font-medium flex-1" style={{
                     color: 'var(--brand-text-primary)'
                   }}>
                     Contact developers directly to<br />
                     <span style={{color: 'var(--brand-warning)', fontWeight: '600'}}>discuss pricing</span> and schedule<br />
                     site visits using exact<br />
                     map locations.
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
                   03
                 </div>
                 
                                   {/* Label */}
                  <div className="text-xs font-medium uppercase tracking-wider mb-4" style={{
                    color: 'var(--brand-text-muted)'
                  }}>
                    SECURE YOUR PROPERTY
                  </div>
                  
                                     {/* Content */}
                   <div className="text-sm sm:text-base leading-relaxed font-medium flex-1" style={{
                     color: 'var(--brand-text-primary)'
                   }}>
                     Keep more money in your pocket<br />
                     by purchasing directly at developer<br />
                     pricing without broker fees.
                   </div>
               </div>
             </div>
           </div>

                       {/* Honest MVP Messaging */}
            <div className="text-center mt-8 sm:mt-12 md:mt-16">
              <p className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4">
                Be among the first to discover off-plan properties direct from developers
              </p>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                Be first to access Bulgaria's newest off-plan developments.
              </p>
            </div>
         </div>
       </section>

      {/* What Makes Mr. Imot Different Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24" style={{backgroundColor: 'var(--brand-glass-primary)'}}>
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
                     <div className="text-center mb-6 sm:mb-8 md:mb-12">
             <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3" style={{color: 'var(--brand-text-primary)'}}>
               What Makes Mr. imot Different
             </h2>
             <p className="text-base sm:text-lg max-w-3xl mx-auto mb-3 sm:mb-4" style={{color: 'var(--brand-text-secondary)'}}>
               Stop wasting time with broker games. Find properties the honest way.
             </p>
           </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            <div className="text-center group p-4 sm:p-6 md:p-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform" style={{backgroundColor: 'var(--brand-btn-primary-bg)'}}>
                <MapPin className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" style={{color: 'var(--brand-btn-primary-text)'}} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4" style={{color: 'var(--brand-text-primary)'}}>See Real Locations</h3>
              <p className="text-sm sm:text-base leading-relaxed" style={{color: 'var(--brand-text-secondary)'}}>
                No more "close to parks, schools and bus stops" lies. See exact project coordinates and visit the actual site yourself.
              </p>
            </div>

            <div className="text-center group p-4 sm:p-6 md:p-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform" style={{backgroundColor: 'var(--brand-btn-primary-bg)'}}>
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" style={{color: 'var(--brand-btn-primary-text)'}} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4" style={{color: 'var(--brand-text-primary)'}}>No Fake Listings</h3>
              <p className="text-sm sm:text-base leading-relaxed" style={{color: 'var(--brand-text-secondary)'}}>
                End the "we just sold that one" runaround. Only verified developers can list genuine projects.
              </p>
            </div>

            <div className="text-center group p-4 sm:p-6 md:p-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform" style={{backgroundColor: 'var(--brand-btn-primary-bg)'}}>
                <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" style={{color: 'var(--brand-btn-primary-text)'}} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4" style={{color: 'var(--brand-text-primary)'}}>Zero Commission</h3>
              <p className="text-sm sm:text-base leading-relaxed" style={{color: 'var(--brand-text-secondary)'}}>
                Keep your money. No broker fees, no platform charges, no annoying ads like it's the 2000s.
              </p>
            </div>
          </div>

          {/* Single CTA - Enhanced prominence */}
          <div className="text-center mt-6 sm:mt-8 md:mt-10">
            <button className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-3 md:px-10 md:py-4 rounded-full font-bold text-sm sm:text-base transition-all duration-200 shadow-xl hover:shadow-2xl inline-flex items-center justify-center transform hover:scale-105" style={{
              backgroundColor: 'var(--brand-btn-primary-bg)',
              color: 'var(--brand-btn-primary-text)'
            }}>
              <Link href="/listings" className="flex items-center">
                Browse All Properties
                <ExternalLink className="ml-2 w-5 h-5" />
              </Link>
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FaqSection />
    </div>
    </>
  )
}