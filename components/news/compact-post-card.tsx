import Link from "next/link"
import Image from "next/image"
import { BlogPostMeta, getRelativeUrl, BlogLang, formatBlogDate } from "@/lib/news"

interface CompactPostCardProps {
  post: BlogPostMeta
  lang: BlogLang
  hideImage?: boolean
  dense?: boolean
}

export function CompactPostCard({ post, lang, hideImage = false, dense = false }: CompactPostCardProps) {
  return (
    <div className="group flex items-start gap-4">
      {!hideImage && post.coverImage && (
        <Link href={getRelativeUrl(lang, post.slug)} className="relative shrink-0 overflow-hidden rounded-md bg-muted">
           <div className={`relative ${dense ? 'w-24 h-16' : 'w-32 h-20'}`}>
            <Image
              src={post.coverImage}
              alt={post.coverImageAlt || post.title}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              unoptimized
              sizes="128px"
            />
          </div>
        </Link>
      )}
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-primary">
          {post.category && <span>{post.category}</span>}
        </div>
        <Link href={getRelativeUrl(lang, post.slug)} className="group-hover:text-primary transition-colors">
          <h4 className={`font-bold leading-tight text-foreground ${dense ? 'text-sm' : 'text-base'}`}>
            {post.title}
          </h4>
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            {post.date && <time>{formatBlogDate(post.date, lang)}</time>}
            {post.readingMinutes && <span>• {Math.ceil(post.readingMinutes)} min</span>}
        </div>
      </div>
    </div>
  )
}
