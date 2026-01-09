"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

interface FeedbackTranslations {
  button: string
  title: string
  introMessage: string
  selectPlaceholder: string
  issueTypes: {
    bugReport: string
    featureRequest: string
    generalFeedback: string
    performanceIssue: string
    uiUxSuggestion: string
    other: string
  }
  labels: {
    issueType: string
    email: string
    message: string
  }
  placeholders: {
    email: string
    message: string
  }
  buttons: {
    close: string
    send: string
    sending: string
  }
}

interface FeedbackButtonProps {
  translations: FeedbackTranslations
}

export function FeedbackButton({ translations }: FeedbackButtonProps) {
  const pathname = usePathname()
  const t = translations
  const [isOpen, setIsOpen] = useState(false)
  const [issueType, setIssueType] = useState("")
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [isVisible, setIsVisible] = useState(true)
  const heroRef = useRef<HTMLDivElement>(null)

  const ISSUE_TYPES = [
    { value: "bugReport", label: t.issueTypes.bugReport },
    { value: "featureRequest", label: t.issueTypes.featureRequest },
    { value: "generalFeedback", label: t.issueTypes.generalFeedback },
    { value: "performanceIssue", label: t.issueTypes.performanceIssue },
    { value: "uiUxSuggestion", label: t.issueTypes.uiUxSuggestion },
    { value: "other", label: t.issueTypes.other }
  ]

  // Smart feedback button visibility based on page and scroll position
  useEffect(() => {
    // Other pages: Always visible immediately
    if (pathname !== '/' && pathname !== '/listings') {
      setIsVisible(true)
      return
    }

    // Homepage: Hide initially, show after hero section
    if (pathname === '/') {
      setIsVisible(false)
      
      const heroElement = document.querySelector('section[class*="py-16"]') as HTMLElement
      if (!heroElement) {
        // Fallback: show button after delay
        const timer = setTimeout(() => setIsVisible(true), 1000)
        return () => clearTimeout(timer)
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Show button when hero section is not intersecting (scrolled past)
            setIsVisible(!entry.isIntersecting)
          })
        },
        {
          threshold: 0.1,
          rootMargin: '-50px 0px 0px 0px'
        }
      )

      observer.observe(heroElement)
      return () => observer.disconnect()
    }

    // Listings page: Hide initially, show when footer comes into view
    if (pathname === '/listings') {
      setIsVisible(false)
      
      const footerElement = document.querySelector('footer') as HTMLElement
      if (!footerElement) {
        // Fallback: show button after delay
        const timer = setTimeout(() => setIsVisible(true), 1000)
        return () => clearTimeout(timer)
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Show button when footer comes into view, hide when footer goes out of view
            setIsVisible(entry.isIntersecting)
          })
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
        }
      )

      observer.observe(footerElement)
      return () => observer.disconnect()
    }
  }, [pathname])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!issueType || !message.trim() || !email.trim()) return

    setIsSubmitting(true)
    setSubmitStatus("idle")
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          issueType,
          message: message.trim(),
          email: email.trim()
        }),
      })

      if (response.ok) {
        setSubmitStatus("success")
        setIssueType("")
        setMessage("")
        setEmail("")
        // Close modal after 2 seconds
        setTimeout(() => {
          setIsOpen(false)
          setSubmitStatus("idle")
        }, 2000)
      } else {
        setSubmitStatus("error")
      }
    } catch (error) {
      console.error('Error sending feedback:', error)
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Fixed Feedback Button with conditional visibility */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`hidden lg:flex fixed bottom-6 right-6 z-50 bg-gray-800 hover:bg-gray-700 text-white rounded-full px-4 py-3 shadow-lg items-center gap-2 transition-all duration-500 ease-in-out ${
          isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        size="lg"
      >
        <Heart className="w-5 h-5" />
        <span>{t.button}</span>
      </Button>

      {/* Feedback Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[31.25rem] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-left">
              {t.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Greeting Message */}
            <div className="text-left">
              <p className="text-gray-700 leading-relaxed">
                {t.introMessage}
              </p>
            </div>

            {/* Success/Error Messages */}
            {submitStatus === "success" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">Thank you! Your feedback has been sent to my inbox.</p>
              </div>
            )}
            
            {submitStatus === "error" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">Oops! Something went wrong. Please try again.</p>
              </div>
            )}

            {/* Feedback Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="issue-type">{t.labels.issueType}</Label>
                <Select value={issueType} onValueChange={setIssueType}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {ISSUE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t.labels.email}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t.placeholders.email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">{t.labels.message}</Label>
                <Textarea
                  id="message"
                  placeholder={t.placeholders.message}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[7.5rem] resize-none"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-600 hover:text-gray-800"
                  disabled={isSubmitting}
                >
                  {t.buttons.close}
                </Button>
                <Button
                  type="submit"
                  disabled={!issueType || !message.trim() || !email.trim() || isSubmitting}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isSubmitting ? t.buttons.sending : t.buttons.send}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
