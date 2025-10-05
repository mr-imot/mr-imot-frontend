import { getDictionary } from '@/app/[lang]/dictionaries'
import ForgotPasswordClient from './forgot-password-client'

interface ForgotPasswordPageProps {
  params: Promise<{
    lang: 'en' | 'bg'
  }>
}

export default async function ForgotPasswordPage({ params }: ForgotPasswordPageProps) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return <ForgotPasswordClient dict={dict} lang={lang} />
}