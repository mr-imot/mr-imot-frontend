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
      padding: "1rem", // ds-space-2
      screens: {
        "2xl": "1200px",
      },
    },
    extend: {
      colors: {
        // Shadcn UI colors (keeping for compatibility)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Design System Colors
        ds: {
          primary: {
            DEFAULT: "#1e40af", // Deep blue
            50: "#eff6ff",
            100: "#dbeafe",
            200: "#bfdbfe",
            300: "#93c5fd",
            400: "#60a5fa",
            500: "#3b82f6",
            600: "#1e40af", // Primary
            700: "#1d4ed8",
            800: "#1e3a8a",
            900: "#1e293b",
          },
          accent: {
            DEFAULT: "#10b981", // Emerald
            50: "#ecfdf5",
            100: "#d1fae5",
            200: "#a7f3d0",
            300: "#6ee7b7",
            400: "#34d399",
            500: "#10b981", // Accent
            600: "#059669",
            700: "#047857",
            800: "#065f46",
            900: "#064e3b",
          },
          neutral: {
            50: "#f8fafc", // Light gray
            100: "#f1f5f9",
            200: "#e2e8f0",
            300: "#cbd5e1",
            400: "#94a3b8",
            500: "#64748b", // Medium gray
            600: "#475569",
            700: "#334155",
            800: "#1e293b", // Dark gray
            900: "#0f172a",
          },
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        ds: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      fontSize: {
        // Design System Typography Scale
        "ds-xs": ["0.875rem", { lineHeight: "1.25rem" }], // 14px
        "ds-sm": ["1rem", { lineHeight: "1.5rem" }], // 16px
        "ds-base": ["1.25rem", { lineHeight: "1.75rem" }], // 20px
        "ds-lg": ["1.5rem", { lineHeight: "2rem" }], // 24px
        "ds-xl": ["2rem", { lineHeight: "2.5rem" }], // 32px
        "ds-2xl": ["3rem", { lineHeight: "3.5rem" }], // 48px
      },
      spacing: {
        // Design System Spacing Scale
        "ds-1": "0.5rem", // 8px
        "ds-2": "1rem", // 16px
        "ds-3": "1.5rem", // 24px
        "ds-4": "2rem", // 32px
        "ds-6": "3rem", // 48px
        "ds-8": "4rem", // 64px
        "ds-12": "6rem", // 96px
      },
      borderRadius: {
        // Design System Border Radius
        ds: "0.5rem", // 8px
      },
      boxShadow: {
        // Design System Shadows
        "ds-sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        ds: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "ds-md": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        "ds-lg": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        "ds-xl": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-marker": {
          "0%, 100%": {
            transform: "scale(0.8)",
            opacity: "0.7",
          },
          "50%": {
            transform: "scale(1.2)",
            opacity: "0.3",
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-8px)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-marker": "pulse-marker 2s infinite ease-in-out",
        float: "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
