import 'server-only'

const dictionaries = {
  en: () => import('../../dictionaries/en.json').then((module) => module.default),
  bg: () => import('../../dictionaries/bg.json').then((module) => module.default),
  ru: () => import('../../dictionaries/ru.json').then((module) => module.default),
}

type SupportedLocale = 'en' | 'bg' | 'ru'

export const getDictionary = async (locale: SupportedLocale) => {
  // Validate locale - silently fallback for invalid locales (e.g., static file requests)
  if (!locale || (locale !== 'en' && locale !== 'bg' && locale !== 'ru')) {
    // Only log in development to avoid noise in production logs
    if (process.env.NODE_ENV === 'development') {
      console.warn('Invalid locale detected, falling back to English:', locale)
    }
    return dictionaries.en() // Fallback to English
  }
  
  const dictionaryLoader = dictionaries[locale]
  
  if (!dictionaryLoader || typeof dictionaryLoader !== 'function') {
    console.error('Dictionary loader not found for locale:', locale)
    return dictionaries.en() // Fallback to English
  }
  
  return dictionaryLoader()
}
