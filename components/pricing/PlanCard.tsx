import { useState } from "react"
import Image from "next/image"
import { CheckCircle, Info } from "lucide-react"
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

  const regularFeatures = plan.features.filter((f) => !f.bonus)
  const bonusFeatures = plan.features.filter((f) => f.bonus)

  return (
    <div className={`card p-8 h-full flex flex-col relative overflow-visible ${highlight ? 'border-2 border-primary' : ''}`}>
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
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
            {badgeText}
          </span>
        </div>
      )}

      <div className="text-center flex-1 flex flex-col relative z-10">
        {plan.pill && (
          <div className="mx-auto mb-2 inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            {plan.pill}
          </div>
        )}
        <h4 className="text-xl font-bold text-gray-900 mb-1">
          {plan.name}
        </h4>
        <p className="text-gray-600 mb-3 text-sm">{plan.subtitle}</p>
        <div className="text-4xl font-extrabold text-gray-900 mb-1">
          {formattedTotal}{locale === 'bg-BG' ? '/месец' : '/month'}
        </div>
        {priceLabel && priceLabel !== formattedTotal && (
          <div className="text-sm text-gray-600">{priceLabel}</div>
        )}
        {savingsText && (
          <div className="inline-block text-sm font-bold text-emerald-700 bg-emerald-100 rounded-full px-3 py-1 mb-3 shadow-sm">
            {savingsText}
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
                    className="relative overflow-visible bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-2 border-gradient-to-r border-amber-200 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                    onMouseEnter={() => f.tooltip && setActiveBonusTooltip(i)}
                    onMouseLeave={() => setActiveBonusTooltip((prev) => (prev === i ? null : prev))}
                    onFocus={() => f.tooltip && setActiveBonusTooltip(i)}
                    onBlur={() => setActiveBonusTooltip((prev) => (prev === i ? null : prev))}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent opacity-50"></div>
                    
                    <div className="relative flex items-center gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md ring-2 ring-white/50">
                        <CheckCircle className="w-5 h-5 text-white stroke-2" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gradient bg-gradient-to-r from-amber-800 to-orange-800 bg-clip-text text-transparent">
                            {f.label}
                          </span>
                          {f.tooltip && (
                            <button
                              type="button"
                              className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/70 text-amber-800 hover:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                              aria-label={f.tooltip}
                              onClick={() => setActiveBonusTooltip(isOpen ? null : i)}
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {f.tooltip && isOpen && (
                      <div className="absolute left-4 top-full mt-2 z-30 w-72 rounded-lg bg-white shadow-2xl border border-amber-200 p-3 text-xs text-gray-800">
                        {f.tooltip}
                      </div>
                    )}
                    
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent opacity-60"></div>
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
            <button className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${highlight ? 'bg-primary text-white hover:bg-primary/90' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
              {plan.cta}
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}


