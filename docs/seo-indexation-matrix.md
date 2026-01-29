# SEO Indexation Matrix and Internal Linking

Reference for indexable vs noindex routes, canonical targets, and internal linking gaps.

See [seo-architecture.md](seo-architecture.md) for query-param taxonomy and sitemap design.

---

## 1. Indexation Matrix table

| Route                                                                | Supported query params                                                                      | INDEXABLE                                                        | NOINDEX                                                                              | Canonical target                               | Implemented in                                                                                                                                          |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Listings index** (`/listings`, `/bg/obiavi`, etc.)                 | `page`, `type`, `city`, `city_key`, `ne_lat`, `sw_lat`, `ne_lng`, `sw_lng`, `search_by_map` | Base URL only (no params)                                        | `page`>1, `type`≠all, any bounds, any `search_by_map`, any `city`/`city_key` (query) | Base listings or city hub (when city in query) | [app/(public)/[lang]/listings/page.tsx](../app/(public)/[lang]/listings/page.tsx) + [lib/seo-indexation.ts](../lib/seo-indexation.ts) `getListingsIndexation` |
| **City hub** (`/listings/c/[cityKey]`, e.g. `/bg/obiavi/c/sofia-bg`) | `type`, `page`                                                                              | Hub URL only (no params), city in registry + has active listings | `type`≠all or `page`>1; unknown city or no listings                                  | Hub base (no query)                            | [app/(public)/[lang]/listings/c/[cityKey]/page.tsx](../app/(public)/[lang]/listings/c/[cityKey]/page.tsx)                                                  |
| **Listing detail** (`/listings/p/[slug]`)                            | (none)                                                                                      | Active listing                                                   | Paused / deleted                                                                     | Self (slug)                                    | [app/(public)/[lang]/listings/p/[slug]/page.tsx](../app/(public)/[lang]/listings/p/[slug]/page.tsx)                                                        |
| **Developers index** (`/developers`, `/bg/stroiteli`, etc.)          | `page`                                                                                      | Page 1 only                                                      | Page > 1                                                                             | Base developers                                | [app/(public)/[lang]/(pages)/developers/page.tsx](../app/(public)/[lang]/(pages)/developers/page.tsx)                                                      |
| **Developer detail** (`/developers/[slug]`)                          | (none)                                                                                      | All (if developer exists)                                        | 404 if not found                                                                     | Self                                           | [app/(public)/[lang]/(pages)/developers/[slug]/page.tsx](../app/(public)/[lang]/(pages)/developers/[slug]/page.tsx)                                        |
| **News index** (`/news`, `/bg/novini`, etc.)                         | `page`, `q`, `category`, `tag`                                                              | Page 1, no filters                                               | Page > 1 **or** any `q`/`category`/`tag`                                             | Base news                                      | [app/(public)/[lang]/(pages)/news/page.tsx](../app/(public)/[lang]/(pages)/news/page.tsx) + [lib/seo-indexation.ts](../lib/seo-indexation.ts) `getNewsIndexation` |
| **News detail** (`/news/[slug]`)                                     | (none)                                                                                      | All (if post exists)                                             | 404 if not found                                                                     | Self                                           | [app/(public)/[lang]/(pages)/news/[slug]/page.tsx](../app/(public)/[lang]/(pages)/news/[slug]/page.tsx)                                                    |

Rules applied: page>1 → noindex + canonical to page 1; map/bounds → noindex + canonical to base or city hub; search/filters (news `q`/`category`/`tag`) → noindex + canonical to base; city_key in query on listings index → noindex + canonical to city hub.

---

## 2. Mismatches and exact fixes

- **News index: `q`, `category`, `tag` not applied**  
  [seo-architecture.md](seo-architecture.md) (lines 39–45) and the taxonomy say: only page 1 with no filters is indexable; `q`, `category`, `tag` should force noindex + canonical to base.  
  **Current:** News page `generateMetadata` used only `currentPage <= 1` for `indexNews`; it did not read `q`, `category`, or `tag` from `searchParams`. So `/news?q=foo` or `/news?category=X` was indexable.  
  **Fix (implemented):**
  1. [lib/seo-indexation.ts](../lib/seo-indexation.ts): added `q?`, `category?`, `tag?` to `NewsIndexationParams`; in `getNewsIndexation`, set `index = validPage <= 1 && !params.q && !params.category && !params.tag`; keep `canonicalPath = baseNewsPath`.
  2. News page `generateMetadata`: pass `q`, `category`, `tag` from `searchParams` into `getNewsIndexation` and use its `index` and `canonicalPath` for `robots.index` and `alternates.canonical`.

- **Listings / city hub / developers index / listing detail / developer detail / news detail**  
  No further mismatches: behavior matches the matrix.

---

## 3. Internal linking gaps

1. **City hubs beyond Sofia / Plovdiv / Varna**  
   Sitemap includes cities from API. [components/listings/explore-by-city-strip.tsx](../components/listings/explore-by-city-strip.tsx) and [components/home/top-cities.tsx](../components/home/top-cities.tsx) use `TOP_CITY_KEYS = ["sofia-bg", "plovdiv-bg", "varna-bg"]` only. Any other city hubs are discoverable only via sitemap or direct URL.

2. **News index/detail**  
   [components/news/related-articles.tsx](../components/news/related-articles.tsx) is SSR and links to other articles. Optional gap: explicit “Back to News” or “More in [category]” linking to news index (or category) if not already present in the layout.

3. **Developer detail**  
   [DeveloperListingsGridServer](../app/(public)/[lang]/(pages)/developers/[slug]/developer-listings-grid-server.tsx) links to listings only. No SSR links to city hubs (e.g. “Projects in Sofia | Plovdiv | Varna”); discovery is via developers index and sitemap.

4. **Policy / utility pages**  
   Privacy, terms, cookie policy are linked from footer only; acceptable and no change required unless you want more prominence.

---

## 4. Proposed SSR link additions (3–5, conservative)

1. **News index noindex for filters** — Covered in section 2 (indexation). No new links.

2. **City hubs: “More cities” or extend Explore by city**  
   **Option A:** Add a small SSR block on the listings index that lists city hub links for the same cities returned by the cities sitemap (e.g. call `apiClient.getCities(10)` or reuse a shared server function). Render 3–10 `Link`s to `cityListingsHref(lang, city_key)` below or beside [ExploreByCityStrip](../components/listings/explore-by-city-strip.tsx) in [app/(public)/[lang]/listings/page.tsx](../app/(public)/[lang]/listings/page.tsx).  
   **Option B:** Extend `TOP_CITY_KEYS` in [ExploreByCityStrip](../components/listings/explore-by-city-strip.tsx) and [TopCities](../components/home/top-cities.tsx) with 1–3 more city_keys from [lib/city-registry.ts](../lib/city-registry.ts) when the registry exposes more.  
   **Recommendation:** Option A if API returns more than 3 cities; otherwise Option B when registry grows.

3. **News article: “View all news” / “More in [category]”**  
   In [app/(public)/[lang]/(pages)/news/[slug]/page.tsx](../app/(public)/[lang]/(pages)/news/[slug]/page.tsx), ensure there is an SSR link back to the news index (and optionally to `?category=X` if category exists). Add one `Link` to `newsHref(lang)` (and optionally category URL) in the article footer or above/below RelatedArticles if not already present.

4. **Developer detail: “Explore by city” strip**  
   In [app/(public)/[lang]/(pages)/developers/[slug]/page.tsx](../app/(public)/[lang]/(pages)/developers/[slug]/page.tsx), add an SSR section that links to the main city hubs (e.g. Sofia, Plovdiv, Varna) via `cityListingsHref(lang, cityKey)`, reusing the same city keys as TopCities/ExploreByCityStrip. Label e.g. “Listings in Sofia”, “Listings in Plovdiv”, “Listings in Varna”. Implementation: small server component or inline list of 3 `Link`s next to or above [DeveloperListingsGridServer](../app/(public)/[lang]/(pages)/developers/[slug]/developer-listings-grid-server.tsx).

5. **No “related developers” for now**  
   Skip unless you add a backend or heuristic for related developers; keep scope to the above.
