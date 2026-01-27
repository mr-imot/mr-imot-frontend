import type { Metadata } from "next"
import { notFound } from "next/navigation"
import BlogPostLayout from "@/components/news/blog-post-layout"
import { ArticleAlternateSlugs } from "@/components/news/article-alternate-slugs"
import { ArticleStructuredData } from "@/components/news/article-structured-data"
import { RelatedArticles } from "@/components/news/related-articles"
import {
  BLOG_LANGS,
  type BlogLang,
  getAllPostsMeta,
  getAlternateSlugs,
  getPostBySlug,
} from "@/lib/news"
import { getDictionary } from "@/lib/dictionaries"
import { brandForLang, formatTitleWithBrand, getSiteUrl } from "@/lib/seo"
import type { SupportedLocale } from "@/lib/routes"

export const revalidate = 600
export const dynamicParams = false

type BlogPostParams = {
  params: Promise<{ lang: BlogLang; slug: string }>
}

export async function generateStaticParams() {
  const all = await Promise.all(
    BLOG_LANGS.map(async (lang) => {
      const posts = await getAllPostsMeta(lang)
      return posts.map((post) => ({ lang, slug: post.slug }))
    })
  )

  return all.flat()
}

export async function generateMetadata({ params }: BlogPostParams): Promise<Metadata> {
  const { lang, slug } = await params
  const post = await getPostBySlug(lang, slug)
  if (!post) return {}

  const baseUrl = getSiteUrl() // Hardcoded production domain for canonical URLs
  const alternates = await getAlternateSlugs(post.translationKey)

  // Use English slug for x-default (the default language)
  const englishSlug = alternates.en || slug

  const languages: Record<string, string> = {
    en: `${baseUrl}/news/${alternates.en || slug}`,
    bg: `${baseUrl}/bg/novini/${alternates.bg || slug}`,
    ru: `${baseUrl}/ru/novosti/${alternates.ru || slug}`,
    el: `${baseUrl}/gr/eidhseis/${alternates.gr || slug}`,
    "x-default": `${baseUrl}/news/${englishSlug}`,
  }
  
  // Canonical URL: use el for Greek (gr is internal only)
  const canonical =
    languages[lang === "gr" ? "el" : lang] || languages[lang] || languages["x-default"]

  const title = formatTitleWithBrand(post.title, lang)
  const description = post.description
  const brand = brandForLang(lang)

  // Author name based on language
  const authorName = post.author?.name || (lang === "bg" ? "Мистър Имот" : "Mister Imot")

  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: brand,
      type: "article",
      locale: lang === "bg" ? "bg_BG" : lang === "ru" ? "ru_RU" : lang === "gr" ? "el_GR" : "en_US",
      publishedTime: post.date || undefined,
      modifiedTime: post.date || undefined,
      authors: [authorName],
      section: post.category || "News",
      tags: post.tags || [],
      images: post.coverImage
        ? [
            {
              url: post.coverImage,
              width: 1200,
              height: 630,
              alt: post.coverImageAlt || post.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostParams) {
  const { lang, slug } = await params
  const post = await getPostBySlug(lang, slug)

  // Middleware handles slug translation with 301 redirects
  // If we reach here and post is null, it's a genuine 404
  if (!post) {
    return notFound()
  }

  const dict = await getDictionary(lang)

  // Get alternate slugs for language switching
  const alternateSlugs = await getAlternateSlugs(post.translationKey)

  // Build canonical URL for structured data
  const baseUrl = getSiteUrl() // Hardcoded production domain for canonical URLs
  const articleUrl = lang === "en"
    ? `${baseUrl}/news/${slug}`
    : lang === "bg"
      ? `${baseUrl}/bg/novini/${slug}`
      : lang === "ru"
        ? `${baseUrl}/ru/novosti/${slug}`
        : `${baseUrl}/gr/eidhseis/${slug}`

  return (
    <div key={`article-${slug}-${lang}`}>
      <ArticleStructuredData post={post} lang={lang} url={articleUrl} />
      <ArticleAlternateSlugs slugs={alternateSlugs} />
      <BlogPostLayout post={post} lang={lang}>
        {post.content}
      </BlogPostLayout>
      <RelatedArticles
        lang={lang as SupportedLocale}
        currentSlug={slug}
        currentMeta={{ tags: post.tags, category: post.category, date: post.date }}
        dict={dict}
      />
    </div>
  )
}

