import { getDictionary } from "../dictionaries"
import { LocalizedListingsPage } from "./localized-listings-page"

export default async function ListingsPage({
  params,
}: {
  params: Promise<{ lang: 'en' | 'bg' }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return <LocalizedListingsPage dict={dict} lang={lang} />
}