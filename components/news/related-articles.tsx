import Link from "next/link"
import { getAllPostsMeta } from "@/lib/news"
import { newsArticleHref, newsHref } from "@/lib/routes"
import type { SupportedLocale } from "@/lib/routes"
import type { BlogLang, BlogPostMeta } from "@/lib/news"

const MAX_RELATED = 6

type CurrentMeta = Pick<BlogPostMeta, "tags" | "category" | "date">

interface RelatedArticlesProps {
  lang: SupportedLocale
  currentSlug: string
  currentMeta: CurrentMeta
  dict?: { news?: { relatedArticles?: string; viewAllNews?: string } }
}

export async function RelatedArticles({
  lang,
  currentSlug,
  currentMeta,
  dict,
}: RelatedArticlesProps) {
  const blogLang = lang as BlogLang
  const posts = await getAllPostsMeta(blogLang)
  const others = (posts ?? []).filter((p) => p.slug !== currentSlug)

  if (others.length === 0) return null

  const currentTags = currentMeta.tags ?? []
  const currentCategory = currentMeta.category ?? null

  const ranked =
    currentTags.length > 0
      ? [...others].sort((a, b) => {
          const aTags = a.tags ?? []
          const bTags = b.tags ?? []
          const aCount = aTags.filter((t) => currentTags.includes(t)).length
          const bCount = bTags.filter((t) => currentTags.includes(t)).length
          if (bCount !== aCount) return bCount - aCount
          const aTime = a.date ? new Date(a.date).getTime() : 0
          const bTime = b.date ? new Date(b.date).getTime() : 0
          return bTime - aTime
        })
      : currentCategory
        ? [...others].sort((a, b) => {
            const aMatch = (a.category ?? null) === currentCategory ? 1 : 0
            const bMatch = (b.category ?? null) === currentCategory ? 1 : 0
            if (bMatch !== aMatch) return bMatch - aMatch
            const aTime = a.date ? new Date(a.date).getTime() : 0
            const bTime = b.date ? new Date(b.date).getTime() : 0
            return bTime - aTime
          })
        : others

  const related = ranked.slice(0, MAX_RELATED)

  const heading = dict?.news?.relatedArticles ?? "Related articles"
  const viewAllLabel = dict?.news?.viewAllNews ?? "View all news"

  return (
    <section
      aria-label="Related articles"
      className="py-8 sm:py-12"
      style={{
        background: "linear-gradient(180deg, #e4ecf4 0%, #dae4ef 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 font-serif">
          {heading}
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {related.map((post) => (
            <li key={post.slug}>
              <Link
                href={newsArticleHref(lang, post.slug)}
                className="block rounded-xl bg-white/80 hover:bg-white px-4 py-3 font-medium text-gray-800 hover:text-charcoal-600 shadow-sm hover:shadow-md transition-all"
              >
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6">
          <Link
            href={newsHref(lang)}
            className="font-medium text-charcoal-600 hover:text-charcoal-700 underline"
          >
            {viewAllLabel}
          </Link>
        </p>
      </div>
    </section>
  )
}
