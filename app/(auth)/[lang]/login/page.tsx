import { getDictionary } from '@/lib/dictionaries'
import LoginClient from './login-client'
import { brandForLang, formatTitleWithBrand, getSiteUrl } from '@/lib/seo'
import type { Metadata } from 'next'

interface LoginPageProps {
  params: Promise<{
    lang: 'en' | 'bg'
  }>
}

export async function generateMetadata({ params }: LoginPageProps): Promise<Metadata> {
  const { lang } = await params
  const baseUrl = getSiteUrl() // Hardcoded production domain for canonical URLs
  
  const isBg = lang === 'bg'
  const brand = brandForLang(lang)
  
  const rawTitle = isBg
    ? `Вход – ${brand}`
    : `Login – ${brand}`
  const title = formatTitleWithBrand(rawTitle, lang)
  
  const description = isBg
    ? `Влезте в профила си в ${brand}.`
    : `Sign in to your ${brand} account.`
  
  const canonicalUrl = `${baseUrl}/${lang}/login`
  
  return {
    title,
    description,
    robots: {
      index: false, // Don't index login pages
      follow: false,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  }
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return <LoginClient dict={dict} lang={lang} />
}
