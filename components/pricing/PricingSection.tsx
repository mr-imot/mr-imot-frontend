"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import { BillingToggle } from "@/components/pricing/BillingToggle"
import { PlanCard } from "@/components/pricing/PlanCard"
import {
  calculateAnnualSavings,
  calculatePlanCost,
  getPricingRule,
  type BillingCycle,
} from "@/lib/pricing"

interface PricingSectionProps {
  lang: string
  dict: any
}

export function PricingSection({ lang, dict }: PricingSectionProps) {
  const pricingDict = dict?.pricingSection
  const plansCopy = pricingDict?.plans

  const [cycle, setCycle] = useState<BillingCycle>('monthly')
  const [units, setUnits] = useState<number>(1)

  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat(lang === 'bg' ? 'bg-BG' : 'en-US', {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }),
    [lang],
  )

  const formatCurrency = (value: number) => `€${numberFormatter.format(value)}`

  const pricingRule = useMemo(() => getPricingRule('single'), [])
  const perListingSavings = useMemo(() => {
    if (pricingRule.perListingMonthly == null || pricingRule.perListingYearly == null) return 0
    return Math.max(0, pricingRule.perListingMonthly - pricingRule.perListingYearly)
  }, [pricingRule])

  const registerHref = lang === 'bg' ? '/bg/register?type=developer' : '/en/register?type=developer'

  const monthlyTotal = useMemo(() => calculatePlanCost('single', units, 'monthly'), [units])
  const yearlyTotal = useMemo(() => calculatePlanCost('single', units, 'yearly'), [units])
  const savings = useMemo(
    () => (cycle === 'yearly' ? calculateAnnualSavings('single', units) : 0),
    [units, cycle],
  )

  const yearlyHint =
    pricingDict?.billing?.yearlyHint
      ?.replace('{{savePerListing}}', formatCurrency(perListingSavings))
      ?.replace('{{totalSavings}}', formatCurrency(perListingSavings * 12))

  const formatSavings = (value: number) => {
    if (!pricingDict?.annualSavingsLabel || value <= 0) return null
    return pricingDict.annualSavingsLabel.replace('{{amount}}', value.toString())
  }

  const displayTotal = cycle === 'yearly' && yearlyTotal != null ? yearlyTotal / 12 : monthlyTotal
  const billedAnnuallyLabel =
    pricingDict?.billing?.billedAnnually ||
    (lang === 'bg' ? 'Таксува се годишно: {{amount}}' : 'Billed annually: {{amount}}')
  const priceLabel =
    cycle === 'yearly' && yearlyTotal != null
      ? billedAnnuallyLabel.replace('{{amount}}', formatCurrency(yearlyTotal))
      : ''

  const dynamicFeatures = useMemo(() => {
    const features = plansCopy?.single?.bullets ?? []
    if (!features.length) return features

    const isBg = lang === 'bg'
    const pluralLabel = isBg
      ? `${units} активни обяви`
      : `${units} active listing${units === 1 ? '' : 's'}`
    const singularLabel = isBg ? '1 активна обява' : '1 active listing'

    const pluralTooltip = isBg
      ? `Можете да създавате неограничен брой проекти в таблото, но само ${units} ${units === 1 ? 'може' : 'могат'} да бъдат активни и видими публично. Смяната е възможна по всяко време.`
      : `You can create unlimited projects in the dashboard, but only ${units} can be active and publicly visible. You can swap anytime.`

    return features.map((f: any, idx: number) => {
      if (idx === 0) {
        return {
          ...f,
          label: units === 1 ? singularLabel : pluralLabel,
          tooltip: pluralTooltip,
        }
      }
      return f
    })
  }, [plansCopy?.single?.bullets, lang, units])

  return (
    <section className="mb-16">
      <div className="text-center mb-6 sm:mb-8">
        <h3 className="headline-gradient text-4xl sm:text-5xl md:text-6xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
          {pricingDict?.heading || (lang === 'bg' ? 'Прозрачно Ценообразуване' : 'Transparent Pricing')}
        </h3>
        <p className="mt-3 text-base sm:text-lg md:text-xl text-gray-700">
          {pricingDict?.subheading || (lang === 'bg'
            ? 'Избери броя активни обяви, които са ти нужни. Всички цени се изчисляват автоматично. Можеш да прекратиш месечния абонамент по всяко време.'
            : 'Choose the active listings you need. Pricing auto-calculates. Cancel monthly anytime.')}
        </p>
      </div>

      <div className="flex flex-col gap-6 max-w-4xl mx-auto px-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            {pricingDict?.sliderLabel || (lang === 'bg' ? 'Брой активни обяви' : 'Number of active listings')}: <span className="font-semibold">{units}</span>
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={units}
            onChange={(e) => setUnits(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-600"
          />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{pricingDict?.sliderMin ?? '1'}</span>
            <span>{pricingDict?.sliderMax ?? '10'}</span>
          </div>
        </div>

        <BillingToggle
          monthlyLabel={pricingDict?.billing?.monthly || (lang === 'bg' ? 'Месечно' : 'Monthly')}
          yearlyLabel={pricingDict?.billing?.yearly || (lang === 'bg' ? 'Годишно' : 'Yearly')}
          yearlyHint={undefined}
          onChange={setCycle}
        />

        {units >= 10 && (
          <div className="border border-dashed border-gray-200 rounded-2xl p-5 md:p-6 bg-white shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {plansCopy?.enterprise?.name || 'Enterprise'}
                </p>
                <p className="text-sm text-gray-600">
                  {plansCopy?.enterprise?.subtitle || (lang === 'bg' ? 'По заявка — за екипи с над 10 активни обяви' : 'By request — for teams with over 10 active listings')}
                </p>
                <p className="text-xs text-amber-700 mt-2">
                  {pricingDict?.overTenNotice ||
                    (lang === 'bg'
                      ? 'Имате повече от 10 обяви? Свържете се с нас за корпоративни отстъпки и персонализиран Enterprise план.'
                      : 'Have more than 10 listings? Contact us for enterprise discounts and a tailored plan.')}
                </p>
              </div>
              <a
                href={registerHref}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                {plansCopy?.enterprise?.cta || (lang === 'bg' ? 'Свържи се с отдел продажби' : 'Contact sales team')}
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto mt-8 px-4 flex justify-center">
        <div className="w-full max-w-[520px]">
          <PlanCard
            plan={{
              name: plansCopy?.single?.name ?? '',
              subtitle: plansCopy?.single?.subtitle ?? '',
              cta: plansCopy?.single?.cta ?? (lang === 'bg' ? 'Започни сега' : 'Start now'),
              pill: plansCopy?.single?.pill ?? undefined,
              badge: plansCopy?.single?.badge ?? undefined,
              basePriceLabel: plansCopy?.single?.basePriceLabel ?? undefined,
              features: dynamicFeatures,
            }}
            priceLabel={priceLabel}
            totalCost={displayTotal}
            highlight={true}
            isBestValue={false}
            bestValueLabel={plansCopy?.single?.badge || pricingDict?.bestValue || (lang === 'bg' ? 'Най-добра стойност' : 'Best value')}
            registerHref={registerHref}
            savingsText={cycle === 'yearly' ? formatSavings(savings) : null}
            tenPlusNotice={units >= 10 ? pricingDict?.overTenNotice : undefined}
            locale={lang === 'bg' ? 'bg-BG' : 'en-US'}
          />
        </div>
      </div>

      <div className="text-center mt-8">
        <p className="text-gray-500 text-xs">
          {pricingDict?.pricesNote || (lang === 'bg' ? '*Цените са без ДДС.' : '*Prices are without VAT.')}
        </p>
      </div>
    </section>
  )
}
