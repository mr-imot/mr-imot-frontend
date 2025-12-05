import { notFound } from "next/navigation"
import type { Metadata } from 'next'
import DeveloperDetailClient from './developer-detail-client'
import DeveloperStructuredData from './developer-structured-data'
import { DeveloperProfile } from '@/lib/api'

interface PageProps {
  params: Promise<{
    lang: 'en' | 'bg'
    id: string
  }>
}

// Server-side function to fetch developer data
async function getDeveloperData(id: string): Promise<DeveloperProfile | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const baseUrl = apiUrl.replace(/\/$/, '')
    const response = await fetch(`${baseUrl}/api/v1/developers/${id}?per_page=12`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null // Developer never existed
      }
      throw new Error(`Failed to fetch developer: ${response.statusText}`)
    }

    const data = await response.json()
    return data as DeveloperProfile
  } catch (error) {
    console.error('Error fetching developer:', error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, id } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mrimot.com'
  const baseUrl = siteUrl.replace(/\/$/, '')
  
  const developer = await getDeveloperData(id)
  
  if (!developer) {
    return {
      title: 'Developer Not Found',
      robots: {
        index: false,
        follow: false,
      },
    }
  }
  
  const isBg = lang === 'bg'
  const brand = isBg ? 'Мистър Имот' : 'Mister Imot'
  const companyName = developer.company_name
  
  const title = isBg
    ? `${companyName} – Верифициран Строител | ${brand}`
    : `${companyName} – Verified Developer | ${brand}`
  
  const description = isBg
    ? `Открийте ${companyName} в ${brand}. Верифициран строител с ${developer.total_projects} активни проекта. Директна връзка без посредници.`
    : `Discover ${companyName} on ${brand}. Verified developer with ${developer.total_projects} active projects. Connect directly, no middlemen.`
  
  const canonicalUrl = isBg 
    ? `${baseUrl}/bg/stroiteli/${id}`
    : `${baseUrl}/developers/${id}`
  
  const ogLocale = isBg ? 'bg_BG' : 'en_US'
  // DeveloperProfile doesn't have profile_image_url, use default OG image
  const ogImage = `${baseUrl}/og-image.png`
  
  return {
    title,
    description,
    robots: {
      index: true, // Explicitly allow indexing of developer pages
      follow: true,
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/developers/${id}`,
        bg: `${baseUrl}/bg/stroiteli/${id}`,
        'x-default': `${baseUrl}/developers/${id}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: brand,
      locale: ogLocale,
      alternateLocale: ['en_US', 'bg_BG'],
      type: 'website',
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function DeveloperDetailPage({ params }: PageProps) {
  const { lang, id } = await params
  const developer = await getDeveloperData(id)
  
  if (!developer) {
    notFound()
  }
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mrimot.com'
  const baseUrl = siteUrl.replace(/\/$/, '')
  
  return (
    <>
      <DeveloperStructuredData developer={developer} lang={lang} baseUrl={baseUrl} />
      <DeveloperDetailClient developer={developer} />
    </>
  )
}
