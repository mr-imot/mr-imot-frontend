import Link from "next/link"
import { Image } from "@imagekit/next"
import { toIkPath } from "@/lib/imagekit"
import { HomepageHero } from "./homepage-hero"
import { ThreeStepProcessSection } from "./sections/three-step-process-section"
import { PlatformPrinciplesSection } from "./sections/platform-principles-section"
import { TopCities } from "@/components/home/top-cities"
import { FeaturedDevelopers } from "@/components/home/featured-developers"
import { LatestListingsSSR } from "@/components/home/latest-listings-ssr"
import { LatestNews } from "@/components/home/latest-news"
import { LazyPricingSection } from "./components/client-islands"
import { FaqSection } from "@/components/faq-section"
import { TestimonialsSection } from "@/components/TestimonialsSection"
import { RecentListingsLazy } from "./sections/recent-listings-lazy"
import { registerDeveloperHref } from "@/lib/routes"

interface LocalizedHomePageProps {
  dict: any
  lang: string
}

export function LocalizedHomePage({ dict, lang }: LocalizedHomePageProps) {

  return (
    <main className="flex-1">
      <div className="min-h-screen relative overflow-visible">
        {/* Hero Section - Server Component (zero client JS) */}
        <HomepageHero dict={dict} lang={lang} />

        {/* 3-Step Process Section - Server Component */}
        <ThreeStepProcessSection dict={dict} lang={lang} />

        {/* Platform Principles Section - Why We're Different */}
        <PlatformPrinciplesSection dict={dict} lang={lang} />

        {/* SSR internal linking: cities, developers, listings, news */}
        <TopCities lang={lang as 'en' | 'bg' | 'ru' | 'gr'} dict={dict} />
        <FeaturedDevelopers lang={lang as 'en' | 'bg' | 'ru' | 'gr'} dict={dict} />
        <LatestListingsSSR lang={lang as 'en' | 'bg' | 'ru' | 'gr'} dict={dict} />
        <LatestNews lang={lang as 'en' | 'bg' | 'ru' | 'gr'} dict={dict} />

        {/* Recent Listings Section - Client Component (lazy loaded, client-side only) */}
        <RecentListingsLazy dict={dict} lang={lang} />

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
                          ? toIkPath("https://ik.imagekit.io/ts59gf2ul/Logo/stani-chats-ot-nas-mr-imot.png")
                          : toIkPath("https://ik.imagekit.io/ts59gf2ul/Logo/join-us-mr-imot.png")
                        }
                        alt={lang === 'bg' ? dict.developerJoin.imageAlt : 'Mister Imot mascot inviting developers to join real estate platform with join us flag'}
                        width={320}
                        height={240}
                        loading="lazy"
                        transformation={[{ width: 420, quality: 85, format: "webp", focus: "auto" }]}
                        className="w-auto h-auto mx-auto"
                        style={{
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
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-charcoal-500 to-charcoal-600 flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                          </svg>
                        </div>
                        <p className="text-lg text-gray-700 font-medium leading-tight text-left">
                          {dict.developerJoin.benefits.directContact}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                          </svg>
                        </div>
                        <p className="text-lg text-gray-700 font-medium leading-tight text-left">
                          {dict.developerJoin.benefits.fullControl}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                          </svg>
                        </div>
                        <p className="text-lg text-gray-700 font-medium leading-tight text-left">
                          {dict.developerJoin.benefits.protectedListings}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-charcoal-600 to-charcoal-700 flex items-center justify-center flex-shrink-0 mt-1">
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
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-charcoal-500 to-charcoal-600 flex items-center justify-center flex-shrink-0 mt-1">
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
      <section className="py-16 sm:py-20 md:py-24" style={{ background: 'linear-gradient(180deg, #2a4a5a 0%, #1e3a47 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center">
            <div className="rounded-2xl p-12">
              <h3 className="text-2xl sm:text-3xl font-bold mb-6 font-serif text-white">
                {dict.developerJoin.finalCta.heading}
              </h3>
              <Link href={registerDeveloperHref(lang as 'en' | 'bg' | 'ru' | 'gr')}>
                <button className="group relative px-10 py-4 rounded-2xl bg-white text-charcoal-500 font-bold tracking-wider uppercase hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl active:scale-95 overflow-hidden">
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
    </main>
  )
}
