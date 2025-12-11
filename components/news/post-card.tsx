import Image from "next/image"
import Link from "next/link"
import type { BlogLang, BlogPostMeta } from "@/lib/news"
import { formatBlogDate, getRelativeUrl } from "@/lib/news"

type PostCardProps = {
  post: BlogPostMeta
  lang: BlogLang
}

export function PostCard({ post, lang }: PostCardProps) {
  const href = getRelativeUrl(lang, post.slug)

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-muted bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      {post.coverImage ? (
        <div className="relative h-40 sm:h-48 w-full overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.coverImageAlt || post.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
            unoptimized
            sizes="(max-width: 768px) 100vw, 480px"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="flex h-40 sm:h-48 w-full items-center justify-center bg-gradient-to-br from-charcoal-500 to-charcoal-300 text-white">
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-wide">
            {lang === 'bg' ? 'Мистър Имот' : 'Mister Imot'}
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col space-y-2 sm:space-y-3 p-4 sm:p-5">
        <div className="flex items-center gap-2 text-[10px] sm:text-xs font-medium text-muted-foreground">
          {post.date && <span>{formatBlogDate(post.date, lang)}</span>}
          {post.readingLabel && (
            <>
              <span>•</span>
              <span>{post.readingLabel}</span>
            </>
          )}
        </div>

        <h3 className="text-base sm:text-xl font-semibold leading-snug text-foreground transition-colors group-hover:text-charcoal-500 line-clamp-2">
          {post.title}
        </h3>

        {post.description && (
          <p className="line-clamp-2 text-xs sm:text-sm text-muted-foreground">
            {post.description}
          </p>
        )}

        {post.tags?.length ? (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1 sm:pt-2">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  )
}

export default PostCard

