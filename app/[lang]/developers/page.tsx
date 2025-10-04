import { getDictionary } from '../dictionaries'
import { LocalizedDevelopersPage } from './localized-developers-page'

interface DevelopersPageProps {
  params: {
    lang: 'en' | 'bg'
  }
}

export default async function DevelopersPage({ params }: DevelopersPageProps) {
  const dict = await getDictionary(params.lang)
  
  return <LocalizedDevelopersPage dict={dict} lang={params.lang} />
}
