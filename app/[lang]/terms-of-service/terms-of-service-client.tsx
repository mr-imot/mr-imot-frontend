"use client"

interface TermsOfServiceClientProps {
  dict: any
  lang: 'en' | 'bg'
}

export default function TermsOfServiceClient({ dict, lang }: TermsOfServiceClientProps) {
  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-lg shadow-sm p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-blue-600 border-b-4 border-blue-600 pb-3">
            {lang === 'bg' ? '📜 Условия за Ползване' : '📜 Terms of Service'}
          </h1>
          
          <div className="bg-muted rounded-md p-3 mb-6 font-semibold">
            {lang === 'bg' ? 'Дата на влизане в сила: 30 януари 2025' : 'Effective Date: January 30, 2025'}
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-md border-l-4 border-yellow-500 mb-6">
            <strong>
              {lang === 'bg' ? 'Собственик на проекта:' : 'Project Owner:'}
            </strong>{' '}
            {lang === 'bg' 
              ? 'Тази платформа е личен MVP проект, разработен и поддържан от индивидуален човек (наричан "ние", "нас", "наш").'
              : 'This platform is a personal MVP project developed and maintained by an individual (referred to as "we", "us", "our").'}
          </div>

          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {lang === 'bg' ? '1. Цел на платформата' : '1. Platform Purpose'}
              </h2>
              <p>
                {lang === 'bg' 
                  ? 'Тази платформа е експериментален MVP, създаден за представяне и тестване на концепцията за директория на строители на недвижими имоти. Не се събират плащания. Платформата може да бъде модифицирана, спряна или изоставена по всяко време без предупреждение.'
                  : 'This platform is an experimental MVP built for showcasing and testing the concept of a real estate developer directory. No payments are collected. The platform may be modified, shut down, or abandoned at any time without notice.'}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {lang === 'bg' ? '2. Без отговорност за транзакции' : '2. No Responsibility for Transactions'}
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  {lang === 'bg' 
                    ? 'Ние предоставяме пространство за строителите да публикуват своите нови строителни проекти.'
                    : 'We provide a space for developers to list their new construction projects.'}
                </li>
                <li>
                  {lang === 'bg' 
                    ? 'Ние не действаме като посредник, агент или брокер и не поемаме отговорност за точността на обявите, комуникациите между потребителите или каквито и да било транзакции или споразумения, сключени извън платформата.'
                    : 'We do not act as an intermediary, agent, or broker and take no responsibility for the accuracy of listings, communications between users, or any transactions or agreements made outside the platform.'}
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {lang === 'bg' ? '3. Право на използване' : '3. Eligibility'}
              </h2>
              <p>
                {lang === 'bg' ? 'С регистрацията потвърждавате, че сте:' : 'By registering, you confirm that you are either:'}
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2 mt-2">
                <li>
                  {lang === 'bg' 
                    ? 'Представител на компания за недвижими имоти, или'
                    : 'A representative of a real estate development company, or'}
                </li>
                <li>
                  {lang === 'bg' 
                    ? 'Оторизирани да предоставяте информация от името на такава компания.'
                    : 'Authorized to provide information on behalf of such a company.'}
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {lang === 'bg' ? '4. Верификация на акаунт' : '4. Account Verification'}
              </h2>
              <p>
                {lang === 'bg' 
                  ? 'Извършваме ръчна верификация (чрез телефон или на лице), за да гарантираме, че изброените компании са легитимни строители на недвижими имоти.'
                  : 'We perform manual verification (via phone or in person) to ensure that listed companies are legitimate real estate developers.'}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {lang === 'bg' ? '5. Използване на платформата' : '5. Use of Platform'}
              </h2>
              <p>
                {lang === 'bg' ? 'Съгласявате се да:' : 'You agree to:'}
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2 mt-2">
                <li>
                  {lang === 'bg' 
                    ? 'Предоставяте точна информация'
                    : 'Provide accurate information'}
                </li>
                <li>
                  {lang === 'bg' 
                    ? 'Използвате платформата в съответствие с приложимите закони'
                    : 'Use the platform in accordance with applicable laws'}
                </li>
                <li>
                  {lang === 'bg' 
                    ? 'Въздържате се от злоупотреба, спам или неоторизирана автоматизация'
                    : 'Refrain from abuse, spam, or unauthorized automation'}
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {lang === 'bg' ? '6. Прекратяване' : '6. Termination'}
              </h2>
              <p>
                {lang === 'bg' 
                  ? 'Запазваме си правото да спрем или изтрием всеки акаунт без предупреждение, особено в случай на:'
                  : 'We reserve the right to suspend or delete any account without notice, especially in case of:'}
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2 mt-2">
                <li>
                  {lang === 'bg' 
                    ? 'Измамна или подвеждаща информация'
                    : 'Fraudulent or misleading information'}
                </li>
                <li>
                  {lang === 'bg' 
                    ? 'Злоупотреба със системата'
                    : 'Abuse of the system'}
                </li>
                <li>
                  {lang === 'bg' 
                    ? 'Неспазване на тези условия'
                    : 'Non-compliance with these terms'}
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {lang === 'bg' ? '7. Ограничение на отговорността' : '7. Limitation of Liability'}
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  {lang === 'bg' 
                    ? 'Не даваме гаранции за точността, пълнотата или надеждността на съдържанието или обявите.'
                    : 'We make no warranties about the accuracy, completeness, or reliability of the content or listings.'}
                </li>
                <li>
                  {lang === 'bg' 
                    ? 'Не носим отговорност за каквито и да било загуби, щети или спорове, възникнали от използването на тази платформа.'
                    : 'We are not liable for any losses, damages, or disputes arising from the use of this platform.'}
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                {lang === 'bg' ? '8. Модификации' : '8. Modifications'}
              </h2>
              <p>
                {lang === 'bg' 
                  ? 'Тези условия могат да бъдат актуализирани по всяко време. Продължаващото използване на платформата предполага приемане на текущите условия.'
                  : 'These Terms may be updated at any time. Continued use of the platform implies acceptance of the current Terms.'}
              </p>
            </section>

            <div className="text-center mt-8 pt-6 border-t text-muted-foreground">
              <p>
                {lang === 'bg' 
                  ? '© 2025 Мистър Имот. Всички права запазени. | Част от Prodigy Corp'
                  : '© 2025 Mister Imot. All rights reserved. | Part of Prodigy Corp'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

