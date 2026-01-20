import { getSiteUrl } from '@/lib/seo'
import { type SupportedLocale } from '@/lib/routes'

// Sitemap-specific fetch timeout (10 seconds - enough for API but prevents hanging)
export const SITEMAP_FETCH_TIMEOUT = 10000 // 10 seconds
export const SITEMAP_RETRY_DELAY = 300 // 300ms delay between retries

// Helper to check if error is a network/timeout error that should be retried
function isRetryableError(error: any): boolean {
  if (!error) return false
  
  // Check for ETIMEDOUT, ECONNRESET, or other network errors
  const errorMessage = error.message?.toLowerCase() || ''
  const errorCode = error.code?.toLowerCase() || error.cause?.code?.toLowerCase() || ''
  
  return (
    errorMessage.includes('timeout') ||
    errorMessage.includes('fetch failed') ||
    errorMessage.includes('network') ||
    errorCode === 'etimedout' ||
    errorCode === 'econnreset' ||
    errorCode === 'econnrefused' ||
    error.name === 'TypeError' && errorMessage.includes('fetch')
  )
}

// Fetch wrapper with timeout and retry for sitemap API calls
export async function fetchWithTimeoutAndRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  url?: string
): Promise<T> {
  let lastError: any
  
  // Try up to 2 times (initial + 1 retry)
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      // Race the operation against a timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Operation timeout after ${SITEMAP_FETCH_TIMEOUT}ms`))
        }, SITEMAP_FETCH_TIMEOUT)
      })
      
      const result = await Promise.race([operation(), timeoutPromise])
      return result
    } catch (error: any) {
      lastError = error
      
      // Log with context
      const errorContext = {
        operation: operationName,
        attempt: attempt + 1,
        url: url || 'unknown',
        error: error.message || String(error),
        code: error.code || error.cause?.code,
        syscall: error.syscall || error.cause?.syscall,
      }
      
      if (attempt === 0 && isRetryableError(error)) {
        // Log retry attempt
        console.warn(`[sitemap] ${operationName} failed, retrying...`, errorContext)
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, SITEMAP_RETRY_DELAY))
        continue
      } else {
        // Final failure or non-retryable error
        console.error(`[sitemap] ${operationName} failed after ${attempt + 1} attempt(s)`, errorContext)
        throw error
      }
    }
  }
  
  throw lastError
}

// Get base URL - hardcoded production domain for SEO
// See: https://www.reddit.com/r/nextjs/s/otIdK3NiqK
export function getBaseUrl(): string {
  return getSiteUrl()
}

// Helper to build hreflang alternates for any route type
// Maps internal locale codes (en, bg, ru, gr) to hreflang codes (en, bg, ru, el)
export function buildAlternates(
  baseUrl: string,
  routeBuilder: (lang: SupportedLocale) => string
): { languages: Record<string, string> } {
  // Normalize: if English route is '/', use baseUrl (no trailing slash) to avoid https://mrimot.com/
  const enRoute = routeBuilder('en')
  const enUrl = enRoute === '/' ? baseUrl : `${baseUrl}${enRoute}`
  
  return {
    languages: {
      en: enUrl,
      bg: `${baseUrl}${routeBuilder('bg')}`,
      ru: `${baseUrl}${routeBuilder('ru')}`,
      el: `${baseUrl}${routeBuilder('gr')}`, // Greek URL segment is 'gr' but hreflang is 'el'
      'x-default': enUrl, // Use same normalized URL
    },
  }
}
