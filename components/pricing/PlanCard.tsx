import { useState } from "react"
import Image from "next/image"
import { CheckCircle, Gift, Info, Sparkles } from "lucide-react"
import Link from "next/link"

interface PlanFeature {
  label: string
  tooltip?: string
  bonus?: boolean
}

interface PlanCopy {
  name: string
  subtitle: string
  cta: string
  pill?: string | null
  badge?: string | null
  basePriceLabel?: string | null
  features: PlanFeature[]
}

interface PlanCardProps {
  plan: PlanCopy
  priceLabel: string
  totalCost: number | null
  anchorPrice?: string | null
  isYearly?: boolean
  coffeeLineYearly?: string
  coffeeLineMonthly?: string
  highlight: boolean
  isBestValue: boolean
  bestValueLabel: string
  registerHref: string
  savingsText?: string | null
  tenPlusNotice?: string | null
  locale: string
}

export function PlanCard({
  plan,
  priceLabel,
  totalCost,
  anchorPrice,
  isYearly = false,
  coffeeLineYearly,
  coffeeLineMonthly,
  highlight,
  isBestValue,
  bestValueLabel,
  registerHref,
  savingsText,
  tenPlusNotice,
  locale,
}: PlanCardProps) {
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null)
  const [activeBonusTooltip, setActiveBonusTooltip] = useState<number | null>(null)

  const badgeText = isBestValue ? bestValueLabel : plan.badge
  const isContact = totalCost == null

  const numberFormatter = new Intl.NumberFormat(locale || 'en-US', { maximumFractionDigits: 2, minimumFractionDigits: 0 })
  const formattedTotal = totalCost != null ? `€${numberFormatter.format(totalCost)}` : priceLabel
  const priceSuffix = locale === 'bg-BG' ? '/месец' : '/month'

  const regularFeatures = plan.features.filter((f) => !f.bonus)
  const bonusFeatures = plan.features.filter((f) => f.bonus)

  return (
    <div className={isYearly ? 'rounded-3xl bg-gradient-to-r from-amber-200/70 via-sky-200/60 to-emerald-200/70 p-[3px]' : ''}>
      <div className={`card p-8 h-full flex flex-col relative overflow-visible rounded-3xl bg-white ${highlight ? 'shadow-2xl' : ''}`}>
      {/* Mascot overlay inside the card */}
      <div className="pointer-events-none absolute right-2 bottom-4 md:right-3 md:top-1/2 md:-translate-y-1/2 z-0 opacity-45 md:opacity-60 blur-[0.5px]">
        <div className="relative h-[120px] w-[90px] md:h-[190px] md:w-[140px]">
          <Image
            src="https://ik.imagekit.io/ts59gf2ul/Logo/mister-imot-charmingly-showing.png?updatedAt=1764869546000"
            alt={locale === 'bg-BG' ? 'Мистър Имот маскот' : 'Mister Imot mascot'}
            fill
            sizes="(max-width: 640px) 120px, 180px"
            className="object-contain drop-shadow-xl"
            priority
          />
        </div>
      </div>

      {badgeText && (
        <div className="absolute top-4 right-4">
          <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold shadow-md">
            {badgeText}
          </span>
        </div>
      )}

      {plan.pill && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 rotate-[-2deg] drop-shadow-xl max-w-[calc(100vw-2rem)] sm:max-w-none">
          <div className="inline-flex items-center gap-[clamp(0.25rem,1vw,0.5rem)] rounded-full bg-gradient-to-r from-rose-700 via-red-600 to-orange-500 text-white font-extrabold uppercase shadow-2xl" style={{
            fontSize: 'clamp(0.625rem, 2.5vw, 1rem)',
            padding: 'clamp(0.375rem, 1.5vw, 0.5rem) clamp(0.625rem, 3vw, 1.25rem)',
            letterSpacing: 'clamp(0.025em, 0.1vw, 0.05em)'
          }}>
            <Sparkles className="text-yellow-200 flex-shrink-0" style={{ width: 'clamp(0.625rem, 2vw, 1rem)', height: 'clamp(0.625rem, 2vw, 1rem)' }} />
            <span className="whitespace-nowrap">{plan.pill}</span>
            <Sparkles className="text-yellow-200 flex-shrink-0" style={{ width: 'clamp(0.625rem, 2vw, 1rem)', height: 'clamp(0.625rem, 2vw, 1rem)' }} />
          </div>
        </div>
      )}

      <div className="text-center flex-1 flex flex-col relative z-10">
        <h4 className="text-xl font-bold text-gray-900 mb-1">
          {plan.name}
        </h4>
        <p className="text-gray-600 mb-3 text-sm">{plan.subtitle}</p>

        {anchorPrice && (
          <div className="text-sm font-semibold text-rose-600 line-through opacity-80">
            {anchorPrice}{priceSuffix}
          </div>
        )}

        <div className="text-7xl font-black text-black leading-none mb-1 mt-1">
          {formattedTotal}{priceSuffix}
        </div>
        {((isYearly ? coffeeLineYearly : coffeeLineMonthly) ?? '').length > 0 && (
          <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
            {isYearly ? coffeeLineYearly : coffeeLineMonthly}
          </div>
        )}
        {priceLabel && priceLabel !== formattedTotal && (
          <div className="text-sm sm:text-base font-normal text-gray-400 mb-2">
            {priceLabel}
          </div>
        )}
        {savingsText && (
          <div className="block mt-1 mb-4 text-slate-900">
            <div className="text-2xl sm:text-3xl font-black leading-tight">
              {savingsText.split('(')[0].trim()}
            </div>
            {savingsText.includes('(') && (
              <div className="text-lg sm:text-xl font-semibold text-slate-800">
                ({savingsText.substring(savingsText.indexOf('(') + 1, savingsText.lastIndexOf(')')).trim()})
              </div>
            )}
          </div>
        )}

        <div className="flex-1 flex flex-col justify-between">
          <ul className="text-left space-y-3 mb-6">
            {regularFeatures.map((f, i) => {
              const isOpen = activeTooltip === i
              return (
                <li
                  key={i}
                  className="relative flex items-center gap-3 text-gray-700 group leading-snug"
                  onMouseEnter={() => f.tooltip && setActiveTooltip(i)}
                  onMouseLeave={() => setActiveTooltip((prev) => (prev === i ? null : prev))}
                  onFocus={() => f.tooltip && setActiveTooltip(i)}
                  onBlur={() => setActiveTooltip((prev) => (prev === i ? null : prev))}
                >
                  <CheckCircle className={`w-5 h-5 ${highlight ? 'text-indigo-600' : 'text-emerald-600'}`} />
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{f.label}</span>
                      {f.tooltip && (
                        <button
                          type="button"
                          className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                          aria-label={f.tooltip}
                          onClick={() => setActiveTooltip(isOpen ? null : i)}
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    {f.tooltip && isOpen && (
                      <div className="absolute left-8 top-full mt-2 z-20 w-72 rounded-lg bg-white shadow-xl border border-gray-200 p-3 text-xs text-gray-700">
                        {f.tooltip}
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
          
          {bonusFeatures.length > 0 && (
            <div className="mb-6 relative z-10 overflow-visible space-y-3">
              {bonusFeatures.map((f, i) => {
                const isOpen = activeBonusTooltip === i
                return (
                  <div
                    key={i}
                    className="relative overflow-visible bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500 rounded-2xl p-4 shadow-2xl hover:shadow-[0_20px_50px_rgba(34,197,94,0.35)] transition-all duration-300 hover:scale-[1.02] text-white"
                    onMouseEnter={() => f.tooltip && setActiveBonusTooltip(i)}
                    onMouseLeave={() => setActiveBonusTooltip((prev) => (prev === i ? null : prev))}
                    onFocus={() => f.tooltip && setActiveBonusTooltip(i)}
                    onBlur={() => setActiveBonusTooltip((prev) => (prev === i ? null : prev))}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-white/0 opacity-70 rounded-2xl"></div>
                    
                    <div className="relative flex items-center gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md ring-2 ring-emerald-200/70">
                        <Gift className="w-5 h-5 text-emerald-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm sm:text-base font-black tracking-tight">
                            {f.label}
                          </span>
                          {f.tooltip && (
                            <button
                              type="button"
                              className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/30 text-white hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-white/70"
                              aria-label={f.tooltip}
                              onClick={() => setActiveBonusTooltip(isOpen ? null : i)}
                            >
                              <Info className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {f.tooltip && isOpen && (
                      <div className="absolute left-4 top-full mt-2 z-30 w-72 rounded-lg bg-white shadow-2xl border border-emerald-100 p-3 text-xs text-gray-800">
                        {f.tooltip}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {tenPlusNotice && (
          <div className="mt-2 text-left">
            <p className="text-xs text-amber-700 leading-relaxed">{tenPlusNotice}</p>
          </div>
        )}

        <div className="mt-auto pt-4">
          <Link href={registerHref}>
            <button
              className={`w-full px-9 py-5 rounded-xl text-lg font-black tracking-tight transition-all shadow-xl hover:shadow-2xl hover:-translate-y-[1px] active:translate-y-0 border-2 ${
                highlight
                  ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-white border-amber-200 hover:from-amber-500 hover:to-orange-500'
                  : 'bg-red-500 text-white border-red-200 hover:bg-red-500/90'
              }`}
            >
              {plan.cta}
            </button>
          </Link>
        </div>
      </div>
      </div>
    </div>
  )
}


