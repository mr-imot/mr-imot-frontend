import { Image } from "@imagekit/next"
import { toIkPath } from "@/lib/imagekit"

interface MobileMascotSectionProps {
  dict: any
  lang: string
}

export function MobileMascotSection({ dict, lang }: MobileMascotSectionProps) {
  return (
    <section className="lg:hidden py-16 sm:py-20 md:py-24 bg-white">
      <div className="container mx-auto px-3 sm:px-6 md:px-8 w-full">
        <div className="flex justify-center">
          <Image
            src={lang === 'bg' 
              ? toIkPath("https://ik.imagekit.io/ts59gf2ul/Logo/mrimot.com-0_-komisiona-bg-christmas.png")
              : toIkPath("https://ik.imagekit.io/ts59gf2ul/Logo/mrimot.com-0_-commissions-en-christmas-Photoroom.png")
            }
            alt={lang === 'bg' 
              ? 'Талисман Мистър Имот от mrimot.com в коледен дух, държащ знак с надпис 0% комисиони за платформа за недвижими имоти'
              : 'Mister Imot mascot of mrimot.com in Christmas spirit holding a sign with 0% commissions message for real estate platform'
            }
            width={320}
            height={240}
            loading="lazy"
            transformation={[{ width: 220, quality: 58, format: "webp", focus: "auto" }]}
            className="w-auto h-auto transition-all duration-700 hover:scale-105 hover:rotate-1 drop-shadow-xl"
            style={{
              willChange: 'transform',
              transform: 'translateZ(0)',
              filter: 'drop-shadow(0 4px 15px rgba(0, 0, 0, 0.1))',
              width: 'clamp(180px, 68vw, 320px)',
              height: 'auto',
              animation: 'float 6s ease-in-out infinite',
              marginTop: 'clamp(8px, 2vh, 16px)'
            }}
            sizes="(max-width: 640px) 68vw, (max-width: 1024px) 50vw, 0vw"
          />
        </div>
      </div>
    </section>
  )
}

