import type { Metadata } from "next"
import Link from "next/link"
import { brandForLang, formatTitleWithBrand } from "@/lib/seo"
import { BLOG_LANGS, type BlogLang, type BlogPostMeta, getAllPostsMeta, getRelativeUrl, formatBlogDate } from "@/lib/news"
import { getDictionary } from "../dictionaries"
import { NewsTicker, type ExchangeRates } from "@/components/news/ticker"
import { NewsHero } from "@/components/news/news-hero"
import { CompactPostCard } from "@/components/news/compact-post-card"
import { SectionHeader } from "@/components/news/section-header"
import PostCard from "@/components/news/post-card"
import WebPageSchema from "@/components/seo/webpage-schema"

export const revalidate = 600
export const dynamicParams = false

type BlogIndexParams = {
  params: Promise<{ lang: BlogLang }>
  searchParams?: Promise<{ q?: string; category?: string; tag?: string }>
}

async function getNewsCopy(lang: BlogLang) {
  const dictionary = await getDictionary(lang)
  const newsPage = (dictionary as Record<string, unknown>).newsPage
  return (newsPage && typeof newsPage === "object" ? newsPage : {}) as Record<string, string>
}

async function getExchangeRates(): Promise<ExchangeRates> {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=EUR&to=USD,GBP,BGN', {
      next: { revalidate: 3600 }
    })
    if (!res.ok) return null
    return res.json()
  } catch (e) {
    return null
  }
}

const metaTitleFallback: Record<BlogLang, string> = {
  en: "Mister Imot News – Real Estate, Finance, and Market Updates",
  bg: "Новини от Мистър Имот – Имоти, Финанси и Пазарни Анализи",
  ru: "Новости Mister Imot — Недвижимость, Финансы и Аналитика",
  gr: "Ειδήσεις Mister Imot – Ακίνητα, Οικονομικά και Ενημερώσεις Αγοράς",
}

const metaDescriptionFallback: Record<BlogLang, string> = {
  en: "Latest news on real estate market, interest rates, money, and platform updates. Expert analysis and guides for buyers and investors.",
  bg: "Последни новини за пазара на имоти, лихвени проценти, пари и обновления на платформата. Експертни анализи и ръководства.",
  ru: "Последние новости рынка недвижимости, процентные ставки и обновления платформы. Экспертная аналитика и гиды.",
  gr: "Τελευταία νέα για την αγορά ακινήτων, επιτόκια και ενημερώσεις πλατφόρμας. Αναλύσεις εμπειρογνωμόνων.",
}

const emptyStateFallback: Record<BlogLang, { title: string; subtitle: string; clear: string }> = {
  en: {
    title: "No results found",
    subtitle: "Try adjusting your search or filters",
    clear: "Clear all filters",
  },
  bg: {
    title: "Няма резултати",
    subtitle: "Променете търсенето или филтрите",
    clear: "Изчисти всички филтри",
  },
  ru: {
    title: "Результатов не найдено",
    subtitle: "Попробуйте изменить поиск или фильтры",
    clear: "Сбросить все фильтры",
  },
  gr: {
    title: "Δεν βρέθηκαν αποτελέσματα",
    subtitle: "Προσαρμόστε την αναζήτηση ή τα φίλτρα",
    clear: "Καθαρισμός όλων των φίλτρων",
  },
}

export async function generateStaticParams() {
  return BLOG_LANGS.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: BlogIndexParams): Promise<Metadata> {
  const { lang } = await params
  const copy = await getNewsCopy(lang)
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://mrimot.com").replace(/\/$/, "")
  const canonical =
    lang === "en"
      ? `${baseUrl}/news`
      : lang === "bg"
        ? `${baseUrl}/bg/novini`
        : lang === "ru"
          ? `${baseUrl}/ru/novosti`
          : `${baseUrl}/gr/eidhseis`
  
  const title = formatTitleWithBrand(copy.metaTitle || metaTitleFallback[lang], lang)
  const description = copy.metaDescription || metaDescriptionFallback[lang]
  const brand = brandForLang(lang)

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: `${baseUrl}/news`,
        bg: `${baseUrl}/bg/novini`,
        ru: `${baseUrl}/ru/novosti`,
        el: `${baseUrl}/gr/eidhseis`,
        "x-default": `${baseUrl}/news`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: brand,
      type: "website",
    },
  }
}

function makeMockPosts(_lang: BlogLang): BlogPostMeta[] {
  // Disable mock posts: only real articles remain
  return []
}

export default async function BlogIndexPage({ params, searchParams }: BlogIndexParams) {
  const { lang } = await params
  const sp = await searchParams
  const q = sp?.q?.toString().trim().toLowerCase() || ""
  const categoryFilter = sp?.category?.toString()
  const tagFilter = sp?.tag?.toString()

  // Allow cross-locale category filters (e.g., BG query on EN page)
  // Each array contains all equivalent category names across languages (EN, BG, GR, RU)
  const CATEGORY_GROUPS: string[][] = [
    ["platform news", "новини за платформата", "νέα πλατφόρμας", "новости платформы"],
    ["real estate", "имоти"],
    ["money", "пари"],
    ["local news", "местни", "локални"],
    ["global news", "световни", "world", "διεθνή", "мир"],
    ["properties", "имоти в платформата"],
    ["interest rates", "лихви"],
    ["guides", "ръководства", "οδηγοί", "гайды"],
  ]
  // Static nav categories to keep tabs visible even with few posts
  const NAV_CATEGORIES: Record<BlogLang, string[]> = {
    en: ["Platform News", "Real Estate", "Money", "Local News", "Global News", "Properties", "Interest Rates", "Guides"],
    bg: ["Новини за Платформата", "Имоти", "Пари", "Местни", "Световни", "Имоти в Платформата", "Лихви", "Ръководства"],
    ru: ["Новости Платформы", "Недвижимость", "Деньги", "Местные", "Мировые", "Объявления в Платформе", "Ставки", "Гайды"],
    gr: ["Νέα Πλατφόρμας", "Ακίνητα", "Χρήμα", "Τοπικά Νέα", "Διεθνή", "Ακίνητα στην Πλατφόρμα", "Επιτόκια", "Οδηγοί"],
  }
  
  // Helper to find all equivalent categories for a given category name
  const findEquivalentCategories = (cat: string): string[] => {
    const normalized = cat.toLowerCase()
    for (const group of CATEGORY_GROUPS) {
      if (group.some(g => g.toLowerCase() === normalized)) {
        return group
      }
    }
    return [cat] // Return self if no match found
  }

  const copy = await getNewsCopy(lang)
  const posts = (await getAllPostsMeta(lang)).map(p => ({ ...p, href: getRelativeUrl(lang, p.slug) }))
  const mockPosts = makeMockPosts(lang)
  const rates = await getExchangeRates()
  
  // Merge real and mock posts, prioritizing real ones if slug collision
  const allPosts = [...posts, ...mockPosts.filter((m) => !posts.find((p) => p.slug === m.slug))]
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))

  // Filtering Logic
  const filtered = allPosts.filter((p) => {
    let matches = true
    const postCategory = (p.category || "").toLowerCase()
    if (q) {
      const haystack = `${p.title} ${p.description ?? ""} ${(p.tags || []).join(" ")} ${(p.category || "")}`.toLowerCase()
      if (!haystack.includes(q)) matches = false
    }
    if (categoryFilter) {
      const equivalents = findEquivalentCategories(categoryFilter)
      if (!equivalents.some(eq => eq.toLowerCase() === postCategory)) {
        matches = false
      }
    }
    if (tagFilter && !p.tags?.includes(tagFilter)) {
      matches = false
    }
    return matches
  })

  // Segmentation for Layout
  // 1. Hero: Featured (1st) + Side Stories (2nd, 3rd, 4th)
  const heroFeatured = filtered[0]
  const heroSide = filtered.slice(1, 4)
  const heroSlugs = new Set([heroFeatured?.slug, ...heroSide.map(p => p.slug)].filter(Boolean))

  // 2. Sections
  const categories = NAV_CATEGORIES[lang] || []
  
  // Group remaining posts by category for specific sections, or just show a mixed feed if filtering is active
  const isFilteredView = !!q || !!categoryFilter || !!tagFilter

  const t = (key: string, fallback?: string) => (copy?.[key] as string) || fallback || ""

  // Helper to get posts for a category from ALL posts (excluding hero posts to avoid duplicates)
  const getPostsForCat = (cat: string) => {
    const equivalents = findEquivalentCategories(cat).map((c) => c.toLowerCase())
    return allPosts
      .filter((p) => !heroSlugs.has(p.slug)) // Exclude hero posts
      .filter((p) => equivalents.includes((p.category || "").toLowerCase()))
      .slice(0, 4)
  }
  
  // Check if a section has posts
  const sectionHasPosts = (cat: string) => getPostsForCat(cat).length > 0

  // Get metadata for WebPage schema
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://mrimot.com").replace(/\/$/, "")
  const canonical =
    lang === "en"
      ? `${baseUrl}/news`
      : lang === "bg"
        ? `${baseUrl}/bg/novini`
        : lang === "ru"
          ? `${baseUrl}/ru/novosti`
          : `${baseUrl}/gr/eidhseis`
  const title = formatTitleWithBrand(copy.metaTitle || metaTitleFallback[lang], lang)
  const description = copy.metaDescription || metaDescriptionFallback[lang]

  return (
    <>
      <WebPageSchema
        name={title}
        description={description}
        url={canonical}
        lang={lang}
        baseUrl={baseUrl}
      />
      <div className="min-h-screen bg-white font-sans text-charcoal-500 selection:bg-primary/20">
      
      {/* Ticker */}
      <NewsTicker lang={lang} rates={rates} />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header & Nav */}
        <div className="mb-6 sm:mb-8 flex flex-col gap-4 sm:gap-6 md:flex-row md:items-end md:justify-between">
            <div>
                 <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-foreground md:text-5xl">
                    {t("newsTitle", lang === "bg" ? "Пазарен Обзор" : "Market Watch")}
                </h1>
                <p className="mt-1 sm:mt-2 text-sm sm:text-lg text-muted-foreground">
                    {t("newsSubtitle", lang === "bg" ? "Недвижими имоти, финанси и новини от платформата" : "Real estate, finance, and platform updates")}
                </p>
            </div>
            
            {/* Search */}
            <form className="relative w-full md:max-w-xs" action="" method="get">
                 <input
                    type="search"
                    name="q"
                    defaultValue={q}
                    placeholder={t("searchPlaceholder", lang === "bg" ? "Търси новини..." : "Search news...")}
                    className="w-full border-b-2 border-muted bg-transparent py-2 text-sm font-semibold outline-none focus:border-primary transition-colors"
                 />
                 <button type="submit" className="absolute right-0 top-2 text-muted-foreground hover:text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                 </button>
            </form>
        </div>

        {/* Categories Nav - Scrollable on mobile */}
        <nav className="mb-6 sm:mb-10 -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-hide">
            <div className="flex gap-x-4 sm:gap-x-6 gap-y-2 sm:flex-wrap border-y border-muted py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground min-w-max sm:min-w-0">
                <Link href={getRelativeUrl(lang)} className={`whitespace-nowrap ${!categoryFilter ? "text-primary" : "hover:text-foreground"}`}>
                    {lang === 'bg' ? 'Всички' : 'All'}
                </Link>
                {categories.map(cat => (
                    <Link 
                        key={cat} 
                        href={`${getRelativeUrl(lang)}?category=${encodeURIComponent(cat)}`}
                        className={`whitespace-nowrap ${categoryFilter === cat ? "text-primary" : "hover:text-foreground"}`}
                    >
                        {cat}
                    </Link>
                ))}
            </div>
        </nav>

        {filtered.length === 0 ? (
           <div className="py-20 text-center">
             <h3 className="text-2xl font-bold">
               {t("emptyTitle", emptyStateFallback[lang].title)}
             </h3>
             <p className="text-muted-foreground">
               {t("emptySubtitle", emptyStateFallback[lang].subtitle)}
             </p>
             <Link href={getRelativeUrl(lang)} className="mt-4 inline-block text-primary hover:underline">
               {t("clearFilters", emptyStateFallback[lang].clear)}
             </Link>
           </div>
        ) : (
            <>
                {/* Hero Section */}
                {!isFilteredView && heroFeatured && (
                    <NewsHero featured={heroFeatured} sideStories={heroSide} lang={lang} />
                )}

                <div className="grid gap-8 lg:gap-10 lg:grid-cols-12">
                    
                    {/* Main Feed Column */}
                    <div className="lg:col-span-8 space-y-8 sm:space-y-12">
                        
                        {isFilteredView ? (
                             <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                                {filtered.map(post => (
                                    <PostCard key={post.slug} post={post} lang={lang} />
                                ))}
                             </div>
                        ) : (
                            <>
                                {/* Local News Section */}
                                {sectionHasPosts(lang === 'bg' ? "Местни" : "Local News") && (
                                  <section>
                                    <SectionHeader title={lang === 'bg' ? "Местни Новини" : "Local News"} href={`${getRelativeUrl(lang)}?category=${encodeURIComponent(lang === 'bg' ? "Местни" : "Local News")}`} />
                                    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                                        {getPostsForCat(lang === 'bg' ? "Местни" : "Local News").map(post => (
                                            <PostCard key={post.slug} post={post} lang={lang} />
                                        ))}
                                    </div>
                                  </section>
                                )}

                                {/* Money/Finance Section */}
                                {sectionHasPosts(lang === 'bg' ? "Пари" : "Money") && (
                                  <section>
                                    <SectionHeader title={lang === 'bg' ? "Пари" : "Money"} href={`${getRelativeUrl(lang)}?category=${encodeURIComponent(lang === 'bg' ? "Пари" : "Money")}`} />
                                    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                                        {getPostsForCat(lang === 'bg' ? "Пари" : "Money").map(post => (
                                            <PostCard key={post.slug} post={post} lang={lang} />
                                        ))}
                                    </div>
                                  </section>
                                )}

                                {/* Global News Section */}
                                {sectionHasPosts(lang === 'bg' ? "Световни" : "Global News") && (
                                  <section>
                                    <SectionHeader title={lang === 'bg' ? "Световни Новини" : "Global News"} href={`${getRelativeUrl(lang)}?category=${encodeURIComponent(lang === 'bg' ? "Световни" : "Global News")}`} />
                                    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                                        {getPostsForCat(lang === 'bg' ? "Световни" : "Global News").map(post => (
                                            <PostCard key={post.slug} post={post} lang={lang} />
                                        ))}
                                    </div>
                                  </section>
                                )}

                                {/* Platform News */}
                                {sectionHasPosts(lang === 'bg' ? "Новини за Платформата" : "Platform News") && (
                                  <section>
                                    <SectionHeader title={lang === 'bg' ? "Новини за Платформата" : "Platform News"} href={`${getRelativeUrl(lang)}?category=${encodeURIComponent(lang === 'bg' ? "Новини за Платформата" : "Platform News")}`} />
                                    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                                         {getPostsForCat(lang === 'bg' ? "Новини за Платформата" : "Platform News").map(post => (
                                            <PostCard key={post.slug} post={post} lang={lang} />
                                        ))}
                                    </div>
                                  </section>
                                )}

                                {/* Real Estate Section */}
                                {sectionHasPosts(lang === 'bg' ? "Имоти" : "Real Estate") && (
                                  <section>
                                    <SectionHeader title={lang === 'bg' ? "Имоти" : "Real Estate"} href={`${getRelativeUrl(lang)}?category=${encodeURIComponent(lang === 'bg' ? "Имоти" : "Real Estate")}`} />
                                    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                                        {getPostsForCat(lang === 'bg' ? "Имоти" : "Real Estate").map(post => (
                                            <PostCard key={post.slug} post={post} lang={lang} />
                                        ))}
                                    </div>
                                  </section>
                                )}
                            </>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4 space-y-6 sm:space-y-10">
                        {/* Latest News */}
                         <div className="bg-muted/30 p-4 sm:p-6 rounded-xl border border-muted">
                            <h3 className="font-black uppercase tracking-wider text-lg sm:text-xl mb-4 sm:mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                {t("latest", lang === "bg" ? "Последни новини" : "Latest News")}
                            </h3>
                            <div className="space-y-4 sm:space-y-6 divide-y divide-muted/50">
                                {allPosts.slice(0, 6).map(post => (
                                    <div key={post.slug} className="pt-3 sm:pt-4 first:pt-0">
                                        <CompactPostCard post={post} lang={lang} hideImage dense />
                                    </div>
                                ))}
                            </div>
                         </div>

                         {/* Tags Cloud */}
                         <div>
                            <SectionHeader title={t("tags", lang === "bg" ? "Етикети" : "Tags")} />
                            <div className="flex flex-wrap gap-2">
                                {Array.from(new Set(allPosts.flatMap(p => p.tags || []))).slice(0, 20).map(tag => (
                                    <Link 
                                        key={tag} 
                                        href={`${getRelativeUrl(lang)}?tag=${encodeURIComponent(tag)}`}
                                        className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold uppercase tracking-wide border rounded-md transition-colors ${tagFilter === tag ? 'bg-primary text-white border-primary' : 'bg-white border-muted hover:border-primary hover:text-primary'}`}
                                    >
                                        {tag}
                                    </Link>
                                ))}
                            </div>
                         </div>

                         {/* Ad / Promo Placeholder */}
                         <div className="bg-charcoal-500 text-white p-6 sm:p-8 rounded-xl text-center">
                            <h4 className="text-lg sm:text-xl font-bold mb-2">{lang === 'bg' ? "Мистър Имот" : "Mister Imot"}</h4>
                            <p className="text-white/80 text-sm mb-4">{lang === 'bg' ? "Намери своя нов дом днес." : "Find your new home today."}</p>
                            <Link href={`/${lang}`} className="inline-block bg-white text-charcoal-500 font-bold px-5 sm:px-6 py-2 rounded-full hover:bg-gray-100 transition text-sm sm:text-base">
                                {lang === 'bg' ? "Разгледай имоти" : "Browse Properties"}
                            </Link>
                         </div>

                    </aside>

                </div>
            </>
        )}

      </main>
    </div>
    </>
  )
}
