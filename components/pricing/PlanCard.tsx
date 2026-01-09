import { useState } from "react"
import { Image } from "@imagekit/next"
import { toIkPath } from "@/lib/imagekit"
import { CheckCircle, Gift, Info, Sparkles } from "lucide-react"
import Link from "next/link"
import cardStyles from "@/components/ui/card.module.css"

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
  const priceSuffix = locale === 'bg-BG' ? '/месец' : locale === 'ru-RU' ? '/мес' : '/month'

  const regularFeatures = plan.features.filter((f) => !f.bonus)
  const bonusFeatures = plan.features.filter((f) => f.bonus)

  const renderCoffeeLine = (text: string) => {
    const parts = text.split('☕')
    if (parts.length === 1) return text
    
    return (
      <span className="inline-flex items-center flex-wrap justify-center gap-1">
        <span className="leading-tight">{parts[0].trimEnd()}</span>
        <svg
          className="inline-block w-5 h-5 sm:w-6 sm:h-6 align-middle flex-shrink-0"
          viewBox="0 0 491.52 491.52"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path fill="#D15241" d="M386.404,38.983H105.116v-23.75C105.116,6.82,111.936,0,120.348,0h250.824c8.413,0,15.232,6.82,15.232,15.233V38.983z" />
          <path fill="#E56353" d="M423.124,62.405l-7.71-28.086c-0.879-3.203-3.792-5.425-7.114-5.425H83.22c-3.322,0-6.234,2.222-7.114,5.425l-7.71,28.086c-1.29,4.695,2.244,9.329,7.114,9.329h340.5C420.879,71.734,424.412,67.101,423.124,62.405z" />
          <path fill="#FCD462" d="M139.444,470.852c1.554,11.826,11.635,20.668,23.563,20.668h165.506c11.929,0,22.008-8.842,23.563-20.668l13.217-100.513H126.227L139.444,470.852z" />
          <polygon fill="#FCD462" points="404.556,71.734 86.964,71.734 102.898,192.915 388.623,192.915" />
          <polygon fill="#DC8744" points="102.898,192.915 126.227,370.339 365.293,370.339 388.623,192.915" />
          <path fill="#AD6636" d="M283.105,318.973c21.366-21.366,28.643-50.291,19.94-71.526c-17.089-0.313-34.147,8.023-44.231,21.865c-3.501,4.804-6.228,10.208-9.115,15.928c-1.119,2.215-2.238,4.43-3.404,6.616c-6.961,13.05-15.629,25.132-25.759,35.904c-1.975,2.099-6.165,6.534-11.807,9.873C230.164,348.258,260.768,341.31,283.105,318.973z" />
          <path fill="#AD6636" d="M210.676,318.491c9.314-9.903,17.28-21.006,23.679-33.002c1.118-2.096,2.19-4.222,3.263-6.345c3.005-5.952,6.111-12.106,10.258-17.798c10.925-14.997,28.377-24.835,46.741-26.986c-20.625-20.624-58.874-15.814-85.433,10.745c-25.908,25.908-31.108,62.932-12.202,83.877C200.397,327.526,205.152,324.365,210.676,318.491z" />
          <path fill="#995B30" d="M220.535,327.761c10.131-10.772,18.798-22.854,25.759-35.904c1.166-2.186,2.285-4.4,3.404-6.616c2.887-5.72,5.615-11.124,9.115-15.928c10.083-13.843,27.142-22.178,44.231-21.865c-1.975-4.821-4.78-9.24-8.427-13.089c-18.364,2.151-35.816,11.99-46.741,26.986c-4.148,5.693-7.254,11.847-10.258,17.798c-1.072,2.123-2.145,4.249-3.263,6.345c-6.399,11.997-14.365,23.1-23.679,33.002c-5.525,5.874-10.279,9.035-14.461,9.671c3.278,3.278,7.005,5.908,11.056,7.916C214.371,334.294,218.56,329.86,220.535,327.761z" />
        </svg>
        <span className="leading-tight">{parts[1].trimStart()}</span>
      </span>
    )
  }

  return (
    <div className={isYearly ? 'rounded-3xl bg-gradient-to-r from-amber-200/70 via-sky-200/60 to-emerald-200/70 p-[3px]' : ''}>
      <div className={`${cardStyles.card} p-4 sm:p-6 md:p-8 h-full flex flex-col relative overflow-visible rounded-3xl bg-white ${highlight ? 'shadow-2xl' : ''}`}>
      {/* Mascot overlay inside the card */}
      <div className="pointer-events-none absolute right-2 bottom-4 md:right-3 md:top-1/2 md:-translate-y-1/2 z-0 opacity-45 md:opacity-60 blur-[0.5px]">
        <div className="relative h-[120px] w-[90px] md:h-[190px] md:w-[140px]">
          <Image
            src={toIkPath("https://ik.imagekit.io/ts59gf2ul/Logo/mister-imot-charmingly-showing.png")}
            alt={locale === 'bg-BG' ? 'Мистър Имот маскот' : 'Mister Imot mascot'}
            fill
            transformation={[{ width: 640, quality: 82, format: "webp", focus: "auto" }]}
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

      <div className="text-center flex-1 flex flex-col relative z-10 min-w-0 overflow-hidden">
        <h4 className="text-xl font-bold text-gray-900 mb-1">
          {plan.name}
        </h4>
        <p className="text-gray-600 mb-3 text-sm">{plan.subtitle}</p>

        {anchorPrice && (
          <div className="text-sm font-semibold text-rose-600 line-through opacity-80">
            {anchorPrice}{priceSuffix}
          </div>
        )}

        <div className="text-5xl sm:text-6xl md:text-7xl font-black text-black leading-none mb-1 mt-1" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
          <span className="inline-block">{formattedTotal}</span>
          <span className="inline-block text-3xl sm:text-4xl md:text-5xl ml-1">{priceSuffix}</span>
        </div>
        {((isYearly ? coffeeLineYearly : coffeeLineMonthly) ?? '').length > 0 && (
          <div className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 flex items-center justify-center gap-1 px-2 min-w-0">
            {renderCoffeeLine((isYearly ? coffeeLineYearly : coffeeLineMonthly) ?? '')}
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


