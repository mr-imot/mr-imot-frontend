'use client'

import { StaticMeshGradient, Waves } from '@paper-design/shaders-react'
import { useEffect, useState } from 'react'

export function EtchedGlassBackground() {
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
        background: 'linear-gradient(135deg, #eaf0f2 0%, #f0f4f6 50%, #e8edf0 100%)',
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
          backgroundColor: '#e8edf0', // A cool, professional light gray
          overflow: 'hidden',
          zIndex: -2,
        }}
      >
        {/* Base Layer: The frosted glass pane */}
        <StaticMeshGradient
          colors={['#eaf0f2', '#f0f4f6', '#e8edf0']}
          style={{ 
            position: 'absolute', 
            top: 0,
            left: 0,
            width: '100vw', 
            height: '100vh' 
          }}
          onError={() => setHasError(true)}
        />
        
        {/* Top Layer: The subtle, static etched lines */}
        <Waves
          colors={['#FFFFFF00', '#FFFFFF']} // From transparent to a faint white
          scale={18} // Very high scale creates wide, almost-straight lines
          distortion={0.3} // Adds slight, organic imperfections to the lines
          speed={0} // Completely static
          style={{ 
            position: 'absolute', 
            top: 0,
            left: 0,
            width: '100vw', 
            height: '100vh', 
            opacity: 0.05 
          }}
          onError={() => setHasError(true)}
        />
      </div>
    )
  } catch (error) {
    console.warn('EtchedGlassBackground: Shader error, falling back to CSS gradient:', error)
    return <ErrorFallback />
  }
}
