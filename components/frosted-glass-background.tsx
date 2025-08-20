'use client'

import { StaticMeshGradient, Dithering } from '@paper-design/shaders-react'
import { useEffect, useState } from 'react'

export function FrostedGlassBackground() {
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
        background: 'linear-gradient(135deg, #d4dde1 0%, #eaf0f2 50%, #f0f4f6 100%)',
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
          backgroundColor: '#eaf0f2', // A very light, cool gray
          overflow: 'hidden',
          zIndex: -2,
        }}
      >
        {/* Base Layer: A completely static, blurred color field */}
        <StaticMeshGradient
          colors={['#d4dde1', '#eaf0f2', '#f0f4f6']}
          style={{ 
            position: 'absolute', 
            top: 0,
            left: 0,
            width: '100vw', 
            height: '100vh' 
          }}
          onError={() => setHasError(true)}
        />
        
        {/* Top Layer: A faint, static "sandblasted" texture */}
        <Dithering
          colors={['#000000', '#ffffff']}
          shape={'random'} // Use 'random' for a fine, non-repeating grain
          density={0.1}
          speed={0} // No movement for a static feel
          style={{ 
            position: 'absolute', 
            top: 0,
            left: 0,
            width: '100vw', 
            height: '100vh', 
            opacity: 0.03 
          }}
          onError={() => setHasError(true)}
        />
      </div>
    )
  } catch (error) {
    console.warn('FrostedGlassBackground: Shader error, falling back to CSS gradient:', error)
    return <ErrorFallback />
  }
}
