import { useState, useEffect, useCallback } from 'react'

interface PWAInstallPrompt {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PWAManager {
  isInstallable: boolean
  isInstalled: boolean
  isOnline: boolean
  isStandalone: boolean
  installPrompt: PWAInstallPrompt | null
  install: () => Promise<void>
  checkForUpdate: () => Promise<void>
}

export function usePWA(): PWAManager {
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  // Check if app is installable
  const isInstallable = Boolean(installPrompt)

  // Check if app is running in standalone mode (installed)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true

  // Handle beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as any)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  // Handle app installed event
  useEffect(() => {
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Set initial status
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Install the PWA
  const install = useCallback(async () => {
    if (!installPrompt) {
      throw new Error('Install prompt not available')
    }

    try {
      await installPrompt.prompt()
      const choice = await installPrompt.userChoice
      
      if (choice.outcome === 'accepted') {
        setIsInstalled(true)
        setInstallPrompt(null)
      }
    } catch (error) {
      console.error('Failed to install PWA:', error)
      throw error
    }
  }, [installPrompt])

  // Check for service worker updates
  const checkForUpdate = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        
        if (registration) {
          await registration.update()
          
          // Listen for new service worker
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available
                  if (confirm('A new version is available! Reload to update?')) {
                    window.location.reload()
                  }
                }
              })
            }
          })
        }
      } catch (error) {
        console.error('Failed to check for updates:', error)
      }
    }
  }, [])

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration)
          
          // Check for updates on page load
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available
                  console.log('New version available')
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })
    }
  }, [])

  return {
    isInstallable,
    isInstalled,
    isOnline,
    isStandalone,
    installPrompt,
    install,
    checkForUpdate
  }
}

// Hook for PWA install button
export function usePWAInstallButton() {
  const pwa = usePWA()
  const [showInstallButton, setShowInstallButton] = useState(false)

  useEffect(() => {
    // Show install button if app is installable and not already installed
    setShowInstallButton(pwa.isInstallable && !pwa.isInstalled && !pwa.isStandalone)
  }, [pwa.isInstallable, pwa.isInstalled, pwa.isStandalone])

  const handleInstall = async () => {
    try {
      await pwa.install()
      setShowInstallButton(false)
    } catch (error) {
      console.error('Installation failed:', error)
    }
  }

  return {
    showInstallButton,
    handleInstall,
    isInstalling: false // You could add loading state here
  }
}
