'use client'

import { Water, GrainGradient } from '@paper-design/shaders-react'
import { useEffect, useState } from 'react'

export function NaturalEleganceBackground() {
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
        background: 'linear-gradient(135deg, #2d3436 0%, #636e72 50%, #4a5359 100%)',
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
        {/* Base Layer: Subtle Grain Texture */}
        <GrainGradient
          colors={['#2d3436', '#636e72']}
          speed={0.1}
          style={{ 
            position: 'absolute', 
            top: 0,
            left: 0,
            width: '100vw', 
            height: '100vh' 
          }}
          onError={() => setHasError(true)}
        />
        
        {/* Top Layer: Gentle Water Caustics */}
        <Water
          colors={['#00000000', '#ffffff']}
          scale={4}
          speed={0.1}
          style={{ 
            position: 'absolute', 
            top: 0,
            left: 0,
            width: '100vw', 
            height: '100vh', 
            opacity: 0.15 
          }}
          onError={() => setHasError(true)}
        />
      </div>
    )
  } catch (error) {
    console.warn('NaturalEleganceBackground: Shader error, falling back to CSS gradient:', error)
    return <ErrorFallback />
  }
}
