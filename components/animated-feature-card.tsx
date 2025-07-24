"use client"

import { useEffect, useRef, useState } from "react"
import type { LucideIcon } from "lucide-react"

interface AnimatedFeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  delay?: number
}

export function AnimatedFeatureCard({ icon: Icon, title, description, delay = 0 }: AnimatedFeatureCardProps) {
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

  return (
    <div
      ref={cardRef}
      className={`group bg-white p-8 rounded-2xl shadow-md border border-ds-neutral-200 hover:shadow-xl hover:border-ds-neutral-300 hover:-translate-y-2 transition-all duration-500 ease-out h-full flex flex-col min-h-[320px] ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{
        transitionDelay: isVisible ? "0ms" : `${delay}ms`,
      }}
    >
      <div className="flex flex-col items-center text-center space-y-6 flex-1">
        {/* Enhanced Icon Container */}
        <div className="w-24 h-24 bg-gradient-to-br from-ds-accent-50 to-ds-accent-100 rounded-3xl flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-ds-accent-100 group-hover:to-ds-accent-200 transition-all duration-300 group-hover:scale-110 shadow-sm group-hover:shadow-md">
          <Icon className="h-8 w-8 text-ds-accent-500 group-hover:text-ds-accent-600 transition-all duration-300 stroke-[2]" />
        </div>

        {/* Enhanced Text Content */}
        <div className="space-y-4 flex-1 flex flex-col justify-between">
          <h3 className="text-lg font-semibold leading-tight text-ds-neutral-900 group-hover:text-ds-primary-600 transition-colors duration-300">
            {title}
          </h3>
          <p className="text-base text-ds-neutral-600 leading-relaxed max-w-sm mx-auto flex-1">{description}</p>
        </div>
      </div>
    </div>
  )
}
