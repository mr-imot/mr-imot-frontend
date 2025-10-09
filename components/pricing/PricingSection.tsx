"use client"

import { useState } from "react"
import { BillingToggle } from "@/components/pricing/BillingToggle"
import { PlanCard } from "@/components/pricing/PlanCard"
import { getPricingData, type BillingCycle } from "@/lib/pricing"

interface PricingSectionProps {
  lang: string
}

export function PricingSection({ lang }: PricingSectionProps) {
  const pricing = getPricingData()
  const [cycle, setCycle] = useState<BillingCycle>('monthly')

  const registerHref = lang === 'bg' ? '/bg/register?type=developer' : '/en/register?type=developer'

  return (
    <section className="mb-16">
      <div className="text-center mb-6 sm:mb-8">
        <h3 className="headline-gradient text-4xl sm:text-5xl md:text-6xl font-bold" style={{
          fontFamily: 'Playfair Display, serif'
        }}>
          {lang === 'bg' ? 'Изберете вашия план' : 'Choose Your Plan'}
        </h3>
        <p className="mt-3 text-base sm:text-lg md:text-xl text-gray-700">
          {lang === 'bg' ? 'Изберете перфектния план според нуждите ви. Отменете или надградете по всяко време.' : 'Select the perfect plan for your needs. Cancel or upgrade anytime.'}
        </p>
      </div>

      <BillingToggle lang={lang} onChange={setCycle} />

      {/* Promo note replaces banner */}
      <div className="max-w-3xl mx-auto mb-6">
        <div className="flex items-center justify-center gap-3 rounded-xl border border-blue-200/70 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 px-4 sm:px-6 py-3 shadow-sm">
          <span className="text-sm sm:text-base">
            {lang === 'bg' ? 'Използвайте промо код' : 'Use promo code'}
          </span>
          <span className="px-2 py-1 rounded-md bg-white border border-blue-200 font-mono text-xs font-semibold tracking-wider">
            EARLYBIRD
          </span>
          <span className="text-sm sm:text-base">
            {lang === 'bg'
              ? '— за първия месец ще рекламираме вашите обяви във Facebook със сума, равна на стойността на абонамента ви.'
              : '— for your first month we will promote your listings on Facebook with a budget equal to your subscription price.'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 items-stretch gap-8 max-w-6xl mx-auto">
        {pricing.plans.map((p) => (
          <PlanCard key={p.id} plan={p} cycle={cycle} lang={lang} registerHref={registerHref} />
        ))}
      </div>

      <div className="text-center mt-8">
        <p className="text-gray-500 text-xs">
          {lang === 'bg' ? 'Цените са без ДДС.' : 'Prices are without VAT.'}
        </p>
      </div>
    </section>
  )
}


