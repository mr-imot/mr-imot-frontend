'use client'

import { PerlinNoise, Voronoi } from '@paper-design/shaders-react'
import { useEffect, useState } from 'react'

export function LiquidMarbleBackground() {
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
        background: 'linear-gradient(135deg, #E5E5E5 0%, #F0F0F0 50%, #FFFFFF 100%)',
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
          backgroundColor: '#f0f0f0', // Fallback for a clean, bright look
          overflow: 'hidden',
          zIndex: -2,
        }}
      >
        {/* Base Layer: The subtle, cloudy body of the marble */}
        <PerlinNoise
          colors={['#E5E5E5', '#F0F0F0', '#FFFFFF']}
          scale={5}
          speed={0.08} // Barely perceptible drift
          style={{ 
            position: 'absolute', 
            top: 0,
            left: 0,
            width: '100vw', 
            height: '100vh' 
          }}
          onError={() => setHasError(true)}
        />
        
        {/* Top Layer: The sharp, flowing veins */}
        <Voronoi
          colors={['#FFFFFF00']} // Makes the cells themselves transparent
          borderColor={'#222222'} // Dark charcoal veins for a sophisticated look
          borderWidth={0.008} // Thin, sharp veins
          scale={10} // High scale for large, sprawling patterns
          speed={0.1} // Very slow liquid-like morphing
          style={{ 
            position: 'absolute', 
            top: 0,
            left: 0,
            width: '100vw', 
            height: '100vh', 
            opacity: 0.6 
          }}
          onError={() => setHasError(true)}
        />
      </div>
    )
  } catch (error) {
    console.warn('LiquidMarbleBackground: Shader error, falling back to CSS gradient:', error)
    return <ErrorFallback />
  }
}
