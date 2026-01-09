import { getDictionary } from '@/lib/dictionaries'
import { DashboardWrapper } from './dashboard-wrapper'

interface DeveloperDashboardPageProps {
  params: Promise<{
    lang: 'en' | 'bg'
  }>
}

export default async function DeveloperDashboardPage({ params }: DeveloperDashboardPageProps) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return <DashboardWrapper dict={dict} lang={lang} />
}