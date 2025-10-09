"use client"

import Link from "next/link"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react"
import { useTranslations, useLocale } from "@/lib/locale-context"

export function Footer() {
  const t = useTranslations('footer')
  const tNav = useTranslations('navigation')
  const locale = useLocale()

  // Helper function to generate localized URLs
  const href = (en: string, bg: string) => {
    return locale === 'bg' ? `/bg/${bg}` : `/${en}`
  }

  const navColumns = [
    {
      title: t.explore,
      links: [
        { href: href('listings', 'obiavi'), label: tNav.listings },
        { href: href('developers', 'stroiteli'), label: tNav.developers },
        { href: href('about-us', 'za-nas'), label: tNav.aboutUs },
        { href: href('contact', 'kontakt'), label: tNav.contact },
      ],
    },
    {
      title: t.forDevelopers,
      links: [
        { href: href('register?type=developer', 'register?type=developer'), label: tNav.listYourProject },
        { href: href('developer/dashboard', 'developer/dashboard'), label: tNav.developerDashboard },
        { href: href('login', 'login'), label: tNav.login },
        { href: href('register', 'register'), label: tNav.register },
      ],
    },
  ]

  const legalLinks = [
  { href: "/privacy-policy.html", label: t.privacyPolicy },
  { href: "/terms-of-service.html", label: t.termsOfService },
  { href: "/cookie-policy.html", label: t.cookiePolicy },
]

  const socialLinks = [
    { href: "https://facebook.com/mrimot", icon: Facebook, label: "Facebook" },
    { href: "https://twitter.com/mrimot", icon: Twitter, label: "Twitter" },
    { href: "https://www.linkedin.com/company/mrimot", icon: Linkedin, label: "LinkedIn" },
    { href: "https://instagram.com/mrimot", icon: Instagram, label: "Instagram" },
  ]

  return (
    <footer className="bg-card border-t text-card-foreground">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-200/60 to-transparent" />
      {/* Main Footer Content */}
      <div className="container px-4 md:px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Brand + description */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded bg-foreground/90" />
              <span className="text-lg font-semibold">Mr imot</span>
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
                />
              </Link>
            </div>

            {/* Right side: Legal Links */}
            <nav className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-2 text-sm">
              {legalLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}
