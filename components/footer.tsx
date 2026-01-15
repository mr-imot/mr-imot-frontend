import Link from "next/link"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react"
import { CookieSettingsButton } from "@/components/cookie-settings-button"
import type { SupportedLocale } from "@/lib/locale-context"
import { listingsHref, developersHref, aboutHref, contactHref, loginHref, registerDeveloperHref, type SupportedLocale as RoutesSupportedLocale } from "@/lib/routes"

interface FooterTranslations {
  footer: {
    explore: string
    forDevelopers: string
    social: string
    description: string
    copyright: string
    partOfProdigy: string
    prodigyDescription: string
    privacyPolicy: string
    termsOfService: string
    cookiePolicy: string
  }
  navigation: {
    listings: string
    developers: string
    aboutUs: string
    contact: string
    listYourProject: string
    developerDashboard: string
    login: string
    register: string
  }
}

interface FooterProps {
  translations: FooterTranslations
  lang: SupportedLocale
}

export function Footer({ translations, lang }: FooterProps) {
  const t = translations.footer
  const tNav = translations.navigation

  const langRoutes = lang as RoutesSupportedLocale

  const navColumns = [
    {
      title: t.explore,
      links: [
        { href: listingsHref(langRoutes), label: tNav.listings },
        { href: developersHref(langRoutes), label: tNav.developers },
        { href: aboutHref(langRoutes), label: tNav.aboutUs },
        { href: contactHref(langRoutes), label: tNav.contact },
      ],
    },
    {
      title: t.forDevelopers,
      links: [
        { 
          href: registerDeveloperHref(langRoutes), 
          label: tNav.listYourProject 
        },
        { href: langRoutes === 'en' ? '/developer/dashboard' : `/${langRoutes}/developer/dashboard`, label: tNav.developerDashboard },
        { href: loginHref(langRoutes), label: tNav.login },
        { 
          href: registerDeveloperHref(langRoutes), 
          label: tNav.register 
        },
      ],
    },
  ]

  const legalLinks: Array<{ href: string; label: string; isCookieButton?: boolean }> = [
    { href: langRoutes === 'en' ? '/privacy-policy' : `/${langRoutes}/privacy-policy`, label: t.privacyPolicy },
    { href: langRoutes === 'en' ? '/terms-of-service' : `/${langRoutes}/terms-of-service`, label: t.termsOfService },
    { href: '#cookie-settings', label: t.cookiePolicy, isCookieButton: true }, // Opens cookie preferences banner
  ]

  // TikTok Icon Component (lucide-react doesn't have TikTok icon)
  const TikTokIcon = ({ className }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  )

  const socialLinks = [
    { href: "https://www.facebook.com/misterimot/", icon: Facebook, label: "Facebook" },
    { href: "https://x.com/mister_imot", icon: Twitter, label: "X (Twitter)" },
    { href: "https://www.instagram.com/mister_imot", icon: Instagram, label: "Instagram" },
    { href: "https://www.youtube.com/@MisterImot", icon: Youtube, label: "YouTube" },
    { href: "https://www.tiktok.com/@mister_imot", icon: TikTokIcon, label: "TikTok" },
  ]

  return (
    <footer role="contentinfo" className="bg-card border-t text-card-foreground min-h-[400px] md:min-h-[450px]">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-200/60 to-transparent" />
      {/* Main Footer Content */}
      <div className="container px-4 md:px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Brand + description */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded bg-foreground/90" />
              <span className="text-lg font-semibold">
                {lang === 'bg' ? 'Мистър Имот' : lang === 'ru' ? 'Мистер Имот' : 'Mister Imot'}
              </span>
            </div>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              {t.description}
            </p>
          </div>

          {/* Link columns */}
          {navColumns.map((col, idx) => (
            <div key={idx} className="lg:col-span-1">
              <h3 className="text-base font-semibold mb-4">{col.title}</h3>
              <nav className="space-y-3">
                {col.links.map((link, linkIdx) => (
                  <Link
                    key={linkIdx}
                    href={link.href}
                    className="block text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
          {/* Social column */}
          <div className="lg:col-span-1">
            <h3 className="text-base font-semibold mb-4">{t.social}</h3>
            <div className="flex items-center gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Separator className="opacity-60" />
      {/* Footer Bottom */}
      <div>
        <div className="container px-4 md:px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Left side: Copyright + Prodigy Corp */}
            <div className="text-center md:text-left flex items-center gap-4">
              <div>
                <p className="text-muted-foreground text-sm">
                  {t.copyright} | {t.partOfProdigy}
                </p>
                <p className="text-muted-foreground/70 text-xs mt-1">{t.prodigyDescription}</p>
              </div>
              <Link
                href="https://www.prodigycorp.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-all duration-200 hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.4)] cursor-pointer"
              >
                <Image
                  src="/prodigy-corp-logo-nobg.png"
                  alt="Prodigy Corp"
                  width={48}
                  height={48}
                  className="object-contain cursor-pointer"
                  priority={false}
                  loading="lazy"
                />
              </Link>
            </div>

            {/* Right side: Legal Links */}
            <nav className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-2 text-sm">
              {legalLinks.map((link, index) => {
                // Special handling for cookie settings link
                if (link.isCookieButton) {
                  return <CookieSettingsButton key={index} label={link.label} />
                }
                return (
                  <Link
                    key={index}
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}
