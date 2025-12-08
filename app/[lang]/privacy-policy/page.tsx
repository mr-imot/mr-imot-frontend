import { getDictionary } from '@/app/[lang]/dictionaries'
import { formatTitleWithBrand } from '@/lib/seo'
import { Metadata } from 'next'
import PrivacyPolicyClient from './privacy-policy-client'

interface PrivacyPolicyPageProps {
  params: Promise<{
    lang: 'en' | 'bg'
  }>
}

export async function generateMetadata({ params }: PrivacyPolicyPageProps): Promise<Metadata> {
  const { lang } = await params
  await getDictionary(lang) // preload translations if needed
  
  const title = formatTitleWithBrand(
    lang === 'bg' ? 'Политика за Поверителност' : 'Privacy Policy',
    lang
  )
  return {
    title,
    description: lang === 'bg' 
      ? 'Политика за поверителност на платформата Мистър Имот'
      : 'Privacy Policy for Mister Imot platform',
  }
}

export default async function PrivacyPolicyPage({ params }: PrivacyPolicyPageProps) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return <PrivacyPolicyClient dict={dict} lang={lang} />
}






