import { getDictionary } from '../dictionaries'
import LoginClient from './login-client'
import type { Metadata } from 'next'

interface LoginPageProps {
  params: Promise<{
    lang: 'en' | 'bg'
  }>
}

export async function generateMetadata({ params }: LoginPageProps): Promise<Metadata> {
  const { lang } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mrimot.com'
  const baseUrl = siteUrl.replace(/\/$/, '')
  
  const isBg = lang === 'bg'
  const brand = isBg ? 'Мистър Имот' : 'Mister Imot'
  
  const title = isBg
    ? `Вход – ${brand}`
    : `Login – ${brand}`
  
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
