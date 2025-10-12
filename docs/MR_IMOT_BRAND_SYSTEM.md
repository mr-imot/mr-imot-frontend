# Mr. Imot Official Brand System

**Last Updated**: January 2025  
**Status**: ACTIVE - This is the ONLY brand system to use

## Brand Identity

Mr. Imot is a **conservative, professional real estate platform** that connects buyers directly with developers. Our brand reflects trustworthiness, sophistication, and transparency.

## Primary Brand Colors (Earth‑tone)

- **Primary (Charcoal)**: `#264653` — buttons, primary UI, headings on dark bg
- **Accent (Saffron)**: `#e9c46a` — accents, badges, highlights (avoid as text on white)
- **Supporting**: 
  - Persian Green `#2a9d8f` (sparingly for charts/highlights)
  - Sandy Brown `#f4a261` (marketing badges)
  - Burnt Sienna `#e76f51` (warnings/marketing)
  - Backgrounds remain neutral white/gray for readability

### Glass Background System
- **Primary Glass**: `#e8edf0` - Main etched glass background
- **Light Glass**: `#f0f4f6` - Lighter glass tone
- **Lighter Glass**: `#eaf0f2` - Lightest glass tone

### Status Colors (Complementary)
- Success: `#10b981` (Emerald-500)
- Warning: `#f59e0b` (Amber-500)
- Error: `#ef4444` (Red-500)
- Info: `#3b82f6` (Blue-500)

## Typography System

### Primary Sans: Inter (with Cyrillic)
- Usage: Body text, navigation, UI, buttons
- Weights: 400, 500, 600, 700
- Variable: `--font-inter` → mapped to `--font-sans`

### Headline Serif: Lora (with Cyrillic)
- Usage: Headlines (H1–H3), hero, key accents
- Weights: 500, 600, 700
- Variable: `--font-lora` → mapped to `--font-serif`

### Supporting Fonts
- Geist Sans/Mono remain fallbacks (`--font-sans`, `--font-mono`)

## Button System

### Primary Button
- **Background**: `#111827` (Gray-900)
- **Text**: `#ffffff` (White)
- **Hover**: `#1f2937` (Gray-800)
- **Usage**: "List Your Project", main CTAs

### Secondary Button  
- **Background**: `transparent`
- **Border**: `#374151` (Gray-700), 2px
- **Text**: `#111827` (Gray-900)
- **Hover**: Background `#111827`, Text `#ffffff`
- **Usage**: "Browse Properties", secondary actions

### Login Button (Header)
- **Background**: `#ffffff` (White)
- **Text**: `#000000` (Black)
- **Hover**: `rgba(255, 255, 255, 0.9)`
- **Usage**: Header authentication

## Navigation System

### Header Navigation
- Text: White/90 on Charcoal backgrounds
- Buttons: Charcoal 700 → hover Charcoal 800 → focus ring Charcoal 300, text white
- Avoid Saffron as foreground on white backgrounds; use as outlines/badges

## Background System

### Etched Glass Effect
- **Primary**: Custom etched glass pattern with subtle gray overlay
- **Gradient Fallback**: `linear-gradient(135deg, #eaf0f2 0%, #f0f4f6 50%, #e8edf0 100%)`

## Usage Rules

### ✅ DO USE
- Conservative gray system (#111827 as primary)
- Figtree for all UI text
- Instrument Serif for headlines and accents
- Status colors for appropriate states
- Glass backgrounds for sections

### ❌ DON'T USE
- ~~Any coral/pink colors (#FF385C)~~ - REMOVED
- ~~Bright or vibrant colors~~ - Not our brand
- ~~Comic Sans, Arial, or system fonts~~ - Use brand fonts only
- Random color combinations - Stick to the system

## Implementation

### CSS Custom Properties
Core variables set in `/app/globals.css`:
```css
/* Brand */
--brand: #264653;         /* Charcoal */
--accent: #e9c46a;        /* Saffron */
/* Fonts */
--font-sans: var(--font-inter);
--font-serif: var(--font-lora);
/* shadcn tokens mapped to brand */
--primary: var(--brand);
--primary-foreground: #ffffff;
```

### Tailwind Mapping
Use Tailwind utilities tied to CSS variables and extended palette:
```ts
// tailwind.config.ts
extend: {
  colors: {
    brand: 'var(--brand)',
    accent: 'var(--accent)',
    charcoal: {/* ... */},
    saffron: {/* ... */}
  },
  fontFamily: {
    sans: 'var(--font-sans)',
    serif: 'var(--font-serif)'
  }
}
```

## File Locations
- **Main Brand Colors**: `/lib/brand-colors.ts`
- **CSS Variables**: `/app/globals.css`
- **Documentation**: `/docs/MR_IMOT_BRAND_SYSTEM.md` (this file)

---

**Remember**: Focus on legibility in Bulgarian. Use Inter for UI text, Lora for headlines, maintain AA contrast (≥4.5:1). Saffron is accent-only.