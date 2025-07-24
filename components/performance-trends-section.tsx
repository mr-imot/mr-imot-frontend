"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Download, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface PerformanceTrendsSectionProps {
  range: { start: Date; end: Date }
  comparison: { start: Date; end: Date }
  selectedMetricIds: string[]
  selectedListingIds: string[]
  listings: Array<{ id: string; name: string }>
  data: Array<{
    date: string
    views: number
    website_clicks: number
    phone_clicks: number
    contact_messages: number
    saved_listings: number
  }>
  comparisonData: Array<{
    date: string
    views: number
    website_clicks: number
    phone_clicks: number
    contact_messages: number
    saved_listings: number
  }>
  onRangeChange: (range: { start: Date; end: Date }) => void
  onComparisonChange: (comparison: { start: Date; end: Date }) => void
  onMetricChange: (metricIds: string[]) => void
  onListingChange: (listingIds: string[]) => void
  onExport: (type: "csv" | "png") => void
}

const metricOptions = [
  { id: "views", label: "Views", color: "bg-blue-500" },
  { id: "website_clicks", label: "Website Clicks", color: "bg-emerald-500" },
  { id: "phone_clicks", label: "Phone Clicks", color: "bg-amber-500" },
  { id: "contact_messages", label: "Contact Messages", color: "bg-purple-500" },
  { id: "saved_listings", label: "Saved Listings", color: "bg-pink-500" },
]

export function PerformanceTrendsSection({
  range,
  comparison,
  selectedMetricIds,
  selectedListingIds,
  listings,
  data,
  comparisonData,
  onRangeChange,
  onComparisonChange,
  onMetricChange,
  onListingChange,
  onExport,
}: PerformanceTrendsSectionProps) {
  const [showComparison, setShowComparison] = useState(false)

  // Calculate summary stats
  const currentTotal = data.reduce((sum, day) => {
    return (
      sum +
      selectedMetricIds.reduce((metricSum, metricId) => {
        return metricSum + (day[metricId as keyof typeof day] as number)
      }, 0)
    )
  }, 0)

  const comparisonTotal = comparisonData.reduce((sum, day) => {
    return (
      sum +
      selectedMetricIds.reduce((metricSum, metricId) => {
        return metricSum + (day[metricId as keyof typeof day] as number)
      }, 0)
    )
  }, 0)

  const percentChange = comparisonTotal > 0 ? ((currentTotal - comparisonTotal) / comparisonTotal) * 100 : 0
  const isPositive = percentChange > 0
  const isNeutral = Math.abs(percentChange) < 0.1

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl">Performance Trends</CardTitle>
            <p className="text-sm text-slate-600 mt-1">Track your metrics over time and compare periods</p>
          </div>

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {range.start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} -{" "}
                  {range.end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar initialFocus mode="range" defaultMonth={range.start} numberOfMonths={2} />
              </PopoverContent>
            </Popover>

            <Button variant="outline" size="sm" onClick={() => onExport("csv")}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="text-sm font-medium text-slate-900 mb-3">Metrics</h4>
            <div className="space-y-2">
              {metricOptions.map((metric) => (
                <div key={metric.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={metric.id}
                    checked={selectedMetricIds.includes(metric.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onMetricChange([...selectedMetricIds, metric.id])
                      } else {
                        onMetricChange(selectedMetricIds.filter((id) => id !== metric.id))
                      }
                    }}
                  />
                  <label
                    htmlFor={metric.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                  >
                    <div className={cn("w-3 h-3 rounded-full", metric.color)} />
                    {metric.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-900 mb-3">Listings</h4>
            <Select
              value={selectedListingIds.length === 0 ? "all" : "selected"}
              onValueChange={(value) => {
                if (value === "all") {
                  onListingChange([])
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All listings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Listings</SelectItem>
                {listings.map((listing) => (
                  <SelectItem key={listing.id} value={listing.id}>
                    {listing.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
          <div>
            <div className="text-2xl font-bold text-slate-900">{currentTotal.toLocaleString()}</div>
            <div className="text-sm text-slate-600">Total for selected metrics</div>
          </div>

          {showComparison && (
            <>
              <div className="flex items-center gap-2">
                {isNeutral ? (
                  <Minus className="h-4 w-4 text-slate-500" />
                ) : isPositive ? (
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={cn(
                    "text-sm font-medium",
                    isNeutral ? "text-slate-600" : isPositive ? "text-emerald-600" : "text-red-600",
                  )}
                >
                  {isNeutral ? "No change" : `${isPositive ? "+" : ""}${percentChange.toFixed(1)}%`}
                </span>
              </div>
              <div className="text-sm text-slate-600">vs previous period ({comparisonTotal.toLocaleString()})</div>
            </>
          )}
        </div>

        {/* Chart Placeholder */}
        <div className="h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-slate-400 mb-2">
              <TrendingUp className="h-8 w-8 mx-auto" />
            </div>
            <p className="text-sm text-slate-600">Performance chart would be displayed here</p>
            <p className="text-xs text-slate-500 mt-1">
              Showing {selectedMetricIds.length} metric{selectedMetricIds.length !== 1 ? "s" : ""} over {data.length}{" "}
              days
            </p>
          </div>
        </div>

        {/* Comparison Toggle */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="flex items-center space-x-2">
            <Checkbox id="comparison" checked={showComparison} onCheckedChange={setShowComparison} />
            <label
              htmlFor="comparison"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Compare with previous period
            </label>
          </div>

          {showComparison && (
            <Badge variant="outline" className="text-xs">
              Comparing {comparison.start.toLocaleDateString()} - {comparison.end.toLocaleDateString()}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
