import Image from "next/image"
import { CheckCircle, Users, Shield, Zap, Heart, Target } from "lucide-react"
import { ScrollAnimationWrapper } from "@/components/scroll-animation-wrapper"
import { AngledSeparator } from "@/components/angled-separator"

export default function AboutUsPage() {
  const values = [
    {
      icon: Shield,
      title: "Trust & Transparency",
      description: "Every listing is verified and every developer is authenticated to ensure complete transparency.",
    },
    {
      icon: Users,
      title: "Direct Connection",
      description: "We eliminate intermediaries, connecting buyers directly with developers for honest communication.",
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Leveraging cutting-edge technology to make real estate discovery simple and efficient.",
    },
    {
      icon: Heart,
      title: "Customer First",
      description: "Your success is our success. We're committed to providing exceptional service at every step.",
    },
  ]

  const stats = [
    { number: "500+", label: "Verified Developers" },
    { number: "2,000+", label: "Active Listings" },
    { number: "10,000+", label: "Happy Customers" },
    { number: "50+", label: "Cities Covered" },
  ]

  const benefits = [
    "Direct access to developers, no brokers involved",
    "100% verified listings of projects under construction",
    "Transparent information and direct communication",
    "Save on commissions and avoid fake listings",
    "User-friendly platform with powerful search and map features",
    "Real-time project updates and progress tracking",
  ]

  return (
    <div className="min-h-screen" style={{backgroundColor: '#ffffff'}}>
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{background: 'linear-gradient(to bottom right, var(--brand-glass-lighter), var(--brand-glass-primary), var(--brand-glass-light))'}}>
        <div className="container relative py-20 md:py-32">
          <ScrollAnimationWrapper>
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 border" style={{
                backgroundColor: 'var(--brand-badge-bg)',
                color: 'var(--brand-badge-text)',
                borderColor: 'var(--brand-badge-border)'
              }}>
                <Target className="w-4 h-4" />
                Our Story
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight" style={{color: 'var(--brand-text-primary)'}}>
                About <span style={{color: 'var(--brand-btn-primary-bg)'}}>Mr imot</span>
              </h1>
              <p className="text-xl leading-relaxed" style={{color: 'var(--brand-text-secondary)'}}>
                Connecting you directly with the future of real estate through innovation, transparency, and trust.
              </p>
            </div>
          </ScrollAnimationWrapper>
        </div>
        <AngledSeparator />
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20" style={{backgroundColor: '#ffffff'}}>
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <ScrollAnimationWrapper>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4 border" style={{
                  backgroundColor: 'var(--brand-badge-bg)',
                  color: 'var(--brand-badge-text)',
                  borderColor: 'var(--brand-badge-border)'
                }}>
                  Mission
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{color: 'var(--brand-text-primary)'}}>
                  Revolutionizing Real Estate
                </h2>
                <p className="text-lg leading-relaxed mb-6" style={{color: 'var(--brand-text-secondary)'}}>
                  At Mr imot, our mission is to revolutionize the real estate market by creating a transparent and direct
                  connection between property buyers and real estate developers. We believe in cutting out unnecessary
                  intermediaries, reducing costs, and providing direct access to verified, under-construction projects.
                </p>
                <p className="text-lg leading-relaxed" style={{color: 'var(--brand-text-secondary)'}}>
                  We empower buyers to make informed decisions and help developers showcase their work efficiently to a
                  targeted audience.
                </p>
              </div>
            </ScrollAnimationWrapper>
            <ScrollAnimationWrapper delay={0.2}>
              <div className="relative">
                 <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl transform rotate-3"></div>
                <div className="relative bg-white p-2 rounded-2xl shadow-xl">
                  <Image
                    src="/placeholder.svg?height=400&width=600"
                    alt="Our Mission - Modern Construction"
                    width={600}
                    height={400}
                    className="rounded-xl w-full h-80 object-cover"
                  />
                </div>
              </div>
            </ScrollAnimationWrapper>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ScrollAnimationWrapper>
              <div className="relative order-2 lg:order-1">
                <div className="absolute inset-0 bg-gradient-to-br from-ds-accent-200 to-ds-primary-200 rounded-2xl transform -rotate-3"></div>
                <div className="relative bg-white p-2 rounded-2xl shadow-xl">
                  <Image
                    src="/placeholder.svg?height=400&width=600"
                    alt="Our Vision - Future of Real Estate"
                    width={600}
                    height={400}
                    className="rounded-xl w-full h-80 object-cover"
                  />
                </div>
              </div>
            </ScrollAnimationWrapper>
            <ScrollAnimationWrapper delay={0.2}>
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 bg-muted text-foreground px-3 py-1 rounded-full text-sm font-medium mb-4">
                  Vision
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Building Tomorrow's Marketplace
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  We envision a world where finding and investing in new real estate is simple, direct, and trustworthy.
                  Mr imot aims to be the go-to platform for anyone seeking new construction properties and for developers
                  looking to list their projects with confidence and ease.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We are committed to fostering a community where quality projects meet genuine demand, creating value
                  for everyone involved.
                </p>
              </div>
            </ScrollAnimationWrapper>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="container relative">
          <ScrollAnimationWrapper>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Thousands</h2>
              <p className="text-xl opacity-90">Our numbers speak for our commitment to excellence</p>
            </div>
          </ScrollAnimationWrapper>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <ScrollAnimationWrapper key={index} delay={index * 0.1}>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                  <div className="text-lg opacity-90">{stat.label}</div>
                </div>
              </ScrollAnimationWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted">
        <div className="container">
          <ScrollAnimationWrapper>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-muted text-foreground px-4 py-2 rounded-full text-sm font-medium mb-6">
                Our Values
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">What Drives Us Forward</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Our core values guide every decision we make and every feature we build
              </p>
            </div>
          </ScrollAnimationWrapper>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <ScrollAnimationWrapper key={index} delay={index * 0.1}>
                <div className="bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </div>
              </ScrollAnimationWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ScrollAnimationWrapper>
              <div>
                <div className="inline-flex items-center gap-2 bg-muted text-foreground px-4 py-2 rounded-full text-sm font-medium mb-6">
                  Why Choose Mr imot?
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Your Success is Our Priority
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  We've built Mr imot with one goal in mind: making real estate investment simple, transparent, and
                  profitable for everyone involved.
                </p>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollAnimationWrapper>
            <ScrollAnimationWrapper delay={0.2}>
              <div className="relative">
                 <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 rounded-3xl transform rotate-2"></div>
                <div className="relative bg-white p-3 rounded-3xl shadow-2xl">
                  <Image
                    src="/placeholder.svg?height=500&width=600"
                    alt="Happy customers with their new home"
                    width={600}
                    height={500}
                    className="rounded-2xl w-full h-96 object-cover"
                  />
                </div>
              </div>
            </ScrollAnimationWrapper>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="container relative">
          <ScrollAnimationWrapper>
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Find Your Dream Property?</h2>
              <p className="text-xl opacity-90 mb-8">
                Join thousands of satisfied customers who found their perfect home through Mr imot
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl" style={{
                  backgroundColor: 'var(--brand-btn-primary-bg)',
                  color: 'var(--brand-btn-primary-text)'
                }}>
                  Browse Properties
                </button>
                <button className="border-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300" style={{
                  borderColor: '#ffffff',
                  color: '#ffffff',
                  backgroundColor: 'transparent'
                }}>
                  Contact Us
                </button>
              </div>
            </div>
          </ScrollAnimationWrapper>
        </div>
      </section>
    </div>
  )
}
