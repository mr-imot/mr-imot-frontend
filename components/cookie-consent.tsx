"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useLocale } from "@/lib/locale-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

type SupportedLocale = "en" | "bg" | "ru" | "gr"

type ConsentState = {
  essential: true
  analytics: boolean
  marketing: boolean
  updatedAt: string
}

type BannerCopy = {
  title: string
  summary: string
  acceptAll: string
  reject: string
  preferences: string
  save: string
  close: string
  manage: string
  essential: string
  essentialDesc: string
  analytics: string
  analyticsDesc: string
  marketing: string
  marketingDesc: string
  cookiePolicy: string
}

const STORAGE_KEY = "mi-cookie-consent-v1"
const CONSENT_COOKIE = "mi_consent"
const CONSENT_MAX_AGE = 60 * 60 * 24 * 180 // 180 days

const VercelAnalytics = dynamic(
  () => import("@vercel/analytics/react").then((mod) => mod.Analytics),
  { ssr: false, loading: () => null }
)

const copy: Record<SupportedLocale, BannerCopy> = {
  en: {
    title: "Your privacy matters",
    summary:
      "We use essential cookies to run our site. Enable analytics to help us improve. You can change your choice anytime.",
    acceptAll: "Accept all",
    reject: "Reject non-essential",
    preferences: "Preferences",
    save: "Save preferences",
    close: "Close",
    manage: "Cookie settings",
    essential: "Essential (always on)",
    essentialDesc:
      "Required for security, authentication, and basic site features.",
    analytics: "Analytics",
    analyticsDesc: "Helps us understand usage and improve experience.",
    marketing: "Marketing",
    marketingDesc: "Optional marketing or personalization tools (currently off).",
    cookiePolicy: "Read our Cookie Policy",
  },
  bg: {
    title: "Вашата поверителност е важна",
    summary:
      "Използваме основни бисквитки, за да работи сайтът. Разрешете аналитичните, за да ни помогнете да подобрим услугата. Можете да промените избора си по всяко време.",
    acceptAll: "Приеми всички",
    reject: "Отхвърли несъществените",
    preferences: "Предпочитания",
    save: "Запази предпочитанията",
    close: "Затвори",
    manage: "Настройки за бисквитки",
    essential: "Задължителни (винаги активни)",
    essentialDesc: "Необходими за сигурност, сесии и основни функции.",
    analytics: "Аналитични",
    analyticsDesc: "Помагат ни да разберем използването и да подобрим опита.",
    marketing: "Маркетинг",
    marketingDesc: "Допълнителни маркетинг или персонализация (в момента изключени).",
    cookiePolicy: "Вижте Политика за бисквитки",
  },
  ru: {
    title: "Ваша конфиденциальность важна",
    summary:
      "Мы используем необходимые cookies для работы сайта. Включите аналитические, чтобы помочь нам улучшаться. Вы можете изменить выбор в любое время.",
    acceptAll: "Принять все",
    reject: "Отклонить несущественные",
    preferences: "Настройки",
    save: "Сохранить выбор",
    close: "Закрыть",
    manage: "Настройки cookies",
    essential: "Необходимые (всегда включены)",
    essentialDesc: "Нужны для безопасности, сессий и базовых функций.",
    analytics: "Аналитические",
    analyticsDesc: "Помогают понять использование и улучшить сервис.",
    marketing: "Маркетинг",
    marketingDesc: "Дополнительные маркетинговые/персонализационные инструменты (сейчас выключены).",
    cookiePolicy: "Прочитайте политику Cookies",
  },
  gr: {
    title: "Σεβόμαστε την ιδιωτικότητά σας",
    summary:
      "Χρησιμοποιούμε βασικά cookies για να λειτουργεί ο ιστότοπος. Ενεργοποιήστε τα αναλυτικά για να μας βοηθήσετε να βελτιωθούμε. Μπορείτε να αλλάξετε την επιλογή σας οποτεδήποτε.",
    acceptAll: "Αποδοχή όλων",
    reject: "Απόρριψη μη απαραίτητων",
    preferences: "Προτιμήσεις",
    save: "Αποθήκευση προτιμήσεων",
    close: "Κλείσιμο",
    manage: "Ρυθμίσεις cookies",
    essential: "Απαραίτητα (πάντα ενεργά)",
    essentialDesc: "Απαραίτητα για ασφάλεια, συνεδρίες και βασικές λειτουργίες.",
    analytics: "Αναλυτικά",
    analyticsDesc: "Βοηθούν να κατανοήσουμε τη χρήση και να βελτιώσουμε την εμπειρία.",
    marketing: "Marketing",
    marketingDesc: "Προαιρετικά εργαλεία marketing/προσωποποίησης (προς το παρόν κλειστά).",
    cookiePolicy: "Δείτε την Πολιτική Cookies",
  },
}

function loadStoredConsent(): ConsentState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ConsentState
    if (typeof parsed.analytics === "boolean" && typeof parsed.marketing === "boolean") {
      return { ...parsed, essential: true }
    }
  } catch (error) {
    console.warn("Cookie consent parse error", error)
  }
  return null
}

function persistConsent(state: ConsentState) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(
      JSON.stringify({ analytics: state.analytics, marketing: state.marketing })
    )};path=/;max-age=${CONSENT_MAX_AGE};SameSite=Lax`
    window.dispatchEvent(new CustomEvent("mi-consent-changed", { detail: state }))
    document.documentElement.dataset.analyticsConsent = state.analytics ? "granted" : "denied"
  } catch (error) {
    console.warn("Cookie consent persist error", error)
  }
}

export default function CookieConsent() {
  const locale = useLocale() as SupportedLocale
  const t = useMemo(() => copy[locale] ?? copy.en, [locale])
  const [isReady, setIsReady] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [consent, setConsent] = useState<ConsentState | null>(null)
  const [pendingPreferences, setPendingPreferences] = useState({
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    const stored = loadStoredConsent()
    if (stored) {
      setConsent(stored)
      setPendingPreferences({ analytics: stored.analytics, marketing: stored.marketing })
    } else {
      setIsOpen(true)
    }
    setIsReady(true)
  }, [])

  // Separate effect for event listeners
  useEffect(() => {
    if (typeof window === "undefined" || !isReady) return

    const checkHash = () => {
      if (window.location.hash === "#cookie-settings") {
        setIsOpen(true)
        setShowPreferences(true)
        // Clean up the hash from URL
        window.history.replaceState(null, "", window.location.pathname + window.location.search)
      }
    }
    
    // Listen for custom event to open cookie settings (from footer link)
    const handleOpenCookieSettings = () => {
      setIsOpen(true)
      setShowPreferences(true)
    }
    
    checkHash() // Check on mount
    window.addEventListener("hashchange", checkHash)
    window.addEventListener("mi-open-cookie-settings", handleOpenCookieSettings)
    
    return () => {
      window.removeEventListener("hashchange", checkHash)
      window.removeEventListener("mi-open-cookie-settings", handleOpenCookieSettings)
    }
  }, [isReady])

  useEffect(() => {
    if (consent) {
      persistConsent(consent)
      setShowPreferences(false)
    }
  }, [consent])

  if (!isReady) return null

  const shouldShowBanner = isOpen || !consent

  const applyConsent = (preferences: { analytics: boolean; marketing: boolean }) => {
    const nextState: ConsentState = {
      essential: true,
      analytics: preferences.analytics,
      marketing: preferences.marketing,
      updatedAt: new Date().toISOString(),
    }
    setConsent(nextState)
    setPendingPreferences(preferences)
    setIsOpen(false)
  }

  const handleAcceptAll = () => applyConsent({ analytics: true, marketing: true })
  const handleReject = () => applyConsent({ analytics: false, marketing: false })
  const handleSave = () => applyConsent(pendingPreferences)

  return (
    <>
      {consent?.analytics ? <VercelAnalytics /> : null}

      {shouldShowBanner ? (
        <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-4xl -translate-x-1/2 md:w-auto md:min-w-[640px]">
          <div className="rounded-2xl border border-border bg-white/95 shadow-card backdrop-blur">
            <div className="flex items-start gap-3 p-4 md:p-6">
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-charcoal-600">{t.title}</p>
                    <p className="mt-1 text-sm text-charcoal-400">{t.summary}</p>
                  </div>
                  {consent ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false)
                        setShowPreferences(false)
                      }}
                      aria-label={t.close}
                      className="rounded-md p-1 text-charcoal-400 hover:bg-muted hover:text-charcoal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      ✕
                    </button>
                  ) : null}
                </div>

                {showPreferences ? (
                  <div className="mt-3 grid gap-3">
                    <PreferenceRow
                      label={t.essential}
                      description={t.essentialDesc}
                      disabled
                      checked
                      onCheckedChange={() => {}}
                    />
                    <PreferenceRow
                      label={t.analytics}
                      description={t.analyticsDesc}
                      checked={pendingPreferences.analytics}
                      onCheckedChange={(value) =>
                        setPendingPreferences((prev) => ({ ...prev, analytics: Boolean(value) }))
                      }
                    />
                    <PreferenceRow
                      label={t.marketing}
                      description={t.marketingDesc}
                      checked={pendingPreferences.marketing}
                      onCheckedChange={(value) =>
                        setPendingPreferences((prev) => ({ ...prev, marketing: Boolean(value) }))
                      }
                    />
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center gap-3 justify-between">
                  <Link
                    href={`/${locale}/cookie-policy`}
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {t.cookiePolicy}
                  </Link>
                  {showPreferences ? (
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" onClick={() => setShowPreferences(false)}>
                        {t.close}
                      </Button>
                      <Button onClick={handleSave}>{t.save}</Button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" onClick={handleReject}>
                        {t.reject}
                      </Button>
                      <Button variant="secondary" onClick={() => setShowPreferences(true)}>
                        {t.preferences}
                      </Button>
                      <Button onClick={handleAcceptAll}>{t.acceptAll}</Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

type PreferenceRowProps = {
  label: string
  description: string
  checked: boolean
  disabled?: boolean
  onCheckedChange: (value: boolean) => void
}

function PreferenceRow({
  label,
  description,
  checked,
  disabled,
  onCheckedChange,
}: PreferenceRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-background/60 px-3 py-2">
      <div>
        <p className="text-sm font-medium text-charcoal-600">{label}</p>
        <p className="text-xs text-charcoal-400">{description}</p>
      </div>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} />
    </div>
  )
}
