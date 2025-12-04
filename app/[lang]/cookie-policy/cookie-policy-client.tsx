"use client"

interface CookiePolicyClientProps {
  dict: any
  lang: 'en' | 'bg'
}

export default function CookiePolicyClient({ dict, lang }: CookiePolicyClientProps) {
  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-lg shadow-sm p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-amber-600 border-b-4 border-amber-600 pb-3">
            {lang === 'bg' ? '🍪 Политика за Бисквитки' : '🍪 Cookie Policy'}
          </h1>
          
          <div className="bg-muted rounded-md p-3 mb-6 font-semibold">
            {lang === 'bg' ? 'Дата на влизане в сила: 30 януари 2025' : 'Effective Date: January 30, 2025'}
          </div>

          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {lang === 'bg' ? 'Какво са бисквитките?' : 'What Are Cookies?'}
              </h2>
              <p>
                {lang === 'bg' 
                  ? 'Бисквитките са малки текстови файлове, които се съхраняват на вашето устройство, когато посещавате уебсайт. Те помагат на уебсайтовете да запомнят вашите предпочитания и да подобрят вашето изживяване при сърфиране.'
                  : 'Cookies are small text files that are stored on your device when you visit a website. They help websites remember your preferences and improve your browsing experience.'}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {lang === 'bg' ? 'Как използваме бисквитките' : 'How We Use Cookies'}
              </h2>
              
              <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-md border-l-4 border-amber-500 mb-4">
                <h3 className="font-semibold mb-2">
                  {lang === 'bg' ? 'Основни бисквитки' : 'Essential Cookies'}
                </h3>
                <p className="mb-2">
                  {lang === 'bg' ? 'Може да използваме основни бисквитки за:' : 'We may use essential cookies for:'}
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    {lang === 'bg' 
                      ? 'Основна функционалност на уебсайта'
                      : 'Basic website functionality'}
                  </li>
                  <li>
                    {lang === 'bg' 
                      ? 'Сигурност и предотвратяване на измами'
                      : 'Security and fraud prevention'}
                  </li>
                  <li>
                    {lang === 'bg' 
                      ? 'Управление на сесии за влезли потребители'
                      : 'Session management for logged-in users'}
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-md border-l-4 border-amber-500 mb-4">
                <h3 className="font-semibold mb-2">
                  {lang === 'bg' ? 'Аналитични бисквитки (ако са приложими)' : 'Analytics Cookies (If Implemented)'}
                </h3>
                <p className="mb-2">
                  {lang === 'bg' ? 'Може да използваме аналитични бисквитки за:' : 'We may use analytics cookies to:'}
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    {lang === 'bg' 
                      ? 'Разбиране как посетителите използват нашия уебсайт'
                      : 'Understand how visitors use our website'}
                  </li>
                  <li>
                    {lang === 'bg' 
                      ? 'Подобряване на производителността на уебсайта'
                      : 'Improve website performance'}
                  </li>
                  <li>
                    {lang === 'bg' 
                      ? 'Мониторинг за грешки и проблеми'
                      : 'Monitor for errors and issues'}
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {lang === 'bg' ? 'Управление на бисквитките' : 'Managing Cookies'}
              </h2>
              <p className="mb-2">
                {lang === 'bg' 
                  ? 'Можете да контролирате бисквитките чрез настройките на браузъра си:'
                  : 'You can control cookies through your browser settings:'}
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  {lang === 'bg' 
                    ? 'Повечето браузъри ви позволяват да откажете бисквитки или да изтриете съществуващи бисквитки'
                    : 'Most browsers allow you to refuse cookies or delete existing cookies'}
                </li>
                <li>
                  {lang === 'bg' 
                    ? 'Обикновено можете да намерите настройки за бисквитки в менюто "Настройки" или "Предпочитания" на браузъра си'
                    : 'You can usually find cookie settings in your browser\'s "Settings" or "Preferences" menu'}
                </li>
                <li>
                  {lang === 'bg' 
                    ? 'Имайте предвид, че деактивирането на бисквитките може да повлияе на функционалността на уебсайта'
                    : 'Note that disabling cookies may affect website functionality'}
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {lang === 'bg' ? 'Бисквитки на трети страни' : 'Third-Party Cookies'}
              </h2>
              <p>
                {lang === 'bg' 
                  ? 'В момента не използваме бисквитки на трети страни за реклама или проследяване. Ако това се промени в бъдеще, ще актуализираме тази политика.'
                  : 'We do not currently use third-party cookies for advertising or tracking. If this changes in the future, we will update this policy.'}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {lang === 'bg' ? 'Актуализации на тази политика' : 'Updates to This Policy'}
              </h2>
              <p>
                {lang === 'bg' 
                  ? 'Тази политика за бисквитки може да бъде актуализирана от време на време. Всички промени ще бъдат публикувани на тази страница с актуализирана дата на влизане в сила.'
                  : 'This Cookie Policy may be updated from time to time. Any changes will be posted on this page with an updated effective date.'}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {lang === 'bg' ? 'Свържете се с нас' : 'Contact Us'}
              </h2>
              <p>
                {lang === 'bg' 
                  ? 'Ако имате въпроси относно нашата политика за бисквитки, моля свържете се с нас на:'
                  : 'If you have questions about our Cookie Policy, please contact us at:'}{' '}
                <strong>privacy@mrlmot.com</strong>
              </p>
            </section>

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

