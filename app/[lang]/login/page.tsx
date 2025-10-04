import { getDictionary } from '../dictionaries'
import LoginClient from './login-client'

interface LoginPageProps {
  params: Promise<{
    lang: 'en' | 'bg'
  }>
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return <LoginClient dict={dict} lang={lang} />
}
