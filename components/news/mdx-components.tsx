import { Image } from "@imagekit/next"
import Link from "next/link"
import type { AnchorHTMLAttributes, HTMLAttributes, PropsWithChildren } from "react"
import { FollowUs } from "./follow-us"
import { PropertyFeesCalculator } from "./property-fees-calculator"
import { toIkPath } from "@/lib/imagekit"

type CalloutProps = PropsWithChildren<{
  type?: "info" | "warning" | "success"
  title?: string
}>

const Callout = ({ type = "info", title, children }: CalloutProps) => {
  const styles: Record<NonNullable<CalloutProps["type"]>, string> = {
    info: "bg-blue-50 text-blue-900 border-blue-100",
    warning: "bg-amber-50 text-amber-900 border-amber-100",
    success: "bg-emerald-50 text-emerald-900 border-emerald-100",
  }

  return (
    <div className={`not-prose mt-6 rounded-2xl border px-4 py-3 sm:px-6 ${styles[type]}`}>
      {title && <p className="mb-1 text-sm font-semibold uppercase tracking-wide">{title}</p>}
      <div className="prose prose-sm sm:prose-base">
        {children}
      </div>
    </div>
  )
}

const YouTube = ({ id, title }: { id: string; title?: string }) => (
  <div className="not-prose relative mt-8 overflow-hidden rounded-2xl shadow-xl">
    <div className="aspect-video">
      <iframe
        title={title || "YouTube video"}
        src={`https://www.youtube.com/embed/${id}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full border-0"
      />
    </div>
  </div>
)

const Anchor = (props: AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const { href = "", children, ...rest } = props
  const isInternal = href.startsWith("/")

  if (isInternal) {
    return (
      <Link href={href} {...rest} className="font-semibold text-charcoal-500 underline decoration-charcoal-200 underline-offset-[6px] hover:text-charcoal-600">
        {children}
      </Link>
    )
  }

  return (
    <a
      href={href}
      {...rest}
      className="font-semibold text-charcoal-500 underline decoration-charcoal-200 underline-offset-[6px] hover:text-charcoal-600"
      rel="noreferrer noopener"
      target="_blank"
    >
      {children}
    </a>
  )
}

const Img = (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
  const { src, alt = "", width, height } = props
  if (!src) return null

  const parsedWidth = typeof width === "string" ? parseInt(width, 10) : width || 1200
  const parsedHeight = typeof height === "string" ? parseInt(height, 10) : height || 630
  const ikSrc = toIkPath(src)
  const isImageKit = ikSrc !== src || ikSrc.startsWith("/")

  const figure = (
    <span className="not-prose block my-8">
      {isImageKit ? (
        <Image
          src={ikSrc}
          alt={alt}
          width={parsedWidth}
          height={parsedHeight}
          transformation={[{ width: parsedWidth, height: parsedHeight, quality: 85, format: "webp", focus: "auto" }]}
          className="h-auto w-full overflow-hidden rounded-2xl border border-gray-100 object-cover shadow-lg"
          sizes="(max-width: 1024px) 100vw, 1024px"
          loading="lazy"
        />
      ) : (
        <img
          src={src}
          alt={alt}
          width={parsedWidth}
          height={parsedHeight}
          className="h-auto w-full overflow-hidden rounded-2xl border border-gray-100 object-cover shadow-lg"
          loading="lazy"
        />
      )}
      {alt && <span className="mt-2 block text-center text-sm text-muted-foreground">{alt}</span>}
    </span>
  )

  return figure
}

const Pre = (props: HTMLAttributes<HTMLPreElement>) => (
  <pre
    {...props}
    className="not-prose mt-6 overflow-x-auto rounded-2xl bg-slate-900 p-4 text-sm text-slate-100 shadow-lg"
  />
)

export const mdxComponents = {
  a: Anchor,
  img: Img,
  Callout,
  YouTube,
  pre: Pre,
  FollowUs,
  PropertyFeesCalculator,
}

