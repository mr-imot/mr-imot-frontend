import { haptic } from './haptic-feedback'

interface MapGestureOptions {
  map: google.maps.Map
  enablePinchToZoom?: boolean
  enableRotation?: boolean
  enableDoubleTapZoom?: boolean
  enableLongPress?: boolean
  hapticFeedback?: boolean
}

export class AdvancedMapGestures {
  private map: google.maps.Map
  private options: Required<MapGestureOptions>
  private isEnabled: boolean = false
  private touchStartDistance: number = 0
  private touchStartAngle: number = 0
  private initialZoom: number = 0
  private initialRotation: number = 0
  private longPressTimer: NodeJS.Timeout | null = null
  private longPressThreshold: number = 500

  constructor(options: MapGestureOptions) {
    this.map = options.map
    this.options = {
      enablePinchToZoom: options.enablePinchToZoom ?? true,
      enableRotation: options.enableRotation ?? true,
      enableDoubleTapZoom: options.enableDoubleTapZoom ?? true,
      enableLongPress: options.enableLongPress ?? true,
      hapticFeedback: options.hapticFeedback ?? true
    }
  }

  enable(): void {
    if (this.isEnabled) return
    this.isEnabled = true
    this.attachEventListeners()
  }

  disable(): void {
    if (!this.isEnabled) return
    this.isEnabled = false
    this.detachEventListeners()
  }

  private attachEventListeners(): void {
    const mapElement = this.map.getDiv()
    
    // Touch events for multi-touch gestures
    mapElement.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false })
    mapElement.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false })
    mapElement.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false })
    
    // Mouse events for desktop
    mapElement.addEventListener('mousedown', this.handleMouseDown.bind(this))
    mapElement.addEventListener('wheel', this.handleWheel.bind(this), { passive: false })
  }

  private detachEventListeners(): void {
    const mapElement = this.map.getDiv()
    
    mapElement.removeEventListener('touchstart', this.handleTouchStart.bind(this))
    mapElement.removeEventListener('touchmove', this.handleTouchMove.bind(this))
    mapElement.removeEventListener('touchend', this.handleTouchEnd.bind(this))
    
    mapElement.removeEventListener('mousedown', this.handleMouseDown.bind(this))
    mapElement.removeEventListener('wheel', this.handleWheel.bind(this))
  }

  private handleTouchStart(event: TouchEvent): void {
    if (!this.isEnabled) return
    
    const touches = event.touches
    
    if (touches.length === 1) {
      // Single touch - handle long press
      this.handleSingleTouchStart(event)
    } else if (touches.length === 2) {
      // Two touches - handle pinch and rotation
      event.preventDefault()
      this.handleMultiTouchStart(event)
    }
  }

  private handleSingleTouchStart(event: TouchEvent): void {
    if (!this.options.enableLongPress) return
    
    const touch = event.touches[0]
    
    this.longPressTimer = setTimeout(() => {
      this.handleLongPress(touch)
    }, this.longPressThreshold)
  }

  private handleMultiTouchStart(event: TouchEvent): void {
    const touches = event.touches
    
    if (touches.length !== 2) return
    
    const touch1 = touches[0]
    const touch2 = touches[1]
    
    // Calculate initial distance and angle
    this.touchStartDistance = this.getDistance(touch1, touch2)
    this.touchStartAngle = this.getAngle(touch1, touch2)
    this.initialZoom = this.map.getZoom() || 0
    this.initialRotation = this.map.getHeading() || 0
    
    if (this.options.hapticFeedback) {
      haptic.light()
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    if (!this.isEnabled) return
    
    const touches = event.touches
    
    if (touches.length === 2) {
      event.preventDefault()
      this.handleMultiTouchMove(event)
    }
  }

  private handleMultiTouchMove(event: TouchEvent): void {
    const touches = event.touches
    
    if (touches.length !== 2) return
    
    const touch1 = touches[0]
    const touch2 = touches[1]
    
    const currentDistance = this.getDistance(touch1, touch2)
    const currentAngle = this.getAngle(touch1, touch2)
    
    // Handle pinch to zoom
    if (this.options.enablePinchToZoom) {
      const scale = currentDistance / this.touchStartDistance
      const newZoom = this.initialZoom + Math.log2(scale)
      this.map.setZoom(Math.max(0, Math.min(20, newZoom)))
    }
    
    // Handle rotation
    if (this.options.enableRotation) {
      const rotationDelta = currentAngle - this.touchStartAngle
      const newRotation = this.initialRotation + rotationDelta
      this.map.setHeading(newRotation)
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    if (!this.isEnabled) return
    
    // Clear long press timer
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer)
      this.longPressTimer = null
    }
    
    // Reset gesture state
    this.touchStartDistance = 0
    this.touchStartAngle = 0
    this.initialZoom = 0
    this.initialRotation = 0
  }

  private handleMouseDown(event: MouseEvent): void {
    if (!this.isEnabled || event.button !== 0) return // Only left click
    
    // Handle double click zoom
    if (this.options.enableDoubleTapZoom) {
      this.handleDoubleClick(event)
    }
  }

  private handleDoubleClick(event: MouseEvent): void {
    // This will be handled by Google Maps' built-in double-click zoom
    // We just need to ensure it's enabled
  }

  private handleWheel(event: WheelEvent): void {
    if (!this.isEnabled) return
    
    // Prevent default scroll behavior
    event.preventDefault()
    
    // Custom zoom behavior with haptic feedback
    const delta = event.deltaY > 0 ? -1 : 1
    const currentZoom = this.map.getZoom() || 0
    const newZoom = Math.max(0, Math.min(20, currentZoom + delta * 0.5))
    
    this.map.setZoom(newZoom)
    
    if (this.options.hapticFeedback) {
      haptic.light()
    }
  }

  private handleLongPress(touch: Touch): void {
    if (!this.options.enableLongPress) return
    
    // Trigger long press action (e.g., show context menu)
    this.onLongPress(touch.clientX, touch.clientY)
    
    if (this.options.hapticFeedback) {
      haptic.medium()
    }
  }

  private onLongPress(x: number, y: number): void {
    // Convert screen coordinates to map coordinates
    const projection = this.map.getProjection()
    if (!projection) return
    
    const point = new google.maps.Point(x, y)
    const latLng = projection.fromPointToLatLng(point)
    
    if (latLng) {
      // Emit custom event for long press
      const customEvent = new CustomEvent('mapLongPress', {
        detail: { latLng, screenX: x, screenY: y }
      })
      this.map.getDiv().dispatchEvent(customEvent)
    }
  }

  private getDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  private getAngle(touch1: Touch, touch2: Touch): number {
    return Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX) * 180 / Math.PI
  }

  // Public methods for external control
  setPinchToZoom(enabled: boolean): void {
    this.options.enablePinchToZoom = enabled
  }

  setRotation(enabled: boolean): void {
    this.options.enableRotation = enabled
  }

  setDoubleTapZoom(enabled: boolean): void {
    this.options.enableDoubleTapZoom = enabled
  }

  setLongPress(enabled: boolean): void {
    this.options.enableLongPress = enabled
  }

  setHapticFeedback(enabled: boolean): void {
    this.options.hapticFeedback = enabled
  }
}
