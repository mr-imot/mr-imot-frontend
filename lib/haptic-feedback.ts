// Haptic feedback utility for mobile devices
export class HapticFeedback {
  private static instance: HapticFeedback
  private isSupported: boolean = false

  private constructor() {
    this.isSupported = this.checkSupport()
  }

  static getInstance(): HapticFeedback {
    if (!HapticFeedback.instance) {
      HapticFeedback.instance = new HapticFeedback()
    }
    return HapticFeedback.instance
  }

  private checkSupport(): boolean {
    // Check for various haptic feedback APIs
    return (
      'vibrate' in navigator ||
      'haptic' in navigator ||
      'vibrate' in window ||
      'HapticFeedback' in window
    )
  }

  // Light haptic feedback for subtle interactions
  light(): void {
    if (!this.isSupported) return
    
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(10)
      } else if ('vibrate' in window) {
        (window as any).vibrate(10)
      }
    } catch (error) {
      // Silently fail if haptics not supported
    }
  }

  // Medium haptic feedback for confirmations
  medium(): void {
    if (!this.isSupported) return
    
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(20)
      } else if ('vibrate' in window) {
        (window as any).vibrate(20)
      }
    } catch (error) {
      // Silently fail if haptics not supported
    }
  }

  // Heavy haptic feedback for errors or important actions
  heavy(): void {
    if (!this.isSupported) return
    
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate([30, 10, 30])
      } else if ('vibrate' in window) {
        (window as any).vibrate([30, 10, 30])
      }
    } catch (error) {
      // Silently fail if haptics not supported
    }
  }

  // Success pattern
  success(): void {
    if (!this.isSupported) return
    
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate([20, 50, 20])
      } else if ('vibrate' in window) {
        (window as any).vibrate([20, 50, 20])
      }
    } catch (error) {
      // Silently fail if haptics not supported
    }
  }

  // Error pattern
  error(): void {
    if (!this.isSupported) return
    
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100])
      } else if ('vibrate' in window) {
        (window as any).vibrate([100, 50, 100])
      }
    } catch (error) {
      // Silently fail if haptics not supported
    }
  }

  // Custom pattern
  custom(pattern: number | number[]): void {
    if (!this.isSupported) return
    
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern)
      } else if ('vibrate' in window) {
        (window as any).vibrate(pattern)
      }
    } catch (error) {
      // Silently fail if haptics not supported
    }
  }
}

// Convenience functions
export const haptic = {
  light: () => HapticFeedback.getInstance().light(),
  medium: () => HapticFeedback.getInstance().medium(),
  heavy: () => HapticFeedback.getInstance().heavy(),
  success: () => HapticFeedback.getInstance().success(),
  error: () => HapticFeedback.getInstance().error(),
  custom: (pattern: number | number[]) => HapticFeedback.getInstance().custom(pattern)
}

