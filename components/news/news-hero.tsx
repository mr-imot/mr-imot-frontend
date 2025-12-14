import Link from "next/link"
import Image from "next/image"
import { BlogPostMeta, getRelativeUrl, BlogLang, formatBlogDate } from "@/lib/news"
import { CompactPostCard } from "./compact-post-card"

interface NewsHeroProps {
  featured: BlogPostMeta
  sideStories: BlogPostMeta[]
  lang: BlogLang
}

export function NewsHero({ featured, sideStories, lang }: NewsHeroProps) {
  const topStoriesLabel = lang === 'bg' ? 'Топ новини' : lang === 'ru' ? 'Главные' : lang === 'gr' ? 'Κορυφαία' : 'Top Stories'
  
  return (
    <div className="grid gap-6 sm:gap-8 lg:grid-cols-12 mb-8 sm:mb-12 border-b border-muted/60 pb-8 sm:pb-12">
      {/* Main Featured Story */}
      <div className="lg:col-span-8">
        <Link href={getRelativeUrl(lang, featured.slug)} className="group block relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden rounded-lg sm:rounded-xl bg-white border border-muted mb-4">
          {featured.coverImage && (
            <Image
              src={featured.coverImage}
              alt={featured.coverImageAlt || featured.title}
              fill
              className="object-cover transition duration-700 group-hover:scale-105"
              priority
              unoptimized
              sizes="(max-width: 1024px) 100vw, 800px"
            />
          )}
          <div className="absolute inset-x-0 bottom-0 h-3/4 sm:h-2/3 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 z-10">
            <span className="inline-block px-2 py-0.5 sm:py-1 mb-2 sm:mb-3 text-[10px] sm:text-xs font-bold text-white uppercase bg-primary rounded">
              {featured.category || "News"}
            </span>
            <h1 className="text-xl sm:text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl group-hover:underline decoration-2 underline-offset-4">
              {featured.title}
            </h1>
            {featured.description && (
              <p className="mt-2 sm:mt-4 text-sm sm:text-base text-gray-200 md:text-lg line-clamp-2 max-w-2xl hidden sm:block">
                {featured.description}
              </p>
            )}
            <div className="mt-2 sm:mt-4 flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-300">
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
      <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-6">
        <div className="flex items-center justify-between border-b border-primary pb-2">
            <h3 className="font-bold uppercase tracking-wider text-xs sm:text-sm text-primary">{topStoriesLabel}</h3>
        </div>
        <div className="flex flex-col gap-4 sm:gap-6 divide-y divide-muted/60">
            {sideStories.map((story) => (
                <div key={story.slug} className="pt-4 sm:pt-6 first:pt-0">
                    <CompactPostCard post={story} lang={lang} />
                </div>
            ))}
        </div>
      </div>
    </div>
  )
}
