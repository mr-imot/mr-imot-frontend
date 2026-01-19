import { getDictionary } from '@/lib/dictionaries'
import { formatTitleWithBrand } from '@/lib/seo'
import { Metadata } from 'next'
import TermsOfServiceClient from './terms-of-service-client'

// Enable SSG for all language variants
export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'bg' }, { lang: 'ru' }, { lang: 'gr' }]
}

interface TermsOfServicePageProps {
  params: Promise<{
    lang: 'en' | 'bg'
  }>
}

export async function generateMetadata({ params }: TermsOfServicePageProps): Promise<Metadata> {
  const { lang } = await params
  
  const title = formatTitleWithBrand(
    lang === 'bg' ? 'Условия за Ползване' : 'Terms of Service',
    lang
  )

  return {
    title,
    description: lang === 'bg' 
      ? 'Условия за ползване на платформата Мистър Имот'
      : 'Terms of Service for Mister Imot platform',
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function TermsOfServicePage({ params }: TermsOfServicePageProps) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return <TermsOfServiceClient dict={dict} lang={lang} />
}








