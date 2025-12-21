"use client"

import { useEffect, useRef, useState } from "react"

type PropertyFeesCalculatorProps = {
  theme?: "light" | "dark"
  lang?: "bg" | "en"
  targetId?: string
}

export function PropertyFeesCalculator({
  theme = "light",
  lang = "bg",
  targetId = "mrimot-calculator-embedded",
}: PropertyFeesCalculatorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scriptLoadedRef = useRef(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!containerRef.current || scriptLoadedRef.current) {
      return
    }

    const existingScript = document.querySelector('script[src*="property-fees.js"]') as HTMLScriptElement | null

    if (existingScript) {
      scriptLoadedRef.current = true
      // Check if widget is already initialized in this container
      const checkWidget = () => {
        const hasShadowRoot = containerRef.current?.shadowRoot
        const hasWidget = containerRef.current?.querySelector('*')
        if (hasShadowRoot || hasWidget) {
          setIsReady(true)
        } else {
          // Retry checking for widget initialization
          setTimeout(checkWidget, 100)
        }
      }
      checkWidget()
      return
    }

    const script = document.createElement("script")
    script.src = '/widgets/property-fees.js'
    script.setAttribute("data-theme", theme)
    script.setAttribute("data-lang", lang)
    script.setAttribute("data-target", targetId)
    script.async = true

    script.onload = () => {
      scriptLoadedRef.current = true
      // Wait for widget to initialize with retry mechanism
      const checkWidget = () => {
        const hasShadowRoot = containerRef.current?.shadowRoot
        if (hasShadowRoot) {
          setIsReady(true)
        } else {
          // Retry checking for widget initialization (up to 2 seconds)
          const retries = 20
          let count = 0
          const interval = setInterval(() => {
            count++
            if (containerRef.current?.shadowRoot) {
              clearInterval(interval)
              setIsReady(true)
            } else if (count >= retries) {
              clearInterval(interval)
              setIsReady(true) // Show container anyway after timeout
            }
          }, 100)
        }
      }
      // Give script time to initialize
      setTimeout(checkWidget, 100)
    }

    script.onerror = () => {
      console.error("Failed to load property fees calculator widget")
      setIsReady(true) // Show container even on error
    }

    document.body.appendChild(script)
  }, [theme, lang, targetId])

  return (
    <div className="not-prose my-8">
      <div
        id={targetId}
        ref={containerRef}
        className="min-h-[400px] w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800"
      >
        {!isReady && (
          <div className="flex h-[400px] items-center justify-center text-muted-foreground">
            Зареждане на калкулатора...
          </div>
        )}
      </div>
    </div>
  )
}

