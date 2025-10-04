import 'server-only'

const dictionaries = {
  en: () => import('../../dictionaries/en.json').then((module) => module.default),
  bg: () => import('../../dictionaries/bg.json').then((module) => module.default),
}

export const getDictionary = async (locale: 'en' | 'bg') => {
  // Validate locale
  if (!locale || (locale !== 'en' && locale !== 'bg')) {
    console.error('Invalid locale:', locale)
    return dictionaries.en() // Fallback to English
  }
  
  const dictionaryLoader = dictionaries[locale]
  
  if (!dictionaryLoader || typeof dictionaryLoader !== 'function') {
    console.error('Dictionary loader not found for locale:', locale)
    return dictionaries.en() // Fallback to English
  }
  
  return dictionaryLoader()
}
