import { getDictionary } from '../dictionaries'
import DevelopersClient from './developers-client'

interface DevelopersPageProps {
  params: {
    lang: 'en' | 'bg'
  }
}

export default async function DevelopersPage({ params }: DevelopersPageProps) {
  const dict = await getDictionary(params.lang)
  return <DevelopersClient dict={dict} lang={params.lang} />
}
