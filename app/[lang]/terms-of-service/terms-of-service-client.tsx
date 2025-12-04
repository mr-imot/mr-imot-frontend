"use client"

interface TermsOfServiceClientProps {
  dict: any
  lang: 'en' | 'bg'
}

export default function TermsOfServiceClient({ dict, lang }: TermsOfServiceClientProps) {
  const t = dict.policies?.terms

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-lg shadow-sm p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-blue-600 border-b-4 border-blue-600 pb-3">
            {t?.title || '📜 Terms of Service'}
          </h1>
          
          <div className="bg-muted rounded-md p-3 mb-6 font-semibold">
            {t?.effectiveDate || 'Effective Date: January 30, 2025'}
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-md border-l-4 border-yellow-500 mb-6">
            <strong>{t?.projectOwner || 'Project Owner:'}</strong>{' '}
            {t?.projectOwnerDescription || 'This platform is a personal MVP project developed and maintained by an individual (referred to as "we", "us", "our").'}
          </div>

          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {t?.platformPurpose || '1. Platform Purpose'}
              </h2>
              <p>
                {t?.platformPurposeDescription || 'This platform is an experimental MVP built for showcasing and testing the concept of a real estate developer directory. No payments are collected. The platform may be modified, shut down, or abandoned at any time without notice.'}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {t?.noResponsibility || '2. No Responsibility for Transactions'}
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  {t?.provideSpace || 'We provide a space for developers to list their new construction projects.'}
                </li>
                <li>
                  {t?.noIntermediary || 'We do not act as an intermediary, agent, or broker and take no responsibility for the accuracy of listings, communications between users, or any transactions or agreements made outside the platform.'}
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {t?.eligibility || '3. Eligibility'}
              </h2>
              <p>
                {t?.byRegistering || 'By registering, you confirm that you are either:'}
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2 mt-2">
                <li>
                  {t?.representative || 'A representative of a real estate development company, or'}
                </li>
                <li>
                  {t?.authorized || 'Authorized to provide information on behalf of such a company.'}
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {t?.accountVerification || '4. Account Verification'}
              </h2>
              <p>
                {t?.manualVerification || 'We perform manual verification (via phone or in person) to ensure that listed companies are legitimate real estate developers.'}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {t?.useOfPlatform || '5. Use of Platform'}
              </h2>
              <p>
                {t?.youAgree || 'You agree to:'}
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2 mt-2">
                <li>{t?.provideAccurate || 'Provide accurate information'}</li>
                <li>{t?.useInAccordance || 'Use the platform in accordance with applicable laws'}</li>
                <li>{t?.refrainFromAbuse || 'Refrain from abuse, spam, or unauthorized automation'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {t?.termination || '6. Termination'}
              </h2>
              <p>
                {t?.reserveRight || 'We reserve the right to suspend or delete any account without notice, especially in case of:'}
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2 mt-2">
                <li>{t?.fraudulentInfo || 'Fraudulent or misleading information'}</li>
                <li>{t?.abuseOfSystem || 'Abuse of the system'}</li>
                <li>{t?.nonCompliance || 'Non-compliance with these terms'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {t?.limitationOfLiability || '7. Limitation of Liability'}
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  {t?.noWarranties || 'We make no warranties about the accuracy, completeness, or reliability of the content or listings.'}
                </li>
                <li>
                  {t?.notLiable || 'We are not liable for any losses, damages, or disputes arising from the use of this platform.'}
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {t?.modifications || '8. Modifications'}
              </h2>
              <p>
                {t?.mayBeUpdated || 'These Terms may be updated at any time. Continued use of the platform implies acceptance of the current Terms.'}
              </p>
            </section>

            <div className="text-center mt-8 pt-6 border-t text-muted-foreground">
              <p>{t?.copyright || '© 2025 Mister Imot. All rights reserved. | Part of Prodigy Corp'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
