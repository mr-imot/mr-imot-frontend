import { getDictionary } from '../dictionaries'
import AboutClient from './about-client'

interface AboutPageProps {
  params: Promise<{
    lang: 'en' | 'bg'
  }>
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return <AboutClient dict={dict} lang={lang} />
}
