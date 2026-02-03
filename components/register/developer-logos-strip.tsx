import Link from "next/link"
import { Image } from "@imagekit/next"
import { toIkPath } from "@/lib/imagekit"
import { developersHref } from "@/lib/routes"
import type { SupportedLocale } from "@/lib/routes"
import { cn } from "@/lib/utils"

const LOGO_URLS = [
  "https://ik.imagekit.io/ts59gf2ul/logos-testimonials/markovovillaspark-mrimot.com.jpg",
  "https://ik.imagekit.io/ts59gf2ul/logos-testimonials/shans2000-mrimot.com.jpg",
  "https://ik.imagekit.io/ts59gf2ul/logos-testimonials/solanaresidence-mrimot.com.jpg",
  "https://ik.imagekit.io/ts59gf2ul/logos-testimonials/ideahome-mrimot.com.jpg",
  "https://ik.imagekit.io/ts59gf2ul/logos-testimonials/parkway-mrimot.com.jpg",
]

interface DeveloperLogosStripProps {
  lang: SupportedLocale
  /** Optional override for "View all verified developers" link text */
  viewAllLabel?: string
  /** Heading above logos, e.g. "Trusted by verified developers" */
  heading?: string
  /** Subheading / credibility line, e.g. "Companies already selling directly without brokers" */
  subheading?: string
  /** Short line below logos, e.g. "Every developer shown here has passed manual verification." */
  helperText?: string
  /** Optional className for the heading (e.g. gradient + size to match other section H2s) */
  headingClassName?: string
  /** Optional style for the heading (e.g. lineHeight/fontSize to match homepage section H2s) */
  headingStyle?: React.CSSProperties
  /** Optional className for the subheading (e.g. text-sm text-muted-foreground for contextual framing) */
  subheadingClassName?: string
  /** When false, the "View all developers" link is not rendered. Default true. */
  showViewAllLink?: boolean
}

export function DeveloperLogosStrip({ lang, viewAllLabel, heading, subheading, helperText, headingClassName, headingStyle, subheadingClassName, showViewAllLink = true }: DeveloperLogosStripProps) {
  const viewAllHref = developersHref(lang)
  const label = viewAllLabel ?? "View all verified developers"

  return (
    <div className="flex flex-col items-center gap-4">
      {(heading || subheading) && (
        <div className="text-center space-y-2">
          {heading && (
            <>
              <h2 className={cn("font-bold font-serif", headingClassName ?? "text-xl sm:text-2xl text-foreground")} style={headingStyle}>
                {heading}
              </h2>
              <div className="h-1 w-12 bg-accent rounded-full mx-auto mb-2" aria-hidden />
            </>
          )}
          {subheading && (
            <p className={cn("max-w-xl mx-auto", subheadingClassName ?? "text-lg text-gray-700")}>
              {subheading}
            </p>
          )}
        </div>
      )}
      <div className="rounded-2xl border border-border/60 bg-background shadow-sm px-6 py-6 sm:px-10">
        <div
          className="flex flex-wrap items-center justify-center gap-5 sm:gap-6 md:gap-8"
          role="img"
          aria-label="Trusted by these developers"
        >
          {LOGO_URLS.map((url, i) => (
            <div
              key={i}
              className="relative h-10 w-20 sm:h-12 sm:w-24 flex items-center justify-center grayscale opacity-80 hover:opacity-100 hover:grayscale-0 transition-all duration-200"
            >
              <Image
                src={toIkPath(url)}
                alt=""
                width={96}
                height={48}
                className="object-contain max-h-full max-w-full"
                sizes="(max-width: 640px) 80px, 96px"
              />
            </div>
          ))}
        </div>
      </div>
      {showViewAllLink && (
        <Link
          href={viewAllHref}
          className="text-sm font-medium text-primary hover:underline underline-offset-2"
        >
          {label}
        </Link>
      )}
      {helperText && (
        <p className="text-sm text-muted-foreground text-center max-w-lg">
          {helperText}
        </p>
      )}
    </div>
  )
}
