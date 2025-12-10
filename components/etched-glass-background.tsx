'use client'

import { StaticMeshGradient, Waves } from '@paper-design/shaders-react'
import { useEffect, useState, useRef } from 'react'

export function EtchedGlassBackground() {
  const [mounted, setMounted] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [webglSupported, setWebglSupported] = useState(true)
  const [shouldLoadShaders, setShouldLoadShaders] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const initRef = useRef(false)

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    if (prefersReducedMotion) {
      // Skip shader initialization if user prefers reduced motion
      setMounted(true)
      setHasError(true) // Use CSS fallback
      return
    }

    // Defer shader initialization using requestIdleCallback or IntersectionObserver
    const initShaders = () => {
      if (initRef.current) return
      initRef.current = true

      // Check WebGL support
      const checkWebGLSupport = () => {
        try {
          const canvas = document.createElement('canvas')
          const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
          if (!gl) {
            setWebglSupported(false)
            setHasError(true)
            return
          }
          setWebglSupported(true)
        } catch (error) {
          setWebglSupported(false)
          setHasError(true)
        }
      }

      checkWebGLSupport()
      setMounted(true)
      
      // Use IntersectionObserver to only load shaders when visible
      if (containerRef.current) {
        const observer = new IntersectionObserver(
          (entries) => {
            if (entries[0]?.isIntersecting) {
              setShouldLoadShaders(true)
              observer.disconnect()
            }
          },
          { threshold: 0.1 }
        )
        observer.observe(containerRef.current)
      } else {
        // Fallback: load after a short delay if IntersectionObserver isn't available
        setShouldLoadShaders(true)
      }
    }

    // Use requestIdleCallback with fallback
    if ('requestIdleCallback' in window) {
      requestIdleCallback(initShaders, { timeout: 2000 })
    } else {
      // Fallback to setTimeout
      setTimeout(initShaders, 100)
    }
  }, [])

  // Enhanced CSS fallback that mimics the etched glass effect
  const ErrorFallback = () => (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: 'var(--fixed-vh, 100dvh)',
        background: 'linear-gradient(135deg, #eaf0f2 0%, #f0f4f6 50%, #e8edf0 100%)',
        zIndex: -2,
        backfaceVisibility: 'hidden',
        willChange: 'opacity',
      }}
    >
      {/* CSS-only etched lines effect */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: '100vw',
          height: 'var(--fixed-vh, 100dvh)',
          backgroundImage: `
            linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%),
            linear-gradient(0deg, transparent 0%, rgba(255,255,255,0.02) 50%, transparent 100%),
            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.03) 0%, transparent 50%)
          `,
          backgroundSize: '200px 200px, 200px 200px, 400px 400px, 400px 400px',
          backgroundPosition: '0 0, 0 0, 0 0, 0 0',
          animation: 'subtleShift 20s ease-in-out infinite'
        }}
      />
    </div>
  )

  // Always render the container for IntersectionObserver
  const containerStyle = {
    position: 'fixed' as const,
    inset: 0,
    width: '100vw',
    height: 'var(--fixed-vh, 100dvh)',
    backgroundColor: '#e8edf0',
    overflow: 'hidden' as const,
    zIndex: -2,
    pointerEvents: 'none' as const,
    backfaceVisibility: 'hidden' as const,
    willChange: 'opacity' as const
  }

  if (!mounted || hasError || !webglSupported || !shouldLoadShaders) {
    return (
      <div ref={containerRef} style={containerStyle}>
        <ErrorFallback />
      </div>
    )
  }

  try {
    return (
      <div ref={containerRef} style={containerStyle}>
        {/* Base Layer: The frosted glass pane */}
        <StaticMeshGradient
          colors={['#eaf0f2', '#f0f4f6', '#e8edf0']}
          style={{ 
            position: 'absolute', 
            inset: 0,
            width: '100vw', 
            height: 'var(--fixed-vh, 100dvh)'
          }}
          onError={() => {
            setHasError(true)
          }}
        />
        
        {/* Top Layer: The subtle, static etched lines */}
        <Waves
          colors={['#FFFFFF00', '#FFFFFF']}
          scale={18}
          speed={0}
          style={{ 
            position: 'absolute', 
            inset: 0,
            width: '100vw', 
            height: 'var(--fixed-vh, 100dvh)', 
            opacity: 0.05 
          }}
          onError={() => {
            setHasError(true)
          }}
        />
      </div>
    )
  } catch (error) {
    return (
      <div ref={containerRef} style={containerStyle}>
        <ErrorFallback />
      </div>
    )
  }
}
