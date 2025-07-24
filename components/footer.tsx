import Link from "next/link"
import { CheckCircle, Users, UserX, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react"

export function Footer() {
  const trustIndicators = [
    {
      icon: CheckCircle,
      title: "Verified Listings",
      description: "100% authentic projects",
    },
    {
      icon: Users,
      title: "Direct Contact",
      description: "No middlemen involved",
    },
    {
      icon: UserX,
      title: "No Brokers",
      description: "Zero commission fees",
    },
  ]

  const quickLinks = [
    { href: "/listings", label: "Browse Listings" },
    { href: "/developers", label: "Find Developers" },
    { href: "/about-us", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/register?type=developer", label: "List Your Project" },
  ]

  const legalLinks = [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/cookies", label: "Cookie Policy" },
  ]

  const socialLinks = [
    { href: "#", icon: Facebook, label: "Facebook" },
    { href: "#", icon: Twitter, label: "Twitter" },
    { href: "#", icon: Linkedin, label: "LinkedIn" },
    { href: "#", icon: Instagram, label: "Instagram" },
  ]

  return (
    <footer className="bg-ds-neutral-800 text-white">
      {/* Main Footer Content */}
      <div className="container px-4 md:px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Trust Indicators Column */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-white mb-8">Why Choose MrImot</h3>
            <div className="space-y-6">
              {trustIndicators.map((item, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-ds-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                    <p className="text-sm text-ds-neutral-300 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-white mb-8">Quick Links</h3>
            <nav className="space-y-4">
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="block text-ds-neutral-300 hover:text-white transition-colors duration-200 text-base"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Information Column */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-white mb-8">Contact Info</h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-ds-accent-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Email</h4>
                  <a
                    href="mailto:info@mrimot.com"
                    className="text-ds-neutral-300 hover:text-white transition-colors duration-200"
                  >
                    info@mrimot.com
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-ds-accent-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Phone</h4>
                  <a
                    href="tel:+1234567890"
                    className="text-ds-neutral-300 hover:text-white transition-colors duration-200"
                  >
                    +1 (234) 567-8900
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-ds-accent-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Address</h4>
                  <p className="text-ds-neutral-300 leading-relaxed">
                    123 MrImot Street
                    <br />
                    Sofia, Bulgaria
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Social & Newsletter Column */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-white mb-8">Stay Connected</h3>
            <div className="space-y-8">
              {/* Social Links */}
              <div>
                <h4 className="font-semibold text-white mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      className="w-10 h-10 bg-ds-neutral-700 hover:bg-ds-primary-600 rounded-lg flex items-center justify-center transition-colors duration-200 group"
                      aria-label={social.label}
                    >
                      <social.icon className="h-5 w-5 text-ds-neutral-300 group-hover:text-white" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Newsletter Signup */}
              <div>
                <h4 className="font-semibold text-white mb-4">Newsletter</h4>
                <p className="text-sm text-ds-neutral-300 mb-4 leading-relaxed">
                  Get updates on new projects and market insights.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2 bg-ds-neutral-700 border border-ds-neutral-600 rounded-lg text-white placeholder-ds-neutral-400 focus:outline-none focus:ring-2 focus:ring-ds-primary-600 focus:border-transparent"
                  />
                  <button className="px-6 py-2 bg-ds-primary-600 hover:bg-ds-primary-700 text-white font-semibold rounded-lg transition-colors duration-200 whitespace-nowrap">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-ds-neutral-700">
        <div className="container px-4 md:px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-ds-neutral-300 text-sm">
                &copy; {new Date().getFullYear()} MrImot. All rights reserved.
              </p>
              <p className="text-ds-neutral-400 text-xs mt-1">Connecting you directly with real estate developers.</p>
            </div>

            {/* Legal Links */}
            <nav className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-2 text-sm">
              {legalLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-ds-neutral-400 hover:text-white transition-colors duration-200"
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
