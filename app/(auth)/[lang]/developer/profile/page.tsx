import { getDictionary } from '@/lib/dictionaries'
import ProfileClient from './profile-client'

interface ProfilePageProps {
  params: Promise<{
    lang: 'en' | 'bg'
  }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return <ProfileClient dict={dict} lang={lang} />
}
