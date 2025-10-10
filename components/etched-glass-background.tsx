'use client'

import { StaticMeshGradient, Waves } from '@paper-design/shaders-react'
import { useEffect, useState } from 'react'

export function EtchedGlassBackground() {
  const [mounted, setMounted] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [webglSupported, setWebglSupported] = useState(true)
  const [fixedHeight, setFixedHeight] = useState<number | null>(null)

  useEffect(() => {
    setMounted(true)
    
    // On mobile, capture initial viewport height and lock it
    const isMobile = window.innerWidth <= 768
    if (isMobile) {
      const initialHeight = window.innerHeight
      setFixedHeight(initialHeight)
    }
    
    // Check WebGL support
    const checkWebGLSupport = () => {
      try {
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
        if (!gl) {
          console.warn('WebGL not supported, using CSS fallback')
          setWebglSupported(false)
          setHasError(true)
        }
      } catch (error) {
        console.warn('WebGL check failed, using CSS fallback:', error)
        setWebglSupported(false)
        setHasError(true)
      }
    }
    
    checkWebGLSupport()
  }, [])

  // Enhanced CSS fallback that mimics the etched glass effect
  const ErrorFallback = () => (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: fixedHeight ? `${fixedHeight}px` : '100dvh',
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
          height: fixedHeight ? `${fixedHeight}px` : '100dvh',
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

  if (!mounted || hasError || !webglSupported) {
    return <ErrorFallback />
  }

  try {
    return (
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: fixedHeight ? `${fixedHeight}px` : '100dvh',
          backgroundColor: '#e8edf0', // A cool, professional light gray
          overflow: 'hidden',
          zIndex: -2,
          pointerEvents: 'none',
          backfaceVisibility: 'hidden',
          willChange: 'opacity'
        }}
      >
        {/* Base Layer: The frosted glass pane */}
        <StaticMeshGradient
          colors={['#eaf0f2', '#f0f4f6', '#e8edf0']}
          style={{ 
            position: 'absolute', 
            inset: 0,
            width: '100vw', 
            height: fixedHeight ? `${fixedHeight}px` : '100dvh'
          }}
          onError={() => {
            console.warn('StaticMeshGradient error, falling back to CSS')
            setHasError(true)
          }}
        />
        
        {/* Top Layer: The subtle, static etched lines */}
        <Waves
          colors={['#FFFFFF00', '#FFFFFF']} // From transparent to a faint white
          scale={18} // Very high scale creates wide, almost-straight lines
          speed={0} // Completely static
          style={{ 
            position: 'absolute', 
            inset: 0,
            width: '100vw', 
            height: fixedHeight ? `${fixedHeight}px` : '100dvh', 
            opacity: 0.05 
          }}
          onError={() => {
            console.warn('Waves shader error, falling back to CSS')
            setHasError(true)
          }}
        />
      </div>
    )
  } catch (error) {
    console.warn('EtchedGlassBackground: Shader error, falling back to CSS gradient:', error)
    return <ErrorFallback />
  }
}
