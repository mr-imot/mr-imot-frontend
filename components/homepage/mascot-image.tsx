"use client"

import Image from "next/image"
import { IK_URL_ENDPOINT } from "@/lib/imagekit"
import styles from "@/app/(public)/[lang]/homepage-hero.module.css"

const imagekitLoader = ({
  src,
  width,
  quality = 55,
}: {
  src: string
  width: number
  quality?: number
}) => {
  const q = quality ?? 55
  return `${IK_URL_ENDPOINT}/tr:w-${width},q-${q},f-avif,fo-auto${src}`
}

export function MascotImage({ lang }: { lang: string }) {
  const src =
    lang === "bg"
      ? "/Logo/mrimot.com-mascot-bg-0_-komisiona.png"
      : "/Logo/0_-commissions-mr-imot.png"

  const alt =
    lang === "bg"
      ? "Талисман Мистър Имот от mrimot.com, държащ знак с надпис 0% комисиони за платформа за недвижими имоти"
      : "Mister Imot mascot of mrimot.com holding a sign with 0% commissions message for real estate platform"

  return (
    <Image
      src={src}
      alt={alt}
      width={780}
      height={1000}
      priority
      fetchPriority="high"
      sizes="(max-width: 639px) 220px, (max-width: 1023px) 385px, 498px"
      className={styles.heroImage}
      loader={imagekitLoader}
    />
  )
}
