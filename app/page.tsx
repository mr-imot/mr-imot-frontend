import { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL 
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/en`
      : 'http://localhost:3000/en',
    languages: {
      en: process.env.NEXT_PUBLIC_SITE_URL 
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/en`
        : 'http://localhost:3000/en',
      bg: process.env.NEXT_PUBLIC_SITE_URL 
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/bg`
        : 'http://localhost:3000/bg',
      'x-default': process.env.NEXT_PUBLIC_SITE_URL 
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/en`
        : 'http://localhost:3000/en',
    },
  },
}

export default function RootPage() {
  // Middleware will handle the redirect to the appropriate locale
  return null
}