import { getDictionary } from '@/lib/dictionaries'
import EditPropertyClient from './edit-client'

interface EditPropertyPageProps {
  params: Promise<{
    lang: 'en' | 'bg'
    id: string
  }>
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { lang, id } = await params
  const dict = await getDictionary(lang)

  return <EditPropertyClient dict={dict} lang={lang} params={Promise.resolve({ id })} />
}
