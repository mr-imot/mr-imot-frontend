import { CheckCircle } from "lucide-react"
import Link from "next/link"
import type { BillingCycle, PlanConfig } from "@/lib/pricing"
import { formatPrice } from "@/lib/pricing"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PlanCardProps {
  plan: PlanConfig
  cycle: BillingCycle
  lang: string
  popularText?: string
  registerHref: string
}

export function PlanCard({ plan, cycle, lang, popularText, registerHref }: PlanCardProps) {
  const isContact = plan.prices.monthly === null && plan.prices.yearlyMonthly == null
  const priceLabel = isContact
    ? (lang === 'bg' ? 'Запитване' : 'Contact')
    : cycle === 'yearly'
      ? `${formatPrice(plan.prices.yearlyMonthly!, 'monthly', lang)}`
      : `${formatPrice(plan.prices.monthly!, 'monthly', lang)}`

  return (
    <div className={`card p-8 h-full flex flex-col relative overflow-visible ${plan.highlight ? 'border-2 border-primary' : ''}`}>
      {plan.highlight && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
            {plan.badge ? (lang === 'bg' ? plan.badge.bg : plan.badge.en) : (popularText || (lang === 'bg' ? 'Популярен' : 'Popular'))}
          </span>
        </div>
      )}

      <div className="text-center flex-1 flex flex-col">
        <h4 className="text-xl font-bold text-gray-900 mb-2">
          {lang === 'bg' ? plan.name.bg : plan.name.en}
        </h4>
        <div className="text-4xl font-extrabold text-gray-900 mb-1">
          {priceLabel}
        </div>
        {!isContact && cycle === 'yearly' && (
          <div className="text-xs text-gray-600 mb-2">
            {lang === 'bg' ? 'Таксуване годишно' : 'Billed annually'}
          </div>
        )}
        {!isContact && cycle === 'yearly' && plan.prices.yearlySavings && (
          <div className="inline-block text-sm font-bold text-emerald-700 bg-emerald-100 rounded-full px-3 py-1 mb-3 shadow-sm">
            {lang === 'bg' ? `Спестявате €${plan.prices.yearlySavings}/год.` : `Save €${plan.prices.yearlySavings}/yr`}
          </div>
        )}
        <p className="text-gray-600 mb-5">
          {lang === 'bg' ? plan.description.bg : plan.description.en}
        </p>

        <div className="flex-1 flex flex-col justify-between">
          <TooltipProvider delayDuration={150}>
            <ul className="text-left space-y-3 mb-6">
              {(plan.features || []).map((f, i) => {
                const isBonus = (lang === 'bg' ? f.label.bg : f.label.en).includes('БОНУС:') || (lang === 'bg' ? f.label.bg : f.label.en).includes('BONUS:')
                
                // Skip bonus features here - they'll be rendered at the bottom
                if (isBonus) return null
                
                return (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className={`w-5 h-5 ${plan.highlight ? 'text-indigo-600' : 'text-emerald-600'}`} />
                    {f.tooltip ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-sm underline decoration-dotted cursor-help">
                            {lang === 'bg' ? f.label.bg : f.label.en}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-sm leading-relaxed">
                          {lang === 'bg' ? f.tooltip.bg : f.tooltip.en}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className="text-sm">
                        {lang === 'bg' ? f.label.bg : f.label.en}
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          </TooltipProvider>
          
          {/* Bonus section - ALWAYS at the bottom above CTA */}
          <div className="mb-6 relative z-10 overflow-visible">
            <TooltipProvider delayDuration={150}>
              {(plan.features || []).map((f, i) => {
                const isBonus = (lang === 'bg' ? f.label.bg : f.label.en).includes('БОНУС:') || (lang === 'bg' ? f.label.bg : f.label.en).includes('BONUS:')
                
                if (!isBonus) return null
                
                return (
                  <div key={i} className="relative overflow-visible bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-2 border-gradient-to-r border-amber-200 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                    {/* Subtle pattern overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent opacity-50"></div>
                    
                    <div className="relative flex items-center gap-4">
                      {/* Enhanced checkmark with better visual hierarchy */}
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md ring-2 ring-white/50">
                        <CheckCircle className="w-5 h-5 text-white stroke-2" />
                      </div>
                      
                      <div className="flex-1">
                        {f.tooltip ? (
                          <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                              <span className="text-sm font-bold text-gradient bg-gradient-to-r from-amber-800 to-orange-800 bg-clip-text text-transparent underline decoration-dotted cursor-help hover:decoration-solid transition-all duration-200 block">
                                {lang === 'bg' ? f.label.bg : f.label.en}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent 
                              side="top" 
                              align="center"
                              className="max-w-xs text-sm leading-relaxed bg-white border border-gray-200 shadow-xl z-50 p-3 rounded-lg"
                              sideOffset={12}
                              avoidCollisions={true}
                              collisionPadding={8}
                            >
                              {lang === 'bg' ? f.tooltip.bg : f.tooltip.en}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-sm font-bold text-gradient bg-gradient-to-r from-amber-800 to-orange-800 bg-clip-text text-transparent">
                            {lang === 'bg' ? f.label.bg : f.label.en}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Subtle shine effect */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent opacity-60"></div>
                  </div>
                )
              })}
            </TooltipProvider>
          </div>
        </div>

        <div className="mt-auto">
          <Link href={registerHref}>
            <button className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${plan.highlight ? 'bg-primary text-white hover:bg-primary/90' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
              {lang === 'bg' ? plan.cta.bg : plan.cta.en}
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}


