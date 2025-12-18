"use client"

import { useEffect, useState } from "react"
import { palette } from "@/theme/palette"
import styles from "./fairy-lights.module.css"

export function FairyLights() {
  const [width, setWidth] = useState(1920)

  useEffect(() => {
    const updateWidth = () => {
      setWidth(window.innerWidth)
    }
    
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  // Christmas color palette
  const christmasColors = [
    '#dc2626', // Red
    '#16a34a', // Green
    '#fbbf24', // Gold/Amber
    '#ffffff', // White
    '#3b82f6', // Blue
    '#a855f7', // Purple
    '#ef4444', // Bright Red
    '#22c55e', // Bright Green
  ]

  // Generate bulb positions along a curved path
  const bulbCount = Math.max(12, Math.floor(width / 120)) // Responsive bulb count
  const bulbPositions = []
  
  for (let i = 0; i < bulbCount; i++) {
    const x = (width / (bulbCount - 1)) * i
    // Create a gentle wave pattern
    const wave = Math.sin((i / bulbCount) * Math.PI * 2) * 8
    const y = 18 + wave
    // Cycle through Christmas colors for variety
    const color = christmasColors[i % christmasColors.length]
    bulbPositions.push({ x, y, color, index: i })
  }

  // Create SVG path for the wire - smooth wave pattern matching reference style
  // Pattern: M0 10 Q 50 25 100 10 T 200 10 T 300 10...
  const segmentWidth = 100
  const segments = Math.ceil(width / segmentWidth) + 1
  let pathD = `M 0 18`
  
  // First quadratic curve
  pathD += ` Q ${segmentWidth / 2} 25 ${segmentWidth} 18`
  
  // Continue with smooth curves
  for (let i = 2; i < segments; i++) {
    const x = i * segmentWidth
    pathD += ` T ${x} 18`
  }
  
  // Extend to full width if needed
  if ((segments - 1) * segmentWidth < width) {
    pathD += ` L ${width} 18`
  }

  return (
    <div className={styles.container}>
      <svg 
        width="100%" 
        height="40" 
        viewBox={`0 0 ${width} 40`}
        preserveAspectRatio="none"
        className={styles.svg}
      >
        {/* Wire */}
        <path 
          d={pathD}
          stroke="#333" 
          fill="none" 
          strokeWidth="1.5" 
          strokeLinecap="round"
          className={styles.wire}
        />
        
        {/* Bulbs */}
        {bulbPositions.map((bulb) => (
          <g key={bulb.index} className={styles.bulbGroup}>
            {/* Outer glow - larger and more festive */}
            <circle 
              cx={bulb.x} 
              cy={bulb.y} 
              r="12" 
              fill={bulb.color}
              opacity="0.2"
              className={styles.outerGlow}
              style={{ 
                animationDelay: `${bulb.index * 0.15}s`,
                fill: bulb.color
              }}
            />
            {/* Middle glow */}
            <circle 
              cx={bulb.x} 
              cy={bulb.y} 
              r="8" 
              fill={bulb.color}
              opacity="0.4"
              className={styles.glow}
              style={{ 
                animationDelay: `${bulb.index * 0.15}s`,
                fill: bulb.color
              }}
            />
            {/* Bulb */}
            <circle 
              cx={bulb.x} 
              cy={bulb.y} 
              r="5" 
              fill={bulb.color}
              className={styles.bulb}
              style={{ 
                animationDelay: `${bulb.index * 0.15}s`,
                filter: `drop-shadow(0 0 6px ${bulb.color}) drop-shadow(0 0 12px ${bulb.color})`
              }}
            />
            {/* Highlight for shine */}
            <circle 
              cx={bulb.x - 1.5} 
              cy={bulb.y - 1.5} 
              r="2" 
              fill="rgba(255, 255, 255, 0.8)"
              className={styles.highlight}
            />
            {/* Sparkle effect for some bulbs */}
            {bulb.index % 3 === 0 && (
              <g className={styles.sparkle} style={{ animationDelay: `${bulb.index * 0.15}s` }}>
                <line x1={bulb.x} y1={bulb.y - 8} x2={bulb.x} y2={bulb.y - 12} stroke="rgba(255, 255, 255, 0.9)" strokeWidth="1.5" />
                <line x1={bulb.x} y1={bulb.y + 8} x2={bulb.x} y2={bulb.y + 12} stroke="rgba(255, 255, 255, 0.9)" strokeWidth="1.5" />
                <line x1={bulb.x - 8} y1={bulb.y} x2={bulb.x - 12} y2={bulb.y} stroke="rgba(255, 255, 255, 0.9)" strokeWidth="1.5" />
                <line x1={bulb.x + 8} y1={bulb.y} x2={bulb.x + 12} y2={bulb.y} stroke="rgba(255, 255, 255, 0.9)" strokeWidth="1.5" />
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}
