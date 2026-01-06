import { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/seo'

// Get base URL - hardcoded production domain for SEO
// See: https://www.reddit.com/r/nextjs/s/otIdK3NiqK
function getBaseUrl(): string {
  return getSiteUrl()
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl()

  // Common rules for all crawlers (including LLMs)
  const commonRules = {
    allow: [
      '/',
      '/bg/',
      '/ru/',
      '/gr/',
      '/news/',
      '/bg/novini/',
      '/ru/novosti/',
      '/gr/eidhseis/',
      '/listings/',
      '/bg/obiavi/', // Bulgarian pretty URL for listings
      '/ru/obyavleniya/', // Russian pretty URL for listings
      '/gr/aggelies/', // Greek pretty URL for listings
      '/developers/',
      '/bg/stroiteli/', // Bulgarian pretty URL for developers
      '/ru/zastroyshchiki/', // Russian pretty URL for developers
      '/gr/kataskeuastes/', // Greek pretty URL for developers
      '/about-mister-imot/',
      '/bg/za-mistar-imot/', // Bulgarian pretty URL for about
      '/ru/o-mister-imot/', // Russian pretty URL for about
      '/gr/sxetika-me-to-mister-imot/', // Greek pretty URL for about
      '/contact/',
      '/bg/kontakt/', // Bulgarian pretty URL for contact
      '/ru/kontakty/', // Russian pretty URL for contact
      '/gr/epikoinonia/', // Greek pretty URL for contact
      // Policy pages - English (using /en/ prefix since they're under [lang] folder)
      '/en/cookie-policy/',
      '/en/privacy-policy/',
      '/en/terms-of-service/',
      // Policy pages - Bulgarian
      '/bg/cookie-policy/',
      '/bg/privacy-policy/',
      '/bg/terms-of-service/',
      // Policy pages - Russian
      '/ru/cookie-policy/',
      '/ru/privacy-policy/',
      '/ru/terms-of-service/',
      // Policy pages - Greek
      '/gr/cookie-policy/',
      '/gr/privacy-policy/',
      '/gr/terms-of-service/',
    ],
    disallow: [
      '/admin/',
      '/buyer/',
      '/developer/', // Catches /developer/ and all language variants
      '/en/developer/',
      '/bg/developer/',
      '/ru/developer/',
      '/gr/developer/',
      // Login pages - all languages
      '/en/login',
      '/bg/login',
      '/ru/login',
      '/gr/login',
      // Register pages - all languages
      '/en/register',
      '/bg/register',
      '/ru/register',
      '/gr/register',
      // Forgot password pages - all languages
      '/en/forgot-password',
      '/bg/forgot-password',
      '/ru/forgot-password',
      '/gr/forgot-password',
      '/api/',
      '/debug/',
      '/test-api/',
      '/verify-email/',
      '/reset-password/',
    ],
  }

  return {
    rules: [
      // Explicit rules for LLM/AI crawlers
      {
        userAgent: 'GPTBot',
        ...commonRules,
      },
      {
        userAgent: 'ChatGPT-User',
        ...commonRules,
      },
      {
        userAgent: 'CCBot',
        ...commonRules,
      },
      {
        userAgent: 'anthropic-ai',
        ...commonRules,
      },
      {
        userAgent: 'Claude-Web',
        ...commonRules,
      },
      {
        userAgent: 'PerplexityBot',
        ...commonRules,
      },
      {
        userAgent: 'Applebot-Extended',
        ...commonRules,
      },
      {
        userAgent: 'Omgilibot',
        ...commonRules,
      },
      {
        userAgent: 'FacebookBot',
        ...commonRules,
      },
      {
        userAgent: 'Google-Extended',
        ...commonRules,
      },
      // Default rule for all other crawlers
      {
        userAgent: '*',
        ...commonRules,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

