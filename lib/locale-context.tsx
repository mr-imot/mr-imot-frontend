"use client"

import { createContext, useContext, ReactNode } from 'react'

export type SupportedLocale = 'en' | 'bg' | 'ru' | 'gr'

interface LocaleContextType {
  locale: SupportedLocale
}

const LocaleContext = createContext<LocaleContextType | null>(null)

interface LocaleProviderProps {
  locale: SupportedLocale
  children: ReactNode
}

export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  return (
    <LocaleContext.Provider value={{ locale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale(): SupportedLocale {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context.locale
}
