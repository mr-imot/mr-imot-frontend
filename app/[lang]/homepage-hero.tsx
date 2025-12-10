import Link from "next/link"
import Image from "next/image"
import clsx from "clsx"
import styles from "./homepage-hero.module.css"

interface HomepageHeroProps {
  dict: any
  lang: string
}

export function HomepageHero({ dict, lang }: HomepageHeroProps) {
  return (
    <section className={styles.heroSection} style={{ 
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className={clsx(
          "grid grid-rows-[auto_1fr] lg:grid-cols-2 lg:grid-rows-none gap-2 sm:gap-4 md:gap-6 lg:gap-8 items-center w-full",
          styles.heroGrid
        )}>
          {/* Left Column - Content */}
          <div className={clsx("order-2 lg:order-none flex flex-col", styles.heroContent)} style={{ 
            height: 'calc(100vh - var(--header-height, 80px))',
            paddingBottom: 'clamp(1.5rem, 6vh, 3rem)',
            justifyContent: 'space-between'
          }}>
            {/* Top Section - Title + Subtitle */}
            <div className="flex-1 flex flex-col justify-center" style={{ paddingTop: 'clamp(1rem, 4vh, 2rem)' }}>
              {/* Main Headline - gradient text matching other sections */}
              <div className="space-y-1">
                <h1 className={clsx("tracking-tight font-serif", styles.heroTitle)} style={{
                  fontSize: 'clamp(2.75rem, 6vw, 4.75rem)',
                  lineHeight: '1.1'
                }}>
                  <span className="font-normal italic drop-shadow-sm" style={{ 
                    background: 'linear-gradient(135deg, #264653 0%, #3f7489 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    paddingRight: '0.15em'
                  }}>
                    {dict.hero.title.find}
                  </span>
                  <span className="headline-gradient">{dict.hero.title.your}</span>
                  <br />
                  <span className="headline-gradient font-semibold">{dict.hero.title.perfectProperty}</span>
                  <br />
                  <span className="headline-gradient font-medium">{dict.hero.title.directlyFromDevelopers}</span>
                </h1>
              </div>
              
              {/* Combined Subtitle + Promise */}
              <div className="space-y-2" style={{ marginTop: 'clamp(16px, 4vh, 32px)' }}>
                <p className={clsx("font-normal leading-relaxed font-sans", styles.heroSubtitle)}>
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
            <div className={clsx("flex-shrink-0", styles.heroCta)} style={{ 
              marginTop: 'clamp(0.75rem, 3vh, 1.5rem)',
              marginBottom: '0'
            }}>
              <Link href={`/${lang}/listings`}>
                <button className="w-full sm:w-auto px-10 py-5 rounded-2xl text-white font-bold uppercase transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-105 active:scale-[0.98] cursor-pointer tracking-wider relative overflow-hidden group bg-charcoal-700 hover:bg-charcoal-800 focus:ring-2 focus:ring-charcoal-300 font-sans" style={{ fontSize: 'clamp(1.25rem, 3.5vw, 1.75rem)', padding: 'clamp(1.125rem, 2.75vw, 1.75rem) clamp(2.25rem, 5.5vw, 3.5rem)' }}>
                  {/* Liquid Glass Overlay - GPU-accelerated */}
                  <div className={clsx("absolute inset-0 opacity-100 transition-opacity duration-300 ease-out", styles.liquidFlowBgCharcoal)} style={{
                    borderRadius: '16px',
                    willChange: 'opacity, transform',
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden'
                  }} />

                  {/* Shimmer Effect - Always Visible */}
                  <div className={clsx("absolute inset-0 opacity-100 transition-opacity duration-500 ease-out", styles.ctaShimmer)} />

                  <span className="relative z-10">
                    {dict.hero.cta}
                  </span>
                </button>
              </Link>
            </div>
          </div>

          {/* Right Column - Supporting Mascot (Desktop Only) */}
          <div className={clsx("hidden lg:flex lg:items-center lg:justify-end lg:h-full", styles.heroVisual)}>
            {/* Hero Image - LCP Element with priority loading */}
            <div className="w-full flex justify-center lg:justify-end">
              <Image
                src={lang === 'bg' 
                  ? "https://ik.imagekit.io/ts59gf2ul/Logo/0_-komisionna-mr-imot.png?updatedAt=1760104535412&tr=f-webp,q-80,w-960,h-auto,dpr=auto"
                  : "https://ik.imagekit.io/ts59gf2ul/Logo/0_-commissions-mr-imot.png?updatedAt=1760108287952&tr=f-webp,q-80,w-960,h-auto,dpr=auto"
                }
                alt={lang === 'bg' ? dict.hero.imageAlt : 'Mister Imot mascot holding flag with 0% commissions message for real estate platform'}
                width={960}
                height={640}
                priority
                className={clsx("w-auto h-auto transition-all duration-700 hover:scale-105 hover:rotate-1", styles.heroImage)}
                style={{
                  width: 'clamp(720px, 50vw, 960px)',
                  height: 'auto'
                }}
                    sizes="(max-width: 1024px) 0vw, (max-width: 1920px) 50vw, 720px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

