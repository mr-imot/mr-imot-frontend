'use client'

import { MeshGradient, PaperTexture } from '@paper-design/shaders-react'
import { useEffect, useState } from 'react'

export function StatusBarBackground() {
  const [mounted, setMounted] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Error boundary fallback - use CSS gradient that matches your theme
  const ErrorFallback = () => (
    <div 
      className="status-bar-background-fallback"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'env(safe-area-inset-top, 0px)',
        background: 'linear-gradient(135deg, #051937 0%, #1a2332 50%, #1a1a1a 100%)',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  )

  if (!mounted || hasError) {
    return <ErrorFallback />
  }

  try {
    return (
      <div 
        className="status-bar-background"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 'env(safe-area-inset-top, 0px)',
          zIndex: -1,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        {/* Base Layer: Subtle Texture */}
        <PaperTexture
          colors={['#0a0a0a', '#1a1a1a']}
          speed={0}
          style={{ 
            position: 'absolute', 
            width: '100%', 
            height: '100%', 
            opacity: 0.8 
          }}
        />
        
        {/* Top Layer: Color Wash that matches your main background */}
        <MeshGradient
          colors={['#051937', '#004d40', '#f5f5f5', '#000000']}
          speed={0.1}
          distortion={0.7}
          swirl={0.6}
          style={{ 
            position: 'absolute', 
            width: '100%', 
            height: '100%', 
            opacity: 0.7 
          }}
          onError={() => setHasError(true)}
        />
      </div>
    )
  } catch (error) {
    console.warn('StatusBarBackground: Shader error, falling back to CSS gradient:', error)
    return <ErrorFallback />
  }
}
