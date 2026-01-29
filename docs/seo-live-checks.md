# SEO Live Checks (Production) — 2026-01-29

2026-01-29: P0 locale sitemap proxy fix verified in production (bg cities/developers/projects non-empty; invalid locale 404).

Live curl checks against **https://mrimot.com**. No code changes; measure only.

---

## 1) Is sitemap.xml a sitemap index?

**Yes.**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<sitemap><loc>https://mrimot.com/sitemaps/en/cities.xml</loc><lastmod>...</lastmod></sitemap>
<sitemap><loc>https://mrimot.com/sitemaps/en/developers.xml</loc>...
<sitemap><loc>https://mrimot.com/sitemaps/en/projects/1.xml</loc>...
... (en, bg, ru, gr for cities, developers, projects)
<sitemap><loc>https://mrimot.com/sitemaps/static.xml</loc><lastmod>...</lastmod></sitemap>
<sitemap><loc>https://mrimot.com/sitemaps/news.xml</loc><lastmod>...</lastmod></sitemap>
</sitemapindex>
```

---

## 2) Does the index contain static.xml / news.xml / sitemaps/ links?

**Yes.** Backend index includes:

- `https://mrimot.com/sitemaps/static.xml`
- `https://mrimot.com/sitemaps/news.xml`
- `https://mrimot.com/sitemaps/{en,bg,ru,gr}/cities.xml`
- `https://mrimot.com/sitemaps/{en,bg,ru,gr}/developers.xml`
- `https://mrimot.com/sitemaps/{en,bg,ru,gr}/projects/1.xml`

So the backend index **does** link to the frontend-generated sitemaps (static, news) and to locale-specific backend sitemaps.

---

## 3) Are sub-sitemaps accessible and correct Content-Type?

| URL | Status | Content-Type | Body size | Notes |
|-----|--------|--------------|-----------|--------|
| `https://mrimot.com/sitemaps/static.xml` | 200 | `application/xml` | 12,841 bytes | Frontend rewrite to `/sitemap/static/sitemap.xml`; Vercel HIT. |
| `https://mrimot.com/sitemaps/news.xml` | 200 | `application/xml` | 46,061 bytes | Frontend rewrite to `/sitemap/news/sitemap.xml`; Vercel HIT. |
| `https://mrimot.com/sitemaps/bg/cities.xml` | 200 | `application/xml; charset=utf-8` | **0** | Proxied to API; **empty body**. |
| `https://mrimot.com/sitemaps/bg/developers.xml` | 200 | `application/xml; charset=utf-8` | **0** | Proxied to API; **empty body**. |
| `https://mrimot.com/sitemaps/bg/projects/1.xml` | 200 | `application/xml; charset=utf-8` | **0** | Proxied to API; **empty body**. |

**Findings:**

- **static.xml** and **news.xml**: OK; correct type and non-empty. Consider adding `charset=utf-8` to the frontend XML responses for consistency.
- **Backend-proxied** (`/sitemaps/bg/cities.xml`, `developers.xml`, `projects/1.xml`): Return **Content-Length: 0**. Either the API returned an empty body in this run or the proxy is not forwarding the body. **Worth verifying** (e.g. curl the API directly or re-run later).

---

## 4) Robots sanity

**OK.**

- **Sitemap:** `Sitemap: https://mrimot.com/sitemap.xml`
- **Allow:** `/`, `/bg/`, `/ru/`, `/gr/`, `/news/`, listings, developers, about, contact (and localized paths).
- **Disallow:** `/admin/`, `/buyer/`, `/developer/`, logins, register, forgot-password, `/api/`, verify-email, reset-password, policy paths per lang.
- Same rules for GPTBot, ChatGPT-User, CCBot, anthropic-ai, Claude-Web, PerplexityBot, Applebot-Extended, Omgilibot, FacebookBot, Google-Extended, and `*`.

---

## 5) Is the homepage exposing listing links in HTML (SSR) or only after JS?

**Yes — listing links are in the initial HTML.**

- **URL:** `https://mrimot.com/bg`
- **Pattern:** `/bg/obiavi/p/` (and RSC payload with same hrefs)
- **Sample:** `href="/bg/obiavi/p/sgrada-shepa-oblast-sofiia-580b6104"`, etc. (e.g. from LatestListingsSSR).
- So crawlers see listing URLs without relying on client JS.

---

## 6) Is /bg/obiavi (listings index) exposing listing links in HTML?

**Yes.**

- **URL:** `https://mrimot.com/bg/obiavi`
- **Pattern:** `/bg/obiavi/p/` appears many times in the response (SSR grid + RSC).
- **Sample:** `href="/bg/obiavi/p/sgrada-shepa-oblast-sofiia-580b6104"`, and other listing slugs.
- Listing links are present in the initial HTML.

---

## 7) Listing detail: canonical and hreflang in HTML?

**Yes.**

- **URL:** `https://mrimot.com/bg/obiavi/p/sgrada-shepa-oblast-sofiia-580b6104`
- **Canonical:** `<link rel="canonical" href="https://mrimot.com/bg/obiavi/p/sgrada-shepa-oblast-sofiia-580b6104"/>`
- **Hreflang:**  
  - `en` → `https://mrimot.com/listings/p/sgrada-shepa-oblast-sofiia-580b6104`  
  - `bg` → `https://mrimot.com/bg/obiavi/p/sgrada-shepa-oblast-sofiia-580b6104`  
  - `ru` → `https://mrimot.com/ru/obyavleniya/p/sgrada-shepa-oblast-sofiia-580b6104`  
  - `el` → `https://mrimot.com/gr/aggelies/p/sgrada-shepa-oblast-sofiia-580b6104`  
  - `x-default` → `https://mrimot.com/listings/p/sgrada-shepa-oblast-sofiia-580b6104`

Canonical and all alternates are present in the HTML.

---

## 8) Cache-Control for sitemap index and key pages

| URL | Cache-Control |
|-----|----------------|
| `https://mrimot.com/sitemap.xml` | `no-store` |
| `https://mrimot.com/bg` | `public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400` |
| `https://mrimot.com/bg/obiavi` | `private, no-cache, no-store, max-age=0, must-revalidate` |

**Findings:**

- **Sitemap index:** Correct — not cached (`no-store`).
- **Homepage /bg:** Cached as intended for a static route.
- **Listings index /bg/obiavi:** Served with **private, no-store**. If this route is intended to be cacheable when it’s the base listings URL (no map bounds / filters), consider aligning middleware or route config so that the canonical listings index can be publicly cached like the homepage; otherwise the current behavior is consistent with “always fresh” for listings.

---

## Summary

| Check | Result |
|-------|--------|
| 1. Sitemap index | ✅ Yes — `<sitemapindex>` with &lt;sitemap&gt; entries |
| 2. static.xml / news.xml in index | ✅ Yes — both present; backend links to frontend sitemaps |
| 3. Sub-sitemaps accessible | ⚠️ static/news OK; backend-proxied (bg/cities, developers, projects/1) returned **empty body** (Content-Length: 0) |
| 4. robots.txt | ✅ Sitemap + allow/disallow as expected |
| 5. Homepage listing links in HTML | ✅ Yes — SSR listing links present |
| 6. Listings index listing links in HTML | ✅ Yes — SSR grid links present |
| 7. Listing detail canonical + hreflang | ✅ Yes — in HTML |
| 8. Cache-Control | ✅ Sitemap no-store; /bg cacheable; /bg/obiavi private no-store |

---

## P0 fix (locale sitemaps empty body)

**Root cause:** Backend returns `Content-Length: 0` in the HTTP response headers but actually sends a non-empty XML body. When Next.js rewrites proxied the request, the response (with wrong header) was forwarded; clients/CDN respected `Content-Length: 0` and did not read the body.

**Isolation:** Direct curl to the API showed the same: `curl -sI` reported `Content-Length: 0`, while `curl -s` (body) returned full XML. So the bug is **backend sending wrong Content-Length**; the frontend rewrite then forwarded that response as-is.

**Fix (frontend):** Stop using rewrites for locale sitemaps. Use explicit route handlers that fetch the backend, read the body with `response.text()`, and return a new `Response(xml, { headers })` so the body is always correct and `Content-Type` includes `charset=utf-8`.

- **Added:** `app/sitemaps/[locale]/cities.xml/route.ts`, `app/sitemaps/[locale]/developers.xml/route.ts`, `app/sitemaps/[locale]/projects/[n]/route.ts` (each proxies backend and returns body).
- **Removed:** Rewrites for `/sitemaps/:locale/cities.xml`, `developers.xml`, `projects/:n.xml` from `next.config.mjs`.
- **Middleware:** Already skips `pathname.startsWith('/sitemaps')`, so no change.
- **Error behavior:** On backend non-OK or fetch error, handlers return **502** with `Cache-Control: no-store` (no 200 + empty urlset, so outages don’t publish “no URLs” to crawlers).
- **Locale validation:** Only `en`, `bg`, `ru`, `gr` accepted; invalid locale (e.g. `/sitemaps/xx/cities.xml`) returns **404**.

**Verification (after deploy):**

```bash
# 1) Body non-empty and valid XML
curl -s https://mrimot.com/sitemaps/bg/cities.xml | head -n 20
curl -s https://mrimot.com/sitemaps/bg/developers.xml | head -n 20
curl -s https://mrimot.com/sitemaps/bg/projects/1.xml | head -n 20

# 2) Content-Length should reflect body (or omit for chunked)
curl -sI https://mrimot.com/sitemaps/bg/cities.xml
curl -sI https://mrimot.com/sitemaps/bg/developers.xml
curl -sI https://mrimot.com/sitemaps/bg/projects/1.xml
```

Expect: `Content-Type: application/xml; charset=utf-8`, and response body starting with `<?xml` and containing `<urlset>` / `<url>` entries.

---

## P1.3 verification (news canonical/noindex + SSR article links)

After deploying P1.3 (internal linking quality):

1. **News filters: noindex and clean canonical**
   - `/bg/novini?category=...` and `/bg/novini?page=2` must have `noindex` in robots and canonical pointing to `https://mrimot.com/bg/novini` (no query params).

```bash
curl -s "https://mrimot.com/bg/novini?category=test" | grep -E "canonical|robots" | head -n 20
curl -s "https://mrimot.com/bg/novini?page=2" | grep -E "canonical|robots" | head -n 20
```

2. **News article: SSR links to other articles**
   - Article pages must output `/bg/novini/...` links in the initial HTML (RelatedArticles + "View all news").

```bash
curl -s https://mrimot.com/bg/novini/<some-article-slug> | grep -E "/bg/novini/" | head
```

Expect: multiple `/bg/novini/...` URLs in the HTML (related articles and news index link).
