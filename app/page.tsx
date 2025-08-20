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
      <section className="relative overflow-hidden py-24" style={{backgroundColor: 'var(--brand-glass-light)'}}>
        <div className="max-w-6xl mx-auto px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-8 uppercase tracking-wide border" style={{
              backgroundColor: 'var(--brand-badge-bg)',
              color: 'var(--brand-badge-text)',
              borderColor: 'var(--brand-badge-border)'
            }}>
              A 3-STEP PROCESS
            </div>
            <h2 className="text-4xl md:text-5xl font-light max-w-4xl mx-auto leading-tight" style={{
              color: 'var(--brand-text-primary)',
              fontFamily: 'var(--font-instrument-serif)'
            }}>
              Connect directly with developers<br />and secure your dream property
            </h2>
          </div>

          {/* Steps Grid */}
          <div className="flex items-stretch gap-8 justify-center flex-wrap">
            
            {/* Step 1 */}
            <div className="relative flex-none w-80">
              <div className="p-8 relative h-72 flex flex-col rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl border" style={{
                backgroundColor: '#ffffff',
                borderColor: 'var(--brand-gray-200)'
              }}>
                {/* Number */}
                <div className="text-5xl font-semibold mb-3 leading-none" style={{
                  color: 'var(--brand-btn-primary-bg)'
                }}>
                  01
                </div>
                
                {/* Label */}
                <div className="text-xs font-medium uppercase tracking-wider mb-4" style={{
                  color: 'var(--brand-text-muted)'
                }}>
                  BROWSE VERIFIED PROJECTS
                </div>
                
                {/* Content */}
                <div className="text-base leading-relaxed font-medium flex-1" style={{
                  color: 'var(--brand-text-primary)'
                }}>
                  Explore <span style={{color: 'var(--brand-btn-primary-bg)', fontWeight: '600'}}>verified</span><br />
                  new construction<br />
                  projects from <span style={{color: 'var(--brand-btn-primary-bg)', fontWeight: '600'}}>trusted</span><br />
                  developers.
                </div>
              </div>
              
              {/* Arrow */}
              <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 z-10 w-12 h-6 flex items-center justify-center">
                <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
                  <path d="M1 6L23 6M23 6L18 1M23 6L18 11" stroke="var(--brand-gray-400)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex-none w-80">
              <div className="p-8 relative h-72 flex flex-col rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl border" style={{
                backgroundColor: '#ffffff',
                borderColor: 'var(--brand-gray-200)'
              }}>
                {/* Number */}
                <div className="text-5xl font-semibold mb-3 leading-none" style={{
                  color: 'var(--brand-warning)'
                }}>
                  02
                </div>
                
                {/* Label */}
                <div className="text-xs font-medium uppercase tracking-wider mb-4" style={{
                  color: 'var(--brand-text-muted)'
                }}>
                  CONNECT DIRECTLY
                </div>
                
                {/* Content */}
                <div className="text-base leading-relaxed font-medium flex-1" style={{
                  color: 'var(--brand-text-primary)'
                }}>
                  Contact developers<br />
                  directly for transparent<br />
                  conversations and<br />
                  <span style={{color: 'var(--brand-warning)', fontWeight: '600'}}>schedule site visits</span><br />
                  at your convenience.
                </div>
              </div>
              
              {/* Arrow */}
              <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 z-10 w-12 h-6 flex items-center justify-center">
                <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
                  <path d="M1 6L23 6M23 6L18 1M23 6L18 11" stroke="var(--brand-gray-400)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex-none w-80">
              <div className="p-8 relative h-72 flex flex-col rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl border" style={{
                backgroundColor: '#ffffff',
                borderColor: 'var(--brand-gray-200)'
              }}>
                {/* Number */}
                <div className="text-5xl font-semibold mb-3 leading-none" style={{
                  color: 'var(--brand-success)'
                }}>
                  03
                </div>
                
                {/* Label */}
                <div className="text-xs font-medium uppercase tracking-wider mb-4" style={{
                  color: 'var(--brand-text-muted)'
                }}>
                  SAVE & SECURE
                </div>
                
                {/* Content */}
                <div className="text-base leading-relaxed font-medium flex-1" style={{
                  color: 'var(--brand-text-primary)'
                }}>
                  Save <span style={{color: 'var(--brand-success)', fontWeight: '600'}}>3-5% in broker<br />
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
      <section className="py-16 md:py-24" style={{backgroundColor: 'var(--brand-glass-primary)'}}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{color: 'var(--brand-text-primary)'}}>
              Why Choose Mr. Imot
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{color: 'var(--brand-text-secondary)'}}>
              Direct access to new construction projects. No brokers, no commissions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center group">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform" style={{backgroundColor: 'var(--brand-btn-primary-bg)'}}>
                <UserX className="w-10 h-10" style={{color: 'var(--brand-btn-primary-text)'}} />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{color: 'var(--brand-text-primary)'}}>Skip the Middleman</h3>
              <p className="leading-relaxed" style={{color: 'var(--brand-text-secondary)'}}>
                Connect directly with developers. Save 3-5% in broker fees on every purchase.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform" style={{backgroundColor: 'var(--brand-btn-primary-bg)'}}>
                <Shield className="w-10 h-10" style={{color: 'var(--brand-btn-primary-text)'}} />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{color: 'var(--brand-text-primary)'}}>100% Verified</h3>
              <p className="leading-relaxed" style={{color: 'var(--brand-text-secondary)'}}>
                Every listing is personally verified. Zero risk of scams or misleading listings.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform" style={{backgroundColor: 'var(--brand-btn-primary-bg)'}}>
                <Clock className="w-10 h-10" style={{color: 'var(--brand-btn-primary-text)'}} />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{color: 'var(--brand-text-primary)'}}>Get There First</h3>
              <p className="leading-relaxed" style={{color: 'var(--brand-text-secondary)'}}>
                Access new projects before the market. Up to 15% better prices than launch.
              </p>
            </div>
          </div>

          {/* Single CTA */}
          <div className="text-center mt-12">
            <button className="px-8 py-3 rounded-full font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center" style={{
              backgroundColor: 'var(--brand-btn-primary-bg)',
              color: 'var(--brand-btn-primary-text)'
            }}>
              <Link href="/listings" className="flex items-center">
                Browse All Properties
                <ExternalLink className="ml-2 w-4 h-4" />
              </Link>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}