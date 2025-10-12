import { tokens } from './palette'

type TokenKey = keyof typeof tokens

/**
 * Apply CSS variables for the palette to the given root element (defaults to documentElement).
 * Accepts optional overrides to quickly experiment or theme-switch at runtime.
 */
export function applyPalette(
  root: HTMLElement | undefined = typeof document !== 'undefined' ? document.documentElement : undefined,
  overrides?: Partial<Record<TokenKey, string>>
) {
  if (!root) return

  const merged: Record<TokenKey, string> = {
    ...(tokens as Record<TokenKey, string>),
    ...(overrides as Record<TokenKey, string> | undefined),
  }

  // Map tokens to CSS custom properties
  root.style.setProperty('--color-primary', merged.primary)
  root.style.setProperty('--color-primary-foreground', merged.primaryForeground)
  root.style.setProperty('--color-accent', merged.accent)
  root.style.setProperty('--color-accent-foreground', merged.accentForeground)

  root.style.setProperty('--color-background', merged.background)
  root.style.setProperty('--color-surface', merged.surface)
  root.style.setProperty('--color-border', merged.border)
  root.style.setProperty('--color-text', merged.text)
  root.style.setProperty('--color-text-subtle', merged.subtleText)

  root.style.setProperty('--color-success', merged.success)
  root.style.setProperty('--color-warning', merged.warning)
  root.style.setProperty('--color-info', merged.info)
  root.style.setProperty('--color-destructive', merged.destructive)
}



