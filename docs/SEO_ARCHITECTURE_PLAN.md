# Master SEO Architecture Plan (mrimot.com)

This plan consolidates sitemap ownership, indexation rules, city hub programmatic indexation, internal linking (MoreFromDeveloper), JSON-LD correctness, and guardrails. Implementation order is **backend-first when frontend depends on it**.

---

## What This Plan Gets Right

- **Sitemap index ownership**: Backend stays source of truth; add `static.xml` + `news.xml` to the sitemap index. Cleanest way to stop sitemap drift.
- **Index bloat fixes**: Confirmed runtime issues; changes are rule-based and scoped.
- **Programmatic city hub indexing**: Status endpoint approach is correct and scalable.
- **MoreFromDeveloper root cause**: Backend API bug (missing `developer_id` filter), not frontend.
- **Guardrails**: Helper + tests + docs prevent regression.

---

## Biggest SEO Leaks (Plain English)

1. **Google can’t discover key URLs via sitemap** — `/sitemap.xml` doesn’t include static and news sitemaps.
2. **Junk variants are indexable** — `/listings?page=2`, `/listings?type=...`, `/news?page=2` shouldn’t be indexable.
3. **City hubs can become empty indexable pages** — When a city exists but inventory is 0, page stays indexable unless metadata checks inventory.
4. **Internal link blocks broken** — MoreFromDeveloper is wrong or missing because backend doesn’t filter by `developer_id`.

---

## Missing Items (Added to This Plan)

### 1. JSON-LD developer URL always English

- **Evidence**: `listing-structured-data.tsx` lines 156–159 hardcode `developerUrl = \`${baseUrl}/developers/${...}\`` (English path only).
- **Fix**: Import `developerHref` from `@/lib/routes` and set  
  `developerUrl = project.developer ? \`${baseUrl}${developerHref(lang, project.developer.slug || project.developer.id)}\` : null`.
- **Audit**: Other JSON-LD blocks for hardcoded English URLs (developer page already uses locale-aware URLs).

### 2. Sitemap “active vs paused/deleted” contract

- **Contract (never break)**:
  - Projects sitemap includes **only ACTIVE** projects.
  - Cities sitemap includes **only cities with ≥1 ACTIVE** project.
  - When a project becomes PAUSED/DELETED → it drops out automatically on next sitemap generation.
- **Acceptance criteria**:
  - Create one project → it appears in project sitemap.
  - Mark it PAUSED → it disappears from sitemap on next generation.
- **Backend**: `mr-imot-backend/app/api/v1/sitemaps/routes.py` already uses `Project.status == ProjectStatus.ACTIVE` in index count (138), projects sitemap (229), cities sitemap (300), projects count (491). Add an explicit acceptance test for this.

### 3. Maintenance canonical (optional)

- Root layout canonical becomes `https://mrimot.com` for `/maintenance`. Once `/maintenance/layout.tsx` sets `robots: { index: false }`, indexation is solved.
- **Optional**: Set `alternates.canonical` to `https://mrimot.com/maintenance` in that layout for a clean canonical.

### 4. Query-param taxonomy (central, once)

- One place listing every search param and rule: **indexable?** (y/n), **canonical target**, **in sitemap?** (never for param-based URLs), **crawlable?** (yes, but noindex when not canonical).
- Lives in `docs/seo-architecture.md` and drives helper logic so future params (`sort`, `q`, `price_min`/`price_max`, etc.) are handled consistently.

---

## Phased Implementation Order

### Phase 1 — Backend (foundational)

1. Add `static.xml` + `news.xml` to backend sitemap index.
2. Add `developer_id` query param support to `GET /api/v1/projects` (fixes MoreFromDeveloper data).
3. Add `GET /api/v1/cities/{city_key}/status` (returns `{ has_active_listings: boolean }` or equivalent).

**Files**: `mr-imot-backend/app/api/v1/sitemaps/routes.py`, `mr-imot-backend/app/api/v1/projects.py` (or equivalent), `mr-imot-backend/app/api/v1/cities.py`.

---

### Phase 2 — Frontend indexation (stop the bleeding)

4. **Listings base**: Noindex for `page > 1` and `type !== 'all'` (or equivalent); canonical to base listings URL. Use shared helper.
5. **News index**: Noindex for `page > 1`; canonical to base news URL.
6. **Maintenance**: Add `maintenance/layout.tsx` with `robots: { index: false }`; optional canonical to `/maintenance`.

**Files**: Listings page `generateMetadata`, news page `generateMetadata`, new `maintenance/layout.tsx`, shared helper (e.g. `lib/seo-listings.ts` or `lib/seo-indexation.ts`).

---

### Phase 3 — City hub correctness

7. City hub `generateMetadata` uses `GET /api/v1/cities/{city_key}/status` to set **noindex when no active listings** (and optionally canonical).

**Files**: `mr-imot-frontend/app/(public)/[lang]/listings/c/[cityKey]/page.tsx` (or equivalent city hub page).

---

### Phase 4 — Internal linking + schema correctness

8. Verify MoreFromDeveloper shows correct same-developer projects now that backend filters by `developer_id`.
9. Fix JSON-LD locale leakage: listing structured data uses `developerHref(lang, ...)` for developer URL; audit other JSON-LD for hardcoded English URLs.
10. **Optional**: SimilarListings UX — show at least 1 item or link to hub.

**Files**: `listing-structured-data.tsx`, `more-from-developer.tsx`, backend projects API.

---

### Phase 5 — Guardrails

11. **Helpers**: Centralize indexation rules in a helper used by listings, news, city hub.
12. **Unit tests**: Helper behavior (index/noindex, canonical) for param combinations.
13. **Sitemap integration test**: Fetch sitemap index and key sitemaps; assert static + news present; assert ACTIVE-only (acceptance: create project → in sitemap; set PAUSED → not in sitemap).
14. **Docs**: `docs/seo-architecture.md` with param taxonomy, sitemap contract, and “Do not” list.

---

## Sitemap Contract (Never Break)

| Rule | Implementation |
|------|----------------|
| Projects sitemap | Only `Project.status == ACTIVE`. |
| Cities sitemap | Only cities with ≥1 ACTIVE project. |
| Project PAUSED/DELETED | Drops out of projects sitemap and city counts on next generation. |
| Acceptance test | Create project → in sitemap; set PAUSED → not in sitemap. |

---

## Query-Param Taxonomy (Summary)

Full table lives in `docs/seo-architecture.md`. Summary:

- **Listings**: `page`, `type`, `city`, `city_key`, `ne_lat`, `sw_lat`, `ne_lng`, `sw_lng`, `search_by_map` (and `sort_by` if exposed). Pagination and filter variants → **noindex**, canonical to base or city hub.
- **News**: `page`, `q`, `category`, `tag`. `page > 1` and filter variants → **noindex**, canonical to base news.
- **Developers**: `page`. `page > 1` → **noindex**, canonical to base developers.
- **All param-based URLs**: Never in sitemap; crawlable but noindex when not canonical. Helper must cover all index-affecting params (see docs for “missing” list).

---

## Gap Checklist Outcomes

1. **Listing structured data**: Confirmed hardcoded developer URL in `listing-structured-data.tsx` (156–159). Fix: use `developerHref(lang, ...)`. Added to Phase 4.
2. **Param taxonomy**: Enumerated in `docs/seo-architecture.md`; helper must cover all listed params; document any not yet in helper.
3. **Sitemap correctness**: All sitemap queries in `routes.py` use `Project.status == ProjectStatus.ACTIVE` (projects + cities). Acceptance test added to Phase 5.
4. **Internal linking**: After `developer_id` support, MoreFromDeveloper will render when developer has ≥2 active projects. Seed: use a developer with ≥2 active projects in dev; load listing detail → block appears with same-developer links.

---

## File List (Implementation Reference)

| Area | File |
|------|------|
| Sitemap index | `mr-imot-backend/app/api/v1/sitemaps/routes.py` |
| Projects API | `mr-imot-backend/app/api/v1/projects.py` |
| Cities API | `mr-imot-backend/app/api/v1/cities.py` |
| Listings metadata | `mr-imot-frontend/app/(public)/[lang]/listings/page.tsx` |
| City hub metadata | `mr-imot-frontend/app/(public)/[lang]/listings/c/[cityKey]/page.tsx` |
| News metadata | `mr-imot-frontend/app/(public)/[lang]/(pages)/news/page.tsx` |
| Maintenance layout | `mr-imot-frontend/app/(public)/[lang]/maintenance/layout.tsx` (new) |
| Listing JSON-LD | `mr-imot-frontend/app/(public)/[lang]/listings/[id]/listing-structured-data.tsx` |
| MoreFromDeveloper | `mr-imot-frontend/components/listings/more-from-developer.tsx` |
| SEO helper | `mr-imot-frontend/lib/seo-listings.ts` or `seo-indexation.ts` (new) |
| Docs | `mr-imot-frontend/docs/seo-architecture.md` |

---

## Test Strategy

- **Unit**: Helper returns correct `robots` and `canonical` for param combinations (listings, news).
- **Integration**: Sitemap index contains `static.xml`, `news.xml`; projects/cities sitemaps only ACTIVE; acceptance: project created → in sitemap; project PAUSED → not in sitemap.
- **Manual**: City hub with 0 listings → noindex; MoreFromDeveloper with ≥2 projects → block visible and correct; listing detail in bg/ru/gr → developer URL in JSON-LD uses correct locale path.
