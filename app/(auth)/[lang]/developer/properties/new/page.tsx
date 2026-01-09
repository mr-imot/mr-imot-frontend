import { getDictionary } from '@/lib/dictionaries'
import NewPropertyClient from './new-client'

interface NewPropertyPageProps {
  params: Promise<{
    lang: 'en' | 'bg'
  }>
}

export default async function NewPropertyPage({ params }: NewPropertyPageProps) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return <NewPropertyClient dict={dict} lang={lang} />
}
