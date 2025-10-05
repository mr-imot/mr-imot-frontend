import { getDictionary } from '@/app/[lang]/dictionaries'
import DeveloperDashboardClient from './dashboard-client'

interface DeveloperDashboardPageProps {
  params: Promise<{
    lang: 'en' | 'bg'
  }>
}

export default async function DeveloperDashboardPage({ params }: DeveloperDashboardPageProps) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return <DeveloperDashboardClient dict={dict} lang={lang} />
}