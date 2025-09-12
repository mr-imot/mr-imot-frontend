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
      <section className="py-8 xs:py-12 sm:py-16 md:py-20 laptop:py-24 lg:py-40 relative">
        <div className="container mx-auto px-3 xs:px-4 sm:px-6 md:px-8">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-3 xs:gap-4 sm:gap-6 md:gap-8 laptop:gap-8 lg:gap-12 items-center min-h-[65vh] xs:min-h-[70vh] sm:min-h-[75vh] md:min-h-[80vh] laptop:min-h-[70vh] lg:min-h-[80vh]">
            {/* Left Column - Content */}
            <div className="space-y-2 xs:space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-6 order-2 lg:order-none mt-2 xs:mt-4 sm:mt-6 md:mt-8 lg:mt-0">
              {/* Main Headline */}
              <div className="space-y-2">
                <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl laptop:text-6xl lg:text-7xl leading-[1.1] tracking-tight text-gray-900" style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: 'clamp(2rem, 5vw, 4.5rem)'
                }}>
                  <span className="font-normal text-gray-600 italic">Find</span> Your
                  <br />
                  <span className="font-bold text-gray-900">Perfect Property</span>
                  <br />
                  <span className="font-semibold text-gray-800">Directly from Developers</span>
                </h1>
              </div>
              
              {/* Subtitle */}
              <div className="space-y-2">
                <p className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal text-gray-600 leading-relaxed" style={{
                  fontFamily: 'Inter, system-ui, sans-serif'
                }}>
                  Browse off-plan projects in Bulgaria.
                </p>
              </div>
              
              {/* Tagline */}
              <div className="space-y-2">
                <p className="text-sm xs:text-base sm:text-lg md:text-xl font-light text-gray-500 leading-relaxed italic" style={{
                  fontFamily: 'Inter, system-ui, sans-serif'
                }}>
                  Skip the middleman. Skip the markup.
                </p>
              </div>

              {/* Single CTA - Positioned under text, left-aligned */}
              <div className="mt-4 xs:mt-6 sm:mt-8 lg:mt-10">
                <Link href="/listings">
                  <button className="w-full xs:w-auto px-4 xs:px-6 py-2 xs:py-3 min-h-[44px] xs:min-h-[48px] rounded-xl bg-slate-900 text-white font-medium text-base xs:text-lg transition-all duration-200 ease-in-out hover:bg-slate-800 hover:shadow-lg active:scale-[0.98] cursor-pointer" style={{
                    fontFamily: 'Playfair Display, serif',
                    backgroundColor: '#0f172a'
                  }}>
                    Browse Properties
                  </button>
                </Link>
              </div>
            </div>

            {/* Right Column - Supporting Mascot */}
            <div className="order-1 lg:order-none lg:flex lg:items-center lg:justify-end lg:h-full">
              {/* Hero Image - Resized and repositioned as supporting element */}
              <div className="w-full flex justify-center lg:justify-end">
                <img
                  src="https://ik.imagekit.io/ts59gf2ul/Logo/Generated%20Image%20September%2012,%202025%20-%205_13PM.png?updatedAt=1757686598043"
                  alt="MR-IMOT Logo - No Brokers, No Commissions"
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
                Ready to List Your Project?
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-6 sm:mb-8 leading-relaxed" style={{
                fontFamily: 'Inter, system-ui, sans-serif'
              }}>
                Join Bulgaria's fastest-growing platform for off-plan properties. 
                <span className="font-semibold text-gray-900"> Zero fees. Direct connections. Maximum exposure.</span>
              </p>
              <div className="flex justify-center lg:justify-start">
                <Link href="/register?type=developer">
                  <button className="px-8 py-4 rounded-xl bg-slate-900 text-white font-semibold text-lg transition-all duration-200 ease-in-out hover:bg-slate-800 hover:shadow-lg active:scale-[0.98] cursor-pointer" style={{
                    fontFamily: 'Playfair Display, serif',
                    backgroundColor: '#0f172a'
                  }}>
                    Register for Free
                  </button>
                </Link>
              </div>
            </div>

            {/* Right Mascot */}
            <div className="flex-shrink-0">
              <img
                src="https://ik.imagekit.io/ts59gf2ul/Logo/join-us-mr-imot-no-bg?updatedAt=1757692449277"
                alt="Join Mr. Imot - Developer Registration"
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
      <FaqSection />
    </div>
    </>
  )
}