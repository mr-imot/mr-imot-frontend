import Image from "next/image"

interface TestimonialItem {
  quote: string
  name: string
  role: string
  avatar?: string
}

interface TestimonialsSectionProps {
  lang: string
  heading?: string
  subheading?: string
  items?: TestimonialItem[]
}

export function TestimonialsSection({ lang, heading, subheading, items }: TestimonialsSectionProps) {
  const defaultItems: TestimonialItem[] = items || [
    {
      quote: lang === 'bg' ? '„Платформата ни дава директни лидове без брокери. Управлението на проекти е лесно и прозрачно.“' : '“The platform gives us direct leads without brokers. Project management is simple and transparent.”',
      name: 'Ivan Petrov',
      role: lang === 'bg' ? 'Управител, BuildCo' : 'Manager, BuildCo',
      avatar: '/placeholder-user.jpg'
    },
    {
      quote: lang === 'bg' ? '„Статистиките са полезни и виждаме ясно откъде идват контактите.“' : '“Analytics are useful and we can clearly see where contacts come from.”',
      name: 'Maria Dimitrova',
      role: lang === 'bg' ? 'Маркетинг директор' : 'Marketing Director',
      avatar: '/placeholder-user.jpg'
    },
    {
      quote: lang === 'bg' ? '„Одобрението и проверката вдигат доверието към нашите обяви.“' : '“Verification increases trust in our listings.”',
      name: 'Georgi Stoyanov',
      role: lang === 'bg' ? 'Собственик, GeoDev' : 'Owner, GeoDev',
      avatar: '/placeholder-user.jpg'
    },
  ]

  return (
    <section className="py-16 sm:py-20 md:py-24" style={{ background: 'linear-gradient(180deg, #eef0f3 0%, #e5e8ed 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase mb-4 bg-charcoal-500 text-white border-2 border-charcoal-600">
            {lang === 'bg' ? 'ОТЗИВ' : 'TESTIMONIALS'}
          </span>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif headline-gradient">
            {heading || (lang === 'bg' ? 'Не вярвай само на нас' : "Don't just take our word for it")}
          </h3>
          {subheading && (
            <p className="text-gray-600 mt-2">{subheading}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {defaultItems.map((t, idx) => (
            <article key={idx} className="card p-6 hover:shadow-2xl transition">
              <div className="flex gap-2 text-blue-500 mb-3">{'★★★★★'}</div>
              <p className="text-gray-700 mb-6">{t.quote}</p>
              <div className="flex items-center gap-3">
                <Image src={t.avatar || '/placeholder-user.jpg'} alt={t.name} width={40} height={40} className="rounded-full object-cover" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-600">{t.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}


