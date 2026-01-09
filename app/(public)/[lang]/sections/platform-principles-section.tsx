import typographyStyles from "@/components/typography.module.css"
import effectsStyles from "@/components/effects.module.css"

interface PlatformPrinciplesSectionProps {
  dict: any
  lang: string
}

export function PlatformPrinciplesSection({ dict, lang }: PlatformPrinciplesSectionProps) {
  return (
    <section
      className="py-16 sm:py-20 md:py-24 lg:py-32 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #e4ecf4 0%, #dae4ef 100%)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20 lg:mb-24">
          <h2 className={`${typographyStyles.headlineGradient} text-4xl sm:text-5xl md:text-6xl lg:mb-6 lg:text-7xl font-bold mb-6 font-serif`} style={{
            lineHeight: '1.1',
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)'
          }}>
             {dict.whatMakesDifferent.heading}
           </h2>
          <p className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-700 max-w-4xl mx-auto leading-relaxed font-sans" style={{
            fontSize: 'clamp(1.25rem, 3vw, 2rem)'
          }}>
             {dict.whatMakesDifferent.subheading}
           </p>
         </div>

        {/* 2x2 Platform Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* Principle 1: Verified Developers */}
          <div className="group">
            <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-300 group-hover:-translate-y-2 h-full">
              <div className="text-center h-full flex flex-col">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 bg-charcoal-500 relative overflow-hidden">
                  {/* Liquid Glass Overlay - GPU-accelerated */}
                  <div className={`absolute inset-0 ${effectsStyles.liquidFlowBgWhite} opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out`} style={{
                    borderRadius: '16px',
                    animation: 'liquidFlow 2s ease-in-out infinite',
                    willChange: 'opacity, transform',
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden'
                  }} />
                  
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                    transform: 'translateX(-100%)',
                    animation: 'shimmer 1.5s ease-in-out infinite'
                  }} />
                  
                  {/* Shield Icon */}
                  <svg className="w-10 h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 font-serif">
                    {dict.whatMakesDifferent.principles.verifiedDevelopers.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed font-sans" style={{
                    fontSize: '16px',
                    lineHeight: '1.6'
                  }}>
                    {dict.whatMakesDifferent.principles.verifiedDevelopers.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Principle 2: No Financial Bias */}
          <div className="group">
            <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-300 group-hover:-translate-y-2 h-full">
              <div className="text-center h-full flex flex-col">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 bg-accent relative overflow-hidden">
                  {/* Liquid Glass Overlay - GPU-accelerated */}
                  <div className={`absolute inset-0 ${effectsStyles.liquidFlowBgWhite} opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out`} style={{
                    borderRadius: '16px',
                    animation: 'liquidFlow 2s ease-in-out infinite',
                    willChange: 'opacity, transform',
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden'
                  }} />
                  
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                    transform: 'translateX(-100%)',
                    animation: 'shimmer 1.5s ease-in-out infinite'
                  }} />
                  
                  {/* Target Icon */}
                  <svg className="w-10 h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 font-serif">
                    {dict.whatMakesDifferent.principles.noFinancialBias.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed font-sans" style={{
                    fontSize: '16px',
                    lineHeight: '1.6'
                  }}>
                    {dict.whatMakesDifferent.principles.noFinancialBias.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Principle 3: Clean Experience */}
          <div className="group">
            <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-300 group-hover:-translate-y-2 h-full">
              <div className="text-center h-full flex flex-col">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 bg-accent relative overflow-hidden">
                  {/* Liquid Glass Overlay - GPU-accelerated */}
                  <div className={`absolute inset-0 ${effectsStyles.liquidFlowBgWhite} opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out`} style={{
                    borderRadius: '16px',
                    animation: 'liquidFlow 2s ease-in-out infinite',
                    willChange: 'opacity, transform',
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden'
                  }} />
                  
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                    transform: 'translateX(-100%)',
                    animation: 'shimmer 1.5s ease-in-out infinite'
                  }} />
                  
                  {/* Sparkles Icon */}
                  <svg className="w-10 h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                  </svg>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 font-serif">
                    {dict.whatMakesDifferent.principles.cleanExperience.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed font-sans" style={{
                    fontSize: '16px',
                    lineHeight: '1.6'
                  }}>
                    {dict.whatMakesDifferent.principles.cleanExperience.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Principle 4: Honest Brokers */}
          <div className="group">
            <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-300 group-hover:-translate-y-2 h-full">
              <div className="text-center h-full flex flex-col">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 bg-charcoal-500 relative overflow-hidden">
                  {/* Liquid Glass Overlay - GPU-accelerated */}
                  <div className={`absolute inset-0 ${effectsStyles.liquidFlowBgWhite} opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out`} style={{
                    borderRadius: '16px',
                    animation: 'liquidFlow 2s ease-in-out infinite',
                    willChange: 'opacity, transform',
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden'
                  }} />
                  
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                    transform: 'translateX(-100%)',
                    animation: 'shimmer 1.5s ease-in-out infinite'
                  }} />
                  
                  {/* Handshake Icon */}
                  <svg className="w-10 h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 font-serif">
                    {dict.whatMakesDifferent.principles.honestBrokers.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed font-sans" style={{
                    fontSize: '16px',
                    lineHeight: '1.6'
                  }}>
                    {dict.whatMakesDifferent.principles.honestBrokers.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
