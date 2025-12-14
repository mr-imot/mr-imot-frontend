import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import { compileMDX } from 'next-mdx-remote/rsc'
import { cache } from 'react'
import type React from 'react'
import { mdxComponents } from '@/components/news/mdx-components'

export type BlogLang = 'en' | 'bg' | 'ru' | 'gr'

export type BlogFrontMatter = {
  title: string
  description?: string
  date?: string
  coverImage?: string
  coverImageAlt?: string
  category?: string
  tags?: string[]
  author?: {
    name?: string
    avatar?: string
    role?: string
  }
  slug?: string
  translationKey?: string
}

export type BlogPostMeta = BlogFrontMatter & {
  slug: string
  translationKey: string
  lang: BlogLang
  filePath: string
  readingMinutes: number
  readingLabel: string
}

export type BlogPost = BlogPostMeta & {
  content: React.ReactNode
}

export const BLOG_LANGS: BlogLang[] = ['en', 'bg', 'ru', 'gr']

// Use the shared news content directory across locales
const BLOG_ROOT = path.join(process.cwd(), 'content', 'news')
const WORDS_PER_MINUTE = 200

const cyrillicMap: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'yo',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sht',
  ъ: 'a',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
}

function transliterate(value: string) {
  return value
    .split('')
    .map((char) => {
      const lower = char.toLowerCase()
      const mapped = cyrillicMap[lower]
      if (!mapped) return char
      return char === lower ? mapped : mapped.charAt(0).toUpperCase() + mapped.slice(1)
    })
    .join('')
}

function slugifyTitle(title: string, fallback = 'post') {
  const transliterated = transliterate(title)
  const ascii = transliterated
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
  const slug = ascii
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || fallback
}

function formatReadingLabel(lang: BlogLang, minutes: number) {
  const rounded = Math.max(1, Math.round(minutes))
  if (lang === 'bg') return `${rounded} мин четене`
  if (lang === 'ru') return `${rounded} мин чтения`
  if (lang === 'gr') return `${rounded} λεπτά ανάγνωσης`
  return `${rounded} min read`
}

function computeReadingMinutes(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return words / WORDS_PER_MINUTE
}

function normalizeTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag)).filter(Boolean)
  }
  if (typeof value === 'string') {
    return value.split(',').map((tag) => tag.trim()).filter(Boolean)
  }
  return []
}

function normalizeAuthor(value: unknown): BlogFrontMatter['author'] {
  if (typeof value === 'object' && value !== null) {
    const author = value as Record<string, unknown>
    return {
      name: typeof author.name === 'string' ? author.name : undefined,
      avatar: typeof author.avatar === 'string' ? author.avatar : undefined,
      role: typeof author.role === 'string' ? author.role : undefined,
    }
  }
  return undefined
}

function stripExtension(filename: string) {
  return filename.replace(/\.(mdx|md)$/i, '')
}

function buildBlogPath(lang: BlogLang, slug?: string) {
  const base =
    lang === 'en'
      ? '/news'
      : lang === 'bg'
        ? '/bg/novini'
        : lang === 'ru'
          ? '/ru/novosti'
          : '/gr/eidhseis'

  if (!slug) return base
  return `${base}/${slug}`
}

export function formatBlogDate(date: string | undefined, lang: BlogLang) {
  if (!date) return ''
  const formatter = new Intl.DateTimeFormat(
    lang === 'bg' ? 'bg-BG' : lang === 'ru' ? 'ru-RU' : 'en-US',
    { dateStyle: 'long' }
  )
  try {
    return formatter.format(new Date(date))
  } catch {
    return date
  }
}

const loadPostMeta = cache(async (lang: BlogLang): Promise<BlogPostMeta[]> => {
  const directory = path.join(BLOG_ROOT, lang)

  let files: string[] = []
  try {
    files = await fs.readdir(directory)
  } catch {
    return []
  }

  const mdFiles = files.filter((file) => /\.(mdx?|md)$/i.test(file))

  const posts = await Promise.all(
    mdFiles.map(async (file) => {
      const filePath = path.join(directory, file)
      const raw = await fs.readFile(filePath, 'utf8')
      const { data, content } = matter(raw)

      const title = typeof data.title === 'string' && data.title.trim() ? data.title : stripExtension(file)
      const slug = data.slug
        ? slugifyTitle(String(data.slug))
        : slugifyTitle(title, stripExtension(file))
      const translationKey =
        typeof data.translationKey === 'string' && data.translationKey.trim()
          ? data.translationKey.trim()
          : stripExtension(file)

      const readingMinutes = computeReadingMinutes(content)

      return {
        title,
        description: typeof data.description === 'string' ? data.description : undefined,
        date: typeof data.date === 'string' ? data.date : undefined,
        coverImage: typeof data.coverImage === 'string' ? data.coverImage : undefined,
        coverImageAlt: typeof data.coverImageAlt === 'string' ? data.coverImageAlt : undefined,
        category: typeof data.category === 'string' ? data.category : undefined,
        tags: normalizeTags(data.tags),
        author: normalizeAuthor(data.author),
        slug,
        translationKey,
        lang,
        filePath,
        readingMinutes,
        readingLabel: formatReadingLabel(lang, readingMinutes),
      } satisfies BlogPostMeta
    })
  )

  return posts.sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0
    const dateB = b.date ? new Date(b.date).getTime() : 0
    return dateB - dateA
  })
})

export async function getAllPostsMeta(lang: BlogLang) {
  return loadPostMeta(lang)
}

export async function getPostBySlug(lang: BlogLang, slug: string): Promise<BlogPost | null> {
  const posts = await getAllPostsMeta(lang)
  const match = posts.find((post) => post.slug === slug)
  if (!match) return null

  const raw = await fs.readFile(match.filePath, 'utf8')

  const result = await compileMDX<BlogFrontMatter>({
    source: raw,
    components: mdxComponents,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
        ],
        development: process.env.NODE_ENV === 'development',
      },
    },
  })

  // Explicitly extract only content and frontmatter to avoid any internal properties
  const { content, frontmatter } = result

  return {
    ...match,
    ...frontmatter,
    slug: match.slug,
    translationKey: match.translationKey,
    lang,
    content: content as React.ReactNode,
  }
}

export async function getAlternateSlugs(translationKey: string) {
  const map: Partial<Record<BlogLang, string>> = {}
  await Promise.all(
    BLOG_LANGS.map(async (lang) => {
      const posts = await getAllPostsMeta(lang)
      const found = posts.find((post) => post.translationKey === translationKey)
      if (found) {
        map[lang] = found.slug
      }
    })
  )
  return map
}

export function getCanonicalUrl(baseUrl: string, lang: BlogLang, slug?: string) {
  const cleaned = baseUrl.replace(/\/$/, '')
  return `${cleaned}${buildBlogPath(lang, slug)}`
}

export function getRelativeUrl(lang: BlogLang, slug?: string) {
  return buildBlogPath(lang, slug)
}

