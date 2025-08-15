"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"

const ISSUE_TYPES = [
  "Bug Report",
  "Feature Request", 
  "General Feedback",
  "Performance Issue",
  "UI/UX Suggestion",
  "Other"
]

export function FeedbackButton() {
  const { user, isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [issueType, setIssueType] = useState("")
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  // Set email automatically if user is logged in
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      setEmail(user.email)
    }
  }, [isAuthenticated, user])

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
        // Don't reset email if user is logged in
        if (!isAuthenticated) {
          setEmail("")
        }
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
      {/* Fixed Feedback Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gray-800 hover:bg-gray-700 text-white rounded-full px-4 py-3 shadow-lg flex items-center gap-2"
        size="lg"
      >
        <Heart className="w-5 h-5" />
        <span>Feedback</span>
      </Button>

      {/* Feedback Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-left">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Martin, founder of Mr imot</p>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Greeting Message */}
            <div className="text-left">
              <p className="text-gray-700 leading-relaxed">
                Hey there - Mr imot is still in beta and we are working everyday to improve your experience! 
                I would LOVE your feedback. What you type in this box will go directly to my inbox :)
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
                <Label htmlFor="issue-type">Issue Type</Label>
                <Select value={issueType} onValueChange={setIssueType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ISSUE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isAuthenticated}
                  className={isAuthenticated ? "bg-gray-50" : ""}
                  required
                />
                {isAuthenticated && (
                  <p className="text-xs text-gray-500">
                    Using your developer account email: {user?.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Please describe your feedback or issue in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[120px] resize-none"
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
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!issueType || !message.trim() || !email.trim() || isSubmitting}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isSubmitting ? "Sending..." : "Send Feedback"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
