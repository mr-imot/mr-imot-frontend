'use client'

import { MeshGradient, PaperTexture } from '@paper-design/shaders-react'

export function ElegantBlueprintBackground() {
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        overflow: 'hidden',
        zIndex: -2, // Pushed to the very back, behind gradient overlay
      }}
    >
      {/* Base Layer: Subtle Texture */}
      <PaperTexture
        colors={['#0a0a0a', '#1a1a1a']}
        speed={0} // Texture is static
        style={{ 
          position: 'absolute', 
          width: '100%', 
          height: '100%', 
          opacity: 0.8 
        }}
      />
      
      {/* Top Layer: Slow Color Wash */}
      <MeshGradient
        colors={['#051937', '#004d40', '#f5f5f5', '#000000']}
        speed={0.1} // Very slow speed
        distortion={0.7}
        swirl={0.6}
        style={{ 
          position: 'absolute', 
          width: '100%', 
          height: '100%', 
          opacity: 0.7 
        }}
      />
    </div>
  )
}