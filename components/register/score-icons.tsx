import { CircleCheck, CircleX } from "lucide-react"
import { cn } from "@/lib/utils"

interface ScoreIconsProps {
  score: 0 | 1 | 2 | 3
  className?: string
}

/**
 * Renders score icons based on numeric score (0-3)
 * - score 0: CircleX icon in red/destructive color
 * - score 1-3: N CircleCheck icons with green colors and visual hierarchy
 */
export function ScoreIcons({ score, className }: ScoreIconsProps) {
  if (score === 0) {
    return (
      <div
        className={cn("inline-flex items-center justify-center", className)}
        aria-label="No"
      >
        <CircleX 
          className="h-4 w-4 md:h-6 md:w-6 text-destructive transition-all" 
          aria-hidden="true"
          strokeWidth={2}
        />
      </div>
    )
  }

  const colorClass =
    score === 3
      ? "text-green-600"
      : score === 2
        ? "text-green-500"
        : "text-green-400"

  return (
    <div
      className={cn("inline-flex items-center gap-0.5 md:gap-1.5", className)}
      aria-label={`Score ${score} out of 3`}
    >
      {Array.from({ length: score }).map((_, i) => (
        <CircleCheck
          key={i}
          className={cn(
            "h-4 w-4 md:h-6 md:w-6 transition-all",
            colorClass,
            score === 3 && "drop-shadow-sm"
          )}
          aria-hidden="true"
          strokeWidth={score === 3 ? 2.5 : 2}
        />
      ))}
    </div>
  )
}
