import Link from "next/link"
import Image from "next/image"

interface HomepageHeroProps {
  dict: any
  lang: string
}

export function HomepageHero({ dict, lang }: HomepageHeroProps) {
  return (
    <section className="hero-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="hero-grid grid grid-rows-[auto_1fr] lg:grid-cols-2 lg:grid-rows-none gap-2 sm:gap-4 md:gap-6 lg:gap-8 items-center w-full">
          {/* Left Column - Content */}
          <div className="hero-content order-2 lg:order-none flex flex-col" style={{ 
            height: 'calc(100vh - var(--header-height, 80px))',
            paddingBottom: 'clamp(1.5rem, 6vh, 3rem)',
            justifyContent: 'space-between'
          }}>
            {/* Top Section - Title + Subtitle */}
            <div className="flex-1 flex flex-col justify-center" style={{ paddingTop: 'clamp(1rem, 4vh, 2rem)' }}>
              {/* Main Headline - premium gradient text */}
              <div className="space-y-1">
                <h1 className="headline-gradient hero-title leading-[0.72] tracking-tight font-serif" style={{
                  fontSize: 'clamp(2.75rem, 6vw, 4.75rem)'
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
                <p className="hero-subtitle font-normal text-gray-600 leading-relaxed font-sans">
                  <span className="font-semibold text-gray-800">{dict.hero.description.intro}</span> {dict.hero.description.platform} <span className="font-semibold text-gray-800">{dict.hero.description.noBrokers}</span>.
                </p>
                
                {/* Promise - Separate line like CloudCart */}
                <div style={{ marginTop: 'clamp(16px, 4vh, 32px)' }}>
                  <div className="hero-subtitle font-normal text-gray-600 leading-relaxed font-sans">
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
              marginBottom: '0'
            }}>
              <Link href={`/${lang}/listings`}>
                <button className="w-full sm:w-auto px-10 py-5 rounded-2xl text-white font-bold uppercase transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-105 active:scale-[0.98] cursor-pointer tracking-wider relative overflow-hidden group bg-charcoal-700 hover:bg-charcoal-800 focus:ring-2 focus:ring-charcoal-300 font-sans" style={{ fontSize: 'clamp(1.25rem, 3.5vw, 1.75rem)', padding: 'clamp(1.125rem, 2.75vw, 1.75rem) clamp(2.25rem, 5.5vw, 3.5rem)' }}>
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
            {/* Hero Image - LCP Element with priority loading */}
            <div className="w-full flex justify-center lg:justify-end">
              <Image
                src={lang === 'bg' 
                  ? "https://ik.imagekit.io/ts59gf2ul/Logo/0_-komisionna-mr-imot.png?updatedAt=1760104535412&tr=f-auto,q-80,w-1800,h-auto,dpr=auto"
                  : "https://ik.imagekit.io/ts59gf2ul/Logo/0_-commissions-mr-imot.png?updatedAt=1760108287952&tr=f-auto,q-80,w-1800,h-auto,dpr=auto"
                }
                alt={lang === 'bg' ? dict.hero.imageAlt : 'Mister Imot mascot holding flag with 0% commissions message for real estate platform'}
                width={1800}
                height={1200}
                priority
                className="w-auto h-auto transition-all duration-700 hover:scale-105 hover:rotate-1"
                style={{
                  willChange: 'transform',
                  transform: 'translateZ(0)',
                  filter: 'drop-shadow(0 4px 15px rgba(0, 0, 0, 0.1))',
                  width: 'clamp(1250px, 60vw, 1800px)',
                  height: 'auto',
                  animation: 'float 6s ease-in-out infinite'
                }}
                sizes="(max-width: 1024px) 0vw, 60vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

