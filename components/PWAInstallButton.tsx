import { useState } from 'react'
import { Download, Check, X } from 'lucide-react'
import { usePWAInstallButton } from '@/hooks/use-pwa'
import { Button } from '@/components/ui/button'
import { haptic } from '@/lib/haptic-feedback'

interface PWAInstallButtonProps {
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  showText?: boolean
}

export function PWAInstallButton({
  className = '',
  variant = 'default',
  size = 'md',
  showIcon = true,
  showText = true
}: PWAInstallButtonProps) {
  const { showInstallButton, handleInstall, isInstalling } = usePWAInstallButton()
  const [isInstalled, setIsInstalled] = useState(false)

  if (!showInstallButton) {
    return null
  }

  const handleClick = async () => {
    try {
      haptic.light()
      await handleInstall()
      setIsInstalled(true)
      haptic.success()
      
      // Hide the button after a delay
      setTimeout(() => setIsInstalled(false), 3000)
    } catch (error) {
      haptic.error()
      console.error('Installation failed:', error)
    }
  }

  if (isInstalled) {
    return (
      <Button
        variant="outline"
        size={size}
        className={`bg-green-50 border-green-200 text-green-700 hover:bg-green-100 ${className}`}
        disabled
      >
        {showIcon && <Check className="w-4 h-4 mr-2" />}
        {showText && 'Installed!'}
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isInstalling}
      className={`${className}`}
    >
      {showIcon && <Download className="w-4 h-4 mr-2" />}
      {showText && (isInstalling ? 'Installing...' : 'Install App')}
    </Button>
  )
}

// Floating PWA install button for mobile
export function FloatingPWAInstallButton() {
  const { showInstallButton, handleInstall, isInstalling } = usePWAInstallButton()
  const [isVisible, setIsVisible] = useState(true)
  const [isInstalled, setIsInstalled] = useState(false)

  if (!showInstallButton || !isVisible) {
    return null
  }

  const handleClick = async () => {
    try {
      haptic.medium()
      await handleInstall()
      setIsInstalled(true)
      haptic.success()
      
      // Hide after installation
      setTimeout(() => {
        setIsVisible(false)
        setIsInstalled(false)
      }, 3000)
    } catch (error) {
      haptic.error()
      console.error('Installation failed:', error)
    }
  }

  const handleDismiss = () => {
    haptic.light()
    setIsVisible(false)
  }

  if (isInstalled) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-green-500 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2">
          <Check className="w-5 h-5" />
          <span className="text-sm font-medium">App Installed!</span>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white border border-gray-200 rounded-full shadow-lg p-2 flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClick}
          disabled={isInstalling}
          className="h-8 px-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          {isInstalling ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span className="ml-2">{isInstalling ? 'Installing...' : 'Install'}</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

