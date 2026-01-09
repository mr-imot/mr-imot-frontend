import { getDictionary } from '@/lib/dictionaries'
import { AnalyticsWrapper } from './analytics-wrapper'

interface AnalyticsPageProps {
  params: Promise<{
    lang: 'en' | 'bg'
  }>
}

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return <AnalyticsWrapper dict={dict} lang={lang} />
}
