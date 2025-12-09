import { notFound } from "next/navigation"
import type { Metadata } from 'next'
import DeveloperDetailClient from './developer-detail-client'
import DeveloperStructuredData from './developer-structured-data'
import { DeveloperProfile } from '@/lib/api'
import { brandForLang, formatTitleWithBrand } from '@/lib/seo'

interface PageProps {
  params: Promise<{
    lang: 'en' | 'bg' | 'ru'
    slug: string
  }>
}

// Server-side function to fetch developer data
async function getDeveloperData(identifier: string): Promise<DeveloperProfile | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const baseUrl = apiUrl.replace(/\/$/, '')
    const encodedIdentifier = encodeURIComponent(identifier)
    const response = await fetch(`${baseUrl}/api/v1/developers/${encodedIdentifier}?per_page=12`, {
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
  const { lang, slug } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mrimot.com'
  const baseUrl = siteUrl.replace(/\/$/, '')
  const socialImage = 'https://ik.imagekit.io/ts59gf2ul/Logo/mister-imot-waving-hi-with-bg.png?tr=w-1200,h-630,cm-pad_resize,bg-FFFFFF,fo-auto,q-85,f-auto&v=20241205'
  
  const developer = await getDeveloperData(slug)
  
  if (!developer) {
    return {
      title: formatTitleWithBrand('Developer Not Found', lang),
      robots: {
        index: false,
        follow: false,
      },
    }
  }
  
  const isBg = lang === 'bg'
  const isRu = lang === 'ru'
  const brand = brandForLang(lang)
  const companyName = developer.company_name
  const developerPath = developer.slug || slug
  const activeProjects = developer.projects_pagination?.total ?? developer.active_projects ?? developer.total_projects ?? developer.project_count ?? 0
  
  const rawTitle = isBg
    ? `${companyName} – Верифициран Строител | ${brand}`
    : isRu
      ? `${companyName} – Проверенный застройщик | ${brand}`
      : `${companyName} – Verified Developer | ${brand}`
  const title = formatTitleWithBrand(rawTitle, lang)
  
  const description = isBg
    ? `Открийте ${companyName} в ${brand}. Верифициран строител с ${activeProjects} активни проекта. Директна връзка без посредници.`
    : isRu
      ? `Узнайте о ${companyName} на ${brand}. Проверенный застройщик с ${activeProjects} активными проектами. Прямой контакт без посредников.`
      : `Discover ${companyName} on ${brand}. Verified developer with ${activeProjects} active projects. Connect directly, no middlemen.`
  
  const canonicalUrl = isBg 
    ? `${baseUrl}/bg/stroiteli/${developerPath}`
    : isRu
      ? `${baseUrl}/ru/zastroyshchiki/${developerPath}`
      : `${baseUrl}/developers/${developerPath}`
  
  const ogLocale = isBg ? 'bg_BG' : isRu ? 'ru_RU' : 'en_US'
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
        en: `${baseUrl}/developers/${developerPath}`,
        bg: `${baseUrl}/bg/stroiteli/${developerPath}`,
        ru: `${baseUrl}/ru/zastroyshchiki/${developerPath}`,
        'x-default': `${baseUrl}/developers/${developerPath}`,
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
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: isBg
            ? `${companyName} – Верифициран строител`
            : `${companyName} – Verified developer`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [socialImage],
    },
  }
}

export default async function DeveloperDetailPage({ params }: PageProps) {
  const { lang, slug } = await params
  const developer = await getDeveloperData(slug)
  
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
