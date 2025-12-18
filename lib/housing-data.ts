/**
 * Housing Market Data Utilities
 * Currently only contains formatting utilities for display
 * All data is static/mock - no API integrations
 */

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: string = '€'): string {
  return `${currency}${price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

/**
 * Format price per square meter
 */
export function formatPricePerSqm(price: number, lang: string = 'en'): string {
  const currency = '€'
  const unit = lang === 'bg' ? '/кв.м' : lang === 'ru' ? '/кв.м' : lang === 'gr' ? '/τ.μ.' : '/sqm'
  return `${formatPrice(price, currency)}${unit}`
}

/**
 * Format percentage change
 */
export function formatChange(change: number, isPositive: boolean): string {
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(1)}%`
}
