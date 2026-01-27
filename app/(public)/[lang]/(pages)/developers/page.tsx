import { getDictionary } from '@/lib/dictionaries'
import DevelopersClient from './developers-client'
import { DevelopersGridSection } from './developers-grid-section'
import { DevelopersPaginationSection } from './developers-pagination-section'
import { brandForLang, formatTitleWithBrand, getSiteUrl } from '@/lib/seo'
import type { Metadata } from 'next'
import WebPageSchema from '@/components/seo/webpage-schema'
import { buildIkUrl } from '@/lib/imagekit'
import type { DevelopersListResponse } from '@/lib/api'
import { Building } from 'lucide-react'

// Enable SSG for all language variants
export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'bg' }, { lang: 'ru' }, { lang: 'gr' }]
}

interface DevelopersPageProps {
  params: Promise<{
    lang: 'en' | 'bg' | 'ru' | 'gr'
  }>
  searchParams?: Promise<{ page?: string }>
}

/** Server-side fetch for developers list (SEO crawlability). */
async function getDevelopersServer(page: number, perPage: number): Promise<DevelopersListResponse | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const baseUrl = apiUrl.replace(/\/$/, '')
    const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
    const response = await fetch(`${baseUrl}/api/v1/developers?${params.toString()}`, {
      next: { revalidate: 300 },
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) return null
    return (await response.json()) as DevelopersListResponse
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: DevelopersPageProps): Promise<Metadata> {
  const { lang } = await params
  const baseUrl = getSiteUrl() // Hardcoded production domain for canonical URLs
  
  const isBg = lang === 'bg'
  const isRu = lang === 'ru'
  const brand = brandForLang(lang)
  const socialImage = buildIkUrl("/Logo/mister-imot-waving-hi-with-bg.png", [
    { width: 1200, height: 630, quality: 85, format: "webp", focus: "auto" },
  ])
  
  const rawTitle = isBg
    ? `Верифицирани Строители – ${brand} | Платформа за Ново Строителство`
    : isRu
      ? `Застройщики – ${brand} | Новостройки в Болгарии`
      : `Verified Developers – ${brand} | New Construction Platform`
  const title = formatTitleWithBrand(rawTitle, lang)
  
  const description = isBg
    ? `Открийте верифицирани строители в България. Директна връзка с компании за ново строителство, без посредници. Прегледайте портфолиото и проектите на всеки строител.`
    : isRu
      ? `Найдите проверенных застройщиков в Болгарии. Общайтесь напрямую, без посредников и комиссий. Смотрите портфолио и проекты каждого застройщика.`
      : `Discover verified developers in Bulgaria. Connect directly with new construction companies, no middlemen. Browse each developer's portfolio and projects.`
  
  // Use pretty URL for Bulgarian and Russian, canonical for English
  const canonicalUrl = isBg 
    ? `${baseUrl}/bg/stroiteli`
    : isRu
      ? `${baseUrl}/ru/zastroyshchiki`
      : `${baseUrl}/developers`
  
  const ogLocale = isBg ? 'bg_BG' : isRu ? 'ru_RU' : 'en_US'
  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    robots: {
      index: true, // Explicitly allow indexing of developers page
      follow: true,
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/developers`,
        bg: `${baseUrl}/bg/stroiteli`,
        ru: `${baseUrl}/ru/zastroyshchiki`,
        el: `${baseUrl}/gr/kataskeuastes`,
        'x-default': `${baseUrl}/developers`,
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
            ? 'Мистър Имот – Верифицирани строители'
            : 'Mister Imot – Verified developers',
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

export default async function DevelopersPage({ params, searchParams }: DevelopersPageProps) {
  const { lang } = await params
  const sp = await (searchParams ?? Promise.resolve({})) as { page?: string }
  const currentPage = Math.max(1, Number(sp?.page) || 1)
  const dict = await getDictionary(lang)
  const baseUrl = getSiteUrl() // Hardcoded production domain for canonical URLs
  const isBg = lang === 'bg'
  const isRu = lang === 'ru'
  const canonicalUrl = isBg 
    ? `${baseUrl}/bg/stroiteli`
    : isRu
      ? `${baseUrl}/ru/zastroyshchiki`
      : `${baseUrl}/developers`
  const brand = brandForLang(lang)
  const rawTitle = isBg
    ? `Верифицирани Строители – ${brand} | Платформа за Ново Строителство`
    : isRu
      ? `Застройщики – ${brand} | Новостройки в Болгарии`
      : `Verified Developers – ${brand} | New Construction Platform`
  const title = formatTitleWithBrand(rawTitle, lang)
  const description = isBg
    ? `Открийте верифицирани строители в България. Директна връзка с компании за ново строителство, без посредници. Прегледайте портфолиото и проектите на всеки строител.`
    : isRu
      ? `Найдите проверенных застройщиков в Болгарии. Общайтесь напрямую, без посредников и комиссий. Смотрите портфолио и проекты каждого застройщика.`
      : `Discover verified developers in Bulgaria. Connect directly with new construction companies, no middlemen. Browse each developer's portfolio and projects.`
  const socialImage = buildIkUrl("/Logo/mister-imot-waving-hi-with-bg.png", [
    { width: 1200, height: 630, quality: 85, format: "webp", focus: "auto" },
  ])

  const data = await getDevelopersServer(currentPage, 20)
  const developers = data?.developers ?? []
  const pagination = data
    ? { total: data.total, page: data.page, per_page: data.per_page, total_pages: data.total_pages }
    : { total: 0, page: 1, per_page: 20, total_pages: 0 }

  return (
    <>
      <WebPageSchema
        name={title}
        description={description}
        url={canonicalUrl}
        lang={lang}
        baseUrl={baseUrl}
        primaryImageOfPage={socialImage}
      />
      <DevelopersClient
        dict={dict}
        lang={lang}
        initialData={{ developers, pagination }}
      >
        {developers.length > 0 ? (
          <>
            <DevelopersGridSection developers={developers} dict={dict} lang={lang} />
            {pagination.total_pages > 1 && (
              <DevelopersPaginationSection
                pagination={pagination}
                currentPage={currentPage}
                lang={lang}
                dict={dict}
                developersCount={developers.length}
              />
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Building className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">{dict.developers?.noDevelopersFound ?? 'No Developers Found'}</h3>
            <p className="text-muted-foreground">{dict.developers?.noDevelopersMessage ?? ''}</p>
          </div>
        )}
      </DevelopersClient>
    </>
  )
}
