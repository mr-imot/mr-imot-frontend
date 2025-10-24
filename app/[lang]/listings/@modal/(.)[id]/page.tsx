"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { getProject } from "@/lib/api"
import { MobileListingModal } from "@/components/MobileListingModal"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function InterceptedListingModal({ params }: PageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load property data
  useEffect(() => {
    async function loadProperty() {
      try {
        const data = await getProject(resolvedParams.id)
        setProperty(data)
      } catch (error) {
        console.error('Failed to load property:', error)
      } finally {
        setLoading(false)
      }
    }
    loadProperty()
  }, [resolvedParams.id])

  // Only show modal on mobile
  if (!isMobile) {
    return null
  }

  if (loading) {
    return (
      <MobileListingModal
        property={null}
        isOpen={true}
        onClose={() => router.back()}
        priceTranslations={{
          requestPrice: 'Request Price',
          fromPrice: 'From',
          contactForPrice: 'Contact for Price',
          priceOnRequest: 'Price on Request',
          na: 'N/A'
        }}
        lang="en"
      />
    )
  }

  return (
    <MobileListingModal
      property={property}
      isOpen={true}
      onClose={() => router.back()}
      priceTranslations={{
        requestPrice: 'Request Price',
        fromPrice: 'From',
        contactForPrice: 'Contact for Price',
        priceOnRequest: 'Price on Request',
        na: 'N/A'
      }}
      lang="en"
    />
  )
}
