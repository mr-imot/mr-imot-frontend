"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Minus, Eye, ExternalLink, Phone, MessageSquare, Heart, List } from "lucide-react"
import { cn } from "@/lib/utils"

interface KpiMetric {
  id: "views" | "website_clicks" | "phone_clicks" | "contact_messages" | "saved_listings" | "active_listings"
  label: string
  value: number
  deltaPct: number | null
  trend: number[]
}

interface AnalyticsKpiGridProps {
  metrics: KpiMetric[]
  onDrill: (metricId: string) => void
}

const metricIcons = {
  views: Eye,
  website_clicks: ExternalLink,
  phone_clicks: Phone,
  contact_messages: MessageSquare,
  saved_listings: Heart,
  active_listings: List,
}

const metricColors = {
  views: "from-blue-500 to-blue-600",
  website_clicks: "from-emerald-500 to-emerald-600",
  phone_clicks: "from-amber-500 to-amber-600",
  contact_messages: "from-purple-500 to-purple-600",
  saved_listings: "from-pink-500 to-pink-600",
  active_listings: "from-slate-500 to-slate-600",
}

export function AnalyticsKpiGrid({ metrics, onDrill }: AnalyticsKpiGridProps) {
  const renderTrendIcon = (deltaPct: number | null) => {
    if (deltaPct === null || Math.abs(deltaPct) < 0.1) {
      return <Minus className="h-4 w-4 text-slate-500" />
    }
    return deltaPct > 0 ? (
      <TrendingUp className="h-4 w-4 text-emerald-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    )
  }

  const renderTrendText = (deltaPct: number | null) => {
    if (deltaPct === null || Math.abs(deltaPct) < 0.1) {
      return <span className="text-slate-600">No change</span>
    }
    const isPositive = deltaPct > 0
    return (
      <span className={cn("font-medium", isPositive ? "text-emerald-600" : "text-red-600")}>
        {isPositive ? "+" : ""}
        {deltaPct.toFixed(1)}%
      </span>
    )
  }

  const renderMiniChart = (trend: number[]) => {
    const max = Math.max(...trend)
    const min = Math.min(...trend)
    const range = max - min || 1

    return (
      <div className="flex items-end gap-0.5 h-8 w-16">
        {trend.slice(-8).map((value, index) => {
          const height = ((value - min) / range) * 100
          return (
            <div
              key={index}
              className="bg-gradient-to-t from-slate-300 to-slate-400 rounded-sm flex-1 min-h-[0.125rem]"
              style={{ height: `${Math.max(height, 8)}%` }}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => {
        const Icon = metricIcons[metric.id]
        const colorClass = metricColors[metric.id]

        return (
          <Card
            key={metric.id}
            className="rounded-2xl border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
            onClick={() => onDrill(metric.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={cn("p-3 rounded-xl bg-gradient-to-br", colorClass, "text-white shadow-sm")}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-right">{renderMiniChart(metric.trend)}</div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                  {metric.label}
                </h3>

                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-900">{metric.value.toLocaleString()}</span>

                  <div className="flex items-center gap-1">
                    {renderTrendIcon(metric.deltaPct)}
                    <span className="text-sm">{renderTrendText(metric.deltaPct)}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-slate-500 hover:text-slate-700 p-0 h-auto font-normal"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDrill(metric.id)
                    }}
                  >
                    View details →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
