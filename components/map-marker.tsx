export function MapMarker() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
      {/* Outer pulse effect */}
      <div className="absolute inset-0 rounded-full bg-nova-secondary opacity-75 animate-pulse-marker" />
      {/* Inner marker */}
      <div className="relative w-4 h-4 bg-nova-primary rounded-full border-2 border-white shadow-md" />
    </div>
  )
}
