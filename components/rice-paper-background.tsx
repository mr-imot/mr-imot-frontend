'use client'

import { StaticRadialGradient, StaticMeshGradient } from '@paper-design/shaders-react'
import { useEffect, useState } from 'react'

export function RicePaperBackground() {
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
        background: 'radial-gradient(circle, #F5F5DC 0%, #FAF9F6 70%)',
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
          backgroundColor: '#FAF9F6', // A warm, creamy off-white
          overflow: 'hidden',
          zIndex: -2,
        }}
      >
        {/* Base Layer: A soft, diffused light source behind the "paper" */}
        <StaticRadialGradient
          colors={['#F5F5DC', '#FAF9F6']} // From a soft beige to creamy white
          scale={0.8} // A large, soft glow
          style={{ 
            position: 'absolute', 
            top: 0,
            left: 0,
            width: '100vw', 
            height: '100vh' 
          }}
          onError={() => setHasError(true)}
        />
        
        {/* Top Layer: The fibrous paper texture itself */}
        <StaticMeshGradient
          colors={['#FFFFFF00', '#FFFFFF09']} // Mostly transparent with a hint of white texture
          distortion={0.2}
          swirl={0}
          style={{ 
            position: 'absolute', 
            top: 0,
            left: 0,
            width: '100vw', 
            height: '100vh', 
            opacity: 0.5 
          }}
          onError={() => setHasError(true)}
        />
      </div>
    )
  } catch (error) {
    console.warn('RicePaperBackground: Shader error, falling back to CSS gradient:', error)
    return <ErrorFallback />
  }
}
