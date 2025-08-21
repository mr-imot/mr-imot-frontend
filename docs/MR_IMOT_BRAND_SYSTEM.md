# Mr. Imot Official Brand System

**Last Updated**: January 2025  
**Status**: ACTIVE - This is the ONLY brand system to use

## Brand Identity

Mr. Imot is a **conservative, professional real estate platform** that connects buyers directly with developers. Our brand reflects trustworthiness, sophistication, and transparency.

## Primary Brand Colors

### Conservative Gray System
- **Primary Brand**: `#111827` (Gray-900) - Main brand color for buttons, text, accents
- **Secondary**: `#1f2937` (Gray-800) - Hover states, secondary text  
- **Tertiary**: `#374151` (Gray-700) - Borders, subtle accents
- **Light Gray**: `#e5e7eb` (Gray-200) - Light borders, dividers
- **Background**: `#f3f4f6` (Gray-100) - Light backgrounds, badges

### Glass Background System
- **Primary Glass**: `#e8edf0` - Main etched glass background
- **Light Glass**: `#f0f4f6` - Lighter glass tone
- **Lighter Glass**: `#eaf0f2` - Lightest glass tone

### Status Colors (Complementary)
- **Success**: `#10b981` (Emerald-500) - Verification, positive states
- **Warning**: `#f59e0b` (Amber-500) - Pending states, alerts
- **Error**: `#ef4444` (Red-500) - Errors, negative states
- **Info**: `#3b82f6` (Blue-500) - Information, neutral actions

## Typography System

### Primary Font: **Figtree**
- **Usage**: Body text, navigation, UI elements
- **Weights**: 300 (Light), 400 (Regular), 500 (Medium), 600 (Semi-bold), 700 (Bold)
- **Variable**: `--font-figtree`

### Accent Font: **Instrument Serif**
- **Usage**: Headlines, hero text, elegant accents
- **Weights**: 400 (Regular)
- **Styles**: Normal, Italic
- **Variable**: `--font-instrument-serif`

### Supporting Fonts
- **GeistSans**: `--font-sans` - System fallback
- **GeistMono**: `--font-mono` - Code, monospace text

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

### Header Navigation (Overlay Style)
- **Text**: `rgba(255, 255, 255, 0.8)` (White/80)
- **Text Hover**: `rgba(255, 255, 255, 1)` (White)
- **Background Hover**: `rgba(255, 255, 255, 0.1)` (White/10)
- **Logo Background**: `rgba(255, 255, 255, 0.1)` (White/10)

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
All colors are available as CSS variables:
```css
/* Primary brand colors */
var(--brand-gray-900)     /* #111827 */
var(--brand-gray-800)     /* #1f2937 */
var(--brand-gray-700)     /* #374151 */

/* Buttons */
var(--brand-btn-primary-bg)       /* #111827 */
var(--brand-btn-primary-text)     /* #ffffff */

/* Glass backgrounds */
var(--brand-glass-primary)        /* #e8edf0 */
var(--brand-glass-light)          /* #f0f4f6 */

/* Status colors */
var(--brand-success)              /* #10b981 */
var(--brand-warning)              /* #f59e0b */
var(--brand-error)                /* #ef4444 */
```

### TypeScript Utilities
```typescript
import { brandColors } from '@/lib/brand-colors'

const primaryColor = brandColors.primary[900]  // #111827
const buttonBg = brandColors.buttons.primary.background
```

## File Locations
- **Main Brand Colors**: `/lib/brand-colors.ts`
- **CSS Variables**: `/app/globals.css`
- **Documentation**: `/docs/MR_IMOT_BRAND_SYSTEM.md` (this file)

---

**Remember**: This is a **conservative, professional real estate brand**. All design decisions should reflect trustworthiness, sophistication, and clarity. No bright colors, no trendy styles - just clean, professional design that builds confidence.