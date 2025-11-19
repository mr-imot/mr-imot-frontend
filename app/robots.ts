import { MetadataRoute } from 'next'

// Get base URL from environment variable or use localhost for development
function getBaseUrl(): string {
  let url: string
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    url = process.env.NEXT_PUBLIC_SITE_URL
  } else if (process.env.NODE_ENV === 'development') {
    url = 'http://localhost:3000'
  } else {
    url = 'https://mrimot.com'
  }
  // Remove trailing slash to prevent double slashes
  return url.replace(/\/$/, '')
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl()

  // Common rules for all crawlers (including LLMs)
  const commonRules = {
    allow: [
      '/',
      '/en/',
      '/bg/',
      '/en/listings/',
      '/bg/listings/',
      '/bg/obiavi/', // Bulgarian pretty URL for listings
      '/en/developers/',
      '/bg/developers/',
      '/bg/stroiteli/', // Bulgarian pretty URL for developers
      '/en/about-us/',
      '/bg/about-us/',
      '/bg/za-mistar-imot/', // Bulgarian pretty URL for about
      '/en/contact/',
      '/bg/contact/',
      '/bg/kontakt/', // Bulgarian pretty URL for contact
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

