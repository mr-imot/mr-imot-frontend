import type { Metadata } from "next"
import Link from "next/link"
import { brandForLang, formatTitleWithBrand } from "@/lib/seo"
import { BLOG_LANGS, type BlogLang, getAllPostsMeta, getRelativeUrl, formatBlogDate } from "@/lib/news"
import PostCard from "@/components/news/post-card"
import { getDictionary } from "../dictionaries"

export const revalidate = 600
export const dynamicParams = false

type BlogIndexParams = {
  params: Promise<{ lang: BlogLang }>
  searchParams?: { q?: string }
}

async function getNewsCopy(lang: BlogLang) {
  const dictionary = await getDictionary(lang)
  const newsPage = (dictionary as Record<string, unknown>).newsPage
  return (newsPage && typeof newsPage === "object" ? newsPage : {}) as Record<string, string>
}

const metaTitleFallback: Record<BlogLang, string> = {
  en: "Mister Imot News – market updates, guides, and analytics",
  bg: "Новини на Мистър Имот – пазарни ъпдейти, ръководства и анализи",
  ru: "Новости Mister Imot — обзоры рынка, гиды и аналитика",
  gr: "Ειδήσεις Mister Imot – ενημερώσεις αγοράς, οδηγοί και αναλύσεις",
}

const metaDescriptionFallback: Record<BlogLang, string> = {
  en: "Daily market updates, price charts, and guides for buying new-build homes directly from developers in Bulgaria.",
  bg: "Ежедневни новини, графики и ръководства за покупка на имот ново строителство директно от строители в България.",
  ru: "Ежедневные новости, графики и гиды о покупке новостроек напрямую у застройщиков в Болгарии.",
  gr: "Καθημερινές ενημερώσεις, γραφήματα τιμών και οδηγοί για αγορά νεόδμητων απευθείας από κατασκευαστές στη Βουλγαρία.",
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

type DisplayPost = ReturnType<typeof toDisplayPost>[number]

function toDisplayPost(posts: Awaited<ReturnType<typeof getAllPostsMeta>>, lang: BlogLang) {
  return posts.map((p) => ({ ...p, href: getRelativeUrl(lang, p.slug) }))
}

function makeMockPosts(lang: BlogLang) {
  const iso = (daysAgo: number) => {
    const d = new Date()
    d.setDate(d.getDate() - daysAgo)
    return d.toISOString().slice(0, 10)
  }

  const mockBase = [
    {
      title: lang === "bg" ? "Цени на кв.м: София, Пловдив, Варна – седмичен пулс" : "Price per sqm: Sofia, Plovdiv, Varna – weekly pulse",
      description: lang === "bg" ? "Къде има ускорение и забавяне по квартали; извадка от нови сделки." : "Where prices heat up or cool down across key cities; sample of new deals.",
      coverImage: "https://images.unsplash.com/photo-1465804575741-338df8554e02?auto=format&fit=crop&w=1200&q=80",
      category: lang === "bg" ? "Новини" : "News",
      tags: ["цени", "седмичен пулс", "данни"],
      slug: "weekly-price-pulse",
      date: iso(2),
    },
    {
      title: lang === "bg" ? "Разрешителни за строеж: какво означава скокът през Q4" : "Building permits: what the Q4 spike means",
      description: lang === "bg" ? "Регионален разрез, квартали с най-много разрешителни, очаквано предлагане." : "Regional breakdown, top districts by permits, expected new supply.",
      coverImage: "https://images.unsplash.com/photo-1451933335233-c3648bfae101?auto=format&fit=crop&w=1200&q=80",
      category: lang === "bg" ? "Новини" : "News",
      tags: ["разрешителни", "supply", "данни"],
      slug: "permits-q4-impact",
      date: iso(4),
    },
    {
      title: lang === "bg" ? "Ипотечни лихви: тенденции и как да фиксирате по-добра ставка" : "Mortgage rates: trends and how to lock a better rate",
      description: lang === "bg" ? "Сравняваме фиксирани и плаващи продукти, изисквания и средни ставки." : "Comparing fixed vs variable, requirements, and current averages.",
      coverImage: "https://images.unsplash.com/photo-1496309732348-3627f3f040ee?auto=format&fit=crop&w=1200&q=80",
      category: lang === "bg" ? "Гайд" : "Guide",
      tags: ["ипотеки", "лихви", "финансиране"],
      slug: "mortgage-rate-trends",
      date: iso(6),
    },
    {
      title: lang === "bg" ? "Какво гледа инвеститорът в сграда преди Акт 14" : "What investors check in a building before Act 14",
      description: lang === "bg" ? "Практичен чеклист: конструкция, хидроизолация, срокове, актове." : "Practical checklist on structure, waterproofing, timelines, permits.",
      coverImage: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      category: lang === "bg" ? "Гайд" : "Guide",
      tags: ["инвеститори", "акт 14", "контрол"],
      slug: "investor-checklist-act14",
      date: iso(10),
    },
    {
      title: lang === "bg" ? "Пазар на имоти 2026: вход в еврозоната и ефектът върху цените" : "Property market 2026: eurozone entry and price effects",
      description: lang === "bg" ? "Сценарии за цените и търсенето в големите градове при присъединяване." : "Price and demand scenarios for major cities on euro adoption.",
      coverImage: "https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=1200&q=80",
      category: lang === "bg" ? "Анализ" : "Analysis",
      tags: ["еврозона", "прогноза"],
      slug: "eurozone-impact-2026",
      date: iso(12),
    },
    {
      title: lang === "bg" ? "Лоши новини за имотите? Как да четем сигналите от пазара" : "Reading the signals: separating market noise from facts",
      description: lang === "bg"
        ? "Преглеждаме данни, сделки и заглавия, за да отделим шум от реални индикатори."
        : "Reviewing data, deals, and headlines to separate noise from true indicators.",
      coverImage: "https://ik.imagekit.io/ts59gf2ul/blogs/2806590.jpg",
      category: lang === "bg" ? "Новини" : "News",
      tags: ["цени", "анализ", "данни"],
      slug: "reading-market-signals-2025",
      date: iso(8),
    },
  ]

  return mockBase.map((item) => ({
    ...item,
    translationKey: item.slug,
    lang,
    filePath: `mock-${lang}-${item.slug}`,
    readingMinutes: 0,
    readingLabel: "",
    href: getRelativeUrl(lang, item.slug),
  }))
}

export default async function BlogIndexPage({ params, searchParams }: BlogIndexParams) {
  const { lang } = await params
  const search = await searchParams
  const q = search?.q?.toString().trim().toLowerCase() || ""
  const copy = await getNewsCopy(lang)
  const posts = toDisplayPost(await getAllPostsMeta(lang), lang).sort((a, b) => (b.date || "").localeCompare(a.date || ""))
  const mockPosts = makeMockPosts(lang)
  const baseList: DisplayPost[] = [...posts, ...mockPosts.filter((m) => !posts.find((p) => p.slug === m.slug))]

  const filtered = q
    ? baseList.filter((p) => {
        const haystack = `${p.title} ${p.description ?? ""} ${(p.tags || []).join(" ")} ${(p.category || "")}`.toLowerCase()
        return haystack.includes(q)
      })
    : baseList

  const featured = filtered[0]
  const latestList = filtered.slice(1, 7)
  const news = filtered.filter((p) => (p.category || "").toLowerCase().includes("news") || (p.category || "").toLowerCase().includes("новини"))
  const guides = filtered.filter((p) => (p.category || "").toLowerCase().includes("guide") || (p.category || "").toLowerCase().includes("ръковод"))
  const tags = Array.from(new Set(filtered.flatMap((p) => p.tags || []))).slice(0, 12)

  const t = (key: string, fallback?: string) => (copy?.[key] as string) || fallback || ""

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-br from-charcoal-500 via-charcoal-400 to-charcoal-300 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:px-6 sm:py-12 lg:px-10">
          <form className="flex w-full max-w-xl items-center gap-3 rounded-full bg-white/10 px-4 py-3 backdrop-blur ring-1 ring-white/20 focus-within:ring-2 focus-within:ring-white/40" action="" method="get">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder={t("searchPlaceholder", "Search news, guides, tags…")}
              className="w-full bg-transparent text-sm text-white placeholder:text-white/60 outline-none"
            />
            <button type="submit" className="text-sm font-semibold text-white/80 hover:text-white">
              {t("searchCta", "Search")}
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-10">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-muted bg-muted/40 px-6 py-12 text-center">
            <p className="text-lg font-semibold text-foreground">
              {t("noResults", "No results for")} “{q}”
            </p>
            <p className="mt-2 text-muted-foreground">
              {t("noResultsHint", lang === "ru" ? "Попробуйте другой запрос." : lang === "bg" ? "Опитайте с друга ключова дума." : "Try a different keyword.")}
            </p>
          </div>
        ) : (
          <>
            {/* Hero + Latest rail */}
            <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
              {featured && (
                <article className="overflow-hidden rounded-3xl border border-muted bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-2xl">
                  <Link href={featured.href} className="block">
                    <div className="relative aspect-[16/9] w-full overflow-hidden">
                      {featured.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={featured.coverImage} alt={featured.title} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
                      ) : (
                        <div className="h-full w-full bg-muted" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                          {featured.category || t("news", "News")}
                        </div>
                        <h2 className="text-3xl font-semibold leading-snug md:text-4xl">{featured.title}</h2>
                        {featured.description && <p className="mt-3 text-sm text-white/85 line-clamp-2">{featured.description}</p>}
                      </div>
                    </div>
                  </Link>
                </article>
              )}

              <div className="rounded-3xl border border-muted bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-muted px-5 py-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("latest", "Latest")}</h3>
                  <Link href={getRelativeUrl(lang)} className="text-xs font-semibold text-primary hover:underline">
                    {t("viewAll", "View all")}
                  </Link>
                </div>
                <div className="divide-y divide-muted">
                  {(latestList.length ? latestList : filtered.slice(0, 5)).map((post) => (
                    <Link key={post.slug} href={post.href} className="flex items-start gap-3 px-5 py-4 transition hover:bg-muted/60">
                      <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground line-clamp-2">{post.title}</p>
                        {post.date && <p className="text-xs text-muted-foreground">{formatBlogDate(post.date, lang)}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Secondary + sidebar */}
            <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
              <div className="space-y-6">
                {/* Secondary stories */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">{t("topStories", "Top stories")}</h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {filtered.slice(1, 5).map((post) => (
                      <PostCard key={`${post.lang}-${post.slug}-secondary`} post={post} lang={lang} />
                    ))}
                  </div>
                </div>

                {/* More stories grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">{t("moreStories", "More stories")}</h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    {filtered.slice(5, 14).map((post) => (
                      <PostCard key={`${post.lang}-${post.slug}-more`} post={post} lang={lang} />
                    ))}
                    {filtered.length <= 5 && <p className="text-sm text-muted-foreground">{t("noMoreStories", "More stories coming soon.")}</p>}
                  </div>
                </div>
              </div>

              <aside className="space-y-8">
                <div className="rounded-2xl border border-muted bg-white p-5 shadow-sm">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">{t("searchPlaceholder", "Search news, guides, tags…")}</h4>
                  <form className="space-y-3" action="" method="get">
                    <input
                      type="search"
                      name="q"
                      defaultValue={q}
                      placeholder={t("searchPlaceholder", "Search news, guides, tags…")}
                      className="w-full rounded-lg border border-muted bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
                    >
                      {t("searchCta", "Search")}
                    </button>
                  </form>
                </div>

                <div className="rounded-2xl border border-muted bg-white p-5 shadow-sm">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">{t("tags", "Tags")}</h4>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-muted px-3 py-1 text-xs font-semibold text-foreground">
                        {tag}
                      </span>
                    ))}
                    {tags.length === 0 && <p className="text-sm text-muted-foreground">{t("noTags", "No tags yet.")}</p>}
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </section>
    </div>
  )
}

type RailProps = {
  title: string
  posts: Awaited<ReturnType<typeof getAllPostsMeta>>
  lang: BlogLang
}

function Rail({ title, posts, lang }: RailProps) {
  if (!posts.length) return null
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <Link href={getRelativeUrl(lang)} className="text-sm font-semibold text-primary hover:underline">
          View all
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {posts.map((post) => (
          <PostCard key={`${post.lang}-${post.slug}`} post={post} lang={lang} />
        ))}
      </div>
    </div>
  )
}

function getMockPosts(lang: BlogLang) {
  const baseHref = (slug: string) => getRelativeUrl(lang, slug)
  const today = new Date()
  const iso = (offset: number) => {
    const d = new Date(today)
    d.setDate(d.getDate() - offset)
    return d.toISOString().slice(0, 10)
  }

  const mocks = [
    {
      title: "Цени на кв.м: София, Пловдив, Варна – седмичен пулс",
      description: "Сравнение на темпа на растеж и новите сделки в трите най-динамични пазара.",
      coverImage: "https://images.unsplash.com/photo-1529429617124-aee711a1a7be?auto=format&fit=crop&w=1200&q=80",
      category: "Новини",
      tags: ["цени", "пазар", "София"],
      slug: "market-prices-weekly",
      date: iso(1),
    },
    {
      title: "Разрешителни за строеж: какво означава скокът през Q4",
      description: "Разчитаме данните за разрешителните и как ще се отразят на предлагането през 2026.",
      coverImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
      category: "Анализ",
      tags: ["разрешителни", "НСИ"],
      slug: "permits-q4-impact",
      date: iso(3),
    },
    {
      title: "3 неща, които да проверите преди да капарирате имот на зелено",
      description: "Бърз чеклист, който пази парите ви, когато резервирате ново строителство.",
      coverImage: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
      category: "Ръководства",
      tags: ["чеклист", "ново строителство"],
      slug: "off-plan-checklist-mock",
      date: iso(5),
    },
    {
      title: "Ипотечни лихви: тенденции и как да фиксирате по-добра ставка",
      description: "Бързо сравнение на предлаганите лихви и какво да поискате от банката.",
      coverImage: "https://images.unsplash.com/photo-1450101215322-bf5cd27642fc?auto=format&fit=crop&w=1200&q=80",
      category: "Новини",
      tags: ["ипотека", "лихви"],
      slug: "mortgage-rates-trends",
      date: iso(2),
    },
    {
      title: "Какво гледа инвеститорът в сграда преди Акт 14",
      description: "Списък с ключови проверки преди да се обвържете със строител.",
      coverImage: "https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=1200&q=80",
      category: "Ръководства",
      tags: ["Акт 14", "инвеститор"],
      slug: "before-act-14",
      date: iso(7),
    },
    {
      title: "Пазар на наеми vs. покупка: къде е границата през 2026",
      description: "Кратък модел за София и морските градове.",
      coverImage: "https://images.unsplash.com/photo-1484156818044-c040038b0710?auto=format&fit=crop&w=1200&q=80",
      category: "Анализ",
      tags: ["наеми", "покупка"],
      slug: "rent-vs-buy-2026",
      date: iso(4),
    },
    {
      title: "Green builds: какви материали търсят купувачите днес",
      description: "Събираме сигналите от последните проекти с висока енергийна ефективност.",
      coverImage: "https://images.unsplash.com/photo-1460574283810-2aab119d8511?auto=format&fit=crop&w=1200&q=80",
      category: "Новини",
      tags: ["енергийна ефективност"],
      slug: "green-builds-trends",
      date: iso(6),
    },
    {
      title: "Лоши новини за имотите? Какво значат данните за 2025",
      description: "Разбиваме заглавията: какви са реалните сигнали в цените и какво очакват анализаторите през 2026.",
      coverImage: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
      category: "Новини",
      tags: ["цени", "2025", "пазар"],
      slug: "bad-news-housing-2025",
      date: iso(8),
    },
    {
      title: "Пазар на имоти 2026: вход в еврозоната и ефектът върху цените",
      description: "Сценарии за цените при влизане в еврозоната и очакваното търсене в големите градове.",
      coverImage: "https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=1200&q=80",
      category: "Анализ",
      tags: ["еврозона", "прогноза"],
      slug: "eurozone-impact-2026",
      date: iso(9),
    },
    {
      title: "Лоши новини за имотите? Как да четем сигналите от пазара",
      description: "Преглеждаме данни, сделки и заглавия, за да отделим шум от реални индикатори.",
      coverImage: "https://ik.imagekit.io/ts59gf2ul/blogs/2806590.jpg",
      category: "Новини",
      tags: ["цени", "анализ", "данни"],
      slug: "reading-market-signals-2025",
      date: iso(8),
    },
    {
      title: "Лихви и ипотеки: кога да фиксирате през 2026",
      description: "Практични стъпки за купувачи: фиксирана срещу плаваща лихва, буфери и такси.",
      coverImage: "https://images.unsplash.com/photo-1450101215322-bf5cd27642fc?auto=format&fit=crop&w=1200&q=80",
      category: "Ръководства",
      tags: ["ипотека", "лихви", "купувачи"],
      slug: "fix-mortgage-2026",
      date: iso(10),
    },
    {
      title: "Строителен прогрес: как да четете графици и актове",
      description: "Кратко ръководство за Акт 14/15/16 и кои документи да изискате от строителя.",
      coverImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
      category: "Ръководства",
      tags: ["Акт 14", "Акт 15", "Акт 16"],
      slug: "construction-progress-checks",
      date: iso(11),
    },
    {
      title: "Вторичен пазар срещу ново строителство: къде е стойността днес",
      description: "Сравнение на доходност, разходи за довършване и кредитни условия през 2025/2026.",
      coverImage: "https://images.unsplash.com/photo-1484156818044-c040038b0710?auto=format&fit=crop&w=1200&q=80",
      category: "Анализ",
      tags: ["вторичен пазар", "ново строителство"],
      slug: "resale-vs-new-2026",
      date: iso(12),
    },
  ]

  return mocks.map((m) => ({
    ...m,
    lang,
    translationKey: m.slug,
    href: baseHref(m.slug),
    readingLabel: lang === "bg" ? "3 мин четене" : lang === "ru" ? "3 мин чтения" : "3 min read",
    readingMinutes: 3,
  }))
}

