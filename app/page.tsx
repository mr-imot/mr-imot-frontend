import { redirect } from 'next/navigation'
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
  // This page should never actually render - middleware handles root path
  // If we reach here, redirect to default locale
  // Middleware will intercept this redirect and handle IP-based detection
  redirect('/en')
}