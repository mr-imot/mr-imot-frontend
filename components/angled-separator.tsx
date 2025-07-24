interface AngledSeparatorProps {
  direction?: "down" | "up"
  color?: string
  height?: string
  angle?: number
}

export function AngledSeparator({
  direction = "down",
  color = "bg-white",
  height = "h-16 md:h-24",
  angle = 1,
}: AngledSeparatorProps) {
  const skewValue = direction === "down" ? `${angle}deg` : `-${angle}deg`
  const origin = direction === "down" ? "top left" : "bottom left"

  return (
    <div className={`relative w-full ${height} overflow-hidden`}>
      <div
        className={`absolute inset-0 ${color}`}
        style={{
          transform: `skewY(${skewValue}) scaleY(1.5)`,
          transformOrigin: origin,
        }}
      />
    </div>
  )
}
