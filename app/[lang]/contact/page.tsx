import { getDictionary } from '../dictionaries'
import { LocalizedContactPage } from './localized-contact-page'

interface ContactPageProps {
  params: {
    lang: 'en' | 'bg'
  }
}

export default async function ContactPage({ params }: ContactPageProps) {
  const dict = await getDictionary(params.lang)
  
  return <LocalizedContactPage dict={dict} lang={params.lang} />
}
