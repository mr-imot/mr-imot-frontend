"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollAnimationWrapper } from "@/components/scroll-animation-wrapper"
import { AngledSeparator } from "@/components/angled-separator"
import { Mail, Phone, MapPin, Clock, MessageCircle, Send, CheckCircle } from "lucide-react"

export default function ContactPage() {
  const contactMethods = [
    {
      icon: Phone,
      title: "Call Us",
      description: "Speak directly with our team",
      value: "+359 2 123 4567",
      action: "tel:+35921234567",
      available: "Mon-Fri 9AM-6PM",
    },
    {
      icon: Mail,
      title: "Email Us",
      description: "Get a response within 24 hours",
      value: "info@mrimot.com",
      action: "mailto:info@mrimot.com",
      available: "24/7 Support",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      description: "Meet us at our office",
      value: "123 MrImot Street, Sofia",
      action: "#",
      available: "By Appointment",
    },
  ]

  const faqs = [
    {
      question: "How do I contact developers directly?",
      answer:
        "Each property listing includes direct contact information for the developer, including phone numbers and email addresses.",
    },
    {
      question: "Are all listings verified?",
      answer: "Yes, every project on MrImot is personally verified by our team to ensure authenticity and accuracy.",
    },
    {
      question: "Do I pay any fees to use MrImot?",
      answer: "No, MrImot is completely free for buyers. We don't charge any commissions or hidden fees.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-ds-neutral-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ds-primary-50 via-white to-ds-accent-50">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full">
            <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="contact-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e40af" strokeWidth="0.5" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#contact-grid)" />
            </svg>
          </div>
        </div>

        <div className="container relative py-20 md:py-32">
          <ScrollAnimationWrapper>
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-ds-primary-100 text-ds-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <MessageCircle className="w-4 h-4" />
                Get in Touch
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-ds-neutral-900 mb-6 leading-tight">
                We're Here to <span className="text-ds-primary-600">Help</span>
              </h1>
              <p className="text-xl text-ds-neutral-600 leading-relaxed max-w-3xl mx-auto">
                Have questions about a property? Need help finding the perfect developer? Our team is ready to assist
                you every step of the way.
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
              <h2 className="text-3xl md:text-4xl font-bold text-ds-neutral-900 mb-4">Multiple Ways to Reach Us</h2>
              <p className="text-lg text-ds-neutral-600 max-w-2xl mx-auto">
                Choose the method that works best for you. We're committed to responding quickly and helpfully.
              </p>
            </div>
          </ScrollAnimationWrapper>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {contactMethods.map((method, index) => (
              <ScrollAnimationWrapper key={index} delay={index * 0.1}>
                <Card className="group bg-white shadow-lg hover:shadow-2xl border border-ds-neutral-200 hover:border-ds-primary-300 transition-all duration-300 hover:-translate-y-2 h-full">
                  <CardContent className="p-8 text-center h-full flex flex-col">
                    <div className="w-16 h-16 bg-gradient-to-br from-ds-primary-500 to-ds-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <method.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-ds-neutral-900 mb-3">{method.title}</h3>
                    <p className="text-ds-neutral-600 mb-4 flex-grow">{method.description}</p>
                    <div className="space-y-2 mb-6">
                      <p className="text-lg font-semibold text-ds-primary-600">{method.value}</p>
                      <div className="flex items-center justify-center text-sm text-ds-neutral-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {method.available}
                      </div>
                    </div>
                    <Button
                      className="w-full bg-ds-primary-600 hover:bg-ds-primary-700 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group-hover:bg-ds-primary-700"
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

      {/* Contact Form & Info */}
      <section className="py-20 bg-ds-neutral-50">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <ScrollAnimationWrapper>
              <Card className="bg-white shadow-xl border border-ds-neutral-200 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-ds-primary-600 to-ds-accent-600 text-white p-8">
                  <CardTitle className="text-2xl font-bold flex items-center">
                    <Send className="w-6 h-6 mr-3" />
                    Send Us a Message
                  </CardTitle>
                  <p className="text-white/90 mt-2">
                    Fill out the form below and we'll get back to you within 24 hours.
                  </p>
                </CardHeader>
                <CardContent className="p-8">
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-semibold text-ds-neutral-800 mb-2">
                          First Name *
                        </label>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="John"
                          required
                          className="w-full border-ds-neutral-300 rounded-lg focus:border-ds-primary-600 focus:ring-2 focus:ring-ds-primary-500 focus:ring-offset-1 transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-semibold text-ds-neutral-800 mb-2">
                          Last Name *
                        </label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Doe"
                          required
                          className="w-full border-ds-neutral-300 rounded-lg focus:border-ds-primary-600 focus:ring-2 focus:ring-ds-primary-500 focus:ring-offset-1 transition-all duration-200"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-ds-neutral-800 mb-2">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@example.com"
                        required
                        className="w-full border-ds-neutral-300 rounded-lg focus:border-ds-primary-600 focus:ring-2 focus:ring-ds-primary-500 focus:ring-offset-1 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-ds-neutral-800 mb-2">
                        Phone Number
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+359 ..."
                        className="w-full border-ds-neutral-300 rounded-lg focus:border-ds-primary-600 focus:ring-2 focus:ring-ds-primary-500 focus:ring-offset-1 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-semibold text-ds-neutral-800 mb-2">
                        Subject *
                      </label>
                      <Input
                        id="subject"
                        type="text"
                        placeholder="How can we help you?"
                        required
                        className="w-full border-ds-neutral-300 rounded-lg focus:border-ds-primary-600 focus:ring-2 focus:ring-ds-primary-500 focus:ring-offset-1 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-semibold text-ds-neutral-800 mb-2">
                        Message *
                      </label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more about your inquiry..."
                        rows={5}
                        required
                        className="w-full border-ds-neutral-300 rounded-lg focus:border-ds-primary-600 focus:ring-2 focus:ring-ds-primary-500 focus:ring-offset-1 transition-all duration-200 resize-none"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-ds-primary-600 hover:bg-ds-primary-700 text-white font-semibold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </ScrollAnimationWrapper>

            {/* Contact Information & FAQ */}
            <div className="space-y-8">
              {/* Office Information */}
              <ScrollAnimationWrapper delay={0.2}>
                <Card className="bg-white shadow-lg border border-ds-neutral-200 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-ds-neutral-900 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-ds-primary-600" />
                      Office Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-ds-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5 text-ds-primary-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-ds-neutral-900">Address</h4>
                          <p className="text-ds-neutral-600">
                            123 MrImot Street
                            <br />
                            Sofia 1000, Bulgaria
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-ds-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Clock className="w-5 h-5 text-ds-accent-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-ds-neutral-900">Business Hours</h4>
                          <p className="text-ds-neutral-600">
                            Monday - Friday: 9:00 AM - 6:00 PM
                            <br />
                            Saturday: 10:00 AM - 4:00 PM
                            <br />
                            Sunday: Closed
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollAnimationWrapper>

              {/* FAQ */}
              <ScrollAnimationWrapper delay={0.3}>
                <Card className="bg-white shadow-lg border border-ds-neutral-200 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-ds-neutral-900">Frequently Asked Questions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {faqs.map((faq, index) => (
                      <div key={index} className="border-b border-ds-neutral-200 last:border-b-0 pb-4 last:pb-0">
                        <h4 className="font-semibold text-ds-neutral-900 mb-2 flex items-start">
                          <CheckCircle className="w-5 h-5 text-ds-accent-500 mr-2 flex-shrink-0 mt-0.5" />
                          {faq.question}
                        </h4>
                        <p className="text-ds-neutral-600 ml-7">{faq.answer}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </ScrollAnimationWrapper>

              {/* Response Time Promise */}
              <ScrollAnimationWrapper delay={0.4}>
                <div className="bg-gradient-to-r from-ds-accent-500 to-ds-primary-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center mb-3">
                    <CheckCircle className="w-6 h-6 mr-2" />
                    <h3 className="text-lg font-bold">Our Promise</h3>
                  </div>
                  <p className="text-white/90">
                    We guarantee a response within 24 hours during business days. For urgent inquiries, call us directly
                    for immediate assistance.
                  </p>
                </div>
              </ScrollAnimationWrapper>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-ds-primary-600 via-ds-primary-700 to-ds-accent-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="cta-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#60a5fa" strokeWidth="0.5" opacity="0.6" />
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
                  className="bg-white text-ds-primary-600 hover:bg-ds-neutral-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <a href="/listings">Browse Properties</a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white hover:text-ds-primary-600 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 bg-transparent"
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
