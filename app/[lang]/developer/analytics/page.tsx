import { getDictionary } from '@/app/[lang]/dictionaries'
import AnalyticsClient from './analytics-client'

interface AnalyticsPageProps {
  params: Promise<{
    lang: 'en' | 'bg'
  }>
}

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return <AnalyticsClient dict={dict} lang={lang} />
}
