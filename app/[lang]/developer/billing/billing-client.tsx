"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, CreditCard, Crown, Star, Bell, Rocket, TrendingUp, Check } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { DeveloperSidebar } from "@/components/developer-sidebar"
import { joinWaitlist, getWaitlistStatus } from "@/lib/api"

interface BillingClientProps {
  dict: any
  lang: 'en' | 'bg'
}

function BillingContent({ dict, lang }: BillingClientProps) {
  // Access translations from dict.developer.billing
  const t = dict?.developer?.billing || {}
  
  const [isAnnual, setIsAnnual] = useState(false)
  const [willingPrice, setWillingPrice] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOnWaitlist, setIsOnWaitlist] = useState(false)
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)

  // Check waitlist status on component mount
  useEffect(() => {
    const checkWaitlistStatus = async () => {
      try {
        const status = await getWaitlistStatus()
        setIsOnWaitlist(status.on_waitlist)
      } catch (error) {
        console.error('Error checking waitlist status:', error)
      } finally {
        setIsLoadingStatus(false)
      }
    }

    checkWaitlistStatus()
  }, [])

  const handlePriceSubmission = async () => {
    // Validate price input - must be between 1-5000 BGN
    if (!willingPrice || willingPrice < 1 || willingPrice > 5000) {
      alert(t.validAmount || 'Please enter a valid amount between 1-5000 BGN to join the waitlist.')
      return
    }

    setIsSubmitting(true)
    try {
      await joinWaitlist(willingPrice)
      setIsOnWaitlist(true)
      setWillingPrice(null)
    } catch (error) {
      console.error('Error joining waitlist:', error)
      alert(t.errorJoiningWaitlist || 'There was an error joining the waitlist. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-background via-background to-muted/20 overflow-auto">
      {/* Billing Header */}
      <header className="bg-card/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-30 shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">{t.title || "Billing & Subscription"}</h1>
              <p className="text-muted-foreground text-lg">{t.description || "Manage your subscription and view upcoming pricing plans"}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 space-y-8">

        {/* Top Row - Hero Banner & Price CTA (50/50) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hero Section - Left */}
          <Card className="bg-gradient-to-br from-primary to-primary/80 border-0 text-white">
            <CardContent className="p-6 h-full flex flex-col justify-center">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Rocket className="h-8 w-8" />
                  <h2 className="text-2xl font-bold">{t.platformFree || "Platform is FREE during development period"}</h2>
                </div>
                <p className="text-white/90 text-base">
                  {t.platformFreeDescription || "Use the platform extensively while it's completely free! Build your property portfolio, connect with qualified buyers, and grow your business at no cost."}
                </p>
                <div className="bg-white/10 rounded-lg p-3 inline-block">
                  <p className="text-sm font-medium">{t.joinDevelopers || "🏠 Join developers who are already growing their business"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price Willingness Capture - Right */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 relative overflow-hidden">
            {isOnWaitlist ? (
              // Congratulations Message
              <CardContent className="p-6 h-full flex flex-col justify-center relative">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <Check className="h-8 w-8 text-green-500" />
                    <h3 className="text-xl font-bold text-green-700">{t.congratulations || "🎉 Congratulations! You've guaranteed your spot!"}</h3>
                  </div>
                  
                  <div className="space-y-3 text-left">
                    <p className="text-muted-foreground text-sm">
                      {t.first50Developers || "You're now among the first 50 developers to get:"}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{t.earlyBirdDiscount || "Up to 30% early-bird discount"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{t.prioritySupport || "Priority support when we launch"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{t.personalCall || "Personal call from our team"}</span>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-sm mt-4">
                      {t.contactDirectly || "We'll contact you directly when pricing goes live with your exclusive offer."}
                    </p>
                  </div>
                </div>
              </CardContent>
            ) : (
              // Join Waitlist Form
              <>
                {/* Early Bird Badge */}
                <div className="absolute top-4 right-4">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                    {t.earlyBirdSpecial || "🎁 Early Bird Special"}
                  </div>
                </div>
                
                <CardContent className="p-6 h-full flex flex-col justify-center relative">
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="relative inline-block">
                        <Bell className="h-10 w-10 text-primary mx-auto mb-3 animate-pulse" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{t.getEarlyAccess || "Get Early Access & Save"}</h3>
                      <p className="text-muted-foreground text-sm">
                        {t.waitlistDescription || "Be among the first 50 developers to join our exclusive waitlist for special pricing."}
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          {t.howMuchWilling || "How much would you pay per listing per month?"} <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            placeholder="50"
                            min="1"
                            max="5000"
                            step="5"
                            value={willingPrice || ''}
                            onChange={(e) => setWillingPrice(e.target.value ? Number(e.target.value) : null)}
                            className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                          />
                          <span className="text-muted-foreground font-medium">BGN</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Required to join waitlist. Helps us create fair pricing for everyone.
                        </p>
                      </div>
                      
                      <Button 
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                        onClick={handlePriceSubmission}
                        disabled={isSubmitting || !willingPrice || willingPrice < 1 || willingPrice > 5000}
                        size="lg"
                      >
                        <Bell className="h-5 w-5 mr-2" />
                        {isSubmitting ? (t.joiningWaitlist || 'Joining Waitlist...') : (t.joinWaitlist || 'Join Waitlist & Save')}
                      </Button>
                    </div>
                    
                    <div className="bg-white/60 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-green-700 font-medium">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{t.earlyBirdDiscount || "Up to 30% early-bird discount"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-green-700 font-medium">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Priority feature access</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-green-700 font-medium">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Limited spots available</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>

        {/* Bottom Row - Value Proposition & Pricing Model (50/50) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Value Proposition - Left */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-bold mb-2">Why Our Platform is Different</h2>
                  <p className="text-muted-foreground text-sm">Built specifically for Bulgarian real estate developers</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-1">Qualified Lead Generation</h3>
                      <p className="text-muted-foreground text-xs">Get leads from buyers specifically looking for your properties. No wasted time on unqualified inquiries.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Star className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-1">Exclusive Listings</h3>
                      <p className="text-muted-foreground text-xs">Your listings are exclusively yours. No duplicate listings or stolen content like other platforms.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Crown className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-1">No Brokers Needed</h3>
                      <p className="text-muted-foreground text-xs">Connect directly with buyers. Cut out the middleman and maximize your profits.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Simple Pricing Model - Right */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-bold mb-2">Simple Per-Listing Pricing</h2>
                  <p className="text-muted-foreground text-sm">
                    Pay only for what you use. Rotate your listings as needed - when one sells, activate another.
                  </p>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 text-sm">How It Works</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">1</div>
                      <p className="text-xs">Choose how many active project listings you want</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-primary w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">2</div>
                      <p className="text-xs">Pay monthly for your active project listings</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-primary w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">3</div>
                      <p className="text-xs">Rotate listings as projects sell out</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 text-center">
                  <p className="text-sm font-semibold text-primary mb-1">Pricing will be competitive and transparent</p>
                  <p className="text-xs text-muted-foreground">No hidden fees, no long-term contracts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Highlighted Early Supporter Benefits */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="bg-green-500 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  <Star className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 mb-1">Early Supporter Benefits</h4>
                  <p className="text-green-700 text-sm">
                    Developers who join our waitlist get <strong>up to 30% early-bird discount</strong> and 
                    <strong> priority support</strong> when pricing launches.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 text-sm">When will pricing be available?</h4>
                  <p className="text-muted-foreground text-xs">
                    We're gathering feedback from developers like you to set fair pricing. Launch expected in the coming months.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-sm">How does the per-listing model work?</h4>
                  <p className="text-muted-foreground text-xs">
                    You pay monthly for each active project listing. When a project sells out, you can deactivate it and activate another one.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-sm">What happens to my current listings?</h4>
                  <p className="text-muted-foreground text-xs">
                    All your current listings and data will be preserved for paying users when we transition to paid plans.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 text-sm">Can I change my active listings?</h4>
                  <p className="text-muted-foreground text-xs">
                    Absolutely! You can rotate project listings as needed - deactivate sold-out projects and activate new ones.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-sm">Is there a contract?</h4>
                  <p className="text-muted-foreground text-xs">
                    No long-term contracts. Pay monthly and cancel anytime. We believe in earning your business every month.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-sm">What happens if I don't subscribe?</h4>
                  <p className="text-muted-foreground text-xs">
                    Your listings will be frozen and hidden from public view until you subscribe to keep them active.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function BillingPage({ dict, lang }: BillingClientProps) {
  return (
    <ProtectedRoute requiredRole="developer">
      <DeveloperSidebar dict={dict} lang={lang}>
        <BillingContent dict={dict} lang={lang} />
      </DeveloperSidebar>
    </ProtectedRoute>
  )
}
