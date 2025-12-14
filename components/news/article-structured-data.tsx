"use client"

import type { BlogLang, BlogPostMeta } from "@/lib/news"

type ArticleStructuredDataProps = {
  post: BlogPostMeta
  lang: BlogLang
  url: string
}

export function ArticleStructuredData({ post, lang, url }: ArticleStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mrimot.com"
  
  // Brand name per language
  const publisherName = lang === "bg" 
    ? "Мистър Имот" 
    : lang === "ru" 
      ? "Мистер Имот" 
      : "Mister Imot"

  // Author name
  const authorName = post.author?.name || (lang === "bg" ? "Мистър Имот" : "Mister Imot")

  // Publisher logo
  const logoUrl = "https://ik.imagekit.io/ts59gf2ul/Logo/mr-imot-logo-no-background.png?tr=w-600,h-60,fo-auto,f-webp"

  // Article schema for Google and LLMs
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": post.title,
    "description": post.description || "",
    "image": post.coverImage ? [post.coverImage] : [],
    "datePublished": post.date || new Date().toISOString().split("T")[0],
    "dateModified": post.date || new Date().toISOString().split("T")[0],
    "author": {
      "@type": "Person",
      "name": authorName,
      "url": baseUrl,
    },
    "publisher": {
      "@type": "Organization",
      "name": publisherName,
      "logo": {
        "@type": "ImageObject",
        "url": logoUrl,
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url,
    },
    "inLanguage": lang === "gr" ? "el" : lang,
    "articleSection": post.category || "News",
    "keywords": post.tags?.join(", ") || "",
    "wordCount": Math.round(post.readingMinutes * 200), // Approximate word count
  }

  // Breadcrumb schema
  const newsIndexUrl = lang === "en"
    ? `${baseUrl}/news`
    : lang === "bg"
      ? `${baseUrl}/bg/novini`
      : lang === "ru"
        ? `${baseUrl}/ru/novosti`
        : `${baseUrl}/gr/eidhseis`

  const breadcrumbLabels = {
    home: lang === "bg" ? "Начало" : lang === "ru" ? "Главная" : lang === "gr" ? "Αρχική" : "Home",
    news: lang === "bg" ? "Новини" : lang === "ru" ? "Новости" : lang === "gr" ? "Ειδήσεις" : "News",
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": breadcrumbLabels.home,
        "item": lang === "en" ? baseUrl : `${baseUrl}/${lang}`,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": breadcrumbLabels.news,
        "item": newsIndexUrl,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": url,
      },
    ],
  }

  // WebPage schema for additional context
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": post.title,
    "description": post.description || "",
    "url": url,
    "inLanguage": lang === "gr" ? "el" : lang,
    "isPartOf": {
      "@type": "WebSite",
      "name": publisherName,
      "url": baseUrl,
    },
    "primaryImageOfPage": post.coverImage
      ? {
          "@type": "ImageObject",
          "url": post.coverImage,
        }
      : undefined,
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["article h1", "article .prose p:first-of-type"],
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
    </>
  )
}





