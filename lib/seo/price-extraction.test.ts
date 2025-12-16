/**
 * Test cases for price extraction function
 * Run with: npm test -- price-extraction.test.ts
 * 
 * These test cases verify the extractNumericPrice function handles
 * various multilingual price formats correctly.
 */

// Copy of the extractNumericPrice function for testing
function extractNumericPrice(priceLabel: string | undefined | null): number | null {
  if (!priceLabel) return null
  
  // Skip non-numeric price indicators (multilingual)
  const skipPatterns = [
    // English
    'contact', 'call', 'request', 'tbd', 'tba', 'coming soon', 'inquire',
    // Bulgarian  
    'запитване', 'свържете', 'обадете', 'по договаряне',
    // Russian
    'свяжитесь', 'позвоните', 'договорная', 'запрос',
    // Greek
    'επικοινωνήστε', 'τηλεφωνήστε', 'συζητήσιμη'
  ]
  
  const lowerLabel = priceLabel.toLowerCase()
  if (skipPatterns.some(pattern => lowerLabel.includes(pattern))) {
    return null
  }
  
  // Remove currency symbols, units, and prefixes
  const cleaned = priceLabel
    .replace(/€|EUR|лв|BGN|\$|USD|₽|RUB/gi, '') // Currency symbols
    .replace(/\/m²|per m²|на м²|кв\.м|за кв\.м/gi, '') // Unit indicators
    .replace(/from|starting|от|начиная|από/gi, '') // Prefix words
    .replace(/\s+/g, '') // All whitespace
    .trim()
  
  // Extract first number sequence (handles: 1,200.50 or 1.200,50)
  const match = cleaned.match(/[\d.,]+/)
  if (!match) return null
  
  let numString = match[0]
  
  // Determine format based on comma/period positions
  const lastComma = numString.lastIndexOf(',')
  const lastPeriod = numString.lastIndexOf('.')
  
  if (lastComma > lastPeriod && lastComma === numString.length - 3) {
    // European format: 1.200,50 → 1200.50
    numString = numString.replace(/\./g, '').replace(',', '.')
  } else if (lastPeriod > lastComma && lastPeriod === numString.length - 3) {
    // US format: 1,200.50 → 1200.50
    numString = numString.replace(/,/g, '')
  } else if (lastComma === numString.length - 3 || lastPeriod === numString.length - 3) {
    // Could be decimal: 1200,50 or 1200.50
    numString = numString.replace(',', '.')
  } else {
    // Just thousands separator: 1,200 or 1.200 → 1200
    numString = numString.replace(/[,.]/g, '')
  }
  
  const result = parseFloat(numString)
  
  // Validate result
  if (isNaN(result) || result <= 0 || result > 999999999) {
    return null
  }
  
  return result
}

// Test cases
const testCases = [
  // Valid prices
  { input: "From €1200/m²", expected: 1200 },
  { input: "€850,000", expected: 850000 },
  { input: "1.200.000 лв", expected: 1200000 },
  { input: "₽5,000,000", expected: 5000000 },
  { input: "€1,200.50", expected: 1200.5 },
  { input: "1.200,50 EUR", expected: 1200.5 },
  { input: "1200 EUR", expected: 1200 },
  { input: "850000", expected: 850000 },
  
  // Invalid/contact prices
  { input: "Contact for price", expected: null },
  { input: "Request pricing", expected: null },
  { input: "TBD", expected: null },
  { input: "Запитване за цена", expected: null },
  { input: "Свържете се", expected: null },
  { input: "Свяжитесь с нами", expected: null },
  { input: "Επικοινωνήστε", expected: null },
  { input: "", expected: null },
  { input: null, expected: null },
  { input: undefined, expected: null },
]

// Run tests
console.log("Testing price extraction function...\n")

let passed = 0
let failed = 0

testCases.forEach(({ input, expected }, index) => {
  const result = extractNumericPrice(input as string | null | undefined)
  const success = result === expected
  
  if (success) {
    passed++
    console.log(`✓ Test ${index + 1}: "${input}" → ${result}`)
  } else {
    failed++
    console.error(`✗ Test ${index + 1} FAILED: "${input}" → ${result} (expected ${expected})`)
  }
})

console.log(`\nResults: ${passed} passed, ${failed} failed`)

if (failed === 0) {
  console.log("✅ All tests passed!")
} else {
  console.error(`❌ ${failed} test(s) failed`)
  process.exit(1)
}

export { extractNumericPrice }
