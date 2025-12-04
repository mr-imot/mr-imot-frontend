"use client"

interface PrivacyPolicyClientProps {
  dict: any
  lang: 'en' | 'bg'
}

export default function PrivacyPolicyClient({ dict, lang }: PrivacyPolicyClientProps) {
  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-lg shadow-sm p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-emerald-600 border-b-3 border-emerald-600 pb-3">
            {lang === 'bg' ? '🔒 Политика за Поверителност' : '🔒 Privacy Policy'}
          </h1>
          
          <div className="bg-muted rounded-md p-3 mb-6 font-semibold">
            {lang === 'bg' ? 'Дата на влизане в сила: 30 януари 2025' : 'Effective Date: January 30, 2025'}
          </div>

          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {lang === 'bg' ? '1. Данни, които събираме' : '1. Data We Collect'}
              </h2>
              
              <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-md border-l-4 border-emerald-600 mb-4">
                <h3 className="font-semibold mb-2">
                  {lang === 'bg' ? 'От всички посетители:' : 'From All Visitors:'}
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    <strong>{lang === 'bg' ? 'Бисквитки' : 'Cookies'}</strong> {lang === 'bg' 
                      ? '(ако са приложими): използват се за откриване на ботове, ограничаване на злоупотреба и мониторинг на производителността.'
                      : '(if applicable): used to detect bots, limit abuse, and monitor performance.'}
                  </li>
                  <li>
                    {lang === 'bg' 
                      ? 'Бисквитките могат да бъдат изчистени ръчно в браузъра ви.'
                      : 'Cookies can be cleared manually in your browser.'}
                  </li>
                </ul>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-md border-l-4 border-emerald-600 mb-4">
                <h3 className="font-semibold mb-2">
                  {lang === 'bg' ? 'От регистрирани строители:' : 'From Registered Developers:'}
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>{lang === 'bg' ? 'Име на компанията' : 'Company Name'}</li>
                  <li>{lang === 'bg' ? 'Лице за контакт' : 'Contact Person'}</li>
                  <li>{lang === 'bg' ? 'Имейл адрес' : 'Email Address'}</li>
                  <li>{lang === 'bg' ? 'Телефонен номер' : 'Phone Number'}</li>
                  <li>
                    {lang === 'bg' 
                      ? 'Парола (хеширана, не се съхранява като обикновен текст)'
                      : 'Password (hashed, not stored in plain text)'}
                  </li>
                  <li>{lang === 'bg' ? 'URL на уебсайт (по избор)' : 'Website URL (optional)'}</li>
                  <li>{lang === 'bg' ? 'Адрес на офис (по избор)' : 'Office Address (optional)'}</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {lang === 'bg' ? '2. Защо събираме тези данни' : '2. Why We Collect This Data'}
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  {lang === 'bg' 
                    ? 'За да верифицираме и валидираме компании за недвижими имоти'
                    : 'To verify and validate real estate development companies'}
                </li>
                <li>
                  {lang === 'bg' 
                    ? 'За да позволим на строителите да управляват своите обяви'
                    : 'To enable developers to manage their listings'}
                </li>
                <li>
                  {lang === 'bg' 
                    ? 'За да позволим контакт между строители и посетители на платформата'
                    : 'To allow contact between developers and platform visitors'}
                </li>
                <li>
                  {lang === 'bg' 
                    ? 'За да предотвратим злоупотреба или неправилно използване на платформата'
                    : 'To prevent abuse or misuse of the platform'}
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {lang === 'bg' ? '3. Как се съхраняват данните' : '3. How Data Is Stored'}
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  {lang === 'bg' 
                    ? 'Паролите се хешират с помощта на стандартни най-добри практики'
                    : 'Passwords are hashed using standard best practices'}
                </li>
                <li>
                  {lang === 'bg' ? 'Данните на строителите се съхраняват до:' : 'Developer data is stored until:'}
                  <ul className="list-disc list-inside space-y-1 ml-6 mt-2">
                    <li>
                      {lang === 'bg' 
                        ? 'Изтрити от потребителя чрез таблото за управление или'
                        : 'Deleted by the user via dashboard or'}
                    </li>
                    <li>
                      {lang === 'bg' 
                        ? 'Заявени чрез имейл + потвърждение по телефон или'
                        : 'Requested via email + phone confirmation or'}
                    </li>
                    <li>
                      {lang === 'bg' 
                        ? 'Изтрити случайно или по наше усмотрение'
                        : 'Deleted accidentally or at our discretion'}
                    </li>
                  </ul>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {lang === 'bg' ? '4. Достъп до данни и изтриване' : '4. Data Access and Deletion'}
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  {lang === 'bg' 
                    ? 'Строителите могат да променят повечето данни чрез таблото за управление'
                    : 'Developers can modify most data via the dashboard'}
                </li>
                <li>
                  {lang === 'bg' 
                    ? 'Заявки за изтриване могат да бъдат изпратени чрез имейл и ще бъдат потвърдени по телефон'
                    : 'Deletion requests can be sent via email and will be verified via phone'}
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {lang === 'bg' ? '5. Без споделяне или продажба' : '5. No Sharing or Selling'}
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  {lang === 'bg' 
                    ? 'Ние не продаваме, не отдаваме под наем или споделяме вашите данни с трети страни.'
                    : 'We do not sell, rent, or share your data with third parties.'}
                </li>
                <li>
                  {lang === 'bg' 
                    ? 'Всички данни се използват строго за работата на платформата.'
                    : 'All data is used strictly for platform operation.'}
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {lang === 'bg' ? '6. Правна основа (GDPR)' : '6. Legal Basis (GDPR)'}
              </h2>
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-md border-l-4 border-blue-600 mb-4">
                <p className="mb-3">
                  {lang === 'bg' 
                    ? 'Съгласно GDPR (закон на ЕС), нашата правна основа за обработка на вашите данни е законен интерес (за работа на платформата) и съгласие на потребителя (при регистрация и приемане на условията).'
                    : 'Under GDPR (EU law), our legal basis for processing your data is legitimate interest (to run the platform) and user consent (when registering and accepting terms).'}
                </p>
                
                <p className="font-semibold mb-2">
                  {lang === 'bg' ? 'Имате правото да:' : 'You have the right to:'}
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    {lang === 'bg' 
                      ? 'Достъп до вашите лични данни'
                      : 'Access your personal data'}
                  </li>
                  <li>
                    {lang === 'bg' 
                      ? 'Заявка за корекция или изтриване'
                      : 'Request correction or deletion'}
                  </li>
                  <li>
                    {lang === 'bg' 
                      ? 'Оттегляне на съгласието по всяко време'
                      : 'Withdraw consent at any time'}
                  </li>
                </ul>
              </div>
            </section>

            <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-md text-center mt-8">
              <h3 className="font-semibold mb-2">
                {lang === 'bg' ? 'Свържете се с нас:' : 'Contact Us:'}
              </h3>
              <p>
                <strong>{lang === 'bg' ? 'Имейл:' : 'Email:'}</strong> support@mrlmot.com
              </p>
              <p>
                <strong>
                  {lang === 'bg' 
                    ? 'Заявки за защита на данни:'
                    : 'Data Protection Inquiries:'}
                </strong> support@mrlmot.com
              </p>
            </div>

            <div className="text-center mt-8 pt-6 border-t text-muted-foreground">
              <p>
                {lang === 'bg' 
                  ? '© 2025 Мистър Имот. Всички права запазени.'
                  : '© 2025 Mister Imot. All rights reserved.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

