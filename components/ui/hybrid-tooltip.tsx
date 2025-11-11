"use client"

import React, { useState, useRef, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface HybridTooltipProps {
  triggerText: React.ReactNode
  content: React.ReactNode
  className?: string
  triggerClassName?: string
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  sideOffset?: number
}

// Hybrid Tooltip/Popover component that works with hover on desktop and click on mobile
export function HybridTooltip({ 
  triggerText, 
  content, 
  className,
  triggerClassName,
  side = "top",
  align = "start",
  sideOffset = 8
}: HybridTooltipProps) {
  const [open, setOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false)
    }, 150)
  }

  const handleClick = () => {
    setOpen(!open)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span 
          className={cn("underline decoration-dotted cursor-help", triggerClassName)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          {triggerText}
        </span>
      </PopoverTrigger>
      <PopoverContent 
        side={side}
        align={align}
        className={cn("max-w-xs text-sm leading-relaxed bg-white border border-gray-200 shadow-xl z-50 p-3 rounded-lg", className)}
        sideOffset={sideOffset}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {content}
      </PopoverContent>
    </Popover>
  )
}

