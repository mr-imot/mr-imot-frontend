/**
 * Build-time script to generate a static news index for sitemap
 * This avoids runtime filesystem reads in serverless environments
 * Run: node scripts/generate-news-index.js
 */

const fs = require('fs').promises
const path = require('path')
const matter = require('gray-matter')

const BLOG_ROOT = path.resolve(process.cwd(), 'content', 'news')
const OUTPUT_DIR = path.resolve(process.cwd(), 'content', 'generated')
const OUTPUT_FILE = path.resolve(OUTPUT_DIR, 'news-index.json')
const BLOG_LANGS = ['en', 'bg', 'ru', 'gr']

// URL path patterns for each language
const URL_PATH_PATTERNS = {
  en: (slug) => `/news/${slug}`,
  bg: (slug) => `/bg/novini/${slug}`,
  ru: (slug) => `/ru/novosti/${slug}`,
  gr: (slug) => `/gr/eidhseis/${slug}`,
}

// Cyrillic transliteration map (simplified version)
const cyrillicMap = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo',
  ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm',
  н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
  ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sht',
  ъ: 'a', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

function transliterate(value) {
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

function slugifyTitle(title, fallback = 'post') {
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

function stripExtension(filename) {
  return filename.replace(/\.(mdx|md)$/i, '')
}

/**
 * Get file modification time as ISO string
 */
async function getFileMtime(filePath) {
  try {
    const stats = await fs.stat(filePath)
    return new Date(stats.mtimeMs).toISOString()
  } catch {
    return new Date().toISOString()
  }
}

/**
 * Parse date from frontmatter or return null
 */
function parseDate(dateValue) {
  if (!dateValue) return null
  if (typeof dateValue !== 'string') return null
  
  const date = new Date(dateValue)
  if (isNaN(date.getTime())) return null
  
  return date.toISOString()
}

/**
 * Load and process all posts for a language
 */
async function loadPostsForLang(lang) {
  const directory = path.resolve(BLOG_ROOT, lang)
  
  // Check if directory exists
  try {
    await fs.access(directory)
  } catch (error) {
    console.warn(`[News Index] Directory does not exist for ${lang}: ${directory}`)
    return []
  }

  let files = []
  try {
    files = await fs.readdir(directory)
  } catch (error) {
    console.error(`[News Index] Error reading directory for ${lang}:`, error)
    return []
  }

  const mdFiles = files.filter((file) => /\.(mdx?|md)$/i.test(file))

  if (mdFiles.length === 0) {
    console.warn(`[News Index] No MDX/MD files found for ${lang}`)
    return []
  }

  const posts = await Promise.all(
    mdFiles.map(async (file) => {
      try {
        const filePath = path.join(directory, file)
        const raw = await fs.readFile(filePath, 'utf8')
        const { data, content } = matter(raw)

        // Extract slug: prefer frontmatter, fallback to filename
        // If frontmatter slug exists, normalize it (don't slugify as if it were a title)
        let slug
        if (data.slug) {
          // Normalize existing slug: trim, lowercase, validate format
          const normalized = String(data.slug).trim().toLowerCase()
          // Basic validation: should be alphanumeric with hyphens
          if (/^[a-z0-9-]+$/.test(normalized)) {
            slug = normalized
          } else {
            // If invalid format, fall back to slugifying it
            console.warn(`[News Index] Invalid slug format in ${file}, slugifying: ${data.slug}`)
            slug = slugifyTitle(normalized, stripExtension(file))
          }
        } else {
          // No frontmatter slug, generate from filename
          slug = slugifyTitle(
            stripExtension(file),
            stripExtension(file)
          )
        }

        // Extract date: prefer updated/lastmod over date, fallback to file mtime
        const frontmatterDate =
          parseDate(data.updated) ||
          parseDate(data.lastmod) ||
          parseDate(data.date)
        const fileMtime = await getFileMtime(filePath)
        const lastmod = frontmatterDate || fileMtime

        // Build URL path
        const urlPath = URL_PATH_PATTERNS[lang](slug)

        return {
          lang,
          slug,
          urlPath,
          lastmod,
        }
      } catch (error) {
        console.error(`[News Index] Error processing file ${file} for ${lang}:`, error)
        return null
      }
    })
  )

  // Filter out null results and sort for deterministic output
  return posts
    .filter((post) => post !== null)
    .sort((a, b) => {
      // Sort by lang first, then slug
      if (a.lang !== b.lang) return a.lang.localeCompare(b.lang)
      return a.slug.localeCompare(b.slug)
    })
}

/**
 * Main function to generate the news index
 */
async function generateNewsIndex() {
  console.log('[News Index] Starting generation...')
  console.log(`[News Index] BLOG_ROOT: ${BLOG_ROOT}`)

  // Ensure output directory exists
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true })
  } catch (error) {
    console.error(`[News Index] Failed to create output directory:`, error)
    process.exit(1)
  }

  // Load posts for all languages
  const allPosts = []
  for (const lang of BLOG_LANGS) {
    const posts = await loadPostsForLang(lang)
    allPosts.push(...posts)
    console.log(`[News Index] Found ${posts.length} posts for ${lang}`)
  }

  // Create index structure
  const index = {
    generatedAt: new Date().toISOString(),
    totalPosts: allPosts.length,
    posts: allPosts,
  }

  // Write to file
  try {
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(index, null, 2), 'utf8')
    console.log(`[News Index] Successfully generated index with ${allPosts.length} posts`)
    console.log(`[News Index] Output: ${OUTPUT_FILE}`)
  } catch (error) {
    console.error(`[News Index] Failed to write index file:`, error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  generateNewsIndex().catch((error) => {
    console.error('[News Index] Fatal error:', error)
    process.exit(1)
  })
}

module.exports = { generateNewsIndex }
