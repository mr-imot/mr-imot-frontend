# Performance Optimization Plan - Homepage

## Current State Analysis

**Score: 41 → 43 (minimal improvement)**

### Critical Issues Identified:

1. **Main-thread work: 9.7s** (8.5s in "Other" category)
   - Root cause: React hydration blocking render
   - Entire `localized-homepage.tsx` is client component
   - ViewportLock causing forced reflows (110ms)

2. **LCP Element render delay: 2,110ms**
   - Hero subtitle is LCP element
   - Delay caused by hydration blocking

3. **Legacy JavaScript: 12 KiB wasted**
   - TypeScript target: ES6 (too old)
   - Next.js transpiling modern features unnecessarily
   - Polyfills for: Array.at, Array.flat, Object.fromEntries, etc.

4. **Render-blocking CSS: 330ms**
   - Multiple CSS chunks loading sequentially
   - 29.8 KiB total CSS blocking render

5. **Forced reflow: 110ms**
   - ViewportLock using `getBoundingClientRect()` synchronously
   - Multiple layout queries causing reflows

6. **Non-composited animations: 10 instances**
   - `liquidFlow` animation using `background-image` in keyframes
   - Not GPU-accelerated, causing repaints

7. **Unused CSS: 21 KiB**
   - Tailwind not purging unused classes properly

8. **Image optimization: 69 KiB savings**
   - Logo: 400x400 displayed as 95x95
   - ImageKit images not using responsive sizes

## Optimization Plan (Phased Approach)

### Phase 1: Quick Wins (Target: 45-50 score)
**Estimated impact: +5-10 points**

#### 1.1 Fix Legacy JavaScript (12 KiB savings)
- **File**: `tsconfig.json`
- **Change**: Update `target` from `"ES6"` to `"ES2020"` or `"ES2022"`
- **File**: `next.config.mjs`
- **Change**: Add `swcMinify: true` and configure SWC to not transpile modern features
- **Impact**: Removes unnecessary polyfills, reduces bundle size

#### 1.2 Optimize Logo Image (38.7 KiB savings)
- **File**: `components/site-header.tsx`
- **Change**: 
  - Create optimized logo at 95x95 (or use ImageKit with proper size)
  - Use WebP format
  - Add proper `sizes` attribute
- **Impact**: Reduces image download by 38.7 KiB

#### 1.3 Fix Non-Composited Animations (Reduce CLS)
- **File**: `app/globals.css`
- **Change**: Replace `liquidFlow` animation to use `transform` and `opacity` instead of `background-image`
- **Alternative**: Use CSS `will-change` and ensure animations are GPU-accelerated
- **Impact**: Reduces repaints, improves CLS

#### 1.4 Optimize ImageKit Images (30 KiB savings)
- **Files**: `app/[lang]/homepage-hero.tsx`, `app/[lang]/localized-homepage.tsx`
- **Change**: Use proper responsive `sizes` and ImageKit transformations
- **Impact**: Reduces image download sizes

### Phase 2: Reduce Main-Thread Work (Target: 50-60 score)
**Estimated impact: +10-15 points**

#### 2.1 Fix Forced Reflows (110ms savings)
- **File**: `components/ViewportLock.tsx`
- **Change**: 
  - Batch layout reads using `requestAnimationFrame`
  - Use `ResizeObserver` instead of `getBoundingClientRect()` in resize handlers
  - Cache header height and only update when needed
- **Impact**: Reduces forced reflows significantly

#### 2.2 Reduce Client Component Size
- **File**: `app/[lang]/localized-homepage.tsx`
- **Change**: Split into smaller server components:
  - Move "3-Step Process" section to server component
  - Move "What Makes Different" section to server component
  - Keep only interactive parts as client components
- **Impact**: Reduces hydration time, improves LCP

#### 2.3 Defer ViewportLock Initialization
- **File**: `components/ViewportLock.tsx`
- **Change**: 
  - Initialize after first paint
  - Use `requestIdleCallback` for non-critical viewport locking
- **Impact**: Reduces initial main-thread work

### Phase 3: CSS Optimization (Target: 60-70 score)
**Estimated impact: +10 points**

#### 3.1 Reduce Unused CSS (21 KiB savings)
- **File**: `tailwind.config.ts`
- **Change**: 
  - Verify `content` paths are correct
  - Remove any `safelist` entries that aren't needed
  - Check for dynamic class generation that prevents purging
- **File**: `postcss.config.mjs`
- **Change**: Ensure Tailwind purge is working correctly
- **Impact**: Reduces CSS bundle size

#### 3.2 Optimize CSS Loading (330ms savings)
- **File**: `app/[lang]/page.tsx`
- **Change**: 
  - Expand critical CSS to include more above-the-fold styles
  - Defer non-critical CSS using `next/dynamic` for stylesheets
- **Impact**: Reduces render-blocking time

#### 3.3 Split CSS by Route
- **File**: `next.config.mjs`
- **Change**: Configure CSS splitting per route
- **Impact**: Reduces initial CSS payload

### Phase 4: Advanced Optimizations (Target: 70-80 score)
**Estimated impact: +10-15 points**

#### 4.1 Implement Partial Prerendering (Next.js 15)
- **File**: `next.config.mjs`
- **Change**: Enable experimental partial prerendering
- **Impact**: Reduces LCP delay significantly

#### 4.2 Optimize React Hydration
- **Files**: All client components
- **Change**: 
  - Use `useTransition` for non-urgent updates
  - Implement progressive hydration
  - Split hydration into chunks
- **Impact**: Reduces main-thread blocking

#### 4.3 Code Splitting Improvements
- **Files**: All dynamic imports
- **Change**: 
  - More aggressive code splitting
  - Preload critical chunks
  - Use `next/dynamic` with `loading` states
- **Impact**: Reduces initial bundle size

## Implementation Priority

### Immediate (Do First - Test After):
1. Fix Legacy JavaScript (Phase 1.1) - **5 min**
2. Optimize Logo Image (Phase 1.2) - **10 min**
3. Fix Forced Reflows (Phase 2.1) - **15 min**

### Short-term (Do Next - Test After):
4. Fix Non-Composited Animations (Phase 1.3) - **20 min**
5. Optimize ImageKit Images (Phase 1.4) - **15 min**
6. Reduce Client Component Size (Phase 2.2) - **30 min**

### Medium-term (Iterate):
7. Reduce Unused CSS (Phase 3.1) - **20 min**
8. Optimize CSS Loading (Phase 3.2) - **30 min**
9. Defer ViewportLock (Phase 2.3) - **15 min**

### Long-term (Advanced):
10. Partial Prerendering (Phase 4.1) - **1 hour**
11. Optimize React Hydration (Phase 4.2) - **2 hours**
12. Code Splitting Improvements (Phase 4.3) - **1 hour**

## Testing Strategy

After each phase:
1. Run Lighthouse audit
2. Check Core Web Vitals
3. Monitor main-thread work in Performance tab
4. Verify no visual regressions
5. Test on mobile devices

## Expected Final Results

- **Performance Score**: 70-80+
- **LCP**: < 2.5s
- **FCP**: < 1s
- **TBT**: < 2000ms
- **Main-thread work**: < 3s
- **Bundle size**: Reduced by ~50-70 KiB

## Notes

- Some optimizations may require design trade-offs (e.g., removing animations)
- Test each phase independently to measure impact
- Some Next.js 15 features may not be available in current version
- Consider user experience when removing/deferring features

