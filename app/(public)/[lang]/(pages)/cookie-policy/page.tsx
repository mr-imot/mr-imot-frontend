import { getDictionary } from '@/lib/dictionaries'
import { formatTitleWithBrand } from '@/lib/seo'
import { Metadata } from 'next'
import CookiePolicyClient from './cookie-policy-client'

// Enable SSG for all language variants
export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'bg' }, { lang: 'ru' }, { lang: 'gr' }]
}

interface CookiePolicyPageProps {
  params: Promise<{
    lang: 'en' | 'bg'
  }>
}

export async function generateMetadata({ params }: CookiePolicyPageProps): Promise<Metadata> {
  const { lang } = await params
  
  const title = formatTitleWithBrand(
    lang === 'bg' ? 'Политика за Бисквитки' : 'Cookie Policy',
    lang
  )

  return {
    title,
    description: lang === 'bg' 
      ? 'Политика за бисквитки на платформата Мистър Имот'
      : 'Cookie Policy for Mister Imot platform',
  }
}

export default async function CookiePolicyPage({ params }: CookiePolicyPageProps) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return <CookiePolicyClient dict={dict} lang={lang} />
}









