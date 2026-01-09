# Font Analysis for /bg Homepage - First Load

## Quick Reference: All Font Requests

| # | Font File | Size | Triggered By | Used Above Fold? |
|---|-----------|------|--------------|-------------------|
| 1 | Geist 500 (latin) | ~20-30KB | `font-serif` + `font-medium` (500) | ✅ Yes |
| 2 | Geist 500 (cyrillic) | ~25-35KB | `font-serif` + `font-medium` (500) | ✅ Yes |
| 3 | Geist 600 (latin) | ~20-30KB | `font-serif` + `font-semibold` (600) | ✅ Yes |
| 4 | Geist 600 (cyrillic) | ~25-35KB | `font-serif` + `font-semibold` (600) | ✅ Yes |
| 5 | Geist 700 (latin) | ~20-30KB | Preloaded | ❌ No |
| 6 | Geist 700 (cyrillic) | ~25-35KB | Preloaded | ❌ No |
| 7 | Inter 400 (latin) | ~45-55KB | `font-sans` + `font-normal` (400) | ✅ Yes |
| 8 | Inter 400 (cyrillic) | ~50-60KB | `font-sans` + `font-normal` (400) | ✅ Yes |
| 9 | Inter 600 (latin) | ~45-55KB | `font-sans` + `font-semibold` (600) | ✅ Yes |
| 10 | Inter 600 (cyrillic) | ~50-60KB | `font-sans` + `font-semibold` (600) | ✅ Yes |
| 11 | GeistSans (local) | ~50-80KB | Imported but unused | ❌ No |
| 12 | GeistMono (local) | ~50-80KB | Imported but unused above fold | ❌ No |

**Total**: 12 font files, ~430-550KB
**Above fold**: 8 files, ~290-350KB
**Unnecessary**: 4 files, ~140-200KB (33-36% waste)

---

## Current Font Requests on First Load

When using `next/font/google`, Next.js automatically generates optimized font URLs. The actual requests look like:

**Base URL Pattern**: `https://fonts.gstatic.com/s/[fontname]/v[version]/[filename].woff2`

### 1. Geist (Google Fonts) - Serif/Headings
**Configuration**: `app/layout.tsx` lines 11-16
- **Weights loaded**: 500, 600, 700
- **Subsets**: latin, cyrillic
- **Variable**: `--font-geist`
- **Display**: swap

**Font Files Requested** (6 files total):
1. `https://fonts.gstatic.com/s/geist/v1/[hash]-latin-500.woff2` (~20-30KB)
   - **Triggered by**: `font-serif` + `font-medium` (500) on hero h1
   - **Usage**: Hero headline "your" text
2. `https://fonts.gstatic.com/s/geist/v1/[hash]-cyrillic-500.woff2` (~25-35KB)
   - **Triggered by**: `font-serif` + `font-medium` (500) on hero h1 (Bulgarian text)
   - **Usage**: Hero headline Bulgarian text
3. `https://fonts.gstatic.com/s/geist/v1/[hash]-latin-600.woff2` (~20-30KB)
   - **Triggered by**: `font-serif` + `font-semibold` (600) on hero h1
   - **Usage**: Hero headline "perfectProperty" text
4. `https://fonts.gstatic.com/s/geist/v1/[hash]-cyrillic-600.woff2` (~25-35KB)
   - **Triggered by**: `font-serif` + `font-semibold` (600) on hero h1 (Bulgarian text)
   - **Usage**: Hero headline Bulgarian text
5. `https://fonts.gstatic.com/s/geist/v1/[hash]-latin-700.woff2` (~20-30KB)
   - **Triggered by**: Preloaded but **NOT used above fold**
   - **Usage**: None above fold (loaded unnecessarily)
6. `https://fonts.gstatic.com/s/geist/v1/[hash]-cyrillic-700.woff2` (~25-35KB)
   - **Triggered by**: Preloaded but **NOT used above fold**
   - **Usage**: None above fold (loaded unnecessarily)

**Total Geist size**: ~140-200KB

**Usage above fold**:
- Hero h1 (`font-serif` = Geist):
  - `font-normal` (400) → **Falls back to 500** (weight not loaded)
  - `font-medium` (500) → ✅ Uses Geist 500
  - `font-semibold` (600) → ✅ Uses Geist 600

---

### 2. Inter (Google Fonts) - Sans-serif/Body
**Configuration**: `app/layout.tsx` lines 18-24
- **Weights loaded**: 400, 600
- **Subsets**: latin, cyrillic
- **Variable**: `--font-inter`
- **Display**: swap

**Font Files Requested** (4 files total):
1. `https://fonts.gstatic.com/s/inter/v18/[hash]-latin-400.woff2` (~45-55KB)
   - **Triggered by**: `font-sans` + `font-normal` (400) on hero subtitle, body text
   - **Usage**: Hero subtitle paragraph, promise checkmarks text
2. `https://fonts.gstatic.com/s/inter/v18/[hash]-cyrillic-400.woff2` (~50-60KB)
   - **Triggered by**: `font-sans` + `font-normal` (400) on hero subtitle (Bulgarian text)
   - **Usage**: Hero subtitle Bulgarian text
3. `https://fonts.gstatic.com/s/inter/v18/[hash]-latin-600.woff2` (~45-55KB)
   - **Triggered by**: `font-sans` + `font-semibold` (600) on hero subtitle, buttons
   - **Usage**: Hero subtitle bold spans, CTA buttons, promise heading
4. `https://fonts.gstatic.com/s/inter/v18/[hash]-cyrillic-600.woff2` (~50-60KB)
   - **Triggered by**: `font-sans` + `font-semibold` (600) on hero subtitle (Bulgarian text)
   - **Usage**: Hero subtitle Bulgarian bold text

**Total Inter size**: ~190-230KB

**Usage above fold**:
- Hero subtitle (`font-sans` = Inter):
  - `font-normal` (400) → ✅ Uses Inter 400
  - `font-semibold` (600) → ✅ Uses Inter 600
- Navigation (inherits body = Inter):
  - `font-medium` (500) → **Falls back to 400** (weight not loaded)
- CTA Buttons (`font-sans` = Inter):
  - `font-bold` (700) → **Falls back to 600** (weight not loaded)
  - `font-semibold` (600) → ✅ Uses Inter 600

---

### 3. GeistSans (Local Package)
**Configuration**: `app/layout.tsx` line 3, 87
- **Variable**: `--font-geist-sans` (not used)
- **Status**: ❌ **IMPORTED BUT NOT USED ABOVE FOLD**
- **Files**: 
  - `/_next/static/media/[hash]-[hash].woff2` (local package, ~50-80KB)
  - **Triggered by**: Imported in layout but never referenced
  - **Usage**: None above fold

**Usage**: Not found in above-the-fold code

---

### 4. GeistMono (Local Package)
**Configuration**: `app/layout.tsx` line 4, 87
- **Variable**: `--font-mono`
- **Status**: ❌ **NOT USED ABOVE FOLD** (only used in listing detail pages and debug panels)
- **Files**: 
  - `/_next/static/media/[hash]-[hash].woff2` (local package, ~50-80KB)
  - **Triggered by**: Imported in layout, referenced in CSS but not used above fold
  - **Usage**: Only in below-the-fold pages

**Usage**: Only in below-the-fold pages:
- `listing-detail-client.tsx` (phone numbers)
- `developer-detail-client.tsx` (phone numbers)
- `chart.tsx` (chart labels)
- `map-debug-panel.tsx` (debug text)

---

## Summary: Current Font Requests

| Font Family | Files | Total Size | Used Above Fold? |
|------------|-------|------------|------------------|
| **Geist** (500, 600, 700) | 6 files | ~140-200KB | ✅ Yes (500, 600) |
| **Inter** (400, 600) | 4 files | ~190-230KB | ✅ Yes (400, 600) |
| **GeistSans** | Unknown | Unknown | ❌ No |
| **GeistMono** | Unknown | Unknown | ❌ No |

**Total above fold**: 10 font files, ~330-430KB
**Unnecessary above fold**: 2 font families (GeistSans, GeistMono) + 2 Geist weights (700)

---

## Font Optimization Plan: Reduce to 1 Family, Max 2 Weights Above Fold

### Option 1: Use Inter Only (Recommended)

**Strategy**: Replace Geist with Inter for all text above the fold. Inter is versatile enough for both headings and body text.

**Changes Required**:

1. **Update `app/layout.tsx`**:
```tsx
// Remove Geist, keep only Inter
import { Inter } from "next/font/google"
// Remove: import { GeistSans } from "geist/font/sans"
// Remove: import { GeistMono } from "geist/font/mono"
// Remove: import { Geist } from "next/font/google"

// Load only 2 weights: 400 (normal) and 600 (semibold)
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600"], // Only 2 weights
  variable: "--font-inter",
  display: "swap",
})

// In HTML className, remove GeistSans, GeistMono, geist
<html className={cn(inter.variable)}>

// In CSS variables
--font-sans: var(--font-inter);
--font-serif: var(--font-inter); // Use Inter for headings too
--font-mono: var(--font-inter); // Or use system monospace
```

2. **Update `app/globals.css`**:
```css
--font-serif: var(--font-inter), system-ui, sans-serif; /* Changed from Geist */
--font-mono: ui-monospace, monospace; /* System fallback, or keep GeistMono for below-fold */
```

3. **Update hero component** (`homepage-hero.tsx`):
```tsx
// Change h1 from font-serif to font-sans (or keep font-serif but it will use Inter)
<h1 className={clsx("tracking-tight font-sans", styles.heroTitle)}>
  // Or keep font-serif, it will now use Inter via CSS variable
```

**Result**:
- **Font files**: 4 files (Inter 400 + 600, latin + cyrillic)
- **Total size**: ~190-230KB (down from ~330-430KB)
- **Reduction**: ~140-200KB saved (43-46% reduction)
- **Weights**: 2 weights (400, 600) ✅

**Visual Impact**: Minimal - Inter works well for both headings and body text. May need slight size adjustments for headings.

---

### Option 2: Use Geist Only (Alternative)

**Strategy**: Replace Inter with Geist for all text. Geist is designed for both headings and body.

**Changes Required**:

1. **Update `app/layout.tsx`**:
```tsx
// Remove Inter, keep only Geist
import { Geist } from "next/font/google"
// Remove: import { Inter } from "next/font/google"

// Load only 2 weights: 400 (normal) and 600 (semibold)
const geist = Geist({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600"], // Only 2 weights (add 400, remove 500, 700)
  variable: "--font-geist",
  display: "swap",
})

// In HTML className
<html className={cn(geist.variable)}>

// In CSS variables
--font-sans: var(--font-geist);
--font-serif: var(--font-geist);
```

2. **Update components**:
- All `font-sans` will use Geist
- All `font-serif` will use Geist
- Update hero h1: remove `font-medium` (500), use `font-normal` (400) or `font-semibold` (600)

**Result**:
- **Font files**: 4 files (Geist 400 + 600, latin + cyrillic)
- **Total size**: ~140-200KB (down from ~330-430KB)
- **Reduction**: ~190-230KB saved (58-70% reduction)
- **Weights**: 2 weights (400, 600) ✅

**Visual Impact**: Slightly more noticeable - Geist has a different character than Inter, but both are modern and readable.

---

### Option 3: Lazy Load GeistMono and GeistSans (Hybrid)

**Strategy**: Keep current setup but lazy-load GeistMono and GeistSans only when needed (below the fold).

**Changes Required**:

1. **Remove from root layout**:
```tsx
// app/layout.tsx - Remove these imports
// import { GeistSans } from "geist/font/sans"
// import { GeistMono } from "geist/font/mono"

// Remove from className
<html className={cn(geist.variable, inter.variable)}>
```

2. **Lazy load in components that need them**:
```tsx
// In listing-detail-client.tsx, developer-detail-client.tsx, etc.
'use client'
import { GeistMono } from "geist/font/mono"
import { useEffect } from "react"

// Load font when component mounts
useEffect(() => {
  document.documentElement.classList.add(GeistMono.variable)
}, [])
```

**Result**:
- **Above fold**: 10 files → 10 files (no change)
- **Below fold**: GeistMono loads on demand
- **Reduction**: Minimal for above fold, but reduces initial bundle

**Note**: This doesn't achieve the goal of reducing above-fold fonts.

---

## Recommended Solution: Option 1 (Inter Only)

### Implementation Steps

1. **Update `app/layout.tsx`**:
   - Remove Geist, GeistSans, GeistMono imports
   - Keep only Inter with weights 400, 600
   - Update CSS variables

2. **Update `app/globals.css`**:
   - Set `--font-serif` to use Inter
   - Set `--font-mono` to system fallback (or lazy load GeistMono)

3. **Update hero component**:
   - Optionally change `font-serif` to `font-sans` for consistency
   - Or keep `font-serif` - it will use Inter via CSS variable

4. **Test visual appearance**:
   - Verify headings look good with Inter
   - Adjust font sizes if needed (Inter may need slightly larger headings)

5. **Lazy load GeistMono** (optional):
   - Only load when listing detail pages are accessed
   - Saves additional bytes for users who don't view listings

### Expected Performance Gains

- **Font files above fold**: 10 → 4 files (60% reduction)
- **Font size above fold**: ~330-430KB → ~190-230KB (43-46% reduction)
- **Lighthouse score**: +2-4 points improvement
- **FCP/LCP**: ~50-100ms improvement (faster font loading)

### Risk Assessment

- **Visual risk**: Low - Inter is a well-designed font that works for both headings and body
- **Compatibility risk**: Low - Inter has excellent Cyrillic support
- **Implementation risk**: Low - Simple CSS variable changes

---

## Alternative: Variable Font Approach

If Inter or Geist support variable fonts, we could use a single variable font file:

```tsx
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
  // Variable font includes all weights in one file
})
```

**Result**: 2 files (latin + cyrillic variable fonts) instead of 4 files
**Size**: Potentially larger single file, but fewer HTTP requests

**Note**: Check if Inter variable font is available via `next/font/google`.
