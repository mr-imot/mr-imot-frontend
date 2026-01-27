import Link from "next/link"
import { getAllPostsMeta } from "@/lib/news"
import { newsArticleHref, newsHref } from "@/lib/routes"
import type { SupportedLocale } from "@/lib/routes"
import type { BlogLang } from "@/lib/news"

const MAX_POSTS = 6

interface LatestNewsProps {
  lang: SupportedLocale
  dict?: { home?: { latestNews?: string; viewAllNews?: string } }
}

export async function LatestNews({ lang, dict }: LatestNewsProps) {
  const blogLang = lang as BlogLang
  const posts = await getAllPostsMeta(blogLang)
  const slice = (posts ?? []).slice(0, MAX_POSTS)

  if (slice.length === 0) return null

  const heading = dict?.home?.latestNews ?? "Latest news"
  const viewAllLabel = dict?.home?.viewAllNews ?? "View all news"

  return (
    <section
      aria-label="Latest news"
      className="py-8 sm:py-12 md:py-16"
      style={{
        background: "linear-gradient(180deg, #e4ecf4 0%, #dae4ef 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 font-serif">
          {heading}
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {slice.map((post) => (
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
