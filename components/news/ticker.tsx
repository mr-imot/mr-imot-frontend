import { BlogLang } from "@/lib/news"

export type ExchangeRates = {
  amount: number
  base: string
  date: string
  rates: {
    USD: number
    GBP: number
    BGN: number
  }
} | null

type TickerItem = {
  label: string
  value: string
  change: string
  isPositive: boolean
}

// Static mock data for housing market (Updated with NSI 2025 Q2 data)
const FALLBACK_TICKER_DATA: Record<string, TickerItem[]> = {
  bg: [
    { label: "София (ср. цена)", value: "€2,310/кв.м", change: "+15.5%", isPositive: true },
    { label: "Пловдив", value: "€1,565/кв.м", change: "+13.5%", isPositive: true },
    { label: "Варна", value: "€1,975/кв.м", change: "+19.0%", isPositive: true },
    { label: "Ипотечен лихва", value: "2.58%", change: "-0.07%", isPositive: true }, // lower interest is positive
  ],
  en: [
    { label: "Sofia (avg)", value: "€2,310/sqm", change: "+15.5%", isPositive: true },
    { label: "Plovdiv", value: "€1,565/sqm", change: "+13.5%", isPositive: true },
    { label: "Varna", value: "€1,975/sqm", change: "+19.0%", isPositive: true },
    { label: "Mortgage Rate", value: "2.58%", change: "-0.07%", isPositive: true },
  ],
  ru: [
    { label: "София (ср. цена)", value: "€2,310/кв.м", change: "+15.5%", isPositive: true },
    { label: "Пловдив", value: "€1,565/кв.м", change: "+13.5%", isPositive: true },
    { label: "Варна", value: "€1,975/кв.м", change: "+19.0%", isPositive: true },
    { label: "Ипотечная ставка", value: "2.58%", change: "-0.07%", isPositive: true },
  ],
  gr: [
    { label: "Σόφια (μέσος)", value: "€2,310/τ.μ.", change: "+15.5%", isPositive: true },
    { label: "Πλόβντιβ", value: "€1,565/τ.μ.", change: "+13.5%", isPositive: true },
    { label: "Βάρνα", value: "€1,975/τ.μ.", change: "+19.0%", isPositive: true },
    { label: "Επιτόκιο υποθήκης", value: "2.58%", change: "-0.07%", isPositive: true },
  ],
}

export function NewsTicker({ 
  lang, 
  rates
}: { 
  lang: BlogLang
  rates?: ExchangeRates
}) {
  // Use static mock data for housing market
  const staticItems = FALLBACK_TICKER_DATA[lang] || FALLBACK_TICKER_DATA['en']
  
  let dynamicItems: TickerItem[] = []

  if (rates && rates.rates) {
    // Calculate Cross Rates
    const usdBgn = (rates.rates.BGN / rates.rates.USD).toFixed(4)
    const gbpBgn = (rates.rates.BGN / rates.rates.GBP).toFixed(4)
    const eurBgn = rates.rates.BGN.toFixed(5)

    // Compare with previous day close (mock logic for change since we only have latest)
    // In a real app we'd fetch yesterday's rates too. For now we show the rate.
    
    dynamicItems = [
      { label: "EUR/BGN", value: eurBgn, change: "0.00%", isPositive: true },
      { label: "USD/BGN", value: usdBgn, change: "", isPositive: true },
      { label: "GBP/BGN", value: gbpBgn, change: "", isPositive: true },
    ]
  } else {
     dynamicItems = [
        { label: "EUR/BGN", value: "1.95583", change: "0.00%", isPositive: true }
     ]
  }

  const items = [...staticItems, ...dynamicItems]

  return (
    <div className="w-full overflow-hidden bg-charcoal-500 text-white py-2 border-b border-charcoal-400">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center mx-6 text-xs font-medium tracking-wide">
            <span className="text-white/70 mr-2 uppercase">{item.label}</span>
            <span className="mr-2">{item.value}</span>
            {item.change && (
                <span className={item.isPositive ? "text-emerald-400" : "text-rose-400"}>
                {item.change}
                </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
