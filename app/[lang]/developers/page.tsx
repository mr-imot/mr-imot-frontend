import { getDictionary } from '../dictionaries'
import DevelopersClient from './developers-client'

interface DevelopersPageProps {
  params: {
    lang: 'en' | 'bg'
  }
}

export default async function DevelopersPage({ params }: DevelopersPageProps) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  return <DevelopersClient dict={dict} lang={lang} />
}
