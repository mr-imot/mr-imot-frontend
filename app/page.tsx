"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Shield,
  UserX,
  Clock,
  ExternalLink,
  Search,
  Phone,
  CheckCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { EtchedGlassBackground } from "@/components/etched-glass-background"

export default function HomePage() {

  return (
    <div className="min-h-screen relative">
      {/* Etched Glass Background */}
      <EtchedGlassBackground />
      
      {/* Hero Section */}
      <section className="py-16 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div
                  className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100/90 backdrop-blur-sm mb-4 relative border border-gray-200"
                >
                  <span className="text-gray-700 text-xs font-medium relative z-10">✨ New Mr. Imot Experience</span>
                </div>

                <h1 className="text-5xl md:text-6xl md:leading-16 tracking-tight font-light text-gray-900 mb-4 drop-shadow-sm">
                  <span className="font-medium italic instrument">Real</span> Estate
                  <br />
                  <span className="font-light tracking-tight text-gray-900">Directly from Developers</span>
                </h1>
                <p className="text-sm font-medium text-gray-800 mb-4 leading-relaxed drop-shadow-sm">
                  No brokers, no commissions.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-4 flex-wrap">
                <Link href="/listings">
                  <button className="px-8 py-3 rounded-full bg-transparent border-2 border-gray-700 text-gray-900 font-semibold text-sm transition-all duration-200 hover:bg-gray-900 hover:text-white shadow-lg hover:shadow-xl cursor-pointer">
                    Browse Properties
                  </button>
                </Link>
                <Link href="/register?type=developer">
                  <button className="px-8 py-3 rounded-full bg-gray-900 text-white font-semibold text-sm transition-all duration-200 hover:bg-gray-800 shadow-lg hover:shadow-xl cursor-pointer">
                    List Your Project
                  </button>
                </Link>
              </div>
            </div>

            {/* Right Column - Empty for background visibility */}
            <div className="hidden lg:block">
              {/* This space allows the EtchedGlassBackground to be clearly visible */}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative overflow-hidden" style={{backgroundColor: '#F5F2ED', paddingTop: '100px', paddingBottom: '100px'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 40px'}}>
          {/* Section Header */}
          <div className="text-center" style={{marginBottom: '80px'}}>
            <div className="inline-block px-4 py-2 bg-gray-200 rounded-full text-gray-600 text-sm font-medium mb-8 uppercase tracking-wide">
              A 3-STEP PROCESS
            </div>
            <h2 style={{
              fontSize: '56px', 
              fontWeight: '400', 
              color: '#2D3748', 
              marginBottom: '0px', 
              lineHeight: '1.1',
              fontFamily: 'serif',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              Connect directly with developers<br />and secure your dream property
            </h2>
          </div>

          {/* Steps Grid */}
          <div className="relative" style={{
            display: 'flex',
            alignItems: 'stretch',
            gap: '32px',
            justifyContent: 'center'
          }}>
            
            {/* Step 1 */}
            <div className="relative" style={{position: 'relative', flex: '0 0 300px'}}>
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                padding: '32px 24px',
                position: 'relative',
                height: '280px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Number */}
                <div style={{
                  fontSize: '48px',
                  fontWeight: '600',
                  color: '#FF8C42',
                  lineHeight: '1',
                  marginBottom: '12px'
                }}>
                  01
                </div>
                
                {/* Label */}
                <div style={{
                  fontSize: '11px',
                  color: '#718096',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '16px'
                }}>
                  BROWSE VERIFIED PROJECTS
                </div>
                
                {/* Content */}
                <div style={{
                  fontSize: '16px',
                  color: '#2D3748',
                  lineHeight: '1.4',
                  fontWeight: '600',
                  flex: 1
                }}>
                  Explore <span style={{color: '#FF8C42', fontWeight: '600'}}>verified</span><br />
                  new construction<br />
                  projects from <span style={{color: '#FF8C42', fontWeight: '600'}}>trusted</span><br />
                  developers.
                </div>
              </div>
              
              {/* Arrow */}
              <div style={{
                position: 'absolute',
                right: '-24px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                width: '48px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
                  <path d="M1 6L23 6M23 6L18 1M23 6L18 11" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative" style={{position: 'relative', flex: '0 0 300px'}}>
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                padding: '32px 24px',
                position: 'relative',
                height: '280px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Number */}
                <div style={{
                  fontSize: '48px',
                  fontWeight: '600',
                  color: '#F7B801',
                  lineHeight: '1',
                  marginBottom: '12px'
                }}>
                  02
                </div>
                
                {/* Label */}
                <div style={{
                  fontSize: '11px',
                  color: '#718096',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '16px'
                }}>
                  CONNECT DIRECTLY
                </div>
                
                {/* Content */}
                <div style={{
                  fontSize: '16px',
                  color: '#2D3748',
                  lineHeight: '1.4',
                  fontWeight: '600',
                  flex: 1
                }}>
                  Contact developers<br />
                  directly for transparent<br />
                  conversations and<br />
                  <span style={{color: '#F7B801', fontWeight: '600'}}>schedule site visits</span><br />
                  at your convenience.
                </div>
              </div>
              
              {/* Arrow */}
              <div style={{
                position: 'absolute',
                right: '-24px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                width: '48px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
                  <path d="M1 6L23 6M23 6L18 1M23 6L18 11" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative" style={{flex: '0 0 300px'}}>
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                padding: '32px 24px',
                position: 'relative',
                height: '280px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Number */}
                <div style={{
                  fontSize: '48px',
                  fontWeight: '600',
                  color: '#10B981',
                  lineHeight: '1',
                  marginBottom: '12px'
                }}>
                  03
                </div>
                
                {/* Label */}
                <div style={{
                  fontSize: '11px',
                  color: '#718096',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '16px'
                }}>
                  SAVE & SECURE
                </div>
                
                {/* Content */}
                <div style={{
                  fontSize: '16px',
                  color: '#2D3748',
                  lineHeight: '1.4',
                  fontWeight: '600',
                  flex: 1
                }}>
                  Save <span style={{color: '#10B981', fontWeight: '600'}}>3-5% in broker<br />
                  fees</span> and get access<br />
                  to pre-launch prices<br />
                  for new developments.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Mr. Imot
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Direct access to new construction projects. No brokers, no commissions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center group">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <UserX className="w-10 h-10 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">Skip the Middleman</h3>
              <p className="text-muted-foreground leading-relaxed">
                Connect directly with developers. Save 3-5% in broker fees on every purchase.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-10 h-10 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">100% Verified</h3>
              <p className="text-muted-foreground leading-relaxed">
                Every listing is personally verified. Zero risk of scams or misleading listings.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-10 h-10 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">Get There First</h3>
              <p className="text-muted-foreground leading-relaxed">
                Access new projects before the market. Up to 15% better prices than launch.
              </p>
            </div>
          </div>

          {/* Single CTA */}
          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/listings">
                Browse All Properties
                <ExternalLink className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}