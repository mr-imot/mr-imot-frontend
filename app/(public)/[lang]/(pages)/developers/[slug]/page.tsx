import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from 'next'
import DeveloperDetailClient from './developer-detail-client'
import DeveloperStructuredData from './developer-structured-data'
import { DeveloperListingsGridServer } from './developer-listings-grid-server'
import { DeveloperProfile } from '@/lib/api'
import { brandForLang, formatTitleWithBrand, getSiteUrl } from '@/lib/seo'
import { buildIkUrl } from '@/lib/imagekit'
import { getDictionary } from '@/lib/dictionaries'
import { cityListingsHref } from '@/lib/routes'
import { getCityInfo } from '@/lib/city-registry'

interface PageProps {
  params: Promise<{
    lang: 'en' | 'bg' | 'ru' | 'gr'
    slug: string
  }>
}

// Server-side function to fetch developer data.
// lang is included in the URL so the fetch cache key varies by locale (avoids EN-cached
// response being reused for /bg/stroiteli/... and causing "redirect" / language mismatch).
async function getDeveloperData(identifier: string, lang: string): Promise<DeveloperProfile | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const baseUrl = apiUrl.replace(/\/$/, '')
    const encodedIdentifier = encodeURIComponent(identifier)
    const response = await fetch(`${baseUrl}/api/v1/developers/${encodedIdentifier}?per_page=12&lang=${encodeURIComponent(lang)}`, {
      cache: 'no-store', // Always fresh so projects count is correct; locale in URL keeps cache key per-lang if caching is re-enabled
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
  const baseUrl = getSiteUrl() // Hardcoded production domain for canonical URLs
  const socialImage = buildIkUrl("/Logo/mister-imot-waving-hi-with-bg.png", [
    { width: 1200, height: 630, quality: 85, format: "webp", focus: "auto" },
  ])
  
  const developer = await getDeveloperData(slug, lang)
  
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
        el: `${baseUrl}/gr/kataskeuastes/${developerPath}`,
        'x-default': `${baseUrl}/developers/${developerPath}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: brand,
      locale: ogLocale,
      alternateLocale: ['en_US', 'bg_BG', 'ru_RU', 'el_GR'],
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
  const developer = await getDeveloperData(slug, lang)
  
  if (!developer) {
    notFound()
  }
  
  const baseUrl = getSiteUrl() // Hardcoded production domain for canonical URLs
  const dict = await getDictionary(lang)
  
  const projects = developer.projects ?? []
  const listingsMarkup = projects.length > 0 ? (
    <DeveloperListingsGridServer
      projects={projects}
      lang={lang}
      dict={{
        listingDetail: dict.listingDetail,
        developersDetail: dict.developersDetail,
      }}
    />
  ) : undefined

  const topCityKeys = ['sofia-bg', 'plovdiv-bg', 'varna-bg'] as const
  const cityInfos = await Promise.all(topCityKeys.map((key) => getCityInfo(key)))
  const exploreByCityLabel = lang === 'bg' ? 'Обяви по град' : lang === 'ru' ? 'Объявления по городам' : lang === 'gr' ? 'Αγγελίες ανά πόλη' : 'Listings by city'

  return (
    <>
      <DeveloperStructuredData developer={developer} lang={lang} baseUrl={baseUrl} />
      <nav className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-2 py-4 text-sm" aria-label={exploreByCityLabel}>
        <span className="font-medium text-muted-foreground">{exploreByCityLabel}:</span>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {topCityKeys.map((cityKey, i) => {
            const info = cityInfos[i]
            const label = info?.displayNames[lang as keyof typeof info.displayNames] ?? cityKey
            const isLast = i === topCityKeys.length - 1
            return (
              <span key={cityKey} className="inline-flex items-center gap-x-2">
                <Link href={cityListingsHref(lang, cityKey)} className="font-medium text-primary hover:underline">
                  {label}
                </Link>
                {!isLast && <span aria-hidden className="text-muted-foreground/60">|</span>}
              </span>
            )
          })}
        </span>
      </nav>
      <DeveloperDetailClient
        developer={developer}
        lang={lang}
        translations={{
          developersDetail: dict.developersDetail,
          developers: dict.developers,
          listingDetail: dict.listingDetail,
        }}
        listingsMarkup={listingsMarkup}
      />
    </>
  )
}
