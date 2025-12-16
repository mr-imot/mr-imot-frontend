/**
 * Reusable WebPage schema component for structured data
 * Adds WebPage schema to provide additional context for search engines
 */

interface WebPageSchemaProps {
  name: string
  description?: string
  url: string
  lang: 'en' | 'bg' | 'ru' | 'gr'
  baseUrl: string
  primaryImageOfPage?: string
}

/**
 * Maps route language code to ISO locale for structured data
 */
const langToLocale: Record<string, string> = {
  en: 'en_US',
  bg: 'bg_BG',
  ru: 'ru_RU',
  gr: 'el_GR'
}

/**
 * Brand name per language
 */
const brandForLang = (lang: string): string => {
  if (lang === 'bg') return 'Мистър Имот'
  if (lang === 'ru') return 'Мистер Имот'
  return 'Mister Imot'
}

export default function WebPageSchema({
  name,
  description,
  url,
  lang,
  baseUrl,
  primaryImageOfPage
}: WebPageSchemaProps) {
  const locale = langToLocale[lang] || 'en_US'
  const brand = brandForLang(lang)

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": name,
    "description": description || "",
    "url": url,
    "inLanguage": locale,
    "isPartOf": {
      "@type": "WebSite",
      "name": brand,
      "url": baseUrl,
    },
    ...(primaryImageOfPage && {
      "primaryImageOfPage": {
        "@type": "ImageObject",
        "url": primaryImageOfPage,
      }
    }),
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["h1", ".prose p:first-of-type", "article h1", "article .prose p:first-of-type"],
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
    />
  )
}
