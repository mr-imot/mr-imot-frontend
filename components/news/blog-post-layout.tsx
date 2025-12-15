import Image from "next/image"
import Link from "next/link"
import type React from "react"
import type { BlogLang, BlogPostMeta } from "@/lib/news"
import { formatBlogDate, getRelativeUrl } from "@/lib/news"
import { SocialShare } from "@/components/news/social-share"
import { FollowUs } from "@/components/news/follow-us"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"

function slugifyTag(tag: string) {
  return encodeURIComponent(tag.toLowerCase().trim())
}

type BlogPostLayoutProps = {
  post: BlogPostMeta
  lang: BlogLang
  children: React.ReactNode
}

const tagLabel = (lang: BlogLang) => {
  if (lang === "bg") return "Етикети"
  if (lang === "ru") return "Теги"
  if (lang === "gr") return "Ετικέτες"
  return "Tags"
}

const backLabel = (lang: BlogLang) => {
  if (lang === "bg") return "Към блога"
  if (lang === "ru") return "Назад към блога"
  if (lang === "gr") return "Πίσω στο blog"
  return "Back to blog"
}

const defaultAuthor = (lang: BlogLang) => {
  if (lang === "bg") return "Мистър Имот"
  return "Mister Imot"
}

export function BlogPostLayout({ post, lang, children }: BlogPostLayoutProps) {
  const { title, description, coverImage, coverImageAlt, category, tags, author, date, readingLabel } = post
  const formattedDate = formatBlogDate(date, lang)

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
      {/* Navigation & Meta */}
      <div className="mb-6 sm:mb-8 flex flex-col gap-4 sm:gap-6 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={getRelativeUrl(lang)}
          className="group flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          {backLabel(lang)}
        </Link>
        
        <div className="flex items-center gap-2">
          {category && (
            <Link
              href={`${getRelativeUrl(lang)}?category=${encodeURIComponent(category)}`}
              className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              {category}
            </Link>
          )}
        </div>
      </div>

      <header className="space-y-6 sm:space-y-8">
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-4xl font-bold leading-tight tracking-tight text-foreground lg:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="text-base sm:text-xl text-muted-foreground leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 border-y py-4 sm:py-6">
          <div className="flex items-center gap-3 sm:gap-4">
            {author?.avatar ? (
              <Image
                src={author.avatar}
                alt={author?.name || defaultAuthor(lang)}
                width={48}
                height={48}
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover ring-2 ring-background"
              />
            ) : (
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-muted" aria-hidden />
            )}
            <div>
              <div className="text-sm font-bold text-foreground">
                {author?.name || defaultAuthor(lang)}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <time dateTime={date}>{formattedDate}</time>
                <span>•</span>
                <span>{readingLabel}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <SocialShare title={title} />
          </div>
        </div>
      </header>

      {coverImage && (
        <div className="relative mt-6 sm:mt-10 mb-8 sm:mb-12 w-full overflow-hidden rounded-xl sm:rounded-2xl shadow-lg ring-1 ring-border bg-white">
          <Image
            src={coverImage}
            alt={coverImageAlt || title}
            width={1200}
            height={900}
            priority
            unoptimized
            className="w-full h-auto object-contain"
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
        </div>
      )}

      <div className="prose prose-sm sm:prose-lg prose-slate dark:prose-invert max-w-none leading-relaxed" key={`content-${post.slug}`}>
        {children}
      </div>

      {/* Always include FollowUs with developer CTA */}
      <FollowUs lang={lang} devCta />

      <Separator className="my-8 sm:my-12" />

      {tags?.length ? (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-sm font-semibold text-muted-foreground">
            {tagLabel(lang)}:
          </span>
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`${getRelativeUrl(lang)}?tag=${slugifyTag(tag)}`}
              className="rounded-full bg-muted px-2.5 sm:px-3 py-1 text-xs sm:text-sm text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              #{tag}
            </Link>
          ))}
        </div>
      ) : null}
    </article>
  )
}

export default BlogPostLayout
