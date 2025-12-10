"use client"

import { useEffect, useState, useRef } from "react"
import { PricingSection } from "./PricingSection"

interface LazyPricingSectionProps {
  lang: string
  dict: any
}

export function LazyPricingSection({ lang, dict }: LazyPricingSectionProps) {
  const [shouldLoad, setShouldLoad] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { 
        rootMargin: '200px' // Start loading 200px before it comes into view
      }
    )

    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div ref={containerRef}>
      {shouldLoad ? (
        <PricingSection lang={lang} dict={dict} />
      ) : (
        <div className="h-64 flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      )}
    </div>
  )
}

