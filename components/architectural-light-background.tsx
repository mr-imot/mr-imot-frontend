'use client'

import { DotGrid, GodRays } from '@paper-design/shaders-react'
import { useEffect, useState } from 'react'

export function ArchitecturalLightBackground() {
  const [mounted, setMounted] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Error boundary fallback
  const ErrorFallback = () => (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #1a2a47 0%, #3a4a67 50%, #2a3a57 100%)',
        zIndex: -2,
      }}
    />
  )

  if (!mounted || hasError) {
    return <ErrorFallback />
  }

  try {
    return (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: '#000',
          overflow: 'hidden',
          zIndex: -2,
        }}
      >
        {/* Base Layer: Blueprint Grid */}
        <DotGrid
          colors={['#1a2a47', '#3a4a67']}
          scale={0.1}
          speed={0} // Static grid
          style={{ 
            position: 'absolute', 
            top: 0,
            left: 0,
            width: '100vw', 
            height: '100vh' 
          }}
          onError={() => setHasError(true)}
        />
        
        {/* Top Layer: Soft Light Beams */}
        <GodRays
          colors={['#00000000', '#d4af99', '#ffffff']}
          speed={0.15}
          style={{ 
            position: 'absolute', 
            top: 0,
            left: 0,
            width: '100vw', 
            height: '100vh', 
            opacity: 0.3 
          }}
          onError={() => setHasError(true)}
        />
      </div>
    )
  } catch (error) {
    console.warn('ArchitecturalLightBackground: Shader error, falling back to CSS gradient:', error)
    return <ErrorFallback />
  }
}
