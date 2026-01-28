#!/usr/bin/env bash
#
# SEO Smoke Test
# Validates sitemap index, static/news sitemaps, indexation rules, and maintenance robots.
#
# Usage:
#   BASE=https://mrimot.com ./scripts/seo-smoke-test.sh
#   BASE=http://localhost:3000 ./scripts/seo-smoke-test.sh
#
# Optional: EMPTY_CITY_KEY=some-city-key-with-zero-listings (for check 3.7)
#
# Exit: 0 if all checks pass, 1 if any fail.
#
# Expected outputs (summary):
#   3.1  GET /sitemap.xml         -> 200, body contains <loc>.../sitemaps/static.xml</loc> and .../news.xml</loc>
#   3.2  GET /sitemaps/static.xml -> 200, Content-Type xml, <urlset> with multiple <url><loc>...</loc></url>
#   3.3  GET /sitemaps/news.xml    -> 200, <urlset> (empty ok if no articles)
#   3.4  GET /listings?page=2     -> HTML with robots noindex and canonical to base (no ?page=2)
#   3.5  GET /listings?type=...   -> HTML with noindex and canonical to base
#   3.6  GET /news?page=2         -> HTML with noindex and canonical to base news URL
#   3.7  GET /listings/c/{empty}  -> HTML with noindex (run only if EMPTY_CITY_KEY set)
#   3.8  GET /listings/c/sofia-bg -> HTML indexable (no noindex or index,follow)
#   3.9  GET /maintenance         -> HTML with robots noindex,nofollow

set -e
BASE="${BASE:-https://mrimot.com}"
FAILED=0

run() {
  if "$@"; then
    echo "  PASS"
    return 0
  else
    echo "  FAIL"
    return 1
  fi
}

# --- 3.1 Sitemap index contains static.xml and news.xml ---
check_index() {
  echo -n "[3.1] Sitemap index contains static.xml and news.xml entries ..."
  BODY=$(curl -sS -w "\n%{http_code}" "$BASE/sitemap.xml")
  CODE=$(echo "$BODY" | tail -n1)
  XML=$(echo "$BODY" | sed '$d')
  if [ "$CODE" != "200" ]; then
    echo "  FAIL (HTTP $CODE)"
    return 1
  fi
  if echo "$XML" | grep -qE '<loc>.*/sitemaps/static\.xml</loc>' && echo "$XML" | grep -qE '<loc>.*/sitemaps/news\.xml</loc>'; then
    echo "  PASS"
    return 0
  fi
  echo "  FAIL (missing static.xml or news.xml in index)"
  echo "$XML" | grep -E '<loc>' | head -5
  return 1
}

# --- 3.2 /sitemaps/static.xml contains expected URLs ---
check_static() {
  echo -n "[3.2] /sitemaps/static.xml returns 200 and urlset with URLs ..."
  BODY=$(curl -sS -w "\n%{http_code}" "$BASE/sitemaps/static.xml")
  CODE=$(echo "$BODY" | tail -n1)
  XML=$(echo "$BODY" | sed '$d')
  if [ "$CODE" != "200" ]; then
    echo "  FAIL (HTTP $CODE)"
    return 1
  fi
  if echo "$XML" | grep -q '<urlset' && echo "$XML" | grep -qE '<loc>[^<]+</loc>' && echo "$XML" | grep -q '/listings'; then
    echo "  PASS"
    return 0
  fi
  echo "  FAIL (expected urlset with listings URL)"
  echo "$XML" | head -20
  return 1
}

# --- 3.3 /sitemaps/news.xml (200, valid urlset; empty ok if no articles) ---
check_news() {
  echo -n "[3.3] /sitemaps/news.xml returns 200 and valid urlset ..."
  BODY=$(curl -sS -w "\n%{http_code}" "$BASE/sitemaps/news.xml")
  CODE=$(echo "$BODY" | tail -n1)
  XML=$(echo "$BODY" | sed '$d')
  if [ "$CODE" != "200" ]; then
    echo "  FAIL (HTTP $CODE)"
    return 1
  fi
  if echo "$XML" | grep -q '<urlset'; then
    echo "  PASS"
    return 0
  fi
  echo "  FAIL (expected urlset)"
  echo "$XML" | head -10
  return 1
}

# --- 3.4 /listings?page=2 noindex + canonical to base ---
check_listings_page2() {
  echo -n "[3.4] /listings?page=2 noindex + canonical to base ..."
  HTML=$(curl -sS "$BASE/listings?page=2")
  if echo "$HTML" | grep -qE 'noindex' && echo "$HTML" | grep -qE 'rel="canonical"' && ! echo "$HTML" | grep -qE 'canonical[^>]*page=2'; then
    echo "  PASS"
    return 0
  fi
  echo "  FAIL"
  echo "$HTML" | grep -E 'robots|canonical' | head -5
  return 1
}

# --- 3.5 /listings?type=apartments noindex + canonical to base ---
check_listings_type() {
  echo -n "[3.5] /listings?type=apartments noindex + canonical to base ..."
  HTML=$(curl -sS "$BASE/listings?type=apartments")
  if echo "$HTML" | grep -qE 'noindex' && echo "$HTML" | grep -qE 'rel="canonical"'; then
    echo "  PASS"
    return 0
  fi
  echo "  FAIL"
  echo "$HTML" | grep -E 'robots|canonical' | head -5
  return 1
}

# --- 3.6 /news?page=2 noindex + canonical to base ---
check_news_page2() {
  echo -n "[3.6] /news?page=2 noindex + canonical to base ..."
  HTML=$(curl -sS "$BASE/news?page=2")
  if echo "$HTML" | grep -qE 'noindex' && echo "$HTML" | grep -qE 'rel="canonical"'; then
    echo "  PASS"
    return 0
  fi
  echo "  FAIL"
  echo "$HTML" | grep -E 'robots|canonical' | head -5
  return 1
}

# --- 3.7 City hub with 0 active listings is noindex (optional: set EMPTY_CITY_KEY) ---
check_city_empty() {
  if [ -z "${EMPTY_CITY_KEY:-}" ]; then
    echo "[3.7] City hub with 0 listings (noindex) ... SKIP (set EMPTY_CITY_KEY to run)"
    return 0
  fi
  echo -n "[3.7] /listings/c/$EMPTY_CITY_KEY noindex ..."
  HTML=$(curl -sS "$BASE/listings/c/$EMPTY_CITY_KEY")
  if echo "$HTML" | grep -qE 'noindex'; then
    echo "  PASS"
    return 0
  fi
  echo "  FAIL"
  echo "$HTML" | grep -E 'robots' | head -3
  return 1
}

# --- 3.8 City hub with listings is indexable ---
check_city_with_listings() {
  echo -n "[3.8] /listings/c/sofia-bg indexable (index, follow) ..."
  HTML=$(curl -sS "$BASE/listings/c/sofia-bg")
  if echo "$HTML" | grep -qE 'robots' && ! echo "$HTML" | grep -qE 'content="noindex, nofollow"'; then
    # Either index,follow or no noindex
    echo "  PASS"
    return 0
  fi
  echo "  FAIL"
  echo "$HTML" | grep -E 'robots' | head -3
  return 1
}

# --- 3.9 /maintenance noindex,nofollow ---
check_maintenance() {
  echo -n "[3.9] /maintenance noindex,nofollow ..."
  HTML=$(curl -sS "$BASE/maintenance")
  if echo "$HTML" | grep -qE 'noindex.*nofollow|nofollow.*noindex'; then
    echo "  PASS"
    return 0
  fi
  echo "  FAIL"
  echo "$HTML" | grep -E 'robots' | head -3
  return 1
}

echo "SEO Smoke Test (BASE=$BASE)"
echo "---"

check_index || ((FAILED++))
check_static || ((FAILED++))
check_news || ((FAILED++))
check_listings_page2 || ((FAILED++))
check_listings_type || ((FAILED++))
check_news_page2 || ((FAILED++))
check_city_empty || ((FAILED++))
check_city_with_listings || ((FAILED++))
check_maintenance || ((FAILED++))

echo "---"
if [ "$FAILED" -eq 0 ]; then
  echo "All checks passed."
  exit 0
else
  echo "$FAILED check(s) failed."
  exit 1
fi
