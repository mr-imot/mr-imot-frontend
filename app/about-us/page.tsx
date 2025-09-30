import Image from "next/image"
import { CheckCircle, Users, Shield, Zap, Heart, Target } from "lucide-react"
import { ScrollAnimationWrapper } from "@/components/scroll-animation-wrapper"
import { AngledSeparator } from "@/components/angled-separator"
import { Button } from "@/components/ui/button"

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
      <section className="relative overflow-hidden bg-gradient-to-br from-[#e8edf0] via-[#f0f4f6] to-[#eaf0f2]">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full">
            <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="about-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#111827" strokeWidth="0.5" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#about-grid)" />
            </svg>
          </div>
        </div>

        <div className="container relative py-20 md:py-32">
          <ScrollAnimationWrapper>
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-[#f3f4f6] text-[#111827] px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Target className="w-4 h-4" />
                Our Story
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-[#111827] mb-6 leading-tight">
                About <span className="text-[#111827]">Mr imot</span>
              </h1>
              <p className="text-xl text-[#374151] leading-relaxed">
                Connecting you directly with the future of real estate through innovation, transparency, and trust.
              </p>
            </div>
          </ScrollAnimationWrapper>
        </div>
        <AngledSeparator />
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <ScrollAnimationWrapper>
              <div>
                <div className="inline-flex items-center gap-2 bg-[#f3f4f6] text-[#111827] px-3 py-1 rounded-full text-sm font-medium mb-4">
                  Mission
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#111827] mb-6">
                  Revolutionizing Real Estate
                </h2>
                <p className="text-lg text-[#374151] leading-relaxed mb-6">
                  At Mr imot, our mission is to revolutionize the real estate market by creating a transparent and direct
                  connection between property buyers and real estate developers. We believe in cutting out unnecessary
                  intermediaries, reducing costs, and providing direct access to verified, under-construction projects.
                </p>
                <p className="text-lg text-[#374151] leading-relaxed">
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
                    src="https://ik.imagekit.io/ts59gf2ul/about-us/revolutionizing-real-estate-mr-imot.png?updatedAt=1759254011823"
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
                    src="https://ik.imagekit.io/ts59gf2ul/about-us/building-tomorrows-marketplace-mr-imot.png?updatedAt=1759254011857"
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
                <div className="inline-flex items-center gap-2 bg-[#f3f4f6] text-[#111827] px-3 py-1 rounded-full text-sm font-medium mb-4">
                  Vision
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#111827] mb-6">
                  Building Tomorrow's Marketplace
                </h2>
                <p className="text-lg text-[#374151] leading-relaxed mb-6">
                  We envision a world where finding and investing in new real estate is simple, direct, and trustworthy.
                  Mr imot aims to be the go-to platform for anyone seeking new construction properties and for developers
                  looking to list their projects with confidence and ease.
                </p>
                <p className="text-lg text-[#374151] leading-relaxed">
                  We are committed to fostering a community where quality projects meet genuine demand, creating value
                  for everyone involved.
                </p>
              </div>
            </ScrollAnimationWrapper>
          </div>
        </div>
      </section>


      {/* Values Section */}
      <section className="py-20 bg-gradient-to-br from-[#f0f4f6] to-[#e8edf0]">
        <div className="container">
          <ScrollAnimationWrapper>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-[#f3f4f6] text-[#111827] px-4 py-2 rounded-full text-sm font-medium mb-6">
                Our Values
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#111827] mb-4">What Drives Us Forward</h2>
              <p className="text-xl text-[#374151] max-w-3xl mx-auto">
                Our core values guide every decision we make and every feature we build
              </p>
            </div>
          </ScrollAnimationWrapper>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <ScrollAnimationWrapper key={index} delay={index * 0.1}>
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group h-full flex flex-col border border-[#e5e7eb]">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#111827] to-[#1f2937] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#111827] mb-4">{value.title}</h3>
                  <p className="text-[#374151] leading-relaxed flex-grow">{value.description}</p>
                </div>
              </ScrollAnimationWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ScrollAnimationWrapper>
              <div>
                <div className="inline-flex items-center gap-2 bg-[#f3f4f6] text-[#111827] px-4 py-2 rounded-full text-sm font-medium mb-6">
                  Why Choose Mr imot?
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#111827] mb-6">
                  Your Success is Our Priority
                </h2>
                <p className="text-lg text-[#374151] leading-relaxed mb-8">
                  We've built Mr imot with one goal in mind: making real estate investment simple, transparent, and
                  profitable for everyone involved.
                </p>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-[#111827] flex-shrink-0 mt-0.5" />
                      <span className="text-[#374151]">{benefit}</span>
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
                    src="https://ik.imagekit.io/ts59gf2ul/about-us/couple-mr-imot-success.png?updatedAt=1759254011838"
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
      <section className="py-20 bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#111827] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full">
            <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="cta-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.3" />
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
                Join thousands of satisfied customers who found their perfect home through Mr imot
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-[#111827] hover:bg-gray-100 font-semibold">
                  <a href="/listings">Browse Properties</a>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-[#111827] font-semibold">
                  <a href="/contact">Contact Us</a>
                </Button>
              </div>
            </div>
          </ScrollAnimationWrapper>
        </div>
      </section>
    </div>
  )
}
