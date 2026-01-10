export default function Head() {
  return (
    <>
      {/* Preconnect to Google Maps API for faster map loading (300ms LCP savings) */}
      <link rel="preconnect" href="https://maps.googleapis.com" crossOrigin="anonymous" />
    </>
  )
}
