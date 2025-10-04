import { getDictionary } from '../dictionaries'
import RegisterClient from './register-client'

interface RegisterPageProps {
  params: Promise<{
    lang: 'en' | 'bg'
  }>
}

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return <RegisterClient dict={dict} lang={lang} />
}