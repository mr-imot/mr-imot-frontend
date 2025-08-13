import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react"

export function Footer() {
  const navColumns = [
    {
      title: "Explore",
      links: [
        { href: "/listings", label: "Listings" },
        { href: "/developers", label: "Developers" },
        { href: "/about-us", label: "About Us" },
        { href: "/contact", label: "Contact" },
      ],
    },
    {
      title: "For Developers",
      links: [
        { href: "/register?type=developer", label: "List Your Project" },
        { href: "/developer/dashboard", label: "Developer Dashboard" },
        { href: "/login", label: "Login" },
        { href: "/register", label: "Register" },
      ],
    },
  ]

  const legalLinks = [
  { href: "/privacy-policy.html", label: "Privacy Policy" },
  { href: "/terms-of-service.html", label: "Terms of Service" },
  { href: "/cookie-policy.html", label: "Cookie Policy" },
]

  const socialLinks = [
    { href: "https://facebook.com/mrimot", icon: Facebook, label: "Facebook" },
    { href: "https://twitter.com/mrimot", icon: Twitter, label: "Twitter" },
    { href: "https://www.linkedin.com/company/mrimot", icon: Linkedin, label: "LinkedIn" },
    { href: "https://instagram.com/mrimot", icon: Instagram, label: "Instagram" },
  ]

  return (
    <footer className="bg-card border-t text-card-foreground">
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
              Connect directly with real estate developers across Bulgaria. No brokers, no commissions — just
              verified new‑build projects and transparent conversations.
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
            <h3 className="text-base font-semibold mb-4">Social</h3>
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
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-muted-foreground text-sm">
                &copy; {new Date().getFullYear()} Mr imot. All rights reserved.
              </p>
              <p className="text-muted-foreground/70 text-xs mt-1">Connecting you directly with real estate developers.</p>
            </div>

            {/* Legal Links */}
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
