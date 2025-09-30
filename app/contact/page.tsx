"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollAnimationWrapper } from "@/components/scroll-animation-wrapper"
import { AngledSeparator } from "@/components/angled-separator"
import { Mail, Phone, MessageCircle, Send, CheckCircle } from "lucide-react"

export default function ContactPage() {
  const contactMethods = [
    {
      icon: Phone,
      title: "Call Us",
      description: "Speak directly with our team",
      value: "+359 899520856",
      action: "tel:+359899520856",
      available: "Mon-Fri 9AM-6PM",
    },
    {
      icon: Mail,
      title: "Email Us",
      description: "Get a response within 24 hours",
      value: "support@mrimot.com",
      action: "mailto:support@mrimot.com",
      available: "24/7 Support",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#e8edf0] via-[#f0f4f6] to-[#eaf0f2]">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full">
            <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="contact-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#111827" strokeWidth="0.5" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#contact-grid)" />
            </svg>
          </div>
        </div>

        <div className="container relative py-20 md:py-32">
          <ScrollAnimationWrapper>
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white text-[#111827] px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-md border border-[#e5e7eb]">
                <MessageCircle className="w-4 h-4" />
                Get in Touch
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-[#111827] mb-6 leading-tight">
                We're Here to <span className="text-[#111827]">Help</span>
              </h1>
              <p className="text-xl text-[#374151] leading-relaxed max-w-3xl mx-auto">
                Have questions about our platform? Want to register as a developer? Need technical support? Our team is here to help you succeed.
              </p>
            </div>
          </ScrollAnimationWrapper>
        </div>
        <AngledSeparator />
      </section>

      {/* Contact Methods */}
      <section className="py-20 bg-white">
        <div className="container">
          <ScrollAnimationWrapper>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#111827] mb-4">Get in Touch</h2>
              <p className="text-lg text-[#374151] max-w-2xl mx-auto">
                Choose the method that works best for you. We're committed to responding quickly and helping you get the most out of our platform.
              </p>
            </div>
          </ScrollAnimationWrapper>

          <div className="grid md:grid-cols-2 gap-8 mb-20 max-w-4xl mx-auto">
            {contactMethods.map((method, index) => (
              <ScrollAnimationWrapper key={index} delay={index * 0.1}>
                <Card className="group bg-white shadow-lg hover:shadow-2xl border border-[#e5e7eb] transition-all duration-300 hover:-translate-y-2 h-full">
                  <CardContent className="p-8 text-center h-full flex flex-col">
                    <div className="w-16 h-16 bg-[#111827] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <method.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[#111827] mb-3">{method.title}</h3>
                    <p className="text-[#374151] mb-4 flex-grow">{method.description}</p>
                    <div className="space-y-2 mb-6">
                      <p className="text-lg font-semibold text-[#111827]">{method.value}</p>
                      <div className="flex items-center justify-center text-sm text-[#6b7280]">
                        {method.available}
                      </div>
                    </div>
                    <Button
                      className="w-full bg-[#111827] hover:bg-[#1f2937] text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                      onClick={() => {
                        if (method.action.startsWith("tel:") || method.action.startsWith("mailto:")) {
                          window.open(method.action)
                        }
                      }}
                    >
                      Contact Now
                    </Button>
                  </CardContent>
                </Card>
              </ScrollAnimationWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-gradient-to-br from-[#f0f4f6] to-[#e8edf0]">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <ScrollAnimationWrapper>
              <Card className="bg-white shadow-xl border border-[#e5e7eb] rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-[#111827] to-[#1f2937] text-white p-8">
                  <CardTitle className="text-2xl font-bold flex items-center">
                    <Send className="w-6 h-6 mr-3" />
                    Send Us a Message
                  </CardTitle>
                  <p className="mt-2 opacity-90">
                    Fill out the form below and we'll get back to you within 24 hours.
                  </p>
                </CardHeader>
                <CardContent className="p-8">
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-semibold text-[#111827] mb-2">
                          First Name *
                        </label>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="John"
                          required
                          className="w-full rounded-lg border-[#e5e7eb] focus:border-[#111827]"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-semibold text-[#111827] mb-2">
                          Last Name *
                        </label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Doe"
                          required
                          className="w-full rounded-lg border-[#e5e7eb] focus:border-[#111827]"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-[#111827] mb-2">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@example.com"
                        required
                        className="w-full rounded-lg border-[#e5e7eb] focus:border-[#111827]"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-[#111827] mb-2">
                        Phone Number
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+359 ..."
                        className="w-full rounded-lg border-[#e5e7eb] focus:border-[#111827]"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-semibold text-[#111827] mb-2">
                        Subject *
                      </label>
                      <Input
                        id="subject"
                        type="text"
                        placeholder="How can we help you?"
                        required
                        className="w-full rounded-lg border-[#e5e7eb] focus:border-[#111827]"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-semibold text-[#111827] mb-2">
                        Message *
                      </label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more about your inquiry..."
                        rows={5}
                        required
                        className="w-full rounded-lg resize-none border-[#e5e7eb] focus:border-[#111827]"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-[#111827] hover:bg-[#1f2937] text-white font-semibold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </ScrollAnimationWrapper>

            {/* Response Time Promise */}
            <ScrollAnimationWrapper delay={0.2}>
              <div className="mt-8 bg-gradient-to-r from-[#111827] to-[#1f2937] rounded-2xl p-6 text-white text-center">
                <div className="flex items-center justify-center mb-3">
                  <CheckCircle className="w-6 h-6 mr-2" />
                  <h3 className="text-lg font-bold">Our Promise</h3>
                </div>
                <p className="opacity-90">
                  We guarantee a response within 24 hours during business days. For urgent inquiries, call us directly
                  for immediate assistance.
                </p>
              </div>
            </ScrollAnimationWrapper>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#374151] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="cta-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.6" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#cta-grid)" />
            </svg>
          </div>
        </div>

        <div className="container relative">
          <ScrollAnimationWrapper>
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Find Your Perfect Property?</h2>
              <p className="text-xl text-white/90 mb-8">
                Don't wait! Start exploring verified projects and connect directly with developers today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-[#111827] hover:bg-[#f3f4f6] px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <a href="/listings">Browse Properties</a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white hover:text-[#111827] px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 bg-transparent"
                >
                  <a href="/developers">Meet Developers</a>
                </Button>
              </div>
            </div>
          </ScrollAnimationWrapper>
        </div>
      </section>
    </div>
  )
}
