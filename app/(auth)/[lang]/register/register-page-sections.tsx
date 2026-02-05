import type { SupportedLocale } from "@/lib/routes"
import { DeveloperLogosStrip } from "@/components/register/developer-logos-strip"
import { ScrollToFormButton } from "@/components/register/scroll-to-form-button"
import { Card, CardContent } from "@/components/ui/card"
import { Building2, ListChecks, MessagesSquare, Clock, Shield, Lock, Globe } from "lucide-react"
import typographyStyles from "@/components/typography.module.css"

interface RegisterPageSectionsProps {
  lang: SupportedLocale
  dict: Record<string, unknown>
}

/** Secondary: supportive sections (no gradient, smaller). How it works, Verification, Why. */
const SECONDARY_HEADING_CLASS = "text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground font-serif text-center leading-tight mb-6"

/** Social proof: gradient kept, size reduced vs hero (no clamp). */
const SOCIAL_PROOF_HEADING_CLASS = `${typographyStyles.headlineGradient} text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-center mb-6`

const BODY_CLASS = "text-lg text-foreground/90"

export async function RegisterPageSections({ lang, dict }: RegisterPageSectionsProps) {
  const reg = dict.register as Record<string, unknown> | undefined
  const howItWorks = reg?.howItWorks as Record<string, string> | undefined
  const whyDevelopers = reg?.whyDevelopers as Record<string, string> | undefined
  const verification = reg?.verificationSection as Record<string, string> | undefined
  const finalCta = reg?.finalCta as Record<string, string> | undefined
  const socialProofHeading = (reg?.socialProofHeading as string) ?? "Trusted by verified developers"
  const socialProofSupportLine = (reg?.socialProofSupportLine as string) ?? undefined
  const verificationIntro = (verification?.intro as string) ?? "To keep the platform clean, every application goes through:"
  const ctaSubline = (finalCta?.subline as string) ?? "Approval usually within 48 hours."
  const ctaTitle = (finalCta?.title as string) ?? "Clients look for new construction directly from the investor.\nBe that investor."
  const [ctaTitleA, ctaTitleB] = ctaTitle.split("\n")

  return (
    <>
      {/* 1. Social proof – immediately after hero */}
      <section className="py-16 sm:py-20 bg-muted/40 border-y border-border/60" aria-label="Social proof">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <DeveloperLogosStrip
            lang={lang}
            heading={socialProofHeading}
            subheading={socialProofSupportLine}
            subheadingClassName="text-sm text-foreground/80"
            headingClassName={SOCIAL_PROOF_HEADING_CLASS}
            showViewAllLink={false}
          />
        </div>
      </section>

      {/* 2. How it works – workflow for professionals (premium, calm, B2B) */}
      <section className="py-16 sm:py-20" aria-labelledby="how-it-works-heading">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <h2 id="how-it-works-heading" className={SOCIAL_PROOF_HEADING_CLASS + " mb-3"}>
            {howItWorks?.title ?? "How Mister Imot works"}
          </h2>
          {howItWorks?.subtitle && (
            <p className="text-sm text-foreground/80 text-center max-w-xl mx-auto mb-8 sm:mb-10">
              {howItWorks.subtitle}
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Step 1 */}
            <Card className="rounded-2xl border border-border/60 bg-background shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
              <CardContent className="p-7 sm:p-8 flex flex-col">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center font-semibold text-primary mb-4" aria-hidden>01</div>
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-muted text-primary mb-4 flex-shrink-0" aria-hidden>
                  <Building2 className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {howItWorks?.step1Title ?? "Publish your project"}
                </h3>
                <p className="text-sm md:text-base text-foreground/75 leading-relaxed">
                  {howItWorks?.step1Desc ?? "One page: location, stage, plans, prices and contacts."}
                </p>
              </CardContent>
            </Card>
                        {/* Step 2 */}
            <Card className="rounded-2xl border border-border/60 bg-background shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
              <CardContent className="p-7 sm:p-8 flex flex-col">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center font-semibold text-primary mb-4" aria-hidden>02</div>
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-muted text-primary mb-4 flex-shrink-0" aria-hidden>
                  <ListChecks className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {howItWorks?.step2Title ?? "List availability"}
                </h3>
                <p className="text-sm md:text-base text-foreground/75 leading-relaxed">
                  {howItWorks?.step2Desc ?? "You update available types and stages when something changes."}
                </p>
              </CardContent>
            </Card>
            {/* Step 3 */}
            <Card className="rounded-2xl border border-border/60 bg-background shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
              <CardContent className="p-7 sm:p-8 flex flex-col">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center font-semibold text-primary mb-4" aria-hidden>03</div>
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-muted text-primary mb-4 flex-shrink-0" aria-hidden>
                  <MessagesSquare className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {howItWorks?.step3Title ?? "Receive real inquiries"}
                </h3>
                <p className="text-sm md:text-base text-foreground/75 leading-relaxed">
                  {howItWorks?.step3Desc ?? "Clients contact you or your team directly."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. Verification – right after How it works, tied to “Apply” */}
      <section className="py-16 sm:py-20 bg-muted/40 border-y border-border/60" aria-labelledby="verification-heading">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8">
          <h2 id="verification-heading" className={SECONDARY_HEADING_CLASS + " mb-3"}>
            {verification?.title ?? "Verification"}
          </h2>
          <p className={BODY_CLASS + " text-center mb-8 sm:mb-10"}>
            {verificationIntro}
          </p>
          <ol className="space-y-0">
            <li className="flex gap-4">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-10 h-10 rounded-full border-2 border-primary/20 bg-muted flex items-center justify-center text-sm font-semibold text-primary">
                  1
                </div>
                <div className="w-px flex-1 min-h-[24px] mt-1 bg-border/80" aria-hidden />
              </div>
              <div className="pb-8">
                <h3 className="font-semibold text-foreground text-base">{verification?.step1 ?? "Email confirmation"}</h3>
                <p className="text-sm text-foreground/70 mt-1">{verification?.step1Helper ?? "We check that the contact is real."}</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-10 h-10 rounded-full border-2 border-primary/20 bg-muted flex items-center justify-center text-sm font-semibold text-primary">
                  2
                </div>
                <div className="w-px flex-1 min-h-[24px] mt-1 bg-border/80" aria-hidden />
              </div>
              <div className="pb-8">
                <h3 className="font-semibold text-foreground text-base">{verification?.step2 ?? "Manual verification"}</h3>
                <p className="text-sm text-foreground/70 mt-1">{verification?.step2Helper ?? "We verify the company and project."}</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-10 h-10 rounded-full border-2 border-primary/20 bg-muted flex items-center justify-center text-sm font-semibold text-primary">
                  3
                </div>
              </div>
              <div className="pb-0">
                <h3 className="font-semibold text-foreground text-base">{verification?.step3 ?? "If needed – follow-up"}</h3>
                <p className="text-sm text-foreground/70 mt-1">{verification?.step3Helper ?? "Short call or office visit."}</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* 4. Why this model – 2x2 feature grid */}
      <section className="py-16 sm:py-20" aria-labelledby="why-developers-heading">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <h2 id="why-developers-heading" className={SECONDARY_HEADING_CLASS + " mb-3"}>
            {whyDevelopers?.title ?? "Why developers prefer this model"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Card className="rounded-2xl border border-border/60 bg-background shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
              <CardContent className="p-6 flex flex-col">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted text-primary mb-4 flex-shrink-0" aria-hidden>
                  <Clock className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-foreground text-base mb-2">
                  {whyDevelopers?.item1 ?? "Less time wasted"}
                </h3>
                <p className="text-sm text-foreground/75 leading-relaxed">
                  {(whyDevelopers as Record<string, string> | undefined)?.item1Desc ?? "Fewer pointless calls and confusion, more real clients."}
                </p>
                {(whyDevelopers as Record<string, string> | undefined)?.metaHint && (
                  <p className="text-xs text-muted-foreground mt-2">{(whyDevelopers as Record<string, string> | undefined)?.metaHint}</p>
                )}
              </CardContent>
            </Card>
            <Card className="rounded-2xl border border-border/60 bg-background shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
              <CardContent className="p-6 flex flex-col">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted text-primary mb-4 flex-shrink-0" aria-hidden>
                  <Shield className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-foreground text-base mb-2">
                  {whyDevelopers?.item2 ?? "Lower risk for the deal"}
                </h3>
                <p className="text-sm text-foreground/75 leading-relaxed">
                  {(whyDevelopers as Record<string, string> | undefined)?.item2Desc ?? "One clear page with official project information."}
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border border-border/60 bg-background shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
              <CardContent className="p-6 flex flex-col">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted text-primary mb-4 flex-shrink-0" aria-hidden>
                  <Lock className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-foreground text-base mb-2">
                  {whyDevelopers?.item3 ?? "Your content is protected"}
                </h3>
                <p className="text-sm text-foreground/75 leading-relaxed">
                  {(whyDevelopers as Record<string, string> | undefined)?.item3Desc ?? "Your photos are not used in third-party listings."}
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border border-border/60 bg-background shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
              <CardContent className="p-6 flex flex-col">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted text-primary mb-4 flex-shrink-0" aria-hidden>
                  <Globe className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-foreground text-base mb-2">
                  {whyDevelopers?.item4 ?? "Reach Bulgarians abroad"}
                </h3>
                <p className="text-sm text-foreground/75 leading-relaxed">
                  {(whyDevelopers as Record<string, string> | undefined)?.item4Desc ?? "More inquiries from people looking for new construction."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. Final CTA – two-line headline (both substantial), accent highlight + pill button */}
      <section className="py-16 sm:py-20 bg-muted/40 border-y border-border/60" aria-labelledby="final-cta-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="max-w-3xl mx-auto">
            <Card className="rounded-2xl border border-border/60 bg-card shadow-md overflow-hidden">
              <div className="pt-5 flex justify-center">
                <div className="h-1 w-12 bg-accent rounded-full" aria-hidden />
              </div>
              <CardContent className="px-6 py-10 sm:px-10 sm:py-12 text-center">
                <h2
                  id="final-cta-heading"
                  className="font-serif text-center leading-tight"
                >
                  <span className="block text-xl sm:text-2xl md:text-3xl font-semibold text-foreground">
                    {ctaTitleA?.trim() || "Clients look for new construction directly from the investor."}
                  </span>
                  <span className="mt-5 block text-3xl sm:text-4xl md:text-5xl font-bold text-accent">
                    {ctaTitleB?.trim() || "Be that investor."}
                  </span>
                </h2>
                <p className="mt-6 text-muted-foreground text-base sm:text-lg">
                  {ctaSubline}
                </p>
                <div className="mt-8">
                  <ScrollToFormButton className="rounded-full px-10 py-6 h-auto text-base sm:text-lg font-bold uppercase tracking-wide bg-accent text-accent-foreground shadow-md hover:bg-accent/90 hover:shadow-lg border-0 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
                    {finalCta?.ctaButton ?? "Apply for free"}
                  </ScrollToFormButton>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  )
}
