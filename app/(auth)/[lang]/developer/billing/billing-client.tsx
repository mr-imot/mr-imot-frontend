"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Crown, Star, Bell, Rocket, TrendingUp } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { DeveloperSidebar } from "@/components/developer-sidebar"
import { PricingSection } from "@/components/pricing/PricingSection"

interface BillingClientProps {
  dict: any
  lang: 'en' | 'bg'
}

function BillingContent({ dict, lang }: BillingClientProps) {
  const t = dict?.developer?.billing || {}

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

        {/* Hero Banner */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-gradient-to-br from-primary to-primary/80 border-0 text-white">
            <CardContent className="p-6 h-full flex flex-col justify-center">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Rocket className="h-8 w-8" />
                  <h2 className="text-2xl font-bold">
                    {t.pricingLiveTitle || "Congratulations!"}
                  </h2>
                </div>
                <p className="text-white/90 text-base">
                  {t.freeUntilDescription || "You have free and unlimited access until 01.02.2026. We’ll share a special offer here and via email soon."}
                </p>
                <p className="text-white/80 text-sm">
                  {t.specialDealDescription || "Make the most of the platform during the free period."}
                </p>
                <Button
                  variant="secondary"
                  className="w-fit bg-white text-primary hover:bg-white/90"
                  onClick={() => document.getElementById('pricing-plans')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {t.viewPlans || "View plans"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Plans */}
        <section id="pricing-plans" className="space-y-6">
          <PricingSection lang={lang} dict={dict} />
        </section>

        {/* Bottom Row - Value Proposition & Pricing Model (50/50) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Value Proposition - Left */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-bold mb-2">{t.whyDifferent || "Why Our Platform is Different"}</h2>
                  <p className="text-muted-foreground text-sm">{t.builtForBulgarian || "Built specifically for Bulgarian developers and investors."}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-1">{t.qualifiedLeads || "Qualified Lead Generation"}</h3>
                      <p className="text-muted-foreground text-xs">{t.qualifiedLeadsDesc || "Receive inquiries from real buyers looking for your projects. Traffic comes from people searching new construction and direct contact with you."}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Star className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-1">{t.exclusiveListings || "Exclusive Listings"}</h3>
                      <p className="text-muted-foreground text-xs">{t.exclusiveListingsDesc || "Only you can publish your project. Your media stays protected and cannot be re-uploaded by others."}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Crown className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-1">{t.noBrokers || "No Brokers Needed"}</h3>
                      <p className="text-muted-foreground text-xs">{t.noBrokersDesc || "Save on broker commissions with direct-to-buyer conversations."}</p>
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
                  <h2 className="text-xl font-bold mb-2">{t.simplePerListing || "Simple Per-Listing Pricing"}</h2>
                  <p className="text-muted-foreground text-sm">
                    {t.payOnlyWhatYouUse || "Pay only for what you use. Rotate your listings as needed - when one sells, activate another."}
                  </p>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 text-sm">{t.howItWorks || "How It Works"}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">1</div>
                      <p className="text-xs">{t.step1 || "Choose how many active project listings you want"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-primary w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">2</div>
                      <p className="text-xs">{t.step2 || "Pay monthly for your active project listings"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-primary w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">3</div>
                      <p className="text-xs">{t.step3 || "Rotate listings as projects sell out"}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 text-center">
                  <p className="text-xs text-muted-foreground">{t.noHiddenFees || "No hidden fees, no long-term contracts"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">{t.faqTitle || "Frequently Asked Questions"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 text-sm">{t.noPlanAfterDate || "What if I have no active plan after 01.02.2026?"}</h4>
                  <p className="text-muted-foreground text-xs">
                    {t.noPlanAfterDateAnswer || "Without an active plan after 01.02.2026, your listings will not be public."}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-sm">{t.reuploadNeeded || "Do I need to re-upload my listings after the free period?"}</h4>
                  <p className="text-muted-foreground text-xs">
                    {t.reuploadNeededAnswer || "No. Choose a plan to keep them public."}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-sm">{t.switchPlans || "Can I switch plans later?"}</h4>
                  <p className="text-muted-foreground text-xs">
                    {t.switchPlansAnswer || "Upgrade or downgrade anytime; changes apply next billing cycle."}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 text-sm">{t.howPerListingWorks || "How does the per-listing model work?"}</h4>
                  <p className="text-muted-foreground text-xs">
                    {t.howPerListingWorksAnswer || "You pay monthly for each active listing and can change which listing is active at any time."}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-sm">{t.isThereContract || "Is there a contract?"}</h4>
                  <p className="text-muted-foreground text-xs">
                    {t.isThereContractAnswer || "No long-term contracts. Pay monthly and cancel anytime."}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-sm">{t.paymentMethod || "How do I pay?"}</h4>
                  <p className="text-muted-foreground text-xs">
                    {t.paymentMethodAnswer || "Payments are online via Stripe. Invoices are sent by email."}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Page-scoped styling to blur/disable CTAs in pricing cards (only on this page) */}
      <style jsx global>{`
        #pricing-plans a,
        #pricing-plans a button {
          filter: blur(2px);
          pointer-events: none;
          cursor: not-allowed;
        }
      `}</style>
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
