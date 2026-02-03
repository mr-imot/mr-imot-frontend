"use client"

import { Button } from "@/components/ui/button"

interface ScrollToFormButtonProps {
  children: React.ReactNode
  className?: string
}

export function ScrollToFormButton({ children, className }: ScrollToFormButtonProps) {
  const handleClick = () => {
    document.getElementById("application-form")?.scrollIntoView({ behavior: "smooth" })
  }
  return (
    <Button type="button" onClick={handleClick} className={className} size="lg">
      {children}
    </Button>
  )
}
