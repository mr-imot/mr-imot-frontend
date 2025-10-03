import 'server-only'

const dictionaries = {
  en: () => import('../../dictionaries/en.json').then((module) => module.default),
  bg: () => import('../../dictionaries/bg.json').then((module) => module.default),
}

export const getDictionary = async (locale: 'en' | 'bg') =>
  dictionaries[locale]()
