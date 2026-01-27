import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { developersHref, asLocale } from "@/lib/routes"
import { cn } from "@/lib/utils"

interface DevelopersPaginationSectionProps {
  pagination: { total: number; page: number; per_page: number; total_pages: number }
  currentPage: number
  lang: 'en' | 'bg' | 'ru' | 'gr'
  dict: { developers: Record<string, string> }
  developersCount: number
}

/**
 * Server-rendered pagination links for SEO crawlability.
 * Matches the same nav structure and URL shape as the client pagination.
 */
export function DevelopersPaginationSection({
  pagination,
  currentPage,
  lang,
  dict,
  developersCount,
}: DevelopersPaginationSectionProps) {
  const locale = asLocale(lang)
  const baseHref = developersHref(locale)

  if (!pagination || pagination.total_pages <= 1) {
    return null
  }

  return (
    <div className="mt-8 space-y-4">
      <nav className="flex items-center justify-center gap-2" aria-label="Developers pagination">
        {/* Previous Button */}
        {currentPage > 1 && (
          <Link
            href={`${baseHref}?${new URLSearchParams({ page: String(currentPage - 1) }).toString()}`}
            className={cn(
              "inline-flex items-center gap-1 px-4 py-2 rounded-md border border-input bg-background text-sm font-medium",
              "hover:bg-accent hover:text-accent-foreground transition-colors"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Link>
        )}

        {/* Page Numbers */}
        {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
          let pageNum: number
          if (pagination.total_pages <= 5) {
            pageNum = i + 1
          } else if (currentPage <= 3) {
            pageNum = i + 1
          } else if (currentPage >= pagination.total_pages - 2) {
            pageNum = pagination.total_pages - 4 + i
          } else {
            pageNum = currentPage - 2 + i
          }

          const params = new URLSearchParams()
          if (pageNum > 1) {
            params.set('page', String(pageNum))
          }
          const href = `${baseHref}${params.toString() ? `?${params.toString()}` : ''}`

          return (
            <Link
              key={pageNum}
              href={href}
              className={cn(
                "inline-flex items-center justify-center min-w-[2.5rem] h-10 px-3 rounded-md border text-sm font-medium transition-colors",
                pageNum === currentPage
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
              )}
              aria-current={pageNum === currentPage ? "page" : undefined}
            >
              {pageNum}
            </Link>
          )
        })}

        {/* Next Button */}
        {currentPage < pagination.total_pages && (
          <Link
            href={`${baseHref}?${new URLSearchParams({ page: String(currentPage + 1) }).toString()}`}
            className={cn(
              "inline-flex items-center gap-1 px-4 py-2 rounded-md border border-input bg-background text-sm font-medium",
              "hover:bg-accent hover:text-accent-foreground transition-colors"
            )}
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </nav>

      {/* Pagination Info */}
      <div className="text-center text-muted-foreground">
        <p>
          {dict.developers.showingResults
            .replace('{{count}}', String(developersCount))
            .replace('{{total}}', String(pagination.total))}
        </p>
      </div>
    </div>
  )
}
