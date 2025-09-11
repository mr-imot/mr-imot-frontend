"use client"

import { useEffect, useRef, useState } from "react"
import type { LucideIcon } from "lucide-react"

interface EnhancedFeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  benefit: string
  isPrimary?: boolean
  delay?: number
  className?: string
}

export function EnhancedFeatureCard({
  icon: Icon,
  title,
  description,
  benefit,
  isPrimary = false,
  delay = 0,
  className = "",
}: EnhancedFeatureCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true)
          }, delay)
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      },
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current)
      }
    }
  }, [delay])

  if (isPrimary) {
    return (
      <div
        ref={cardRef}
        className={`group relative bg-gradient-to-br from-ds-primary-600 via-ds-primary-700 to-ds-primary-800 text-white p-10 lg:p-12 rounded-3xl shadow-2xl hover:shadow-3xl border-2 border-ds-primary-500 hover:-translate-y-4 transition-all duration-700 ease-out h-full flex flex-col min-h-[26.25rem] overflow-hidden ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        } ${className}`}
        style={{
          transitionDelay: isVisible ? "0ms" : `${delay}ms`,
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
        </div>

        {/* Primary Badge */}
        <div className="absolute top-6 right-6 bg-ds-accent-400 text-ds-accent-900 px-3 py-1 rounded-full text-sm font-bold">
          Most Popular
        </div>

        <div className="flex flex-col items-center text-center space-y-8 flex-1 relative z-10">
          {/* Enhanced Icon Container */}
          <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-500 group-hover:scale-110 shadow-2xl">
            <Icon className="h-16 w-16 text-white group-hover:scale-110 transition-all duration-500 stroke-[1.5]" />
          </div>

          {/* Enhanced Text Content */}
          <div className="space-y-6 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-3xl font-bold leading-tight text-white">{title}</h3>
              <p className="text-xl text-white/90 leading-relaxed max-w-md mx-auto">{description}</p>
            </div>

            {/* Benefit Highlight */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <p className="text-lg font-semibold text-ds-accent-200 leading-relaxed">{benefit}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={cardRef}
      className={`group bg-white p-8 lg:p-10 rounded-2xl shadow-lg border border-ds-neutral-200 hover:shadow-2xl hover:border-ds-neutral-300 hover:-translate-y-3 transition-all duration-500 ease-out h-full flex flex-col min-h-[23.75rem] ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{
        transitionDelay: isVisible ? "0ms" : `${delay}ms`,
      }}
    >
      <div className="flex flex-col items-center text-center space-y-6 flex-1">
        {/* Enhanced Icon Container */}
        <div className="w-24 h-24 bg-gradient-to-br from-ds-accent-50 to-ds-accent-100 rounded-2xl flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-ds-accent-100 group-hover:to-ds-accent-200 transition-all duration-300 group-hover:scale-110 shadow-md group-hover:shadow-lg">
          <Icon className="h-10 w-10 text-ds-accent-500 group-hover:text-ds-accent-600 transition-all duration-300 stroke-[2]" />
        </div>

        {/* Enhanced Text Content */}
        <div className="space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-2xl font-bold leading-tight text-ds-neutral-900 group-hover:text-ds-primary-600 transition-colors duration-300">
              {title}
            </h3>
            <p className="text-lg text-ds-neutral-600 leading-relaxed max-w-sm mx-auto">{description}</p>
          </div>

          {/* Benefit Highlight */}
          <div className="bg-ds-accent-50 rounded-xl p-4 border border-ds-accent-100 mt-auto">
            <p className="text-base font-semibold text-ds-accent-700 leading-relaxed">{benefit}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
