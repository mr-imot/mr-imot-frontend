import { getDictionary } from '@/lib/dictionaries'
import PropertiesClient from './properties-client'

interface PropertiesPageProps {
  params: Promise<{
    lang: 'en' | 'bg'
  }>
}

export default async function PropertiesPage({ params }: PropertiesPageProps) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return <PropertiesClient dict={dict} lang={lang} />
}
