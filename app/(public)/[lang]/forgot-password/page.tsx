import { getDictionary } from '@/app/[lang]/dictionaries'
import ForgotPasswordClient from './forgot-password-client'
import { brandForLang, formatTitleWithBrand, getSiteUrl } from '@/lib/seo'
import type { Metadata } from 'next'

interface ForgotPasswordPageProps {
  params: Promise<{
    lang: 'en' | 'bg'
  }>
}

export async function generateMetadata({ params }: ForgotPasswordPageProps): Promise<Metadata> {
  const { lang } = await params
  const baseUrl = getSiteUrl() // Hardcoded production domain for canonical URLs
  
  const isBg = lang === 'bg'
  const brand = brandForLang(lang)
  
  const rawTitle = isBg
    ? `Забравена Парола – ${brand}`
    : `Forgot Password – ${brand}`
  const title = formatTitleWithBrand(rawTitle, lang)
  
  const description = isBg
    ? `Възстановете вашата парола за ${brand}.`
    : `Reset your password for ${brand}.`
  
  const canonicalUrl = `${baseUrl}/${lang}/forgot-password`
  
  return {
    title,
    description,
    robots: {
      index: false, // Don't index password reset pages
      follow: false,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  }
}

export default async function ForgotPasswordPage({ params }: ForgotPasswordPageProps) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return <ForgotPasswordClient dict={dict} lang={lang} />
}