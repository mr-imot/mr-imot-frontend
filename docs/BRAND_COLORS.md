# Mr. Imot Brand Colors Guide

This document outlines the brand color system extracted from the hero section and main navigation for consistent use across the application.

## Color Palette Overview

Our brand colors are designed to work harmoniously with the **Etched Glass Background** and create a sophisticated, professional appearance suitable for real estate applications.

## Primary Colors

### Gray Scale (Main Brand Colors)
- **Gray-900** (`#111827`) - Primary text, main buttons, strongest contrast
- **Gray-800** (`#1f2937`) - Secondary text, button hover states  
- **Gray-700** (`#374151`) - Button borders, strong accents
- **Gray-200** (`#e5e7eb`) - Light borders, subtle dividers
- **Gray-100** (`#f3f4f6`) - Light backgrounds, badges

### Glass Background Tones
- **Primary** (`#e8edf0`) - Main background color from Etched Glass
- **Light** (`#f0f4f6`) - Lighter glass tone
- **Lighter** (`#eaf0f2`) - Lightest glass tone

## Usage Examples

### Importing Colors

```typescript
import { brandColors, brandCombinations, getBrandColor } from '@/lib/brand-colors'

// Direct access
const primaryText = brandColors.text.primary
const buttonBg = brandColors.buttons.primary.background

// Using utility function
const navText = getBrandColor('navigation.text')

// Using predefined combinations
const heroColors = brandCombinations.heroPrimary
```

### Component Examples

#### Hero Section Button
```tsx
<button className={`
  px-8 py-3 rounded-full 
  bg-[${brandColors.buttons.primary.background}] 
  text-[${brandColors.buttons.primary.text}]
  hover:bg-[${brandColors.buttons.primary.backgroundHover}]
  shadow-lg hover:shadow-xl
`}>
  List Your Project
</button>
```

#### Navigation Link
```tsx
<a className={`
  text-[${brandColors.navigation.text}] 
  hover:text-[${brandColors.navigation.textHover}]
  hover:bg-[${brandColors.navigation.backgroundHover}]
  px-4 py-2.5 rounded-full
`}>
  Listings
</a>
```

#### Badge/Tag
```tsx
<div className={`
  bg-[${brandColors.badges.default.background}]
  border border-[${brandColors.badges.default.border}]
  text-[${brandColors.badges.default.text}]
  px-3 py-1 rounded-full
`}>
  New Experience
</div>
```

## CSS Custom Properties

The colors are also available as CSS custom properties:

```css
/* Already included in globals.css */
.my-component {
  background-color: var(--brand-gray-900);
  color: var(--brand-text-primary);
  border: 2px solid var(--brand-btn-secondary-border);
}
```

## Design Principles

### 1. Contrast and Readability
- Always use **Gray-900** (`#111827`) for primary text against light backgrounds
- Use **Gray-800** (`#1f2937`) for secondary text
- Ensure sufficient contrast ratios for accessibility

### 2. Button Hierarchy
- **Primary buttons**: Dark background (`Gray-900`) with white text
- **Secondary buttons**: Transparent background with dark border (`Gray-700`)
- **Login button**: White background with black text

### 3. Navigation Consistency
- Use white/transparent colors for navigation on the header
- Maintain consistent hover states across all navigation elements

### 4. Background Harmony
- All colors are designed to work with the Etched Glass background
- Glass tones can be used for subtle background variations

## Color Combinations

### Hero Section
```typescript
const heroColors = brandCombinations.heroPrimary
// {
//   background: '#e8edf0',
//   heading: '#111827',
//   subtext: '#1f2937',
//   badge: { background: 'rgba(243, 244, 246, 0.9)', ... }
// }
```

### Primary Button
```typescript
const primaryBtn = brandCombinations.primaryButton
// Complete button styling with background, hover, shadows
```

### Secondary Button
```typescript
const secondaryBtn = brandCombinations.secondaryButton
// Transparent button with borders and hover effects
```

## Extending the Palette

When adding new colors:

1. **Follow the existing naming convention** (primary.900, buttons.primary.background)
2. **Test against the Etched Glass background** for visual harmony
3. **Ensure accessibility** with proper contrast ratios
4. **Add to brandCombinations** if creating new component patterns
5. **Update CSS custom properties** for global access

## Status Colors

For future use, status colors are available:
- **Success**: `#10b981` (Emerald-500)
- **Warning**: `#f59e0b` (Amber-500)  
- **Error**: `#ef4444` (Red-500)
- **Info**: `#3b82f6` (Blue-500)

## File Locations

- **Main file**: `lib/brand-colors.ts`
- **CSS variables**: Auto-included in `globals.css`
- **Documentation**: `docs/BRAND_COLORS.md` (this file)

---

This color system ensures consistent, professional styling across the entire Mr. Imot application while maintaining the sophisticated aesthetic established in the hero section and navigation.
