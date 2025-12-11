import type { Metadata } from "next"
import { brandForLang, formatTitleWithBrand } from "@/lib/seo"
import { BLOG_LANGS, type BlogLang, getAllPostsMeta } from "@/lib/blog"
import PostCard from "@/components/blog/post-card"

export const revalidate = 600
export const dynamicParams = false

type BlogIndexParams = {
  params: Promise<{ lang: BlogLang }>
}

const titleByLang: Record<BlogLang, string> = {
  en: "Mister Imot Blog – guides for buying new-build homes in Bulgaria",
  bg: "Блог на Мистър Имот – съвети за покупка на ново строителство",
  ru: "Блог Mister Imot — советы по покупке новостроек в Болгарии",
}

const descriptionByLang: Record<BlogLang, string> = {
  en: "Practical guides for buying off-plan and new-build homes directly from developers in Bulgaria.",
  bg: "Практични ръководства за покупка на имот на зелено и директно от строител в България.",
  ru: "Практичные статьи о покупке новостроек напрямую у застройщиков в Болгарии.",
}

export async function generateStaticParams() {
  return BLOG_LANGS.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: BlogIndexParams): Promise<Metadata> {
  const { lang } = await params
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://mrimot.com").replace(/\/$/, "")
  const canonical = lang === "en" ? `${baseUrl}/blog` : `${baseUrl}/${lang}/blog`
  const title = formatTitleWithBrand(titleByLang[lang], lang)
  const description = descriptionByLang[lang]
  const brand = brandForLang(lang)

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: `${baseUrl}/blog`,
        bg: `${baseUrl}/bg/blog`,
        ru: `${baseUrl}/ru/blog`,
        "x-default": `${baseUrl}/blog`,
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

export default async function BlogIndexPage({ params }: BlogIndexParams) {
  const { lang } = await params
  const posts = await getAllPostsMeta(lang)

  const heroTitle =
    lang === "bg"
      ? "Блог за покупка на ново строителство"
      : lang === "ru"
        ? "Блог о покупке новостроек"
        : "Blog about buying new-build homes"

  const heroSubtitle =
    lang === "bg"
      ? "Чеклисти, примери и практични съвети без посредници."
      : lang === "ru"
        ? "Чек-листы, примеры и практичные советы без посредников."
        : "Checklists, examples, and practical advice without intermediaries."

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-br from-charcoal-500 via-charcoal-400 to-charcoal-300 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
          <span className="inline-flex w-fit items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur">
            {brandForLang(lang)} Blog
          </span>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            {heroTitle}
          </h1>
          <p className="max-w-3xl text-base text-white/80 sm:text-lg">
            {heroSubtitle}
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-10">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-muted bg-muted/40 px-6 py-12 text-center">
            <p className="text-lg font-semibold text-foreground">
              {lang === "bg"
                ? "Все още няма публикувани статии."
                : lang === "ru"
                  ? "Статей пока нет."
                  : "No articles yet."}
            </p>
            <p className="mt-2 text-muted-foreground">
              {lang === "bg"
                ? "Добавете първата публикация във /content/blog."
                : lang === "ru"
                  ? "Добавьте первую статью в /content/blog."
                  : "Add your first post under /content/blog."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={`${post.lang}-${post.slug}`} post={post} lang={lang} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

