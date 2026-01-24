# Sitemap Testing Checklist

## Production-Grade Sitemap Setup Verification

### 1. Sitemap Index Structure
- [ ] **Test**: `curl -I https://mrimot.com/sitemap.xml`
  - Expected: `200 OK`, `Content-Type: application/xml; charset=utf-8`
  - Verify: All `<loc>` entries are under `https://mrimot.com/sitemaps/`
  - Verify: No `/sitemap/` (old namespace) URLs
  - Verify: No `api.mrimot.com` URLs

### 2. Child Sitemap Accessibility
- [ ] **Test**: `curl -I https://mrimot.com/sitemaps/static.xml`
  - Expected: `200 OK`, `Content-Type: application/xml; charset=utf-8`

- [ ] **Test**: `curl -I https://mrimot.com/sitemaps/news.xml`
  - Expected: `200 OK`, `Content-Type: application/xml; charset=utf-8`

- [ ] **Test**: `curl -I https://mrimot.com/sitemaps/cities.xml`
  - Expected: `200 OK`, `Content-Type: application/xml; charset=utf-8`
  - Verify: Contains `/listings/c/` URLs (EN canonical)
  - If `SITEMAP_INCLUDE_BG_URLS=True`: Also contains `/bg/obiavi/c/` URLs

- [ ] **Test**: `curl -I https://mrimot.com/sitemaps/developers.xml`
  - Expected: `200 OK`, `Content-Type: application/xml; charset=utf-8`

- [ ] **Test**: `curl -I https://mrimot.com/sitemaps/projects/1.xml`
  - Expected: `200 OK`, `Content-Type: application/xml; charset=utf-8`
  - Verify: Contains `/listings/p/` URLs (EN canonical)
  - If `SITEMAP_INCLUDE_BG_URLS=True`: Also contains `/bg/obiavi/p/` URLs

### 3. Middleware Exclusion
- [ ] **Test**: `curl -I https://mrimot.com/sitemap.xml`
  - Verify: No locale redirects (no `Location` header)
  - Verify: No cookie-based rewrites

- [ ] **Test**: `curl -I https://mrimot.com/sitemaps/cities.xml`
  - Verify: No locale redirects
  - Verify: Direct access to backend sitemap

### 4. Robots.txt
- [ ] **Test**: `curl https://mrimot.com/robots.txt`
  - Verify: Contains `Sitemap: https://mrimot.com/sitemap.xml`

### 5. BG Indexing Boost (Optional)
- [ ] **If `SITEMAP_INCLUDE_BG_URLS=True`**:
  - Verify: `/sitemaps/projects/1.xml` contains both:
    - `/listings/p/{slug}` (EN)
    - `/bg/obiavi/p/{slug}` (BG)
  - Verify: `/sitemaps/cities.xml` contains both:
    - `/listings/c/{cityKey}` (EN)
    - `/bg/obiavi/c/{cityKey}` (BG)
  - Verify: No `/bg/listings/` URLs (only `/bg/obiavi/`)

### 6. Fallback Behavior
- [ ] **Test**: Simulate backend chunk info failure
  - Verify: `/sitemap.xml` still includes `/sitemaps/projects/1.xml` as fallback
  - Verify: No 500 errors, only warnings in logs

### 7. URL Format Verification
- [ ] **Verify**: All sitemap URLs use canonical public routes:
  - EN: `/listings/p/{slug}`, `/listings/c/{cityKey}`
  - BG (if enabled): `/bg/obiavi/p/{slug}`, `/bg/obiavi/c/{cityKey}`
  - Never: `/en/listings/`, `/bg/listings/`

### 8. Content-Type Headers
- [ ] **Verify**: All sitemap responses include:
  - `Content-Type: application/xml; charset=utf-8`
  - `Cache-Control: public, max-age=3600, s-maxage=3600`

## Quick Test Commands

```bash
# Test sitemap index
curl -s https://mrimot.com/sitemap.xml | grep -o '<loc>[^<]*</loc>' | head -10

# Test cities sitemap
curl -s https://mrimot.com/sitemaps/cities.xml | grep -o '<loc>[^<]*</loc>' | head -5

# Test projects sitemap (first chunk)
curl -s https://mrimot.com/sitemaps/projects/1.xml | grep -o '<loc>[^<]*</loc>' | head -5

# Verify robots.txt
curl -s https://mrimot.com/robots.txt | grep -i sitemap
```

## Expected Results

✅ All sitemap URLs under `/sitemaps/` namespace  
✅ All URLs use `https://mrimot.com` (not `api.mrimot.com`)  
✅ All child sitemaps return `200 OK` with XML content-type  
✅ No locale redirects on sitemap paths  
✅ Robots.txt includes sitemap declaration  
✅ Fallback to `projects/1.xml` if chunk info fails  
✅ BG URLs included only if `SITEMAP_INCLUDE_BG_URLS=True`
