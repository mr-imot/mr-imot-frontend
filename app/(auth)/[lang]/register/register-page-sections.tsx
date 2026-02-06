import type { SupportedLocale } from "@/lib/routes"
import { DeveloperLogosStrip } from "@/components/register/developer-logos-strip"
import { ScrollToFormButton } from "@/components/register/scroll-to-form-button"
import { ScoreIcons } from "@/components/register/score-icons"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toIkPath } from "@/lib/imagekit"
import { Building2, ListChecks, MessagesSquare, Mail, FileCheck, MessageCircle } from "lucide-react"
import { Image } from "@imagekit/next"
import typographyStyles from "@/components/typography.module.css"

const PORTALS_LOGO_IMOT = "https://ik.imagekit.io/ts59gf2ul/competitor%20comparison/imotbg-mrimot.com.png?updatedAt=1770384332731"
const PORTALS_LOGO_ALO = "https://ik.imagekit.io/ts59gf2ul/competitor%20comparison/alobg-mrimot.com.webp?updatedAt=1770384333800"
const PORTALS_LOGO_MISTER = "https://ik.imagekit.io/ts59gf2ul/competitor%20comparison/mrimot.com-king-text.png"

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
  const verification = reg?.verificationSection as Record<string, string> | undefined
  const portalsComparisonTable = reg?.portalsComparisonTable as {
    title?: string
    subtitle?: string
    columns?: {
      imot?: { logoAlt?: string; label?: string; logoUrl?: string }
      alo?: { logoAlt?: string; label?: string; logoUrl?: string }
      mister?: { logoAlt?: string; label?: string; badge?: string; logoUrl?: string }
    }
    rows?: Array<{ label?: string; imot?: number; alo?: number; misterImot?: number }>
    conclusion?: string
    cta?: string
  } | undefined
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
            subheadingClassName="text-base sm:text-lg text-foreground/80"
            headingClassName={SOCIAL_PROOF_HEADING_CLASS}
            showViewAllLink={false}
          />
        </div>
      </section>

      {/* 2. How it works – same heading + accent line below (consistent with other sections) */}
      <section className="py-16 sm:py-20" aria-labelledby="how-it-works-heading">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <h2 id="how-it-works-heading" className={SOCIAL_PROOF_HEADING_CLASS + " mb-3"}>
            {howItWorks?.title ?? "How Mister Imot works"}
          </h2>
          <div className="h-1 w-12 rounded-full bg-accent mx-auto mb-5" aria-hidden />
          {howItWorks?.subtitle && (
            <p className="text-base sm:text-lg text-foreground/80 text-center max-w-xl mx-auto mb-8 sm:mb-10">
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

      {/* 3. Verification – same heading style + accent line below heading (consistent with Social proof) */}
      <section className="py-16 sm:py-20 bg-muted/40 border-y border-border/60" aria-labelledby="verification-heading">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 id="verification-heading" className={SOCIAL_PROOF_HEADING_CLASS + " mb-3"}>
              {verification?.title ?? "How verification works"}
            </h2>
            <div className="h-1 w-12 rounded-full bg-accent mx-auto mb-5" aria-hidden />
            <p className="text-base sm:text-lg text-foreground/80 text-center max-w-xl mx-auto">
              {verificationIntro}
            </p>
          </div>
          <ol className="space-y-0">
            <li className="flex gap-5 sm:gap-6">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-11 h-11 rounded-full border-2 border-primary/20 bg-background flex items-center justify-center text-sm font-bold text-primary shadow-sm">
                  1
                </div>
                <div className="w-0.5 flex-1 min-h-[20px] mt-2 bg-border/80 rounded-full" aria-hidden />
              </div>
              <div className="flex gap-4 pb-10 sm:pb-12 flex-1">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-primary" aria-hidden>
                  <Mail className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg">{verification?.step1 ?? "Email confirmation"}</h3>
                  <p className="text-sm sm:text-base text-foreground/70 mt-1.5">{verification?.step1Helper ?? "We check that the contact is real."}</p>
                </div>
              </div>
            </li>
            <li className="flex gap-5 sm:gap-6">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-11 h-11 rounded-full border-2 border-primary/20 bg-background flex items-center justify-center text-sm font-bold text-primary shadow-sm">
                  2
                </div>
                <div className="w-0.5 flex-1 min-h-[20px] mt-2 bg-border/80 rounded-full" aria-hidden />
              </div>
              <div className="flex gap-4 pb-10 sm:pb-12 flex-1">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-primary" aria-hidden>
                  <FileCheck className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg">{verification?.step2 ?? "Manual verification"}</h3>
                  <p className="text-sm sm:text-base text-foreground/70 mt-1.5">{verification?.step2Helper ?? "We verify the company and project."}</p>
                </div>
              </div>
            </li>
            <li className="flex gap-5 sm:gap-6">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-11 h-11 rounded-full border-2 border-primary/20 bg-background flex items-center justify-center text-sm font-bold text-primary shadow-sm">
                  3
                </div>
              </div>
              <div className="flex gap-4 pb-0 flex-1">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-primary" aria-hidden>
                  <MessageCircle className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg">{verification?.step3 ?? "If needed – follow-up"}</h3>
                  <p className="text-sm sm:text-base text-foreground/70 mt-1.5">{verification?.step3Helper ?? "Short call or office visit."}</p>
                </div>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* 4. Portals comparison table – imot.bg | alo.bg | Mister Imot */}
      <section className="py-12 sm:py-16 bg-muted/20" aria-labelledby="why-developers-heading">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 id="why-developers-heading" className={SOCIAL_PROOF_HEADING_CLASS + " mb-3"}>
              {portalsComparisonTable?.title ?? "Why do investors publish on mrimot.com?"}
            </h2>
            <div className="h-1 w-12 rounded-full bg-accent mx-auto mb-5" aria-hidden />
          </div>
          <Card className="rounded-xl border border-border/60 bg-background shadow-sm overflow-hidden">
            <div className="md:overflow-x-auto">
              <Table className="w-full md:min-w-[900px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-border/60">
                    <TableHead className="w-[120px] md:w-[280px] md:min-w-[200px] font-medium text-foreground/80 text-xs md:text-sm">
                      {/* Criteria column – no header text */}
                    </TableHead>
                    <TableHead className="bg-background text-center px-1 md:px-4 py-3 md:py-6 relative min-h-[100px] md:min-h-[140px]">
                      <div className="flex flex-col items-center h-full">
                        <div className="flex-1 flex items-start justify-center">
                          <Image
                            src={toIkPath(portalsComparisonTable?.columns?.alo?.logoUrl ?? PORTALS_LOGO_ALO)}
                            alt={portalsComparisonTable?.columns?.alo?.logoAlt ?? "alo.bg logo"}
                            width={180}
                            height={48}
                            className="h-10 md:h-16 lg:h-20 w-auto object-contain opacity-60 grayscale hover:opacity-70 hover:grayscale-0 transition-all mx-auto"
                          />
                        </div>
                        <p className="text-[10px] md:text-xs text-muted-foreground/70 mt-auto pt-2 md:pt-4 px-1 leading-tight">Обяви за всичко</p>
                      </div>
                    </TableHead>
                    <TableHead className="bg-background text-center px-1 md:px-4 py-3 md:py-6 relative min-h-[100px] md:min-h-[140px]">
                      <div className="flex flex-col items-center h-full">
                        <div className="flex-1 flex items-start justify-center">
                          <Image
                            src={toIkPath(portalsComparisonTable?.columns?.imot?.logoUrl ?? PORTALS_LOGO_IMOT)}
                            alt={portalsComparisonTable?.columns?.imot?.logoAlt ?? "imot.bg logo"}
                            width={180}
                            height={48}
                            className="h-10 md:h-16 lg:h-20 w-auto object-contain opacity-60 grayscale hover:opacity-70 hover:grayscale-0 transition-all mx-auto"
                          />
                        </div>
                        <p className="text-[10px] md:text-xs text-muted-foreground/70 mt-auto pt-2 md:pt-4 px-1 leading-tight">Обяви за имоти</p>
                      </div>
                    </TableHead>
                    <TableHead className="bg-primary/5 border-x-2 border-primary/30 text-center px-1 md:px-4 py-3 md:py-6 relative min-h-[100px] md:min-h-[140px] overflow-visible">
                      <div className="flex flex-col items-center justify-between h-full relative w-full">
                        <div className="flex-1 flex items-center justify-center w-full relative">
                          <Image
                            src={toIkPath(portalsComparisonTable?.columns?.mister?.logoUrl ?? PORTALS_LOGO_MISTER)}
                            alt={portalsComparisonTable?.columns?.mister?.logoAlt ?? "Mister Imot logo"}
                            width={180}
                            height={48}
                            className="h-16 md:h-24 lg:h-32 xl:h-40 w-auto object-contain opacity-100 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                          />
                        </div>
                        <p className="text-[9px] md:text-xs text-muted-foreground/70 pt-3 md:pt-6 relative z-10 text-center w-full px-1 leading-tight">Обяви за ново строителство от инвеститори</p>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(portalsComparisonTable?.rows ?? []).map((row, i) => (
                    <TableRow key={i} className="hover:bg-muted/20 border-b border-border/40 transition-colors">
                      <TableCell className="w-[120px] md:w-[280px] md:min-w-[200px] text-xs md:text-sm lg:text-base font-semibold text-foreground py-2 md:py-5 pr-1 md:pr-4">
                        {row.label}
                      </TableCell>
                      <TableCell className="bg-background text-center opacity-70 py-2 md:py-5 px-1 md:px-4">
                        <ScoreIcons score={(row.alo ?? 0) as 0 | 1 | 2 | 3} />
                      </TableCell>
                      <TableCell className="bg-background text-center opacity-70 py-2 md:py-5 px-1 md:px-4">
                        <ScoreIcons score={(row.imot ?? 0) as 0 | 1 | 2 | 3} />
                      </TableCell>
                      <TableCell className="bg-primary/5 border-x-2 border-primary/30 text-center py-2 md:py-5 px-1 md:px-4">
                        <ScoreIcons score={(row.misterImot ?? 0) as 0 | 1 | 2 | 3} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </section>

      {/* 5. Final CTA – two-line headline (both substantial), accent highlight + pill button */}
      <section className="py-16 sm:py-20 bg-muted/40 border-y border-border/60" aria-labelledby="final-cta-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 min-w-0">
          <div className="max-w-3xl mx-auto min-w-0">
            <Card className="rounded-2xl border border-border/60 bg-card shadow-md overflow-hidden">
              <div className="pt-5 flex justify-center">
                <div className="h-1 w-12 bg-accent rounded-full" aria-hidden />
              </div>
              <CardContent className="px-6 py-10 sm:px-10 sm:py-12 text-center min-w-0 overflow-hidden">
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
                <div className="mt-8 w-full min-w-0 flex justify-center">
                  <ScrollToFormButton className="w-full max-w-full sm:w-auto rounded-full px-6 py-6 sm:px-10 h-auto text-base sm:text-lg font-bold uppercase tracking-wide bg-accent text-accent-foreground shadow-md hover:bg-accent/90 hover:shadow-lg border-0 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
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
