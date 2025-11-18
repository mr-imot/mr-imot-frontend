import { getDictionary } from '../dictionaries'
import RegisterClient from './register-client'
import type { Metadata } from 'next'

interface RegisterPageProps {
  params: Promise<{
    lang: 'en' | 'bg'
  }>
}

export async function generateMetadata({ params }: RegisterPageProps): Promise<Metadata> {
  const { lang } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mrimot.com'
  const baseUrl = siteUrl.replace(/\/$/, '')
  
  const isBg = lang === 'bg'
  const brand = isBg ? 'Мистър Имот' : 'Mister Imot'
  
  const title = isBg
    ? `Регистрация за Строители – ${brand}`
    : `Developer Registration – ${brand}`
  
  const description = isBg
    ? `Регистрирайте се като строител в ${brand} и започнете да публикувате вашите проекти за ново строителство. Без комисионни, директна връзка с клиенти.`
    : `Register as a developer on ${brand} and start publishing your new construction projects. No commissions, direct connection with clients.`
  
  const canonicalUrl = `${baseUrl}/${lang}/register`
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
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return <RegisterClient dict={dict} lang={lang} />
}