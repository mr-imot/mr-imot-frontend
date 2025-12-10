"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { getProjects } from "@/lib/api"
import { getListingUrl } from "@/lib/utils"

// Inline SVG icons to avoid loading lucide-react library
const MapPinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const ExternalLinkIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
)

interface RecentListingsSectionProps {
  dict: any
  lang: string
}

export function RecentListingsSection({ dict, lang }: RecentListingsSectionProps) {
  const [visible, setVisible] = useState(false)
  const [recentListings, setRecentListings] = useState<any[]>([])
  const [isLoadingListings, setIsLoadingListings] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Wait until section is near viewport before fetching
  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const onIntersect: IntersectionObserverCallback = (entries, observer) => {
      if (entries[0]?.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    }

    const observer = new IntersectionObserver(onIntersect, { rootMargin: "200px" })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // Fetch listings when section becomes visible
  useEffect(() => {
    if (!visible) return

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
    
    // Fetch immediately when visible - intersection observer already handles deferral
    fetchRecentListings()
  }, [visible])

  return (
    <section
      ref={containerRef}
      className="py-16 sm:py-20 md:py-24 bg-white"
    >
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
                  href={getListingUrl(listing, lang as 'en' | 'bg')}
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
                            loading="eager"
                            className="object-cover cursor-pointer"
                            sizes="400px"
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
                            <MapPinIcon className="w-12 h-12 text-gray-400" />
                          </div>
                        );
                      })()}
                    </div>
                    <h4 className="font-semibold text-lg mb-1 line-clamp-1">
                      {listing.name || (lang === 'bg' ? 'Проект' : 'Project')}
                    </h4>
                    <p className="text-muted-foreground text-sm flex items-center gap-1">
                      <MapPinIcon className="w-3 h-3" />
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
                    <ExternalLinkIcon className="w-10 h-10 text-gray-500" />
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
              {/* Liquid Glass Overlay - GPU-accelerated */}
              <div className="absolute inset-0 liquid-flow-bg-white opacity-100 transition-opacity duration-300 ease-out" style={{
                borderRadius: '16px',
                animation: 'liquidFlow 2s ease-in-out infinite',
                willChange: 'opacity, transform',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden'
              }} />

              {/* Shimmer Effect - Always Visible */}
              <div className="absolute inset-0 opacity-100 transition-opacity duration-500 ease-out" style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                transform: 'translateX(-100%)',
                animation: 'shimmer 1.5s ease-in-out infinite'
              }} />

              <span className="relative z-10 flex items-center justify-center">
                {dict.whatMakesDifferent.cta}
                <ExternalLinkIcon className="ml-2 w-5 h-5" />
              </span>
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}

