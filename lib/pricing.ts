export type BillingCycle = 'monthly' | 'yearly'

export type PlanId = 'single' | 'enterprise'

interface PricingRule {
  id: PlanId
  perListingMonthly: number | null
  perListingYearly: number | null // monthly-equivalent when billed annually
}

const pricingRules: PricingRule[] = [
  {
    id: 'single',
    perListingMonthly: 39,
    perListingYearly: 29, // yearly price per listing (shows as monthly equivalent)
  },
  {
    id: 'enterprise',
    perListingMonthly: null,
    perListingYearly: null,
  },
]

export function getPricingRule(id: PlanId): PricingRule {
  const rule = pricingRules.find((r) => r.id === id)
  if (!rule) throw new Error(`Unknown plan: ${id}`)
  return rule
}

export function calculatePlanCost(planId: PlanId, units: number, cycle: BillingCycle): number | null {
  const rule = getPricingRule(planId)
  if (rule.perListingMonthly == null || rule.perListingYearly == null) return null

  const multiplier = cycle === 'monthly' ? rule.perListingMonthly : rule.perListingYearly
  if (multiplier == null) return null

  const total = multiplier * Math.max(1, units)
  return cycle === 'yearly' ? total * 12 : total
}

export function calculateAnnualSavings(planId: PlanId, units: number): number {
  const monthlyTotal = calculatePlanCost(planId, units, 'monthly')
  const yearlyTotal = calculatePlanCost(planId, units, 'yearly')
  if (monthlyTotal == null || yearlyTotal == null) return 0
  return Math.max(0, monthlyTotal * 12 - yearlyTotal)
}

export function formatPrice(amount: number | null, cycle: BillingCycle, lang: string): string {
  if (amount == null) return lang === 'bg' ? 'Запитване' : 'Contact'
  const currency = '€'
  const suffix = cycle === 'yearly' ? (lang === 'bg' ? '/година' : '/year') : (lang === 'bg' ? '/месец' : '/month')
  return `${currency}${amount}${suffix}`
}

export function getBestValuePlan(): PlanId {
  // Single plan is always the best by design
  return 'single'
}

