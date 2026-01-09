/**
 * Price translation utility for handling backend price formats
 * Backend returns formats like: "From €1500/m²", "Contact for price", "N/A"
 */

export interface PriceTranslations {
  requestPrice: string
  fromPrice: string
  contactForPrice: string
  priceOnRequest: string
  na: string
}

/**
 * Translates price labels from backend format to localized format
 * @param priceLabel - The price label from backend (e.g., "From €1500/m²", "Contact for price")
 * @param translations - The price translations object from dictionary
 * @returns Translated price string
 */
export function translatePrice(priceLabel: string | null | undefined, translations: PriceTranslations): string {
  if (!priceLabel) {
    return translations?.requestPrice || 'Request price'
  }

  const label = priceLabel.trim()

  // Handle "Request price" variations
  if (label.toLowerCase().includes('request price') || 
      label.toLowerCase().includes('price on request')) {
    return translations?.requestPrice || 'Request price'
  }

  // Handle "Contact for price" variations
  if (label.toLowerCase().includes('contact for price') ||
      label.toLowerCase().includes('contact for') ||
      label.toLowerCase().includes('свържете се')) {
    return translations?.contactForPrice || 'Contact for price'
  }

  // Handle "N/A" variations
  if (label.toLowerCase() === 'n/a' || 
      label.toLowerCase() === 'na' ||
      label.toLowerCase() === 'н/д') {
    return translations?.na || 'N/A'
  }

  // Handle "From" price variations (e.g., "From €1500/m²", "From €350,000")
  const fromMatch = label.match(/^from\s+(.+)$/i)
  if (fromMatch) {
    const amount = fromMatch[1].trim()
    // Safety check: if fromPrice is missing, use fallback format
    if (translations?.fromPrice) {
      return translations.fromPrice.replace('{{amount}}', amount)
    }
    return `From ${amount}`
  }

  // Handle Bulgarian "От" variations
  const otMatch = label.match(/^от\s+(.+)$/i)
  if (otMatch) {
    const amount = otMatch[1].trim()
    // Safety check: if fromPrice is missing, use fallback format
    if (translations?.fromPrice) {
      return translations.fromPrice.replace('{{amount}}', amount)
    }
    return `From ${amount}`
  }

  // If no pattern matches, return the original label
  return label
}

/**
 * Extracts the amount from a price label for further processing
 * @param priceLabel - The price label from backend
 * @returns Extracted amount string or null if not found
 */
export function extractPriceAmount(priceLabel: string | null | undefined): string | null {
  if (!priceLabel) return null

  const label = priceLabel.trim()

  // Extract amount from "From €1500/m²" format
  const fromMatch = label.match(/^from\s+(.+)$/i)
  if (fromMatch) {
    return fromMatch[1].trim()
  }

  // Extract amount from "От €1500/m²" format
  const otMatch = label.match(/^от\s+(.+)$/i)
  if (otMatch) {
    return otMatch[1].trim()
  }

  return null
}

/**
 * Checks if a price label indicates a request price (no specific amount)
 * @param priceLabel - The price label from backend
 * @returns True if it's a request price, false otherwise
 */
export function isRequestPrice(priceLabel: string | null | undefined): boolean {
  if (!priceLabel) return true

  const label = priceLabel.toLowerCase().trim()

  return label.includes('request price') ||
         label.includes('price on request') ||
         label.includes('contact for price') ||
         label.includes('contact for') ||
         label === 'n/a' ||
         label === 'na' ||
         label === 'н/д' ||
         label.includes('свържете се')
}
