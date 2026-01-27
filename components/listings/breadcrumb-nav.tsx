import Link from "next/link"
import { homeHref, listingsHref, cityListingsHref } from "@/lib/routes"
import type { Project } from "@/lib/api"
import type { SupportedLocale } from "@/lib/routes"

const breadcrumbTranslations: Record<string, { home: string; listings: string }> = {
  en: { home: 'Home', listings: 'Listings' },
  bg: { home: 'Начало', listings: 'Обяви' },
  ru: { home: 'Главная', listings: 'Объявления' },
  gr: { home: 'Αρχική', listings: 'Αγγελίες' },
}

interface BreadcrumbNavProps {
  lang: SupportedLocale
  project: Project
  cityLabel?: string | null
}

/**
 * Server-rendered breadcrumb for listing detail pages (SEO internal links).
 * Home → Listings → City (if city_key) → Current listing (text only).
 */
export function BreadcrumbNav({ lang, project, cityLabel }: BreadcrumbNavProps) {
  const t = breadcrumbTranslations[lang] ?? breadcrumbTranslations.en
  const currentTitle = project.title ?? project.name ?? 'Listing'

  return (
    <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 py-3 pb-2">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <li>
          <Link href={homeHref(lang)} className="hover:text-foreground hover:underline transition-colors">
            {t.home}
          </Link>
        </li>
        <li aria-hidden className="select-none">/</li>
        <li>
          <Link href={listingsHref(lang)} className="hover:text-foreground hover:underline transition-colors">
            {t.listings}
          </Link>
        </li>
        {project.city_key && (
          <>
            <li aria-hidden className="select-none">/</li>
            <li>
              <Link
                href={cityListingsHref(lang, project.city_key)}
                className="hover:text-foreground hover:underline transition-colors"
              >
                {cityLabel ?? project.city ?? 'City'}
              </Link>
            </li>
          </>
        )}
        <li aria-hidden className="select-none">/</li>
        <li className="text-foreground font-medium truncate max-w-[12rem] sm:max-w-none" aria-current="page">
          {currentTitle}
        </li>
      </ol>
    </nav>
  )
}
