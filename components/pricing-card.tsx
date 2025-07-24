import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface PricingCardProps {
  title: string
  price: string
  period: string
  features: string[]
  isCurrentFree?: boolean
  buttonText: string
  buttonLink: string
  highlight?: boolean
}

export function PricingCard({
  title,
  price,
  period,
  features,
  isCurrentFree = false,
  buttonText,
  buttonLink,
  highlight = false,
}: PricingCardProps) {
  return (
    <Card
      className={cn(
        "flex flex-col justify-between rounded-lg shadow-card transition-all duration-300 hover:shadow-hover",
        highlight ? "border-2 border-nova-secondary scale-105" : "border border-nova-border",
      )}
    >
      <CardHeader className="pb-md">
        <CardTitle className="text-2xl font-bold text-nova-text-primary">{title}</CardTitle>
        <div className="mt-sm text-4xl font-extrabold text-nova-secondary">
          {isCurrentFree ? (
            <span className="relative">
              <span className="line-through text-nova-text-secondary">{price}</span>
              <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-nova-secondary">
                FREE
              </span>
            </span>
          ) : (
            price
          )}
        </div>
        <p className="text-nova-text-secondary">{period}</p>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-sm text-nova-text-primary">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <CheckCircle className="h-5 w-5 text-nova-secondary mr-sm flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-lg">
        <Button asChild className="w-full bg-nova-primary text-nova-primary-foreground hover:bg-nova-primary-dark">
          <Link href={buttonLink}>{buttonText}</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
