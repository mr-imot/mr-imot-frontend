"use client"

import { createContext, useContext, ReactNode } from 'react'

interface LocaleContextType {
  locale: 'en' | 'bg'
  translations: any
}

const LocaleContext = createContext<LocaleContextType | null>(null)

interface LocaleProviderProps {
  locale: 'en' | 'bg'
  translations: any
  children: ReactNode
}

export function LocaleProvider({ locale, translations, children }: LocaleProviderProps) {
  return (
    <LocaleContext.Provider value={{ locale, translations }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context.locale
}

// Helper hook for components that need translations
export function useTranslations(namespace?: string) {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useTranslations must be used within a LocaleProvider')
  }
  
  if (namespace) {
    return context.translations[namespace] || {}
  }
  
  return context.translations
}
