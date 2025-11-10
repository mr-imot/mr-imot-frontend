"use client"

import { ScrollAnimationWrapper } from "@/components/scroll-animation-wrapper"
import { Calendar } from "lucide-react"

interface RoadmapItem {
  date: string
  title: string
  description: string
}

interface RoadmapTimelineProps {
  items: RoadmapItem[]
}

export function RoadmapTimeline({ items }: RoadmapTimelineProps) {
  return (
    <div className="relative">
      {/* Timeline line - Mobile */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#111827] via-[#374151] to-[#111827] md:hidden"></div>
      
      {/* Timeline line - Desktop */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#111827] via-[#374151] to-[#111827] hidden md:block transform -translate-x-1/2"></div>
      
      <div className="space-y-16 md:space-y-20">
        {items.map((item, index) => (
          <ScrollAnimationWrapper key={index} delay={index * 0.1}>
            <div className="relative flex items-start gap-6 md:gap-8">
              {/* Timeline dot - Mobile */}
              <div className="md:hidden flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#111827] to-[#1f2937] rounded-full border-4 border-white shadow-xl flex items-center justify-center z-10">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              
              {/* Timeline dot - Desktop */}
              <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 -translate-y-1 w-12 h-12 bg-gradient-to-br from-[#111827] to-[#1f2937] rounded-full border-4 border-white shadow-xl z-10 items-center justify-center hover:scale-110 transition-transform duration-300">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              
              {/* Content - Alternating sides on desktop */}
              <div className={`flex-1 md:w-[calc(50%-2.5rem)] ${index % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8 md:ml-auto'}`}>
                <div className={`bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#e5e7eb] transform hover:scale-[1.02] ${index % 2 === 0 ? 'md:mr-4' : 'md:ml-4'}`}>
                  {/* Date badge */}
                  <div className={`inline-flex items-center gap-2 bg-gradient-to-br from-[#111827] to-[#1f2937] text-white px-5 py-2.5 rounded-full text-sm font-semibold mb-5 shadow-md ${index % 2 === 0 ? 'md:ml-auto md:block' : ''}`}>
                    <Calendar className="w-4 h-4" />
                    {item.date}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl md:text-2xl font-bold text-[#111827] mb-4 font-serif">
                    {item.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-[#374151] leading-relaxed text-base md:text-lg font-sans">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          </ScrollAnimationWrapper>
        ))}
      </div>
    </div>
  )
}

