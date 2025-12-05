"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createProject, attachProjectImages } from "@/lib/api"
import { upload } from "@imagekit/next";
import { ensureGoogleMaps } from "@/lib/google-maps"
import { preventEnterSubmit } from "@/lib/form-utils"
import { Info, Loader, Upload, X, Move, Star, Image as ImageIcon, Plus, Maximize2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getCurrentDeveloper } from "@/lib/api"
import { FeaturesSelector } from "@/components/FeaturesSelector"

interface NewPropertyClientProps {
  dict: any
  lang: 'en' | 'bg'
}

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: typeof google
  }
}

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(10, "Please provide a more detailed description"),
  city: z.string().optional(),
  country: z.string().optional(),
  address: z.string().min(5, "Address is required"),
  project_type: z.enum(["apartment_building", "house_complex"], {
    required_error: "Please select a project type",
  }),
  completion_month: z.string().min(1, "Project completion month is required"),
  completion_year: z.string().min(1, "Project completion year is required"),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  requestPrice: z.boolean().default(false),
  price_per_m2: z
    .union([z.number().positive("Enter a valid price"), z.nan()])
    .optional()
    .transform((v) => (Number.isNaN(v) ? undefined : v)),
  latitude: z.number(),
  longitude: z.number(),
  coverImage: z.any().optional(),
  galleryImages: z.any().optional(),
  feature_ids: z.array(z.string()).default([]),
}).refine((data) => {
  return data.coverImage || (data.galleryImages && data.galleryImages.length > 0)
}, {
  message: "At least one project image is required",
  path: ["coverImage"]
}).refine((data) => data.requestPrice || !!data.price_per_m2, {
  path: ["price_per_m2"],
  message: "Price per m² is required unless Request price is checked",
})

type FormValues = z.infer<typeof formSchema>

interface ImageFile {
  id: string
  file: File
  preview: string
  isMain: boolean
  order: number
}

export default function NewPropertyPage({ dict, lang }: NewPropertyClientProps) {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  
  const projectTypeOptions = [
    { label: dict?.projectTypes?.apartmentBuilding || "Apartment building", value: "apartment_building" },
    { label: dict?.projectTypes?.houseComplex || "House complex", value: "house_complex" },
  ]
  
  // Backup authentication check (in addition to layout protection)
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
      return
    }
    
    if (!isLoading && user && user.user_type !== 'developer') {
      router.push('/login')
      return
    }
  }, [user, isLoading, router])

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">{dict.developer?.properties?.checkingAuthentication || "Checking authentication..."}</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated or not a developer
  if (!user || user.user_type !== 'developer') {
    return null
  }

  const mapRef = useRef<HTMLDivElement | null>(null)
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const addressInputRef = useRef<HTMLInputElement | null>(null) // Add this ref

  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<ImageFile[]>([])
  const [draggedImage, setDraggedImage] = useState<ImageFile | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null)
  const [addressSelected, setAddressSelected] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [geocodingBlocked, setGeocodingBlocked] = useState(false)
  const [placesBlocked, setPlacesBlocked] = useState(false)
  const [autocompleteOpen, setAutocompleteOpen] = useState(false)
  const [isMapExpanded, setIsMapExpanded] = useState(false)

  const defaultCenter = useMemo(() => ({ lat: 42.6977, lng: 23.3219 }), [])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      city: "",
      country: "",
      address: "",
      project_type: undefined as any,
      completion_month: "",
      completion_year: "",
      website: "",
      requestPrice: false,
      price_per_m2: undefined,
      latitude: defaultCenter.lat,
      longitude: defaultCenter.lng,
      coverImage: undefined,
      galleryImages: undefined,
    },
    mode: "onBlur",
  })

  const latitude = form.watch("latitude")
  const longitude = form.watch("longitude")

  // Image handling is now done via backend API with ImageKit

  // Enhanced file handling
  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return

    const newImages: ImageFile[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(`File "${file.name}" is not a valid image`)
        continue
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File "${file.name}" is too large (max 10MB)`)
        continue
      }
      
      // Create image object
      const imageFile: ImageFile = {
        id: `${Date.now()}-${i}`,
        file,
        preview: URL.createObjectURL(file),
        isMain: images.length === 0 && i === 0, // First image is main
        order: images.length + i,
      }
      
      newImages.push(imageFile)
    }

    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages])
      
      // Update form values
      const allImages = [...images, ...newImages]
      const mainImage = allImages.find(img => img.isMain)
      const galleryImages = allImages.filter(img => !img.isMain)
      
      form.setValue("coverImage", mainImage?.file)
      form.setValue("galleryImages", galleryImages.map(img => img.file))
    }
  }

  const setMainImage = (imageId: string) => {
    setImages(prev => prev.map(img => ({
      ...img,
      isMain: img.id === imageId
    })))
    
    // Update form values
    const updatedImages = images.map(img => ({
      ...img,
      isMain: img.id === imageId
    }))
    const mainImage = updatedImages.find(img => img.isMain)
    const galleryImages = updatedImages.filter(img => !img.isMain)
    
    form.setValue("coverImage", mainImage?.file)
    form.setValue("galleryImages", galleryImages.map(img => img.file))
  }

  const removeImage = (imageId: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== imageId)
      const mainImage = filtered.find(img => img.isMain)
      const galleryImages = filtered.filter(img => !img.isMain)
      
      // Update form values
      form.setValue("coverImage", mainImage?.file)
      form.setValue("galleryImages", galleryImages.map(img => img.file))
      
      return filtered
    })
  }

  const reorderImages = (fromIndex: number, toIndex: number) => {
    setImages(prev => {
      const newImages = [...prev]
      const [movedImage] = newImages.splice(fromIndex, 1)
      newImages.splice(toIndex, 0, movedImage)
      
      // Update order property
      newImages.forEach((img, index) => {
        img.order = index
      })
      
      return newImages
    })
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, image: ImageFile) => {
    setDraggedImage(image)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    if (draggedImage) {
      const currentIndex = images.findIndex(img => img.id === draggedImage.id)
      if (currentIndex !== -1) {
        reorderImages(currentIndex, targetIndex)
      }
    }
    setDraggedImage(null)
  }

  const handleDragEnd = () => {
    setDraggedImage(null)
  }

  useEffect(() => {
    const initMapAndPlaces = async () => {
      try {
        const google = await ensureGoogleMaps()

        if (!mapRef.current) return

        const center = { lat: latitude || 0, lng: longitude || 0 }
        const map = new google.maps.Map(mapRef.current, {
          center,
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          scrollwheel: true,
          gestureHandling: 'greedy',
          draggableCursor: "grab",
          draggingCursor: "grabbing",
          mapId: 'e1ea25ce333a0b0deb34ff54', // Required for AdvancedMarkerElement
        })
        mapInstanceRef.current = map

        // Create marker pin element
        const pinElement = document.createElement('div')
        pinElement.innerHTML = '📍'
        pinElement.style.cursor = 'grab'
        pinElement.style.fontSize = '24px'
        pinElement.style.textAlign = 'center'

        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: center,
          map,
          content: pinElement,
          gmpDraggable: true,
        })
        markerRef.current = marker

        // Reverse geocoding function using Google Maps Geocoder
        const reverseGeocode = async (lat: number, lng: number) => {
          try {
            if (geocodingBlocked) {
              return
            }
            const geocoder = new google.maps.Geocoder()
            geocoder.geocode(
              { location: { lat, lng } },
              (results, status) => {
                if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
                  const result = results[0]
                  
                  // Parse address components to fill city, country, and address fields
                  let city = ''
                  let country = ''
                  
                  if (result.address_components) {
                    for (const component of result.address_components) {
                      const types = component.types
                      
                      if (types.includes('locality') || types.includes('administrative_area_level_1')) {
                        city = component.long_name
                      } else if (types.includes('country')) {
                        country = component.long_name
                      }
                    }
                  }
                  
                  // Update form values
                  if (city) form.setValue("city", city, { shouldValidate: true })
                  if (country) form.setValue("country", country, { shouldValidate: true })
                  form.setValue("address", result.formatted_address, { shouldValidate: true })
                  
                  // Also update the input field directly to ensure UI sync
                  if (addressInputRef.current) {
                    addressInputRef.current.value = result.formatted_address
                  }
                  
                  setAddressSelected(true)
                } else if (status === google.maps.GeocoderStatus.REQUEST_DENIED) {
                  console.warn('Geocoding request denied. Enable "Geocoding API" for this key in Google Cloud Console.')
                  setGeocodingBlocked(true)
                } else if (status !== google.maps.GeocoderStatus.ZERO_RESULTS) {
                  console.warn('Geocoding failed with status:', status)
                }
              }
            )
          } catch (error) {
            console.error('Reverse geocoding failed:', error)
          }
        }

        // Marker drag end - update coordinates and reverse geocode
        marker.addEventListener("dragend", (event: any) => {
          const markerElement = event.target as google.maps.marker.AdvancedMarkerElement
          const pos = markerElement?.position
          if (pos) {
            const lat = typeof pos.lat === 'function' ? pos.lat() : pos.lat
            const lng = typeof pos.lng === 'function' ? pos.lng() : pos.lng
            form.setValue("latitude", lat, { shouldValidate: true })
            form.setValue("longitude", lng, { shouldValidate: true })
            reverseGeocode(lat, lng)
          }
        })

        // Map click - move marker and update coordinates
        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (!e.latLng || !markerRef.current) return
          const newPosition = { lat: e.latLng.lat(), lng: e.latLng.lng() }
          markerRef.current.position = newPosition
          form.setValue("latitude", newPosition.lat, { shouldValidate: true })
          form.setValue("longitude", newPosition.lng, { shouldValidate: true })
          reverseGeocode(newPosition.lat, newPosition.lng)
        })

      } catch (e) {
        console.error("Failed to initialize Google Maps/Places", e)
      }
    }

    initMapAndPlaces()
  }, []) // Empty dependency array - only run once
  
  // Upload images to existing project
  const uploadImagesToProject = async (projectId: string, coverImage?: File, galleryImages?: File[]) => {
    setLoading(true)
    setSubmitError(null)
    
    try {
      const files: File[] = []
      if (coverImage) files.push(coverImage)
      if (galleryImages && galleryImages.length > 0) files.push(...galleryImages)

      if (files.length === 0) return

      // 1) Upload all files directly to ImageKit (fresh auth per file)
      const uploaded = [] as Array<{ url: string; fileId: string; isCover?: boolean }>
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        try {
          const authRes = await fetch("/api/upload-auth")
          if (!authRes.ok) throw new Error("Failed to get upload auth params")
          const { token, expire, signature, publicKey } = await authRes.json()

          const res = await upload({
            file,
            fileName: file.name,
            token,
            expire,
            signature,
            publicKey,
          })
          if (res?.url && res?.fileId) {
            uploaded.push({ url: res.url as string, fileId: res.fileId as string, isCover: i === 0 })
          } else {
            console.error("ImageKit upload missing url or fileId", res)
          }
        } catch (e) {
          console.error("Failed to upload a file to ImageKit", e)
        }
      }

      if (uploaded.length === 0) {
        throw new Error("No images were uploaded to ImageKit")
      }

      // 3) Attach metadata to backend project
      await attachProjectImages(projectId, uploaded)

      setSubmitSuccess("Images uploaded successfully!")
      setImages([])
      form.setValue("coverImage", undefined)
      form.setValue("galleryImages", undefined)
    } catch (error: any) {
      setSubmitError("Failed to upload images. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Keep marker in sync when lat/lng change externally
    if (markerRef.current && mapInstanceRef.current) {
      const pos = { lat: latitude || 0, lng: longitude || 0 }
      markerRef.current.position = pos
    }
  }, [latitude, longitude])

  // Initialize autocomplete after map is ready
  useEffect(() => {
    if (!mapInstanceRef.current || !addressInputRef.current) return
    
    let checkInterval: NodeJS.Timeout | null = null
    const inputElement = addressInputRef.current
    let startCheckingDropdown: (() => void) | null = null
    
    const initAutocomplete = async () => {
      try {
        const google = await ensureGoogleMaps()
        
        // Create Google Places Autocomplete (defensive against blocked Places API)
        let autocomplete: google.maps.places.Autocomplete | null = null
        try {
          autocomplete = new google.maps.places.Autocomplete(addressInputRef.current!, {
            componentRestrictions: { country: 'bg' },
            types: ['geocode'], // Includes addresses, cities, villages, and other geographic locations
            fields: ['formatted_address', 'geometry', 'place_id', 'address_components']
          })
          setPlacesBlocked(false)
        } catch (err) {
          console.warn('Places Autocomplete failed to initialize. Ensure "Places API" is enabled for this key.', err)
          setPlacesBlocked(true)
          return
        }

        // Track when autocomplete dropdown opens/closes
        startCheckingDropdown = () => {
          if (checkInterval) return
          checkInterval = setInterval(() => {
            const pacContainer = document.querySelector('.pac-container') as HTMLElement
            if (pacContainer) {
              const isVisible = pacContainer.style.display !== 'none' && 
                               pacContainer.offsetParent !== null
              setAutocompleteOpen(isVisible)
              if (!isVisible && checkInterval) {
                clearInterval(checkInterval)
                checkInterval = null
              }
            } else {
              setAutocompleteOpen(false)
              if (checkInterval) {
                clearInterval(checkInterval)
                checkInterval = null
              }
            }
          }, 100)
        }

        inputElement.addEventListener('focus', startCheckingDropdown)
        inputElement.addEventListener('input', startCheckingDropdown)
        
        // Handle place selection
        autocomplete.addListener('place_changed', () => {
          // Stop checking dropdown
          if (checkInterval) {
            clearInterval(checkInterval)
            checkInterval = null
          }
          setAutocompleteOpen(false)
          const place = autocomplete.getPlace()
          
          if (place.geometry && place.geometry.location && mapInstanceRef.current && markerRef.current) {
            const location = place.geometry.location
            const newCenter = { lat: location.lat(), lng: location.lng() }
            const formattedAddress = place.formatted_address || (addressInputRef.current?.value || '')
            
            // Update map and marker
            mapInstanceRef.current.setCenter(newCenter)
            mapInstanceRef.current.setZoom(16)
            markerRef.current.position = newCenter
            
            // Parse address components to fill city, country, and address fields
            let city = ''
            let country = ''
            
            if (place.address_components) {
              for (const component of place.address_components) {
                const types = component.types
                
                if (types.includes('locality') || types.includes('administrative_area_level_1')) {
                  city = component.long_name
                } else if (types.includes('country')) {
                  country = component.long_name
                }
              }
            }
            
            // Update form values - ensure input field is synced
            form.setValue("latitude", newCenter.lat, { shouldValidate: true })
            form.setValue("longitude", newCenter.lng, { shouldValidate: true })
            
            // Set city and country if found
            if (city) form.setValue("city", city, { shouldValidate: true })
            if (country) form.setValue("country", country, { shouldValidate: true })
            
            // Set the full address
            form.setValue("address", formattedAddress, { shouldValidate: true })
            
            // Also update the input field directly to ensure UI sync
            if (addressInputRef.current) {
              addressInputRef.current.value = formattedAddress
            }
            
            setAddressSelected(true)
          }
        })
      } catch (error) {
        console.error('Failed to initialize autocomplete:', error)
      }
    }

    // Small delay to ensure everything is ready
    const timer = setTimeout(initAutocomplete, 100)
    
    return () => {
      clearTimeout(timer)
      if (checkInterval) {
        clearInterval(checkInterval)
      }
      if (inputElement && startCheckingDropdown) {
        inputElement.removeEventListener('focus', startCheckingDropdown)
        inputElement.removeEventListener('input', startCheckingDropdown)
      }
    }
  }, [mapInstanceRef.current, addressInputRef.current]) // Depend on when these refs are ready

  // Handle Escape key to close fullscreen map
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMapExpanded) {
        setIsMapExpanded(false)
      }
    }

    if (isMapExpanded) {
      document.addEventListener('keydown', handleKeyDown)
    } else {
      document.removeEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMapExpanded])

  // Trigger map resize when fullscreen mode changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        google.maps.event.trigger(mapInstanceRef.current as unknown as object, 'resize')
      }, 100)
    }
  }, [isMapExpanded])

  // Forward geocode function for manual address input
  const forwardGeocode = async (address: string) => {
    try {
      const google = await ensureGoogleMaps()
      const geocoder = new google.maps.Geocoder()
      
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0] && mapInstanceRef.current && markerRef.current) {
          const location = results[0].geometry.location
          const newPosition = { lat: location.lat(), lng: location.lng() }
          const formattedAddress = results[0].formatted_address || address
          
          // Update map and marker
          mapInstanceRef.current.setCenter(newPosition)
          mapInstanceRef.current.setZoom(16)
          markerRef.current.position = newPosition
          
          // Parse address components to fill city and country
          let city = ''
          let country = ''
          
          if (results[0].address_components) {
            for (const component of results[0].address_components) {
              const types = component.types
              if (types.includes('locality') || types.includes('administrative_area_level_1')) {
                city = component.long_name
              } else if (types.includes('country')) {
                country = component.long_name
              }
            }
          }
          
          // Update form values
          form.setValue("latitude", newPosition.lat, { shouldValidate: true })
          form.setValue("longitude", newPosition.lng, { shouldValidate: true })
          form.setValue("address", formattedAddress, { shouldValidate: true })
          if (city) form.setValue("city", city, { shouldValidate: true })
          if (country) form.setValue("country", country, { shouldValidate: true })
          
          // Also update the input field directly to ensure UI sync
          if (addressInputRef.current) {
            addressInputRef.current.value = formattedAddress
          }
          
          setAddressSelected(true)
        } else if (status === 'REQUEST_DENIED' || status === 'OVER_QUERY_LIMIT') {
          console.warn('Geocoding request denied or quota exceeded. Enable "Geocoding API" for this key in Google Cloud Console.')
          setGeocodingBlocked(true)
        } else if (status !== 'ZERO_RESULTS') {
          console.warn('Geocoding failed with status:', status)
        }
      })
    } catch (error) {
      console.error('Error forward geocoding:', error)
      setGeocodingBlocked(true)
    }
  }

  useEffect(() => {
    return () => {
      // Cleanup object URLs
      images.forEach(img => URL.revokeObjectURL(img.preview))
    }
  }, [images])

  const onSubmit = async (values: FormValues) => {
    if (isSubmitting) return // Prevent duplicate submissions
    
    // Authentication is now handled by HttpOnly cookies automatically
    
    // DEBUG: Show environment variables
    // console.log('🌍 Environment Debug:', {
    //   NODE_ENV: process.env.NODE_ENV,
    //   NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    //   isDevelopment: process.env.NODE_ENV === 'development'
    // });
    
    setLoading(true)
    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(null)
    
    try {
      // Debug: Log the form values being sent
      console.log('🚀 Creating project with values:', {
        name: values.name,
        description: values.description,
        city: values.city,
        country: values.country,
        formatted_address: values.address,
        project_type: values.project_type,
        latitude: values.latitude,
        longitude: values.longitude,
        feature_ids: values.feature_ids
      });
      
      // First, create the project
      const project = await createProject({
        name: values.name,
        description: values.description,
        city: values.city || "Sofia", // Default to Sofia if city is empty
        country: values.country || "Bulgaria",
        formatted_address: values.address,  // Fixed: backend expects 'formatted_address'
        project_type: values.project_type,
        price_label: values.requestPrice ? "Request price" : 
                    (values.price_per_m2 ? `From €${values.price_per_m2}/m²` : undefined),
        latitude: values.latitude,
        longitude: values.longitude,
        completion_note: `${values.completion_month} ${values.completion_year}`,  // Fixed: backend expects 'completion_note'
        feature_ids: values.feature_ids || [],  // Add missing feature_ids field
      })
      
      setCreatedProjectId(project.id.toString())
      
      // Check if we have images to upload
      const hasImages = values.coverImage || (values.galleryImages && values.galleryImages.length > 0)
      
      if (hasImages) {
        // Upload images without showing success message - just keep loading state
        try {
          await uploadImagesToProject(
            project.id.toString(),
            values.coverImage,
            values.galleryImages
          )
        } catch (imageError) {
          console.error("Failed to upload images", imageError)
          // Don't show error - just redirect, user can add images later
        }
      }
      
      // Redirect immediately after project creation (and image upload if any)
      router.push(`/listing/${project.id}`)
      
    } catch (err: any) {
      console.error("Failed to create project", err)
      let errorMessage = dict.developer?.properties?.failedToCreateProject || "Неуспешно създаване на проект. Моля, опитайте отново."
      
      // Handle specific error types
      if (err.message && err.message.includes("Invalid request format")) {
        errorMessage = dict.developer?.properties?.invalidDataFormat || "Невалиден формат на данните. Моля, проверете всички задължителни полета."
      } else if (err.message && err.message.includes("city")) {
        errorMessage = dict.developer?.properties?.invalidCity || "Моля, предоставете валиден град. Опитайте да изберете адрес от предложенията на Google Maps."
      } else if (err.isServerError) {
        errorMessage = dict.developer?.properties?.serverError || "Грешка на сървъра. Моля, опитайте по-късно."
      } else if (err.message) {
        if (err.message.includes("Failed to fetch")) {
          errorMessage = dict.developer?.properties?.connectionError || "Грешка при връзката. Моля, проверете дали backend-ът работи."
        } else if (err.message.includes("required")) {
          errorMessage = err.message
        } else if (err.message.includes("Server error occurred")) {
          errorMessage = err.message
        } else {
          errorMessage = err.message
        }
      }
      
      setSubmitError(errorMessage)
      setLoading(false)
      setIsSubmitting(false)
      
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">{dict.developer?.properties?.createNewProject || "Create New Project"}</CardTitle>
          <p className="text-gray-600">{dict.developer?.properties?.fillDetailsBelow || "Fill in the details below to showcase your real estate project"}</p>
        </CardHeader>
        <CardContent>
          {/* Error Messages - only show errors, not success (redirect happens immediately) */}
          {submitError && (
            <Alert variant="destructive" className="mb-6 animate-in slide-in-from-top-2">
              <AlertDescription className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                {submitError}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Loading Overlay - show when submitting */}
          {isSubmitting && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-8 shadow-xl max-w-md w-full mx-4">
                <div className="flex flex-col items-center gap-4">
                  <Loader className="h-12 w-12 animate-spin text-blue-600" />
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {dict.developer?.properties?.creatingProject || "Създаване на проект..."}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {createdProjectId 
                        ? (dict.developer?.properties?.uploadingImages || "Качване на изображения...")
                        : (dict.developer?.properties?.pleaseWait || "Моля, изчакайте...")
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(onSubmit, (errors) => {
                // Handle validation errors - scroll to first error
                const firstErrorField = Object.keys(errors)[0]
                if (firstErrorField) {
                  // Show error message at top
                  setSubmitError(dict.developer?.properties?.fillRequiredFields || "Моля, попълнете всички задължителни полета")
                  
                  // Scroll to top to show error message
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                  
                  // Try to find and scroll to the error field
                  setTimeout(() => {
                    // Try multiple selectors to find the field
                    let errorElement: HTMLElement | null = null
                    
                    // Try by name attribute
                    errorElement = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement
                    
                    // Try by id containing the field name
                    if (!errorElement) {
                      errorElement = document.querySelector(`[id*="${firstErrorField}"]`) as HTMLElement
                    }
                    
                    // Try to find the FormItem container
                    if (!errorElement) {
                      const formItems = document.querySelectorAll('[class*="space-y"]')
                      formItems.forEach(item => {
                        const field = item.querySelector(`[name="${firstErrorField}"]`) as HTMLElement
                        if (field) errorElement = field
                      })
                    }
                    
                    // Try to find by data attribute or any input/select/textarea
                    if (!errorElement) {
                      const allInputs = document.querySelectorAll('input, select, textarea')
                      allInputs.forEach(input => {
                        const name = input.getAttribute('name') || input.getAttribute('id') || ''
                        if (name.includes(firstErrorField)) {
                          errorElement = input as HTMLElement
                        }
                      })
                    }
                    
                    if (errorElement) {
                      // Scroll to the error field
                      errorElement.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center',
                        inline: 'nearest'
                      })
                      
                      // Focus the field after scroll
                      setTimeout(() => {
                        if (errorElement && errorElement instanceof HTMLElement) {
                          errorElement.focus()
                          // Highlight the field briefly
                          errorElement.style.transition = 'box-shadow 0.3s ease'
                          errorElement.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.3)'
                          setTimeout(() => {
                            if (errorElement) {
                              errorElement.style.boxShadow = ''
                            }
                          }, 2000)
                        }
                      }, 500)
                    }
                  }, 300)
                }
              })} 
              className="space-y-8"
            >
              {/* Project Information Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">{dict.developer?.properties?.projectDetails || "Project Details"}</h3>
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">{dict.developer?.properties?.projectName || "Project Name"} <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={dict.developer?.properties?.placeholders?.projectName || "e.g., Sunrise Residences"} 
                            className="h-11" 
                            onKeyDown={preventEnterSubmit}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormLabel className="text-sm font-medium text-gray-700">{dict.developer?.properties?.description || "Description"} <span className="text-red-500">*</span></FormLabel>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger className="text-muted-foreground">
                                <Info className="h-4 w-4" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{dict.developer?.properties?.tooltips?.description || "Include project highlights, location benefits, amenities, and timelines."}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <FormControl>
                          <Textarea rows={4} placeholder={dict.developer?.properties?.placeholders?.projectDescription || "Tell buyers what makes this project special"} className="resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="project_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">{dict.developer?.properties?.projectType || "Project Type"} <span className="text-red-500">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder={dict.developer?.properties?.placeholders?.projectType || "Choose project type"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {projectTypeOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                                     <FormField
                     control={form.control}
                     name="completion_month"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel className="text-sm font-medium text-gray-700">{dict.developer?.properties?.completionMonth || "Project Completion Month"} <span className="text-red-500">*</span></FormLabel>
                         <FormControl>
                           <Select onValueChange={field.onChange} value={field.value}>
                             <SelectTrigger className="h-11">
                               <SelectValue placeholder={dict.developer?.properties?.placeholders?.completionMonth || "Choose month"} />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="January">{dict.listingDetail?.months?.January || "January"}</SelectItem>
                               <SelectItem value="February">{dict.listingDetail?.months?.February || "February"}</SelectItem>
                               <SelectItem value="March">{dict.listingDetail?.months?.March || "March"}</SelectItem>
                               <SelectItem value="April">{dict.listingDetail?.months?.April || "April"}</SelectItem>
                               <SelectItem value="May">{dict.listingDetail?.months?.May || "May"}</SelectItem>
                               <SelectItem value="June">{dict.listingDetail?.months?.June || "June"}</SelectItem>
                               <SelectItem value="July">{dict.listingDetail?.months?.July || "July"}</SelectItem>
                               <SelectItem value="August">{dict.listingDetail?.months?.August || "August"}</SelectItem>
                               <SelectItem value="September">{dict.listingDetail?.months?.September || "September"}</SelectItem>
                               <SelectItem value="October">{dict.listingDetail?.months?.October || "October"}</SelectItem>
                               <SelectItem value="November">{dict.listingDetail?.months?.November || "November"}</SelectItem>
                               <SelectItem value="December">{dict.listingDetail?.months?.December || "December"}</SelectItem>
                             </SelectContent>
                           </Select>
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />

                   <FormField
                     control={form.control}
                     name="completion_year"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel className="text-sm font-medium text-gray-700">{dict.developer?.properties?.completionYear || "Project Completion Year"} <span className="text-red-500">*</span></FormLabel>
                         <FormControl>
                           <Select onValueChange={field.onChange} value={field.value}>
                             <SelectTrigger className="h-11">
                               <SelectValue placeholder={dict.developer?.properties?.placeholders?.completionYear || "Choose year"} />
                             </SelectTrigger>
                             <SelectContent>
                               {Array.from({ length: 10 }, (_, i) => {
                                 const year = new Date().getFullYear() + i;
                                 return (
                                   <SelectItem key={year} value={year.toString()}>
                                     {year}
                                   </SelectItem>
                                 );
                               })}
                             </SelectContent>
                           </Select>
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />


                   <FormField
                     control={form.control}
                     name="website"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel className="text-sm font-medium text-gray-700">{dict.developer?.properties?.projectWebsite || "Project Website"}</FormLabel>
                         <FormControl>
                           <Input 
                             type="url" 
                             placeholder={dict.developer?.properties?.placeholders?.projectWebsite || "https://example.com"} 
                             className="h-11"
                             onKeyDown={preventEnterSubmit}
                             {...field} 
                           />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="requestPrice"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-3">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                          </FormControl>
                          <FormLabel className="mb-0 text-sm font-medium text-gray-700">{dict.developer?.properties?.requestPrice || "Request price"}</FormLabel>
                        </FormItem>
                      )}
                    />

                    {!form.watch("requestPrice") && (
                      <FormField
                        control={form.control}
                        name="price_per_m2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">{dict.developer?.properties?.pricePerM2 || "Price per m²"} <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                placeholder={dict.developer?.properties?.placeholders?.pricePerM2 || "e.g., 1200"}
                                className="h-11"
                                value={field.value ?? ""}
                                onKeyDown={preventEnterSubmit}
                                onChange={(e) => field.onChange(e.target.value === "" ? Number.NaN : Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>

                {/* Image Gallery Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">{dict.developer?.properties?.projectImages || "Project Images"}</h3>
                  
                  {/* Image Upload Area */}
                  <div className="space-y-4">
                                         <div className="flex items-center justify-between">
                       <div>
                         <h4 className="text-sm font-medium text-gray-700">{dict.developer?.properties?.projectGallery || "Project Gallery"} <span className="text-red-500">*</span></h4>
                         <p className="text-xs text-gray-500">{dict.developer?.properties?.firstImageMainCover || "First image will be the main cover image"}</p>
                       </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          
                          // More robust cross-browser file input trigger
                          const fileInput = fileInputRef.current;
                          if (fileInput) {
                            // Reset the input value to allow re-selecting the same file
                            fileInput.value = '';
                            
                            // Try different methods for better browser compatibility
                            try {
                              fileInput.click();
                            } catch (error) {
                              // Fallback for older browsers
                              console.warn('Direct click failed, trying alternative method:', error);
                              const event = new MouseEvent('click', {
                                view: window,
                                bubbles: true,
                                cancelable: true,
                              });
                              fileInput.dispatchEvent(event);
                            }
                          }
                        }}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        {dict.developer?.properties?.addImages || "Add Images"}
                      </Button>
                    </div>

                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        handleFileSelect(e.target.files);
                        // Reset the input value after handling to allow re-selecting the same file
                        e.target.value = '';
                      }}
                      style={{ 
                        position: 'absolute',
                        left: '-9999px',
                        top: '-9999px',
                        opacity: 0,
                        pointerEvents: 'none'
                      }}
                    />

                    {/* Image Grid */}
                    {images.length === 0 ? (
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          
                          const fileInput = fileInputRef.current;
                          if (fileInput) {
                            fileInput.value = '';
                            try {
                              fileInput.click();
                            } catch (error) {
                              console.warn('Direct click failed, trying alternative method:', error);
                              const event = new MouseEvent('click', {
                                view: window,
                                bubbles: true,
                                cancelable: true,
                              });
                              fileInput.dispatchEvent(event);
                            }
                          }
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          
                          const files = e.dataTransfer.files;
                          if (files) {
                            handleFileSelect(files);
                          }
                        }}
                      >
                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm text-gray-600 mb-2">{dict.developer?.properties?.clickToUploadOrDragDrop || "Click here to upload images or drag and drop"}</p>
                        <p className="text-xs text-gray-500">{dict.developer?.properties?.uploadImagesToShowcase || "Upload images to showcase your project"}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {images.map((image, index) => (
                          <div
                            key={image.id}
                            className={`relative group cursor-move rounded-lg overflow-hidden border-2 transition-all ${
                              image.isMain ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                            } ${draggedImage?.id === image.id ? 'opacity-50' : ''}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, image)}
                            onDragOver={(e) => handleDragOver(e)}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={handleDragEnd}
                          >
                            <img
                              src={image.preview}
                              alt={`Project image ${index + 1}`}
                              className="w-full h-32 object-cover"
                            />
                            
                            {/* Main Image Badge */}
                            {image.isMain && (
                              <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                {dict.developer?.properties?.main || "Main"}
                              </div>
                            )}
                            
                            {/* Order Number */}
                            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                              {index + 1}
                            </div>
                            
                            {/* Actions */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => setMainImage(image.id)}
                                disabled={image.isMain}
                                className="h-8 px-3 text-xs"
                              >
                                {image.isMain ? (dict.developer?.properties?.main || "Main") : (dict.developer?.properties?.setMain || "Set Main")}
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeImage(image.id)}
                                className="h-8 px-3 text-xs"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            {/* Drag Handle */}
                            <div className="absolute bottom-2 left-2 bg-black/70 text-white p-1 rounded">
                              <Move className="h-3 w-3" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Image Tips */}
                    {images.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">{dict.developer?.properties?.imageTips || "Image Tips:"}</p>
                            <ul className="space-y-1 text-xs">
                              <li>{dict.developer?.properties?.dragToReorder || "• Drag images to reorder them"}</li>
                              <li>{dict.developer?.properties?.firstImageBecomesMain || "• First image becomes the main cover image"}</li>
                              <li>{dict.developer?.properties?.imagesAppearInOrder || "• Images will appear in this order on your listing"}</li>
                              <li>{dict.developer?.properties?.mainImageShowsOnMap || "• Main image shows on map cards and search results"}</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

                             {/* Location Section */}
               <div className="space-y-6">
                 <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">{dict.developer?.properties?.locationAndMap || "Location & Map"}</h3>
                 
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="space-y-4">
                                           <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">{dict.developer?.properties?.projectAddress || "Project Address"} <span className="text-red-500">*</span></FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input 
                                  ref={addressInputRef}
                                  placeholder={dict.developer?.properties?.placeholders?.address || "Start typing an address (e.g., Sofia, Bulgaria)"} 
                                  className={`${addressSelected ? "border-green-500 bg-green-50" : ""} h-11`}
                                  value={field.value}
                                onChange={(e) => {
                                  field.onChange(e.target.value)
                                  setAddressSelected(false)
                                }}
                                onKeyDown={(e) => {
                                  // Always prevent form submission when Enter is pressed in address field
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    
                                    const inputValue = e.currentTarget.value
                                    
                                    // If autocomplete dropdown is open, Google's autocomplete will handle selecting the suggestion
                                    // If dropdown is NOT open and there's a value, geocode it to load the address
                                    if (!autocompleteOpen && inputValue && !addressSelected) {
                                      forwardGeocode(inputValue)
                                    }
                                    // User must use the submit button to save changes
                                  }
                                }}
                                onBlur={(e) => {
                                  if (e.target.value && !addressSelected) {
                                    forwardGeocode(e.target.value)
                                  }
                                }}
                                autoComplete="off"
                                />
                              </FormControl>
                              {addressSelected && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full" />
                                  </div>
                                </div>
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                     
                                           <div className="text-sm text-gray-600">
                        <p>{dict.developer?.properties?.addressInstructions1 || "• Start typing in the address field above - Google will suggest addresses"}</p>
                        <p>{dict.developer?.properties?.addressInstructions2 || "• Select an address to automatically pin it on the map and fill city/country fields"}</p>
                        <p>{dict.developer?.properties?.addressInstructions3 || "• Click on the map or drag the marker to fine-tune the exact position"}</p>
                        <p>{dict.developer?.properties?.addressInstructions4 || "• The address field will update automatically when you move the marker"}</p>
                      </div>
                   </div>
                   
                   <div 
                     className={`relative overflow-hidden transition-all duration-200 ${
                       isMapExpanded 
                         ? 'fixed z-[9999] rounded-2xl border-2 border-gray-300 shadow-2xl' 
                         : 'h-80 rounded-lg border'
                     } shadow-sm`}
                     style={isMapExpanded ? {
                       position: 'fixed',
                       top: '80px',
                       left: '2.5%',
                       right: '2.5%',
                       bottom: '2.5%',
                       width: '95%',
                       height: 'calc(100vh - 80px - 2.5%)',
                       zIndex: 10000,
                       backgroundColor: 'white',
                     } : {}}
                   >
                     <div ref={mapRef} className="w-full h-full" />
                     
                     {/* Expand/Collapse control */}
                     <button
                       type="button"
                       className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-white/95 border border-gray-200 shadow-lg flex items-center justify-center hover:bg-white hover:shadow-xl transition-all duration-200 cursor-pointer"
                       onClick={() => setIsMapExpanded(!isMapExpanded)}
                       aria-label={isMapExpanded ? (dict.listings?.collapseMap || "Collapse map") : (dict.listings?.expandMap || "Expand map")}
                     >
                       {isMapExpanded ? <X className="h-5 w-5 text-gray-700 cursor-pointer" /> : <Maximize2 className="h-5 w-5 text-gray-700 cursor-pointer" />}
                     </button>
                   </div>
                   
                   {/* Backdrop overlay when expanded */}
                   {isMapExpanded && (
                     <div 
                       className="fixed inset-0 bg-black/50 z-[9999]"
                       onClick={() => setIsMapExpanded(false)}
                       style={{
                         position: 'fixed',
                         top: 0,
                         left: 0,
                         right: 0,
                         bottom: 0,
                       }}
                     />
                   )}
                 </div>
               </div>

              {/* Hidden lat/lng fields */}
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <input type="hidden" value={field.value} readOnly />
                )}
              />
              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <input type="hidden" value={field.value} readOnly />
                )}
              />

              {/* Features Section */}
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="feature_ids"
                  render={({ field }) => (
                    <FormItem>
                      <FeaturesSelector
                        selectedFeatureIds={field.value}
                        onSelectionChange={field.onChange}
                        title={dict?.developer?.properties?.features?.title || "Property Features"}
                        description={dict?.developer?.properties?.features?.description || "Select the features and amenities available in your property. This helps potential buyers understand what your project offers."}
                        disabled={isSubmitting}
                        lang={lang}
                        dict={dict}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Section */}
              <div className="pt-6 border-t">
                {!createdProjectId ? (
                  <Button type="submit" disabled={isSubmitting} className="w-full lg:w-auto px-8 h-12 text-base">
                    {isSubmitting ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin mr-2" />
                        {dict.developer?.properties?.creatingProject || "Creating Project..."}
                      </>
                    ) : (
                      dict.developer?.properties?.createProject || "Create Project"
                    )}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Button 
                      type="button"
                      onClick={() => {
                        if (!createdProjectId) return;
                        uploadImagesToProject(
                          createdProjectId as string,
                          form.getValues("coverImage"),
                          form.getValues("galleryImages")
                        )
                      }}
                      disabled={loading || (!form.getValues("coverImage") && !form.getValues("galleryImages")?.length)}
                      className="w-full lg:w-auto px-8 h-12 text-base"
                      variant="outline"
                    >
                      {loading ? (
                        <>
                          <Loader className="h-5 w-5 animate-spin mr-2" />
                          {dict.developer?.properties?.uploadingImages || "Uploading Images..."}
                        </>
                      ) : (
                        dict.developer?.properties?.uploadImagesButton || "Upload Images"
                      )}
                    </Button>
                    
                    <Button 
                      type="button"
                      onClick={() => router.push("/developer/dashboard")}
                      className="w-full lg:w-auto px-8 h-12 text-base"
                    >
                      {dict.developer?.properties?.goToDashboard || "Go to Dashboard"}
                    </Button>
                  </div>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}


