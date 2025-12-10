import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import { HomepageHero } from "./homepage-hero"
import { MobileMascotSection } from "./sections/mobile-mascot-section"
import { ThreeStepProcessSection } from "./sections/three-step-process-section"
import { RecentListingsSection } from "./sections/recent-listings-section"
import { EtchedGlassBackground, LazyPricingSection } from "./components/client-islands"

// Lazy load heavy components to reduce initial bundle size (ssr: true is allowed in server components)
const FaqSection = dynamic(
  () => import("@/components/faq-section").then((mod) => ({ default: mod.FaqSection })),
  { ssr: true }
)

const TestimonialsSection = dynamic(
  () => import("@/components/TestimonialsSection").then((mod) => ({ default: mod.TestimonialsSection })),
  { ssr: true }
)

interface LocalizedHomePageProps {
  dict: any
  lang: string
}

export function LocalizedHomePage({ dict, lang }: LocalizedHomePageProps) {

  return (
    <>
      <div className="min-h-screen relative overflow-visible">
        {/* Etched Glass Background - Deferred loading */}
        <EtchedGlassBackground />
      
        {/* Hero Section - Server Component (zero client JS) */}
        <HomepageHero dict={dict} lang={lang} />

        {/* Mobile Mascot Section - Server Component */}
        <MobileMascotSection dict={dict} lang={lang} />

        {/* 3-Step Process Section - Server Component */}
        <ThreeStepProcessSection dict={dict} lang={lang} />

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
                    {/* Liquid Glass Overlay - GPU-accelerated */}
                    <div className="absolute inset-0 liquid-flow-bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out" style={{
                      borderRadius: '16px',
                      animation: 'liquidFlow 2s ease-in-out infinite',
                      willChange: 'opacity, transform',
                      transform: 'translateZ(0)',
                      backfaceVisibility: 'hidden'
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
                    {/* Liquid Glass Overlay - GPU-accelerated */}
                    <div className="absolute inset-0 liquid-flow-bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out" style={{
                      borderRadius: '16px',
                      animation: 'liquidFlow 2s ease-in-out infinite',
                      willChange: 'opacity, transform',
                      transform: 'translateZ(0)',
                      backfaceVisibility: 'hidden'
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
                    {/* Liquid Glass Overlay - GPU-accelerated */}
                    <div className="absolute inset-0 liquid-flow-bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out" style={{
                      borderRadius: '16px',
                      animation: 'liquidFlow 2s ease-in-out infinite',
                      willChange: 'opacity, transform',
                      transform: 'translateZ(0)',
                      backfaceVisibility: 'hidden'
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
                    {/* Liquid Glass Overlay - GPU-accelerated */}
                    <div className="absolute inset-0 liquid-flow-bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out" style={{
                      borderRadius: '16px',
                      animation: 'liquidFlow 2s ease-in-out infinite',
                      willChange: 'opacity, transform',
                      transform: 'translateZ(0)',
                      backfaceVisibility: 'hidden'
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

        {/* Recent Listings Section - Client Component (needs state) */}
        <RecentListingsSection dict={dict} lang={lang} />

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
                      <Image
                        src={lang === 'bg' 
                          ? "https://ik.imagekit.io/ts59gf2ul/Logo/stani-chats-ot-nas-mr-imot.png?updatedAt=1760104490964&tr=f-webp,q-85,w-320,h-auto,dpr=auto"
                          : "https://ik.imagekit.io/ts59gf2ul/Logo/join-us-mr-imot.png?updatedAt=1760105808199&tr=f-webp,q-85,w-320,h-auto,dpr=auto"
                        }
                        alt={lang === 'bg' ? dict.developerJoin.imageAlt : 'Mister Imot mascot inviting developers to join real estate platform with join us flag'}
                        width={320}
                        height={240}
                        loading="lazy"
                        className="w-auto h-auto mx-auto transition-all duration-700 hover:scale-110 hover:rotate-2"
                        style={{
                          willChange: 'transform',
                          transform: 'translateZ(0)',
                          filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.15))',
                          width: 'clamp(200px, 20vw, 320px)',
                          height: 'auto'
                        }}
                        sizes="(max-width: 1024px) 50vw, 320px"
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
            <LazyPricingSection lang={lang} dict={dict} />
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
                  {/* Liquid Glass Overlay - GPU-accelerated */}
                  <div className="absolute inset-0 liquid-flow-bg-charcoal opacity-100 transition-opacity duration-300 ease-out" style={{
                    borderRadius: '16px',
                    animation: 'liquidFlow 2s ease-in-out infinite',
                    willChange: 'opacity, transform',
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden'
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
