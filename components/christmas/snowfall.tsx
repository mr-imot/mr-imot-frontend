'use client'

import { useEffect, useRef, useState } from 'react'
import './snowfall.css'

interface Snowflake {
  id: number
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  rotation: number
  rotationSpeed: number
  drift: number
}

interface SnowfallProps {
  /** Number of snowflakes to render */
  count?: number
  /** Minimum snowflake size in pixels */
  minSize?: number
  /** Maximum snowflake size in pixels */
  maxSize?: number
  /** Minimum fall speed */
  minSpeed?: number
  /** Maximum fall speed */
  maxSpeed?: number
  /** Enable/disable snowfall */
  enabled?: boolean
}

export default function Snowfall({
  count = 150,
  minSize = 4,
  maxSize = 12,
  minSpeed = 0.5,
  maxSpeed = 2,
  enabled = true,
}: SnowfallProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const snowflakesRef = useRef<Snowflake[]>([])
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Initialize snowflakes
  useEffect(() => {
    if (!enabled) return

    const initSnowflakes = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      setDimensions({ width, height })

      snowflakesRef.current = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height - height, // Start above viewport
        size: minSize + Math.random() * (maxSize - minSize),
        speed: minSpeed + Math.random() * (maxSpeed - minSpeed),
        opacity: 0.6 + Math.random() * 0.4, // Higher opacity for visibility
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 2,
        drift: (Math.random() - 0.5) * 0.5, // Horizontal drift
      }))
    }

    initSnowflakes()

    const handleResize = () => {
      initSnowflakes()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [count, minSize, maxSize, minSpeed, maxSpeed, enabled])

  // Animation loop
  useEffect(() => {
    if (!enabled || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      snowflakesRef.current.forEach((flake) => {
        // Update position
        flake.y += flake.speed
        flake.x += flake.drift + Math.sin(flake.y * 0.01) * 0.3 // Gentle swaying
        flake.rotation += flake.rotationSpeed

        // Reset if off screen
        if (flake.y > canvas.height) {
          flake.y = -flake.size
          flake.x = Math.random() * canvas.width
        }
        if (flake.x < -flake.size) {
          flake.x = canvas.width + flake.size
        }
        if (flake.x > canvas.width + flake.size) {
          flake.x = -flake.size
        }

        // Draw snowflake with enhanced visibility
        ctx.save()
        ctx.translate(flake.x, flake.y)
        ctx.rotate((flake.rotation * Math.PI) / 180)

        // Draw shadow for depth and visibility on white background
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
        ctx.shadowBlur = 4
        ctx.shadowOffsetX = 1.5
        ctx.shadowOffsetY = 1.5

        // Draw snowflake with subtle blue-grey tint for better visibility on white
        // Using a slightly darker tone that stands out against white backgrounds
        const baseColor = `rgba(180, 200, 230, ${flake.opacity})` // Light blue-grey
        const outlineColor = `rgba(150, 170, 210, ${flake.opacity * 0.9})` // Slightly darker outline
        
        ctx.fillStyle = baseColor
        ctx.strokeStyle = outlineColor
        ctx.lineWidth = Math.max(0.8, flake.size * 0.08) // Thicker lines for larger flakes

        // Draw a more detailed snowflake shape
        drawSnowflake(ctx, flake.size, flake.opacity)

        ctx.restore()
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <canvas
      ref={canvasRef}
      className="snowfall-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  )
}

function drawSnowflake(
  ctx: CanvasRenderingContext2D,
  size: number,
  opacity: number
) {
  const branches = 6
  const branchLength = size * 0.8
  const angleStep = (Math.PI * 2) / branches

  ctx.beginPath()

  // Draw main branches
  for (let i = 0; i < branches; i++) {
    const angle = i * angleStep
    const x1 = Math.cos(angle) * branchLength
    const y1 = Math.sin(angle) * branchLength
    const x2 = Math.cos(angle) * (branchLength * 0.5)
    const y2 = Math.sin(angle) * (branchLength * 0.5)

    // Main branch
    ctx.moveTo(0, 0)
    ctx.lineTo(x1, y1)

    // Side branches
    const sideAngle1 = angle + Math.PI / 6
    const sideAngle2 = angle - Math.PI / 6
    ctx.moveTo(x2, y2)
    ctx.lineTo(
      x2 + Math.cos(sideAngle1) * (branchLength * 0.3),
      y2 + Math.sin(sideAngle1) * (branchLength * 0.3)
    )
    ctx.moveTo(x2, y2)
    ctx.lineTo(
      x2 + Math.cos(sideAngle2) * (branchLength * 0.3),
      y2 + Math.sin(sideAngle2) * (branchLength * 0.3)
    )
  }

  ctx.stroke()
  ctx.fill()

  // Draw center circle for more visibility
  ctx.beginPath()
  ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2)
  ctx.fill()
}
