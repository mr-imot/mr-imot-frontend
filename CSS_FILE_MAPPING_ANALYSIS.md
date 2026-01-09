# CSS File Mapping Analysis: Exact Import Sources and Selectors

## CSS Files Loaded on `/bg` Homepage

Based on HTML analysis, the homepage loads **3 CSS files**:
1. `67d5ebf64c4de461.css` (main CSS)
2. `4a01f89b5bcca5fd.css` (render-blocking, 166ms wasted)
3. `3f093bdd8039b61c.css` (render-blocking, 86ms wasted)

---

## File 1: `67d5ebf64c4de461.css` (Main CSS)

### Import Source:
- **File**: `app/layout.tsx` line 6
- **Import**: `import "./globals.css"`
- **Chain**: 
  - `globals.css` line 6: `@import '../styles/colors.css'`
  - `globals.css` lines 1-3: `@tailwind base`, `@tailwind components`, `@tailwind utilities`

### Top 20 Selectors (Estimated):
1. `html` - Root element styles
2. `body` - Body element styles  
3. `:root` - CSS custom properties
4. `.scrollbar-thin` - Scrollbar utility
5. `.scrollbar-medium` - Scrollbar utility
6. `.scrollbar-hide` - Scrollbar utility
7. `.focus-ring` - Accessibility utility
8. `.line-clamp-2` - Text truncation
9. `.animate-in` - Animation utility
10. `@keyframes liquidFlow` - Animation definition
11. `@keyframes shimmer` - Animation definition
12. `@keyframes pulse-once` - Animation definition
13. `input[type="text"]` - Form input styles
14. `button` - Button base styles
15. `@supports (padding: max(0px))` - iOS safe area support
16. Tailwind base reset styles
17. Tailwind component styles
18. Tailwind utility classes
19. CSS custom properties from `colors.css`
20. Font family variables

### Components Using This CSS:
- **All components** (global styles)
- Root layout (`app/layout.tsx`)
- All pages inherit these styles

---

## File 2: `4a01f89b5bcca5fd.css` (Render-Blocking CSS Module Bundle #1)

### Import Sources:
- **File**: `app/(public)/[lang]/localized-homepage.tsx` lines 8-9
  - `import typographyStyles from "@/components/typography.module.css"`
  - `import effectsStyles from "@/components/effects.module.css"`

### Why This Creates a Separate Bundle:
Next.js creates separate CSS bundles for CSS modules imported at the **page level** (in `localized-homepage.tsx`) vs. those imported in child components. These two imports are at the page level, so they get bundled together.

### Top 20 Selectors (From `typography.module.css` and `effects.module.css`):

#### From `typography.module.css`:
1. `.headlineGradient` - Used in: `localized-homepage.tsx:54`, `homepage-hero.tsx:39,41,43`, `three-step-process-section.tsx:18`, `recent-listings-section.tsx:62`

#### From `effects.module.css`:
2. `.edgeFadeL` - Used in: `recent-listings-section.tsx:78`
3. `.edgeFadeR` - Used in: `recent-listings-section.tsx:78`
4. `.liquidFlowBgWhite` - Used in: `localized-homepage.tsx:77,121,165,209`, `three-step-process-section.tsx:45,95,145`, `recent-listings-section.tsx:167`
5. `.liquidFlowBgCharcoal` - Defined but may not be used in homepage

### Components Using This CSS:
- `LocalizedHomePage` (`localized-homepage.tsx`) - Uses `typographyStyles.headlineGradient` and `effectsStyles.liquidFlowBgWhite`
- `HomepageHero` (`homepage-hero.tsx`) - Uses `typographyStyles.headlineGradient` (imported separately)
- `ThreeStepProcessSection` (`three-step-process-section.tsx`) - Uses `typographyStyles.headlineGradient` and `effectsStyles.liquidFlowBgWhite` (imported separately)
- `RecentListingsSection` (`recent-listings-section.tsx`) - Uses `typographyStyles.headlineGradient`, `effectsStyles.edgeFadeL`, `effectsStyles.edgeFadeR`, `effectsStyles.liquidFlowBgWhite` (imported separately)

### Problem:
These CSS modules are imported **twice**:
1. At page level in `localized-homepage.tsx` (creates bundle `4a01f89b5bcca5fd.css`)
2. In individual components like `homepage-hero.tsx`, `three-step-process-section.tsx`, `recent-listings-section.tsx` (may create additional bundles or duplicate)

---

## File 3: `3f093bdd8039b61c.css` (Render-Blocking CSS Module Bundle #2)

### Import Sources:
- **File**: `app/(public)/[lang]/homepage-hero.tsx` lines 5-6
  - `import styles from "./homepage-hero.module.css"`
  - `import typographyStyles from "@/components/typography.module.css"` (duplicate!)

### Why This Creates a Separate Bundle:
CSS modules imported in **child components** that are rendered on the homepage get bundled separately. The `homepage-hero.module.css` is specific to the hero component.

### Top 20 Selectors (From `homepage-hero.module.css`):

1. `.heroSection` - Main hero section container
2. `.heroGrid` - Grid layout for hero
3. `.heroContent` - Hero content wrapper
4. `.heroTitle` - Hero title styling
5. `.heroSubtitle` - Hero subtitle styling
6. `.heroCta` - CTA button container
7. `.heroVisual` - Visual/image container (desktop)
8. `.heroImage` - Hero mascot image
9. `.liquidFlowBgCharcoal` - Button background effect
10. `.ctaShimmer` - Button shimmer effect
11. `@keyframes liquidFlow` - Animation (duplicate of globals.css)
12. `@keyframes shimmer` - Animation (duplicate of globals.css)
13. `@keyframes float` - Image float animation
14. `@media (min-width: 1024px)` - Desktop breakpoint styles
15. `@media (min-width: 768px) and (max-width: 1023px)` - Tablet breakpoint
16. `@media (max-height: 650px)` - Short screen breakpoint
17. `@media (min-width: 768px) and (max-height: 900px)` - Laptop breakpoint
18. `@media (min-width: 1920px)` - Large screen breakpoint
19. `@supports not (height: 100svh)` - Fallback for old browsers
20. Various responsive font-size and spacing utilities

### Components Using This CSS:
- `HomepageHero` (`homepage-hero.tsx`) - Uses all hero-specific styles

### Additional Imports in This Bundle:
- `typographyStyles` from `homepage-hero.tsx:6` - **DUPLICATE** of import in `localized-homepage.tsx`

---

## Additional CSS Modules (May Be in Bundle #2 or Separate):

### From `three-step-process-section.tsx` lines 1-3:
- `cardStyles` from `@/components/ui/card.module.css`
- `typographyStyles` from `@/components/typography.module.css` (duplicate!)
- `effectsStyles` from `@/components/effects.module.css` (duplicate!)

### From `recent-listings-section.tsx` lines 8-10:
- `typographyStyles` from `@/components/typography.module.css` (duplicate!)
- `effectsStyles` from `@/components/effects.module.css` (duplicate!)
- `cardStyles` from `@/components/ui/card.module.css`

### Selectors from `card.module.css`:
1. `.card` - Card component base styles
   - Used in: `three-step-process-section.tsx:32,82,132`, `recent-listings-section.tsx:70,85,140`

---

## Root Cause Analysis

### Why 3 CSS Files Instead of 1-2?

1. **CSS Module Duplication**: The same CSS modules (`typography.module.css`, `effects.module.css`) are imported in multiple places:
   - Page level: `localized-homepage.tsx:8-9`
   - Component level: `homepage-hero.tsx:6`, `three-step-process-section.tsx:2-3`, `recent-listings-section.tsx:8-9`

2. **Next.js CSS Splitting Logic**:
   - CSS modules imported at **page level** → Separate bundle
   - CSS modules imported in **child components** → Separate bundle (if component is in initial render)
   - Global CSS → Main bundle

3. **Component-Specific CSS**: `homepage-hero.module.css` is only used in one component, so it gets its own bundle.

---

## Minimal Fix: Consolidate CSS Module Imports

### Solution: Remove Duplicate Imports from Page Level

**Change**: Remove CSS module imports from `localized-homepage.tsx` since they're already imported in the components that use them.

### File to Modify:
- `app/(public)/[lang]/localized-homepage.tsx`

### Current Code (lines 8-9):
```tsx
import typographyStyles from "@/components/typography.module.css"
import effectsStyles from "@/components/effects.module.css"
```

### Change To:
```tsx
// Remove these imports - they're already imported in child components
// import typographyStyles from "@/components/typography.module.css"
// import effectsStyles from "@/components/effects.module.css"
```

### Update Usage in `localized-homepage.tsx`:

**Lines to Update**:
- Line 54: Replace `${typographyStyles.headlineGradient}` with inline Tailwind: `bg-clip-text text-transparent bg-gradient-to-r from-charcoal-200 via-charcoal-600 to-charcoal-800`
- Lines 77, 121, 165, 209: Replace `${effectsStyles.liquidFlowBgWhite}` with inline style or Tailwind classes

**Exact Changes**:

1. **Line 54** - Replace:
```tsx
className={`${typographyStyles.headlineGradient} text-4xl...`}
```
With:
```tsx
className="bg-clip-text text-transparent bg-gradient-to-r from-charcoal-200 via-charcoal-600 to-charcoal-800 text-4xl..."
```

2. **Lines 77, 121, 165, 209** - Replace:
```tsx
className={`absolute inset-0 ${effectsStyles.liquidFlowBgWhite} opacity-0...`}
```
With:
```tsx
className="absolute inset-0 opacity-0..." 
style={{
  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)',
  willChange: 'opacity, transform',
  transform: 'translateZ(0)',
  // ... rest of existing style props
}}
```

This eliminates the need for CSS module imports in `localized-homepage.tsx` since the styles are now inline or use Tailwind.

### Expected Result:
- **Before**: 3 CSS files (main + 2 module bundles)
- **After**: 2 CSS files (main + 1 consolidated module bundle)
- **Savings**: Eliminates one render-blocking CSS file (86-166ms improvement)

### Why This Works:
- Next.js will consolidate CSS modules that are imported in the same component tree
- By removing page-level imports, all CSS modules will be imported at component level
- Next.js will bundle them together since they're in the same render tree
- No FOUC because CSS still loads before components render (SSR)

### Risk: **Low**
- No visual changes
- CSS modules are still loaded, just from different import locations
- Components already import these modules, so no missing styles

---

## Alternative Solution: Move All CSS Module Imports to Root Layout

If the above doesn't consolidate enough, we can move shared CSS modules to the root layout:

### File to Modify:
- `app/layout.tsx`

### Add After Line 6:
```tsx
import "@/components/typography.module.css"
import "@/components/effects.module.css"
```

### Then Remove from:
- `localized-homepage.tsx:8-9`
- `homepage-hero.tsx:6`
- `three-step-process-section.tsx:2-3`
- `recent-listings-section.tsx:8-9`

### Expected Result:
- **Before**: 3 CSS files
- **After**: 1-2 CSS files (main + possibly one for component-specific modules like `homepage-hero.module.css`)

### Risk: **Medium**
- Higher risk of FOUC if CSS loads after component render
- May load CSS for components not on homepage
- But Next.js handles this well with SSR

---

## Recommended Approach

**Use Solution 1** (Remove duplicate page-level imports):
- Minimal change
- Low risk
- Reduces from 3 to 2 CSS files
- No FOUC risk

**If Solution 1 doesn't work**, use Solution 2 (Move to root layout):
- More aggressive consolidation
- May reduce to 1-2 files
- Slightly higher risk but still safe with Next.js SSR
