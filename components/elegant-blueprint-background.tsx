'use client'

import { MeshGradient, PaperTexture } from '@paper-design/shaders-react'
import { useEffect, useState } from 'react'

export function ElegantBlueprintBackground() {
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
        background: 'linear-gradient(135deg, #051937 0%, #1a2332 50%, #1a1a1a 100%)',
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
        {/* Top Layer: Slow Color Wash */}
        <MeshGradient
          colors={['#051937', '#004d40', '#f5f5f5', '#000000']}
          speed={0.1}
          distortion={0.7}
          swirl={0.6}
          style={{ 
            position: 'absolute', 
            top: 0,
            left: 0,
            width: '100vw', 
            height: '100vh', 
            opacity: 0.9
          }}
          onError={() => setHasError(true)}
        />
      </div>
    )
  } catch (error) {
    console.warn('ElegantBlueprintBackground: Shader error, falling back to CSS gradient:', error)
    return <ErrorFallback />
  }
}