import cardStyles from "@/components/ui/card.module.css"
import typographyStyles from "@/components/typography.module.css"
import effectsStyles from "@/components/effects.module.css"

interface ThreeStepProcessSectionProps {
  dict: any
  lang: string
}

export function ThreeStepProcessSection({ dict, lang }: ThreeStepProcessSectionProps) {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20 md:py-24 lg:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20 lg:mb-24">
          <div className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-8 uppercase tracking-wide border-2 bg-charcoal-500 text-white border-charcoal-600" dangerouslySetInnerHTML={{ __html: dict.threeSteps.badge }}>
          </div>
          <h2 className={`${typographyStyles.headlineGradient} text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 font-serif`} style={{
            lineHeight: '1.1',
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)'
          }}>
            {dict.threeSteps.heading}
          </h2>
        </div>

        {/* 3-Step Cards with subtle connector line on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 relative">
          <div className="hidden lg:block absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
          
          {/* Step 1 */}
          <div className="group">
            <div className={`${cardStyles.card} p-8 hover:shadow-2xl transition-all duration-500 hover:border-gray-300 group-hover:-translate-y-2`}>
              <div className="text-center">
                {/* Number + Icon Container */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  {/* Number */}
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold text-white bg-charcoal-500">
                    {dict.threeSteps.step1.number}
                  </div>
                  
                  {/* Icon with Liquid Glass Effect */}
                  <div className="relative">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 bg-saffron-500 relative overflow-hidden">
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
                      
                      {/* Original Map SVG */}
                      <svg className="w-10 h-10 text-charcoal-600 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4 font-serif">
                  {dict.threeSteps.step1.label}
                </h3>
                <p className="text-gray-600 leading-relaxed font-sans" style={{
                  fontSize: '16px',
                  lineHeight: '1.6'
                }} dangerouslySetInnerHTML={{ __html: dict.threeSteps.step1.content }}>
                </p>
              </div>
            </div>
          </div>
          
          {/* Step 2 */}
          <div className="group">
            <div className={`${cardStyles.card} p-8 hover:shadow-2xl transition-all duration-500 hover:border-gray-400 group-hover:-translate-y-2`}>
              <div className="text-center">
                {/* Number + Icon Container */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  {/* Number */}
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold text-white bg-charcoal-500">
                    {dict.threeSteps.step2.number}
                  </div>
                  
                  {/* Icon with Liquid Glass Effect */}
                  <div className="relative">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 bg-saffron-500 relative overflow-hidden">
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
                      
                      {/* SVG Icon */}
                      <svg className="w-10 h-10 text-charcoal-600 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1 1 21 9z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4 font-serif">
                  {dict.threeSteps.step2.label}
                </h3>
                <p className="text-gray-600 leading-relaxed font-sans" style={{
                  fontSize: '16px',
                  lineHeight: '1.6'
                }} dangerouslySetInnerHTML={{ __html: dict.threeSteps.step2.content }}>
                </p>
              </div>
            </div>
          </div>
          
          {/* Step 3 */}
          <div className="group">
            <div className={`${cardStyles.card} p-8 hover:shadow-2xl transition-all duration-500 hover:border-gray-400 group-hover:-translate-y-2`}>
              <div className="text-center">
                {/* Number + Icon Container */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  {/* Number */}
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold text-white bg-charcoal-500">
                    {dict.threeSteps.step3.number}
                  </div>
                  
                  {/* Icon with Liquid Glass Effect */}
                  <div className="relative">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 bg-saffron-500 relative overflow-hidden">
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
                      
                      {/* SVG Icon */}
                      <svg className="w-10 h-10 text-charcoal-600 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4 font-serif">
                  {dict.threeSteps.step3.label}
                </h3>
                <p className="text-gray-600 leading-relaxed font-sans" style={{
                  fontSize: '16px',
                  lineHeight: '1.6'
                }} dangerouslySetInnerHTML={{ __html: dict.threeSteps.step3.content }}>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="text-center mt-16 sm:mt-20 md:mt-24 lg:mt-28">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-serif" style={{
              lineHeight: '1.2',
              letterSpacing: '-0.02em'
            }}>
              {dict.threeSteps.mvp.heading}
            </h3>
            
            <div className="flex justify-center">
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-4 sm:flex sm:flex-row sm:items-center sm:gap-8">
                <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <span className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
                  {dict.threeSteps.mvp.benefits.fast}
                </span>
                
                <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <span className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
                  {dict.threeSteps.mvp.benefits.easy}
                </span>
                
                <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <span className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
                  {dict.threeSteps.mvp.benefits.free}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

