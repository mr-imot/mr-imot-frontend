import { LocaleProvider } from "@/lib/locale-context"
import { getDictionary, type SupportedLocale } from "@/lib/dictionaries"
import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"
import { FeedbackButton } from "@/components/feedback-button"
import CookieConsent from "@/components/cookie-consent"
import ViewportLock from "@/components/ViewportLock"

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'bg' }, { lang: 'ru' }, { lang: 'gr' }]
}

interface AuthLangLayoutProps {
  children: React.ReactNode
  params: Promise<{ lang: SupportedLocale }>
}

export default async function AuthLangLayout({
  children,
  params,
}: AuthLangLayoutProps) {
  const { lang } = await params
  const translations = await getDictionary(lang)
  
  return (
    <LocaleProvider locale={lang}>
      <div className="relative flex min-h-screen flex-col">
        <SiteHeader translations={translations.navigation} />
        <ViewportLock />
        <main className="flex-1">{children}</main>
        <Footer lang={lang} translations={{ footer: translations.footer, navigation: translations.navigation }} />
      </div>
      <FeedbackButton translations={translations.feedback} />
      <CookieConsent />
    </LocaleProvider>
  )
}
