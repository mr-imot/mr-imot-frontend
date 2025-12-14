"use client"

import { useEffect, useMemo, useRef, useState, use } from "react"
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
import { getProject, updateProject, attachProjectImages, deleteProjectImage, getProjectImages, updateProjectImagesOrder, type Project } from "@/lib/api"
import { upload } from "@imagekit/next";
import { ensureGoogleMaps } from "@/lib/google-maps"
import { AddressSearchField } from "@/components/address-search-field"
import { Info, Loader, Upload, X, Move, Star, Image as ImageIcon, Plus, ArrowLeft, Maximize2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { FeaturesSelector } from "@/components/FeaturesSelector"
import Link from "next/link"

interface EditPropertyClientProps {
  dict: any
  lang: 'en' | 'bg'
  params: Promise<{
    id: string
  }>
}

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: typeof google
  }
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(10, "Please provide a more detailed description").max(5000, "Description must be 5000 characters or less"),
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
})

type FormValues = z.infer<typeof formSchema>

interface ImageFile {
  id: string
  file?: File
  preview: string
  isMain: boolean
  order: number
  existing?: boolean // Flag for existing images
  imageId?: string // For existing image deletion
}

export default function EditProjectPage({ dict, lang, params }: EditPropertyClientProps) {
  const resolvedParams = use(params)
  const projectId = resolvedParams.id
  const router = useRouter()
  const { user, isLoading } = useAuth()
  
  const projectTypeOptions = [
    { label: dict?.projectTypes?.apartmentBuilding || "Apartment complex", value: "apartment_building" },
    { label: dict?.projectTypes?.houseComplex || "Housing complex", value: "house_complex" },
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
          <p className="mt-4 text-gray-600">Checking authentication...</p>
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

  const [loading, setLoading] = useState(true)
  const [images, setImages] = useState<ImageFile[]>([])
  const [draggedImage, setDraggedImage] = useState<ImageFile | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [addressSelected, setAddressSelected] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [geocodingBlocked, setGeocodingBlocked] = useState(false)
  const [isMapExpanded, setIsMapExpanded] = useState(false)

  const defaultCenter = useMemo(() => ({ lat: 42.6977, lng: 23.3219 }), [])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      city: "",
      country: "Bulgaria",
      address: "",
      project_type: "apartment_building",
      completion_month: "",
      completion_year: "",
      website: "",
      requestPrice: false,
      price_per_m2: undefined,
      latitude: defaultCenter.lat,
      longitude: defaultCenter.lng,
      coverImage: null,
      galleryImages: [],
      feature_ids: [],
    }
  })

  // Load project data
  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return

      try {
        setLoading(true)
        const projectData = await getProject(projectId)
        
        // Check if project is paused or deleted - cannot edit these
        if ('status' in projectData && (projectData.status === 'paused' || projectData.status === 'deleted')) {
          setSubmitError('Cannot edit paused or deleted projects.')
          setLoading(false)
          return
        }

        // Type guard: ensure we have a Project (not PausedProject or DeletedProject)
        const project = projectData as Project
        
        // Debug project structure
        console.log('Edit Project Debug:', {
          project: project,
          title: project.title,
          name: project.name,
          images: project.images,
          features: project.features,
          completion_date: project.completion_date,
          completion_note: project.completion_note
        });

        // Populate form with project data
        form.reset({
          name: project.title || project.name || "",
          description: project.description || "",
          city: project.city || "",
          country: "Bulgaria",
          address: project.formatted_address || project.location || "",
          project_type: (project.project_type === "apartment_building" || project.project_type === "house_complex") 
            ? project.project_type 
            : "apartment_building",
          completion_month: project.completion_note?.split(' ')[0] || project.completion_date?.split('-')[1] || "",
          completion_year: project.completion_note?.split(' ')[1] || project.completion_date?.split('-')[0] || "",
          website: "",
          requestPrice: !project.price_per_m2,
          price_per_m2: project.price_per_m2 ? parseFloat(project.price_per_m2.replace(/[^\d.]/g, '')) : undefined,
          latitude: project.latitude || defaultCenter.lat,
          longitude: project.longitude || defaultCenter.lng,
          feature_ids: project.features?.map((f: any) => f.id) || [],
        })

        // Load existing images from the images array (new structure)
        const existingImages: ImageFile[] = []
        if (project.images && project.images.length > 0) {
          project.images.forEach((img: any, index: number) => {
            existingImages.push({
              id: `existing-${index}`,
              preview: img.image_url,
              isMain: img.is_cover || index === 0, // First image is main if no cover specified
              order: index,
              existing: true,
              imageId: img.id || `img-${index}`
            })
          })
        }
        if (existingImages.length > 0) {
          setImages(existingImages)
        }

        setAddressSelected(true)
      } catch (err: any) {
        console.error('Failed to load project:', err)
        if (err?.statusCode === 401 || err?.isAuthError) {
          setSubmitError('Your session has expired. Please log in again.')
          setTimeout(() => router.push('/login'), 2000)
        } else {
          setSubmitError('Failed to load project. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadProject()
    }
  }, [projectId, user, form, defaultCenter])

  // Google Maps and Places API setup
  useEffect(() => {
    if (!loading && form.getValues('latitude') && form.getValues('longitude')) {
      const initMapAndPlaces = async () => {
        try {
          const google = await ensureGoogleMaps()
          const mapContainer = mapRef.current
          if (!mapContainer) return

          const lat = form.getValues('latitude')
          const lng = form.getValues('longitude')
          
          // Initialize map with scroll wheel zoom enabled
          const map = new google.maps.Map(mapContainer, {
            center: { lat, lng },
            zoom: 15,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            scrollwheel: true, // Enable scroll wheel zoom
            draggableCursor: "grab",
            draggingCursor: "grabbing",
            mapId: 'e1ea25ce333a0b0deb34ff54', // Required for AdvancedMarkerElement
          })

          // Create marker pin element
          const pinElement = document.createElement('div')
          pinElement.innerHTML = '📍'
          pinElement.style.cursor = 'grab'
          pinElement.style.fontSize = '24px'
          pinElement.style.textAlign = 'center'

          const marker = new google.maps.marker.AdvancedMarkerElement({
            position: { lat, lng },
            map,
            content: pinElement,
            title: "Project Location",
            gmpDraggable: true,
          })

          mapInstanceRef.current = map
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
          marker.addEventListener("dragend", (event) => {
            const markerElement = event.target as google.maps.marker.AdvancedMarkerElement
            if (!markerElement) return
            const pos = markerElement.position
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

        } catch (error) {
          console.error('Failed to initialize Google Maps:', error)
        }
      }

      initMapAndPlaces()
    }
  }, [loading, form, geocodingBlocked])

  // Handle address selection from AddressSearchField
  const handleAddressSelect = async ({ lat, lng, address, placeId }: { lat: number; lng: number; address: string; placeId?: string }) => {
    if (!mapInstanceRef.current || !markerRef.current) return
    const newCenter = { lat, lng }
    mapInstanceRef.current.setCenter(newCenter)
    mapInstanceRef.current.setZoom(16)
    markerRef.current.position = newCenter
    
    // Try to get address components from place details if placeId is available
    let city = ''
    let country = ''
    
    if (placeId) {
      try {
        const google = await ensureGoogleMaps()
        const placesLibrary = await google.maps.importLibrary("places") as google.maps.PlacesLibrary
        const place = new placesLibrary.Place({ id: placeId })
        await place.fetchFields({ fields: ["addressComponents"] })
        
        if (place.addressComponents) {
          for (const component of place.addressComponents) {
            const types = component.types
            if (types.includes('locality') || types.includes('administrative_area_level_1')) {
              city = component.longText || component.shortText || ''
            } else if (types.includes('country')) {
              country = component.longText || component.shortText || ''
            }
          }
        }
      } catch (error) {
        console.warn('Failed to fetch place details for address components:', error)
      }
    }
    
    // Update form values
    form.setValue("latitude", newCenter.lat, { shouldValidate: true })
    form.setValue("longitude", newCenter.lng, { shouldValidate: true })
    form.setValue("address", address, { shouldValidate: true })
    if (city) form.setValue("city", city, { shouldValidate: true })
    if (country) form.setValue("country", country, { shouldValidate: true })
    
    setAddressSelected(true)
  }

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(file => file.type.startsWith('image/'))
    const hasExistingImages = images.length > 0
    
    validFiles.forEach((file, index) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newImage: ImageFile = {
          id: `new-${Date.now()}-${Math.random()}`,
          file,
          preview: e.target?.result as string,
          isMain: !hasExistingImages && index === 0, // Only first image if no existing images
          order: images.length + index,
          existing: false
        }
        setImages(prev => [...prev, newImage])
      }
      reader.readAsDataURL(file)
    })
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleImageDelete = async (imageToDelete: ImageFile) => {
    try {
      // Clear any existing errors
      setSubmitError(null)
      
      // If it's an existing image, delete it from backend
      if (imageToDelete.existing && imageToDelete.imageId) {
        await deleteProjectImage(projectId, imageToDelete.imageId)
      }
      
      // Remove from local state
      setImages(prev => {
        const filtered = prev.filter(img => img.id !== imageToDelete.id)
        // If we deleted the main image, make the first remaining image main
        if (imageToDelete.isMain && filtered.length > 0) {
          filtered[0].isMain = true
        }
        return filtered
      })
      
      // Show success message briefly
      setSubmitSuccess('Image deleted successfully')
      setTimeout(() => setSubmitSuccess(null), 2000)
    } catch (error: any) {
      console.error('Failed to delete image:', error)
      if (error?.statusCode === 401 || error?.isAuthError) {
        setSubmitError('Your session has expired. Please log in again.')
        setTimeout(() => router.push('/login'), 2000)
      } else {
        setSubmitError('Failed to delete image. Please try again.')
      }
    }
  }

  const handleSetMainImage = (targetImage: ImageFile) => {
    setImages(prev => prev.map(img => ({
      ...img,
      isMain: img.id === targetImage.id
    })))
  }

  // Reorder images function
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

  const uploadImagesToProject = async (projectId: string, newImages: ImageFile[]) => {
    try {
      setLoading(true)
      
      const imagesToUpload = newImages.filter(img => !img.existing && img.file)
      
      if (imagesToUpload.length === 0) {
        setSubmitSuccess('Project updated successfully!')
        return
      }

      const uploadPromises = imagesToUpload.map(async (imageFile) => {
        // Get auth params for ImageKit upload
        const authRes = await fetch("/api/upload-auth")
        if (!authRes.ok) throw new Error("Failed to get upload auth params")
        const { token, expire, signature, publicKey } = await authRes.json()

        const uploadResponse = await upload({
          file: imageFile.file!,
          fileName: `project_${projectId}_${Date.now()}_${imageFile.file!.name}`,
          token,
          expire,
          signature,
          publicKey,
        })

        if (!uploadResponse.url || !uploadResponse.fileId) {
          throw new Error('ImageKit upload failed - missing url or fileId')
        }

        return {
          url: uploadResponse.url,
          fileId: uploadResponse.fileId,
          isCover: imageFile.isMain
        }
      })

      const uploadedImages = await Promise.all(uploadPromises)
      const attachResult = await attachProjectImages(projectId, uploadedImages)
      
      // After uploading new images, fetch all images and update their order
      // to reflect the final order from the images state
      const allProjectImages = await getProjectImages(projectId)
      
      // Create a map of existing images by their imageId
      const existingImageMap = new Map<string, ImageFile>()
      images.filter(img => img.existing && img.imageId).forEach(img => {
        existingImageMap.set(img.imageId!, img)
      })
      
      // Create a map of new images by their URL (to match with backend response)
      const newImageMap = new Map<string, ImageFile>()
      images.filter(img => !img.existing).forEach(img => {
        // Extract base URL from preview (remove data URL prefix if present)
        const urlKey = img.preview.startsWith('data:') ? '' : img.preview.split('?')[0]
        if (urlKey) {
          newImageMap.set(urlKey, img)
        }
      })
      
      // Build the update list matching backend images with local state
      const allImageUpdates = allProjectImages
        .map((backendImg: any) => {
          // Try to find matching local image
          let localImg: ImageFile | undefined
          
          // Check if it's an existing image
          if (existingImageMap.has(backendImg.id)) {
            localImg = existingImageMap.get(backendImg.id)
          } else {
            // It's a new image - match by URL
            const baseUrl = backendImg.image_url.split('?')[0]
            localImg = newImageMap.get(baseUrl)
          }
          
          if (localImg) {
            // Find the index in the current images array
            const index = images.findIndex(img => 
              (img.existing && img.imageId === backendImg.id) ||
              (!img.existing && img.preview.includes(baseUrl))
            )
            return {
              id: backendImg.id,
              is_cover: localImg.isMain,
              order: index !== -1 ? index : 0,
            }
          }
          return null
        })
        .filter((update: any) => update !== null)
      
      // Update all images with final order
      if (allImageUpdates.length > 0) {
        await updateProjectImagesOrder(projectId, allImageUpdates)
      }
      
      setSubmitSuccess('Project and images updated successfully!')
      
      setTimeout(() => {
        router.push('/developer/properties')
      }, 2000)

    } catch (error: any) {
      console.error('Failed to upload images:', error)
      if (error?.statusCode === 401 || error?.isAuthError) {
        setSubmitError('Your session has expired. Please log in again.')
        setTimeout(() => router.push('/login'), 2000)
      } else {
        setSubmitError('Failed to upload images. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)
      
      const projectData = {
        name: data.name,
        description: data.description,
        city: data.city,
        formatted_address: data.address,
        project_type: data.project_type,
        completion_note: `${data.completion_month} ${data.completion_year}`,
        price_label: data.requestPrice ? "Request price" : 
                    (data.price_per_m2 ? `From €${data.price_per_m2}/m²` : undefined),
        latitude: data.latitude,
        longitude: data.longitude,
        feature_ids: data.feature_ids,
      }

      await updateProject(projectId, projectData)
      
      // Update existing images' order and cover status if there are any
      const existingImages = images.filter(img => img.existing && img.imageId)
      if (existingImages.length > 0) {
        const imageUpdates = existingImages.map((img, index) => ({
          id: img.imageId!,
          is_cover: img.isMain,
          order: index,
        }))
        
        await updateProjectImagesOrder(projectId, imageUpdates)
      }
      
      // Handle new image uploads
      const newImages = images.filter(img => !img.existing)
      if (newImages.length > 0) {
        await uploadImagesToProject(projectId, newImages)
      } else {
        setSubmitSuccess('Project updated successfully!')
        setTimeout(() => {
          router.push('/developer/properties')
        }, 2000)
      }
      
    } catch (err: any) {
      console.error('Failed to update project:', err)
      // Check if it's an auth error
      if (err?.statusCode === 401 || err?.isAuthError) {
        setSubmitError('Your session has expired. Please log in again.')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setSubmitError('Failed to update project. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/developer/properties">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {dict.developer?.properties?.backToProperties || "Back to Properties"}
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{dict.developer?.properties?.editProject || "Edit Project"}</h1>
          <p className="text-gray-600">{dict.developer?.properties?.updateProjectDetails || "Update your project details and features"}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">{dict.developer?.properties?.editProject || "Edit Project"}</CardTitle>
          <p className="text-gray-600">{dict.developer?.properties?.updateProjectDetails || "Update your project details and features"}</p>
        </CardHeader>
        <CardContent>
          {/* Success/Error Messages */}
          {submitError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}
          {submitSuccess && (
            <Alert className="mb-6">
              <AlertDescription className="text-green-700">{submitSuccess}</AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Project Information Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">{dict.developer?.properties?.propertyDetails || "Project Details"}</h3>
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">{dict.developer?.properties?.projectName || "Project Name"} <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Sunrise Residences" className="h-11" {...field} />
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
                              <TooltipTrigger asChild>
                                <button type="button" className="text-muted-foreground">
                                  <Info className="h-4 w-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Include project highlights, location benefits, amenities, and timelines.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <FormControl>
                          <Textarea rows={4} placeholder="Tell buyers what makes this project special" className="resize-none" {...field} />
                        </FormControl>
                        <div className="flex justify-between items-center">
                          <FormMessage />
                          <span className={`text-xs ${(field.value?.length || 0) > 5000 ? 'text-red-500' : 'text-gray-500'}`}>
                            {(field.value?.length || 0)} / 5000
                          </span>
                        </div>
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
                              <SelectValue placeholder="Select project type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {projectTypeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="completion_month"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">{dict.developer?.properties?.completionMonth || "Project Completion Month"} <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Choose month" />
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
                                <SelectValue placeholder="Choose year" />
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
                  </div>
                </div>

                {/* Project Images */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">{dict.developer?.properties?.projectImages || "Project Images"}</h3>
                  
                  <div className="space-y-4">
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-1">{dict.developer?.properties?.uploadImagesToShowcase || dict.developer?.properties?.clickToUploadOrDragDrop || "Click to upload project images"}</p>
                      <p className="text-xs text-gray-500">{dict.developer?.properties?.supportedFormats || "PNG, JPG up to 10MB each"}</p>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />

                    {/* Image Preview Grid */}
                    {images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {images.map((image, index) => (
                          <div
                            key={image.id}
                            className={`relative group aspect-square rounded-lg overflow-hidden border-2 cursor-move transition-all ${
                              image.isMain ? 'border-yellow-500 ring-2 ring-yellow-200' : 'border-gray-200'
                            } ${draggedImage?.id === image.id ? 'opacity-50' : ''}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, image)}
                            onDragOver={(e) => handleDragOver(e)}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={handleDragEnd}
                          >
                            <img
                              src={image.preview}
                              alt="Project"
                              className="w-full h-full object-cover"
                            />
                            
                            {/* Drag indicator */}
                            <div className="absolute top-2 left-2 bg-black/50 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              <Move className="h-4 w-4" />
                            </div>
                            
                            {/* Main image indicator */}
                            {image.isMain && (
                              <div className="absolute bottom-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                                <Star className="h-3 w-3 inline mr-1" />
                                Main
                              </div>
                            )}
                            
                            {/* Action buttons */}
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!image.isMain && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => handleSetMainImage(image)}
                                  className="h-8 px-3 text-xs"
                                >
                                  <Star className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() => handleImageDelete(image)}
                                className="h-8 px-3 text-xs"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            {/* Existing image indicator */}
                            {image.existing && (
                              <div className="absolute bottom-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                                Saved
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Pricing</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="requestPrice"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>{dict.developer?.properties?.requestPrice || "Request Price"}</FormLabel>
                          <p className="text-xs text-muted-foreground">
                            {dict.developer?.properties?.requestPriceDescription || "Check this if you prefer inquiries instead of showing price"}
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  {!form.watch("requestPrice") && (
                    <FormField
                      control={form.control}
                      name="price_per_m2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">{dict.developer?.properties?.pricePerM2 || "Price per m² (EUR)"}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 1200"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
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
                          <FormControl>
                            <AddressSearchField
                              value={field.value || ""}
                              onChange={(value) => {
                                field.onChange(value)
                                setAddressSelected(false)
                              }}
                              onSelect={handleAddressSelect}
                              onBlur={(address) => {
                                // If coordinates are not set, try to geocode the address
                                const currentLat = form.getValues("latitude")
                                const currentLng = form.getValues("longitude")
                                if (address && (!currentLat || !currentLng)) {
                                  forwardGeocode(address)
                                }
                              }}
                              placeholder={dict.developer?.properties?.placeholders?.address || "Start typing an address (e.g., Sofia, Bulgaria)"}
                              regionCodes={["bg"]}
                              className={`w-full ${addressSelected ? "ring-2 ring-green-500" : ""}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="text-sm text-gray-600">
                      <p>• {dict.developer?.properties?.addressPreFilled || "Address is pre-filled from your current project data"}</p>
                      <p>• {dict.developer?.properties?.addressUpdate || "You can update the address and fine-tune the position on the map"}</p>
                      <p>• {dict.developer?.properties?.addressMapInstructions || "Click on the map or drag the marker to adjust the exact location"}</p>
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
                        title={dict.developer?.properties?.features?.title || "Property Features"}
                        description={dict.developer?.properties?.features?.description || "Update the features and amenities available in your property. This helps potential buyers understand what your project offers."}
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
                <div className="flex gap-4">
                  <Button type="submit" disabled={isSubmitting} className="px-8 h-12 text-base">
                    {isSubmitting ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin mr-2" />
                        {dict.developer?.properties?.savingChanges || "Saving Changes..."}
                      </>
                    ) : (
                      dict.developer?.properties?.saveChanges || "Save Changes"
                    )}
                  </Button>
                  
                  <Link href="/developer/properties">
                    <Button type="button" variant="outline" disabled={isSubmitting} className="px-8 h-12 text-base">
                      {dict.developer?.properties?.cancel || "Cancel"}
                    </Button>
                  </Link>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}