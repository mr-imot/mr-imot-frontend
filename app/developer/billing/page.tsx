"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, CreditCard, Zap, Crown, Star, Bell, Rocket } from "lucide-react"

export default function BillingPage() {
  const [isAnnual, setIsAnnual] = useState(false)

  return (
    <div className="space-y-8">
      {/* Development Period Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <Rocket className="h-6 w-6" />
          <h2 className="text-xl font-bold">Platform is FREE during development period</h2>
        </div>
        <p className="text-blue-100 mb-4">
          Use the platform extensively while it's completely free! Pricing plans are coming soon with premium features.
        </p>
        <div className="flex items-center gap-2 text-sm">
          <Bell className="h-4 w-4" />
          <span>Early users will get special discounts when pricing launches</span>
        </div>
      </div>

      {/* Pricing Plans Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Pricing Plans Coming Soon</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Get ready for premium features and enhanced capabilities. 
          Pricing plans will launch soon with special early-bird discounts.
        </p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <span className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isAnnual ? 'bg-primary' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isAnnual ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
            Annual
          </span>
          {isAnnual && (
            <Badge variant="secondary" className="ml-2">
              Save 20%
            </Badge>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Basic Plan */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 opacity-50"></div>
          <CardHeader className="relative">
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-green-600 font-bold text-lg">BASIC</CardTitle>
              <Badge className="bg-green-100 text-green-700 border-green-200">FOR INDIVIDUALS</Badge>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground blur-sm">
                {isAnnual ? '$24' : '$29'}/mo
              </div>
              <div className="text-sm text-muted-foreground blur-sm">
                {isAnnual ? 'Billed annually ($288/year)' : 'Billed monthly'}
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="blur-sm">Up to 5 property listings</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="blur-sm">Basic analytics dashboard</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="blur-sm">Email support</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="blur-sm">Standard property photos</span>
              </div>
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700" disabled>
              <CreditCard className="h-4 w-4 mr-2" />
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        {/* Professional Plan - Most Popular */}
        <Card className="relative overflow-hidden border-2 border-blue-500 shadow-lg scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 opacity-50"></div>
          <div className="absolute top-4 right-4">
            <Badge className="bg-blue-500 text-white">MOST POPULAR</Badge>
          </div>
          <CardHeader className="relative">
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-blue-600 font-bold text-lg">PROFESSIONAL</CardTitle>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">FOR AGENCIES</Badge>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground blur-sm">
                {isAnnual ? '$79' : '$99'}/mo
              </div>
              <div className="text-sm text-muted-foreground blur-sm">
                {isAnnual ? 'Billed annually ($948/year)' : 'Billed monthly'}
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                <span className="blur-sm">Unlimited property listings</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                <span className="blur-sm">Advanced analytics & insights</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                <span className="blur-sm">Priority support</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                <span className="blur-sm">High-quality photo uploads</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                <span className="blur-sm">Custom branding options</span>
              </div>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled>
              <Star className="h-4 w-4 mr-2" />
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        {/* Enterprise Plan */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100 opacity-50"></div>
          <CardHeader className="relative">
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-purple-600 font-bold text-lg">ENTERPRISE</CardTitle>
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">FOR POWER SELLERS</Badge>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground blur-sm">
                {isAnnual ? '$119' : '$149'}/mo
              </div>
              <div className="text-sm text-muted-foreground blur-sm">
                {isAnnual ? 'Billed annually ($1428/year)' : 'Billed monthly'}
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-purple-500" />
                <span className="blur-sm">Everything in Professional</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-purple-500" />
                <span className="blur-sm">API access & integrations</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-purple-500" />
                <span className="blur-sm">Dedicated account manager</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-purple-500" />
                <span className="blur-sm">Custom reporting & analytics</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-purple-500" />
                <span className="blur-sm">White-label solutions</span>
              </div>
            </div>
            <Button className="w-full bg-purple-600 hover:bg-purple-700" disabled>
              <Crown className="h-4 w-4 mr-2" />
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Notify Me Section */}
      <div className="text-center space-y-6 max-w-2xl mx-auto">
        <div className="bg-muted/50 rounded-xl p-8">
          <Bell className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Get Notified When Pricing Launches</h3>
          <p className="text-muted-foreground mb-6">
            Be the first to know when our pricing plans go live. Early users will receive special discounts and exclusive features.
          </p>
          <div className="flex gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button className="px-6">
              <Bell className="h-4 w-4 mr-2" />
              Notify Me
            </Button>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold mb-2">When will pricing be available?</h4>
              <p className="text-muted-foreground text-sm">
                Pricing plans will launch in the coming months. We'll notify all users well in advance.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold mb-2">Will early users get discounts?</h4>
              <p className="text-muted-foreground text-sm">
                Yes! Early adopters will receive special pricing and exclusive features when we launch.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold mb-2">What happens to my current listings?</h4>
              <p className="text-muted-foreground text-sm">
                All your current listings and data will be preserved when we transition to paid plans.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold mb-2">Can I cancel anytime?</h4>
              <p className="text-muted-foreground text-sm">
                Yes, you can cancel your subscription at any time. No long-term commitments required.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
