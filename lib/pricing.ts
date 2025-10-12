export type BillingCycle = 'monthly' | 'yearly'

export type PlanId = 'lite' | 'pro' | 'proPlus'

export interface LocalizedText {
  en: string
  bg: string
}

export interface PlanFeature {
  label: LocalizedText
  tooltip?: LocalizedText
}

export interface PlanConfig {
  id: PlanId
  highlight?: boolean
  badge?: LocalizedText | null
  name: LocalizedText
  description: LocalizedText
  prices: {
    currency: 'EUR'
    monthly: number | null
    yearlyMonthly?: number | null
    yearlyTotal?: number | null
    yearlySavings?: number | null
  }
  features: PlanFeature[]
  cta: LocalizedText
}

export interface PricingData {
  plans: PlanConfig[]
  savingsNote: LocalizedText // e.g. Save 17%
}

const pricingData: PricingData = {
  plans: [
    {
      id: 'lite',
      name: { en: 'Lite', bg: 'Lite' },
      description: {
        en: 'Perfect for testing the platform with a single active project',
        bg: 'Подходящ за тестване на платформата с един активен проект',
      },
      prices: { currency: 'EUR', monthly: 39, yearlyMonthly: 29, yearlyTotal: 348, yearlySavings: 120 },
      features: [
        {
          label: { en: '1 active listing', bg: '1 активна обява' },
          tooltip: {
            en: 'Create unlimited drafts in your dashboard and keep 1 listing public at a time. Switch which listing is active whenever you want.',
            bg: 'Създавайте неограничени обяви в таблото и поддържайте 1 публично активна обява. Може да сменяте коя обява е активна по всяко време.'
          }
        },
        { label: { en: 'Analytics tracking', bg: 'Аналитики и проследяване' } },
        { label: { en: 'Email support', bg: 'Имейл поддръжка' } },
        {
          label: { en: 'Only verified developers can upload', bg: 'Само проверени строители качват обяви' },
          tooltip: {
            en: 'Your projects appear only under your verified company. We don’t allow brokers to publish developer projects, protecting your media and brand.',
            bg: 'Вашите проекти се показват само към вашата проверена компания. Не позволяваме брокери да публикуват проекти на строители – защитаваме снимки и бранд.'
          }
        },
        {
          label: { en: 'Add-on active listings', bg: 'Допълнителни активни обяви' },
          tooltip: {
            en: 'Need 2+ active listings? Add-ons are priced at your current monthly plan per extra active listing (Lite: €39/extra active listing).',
            bg: 'Нужни са ви 2+ активни обяви? Добавяйте допълнителни активни обяви на цена, равна на месечния ви план за всяка допълнителна активна обява (Лайт: €39/допълнителна активна обява).'
          }
        },
        {
          label: { en: 'BONUS: Meta advertising on your 1 listing in the amount of your monthly subscription', bg: 'БОНУС: Meta реклама на вашата 1 обява в размер на месечния абонамент' },
          tooltip: {
            en: 'First month only, instant bonus - our advertising team will manage your ads and polish copy.',
            bg: 'Само първия месец, мигновен бонус - нашият рекламен екип ще управлява вашите реклами и ще подобри текста.'
          }
        }
      ],
      cta: { en: 'START NOW', bg: 'ЗАПОЧНИ СЕГА' },
    },
    {
      id: 'pro',
      highlight: true,
      badge: { en: 'Popular', bg: 'Популярен' },
      name: { en: 'Pro', bg: 'Pro' },
      description: {
        en: 'For growing teams managing multiple active projects',
        bg: 'За развиващи се екипи с няколко активни проекта',
      },
      prices: { currency: 'EUR', monthly: 99, yearlyMonthly: 79, yearlyTotal: 948, yearlySavings: 240 },
      features: [
        {
          label: { en: '3 active listings', bg: '3 активни обяви' },
          tooltip: {
            en: 'Unlimited listings in your dashboard; keep 3 public at a time. Rotate which listings are active at any moment.',
            bg: 'Неограничени обяви в таблото; поддържайте 3 публично активни. Ротирайте кои обяви са активни по всяко време.'
          }
        },
        { label: { en: 'Analytics tracking', bg: 'Аналитики и проследяване' } },
        { label: { en: 'Email & phone support', bg: 'Имейл и телефонна поддръжка' } },
        {
          label: { en: 'Only verified developers can upload', bg: 'Само проверени строители качват обяви' },
          tooltip: {
            en: 'We verify every developer. Your project pages remain under your brand; brokers cannot post your projects here.',
            bg: 'Проверяваме всеки строител. Вашите страници остават под вашия бранд; брокери не могат да публикуват вашите проекти тук.'
          }
        },
        {
          label: { en: 'Add-on active listings', bg: 'Допълнителни активни обяви' },
          tooltip: {
            en: 'Need more than 3 active listings? Add extras at a pro‑rated price: €33/month per extra active listing (example for Pro €99).',
            bg: 'Нужни са ви повече от 3 активни обяви? Добавяйте на про‑рейт цена: €33/месец за допълнителна активна обява (пример за Про €99).'
          }
        },
        {
          label: { en: 'BONUS: Meta advertising on your 3 listings in the amount of your monthly subscription', bg: 'БОНУС: Meta реклами на вашите 3 обяви в размер на месечния абонамент' },
          tooltip: {
            en: 'First month only, instant bonus - our advertising team will manage your ads and polish copy.',
            bg: 'Само първия месец, мигновен бонус - нашият рекламен екип ще управлява вашите реклами и ще подобри текста.'
          }
        }
      ],
      cta: { en: 'START NOW', bg: 'ЗАПОЧНИ СЕГА' },
    },
    {
      id: 'proPlus',
      name: { en: 'Pro Plus', bg: 'Pro Plus' },
      description: {
        en: 'For large companies that need unlimited scale and control',
        bg: 'За големи компании с нужда от неограничена скала и контрол',
      },
      prices: { currency: 'EUR', monthly: null, yearlyMonthly: null, yearlyTotal: null, yearlySavings: null },
      features: [
        { label: { en: 'Unlimited active listings', bg: 'Неограничени активни обяви' } },
        { label: { en: 'Analytics tracking & insights', bg: 'Аналитики и прозрения' } },
        { label: { en: 'Priority support', bg: 'Приоритетна поддръжка' } },
        {
          label: { en: 'Only verified developers can upload', bg: 'Само проверени строители качват обяви' },
          tooltip: {
            en: 'We verify every developer. Your project pages remain under your brand; brokers cannot post your projects here.',
            bg: 'Проверяваме всеки строител. Вашите страници остават под вашия бранд; брокери не могат да публикуват вашите проекти тук.'
          }
        },
        { label: { en: 'Market insights & guidance', bg: 'Пазарни прозрения и насоки' } },
        { label: { en: 'Dedicated account manager', bg: 'Личен акаунт мениджър' } },
        {
          label: { en: 'BONUS: Meta advertising on your listings in the amount of your monthly subscription', bg: 'БОНУС: Meta реклами на вашите обяви в размер на месечния абонамент' },
          tooltip: {
            en: 'First month only, instant bonus - our advertising team will manage your ads and polish copy.',
            bg: 'Само първия месец, мигновен бонус - нашият рекламен екип ще управлява вашите реклами и ще подобри текста.'
          }
        }
      ],
      cta: { en: 'CONTACT SALES', bg: 'СВЪРЖИ СЕ С ПРОДАЖБИ' },
    },
  ],
  savingsNote: { en: 'Save 17%', bg: 'Спестявате 17%' },
}

export function getPricingData(): PricingData {
  return pricingData
}

export function formatPrice(amount: number | null, cycle: BillingCycle, lang: string): string {
  if (amount == null) return lang === 'bg' ? 'Запитване' : 'Contact'
  const currency = '€'
  const suffix = cycle === 'yearly' ? (lang === 'bg' ? '/год.' : '/year') : (lang === 'bg' ? '/месец' : '/month')
  return `${currency}${amount}${suffix}`
}


