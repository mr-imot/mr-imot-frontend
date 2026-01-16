# Hero LCP Image Performance Fix

## Root Cause Analysis

### Issue Summary
Lighthouse reports "Improve image delivery" warnings for the homepage hero mascot image:
- **Mobile/Tablet**: Downloads 480×617px for displayed 385×495px
- **Desktop**: Downloads 640×823px for displayed 498×640px

### Investigation Findings

#### 1. CSS Dimensions (Confirmed)
**File**: `app/(public)/[lang]/homepage-hero.module.css`

- **Mobile** (<640px): `width: 220px` (line 171)
- **Tablet** (640-1023px): `width: 385px` (line 182)
- **Desktop** (≥1024px): `width: 498px` (line 189)

#### 2. Container Constraints
**File**: `app/(public)/[lang]/homepage-hero.tsx`

- Container: `max-w-7xl mx-auto px-4 sm:px-6 md:px-8` (line 19)
  - `max-w-7xl` = 1280px (Tailwind default)
  - Padding: 16px (mobile) → 24px (sm) → 32px (md+)
- Grid: `grid lg:grid-cols-2` (line 21)
  - 2 columns on desktop (≥1024px)
  - Gap: `clamp(1rem, 2vw, 2rem)` ≈ 16-32px

**Analysis**: Container constraints do NOT prevent the image from reaching its CSS-defined widths. The image can render at the specified dimensions.

#### 3. Sizes Attribute (Original)
```tsx
sizes="(max-width: 639px) 220px, (max-width: 1023px) 385px, 498px"
```

**Breakpoint alignment**:
- CSS: `<640px` → 220px, `640-1023px` → 385px, `≥1024px` → 498px
- Sizes: `≤639px` → 220px, `640-1023px` → 385px, default → 498px
- ✅ **Matches CSS breakpoints correctly**

#### 4. DPR Calculation
- **Mobile/Tablet**: 385px displayed × 1.25 DPR = 481.25px → Browser selects **480w** candidate
- **Desktop**: 498px displayed × 1.29 DPR = 642.42px → Browser selects **640w** candidate

**Conclusion**: Browser selection is **correct** for typical DPR values. However, Lighthouse flags this because:
1. The intrinsic downloaded image size (480w/640w) exceeds the displayed CSS size (385px/498px) when DPR is not accounted for in the warning calculation
2. `@imagekit/next` may generate srcset candidates that don't perfectly align with the exact needed widths, causing the browser to round up

#### 5. @imagekit/next Limitations
- The `@imagekit/next` Image component generates srcset automatically, but we have limited control over the exact candidate widths
- Next.js `deviceSizes` config (`next.config.mjs` line 19) includes `[120, 160, 240, 320, 480, 640, ...]`, but this may not be used by `@imagekit/next`
- The component may not generate candidates at exactly 220px, 385px, or 498px, forcing the browser to select the next available size (480w, 640w)

## Solution Implemented

### Change: Switch to `next/image` with ImageKit Loader

**File**: `app/(public)/[lang]/homepage-hero.tsx`

**Rationale**:
1. `next/image` provides full control over srcset generation
2. Generates srcset candidates based on `deviceSizes` and `imageSizes` from `next.config.mjs`
3. Automatically includes `fetchpriority="high"` and preload link for LCP images when `priority={true}`
4. Better integration with Next.js optimization pipeline

**Changes Made**:
1. **Import change** (line 2):
   ```tsx
   // Before
   import { Image } from "@imagekit/next"
   import { toIkPath } from "@/lib/imagekit"
   
   // After
   import Image from "next/image"
   import { IK_URL_ENDPOINT } from "@/lib/imagekit"
   ```

2. **Image component** (lines 99-122):
   ```tsx
   <Image
     src={
       lang === "bg"
         ? "/Logo/mrimot.com-mascot-bg-0_-komisiona.png"
         : "/Logo/0_-commissions-mr-imot.png"
     }
     width={780}
     height={1000}
     priority
     fetchPriority="high"
     sizes="(max-width: 639px) 220px, (max-width: 1023px) 385px, 498px"
     className={styles.heroImage}
     loader={({ src, width, quality = 55 }) => {
       // ImageKit loader: clean path-based transformation
       // src is already a relative path like "/Logo/..."
       const q = quality ?? 55
       return `${IK_URL_ENDPOINT}/tr:w-${width},q-${q},f-avif,fo-auto${src}`
     }}
   />
   ```

**Key Improvements**:
- ✅ **Relative paths**: Direct paths like `/Logo/...` instead of full URLs, avoiding URL parsing issues
- ✅ **Clean loader**: No regex hacks or path manipulation - just appends transformations to endpoint
- ✅ **AVIF format**: Using `f-avif` instead of `f-auto` for better compression (typically 30-50% smaller than WebP)
- ✅ **Lower quality**: Reduced from 60 to 55 (sufficient for line-art mascot, reduces file size)
- ✅ **Simplified sizes**: Removed unnecessary `(min-width: 1024px)` clause

**Benefits**:
- Next.js generates srcset with candidates from `deviceSizes` config
- Browser can select more precise widths (e.g., 240w, 320w, 480w, 640w) based on actual needs
- Automatic preload link in `<head>` for LCP optimization
- Better Lighthouse scores due to more accurate srcset selection

## Validation Checklist

### 1. Production Build Verification
```bash
cd mr-imot-frontend
pnpm build
pnpm start
```

### 2. DevTools Inspection (Production Mode)

#### A. Computed Width Verification
1. Open DevTools → Elements panel
2. Select the hero `<img>` element
3. Check **Computed** tab → `width` property
4. Verify at each breakpoint:
   - **Mobile** (<640px viewport): `width: 220px` (CSS pixels)
   - **Tablet** (640-1023px viewport): `width: 385px` (CSS pixels)
   - **Desktop** (≥1024px viewport): `width: 498px` (CSS pixels)

#### B. Device Pixel Ratio
1. Open DevTools → Console
2. Run: `window.devicePixelRatio`
3. Note the DPR value (typically 1, 1.25, 1.5, 2, or 3)

#### C. Srcset and Current Source
1. In Elements panel, inspect the `<img>` element
2. Check attributes:
   - `srcset`: Should contain multiple width candidates (e.g., `.../tr:w-220,q-60... 220w, .../tr:w-240,q-60... 240w, ...`)
   - `sizes`: `(max-width: 639px) 220px, (max-width: 1023px) 385px, (min-width: 1024px) 498px`
   - `fetchpriority`: Should be `"high"` (if supported)
3. In Network panel:
   - Filter by "Img"
   - Find the hero image request
   - Check `currentSrc` or `src` - should match a srcset candidate
   - Verify the requested width ≈ `computed CSS width × DPR`

#### D. Preload Link
1. In Elements panel, check `<head>` section
2. Look for: `<link rel="preload" as="image" href="..." imagesrcset="..." imagesizes="...">`
3. Should reference the hero image with appropriate srcset

#### E. Response Format
1. In Network panel, click the hero image request
2. Check **Headers** → `Content-Type`
3. Should be `image/avif` (preferred) or `image/webp` (fallback for older browsers)
4. Should NOT be `image/png` - if it is, the `f-avif` transformation isn't working

### 3. Lighthouse Audit
1. Run Lighthouse in production mode
2. Check **Performance** → **"Properly size images"** or **"Serve images in next-gen formats"**
3. The hero image should:
   - ✅ No longer appear in "Properly size images" warnings, OR
   - ✅ Show minimal savings (<4 KiB) indicating the warning is not actionable
4. Verify **LCP** metric is optimal (should be <2.5s)

### 4. Expected Results

#### Before Fix:
- Lighthouse: "Downloads 480×617 for displayed 385×495" (mobile/tablet)
- Lighthouse: "Downloads 640×823 for displayed 498×640" (desktop)

#### After Fix:
- Browser selects srcset candidates closer to actual needs
- Lighthouse warning should disappear or show minimal savings
- LCP should improve due to better preloading

### 5. Cross-Device Testing
Test on:
- **Mobile** (375px, 414px viewports) - DPR typically 2-3
- **Tablet** (768px, 1024px viewports) - DPR typically 1.5-2
- **Desktop** (1280px, 1920px viewports) - DPR typically 1-1.5

## Files Modified

1. **`app/(public)/[lang]/homepage-hero.tsx`**
   - Switched from `@imagekit/next` Image to `next/image`
   - Added ImageKit loader function
   - Updated imports

## Notes

- Other images using `@imagekit/next` remain unchanged (only the hero LCP image was modified)
- The loader uses relative paths directly - no `toIkPath()` needed for `next/image` loader
- **AVIF format** (`f-avif`) provides better compression than WebP/PNG, typically reducing file size by 30-50%
- **Quality 55** is optimal for line-art mascot images - can go as low as 40-45 if needed
- The `sizes` attribute uses simple fallback syntax (no `min-width` clause needed for last value)

## If Issues Persist

If Lighthouse still flags the image after this fix:

1. **Verify actual rendered width**: Use DevTools to confirm the image is rendering at exactly 220px/385px/498px (not constrained by container)
2. **Check srcset candidates**: Verify Next.js is generating appropriate candidates in the HTML
3. **Adjust deviceSizes**: Modify `next.config.mjs` `deviceSizes` to include exact widths (220, 385, 498) if needed
4. **Consider DPR-aware sizes**: Use `calc()` in sizes attribute if DPR is consistently causing oversizing
