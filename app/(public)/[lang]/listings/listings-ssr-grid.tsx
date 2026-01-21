import Link from 'next/link'
import { listingHref, asLocale } from '@/lib/routes'
import { PropertyData } from '@/lib/marker-manager'

interface ListingsSSRGridProps {
  properties: PropertyData[]
  lang: 'en' | 'bg' | 'ru' | 'gr'
}

/**
 * Server-side rendered listing links for SEO crawlability.
 * 
 * This component renders listing links directly in the HTML source,
 * ensuring search engines can discover and crawl listing detail pages.
 * 
 * The client-side ListingsClientWrapper will replace this content
 * after hydration with interactive cards, but the links remain in
 * the initial HTML for SEO purposes.
 */
export function ListingsSSRGrid({ properties, lang }: ListingsSSRGridProps) {
  if (properties.length === 0) {
    return null
  }

  const locale = asLocale(lang)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-ssr-listings>
      {properties.map((property) => {
        const listingUrl = listingHref(locale, property.slug || property.id)
        
        return (
          <Link
            key={property.id}
            href={listingUrl}
            className="block group"
            aria-label={property.title || 'View listing'}
          >
            <article className="h-full border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              {/* Image */}
              <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
                {property.image ? (
                  <img
                    src={property.image}
                    alt={property.title || 'Property image'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {property.title || 'Property'}
                </h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                  {property.location || 'Location not specified'}
                </p>
                <p className="text-base font-medium text-gray-900">
                  {property.priceRange || property.shortPrice || 'Price on request'}
                </p>
              </div>
            </article>
          </Link>
        )
      })}
    </div>
  )
}
