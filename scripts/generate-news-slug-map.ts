#!/usr/bin/env tsx
/**
 * Build-time script to generate a static slug-to-translationKey map
 * This file is used by middleware (Edge Runtime) which doesn't support Node.js fs
 * Run this script during build: npm run build:slug-map or add to build process
 */

import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

const BLOG_ROOT = path.resolve(process.cwd(), 'content', 'news')
const OUTPUT_FILE = path.resolve(process.cwd(), 'lib', 'news-slug-map.json')

type BlogLang = 'en' | 'bg' | 'ru' | 'gr'
const BLOG_LANGS: BlogLang[] = ['en', 'bg', 'ru', 'gr']

interface SlugMap {
  // slug -> translationKey
  slugToKey: Record<string, string>
  // translationKey -> { lang -> slug }
  keyToSlugs: Record<string, Record<BlogLang, string>>
}

function slugifyTitle(title: string, fallback = 'post'): string {
  const transliterated = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
  const slug = transliterated
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || fallback
}

function stripExtension(filename: string) {
  return filename.replace(/\.(mdx|md)$/i, '')
}

async function loadPostMeta(lang: BlogLang) {
  const directory = path.resolve(BLOG_ROOT, lang)
  
  try {
    await fs.access(directory)
  } catch {
    return []
  }

  let files: string[] = []
  try {
    files = await fs.readdir(directory)
  } catch {
    return []
  }

  const mdFiles = files.filter((file) => /\.(mdx?|md)$/i.test(file))

  const posts = await Promise.all(
    mdFiles.map(async (file) => {
      try {
        const filePath = path.join(directory, file)
        const raw = await fs.readFile(filePath, 'utf8')
        const { data } = matter(raw)

        const title = typeof data.title === 'string' && data.title.trim() ? data.title : stripExtension(file)
        const slug = data.slug
          ? slugifyTitle(String(data.slug))
          : slugifyTitle(title, stripExtension(file))
        const translationKey =
          typeof data.translationKey === 'string' && data.translationKey.trim()
            ? data.translationKey.trim()
            : stripExtension(file)

        return { slug, translationKey, lang }
      } catch {
        return null
      }
    })
  )

  return posts.filter((post): post is { slug: string; translationKey: string; lang: BlogLang } => post !== null)
}

async function generateSlugMap() {
  console.log('[Build] Generating news slug map...')
  
  const slugToKey: Record<string, string> = {}
  const keyToSlugs: Record<string, Record<BlogLang, string>> = {}

  for (const lang of BLOG_LANGS) {
    const posts = await loadPostMeta(lang)
    for (const post of posts) {
      // Map slug -> translationKey
      slugToKey[post.slug] = post.translationKey
      
      // Map translationKey -> lang -> slug
      if (!keyToSlugs[post.translationKey]) {
        keyToSlugs[post.translationKey] = {} as Record<BlogLang, string>
      }
      keyToSlugs[post.translationKey][lang] = post.slug
    }
  }

  const map: SlugMap = {
    slugToKey,
    keyToSlugs,
  }

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(map, null, 2), 'utf8')
  console.log(`[Build] Generated slug map with ${Object.keys(slugToKey).length} slugs`)
  console.log(`[Build] Output: ${OUTPUT_FILE}`)
}

generateSlugMap().catch((error) => {
  console.error('[Build] Error generating slug map:', error)
  process.exit(1)
})
