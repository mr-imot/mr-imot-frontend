import { getDictionary } from '@/app/[lang]/dictionaries'
import BillingClient from './billing-client'

interface BillingPageProps {
  params: Promise<{
    lang: 'en' | 'bg'
  }>
}

export default async function BillingPage({ params }: BillingPageProps) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return <BillingClient dict={dict} lang={lang} />
}
