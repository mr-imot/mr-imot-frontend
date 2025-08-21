/**
 * Mr. Imot Brand Colors - OFFICIAL BRAND SYSTEM
 * 
 * Conservative gray-based brand system extracted from the homepage hero section,
 * navigation, and buttons. This is the ONLY brand color system to use.
 * 
 * Key Brand Identity:
 * - Primary: Conservative Gray (#111827) - Professional real estate
 * - Typography: Figtree (main) + Instrument Serif (accents)  
 * - Background: Etched glass effect with subtle gray tones
 * - Navigation: White/transparent for header overlay
 */

export const brandColors = {
  // Primary Grays - Main brand colors
  primary: {
    900: '#111827',     // text-gray-900 - Primary text, main buttons
    800: '#1f2937',     // text-gray-800 - Secondary text, hover states  
    700: '#374151',     // border-gray-700 - Button borders, strong accents
    600: '#4b5563',     // Medium gray for subtle elements
    500: '#6b7280',     // Mid-tone gray
    400: '#9ca3af',     // Light gray for disabled states
    300: '#d1d5db',     // Very light gray
    200: '#e5e7eb',     // border-gray-200 - Light borders, subtle dividers
    100: '#f3f4f6',     // bg-gray-100 - Light backgrounds, badges
    50: '#f9fafb',      // Lightest gray for backgrounds
  },

  // Background Glass Tones - From Etched Glass Background
  glass: {
    primary: '#e8edf0',    // Main background color
    light: '#f0f4f6',      // Lighter glass tone
    lighter: '#eaf0f2',    // Lightest glass tone
    fallback: 'linear-gradient(135deg, #eaf0f2 0%, #f0f4f6 50%, #e8edf0 100%)', // CSS fallback
  },

  // Header Navigation Colors
  navigation: {
    text: 'rgba(255, 255, 255, 0.8)',        // text-white/80 - Default nav link color
    textHover: 'rgba(255, 255, 255, 1)',     // text-white - Hover state
    backgroundHover: 'rgba(255, 255, 255, 0.1)', // hover:bg-white/10 - Nav hover background
    logoBackground: 'rgba(255, 255, 255, 0.1)',  // bg-white/10 - Logo container
    logoBackgroundHover: 'rgba(255, 255, 255, 0.2)', // hover:bg-white/20 - Logo hover
    logoBorder: 'rgba(255, 255, 255, 0.2)',   // border-white/20 - Logo border
  },

  // Button System
  buttons: {
    // Primary Button (List Your Project)
    primary: {
      background: '#111827',    // bg-gray-900
      backgroundHover: '#1f2937', // hover:bg-gray-800
      text: '#ffffff',          // text-white
      shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', // shadow-lg
      shadowHover: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', // hover:shadow-xl
    },
    
    // Secondary Button (Browse Properties)
    secondary: {
      background: 'transparent',
      border: '#374151',        // border-gray-700
      borderWidth: '2px',
      text: '#111827',          // text-gray-900
      backgroundHover: '#111827', // hover:bg-gray-900
      textHover: '#ffffff',     // hover:text-white
      shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', // shadow-lg
      shadowHover: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', // hover:shadow-xl
    },

    // Login Button (Header)
    login: {
      background: '#ffffff',    // bg-white
      backgroundHover: 'rgba(255, 255, 255, 0.9)', // hover:bg-white/90
      text: '#000000',          // text-black
      textHover: '#000000',     // stays black on hover
    },
  },

  // Badge/Tag System
  badges: {
    default: {
      background: 'rgba(243, 244, 246, 0.9)', // bg-gray-100/90
      border: '#e5e7eb',       // border-gray-200
      text: '#374151',         // text-gray-700
    },
  },

  // Text Hierarchy
  text: {
    primary: '#111827',        // text-gray-900 - Main headings
    secondary: '#1f2937',      // text-gray-800 - Secondary text
    tertiary: '#374151',       // text-gray-700 - Tertiary text
    muted: '#6b7280',          // text-gray-500 - Muted text
    light: 'rgba(255, 255, 255, 0.8)', // text-white/80 - Light text on dark backgrounds
  },

  // Effects and Utilities
  effects: {
    dropShadow: 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.1))', // drop-shadow-sm
    backdropBlur: 'blur(8px)', // backdrop-blur-sm
    whiteOverlay: {
      10: 'rgba(255, 255, 255, 0.1)',  // bg-white/10
      20: 'rgba(255, 255, 255, 0.2)',  // bg-white/20
      90: 'rgba(255, 255, 255, 0.9)',  // bg-white/90
    },
  },

  // Status Colors (for future use)
  status: {
    success: '#10b981',        // Emerald-500
    warning: '#f59e0b',        // Amber-500
    error: '#ef4444',          // Red-500
    info: '#3b82f6',           // Blue-500
  },
} as const

// Utility functions for accessing colors
export const getBrandColor = (path: string) => {
  const keys = path.split('.')
  let current: any = brandColors
  
  for (const key of keys) {
    if (current[key] !== undefined) {
      current = current[key]
    } else {
      console.warn(`Brand color path "${path}" not found`)
      return null
    }
  }
  
  return current
}

// Common color combinations used in the design
export const brandCombinations = {
  heroPrimary: {
    background: brandColors.glass.primary,
    heading: brandColors.text.primary,
    subtext: brandColors.text.secondary,
    badge: {
      background: brandColors.badges.default.background,
      text: brandColors.badges.default.text,
      border: brandColors.badges.default.border,
    },
  },
  
  navigation: {
    text: brandColors.navigation.text,
    textHover: brandColors.navigation.textHover,
    backgroundHover: brandColors.navigation.backgroundHover,
    logo: {
      background: brandColors.navigation.logoBackground,
      backgroundHover: brandColors.navigation.logoBackgroundHover,
      border: brandColors.navigation.logoBorder,
    },
  },
  
  primaryButton: {
    background: brandColors.buttons.primary.background,
    backgroundHover: brandColors.buttons.primary.backgroundHover,
    text: brandColors.buttons.primary.text,
    shadow: brandColors.buttons.primary.shadow,
    shadowHover: brandColors.buttons.primary.shadowHover,
  },
  
  secondaryButton: {
    background: brandColors.buttons.secondary.background,
    border: brandColors.buttons.secondary.border,
    text: brandColors.buttons.secondary.text,
    backgroundHover: brandColors.buttons.secondary.backgroundHover,
    textHover: brandColors.buttons.secondary.textHover,
  },
} as const

// CSS Custom Properties export for use in global styles
export const brandColorsCSSVariables = `
:root {
  /* Primary Grays */
  --brand-gray-900: ${brandColors.primary[900]};
  --brand-gray-800: ${brandColors.primary[800]};
  --brand-gray-700: ${brandColors.primary[700]};
  --brand-gray-200: ${brandColors.primary[200]};
  --brand-gray-100: ${brandColors.primary[100]};
  
  /* Glass Background */
  --brand-glass-primary: ${brandColors.glass.primary};
  --brand-glass-light: ${brandColors.glass.light};
  --brand-glass-lighter: ${brandColors.glass.lighter};
  
  /* Navigation */
  --brand-nav-text: ${brandColors.navigation.text};
  --brand-nav-text-hover: ${brandColors.navigation.textHover};
  --brand-nav-bg-hover: ${brandColors.navigation.backgroundHover};
  
  /* Buttons */
  --brand-btn-primary-bg: ${brandColors.buttons.primary.background};
  --brand-btn-primary-bg-hover: ${brandColors.buttons.primary.backgroundHover};
  --brand-btn-secondary-border: ${brandColors.buttons.secondary.border};
  
  /* Text */
  --brand-text-primary: ${brandColors.text.primary};
  --brand-text-secondary: ${brandColors.text.secondary};
  --brand-text-tertiary: ${brandColors.text.tertiary};
}
`

export type BrandColors = typeof brandColors
export type BrandCombinations = typeof brandCombinations
