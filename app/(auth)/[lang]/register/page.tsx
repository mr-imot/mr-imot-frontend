import { getDictionary } from '@/lib/dictionaries'
import RegisterClient from './register-client'
import { brandForLang, formatTitleWithBrand, getSiteUrl } from '@/lib/seo'
import type { Metadata } from 'next'
import { buildIkUrl } from '@/lib/imagekit'
import { PUBLIC_ROUTES, asLocale } from '@/lib/routes'

interface RegisterPageProps {
  params: Promise<{
    lang: 'en' | 'bg'
  }>
}

export async function generateMetadata({ params }: RegisterPageProps): Promise<Metadata> {
  const { lang } = await params
  const baseUrl = getSiteUrl() // Hardcoded production domain for canonical URLs
  const socialImage = buildIkUrl("/Logo/mister-imot-waving-hi-with-bg.png", [
    { width: 1200, height: 630, quality: 85, format: "webp", focus: "auto" },
  ])
  
  const isBg = lang === 'bg'
  const brand = brandForLang(lang)
  
  const rawTitle = isBg
    ? `Регистрация за Строители – ${brand}`
    : `Developer Registration – ${brand}`
  const title = formatTitleWithBrand(rawTitle, lang)
  
  const description = isBg
    ? `Регистрирайте се като строител в ${brand} и започнете да публикувате вашите проекти за ново строителство. Без комисиони, директна връзка с клиенти.`
    : `Register as a developer on ${brand} and start publishing your new construction projects. No commissions, direct connection with clients.`
  
  const canonicalUrl = `${baseUrl}${PUBLIC_ROUTES[asLocale(lang)].register}`
  const ogLocale = isBg ? 'bg_BG' : 'en_US'
  
  return {
    title,
    description,
    robots: {
      index: false, // Don't index registration pages
      follow: true,
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/en/register`,
        bg: `${baseUrl}/bg/register`,
        'x-default': `${baseUrl}/en/register`,
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
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [socialImage],
    },
  }
}

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return <RegisterClient dict={dict} lang={lang} />
}
