# SEO Verification Report — Production (https://mrimot.com)

**Date**: 2026-01-28  
**Base URL**: https://mrimot.com | **API**: https://api.mrimot.com

---

## 1) Smoke test script

Script was not run in this environment (bash/WSL unavailable on Windows). Individual curl/Invoke-WebRequest checks below replicate the script logic.

**Smoke test**: **Not run** (manual checks performed instead).

---

## 2) Sitemap verification

### curl -s https://mrimot.com/sitemap.xml | grep -E "<loc>.*(static|news)\.xml</loc>" -n

**Result**: No matches. Production sitemap index does **not** include `static.xml` or `news.xml` entries.

**Actual index content** (excerpt):
```xml
<sitemap><loc>https://mrimot.com/sitemaps/en/cities.xml</loc>...
<sitemap><loc>https://mrimot.com/sitemaps/en/developers.xml</loc>...
<sitemap><loc>https://mrimot.com/sitemaps/en/projects/1.xml</loc>...
... (bg, ru, gr locale sitemaps only)
</sitemapindex>
```

**Conclusion**: Backend serving the index in production is likely an older deploy that does not include the static/news index entries (current code in repo has them at `routes.py` lines 199–207). Alternatively, frontend proxy cache (revalidate 3600) may be serving a stale index.

### curl -I https://mrimot.com/sitemaps/static.xml

**Result**: **200 OK**  
- `Content-Type: application/xml`  
- `Content-Length: 12841`  
- `X-Matched-Path: /sitemap/static/sitemap.xml` (Next.js rewrite)

### curl -I https://mrimot.com/sitemaps/news.xml

**Result**: **200 OK**  
- `Content-Type: application/xml`  
- `Content-Length: 46061`  
- `X-Matched-Path: /sitemap/news/sitemap.xml` (Next.js)

### (a) Sitemap index includes static.xml and news.xml

**FAIL**. Production index only lists locale sitemaps (en/bg/ru/gr cities, developers, projects). No `.../sitemaps/static.xml` or `.../sitemaps/news.xml`. Redeploy backend and/or purge frontend cache so the index includes these entries.

### (b) static.xml valid urlset with homepage + listings/dev/news per locale

**PASS**. Body is valid `<urlset>` with multiple `<url><loc>...</loc></url>`. Contains homepage (https://mrimot.com, /bg, /ru, /gr), listings, developers, news, about, contact and locale variants (e.g. /bg/obiavi, /bg/stroiteli).

### (c) news.xml non-empty with actual news article URLs

**PASS**. Body is valid `<urlset>` with many `<url>` entries. Example `<loc>`: `https://mrimot.com/news/100-a-month-compounding`, `https://mrimot.com/news/complete-guide-buying-off-plan-apartments`, plus hreflang alternates (e.g. /bg/novini/..., /ru/novosti/...). **Source**: Next.js handler `app/sitemap/news/sitemap.ts` using `getNewsPostsForLang()` from `@/lib/news-index` (MDX/news index). Not empty in prod.

---

## 3) Indexation rules (robots + canonical)

| URL | robots | canonical |
|-----|--------|-----------|
| `/listings?page=2` | `noindex, follow` | `https://mrimot.com/listings` |
| `/listings?type=apartments` | `noindex, follow` | `https://mrimot.com/listings` |
| `/news?page=2` | `noindex, follow` | `https://mrimot.com/news?page=2` **(should be base)** |
| `/maintenance` | `noindex, nofollow` | `https://mrimot.com/maintenance` |

**Listings (page=2, type=apartments)**: **PASS** — noindex and canonical to base.  
**News page=2**: **Partial** — noindex correct; canonical is currently `https://mrimot.com/news?page=2`. Per plan, page 2+ should have canonical to base `https://mrimot.com/news` (no query). Fix: in `app/(public)/[lang]/(pages)/news/page.tsx` set canonical for page > 1 to `baseCanonical` only.  
**Maintenance**: **PASS** — noindex, nofollow, canonical /maintenance.

**BG locale**: Not re-tested; same logic applies (noindex + canonical to base for listings/news page 2 and type filter).

---

## 4) City hub empty + non-empty

### sofia-bg (with listings)

- **Page**: `https://mrimot.com/listings/c/sofia-bg`  
  - `robots`: `index, follow`  
  - `canonical`: `https://mrimot.com/listings/c/sofia-bg`
- **API**: `curl -s https://api.mrimot.com/api/v1/cities/sofia-bg/status`  
  - `{"city_key":"sofia-bg","has_active_listings":true}`

**PASS**.

### zzzz-test-city (unknown / no listings)

- **Page**: `https://mrimot.com/listings/c/zzzz-test-city`  
  - `robots`: `noindex, follow`  
  - `canonical`: `https://mrimot.com/listings/c/zzzz-test-city`
- **API**: `curl -s https://api.mrimot.com/api/v1/cities/zzzz-test-city/status`  
  - `404` — city not found (expected).

**PASS** — unknown city gets noindex; status endpoint 404 for non-existent city.

---

## 5) MoreFromDeveloper

- **API**: `GET /api/v1/projects/?developer_id=0f493a6c-a389-4e54-b264-c98bac71e87c&per_page=7`  
  - Returns **5** projects; all have `developer_id=0f493a6c-a389-4e54-b264-c98bac71e87c`.  
  - Filter by developer works; all returned are same developer.
- **Status**: Backend returns ACTIVE (and, when `developer_id` is set, ACTIVE+PAUSED per current service logic). No `status` field in response body; API does not expose status in list response. Sitemap/list logic uses `Project.status == ACTIVE`; public projects list with `developer_id` uses ACTIVE+PAUSED.
- **Block on listing page**: Listing `https://mrimot.com/listings/p/sgrada-shepa-oblast-sofiia-580b6104` was fetched; initial HTML did not contain the string `"More from this developer"` or the section `aria-label`. Block may be rendered client-side or conditional; API correctness is confirmed.

**MoreFromDeveloper API**: **PASS** (same-developer filter, multiple projects returned).  
**Block visibility**: Not confirmed in initial HTML (may be client-only or SSR with different markup).

---

## Pass/fail summary

| Check | Result |
|-------|--------|
| **Smoke test** | Not run (script requires bash). Manual equivalents: see above. |
| **Sitemap index** | **FAIL** — static.xml and news.xml missing from index (likely old backend deploy or cached index). |
| **News sitemap non-empty** | **PASS** — Next.js serves news.xml with many article URLs. |
| **Robots+canonical (4 URLs)** | **Partial** — Listings page=2, type=apartments, maintenance: PASS. News page=2: noindex PASS, canonical should be base /news (fix in news page.tsx). |
| **City hub** | **PASS** — sofia-bg indexable + status true; zzzz-test-city noindex + status 404. |
| **MoreFromDeveloper** | **PASS** (API); block visibility not confirmed in initial HTML. |

---

## Recommended follow-ups (addressed)

1. **Sitemap index**: Backend index already includes static.xml and news.xml (verified via `curl https://api.mrimot.com/api/v1/sitemaps/index.xml`). Frontend proxy cache was 3600s; reduced to 60s revalidate and Cache-Control in `app/sitemap.xml/route.ts` so `/sitemap.xml` updates quickly.
2. **News canonical**: Fixed in `(pages)/news/page.tsx` — canonical is always `baseCanonical` (no `?page=N`). Page 2+ remains noindex, follow.
3. **MoreFromDeveloper**: Backend now returns ACTIVE-only when `developer_id` is set on the public GET `/api/v1/projects` (via `public_listing=True`). Listing page passes `developerId` from `project.developer_id ?? project.developer?.id`; single-project API loads developer via selectinload. After deploy, verify with a listing whose developer has ≥3 ACTIVE projects; the block should render (server-rendered in ListingPageContent).
