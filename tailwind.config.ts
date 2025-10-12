import type { Config } from "tailwindcss"

const config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '1rem',
  		screens: {
  			'2xl': '90em'  // 1440px converted to em
  		}
  	},
	screens: {
		'xs': '40em',    // 640px - Mobile
		'sm': '40em',    // 640px - Tablet start
		'md': '48em',    // 768px - Tablet
		'lg': '64em',    // 1024px - Laptop start
		'xl': '75em',    // 1200px - Desktop start
		'2xl': '90em',   // 1440px - Large desktop
		'laptop': '64em', // 1024px - Laptop range start
		'laptop-lg': '75em', // 1200px - Laptop range end
	},
  	extend: {
  		colors: {
  			brand: 'var(--brand)',
  			'brand-ink': 'var(--brand-ink)',
  			ink: 'var(--ink)',
  			subtle: 'var(--subtle)',
  			border: 'var(--border)',
  			input: 'var(--input)',
  			ring: 'var(--ring)',
  			background: 'var(--background)',
  			foreground: 'var(--foreground)',
			'charcoal': {
				'100': '#080e11',
				'200': '#0f1c22',
				'300': '#172b32',
				'400': '#1f3943',
				'500': '#264653',
				'600': '#3f7489',
				'700': '#609db6',
				'800': '#95bece',
				'900': '#cadee7',
				DEFAULT: '#264653'
			},
			'persian-green': {
				'100': '#081f1d',
				'200': '#113f39',
				'300': '#195e56',
				'400': '#217e73',
				'500': '#2a9d8f',
				'600': '#3acbba',
				'700': '#6cd8cb',
				'800': '#9de5dc',
				'900': '#cef2ee',
				DEFAULT: '#2a9d8f'
			},
			'saffron': {
				'100': '#3b2c09',
				'200': '#755912',
				'300': '#b0851a',
				'400': '#e0ad2e',
				'500': '#e9c46a',
				'600': '#edd086',
				'700': '#f1dca4',
				'800': '#f6e7c3',
				'900': '#faf3e1',
				DEFAULT: '#e9c46a'
			},
			'sandy-brown': {
				'100': '#401f04',
				'200': '#803e09',
				'300': '#c05e0d',
				'400': '#f07e22',
				'500': '#f4a261',
				'600': '#f6b681',
				'700': '#f8c8a1',
				'800': '#fbdac0',
				'900': '#fdede0',
				DEFAULT: '#f4a261'
			},
			'burnt-sienna': {
				'100': '#371107',
				'200': '#6e220f',
				'300': '#a43316',
				'400': '#db441e',
				'500': '#e76f51',
				'600': '#ec8b73',
				'700': '#f1a896',
				'800': '#f5c5b9',
				'900': '#fae2dc',
				DEFAULT: '#e76f51'
			},
  			primary: {
  				DEFAULT: 'var(--primary)',
  				foreground: 'var(--primary-foreground)'
  			},
  			secondary: {
  				DEFAULT: 'var(--secondary)',
  				foreground: 'var(--secondary-foreground)'
  			},
  			destructive: {
  				DEFAULT: 'var(--destructive)',
  				foreground: 'var(--destructive-foreground)'
  			},
  			muted: {
  				DEFAULT: 'var(--muted)',
  				foreground: 'var(--muted-foreground)'
  			},
  			accent: {
  				DEFAULT: 'var(--accent)',
  				foreground: 'var(--accent-foreground)'
  			},
  			popover: {
  				DEFAULT: 'var(--popover)',
  				foreground: 'var(--popover-foreground)'
  			},
  			card: {
  				DEFAULT: 'var(--card)',
  				foreground: 'var(--card-foreground)'
  			},
  			sidebar: {
  				DEFAULT: 'var(--sidebar)',
  				foreground: 'var(--sidebar-foreground)',
  				primary: 'var(--sidebar-primary)',
  				'primary-foreground': 'var(--sidebar-primary-foreground)',
  				accent: 'var(--sidebar-accent)',
  				'accent-foreground': 'var(--sidebar-accent-foreground)',
  				border: 'var(--sidebar-border)',
  				ring: 'var(--sidebar-ring)'
  			},
  			chart: {
  				'1': 'var(--chart-1)',
  				'2': 'var(--chart-2)',
  				'3': 'var(--chart-3)',
  				'4': 'var(--chart-4)',
  				'5': 'var(--chart-5)'
  			},
  			ds: {
  				primary: {
  					'50': '#eff6ff',
  					'100': '#dbeafe',
  					'200': '#bfdbfe',
  					'300': '#93c5fd',
  					'400': '#60a5fa',
  					'500': '#3b82f6',
  					'600': '#1e40af',
  					'700': '#1d4ed8',
  					'800': '#1e3a8a',
  					'900': '#1e293b',
  					DEFAULT: '#1e40af'
  				},
  				accent: {
  					'50': '#ecfdf5',
  					'100': '#d1fae5',
  					'200': '#a7f3d0',
  					'300': '#6ee7b7',
  					'400': '#34d399',
  					'500': '#10b981',
  					'600': '#059669',
  					'700': '#047857',
  					'800': '#065f46',
  					'900': '#064e3b',
  					DEFAULT: '#10b981'
  				},
  				neutral: {
  					'50': '#f8fafc',
  					'100': '#f1f5f9',
  					'200': '#e2e8f0',
  					'300': '#cbd5e1',
  					'400': '#94a3b8',
  					'500': '#64748b',
  					'600': '#475569',
  					'700': '#334155',
  					'800': '#1e293b',
  					'900': '#0f172a'
  				}
  			}
  		},
  		fontFamily: {
  			sans: 'var(--font-sans)',
  			serif: 'var(--font-serif)',
  			mono: 'var(--font-mono)',
  			ds: 'var(--font-sans)',
  			outfit: 'var(--font-outfit)',
  			'source-sans': 'var(--font-source-sans)'
  		},
  		fontSize: {
  			'ds-xs': [
  				'0.875rem',
  				{
  					lineHeight: '1.25rem'
  				}
  			],
  			'ds-sm': [
  				'1rem',
  				{
  					lineHeight: '1.5rem'
  				}
  			],
  			'ds-base': [
  				'1.25rem',
  				{
  					lineHeight: '1.75rem'
  				}
  			],
  			'ds-lg': [
  				'1.5rem',
  				{
  					lineHeight: '2rem'
  				}
  			],
  			'ds-xl': [
  				'2rem',
  				{
  					lineHeight: '2.5rem'
  				}
  			],
  			'ds-2xl': [
  				'3rem',
  				{
  					lineHeight: '3.5rem'
  				}
  			]
  		},
  		spacing: {
  			'ds-1': '0.5rem',
  			'ds-2': '1rem',
  			'ds-3': '1.5rem',
  			'ds-4': '2rem',
  			'ds-6': '3rem',
  			'ds-8': '4rem',
  			'ds-12': '6rem'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			ds: 'var(--radius)',
  			xl: 'var(--radius)',
  			'2xl': '24px'
  		},
  		boxShadow: {
  			card: 'var(--shadow-card)',
  			hover: 'var(--shadow-hover)',
  			focus: 'var(--shadow-focus)',
  			'ds-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  			ds: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  			'ds-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  			'ds-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  			'ds-xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
  		},
  		transitionTimingFunction: {
  			soft: 'cubic-bezier(.2,.8,.2,1)'
  		},
  		keyframes: {
			'accordion-down': {
				from: {
					height: '0'
				},
				to: {
					height: 'var(--radix-accordion-content-height)'
				}
			},
			'accordion-up': {
				from: {
					height: 'var(--radix-accordion-content-height)'
				},
				to: {
					height: '0'
				}
			},
			'pulse-marker': {
				'0%, 100%': {
					transform: 'scale(0.8)',
					opacity: '0.7'
				},
				'50%': {
					transform: 'scale(1.2)',
					opacity: '0.3'
				}
			},
			float: {
				'0%, 100%': {
					transform: 'translateY(0px)'
				},
				'50%': {
					transform: 'translateY(-8px)'
				}
			}
  		},
		animation: {
			'accordion-down': 'accordion-down 0.2s ease-out',
			'accordion-up': 'accordion-up 0.2s ease-out',
			'pulse-marker': 'pulse-marker 2s infinite ease-in-out',
			float: 'float 3s ease-in-out infinite'
		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
