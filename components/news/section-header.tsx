import Link from "next/link"

interface SectionHeaderProps {
  title: string
  href?: string
}

export function SectionHeader({ title, href }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b-2 border-primary/10 pb-3 mb-6">
      <h2 className="text-xl font-bold text-foreground uppercase tracking-tight relative">
        {title}
        <span className="absolute -bottom-[14px] left-0 h-[2px] w-full bg-primary" />
      </h2>
      {href && (
        <Link href={href} className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">
          View All &rarr;
        </Link>
      )}
    </div>
  )
}
