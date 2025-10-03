import { getDictionary } from "./dictionaries"
import { LocalizedHomePage } from "./localized-homepage"

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: 'en' | 'bg' }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return <LocalizedHomePage dict={dict} lang={lang} />
}
