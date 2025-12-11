"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import type { BlogLang } from "@/lib/news"

type AnalyticsBandProps = {
  lang: BlogLang
}

const tabs = [
  {
    key: "permits",
    label: {
      en: "Building permits",
      bg: "Разрешителни за строеж",
      ru: "Разрешения на строительство",
      gr: "Разрешителни за строеж",
    },
    iframe: "https://api.tradingeconomics.com/embed/embed?country=Bulgaria&indicator=Building%20Permits&freq=Monthly&bg=ffffff&color=16a34a&cor=333333&header=true&h=360&w=100%25&title=true",
  },
  {
    key: "prices",
    label: {
      en: "Price index (NSI)",
      bg: "Индекс на цени (НСИ)",
      ru: "Индекс цен (НСИ)",
      gr: "Индекс на цени (НСИ)",
    },
    iframe: "https://api.tradingeconomics.com/embed/embed?country=Bulgaria&indicator=Housing%20Index&freq=Quarterly&bg=ffffff&color=16a34a&cor=333333&header=true&h=360&w=100%25&title=true",
  },
  {
    key: "rates",
    label: {
      en: "Mortgage rates",
      bg: "Ипотечни лихви",
      ru: "Ипотечные ставки",
      gr: "Ипотечни лихви",
    },
    iframe: "https://api.tradingeconomics.com/embed/embed?country=Bulgaria&indicator=Mortgage%20Rate&freq=Monthly&bg=ffffff&color=16a34a&cor=333333&header=true&h=360&w=100%25&title=true",
  },
]

export default function AnalyticsBand({ lang }: AnalyticsBandProps) {
  const [active, setActive] = useState(tabs[0].key)
  const activeTab = tabs.find((t) => t.key === active) || tabs[0]

  return (
    <section className="overflow-hidden rounded-3xl border border-muted bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-muted px-5 py-4">
        <div className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {lang === "bg" ? "Бързи графики" : lang === "ru" ? "Быстрые графики" : lang === "gr" ? "Бързи графики" : "Quick charts"}
        </div>
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold transition",
                active === tab.key ? "border-primary bg-primary/10 text-primary" : "border-muted bg-white hover:border-primary/40"
              )}
            >
              {tab.label[lang] || tab.label.en}
            </button>
          ))}
        </div>
      </div>
      <div className="aspect-[16/7] w-full bg-muted/40">
        <iframe
          key={activeTab.key}
          src={activeTab.iframe}
          title={activeTab.label[lang] || activeTab.label.en}
          className="h-full w-full border-0"
          loading="lazy"
        />
      </div>
    </section>
  )
}

