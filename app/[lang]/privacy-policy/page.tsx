import { getDictionary } from '@/app/[lang]/dictionaries'
import { Metadata } from 'next'
import PrivacyPolicyClient from './privacy-policy-client'

interface PrivacyPolicyPageProps {
  params: Promise<{
    lang: 'en' | 'bg'
  }>
}

export async function generateMetadata({ params }: PrivacyPolicyPageProps): Promise<Metadata> {
  const { lang } = await params
  const dict = await getDictionary(lang)
  
  return {
    title: lang === 'bg' ? 'Политика за Поверителност - Мистър Имот' : 'Privacy Policy - Mister Imot',
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





