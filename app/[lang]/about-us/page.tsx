import { getDictionary } from '../dictionaries'
import { LocalizedAboutPage } from './localized-about-page'

interface AboutPageProps {
  params: {
    lang: 'en' | 'bg'
  }
}

export default async function AboutPage({ params }: AboutPageProps) {
  const dict = await getDictionary(params.lang)
  
  return <LocalizedAboutPage dict={dict} lang={params.lang} />
}
