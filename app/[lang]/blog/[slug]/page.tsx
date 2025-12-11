import type { Metadata } from "next"
import { notFound } from "next/navigation"
import BlogPostLayout from "@/components/blog/blog-post-layout"
import {
  BLOG_LANGS,
  type BlogLang,
  getAllPostsMeta,
  getAlternateSlugs,
  getPostBySlug,
} from "@/lib/blog"
import { brandForLang, formatTitleWithBrand } from "@/lib/seo"

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

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://mrimot.com").replace(/\/$/, "")
  const alternates = await getAlternateSlugs(post.translationKey)

  const languages = {
    en: `${baseUrl}/blog/${alternates.en || slug}`,
    bg: `${baseUrl}/bg/blog/${alternates.bg || slug}`,
    ru: `${baseUrl}/ru/blog/${alternates.ru || slug}`,
    "x-default": `${baseUrl}/blog/${alternates.en || slug}`,
  }
  const canonical = languages[lang]

  const title = formatTitleWithBrand(post.title, lang)
  const description = post.description
  const brand = brandForLang(lang)

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
      images: post.coverImage
        ? [
            {
              url: post.coverImage,
              width: 1200,
              height: 630,
              alt: post.title,
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

  if (!post) {
    return notFound()
  }

  return (
    <BlogPostLayout post={post} lang={lang}>
      {post.content}
    </BlogPostLayout>
  )
}

