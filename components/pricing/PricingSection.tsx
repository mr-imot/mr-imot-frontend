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
          {lang === 'bg' ? 'Избери своя план' : 'Choose Your Plan'}
        </h3>
        <p className="mt-3 text-base sm:text-lg md:text-xl text-gray-700">
          {lang === 'bg' ? 'Стартирай с плана, който ти подхожда днес. Можеш да го надградиш или отмениш по всяко време.' : 'Select the perfect plan for your needs. Cancel or upgrade anytime.'}
        </p>
      </div>

      <BillingToggle lang={lang} onChange={setCycle} />

      <div className="grid grid-cols-1 md:grid-cols-3 items-stretch gap-8 max-w-6xl mx-auto">
        {pricing.plans.map((p) => (
          <PlanCard key={p.id} plan={p} cycle={cycle} lang={lang} registerHref={registerHref} />
        ))}
      </div>

      <div className="text-center mt-8">
        <p className="text-gray-500 text-xs">
          {lang === 'bg' ? '*Цените са без ДДС.' : '*Prices are without VAT.'}
        </p>
      </div>
    </section>
  )
}


