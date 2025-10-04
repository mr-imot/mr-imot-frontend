import { getDictionary } from '../dictionaries'
import ContactClient from './contact-client'

interface ContactPageProps {
  params: Promise<{
    lang: 'en' | 'bg'
  }>
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  
  return <ContactClient dict={dict} lang={lang} />
}
