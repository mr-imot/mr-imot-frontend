import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { Star } from "lucide-react"

interface TestimonialCardProps {
  quote: string
  author: string
  role: string
  imageSrc: string
  rating?: number
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function TestimonialCard({ quote, author, role, imageSrc, rating = 5 }: TestimonialCardProps) {
  return (
    <Card className="bg-white shadow-lg hover:shadow-xl rounded-xl border border-ds-neutral-100 hover:border-ds-neutral-200 transition-all duration-300 h-full flex flex-col min-h-[25rem] group hover:-translate-y-1">
      <CardContent className="p-8 flex flex-col h-full">
        {/* Star Rating */}
        <div className="flex items-center mb-6">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              className={`h-5 w-5 ${
                index < rating ? "text-amber-400 fill-amber-400" : "text-ds-neutral-300"
              } transition-colors duration-200 group-hover:scale-105`}
            />
          ))}
        </div>

        {/* Quote - Flexible height */}
        <div className="flex-1 mb-8 flex items-start">
          <blockquote className="text-ds-neutral-700 text-lg leading-relaxed italic relative max-w-none">
            <span className="text-4xl text-ds-neutral-300 absolute -top-2 -left-1 leading-none font-serif">"</span>
            <span className="relative z-10 pl-6 block">{quote}</span>
            <span className="text-4xl text-ds-neutral-300 absolute -bottom-4 right-0 leading-none font-serif">"</span>
          </blockquote>
        </div>

        {/* Author Info with Avatar - Fixed at bottom */}
        <div className="flex items-center space-x-4 pt-6 border-t border-ds-neutral-100 mt-auto">
          {/* Enhanced Avatar - 48px as requested */}
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-ds-primary-600 to-ds-accent-500 flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow duration-300">
            {imageSrc && imageSrc !== "/placeholder.svg?height=48&width=48" ? (
              <Image
                src={imageSrc || "/placeholder.svg"}
                alt={author}
                fill
                className="object-cover"
                loading="lazy"
                sizes="48px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-semibold text-base">
                {getInitials(author)}
              </div>
            )}
          </div>

          {/* Enhanced Author Details */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-ds-neutral-900 text-lg truncate group-hover:text-ds-primary-600 transition-colors duration-300">
              {author}
            </p>
            <p className="text-ds-neutral-500 text-sm truncate mt-1">{role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
