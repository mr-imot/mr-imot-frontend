import Link from "next/link"
import Image from "next/image"
import { BlogPostMeta, getRelativeUrl, BlogLang, formatBlogDate } from "@/lib/news"
import { CompactPostCard } from "./compact-post-card"

interface NewsHeroProps {
  featured: BlogPostMeta
  sideStories: BlogPostMeta[]
  lang: BlogLang
}

// Force rebuild
export function NewsHero({ featured, sideStories, lang }: NewsHeroProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-12 mb-12 border-b border-muted/60 pb-12">
      {/* Main Featured Story */}
      <div className="lg:col-span-8">
        <Link href={getRelativeUrl(lang, featured.slug)} className="group block relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-white border border-muted mb-4">
          {featured.coverImage && (
            <Image
              src={featured.coverImage}
              alt={featured.coverImageAlt || featured.title}
              fill
              className="object-contain transition duration-700 group-hover:scale-105"
              priority
              unoptimized
              sizes="(max-width: 1024px) 100vw, 800px"
            />
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <span className="inline-block px-2 py-1 mb-3 text-xs font-bold text-white uppercase bg-primary rounded">
              {featured.category || "News"}
            </span>
            <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl group-hover:underline decoration-2 underline-offset-4">
              {featured.title}
            </h1>
            {featured.description && (
              <p className="mt-4 text-base text-gray-200 md:text-lg line-clamp-2 max-w-2xl">
                {featured.description}
              </p>
            )}
            <div className="mt-4 flex items-center gap-3 text-sm text-gray-300">
               {featured.date && <time>{formatBlogDate(featured.date, lang)}</time>}
               {featured.author?.name && (
                   <>
                    <span>•</span>
                    <span>{featured.author.name}</span>
                   </>
               )}
            </div>
          </div>
        </Link>
      </div>

      {/* Side Stories (Top Stories) */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-primary pb-2">
            <h3 className="font-bold uppercase tracking-wider text-sm text-primary">Top Stories</h3>
        </div>
        <div className="flex flex-col gap-6 divide-y divide-muted/60">
            {sideStories.map((story) => (
                <div key={story.slug} className="pt-6 first:pt-0">
                    <CompactPostCard post={story} lang={lang} />
                </div>
            ))}
        </div>
      </div>
    </div>
  )
}
