'use client'

import { GrainGradient, Waves } from '@paper-design/shaders-react'
import { useEffect, useState } from 'react'

export function PolishedConcreteBackground() {
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
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #2f3c4c 100%)',
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
          backgroundColor: '#333',
          overflow: 'hidden',
          zIndex: -2,
        }}
      >
        {/* Base Layer: A fine-grained, static texture */}
        <GrainGradient
          colors={['#2c3e50', '#34495e']}
          speed={0} // Static base for maximum subtlety
          style={{ 
            position: 'absolute', 
            top: 0,
            left: 0,
            width: '100vw', 
            height: '100vh' 
          }}
          onError={() => setHasError(true)}
        />
        
        {/* Top Layer: A very slow, faint light reflection */}
        <Waves
          colors={['#00000000', '#ffffff']}
          scale={12} // A high scale creates wide, linear "sheens" instead of waves
          speed={0.05} // Extremely slow movement
          style={{ 
            position: 'absolute', 
            top: 0,
            left: 0,
            width: '100vw', 
            height: '100vh', 
            opacity: 0.04 
          }}
          onError={() => setHasError(true)}
        />
      </div>
    )
  } catch (error) {
    console.warn('PolishedConcreteBackground: Shader error, falling back to CSS gradient:', error)
    return <ErrorFallback />
  }
}
