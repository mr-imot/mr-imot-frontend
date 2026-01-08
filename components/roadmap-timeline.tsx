"use client"

import { Image } from "@imagekit/next"
import { toIkPath } from "@/lib/imagekit"
import { ScrollAnimationWrapper } from "@/components/scroll-animation-wrapper"
import { Calendar, Rocket, Zap, Globe, MapPin, BarChart3, Landmark, Sparkles, Store } from "lucide-react"

// SVG Arrow Components - From svgrepo.com
const HorizontalArrow = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    role="img"
  >
    <title>Arrow pointing right to next roadmap milestone</title>
    <path
      d="M13 15L16 12M16 12L13 9M16 12H8M21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12Z"
      stroke="#9ca3af"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const VerticalArrow = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    role="img"
  >
    <title>Arrow pointing down to next roadmap milestone</title>
    <path
      d="M9 13L12 16M12 16L15 13M12 16V8M21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12Z"
      stroke="#9ca3af"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

interface RoadmapItem {
  date: string
  title: string
  description: string
}

interface RoadmapTimelineProps {
  items: RoadmapItem[]
}

// Icon mapping based on keywords in title/description
const getIcon = (item: RoadmapItem, index: number) => {
  const title = item.title.toLowerCase()
  const desc = item.description.toLowerCase()
  
  if (title.includes('start') || title.includes('начало') || title.includes('project') || title.includes('проект')) {
    return Rocket
  }
  if (title.includes('beta') || title.includes('бета') || title.includes('launch') || title.includes('старт')) {
    return Zap
  }
  if (title.includes('language') || title.includes('език') || title.includes('market') || title.includes('пазар') || title.includes('expansion') || title.includes('разширяване')) {
    return Globe
  }
  if (title.includes('statistics') || title.includes('статистики') || title.includes('analytics') || title.includes('анализ')) {
    return BarChart3
  }
  if (title.includes('land') || title.includes('парцел') || title.includes('portal') || title.includes('портал')) {
    return Landmark
  }
  if (title.includes('uae') || title.includes('емирства') || title.includes('greece') || title.includes('гърция') || title.includes('turkish') || title.includes('турски')) {
    return MapPin
  }
  return Store
}

// Extract year from date string (handles both Bulgarian and English dates)
const getYear = (date: string): number => {
  // Try to find 4-digit year
  const yearMatch = date.match(/\d{4}/)
  if (yearMatch) {
    return parseInt(yearMatch[0])
  }
  return 2025 // default
}

export function RoadmapTimeline({ items }: RoadmapTimelineProps) {
  // Group items by year
  const items2025 = items.filter((item, index) => {
    const year = getYear(item.date)
    return year === 2025
  })
  
  const items2026Plus = items.filter((item, index) => {
    const year = getYear(item.date)
    return year >= 2026
  })

  return (
    <div className="relative py-8">
      {/* Mobile: Single column with vertical lines */}
      <div className="md:hidden space-y-6">
        {items.map((item, index) => {
          const Icon = getIcon(item, index)
          const isLast = index === items.length - 1
          
          return (
            <ScrollAnimationWrapper key={index} delay={index * 0.1}>
              <div className="relative">
                {/* Vertical connector line (except for last item) */}
                {!isLast && (
                  <div className="absolute left-6 top-20 bottom-0 w-0.5 border-l border-dashed border-[#e5e7eb] -translate-y-6"></div>
                )}
                
                <div className="relative flex items-start gap-4">
                  {/* Numbered circle */}
                  <div className="flex-shrink-0 w-12 h-12 bg-[#14213d] rounded-full border-2 border-white shadow-md flex items-center justify-center z-10 relative" aria-label={`Roadmap milestone ${index + 1}`}>
                    <span className="text-white font-bold text-base" aria-hidden="true">{index + 1}</span>
                  </div>
                  
                  {/* Content card */}
                  <div className="flex-1 min-w-0">
                    <div className="bg-white rounded-xl p-5 border border-[#e5e7eb] shadow-sm hover:shadow-md transition-shadow duration-200">
                      <time className="text-[#6b7280] text-xs font-medium mb-2 block" dateTime={item.date}>
                        {item.date}
                      </time>
                      
                      <div className="flex items-start gap-2 mb-2">
                        <div className="w-6 h-6 flex items-center justify-center text-[#14213d] flex-shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-base font-bold text-[#111827] font-serif flex-1">
                          {item.title}
                        </h3>
                      </div>
                      
                      <p className="text-[#374151] leading-relaxed text-sm font-sans">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollAnimationWrapper>
          )
        })}
      </div>

      {/* Tablet & Desktop: 2025 vertical + image, then 2026+ horizontal */}
      <div className="hidden md:block space-y-16">
        {/* Top Section: 2025 (vertical, left) + Image (right) */}
        <div className="grid lg:grid-cols-7 gap-8 lg:gap-12">
          {/* Left: 2025 Roadmap - Vertical */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-[#111827] font-serif mb-3">2025</h2>
              <div className="w-20 h-0.5 bg-[#14213d] mx-auto" aria-hidden="true"></div>
            </div>
            
            <div className="space-y-0 relative">
              {items2025.map((item, index) => {
                const Icon = getIcon(item, index)
                const originalIndex = items.indexOf(item)
                const isLast = index === items2025.length - 1
                
                return (
                  <ScrollAnimationWrapper key={originalIndex} delay={index * 0.1}>
                    <div className="relative mb-12">
                      {/* Vertical connector arrow (except for last item) */}
                      {!isLast && (
                        <div className="absolute left-3 bottom-0 z-0 flex justify-center" style={{ transform: 'translateY(calc(50% + 1.5rem))' }}>
                          <VerticalArrow className="w-6 h-6" />
                        </div>
                      )}
                      
                      <div className="relative flex items-start gap-4 z-10">
                        {/* Numbered circle */}
                        <div className="flex-shrink-0 w-12 h-12 bg-[#14213d] rounded-full border-2 border-white shadow-md flex items-center justify-center relative" aria-label={`Roadmap milestone ${originalIndex + 1}`}>
                          <span className="text-white font-bold text-base" aria-hidden="true">{originalIndex + 1}</span>
                        </div>
                        
                        {/* Content card */}
                        <div className="flex-1 min-w-0 max-w-md">
                          <div className="bg-white rounded-xl p-6 border border-[#e5e7eb] shadow-sm hover:shadow-md transition-shadow duration-200">
                            <time className="text-[#6b7280] text-xs font-medium mb-2 block" dateTime={item.date}>
                              {item.date}
                            </time>
                            
                            <div className="flex items-start gap-2 mb-2">
                              <div className="w-6 h-6 flex items-center justify-center text-[#14213d] flex-shrink-0">
                                <Icon className="w-5 h-5" />
                              </div>
                              <h3 className="text-base font-bold text-[#111827] font-serif flex-1">
                                {item.title}
                              </h3>
                            </div>
                            
                            <p className="text-[#374151] leading-relaxed text-sm font-sans">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollAnimationWrapper>
                )
              })}
            </div>
          </div>

          {/* Right: Roadmap Visual Reference Image - Desktop Only */}
          <div className="hidden lg:flex lg:col-span-3 items-center">
            <div className="sticky top-8 w-full">
              <div className="relative w-full max-w-[640px] ml-auto">
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden ring-1 ring-black/10 shadow-[0_20px_60px_rgba(2,6,23,0.15)] bg-white">
                  <Image
                    src={toIkPath("https://ik.imagekit.io/ts59gf2ul/about-us/596shots_so.png")}
                    alt="Mister Imot platform roadmap visualization showing dashboard interface with analytics, property management features, and user engagement metrics displayed on a laptop screen"
                    fill
                    transformation={[{ width: 1400, height: 900, quality: 85, format: "webp", focus: "auto" }]}
                    className="object-cover"
                    sizes="(max-width: 1024px) 0vw, 640px"
                    priority={false}
                    loading="lazy"
                  />
                </div>
                {/* Decorative glow effect */}
                <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[28px] bg-[radial-gradient(40%_40%_at_60%_40%,rgba(139,92,246,0.18),transparent_60%)]" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: 2026+ Roadmap - Horizontal */}
        <div className="relative">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#111827] font-serif mb-3">2026+</h2>
            <div className="w-20 h-0.5 bg-[#14213d] mx-auto" aria-hidden="true"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {items2026Plus.map((item, index) => {
              const Icon = getIcon(item, items2025.length + index)
              const originalIndex = items.indexOf(item)
              const isLastInRow = (index + 1) % 3 === 0 || index === items2026Plus.length - 1
              const isLastItem = index === items2026Plus.length - 1
              
              return (
                <ScrollAnimationWrapper key={originalIndex} delay={(items2025.length + index) * 0.1}>
                  <div className="relative">
                    {/* Right arrow - for items not at end of row */}
                    {!isLastInRow && !isLastItem && (
                      <div className="absolute top-3 -right-3 lg:-right-4 z-0 flex items-center">
                        <HorizontalArrow className="w-6 h-6 lg:w-8 lg:h-8" />
                      </div>
                    )}
                    
                    {/* Card content */}
                    <div className="relative z-10 h-full">
                      {/* Numbered circle at top */}
                      <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-[#14213d] rounded-full border-2 border-white shadow-md flex items-center justify-center relative" aria-label={`Roadmap milestone ${originalIndex + 1}`}>
                          <span className="text-white font-bold text-base" aria-hidden="true">{originalIndex + 1}</span>
                        </div>
                      </div>
                      
                      {/* Card */}
                      <div className="bg-white rounded-xl p-6 border border-[#e5e7eb] shadow-sm hover:shadow-md transition-shadow duration-200 h-full flex flex-col min-h-[280px]">
                        {/* Date */}
                        <time className="text-[#6b7280] text-xs font-medium mb-3 text-center block" dateTime={item.date}>
                          {item.date}
                        </time>
                        
                        {/* Icon and Title */}
                        <div className="flex flex-col items-center gap-2 mb-3">
                          <div className="w-10 h-10 flex items-center justify-center text-[#14213d]">
                            <Icon className="w-6 h-6" />
                          </div>
                          <h3 className="text-base font-bold text-[#111827] font-serif text-center">
                            {item.title}
                          </h3>
                        </div>
                        
                        {/* Description */}
                        <p className="text-[#374151] leading-relaxed text-sm font-sans text-center flex-grow">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollAnimationWrapper>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
