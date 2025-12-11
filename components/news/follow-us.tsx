import Link from "next/link"

type FollowUsProps = {
  lang?: "bg" | "en" | "ru" | "gr"
  devCta?: boolean
}

const SOCIALS = [
  { href: "https://www.facebook.com/misterimot/", label: "Facebook", bg: "bg-[#1877F2]" },
  { href: "https://www.instagram.com/mister_imot", label: "Instagram", bg: "bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737]" },
  { href: "https://www.youtube.com/@MisterImot", label: "YouTube", bg: "bg-[#FF0000]" },
  { href: "https://www.tiktok.com/@mister_imot", label: "TikTok", bg: "bg-[#010101]" },
]

const copyByLang = {
  bg: {
    title: "Последвайте ни",
    subtitle: "Не изпускайте нито една новина за пазара на имоти.",
    devCtaText: "Ако сте строител или работите с такъв, свържете го с нас.",
    devCtaButton: "Публикувай проект",
  },
  en: {
    title: "Follow us",
    subtitle: "Don't miss any real estate updates.",
    devCtaText: "If you’re a developer or work with one, let them know about us.",
    devCtaButton: "List your project",
  },
  ru: {
    title: "Подписывайтесь на нас",
    subtitle: "Не пропускайте новости рынка недвижимости.",
    devCtaText: "Если вы застройщик или работаете с ним, свяжитесь с нами.",
    devCtaButton: "Опубликовать проект",
  },
  gr: {
    title: "Ακολουθήστε μας",
    subtitle: "Μην χάνετε καμία είδηση για τα ακίνητα.",
    devCtaText: "Αν είστε κατασκευαστής ή συνεργάζεστε με έναν, ενημερώστε μας.",
    devCtaButton: "Καταχώρισε έργο",
  },
}

export function FollowUs({ lang = "bg", devCta = false }: FollowUsProps) {
  const copy = copyByLang[lang] || copyByLang.bg

  const devLink =
    lang === "bg"
      ? "/bg/register?type=developer"
      : lang === "ru"
        ? "/ru/register?type=developer"
        : lang === "gr"
          ? "/gr/register?type=developer"
          : "/register?type=developer"

  return (
    <div className="not-prose my-8 rounded-2xl bg-muted p-6 text-center shadow-sm ring-1 ring-muted">
      <h3 className="mb-3 text-xl font-bold text-foreground">{copy.title}</h3>
      <p className="mb-6 text-muted-foreground">{copy.subtitle}</p>

      <div className="flex flex-wrap justify-center gap-3">
        {SOCIALS.map((social) => (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 rounded-full ${social.bg} px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
          >
            {social.label}
          </a>
        ))}
      </div>

      {devCta && (
        <div className="mt-6 flex flex-col items-center gap-3 text-sm text-muted-foreground">
          <p className="max-w-xl">{copy.devCtaText}</p>
          <Link
            href={devLink}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {copy.devCtaButton}
          </Link>
        </div>
      )}
    </div>
  )
}

export default FollowUs
