/**
 * Build-time script to generate a static slug-to-translationKey map
 * This file is used by middleware (Edge Runtime) which doesn't support Node.js fs
 * Run: node scripts/generate-news-slug-map.js
 */

const fs = require('fs').promises
const path = require('path')
const matter = require('gray-matter')

const BLOG_ROOT = path.resolve(process.cwd(), 'content', 'news')
const OUTPUT_FILE = path.resolve(process.cwd(), 'lib', 'news-slug-map.json')
const BLOG_LANGS = ['en', 'bg', 'ru', 'gr']

function slugifyTitle(title, fallback = 'post') {
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

function stripExtension(filename) {
  return filename.replace(/\.(mdx|md)$/i, '')
}

async function getLatestFileMtime(directory) {
  try {
    const files = await fs.readdir(directory)
    const mdFiles = files.filter((file) => /\.(mdx?|md)$/i.test(file))
    
    if (mdFiles.length === 0) return 0
    
    const mtimes = await Promise.all(
      mdFiles.map(async (file) => {
        try {
          const filePath = path.join(directory, file)
          const stats = await fs.stat(filePath)
          return stats.mtimeMs
        } catch {
          return 0
        }
      })
    )
    
    return Math.max(...mtimes, 0)
  } catch {
    return 0
  }
}

async function loadPostMeta(lang) {
  const directory = path.resolve(BLOG_ROOT, lang)
  
  try {
    await fs.access(directory)
  } catch {
    return []
  }

  let files = []
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

  return posts.filter((post) => post !== null)
}

async function shouldRegenerate() {
  // Always regenerate in production builds
  if (process.env.NODE_ENV === 'production') {
    return true
  }

  try {
    const outputStats = await fs.stat(OUTPUT_FILE)
    const outputMtime = outputStats.mtimeMs

    // Check if any news file is newer than the output
    for (const lang of BLOG_LANGS) {
      const directory = path.resolve(BLOG_ROOT, lang)
      try {
        await fs.access(directory)
        const latestMtime = await getLatestFileMtime(directory)
        if (latestMtime > outputMtime) {
          return true
        }
      } catch {
        // Directory doesn't exist, skip
      }
    }

    return false
  } catch {
    // Output file doesn't exist, need to generate
    return true
  }
}

async function generateSlugMap() {
  const needsRegeneration = await shouldRegenerate()
  
  if (!needsRegeneration) {
    console.log('[Build] News slug map is up to date, skipping generation')
    return
  }

  console.log('[Build] Generating news slug map...')
  
  const slugToKey = {}
  const keyToSlugs = {}

  for (const lang of BLOG_LANGS) {
    const posts = await loadPostMeta(lang)
    for (const post of posts) {
      // Map slug -> translationKey
      slugToKey[post.slug] = post.translationKey
      
      // Map translationKey -> lang -> slug
      if (!keyToSlugs[post.translationKey]) {
        keyToSlugs[post.translationKey] = {}
      }
      keyToSlugs[post.translationKey][lang] = post.slug
    }
  }

  const map = {
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
