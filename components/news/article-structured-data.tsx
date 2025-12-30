import type { BlogLang, BlogPostMeta } from "@/lib/news"
import { getSiteUrl } from "@/lib/seo"

type ArticleStructuredDataProps = {
  post: BlogPostMeta
  lang: BlogLang
  url: string
}

export function ArticleStructuredData({ post, lang, url }: ArticleStructuredDataProps) {
  const baseUrl = getSiteUrl() // Hardcoded production domain for SEO
  
  // Brand name per language
  const publisherName = lang === "bg" 
    ? "Мистър Имот" 
    : lang === "ru" 
      ? "Мистер Имот" 
      : "Mister Imot"

  // Author name and URL
  const authorName = post.author?.name || (lang === "bg" ? "Мистър Имот" : "Mister Imot")
  // Use author profile URL if available, otherwise fallback to baseUrl
  const authorUrl = post.author?.slug 
    ? `${baseUrl}/authors/${post.author.slug}`
    : baseUrl

  // Publisher logo with dimensions
  const logoUrl = "https://ik.imagekit.io/ts59gf2ul/Logo/mr-imot-logo-no-background.png?tr=w-600,h-60,fo-auto,f-webp"

  // Helper function to convert date string to ISO 8601 with timezone
  const formatDateWithTimezone = (dateString?: string): string | undefined => {
    if (!dateString) {
      // Don't set date if missing - let it be undefined to avoid misleading search engines
      // Only use fallback for drafts/unpublished posts if explicitly needed
      return undefined
    }
    // If date is already in ISO format with timezone, return as is
    if (dateString.includes('T') && (dateString.includes('+') || dateString.includes('Z') || dateString.includes('-'))) {
      return dateString
    }
    // If date is in YYYY-MM-DD format, add timezone (Bulgaria is UTC+2)
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return `${dateString}T00:00:00+02:00`
    }
    return dateString
  }

  // Article schema for Google and LLMs
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": post.title,
    "description": post.description || "",
    "image": post.coverImage ? [post.coverImage] : [],
    ...(formatDateWithTimezone(post.date) && {
      "datePublished": formatDateWithTimezone(post.date),
      "dateModified": formatDateWithTimezone(post.date),
    }),
    "author": {
      "@type": "Person",
      "name": authorName,
      "url": authorUrl,
    },
    "publisher": {
      "@type": "Organization",
      "name": publisherName,
      "logo": {
        "@type": "ImageObject",
        "url": logoUrl,
        "width": 600,
        "height": 60,
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
          // Common blog image dimensions (can be adjusted based on actual image sizes)
          "width": 1600,
          "height": 900,
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















