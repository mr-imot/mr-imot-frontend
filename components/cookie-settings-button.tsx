"use client"

interface CookieSettingsButtonProps {
  label: string
}

export function CookieSettingsButton({ label }: CookieSettingsButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('mi-open-cookie-settings'))
      }}
      className="text-muted-foreground hover:text-foreground transition-colors duration-200"
    >
      {label}
    </button>
  )
}
