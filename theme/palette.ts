// Palette and UI tokens for mr-imot--frontend

export const palette = {
  black: {
    DEFAULT: '#000000',
    '100': '#000000',
    '200': '#000000',
    '300': '#000000',
    '400': '#000000',
    '500': '#000000',
    '600': '#333333',
    '700': '#666666',
    '800': '#999999',
    '900': '#cccccc',
  },
  oxford_blue: {
    DEFAULT: '#14213d',
    '100': '#04070c',
    '200': '#080d19',
    '300': '#0c1425',
    '400': '#101b31',
    '500': '#14213d',
    '600': '#29447e',
    '700': '#3e67bf',
    '800': '#7e99d5',
    '900': '#beccea',
  },
  orange_web: {
    DEFAULT: '#fca311',
    '100': '#362101',
    '200': '#6b4201',
    '300': '#a16402',
    '400': '#d68502',
    '500': '#fca311',
    '600': '#fdb541',
    '700': '#fec871',
    '800': '#fedaa0',
    '900': '#ffedd0',
  },
  platinum: {
    DEFAULT: '#e5e5e5',
    '100': '#2e2e2e',
    '200': '#5c5c5c',
    '300': '#8a8a8a',
    '400': '#b8b8b8',
    '500': '#e5e5e5',
    '600': '#ebebeb',
    '700': '#f0f0f0',
    '800': '#f5f5f5',
    '900': '#fafafa',
  },
  white: {
    DEFAULT: '#ffffff',
    '100': '#333333',
    '200': '#666666',
    '300': '#999999',
    '400': '#cccccc',
    '500': '#ffffff',
    '600': '#ffffff',
    '700': '#ffffff',
    '800': '#ffffff',
    '900': '#ffffff',
  },
} as const;

export const tokens = {
  // Primary and accent
  primary: palette.oxford_blue.DEFAULT, // #14213d
  primaryForeground: palette.white.DEFAULT,
  accent: palette.orange_web.DEFAULT, // #fca311
  accentForeground: palette.black.DEFAULT,

  // Neutral usage
  background: palette.white.DEFAULT,
  surface: palette.platinum.DEFAULT,
  border: palette.platinum.DEFAULT,
  text: palette.black.DEFAULT,
  subtleText: palette.black['700'],

  // Semantic examples (can be tuned later if needed)
  success: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6',
  destructive: '#ef4444',
} as const;

// Convenience exports in multiple formats (matching your provided shapes)
export const csv = '000000,14213d,fca311,e5e5e5,ffffff';
export const withHash = ['#000000', '#14213d', '#fca311', '#e5e5e5', '#ffffff'];
export const array = ['000000', '14213d', 'fca311', 'e5e5e5', 'ffffff'];
export const object = {
  'Black': '000000',
  'Oxford Blue': '14213d',
  'Orange (web)': 'fca311',
  'Platinum': 'e5e5e5',
  'White': 'ffffff',
} as const;

export const extendedArray = [
  { name: 'Black', hex: '000000', rgb: [0, 0, 0], cmyk: [0, 0, 0, 100], hsb: [0, 0, 0], hsl: [0, 0, 0], lab: [0, 0, 0] },
  { name: 'Oxford Blue', hex: '14213d', rgb: [20, 33, 61], cmyk: [67, 46, 0, 76], hsb: [221, 67, 24], hsl: [221, 51, 16], lab: [13, 5, -20] },
  { name: 'Orange (web)', hex: 'fca311', rgb: [252, 163, 17], cmyk: [0, 35, 93, 1], hsb: [37, 93, 99], hsl: [37, 98, 53], lab: [74, 24, 76] },
  { name: 'Platinum', hex: 'e5e5e5', rgb: [229, 229, 229], cmyk: [0, 0, 0, 10], hsb: [0, 0, 90], hsl: [0, 0, 90], lab: [91, 0, 0] },
  { name: 'White', hex: 'ffffff', rgb: [255, 255, 255], cmyk: [0, 0, 0, 0], hsb: [0, 0, 100], hsl: [0, 0, 100], lab: [100, 0, 0] },
];

export const xml = `
<palette>
  <color name="Black" hex="000000" r="0" g="0" b="0" />
  <color name="Oxford Blue" hex="14213d" r="20" g="33" b="61" />
  <color name="Orange (web)" hex="fca311" r="252" g="163" b="17" />
  <color name="Platinum" hex="e5e5e5" r="229" g="229" b="229" />
  <color name="White" hex="ffffff" r="255" g="255" b="255" />
</palette>`;

export type Palette = typeof palette;
export type Tokens = typeof tokens;



