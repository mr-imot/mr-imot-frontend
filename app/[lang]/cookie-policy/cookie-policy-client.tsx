"use client"

interface CookiePolicyClientProps {
  dict: any
  lang: 'en' | 'bg'
}

export default function CookiePolicyClient({ dict, lang }: CookiePolicyClientProps) {
  const c = dict.policies?.cookie

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-lg shadow-sm p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-amber-600 border-b-4 border-amber-600 pb-3">
            {c?.title || '🍪 Cookie Policy'}
          </h1>
          
          <div className="bg-muted rounded-md p-3 mb-6 font-semibold">
            {c?.effectiveDate || 'Effective Date: January 30, 2025'}
          </div>

          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {c?.whatAreCookies || 'What Are Cookies?'}
              </h2>
              <p>
                {c?.cookiesDescription || 'Cookies are small text files that are stored on your device when you visit a website. They help websites remember your preferences and improve your browsing experience.'}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {c?.howWeUseCookies || 'How We Use Cookies'}
              </h2>
              
              <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-md border-l-4 border-amber-500 mb-4">
                <h3 className="font-semibold mb-2">
                  {c?.essentialCookies || 'Essential Cookies'}
                </h3>
                <p className="mb-2">
                  {c?.weMayUse || 'We may use essential cookies for:'}
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>{c?.basicFunctionality || 'Basic website functionality'}</li>
                  <li>{c?.security || 'Security and fraud prevention'}</li>
                  <li>{c?.sessionManagement || 'Session management for logged-in users'}</li>
                </ul>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-md border-l-4 border-amber-500 mb-4">
                <h3 className="font-semibold mb-2">
                  {c?.analyticsCookies || 'Analytics Cookies (If Implemented)'}
                </h3>
                <p className="mb-2">
                  {c?.analyticsDescription || 'We may use analytics cookies to:'}
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>{c?.understandUsage || 'Understand how visitors use our website'}</li>
                  <li>{c?.improvePerformance || 'Improve website performance'}</li>
                  <li>{c?.monitorErrors || 'Monitor for errors and issues'}</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {c?.managingCookies || 'Managing Cookies'}
              </h2>
              <p className="mb-2">
                {c?.controlThroughBrowser || 'You can control cookies through your browser settings:'}
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>{c?.browsersAllow || 'Most browsers allow you to refuse cookies or delete existing cookies'}</li>
                <li>{c?.findSettings || 'You can usually find cookie settings in your browser\'s "Settings" or "Preferences" menu'}</li>
                <li>{c?.disablingAffects || 'Note that disabling cookies may affect website functionality'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {c?.thirdPartyCookies || 'Third-Party Cookies'}
              </h2>
              <p>
                {c?.noThirdParty || 'We do not currently use third-party cookies for advertising or tracking. If this changes in the future, we will update this policy.'}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {c?.updates || 'Updates to This Policy'}
              </h2>
              <p>
                {c?.mayBeUpdated || 'This Cookie Policy may be updated from time to time. Any changes will be posted on this page with an updated effective date.'}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {c?.contactUs || 'Contact Us'}
              </h2>
              <p>
                {c?.questions || 'If you have questions about our Cookie Policy, please contact us at:'}{' '}
                <strong>privacy@mrlmot.com</strong>
              </p>
            </section>

            <div className="text-center mt-8 pt-6 border-t text-muted-foreground">
              <p>{c?.copyright || '© 2025 Mister Imot. All rights reserved.'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
