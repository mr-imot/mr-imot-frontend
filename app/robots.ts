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
      '/api/v1/projects/',
    ],
    disallow: [
      '/admin/',
      '/buyer/',
      '/developer/', // Catches both /developer/ and /en/developer/, /bg/developer/
      '/en/developer/',
      '/bg/developer/',
      '/en/login',
      '/bg/login',
      '/en/register',
      '/bg/register',
      '/en/forgot-password',
      '/bg/forgot-password',
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

