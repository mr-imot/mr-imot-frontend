import { getDictionary } from './[lang]/dictionaries'
import { headers } from 'next/headers'
import { Metadata } from 'next'
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Home, Search } from "lucide-react"
import { GoBackButton } from './[lang]/not-found-client-button'

// Generate metadata for root not-found page
export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const cookieLocale = headersList.get('cookie')
    ?.split(';')
    .find(c => c.trim().startsWith('NEXT_LOCALE='))
    ?.split('=')[1] || 'en'
  
  const lang = (cookieLocale === 'bg' || cookieLocale === 'en') ? cookieLocale : 'en'
  const dict = await getDictionary(lang)
  
  return {
    title: dict.notFound?.title || '404 - Page Not Found',
    description: dict.notFound?.description || 'The page you are looking for could not be found.',
    robots: {
      index: false,
      follow: false,
    },
    // No canonical URL for 404 pages - they should not be indexed
  }
}

// ImageKit URL helper
const getImageKitUrl = (originalUrl: string, width: number, height: number, quality: number = 90) => {
  if (!originalUrl || !originalUrl.includes('imagekit.io')) {
    return originalUrl
  }
  const transformations = [
    `w-${width}`,
    `h-${height}`,
    `q-${quality}`,
    'f-auto',
    'c-at_max',
  ].join(',')
  const separator = originalUrl.includes('?') ? '&' : '?'
  return `${originalUrl}${separator}tr=${transformations}`
}

// Root not-found page - render directly, NO redirects to prevent loops
export default async function RootNotFound() {
  // Get locale from cookie
  const headersList = await headers()
  const cookieLocale = headersList.get('cookie')
    ?.split(';')
    .find(c => c.trim().startsWith('NEXT_LOCALE='))
    ?.split('=')[1] || 'en'
  
  const lang = (cookieLocale === 'bg' || cookieLocale === 'en') ? cookieLocale : 'en'
  const dict = await getDictionary(lang)

  const href = (en: string, bg: string) => {
    return lang === 'bg' ? `/bg/${bg}` : `/${en}`
  }

  const mascotUrl = getImageKitUrl(
    "https://ik.imagekit.io/ts59gf2ul/mrimot-errors/mr-imot-404-not-found.png?updatedAt=1762882301674",
    400,
    400,
    90
  )

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-2xl mx-auto">
        <Card className="border-2">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto mb-6 flex items-center justify-center">
              <div className="relative w-48 h-48 sm:w-64 sm:h-64">
                <Image
                  src={mascotUrl}
                  alt="404 - Page Not Found"
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 640px) 192px, 256px"
                />
              </div>
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-2">
                404
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground">
                {dict.notFound?.title || "Page Not Found"}
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                {dict.notFound?.message || "The page you are looking for could not be found."}
              </p>
              <p className="text-sm text-muted-foreground">
                {dict.notFound?.suggestion || "It may have been moved, deleted, or the URL might be incorrect."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href={href('', '')}>
                  <Home className="mr-2 h-4 w-4" />
                  {dict.notFound?.goHome || "Go to Homepage"}
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href={href('listings', 'obiavi')}>
                  <Search className="mr-2 h-4 w-4" />
                  {dict.notFound?.browseListings || "Browse Listings"}
                </Link>
              </Button>
              
              <GoBackButton dict={dict} />
            </div>

            <div className="pt-6 border-t">
              <p className="text-sm text-center text-muted-foreground">
                {dict.notFound?.helpText || "Need help?"}{' '}
                <Link 
                  href={href('contact', 'kontakt')} 
                  className="text-primary hover:underline font-medium"
                >
                  {dict.notFound?.contactUs || "Contact us"}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

