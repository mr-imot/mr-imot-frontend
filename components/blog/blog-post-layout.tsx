import Image from "next/image"
import Link from "next/link"
import type React from "react"
import type { BlogLang, BlogPostMeta } from "@/lib/news"
import { formatBlogDate, getRelativeUrl } from "@/lib/news"

type BlogPostLayoutProps = {
  post: BlogPostMeta
  lang: BlogLang
  children: React.ReactNode
}

const tagLabel = (lang: BlogLang) => {
  if (lang === "bg") return "Етикети"
  if (lang === "ru") return "Теги"
  return "Tags"
}

const backLabel = (lang: BlogLang) => {
  if (lang === "bg") return "Към блога"
  if (lang === "ru") return "Назад към блога"
  return "Back to blog"
}

const defaultAuthor = (lang: BlogLang) => {
  if (lang === "bg") return "Екипът на Мистър Имот"
  if (lang === "ru") return "Команда Mister Imot"
  return "Mister Imot Team"
}

export function BlogPostLayout({ post, lang, children }: BlogPostLayoutProps) {
  const { title, description, coverImage, category, tags, author, date, readingLabel } = post
  const formattedDate = formatBlogDate(date, lang)

  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
      <div className="mb-8 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Link
          href={getRelativeUrl(lang)}
          className="rounded-full border border-muted px-3 py-1 text-foreground transition-colors hover:bg-muted"
        >
          {backLabel(lang)}
        </Link>
        {category && (
          <span className="rounded-full bg-muted px-3 py-1 text-foreground">
            {category}
          </span>
        )}
      </div>

      <header className="space-y-5">
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="text-lg text-muted-foreground sm:text-xl">
            {description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            {author?.avatar ? (
              <Image
                src={author.avatar}
                alt={author?.name || defaultAuthor(lang)}
                width={44}
                height={44}
                className="h-11 w-11 rounded-full object-cover shadow-sm"
              />
            ) : (
              <div className="h-11 w-11 rounded-full bg-muted" aria-hidden />
            )}
            <div>
              <div className="text-sm font-semibold text-foreground">
                {author?.name || defaultAuthor(lang)}
              </div>
              <div className="text-xs text-muted-foreground">
                {[formattedDate, readingLabel].filter(Boolean).join(" • ")}
              </div>
            </div>
          </div>

          {tags?.length ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {tagLabel(lang)}:
              </span>
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </header>

      {coverImage && (
        <div className="relative mt-8 mb-10 h-[260px] overflow-hidden rounded-3xl shadow-2xl sm:h-[340px] lg:h-[420px]">
          <Image
            src={coverImage}
            alt={title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent" />
        </div>
      )}

      <div className="prose prose-lg prose-slate dark:prose-invert max-w-none leading-relaxed">
        {children}
      </div>
    </article>
  )
}

export default BlogPostLayout









