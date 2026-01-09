"use client"

interface PrivacyPolicyClientProps {
  dict: any
  lang: 'en' | 'bg'
}

export default function PrivacyPolicyClient({ dict, lang }: PrivacyPolicyClientProps) {
  const p = dict.policies?.privacy

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-lg shadow-sm p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-emerald-600 border-b-4 border-emerald-600 pb-3">
            {p?.title || '🔒 Privacy Policy'}
          </h1>
          
          <div className="bg-muted rounded-md p-3 mb-6 font-semibold">
            {p?.effectiveDate || 'Effective Date: January 30, 2025'}
          </div>

          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {p?.dataWeCollect || '1. Data We Collect'}
              </h2>
              
              <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-md border-l-4 border-emerald-600 mb-4">
                <h3 className="font-semibold mb-2">
                  {p?.fromAllVisitors || 'From All Visitors:'}
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    <strong>{p?.cookies || 'Cookies'}</strong> {p?.cookiesDescription || '(if applicable): used to detect bots, limit abuse, and monitor performance.'}
                  </li>
                  <li>
                    {p?.cookiesCanBeCleared || 'Cookies can be cleared manually in your browser.'}
                  </li>
                </ul>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-md border-l-4 border-emerald-600 mb-4">
                <h3 className="font-semibold mb-2">
                  {p?.fromRegisteredDevelopers || 'From Registered Developers:'}
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>{p?.companyName || 'Company Name'}</li>
                  <li>{p?.contactPerson || 'Contact Person'}</li>
                  <li>{p?.emailAddress || 'Email Address'}</li>
                  <li>{p?.phoneNumber || 'Phone Number'}</li>
                  <li>{p?.password || 'Password (hashed, not stored in plain text)'}</li>
                  <li>{p?.websiteUrl || 'Website URL (optional)'}</li>
                  <li>{p?.officeAddress || 'Office Address (optional)'}</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {p?.whyWeCollect || '2. Why We Collect This Data'}
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>{p?.verifyCompanies || 'To verify and validate real estate development companies'}</li>
                <li>{p?.enableManagement || 'To enable developers to manage their listings'}</li>
                <li>{p?.allowContact || 'To allow contact between developers and platform visitors'}</li>
                <li>{p?.preventAbuse || 'To prevent abuse or misuse of the platform'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {p?.howDataStored || '3. How Data Is Stored'}
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>{p?.passwordsHashed || 'Passwords are hashed using standard best practices'}</li>
                <li>
                  {p?.developerDataStored || 'Developer data is stored until:'}
                  <ul className="list-disc list-inside space-y-1 ml-6 mt-2">
                    <li>{p?.deletedByUser || 'Deleted by the user via dashboard or'}</li>
                    <li>{p?.requestedViaEmail || 'Requested via email + phone confirmation or'}</li>
                    <li>{p?.deletedAccidentally || 'Deleted accidentally or at our discretion'}</li>
                  </ul>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {p?.dataAccess || '4. Data Access and Deletion'}
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>{p?.modifyData || 'Developers can modify most data via the dashboard'}</li>
                <li>{p?.deletionRequests || 'Deletion requests can be sent via email and will be verified via phone'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {p?.noSharing || '5. No Sharing or Selling'}
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>{p?.noSelling || 'We do not sell, rent, or share your data with third parties.'}</li>
                <li>{p?.strictUse || 'All data is used strictly for platform operation.'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {p?.legalBasis || '6. Legal Basis (GDPR)'}
              </h2>
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-md border-l-4 border-blue-600 mb-4">
                <p className="mb-3">
                  {p?.gdprDescription || 'Under GDPR (EU law), our legal basis for processing your data is legitimate interest (to run the platform) and user consent (when registering and accepting terms).'}
                </p>
                
                <p className="font-semibold mb-2">
                  {p?.youHaveRight || 'You have the right to:'}
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>{p?.accessData || 'Access your personal data'}</li>
                  <li>{p?.requestCorrection || 'Request correction or deletion'}</li>
                  <li>{p?.withdrawConsent || 'Withdraw consent at any time'}</li>
                </ul>
              </div>
            </section>

            <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-md text-center mt-8">
              <h3 className="font-semibold mb-2">
                {p?.contactUs || 'Contact Us:'}
              </h3>
              <p>
                <strong>{p?.email || 'Email:'}</strong> support@mrlmot.com
              </p>
              <p>
                <strong>{p?.dataProtection || 'Data Protection Inquiries:'}</strong> support@mrlmot.com
              </p>
            </div>

            <div className="text-center mt-8 pt-6 border-t text-muted-foreground">
              <p>{p?.copyright || '© 2025 Mister Imot. All rights reserved.'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
