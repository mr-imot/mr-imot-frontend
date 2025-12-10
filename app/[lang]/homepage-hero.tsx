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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 h-full">
        <div className={clsx(
          "grid lg:grid-cols-2 gap-4 lg:gap-6 xl:gap-8 items-center w-full h-full",
          styles.heroGrid
        )}>
          {/* Left Column - Content */}
          <div className={clsx("flex flex-col justify-center", styles.heroContent)}>
            {/* Main Headline */}
            <div className="space-y-1">
              <h1 className={clsx("tracking-tight font-serif", styles.heroTitle)} style={{
                fontSize: 'clamp(2.25rem, 5.5vw, 4.75rem)',
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
            
            {/* Subtitle + Promise */}
            <div className="mt-4 sm:mt-6 lg:mt-8">
              <p className={clsx("font-normal leading-relaxed font-sans text-gray-600", styles.heroSubtitle)}>
                <span className="font-semibold text-gray-800">{dict.hero.description.intro}</span> {dict.hero.description.platform} <span className="font-semibold text-gray-800">{dict.hero.description.noBrokers}</span>.
              </p>
              
              {/* Promise checkmarks */}
              <div className="mt-4 sm:mt-6">
                <p className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">{dict.hero.promises.heading}</p>
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5">
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm sm:text-base text-gray-600">{dict.hero.promises.noFakeListings}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5">
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm sm:text-base text-gray-600">{dict.hero.promises.noWastedTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile: Mascot + CTA side by side */}
            <div className="mt-6 sm:mt-8 lg:hidden">
              <div className="flex items-center gap-4">
                {/* Small mascot on mobile */}
                <div className="flex-shrink-0">
                  <Image
                    src={lang === 'bg' 
                      ? "https://ik.imagekit.io/ts59gf2ul/Logo/0_-komisionna-mr-imot.png?updatedAt=1760104535412&tr=f-webp,q-80,w-160,h-auto,dpr=auto"
                      : "https://ik.imagekit.io/ts59gf2ul/Logo/0_-commissions-mr-imot.png?updatedAt=1760108287952&tr=f-webp,q-80,w-160,h-auto,dpr=auto"
                    }
                    alt={lang === 'bg' ? dict.hero.imageAlt : 'Mister Imot mascot'}
                    width={120}
                    height={90}
                    priority
                    className="w-auto h-auto drop-shadow-lg"
                    style={{
                      width: 'clamp(100px, 28vw, 140px)',
                      height: 'auto'
                    }}
                    sizes="28vw"
                  />
                </div>
                
                {/* CTA Button */}
                <Link href={`/${lang}/listings`} className="flex-1">
                  <button className="w-full py-4 px-6 rounded-xl text-white font-bold uppercase transition-all duration-300 ease-in-out active:scale-[0.98] cursor-pointer tracking-wide relative overflow-hidden bg-charcoal-700 hover:bg-charcoal-800 focus:ring-2 focus:ring-charcoal-300 font-sans text-base sm:text-lg shadow-lg">
                    <div className={clsx("absolute inset-0 opacity-100", styles.liquidFlowBgCharcoal)} style={{
                      borderRadius: '12px'
                    }} />
                    <div className={clsx("absolute inset-0 opacity-100", styles.ctaShimmer)} />
                    <span className="relative z-10">{dict.hero.cta}</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Desktop CTA */}
            <div className={clsx("mt-8 hidden lg:block", styles.heroCta)}>
              <Link href={`/${lang}/listings`}>
                <button className="px-10 py-5 rounded-2xl text-white font-bold uppercase transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-105 active:scale-[0.98] cursor-pointer tracking-wider relative overflow-hidden group bg-charcoal-700 hover:bg-charcoal-800 focus:ring-2 focus:ring-charcoal-300 font-sans" style={{ fontSize: 'clamp(1.25rem, 2vw, 1.75rem)' }}>
                  <div className={clsx("absolute inset-0 opacity-100 transition-opacity duration-300 ease-out", styles.liquidFlowBgCharcoal)} style={{
                    borderRadius: '16px',
                    willChange: 'opacity, transform',
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden'
                  }} />
                  <div className={clsx("absolute inset-0 opacity-100 transition-opacity duration-500 ease-out", styles.ctaShimmer)} />
                  <span className="relative z-10">{dict.hero.cta}</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Right Column - Mascot (Desktop Only) */}
          <div className={clsx("hidden lg:flex lg:items-center lg:justify-end", styles.heroVisual)}>
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
                width: 'clamp(400px, 40vw, 800px)',
                height: 'auto'
              }}
              sizes="(max-width: 1024px) 0vw, (max-width: 1280px) 40vw, 45vw"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
