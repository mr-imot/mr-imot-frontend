import * as React from "react"

const MOBILE_BREAKPOINT = 1024 // Match ModalClientWrapper breakpoint to prevent remounts

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < MOBILE_BREAKPOINT
  })

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${(MOBILE_BREAKPOINT - 1) / 16}em)`) // Convert px to em
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    // Set initial value immediately (already set in useState initializer, but ensure consistency)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile // Return boolean directly, not coerced
}
