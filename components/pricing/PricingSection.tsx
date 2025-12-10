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

  const [cycle, setCycle] = useState<BillingCycle>('yearly')
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

  const savingsRichTemplate = pricingDict?.annualSavingsRich
  const savingsText =
    cycle === 'yearly' && savings > 0 && savingsRichTemplate
      ? savingsRichTemplate.replace('{{amount}}', formatCurrency(savings))
      : null

  const displayTotal = cycle === 'yearly' && yearlyTotal != null ? yearlyTotal / 12 : monthlyTotal
  const billedAnnuallyText =
    pricingDict?.billing?.billedAnnuallyNoAmount ||
    (lang === 'bg' ? 'Таксува се годишно' : 'Billed annually')
  const priceLabel = cycle === 'yearly' ? billedAnnuallyText : ''
  const anchorPrice = cycle === 'yearly' ? '€45' : '€50'

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

  const coffeeLineYearly =
    pricingDict?.coffeeLine?.yearly ||
    (lang === 'bg'
      ? 'Само €0.95/ден за обява — по-малко от едно кафе'
      : 'Only €0.95/day per listing — less than a coffee')
  const coffeeLineMonthly =
    pricingDict?.coffeeLine?.monthly ||
    (lang === 'bg'
      ? 'Само €1.25/ден за обява — по-малко от едно кафе'
      : 'Only €1.25/day per listing — less than a coffee')

  return (
    <section
      className="py-16 sm:py-20 md:py-24"
      style={{ background: 'linear-gradient(180deg, #faf8f5 0%, #f5f2ed 100%)' }}
    >
      <div className="text-center mb-6 sm:mb-8">
        <h3 className="headline-gradient text-4xl sm:text-5xl md:text-6xl font-bold font-serif">
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
            className="pricing-slider w-full"
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
          defaultCycle="yearly"
          onChange={setCycle}
        />
        {pricingDict?.billing?.toggleNote && (
          <div className="mt-[-2px] flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-base sm:text-lg font-bold text-emerald-800">
              <span className="text-emerald-700">➤</span>
              <span>{pricingDict.billing.toggleNote}</span>
            </div>
          </div>
        )}

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
            anchorPrice={anchorPrice}
            coffeeLineYearly={coffeeLineYearly}
            coffeeLineMonthly={coffeeLineMonthly}
            highlight={true}
            isBestValue={false}
            bestValueLabel={plansCopy?.single?.badge || pricingDict?.bestValue || (lang === 'bg' ? 'Най-добра стойност' : 'Best value')}
            registerHref={registerHref}
            savingsText={savingsText}
            isYearly={cycle === 'yearly'}
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
      <style jsx>{`
        .pricing-slider {
          appearance: none;
          width: 100%;
          height: 18px;
          border-radius: 9999px;
          background: linear-gradient(90deg, #ecfdf3 0%, #d1fae5 100%);
          outline: none;
          box-shadow:
            inset 0 1px 4px rgba(0, 0, 0, 0.08),
            0 6px 14px rgba(16, 185, 129, 0.15);
          transition: box-shadow 0.2s ease, transform 0.12s ease;
          padding: 0;
          margin: 2px 0 6px;
          touch-action: pan-x;
        }
        .pricing-slider:focus-visible {
          box-shadow:
            inset 0 1px 4px rgba(0, 0, 0, 0.08),
            0 0 0 6px rgba(16, 185, 129, 0.2),
            0 10px 18px rgba(16, 185, 129, 0.18);
        }
        .pricing-slider::-webkit-slider-runnable-track {
          height: 18px;
          border-radius: 9999px;
          background: #e5e7eb;
        }
        .pricing-slider::-moz-range-track {
          height: 18px;
          border-radius: 9999px;
          background: #e5e7eb;
        }
        .pricing-slider::-webkit-slider-thumb {
          appearance: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #ffffff;
          border: 3px solid #10b981;
          box-shadow: 0 8px 18px rgba(16, 185, 129, 0.35);
          margin-top: -7px;
        }
        .pricing-slider::-moz-range-thumb {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #ffffff;
          border: 3px solid #10b981;
          box-shadow: 0 8px 18px rgba(16, 185, 129, 0.35);
        }
        .pricing-slider:active::-webkit-slider-thumb {
          transform: scale(1.03);
          box-shadow: 0 10px 20px rgba(16, 185, 129, 0.4);
        }
        .pricing-slider:active::-moz-range-thumb {
          transform: scale(1.03);
          box-shadow: 0 10px 20px rgba(16, 185, 129, 0.4);
        }
        @media (max-width: 640px) {
          .pricing-slider {
            height: 22px;
          }
          .pricing-slider::-webkit-slider-runnable-track,
          .pricing-slider::-moz-range-track {
            height: 22px;
          }
          .pricing-slider::-webkit-slider-thumb,
          .pricing-slider::-moz-range-thumb {
            width: 36px;
            height: 36px;
            margin-top: -7px;
          }
        }
      `}</style>
    </section>
  )
}
