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
import { getProject, updateProject, attachProjectImages, deleteProjectImage, getProjectImages } from "@/lib/api"
import { upload } from "@imagekit/next";
import { ensureGoogleMaps } from "@/lib/google-maps"
import { Info, Loader, Upload, X, Move, Star, Image as ImageIcon, Plus, ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { FeaturesSelector } from "@/components/FeaturesSelector"
import Link from "next/link"

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

const projectTypeOptions = [
  { label: "Apartment building", value: "apartment_building" },
  { label: "House complex", value: "house_complex" },
]

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

export default function EditProjectPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const projectId = resolvedParams.id
  const router = useRouter()
  const { user, isLoading } = useAuth()
  
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
  const markerRef = useRef<google.maps.Marker | null>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const addressInputRef = useRef<HTMLInputElement | null>(null)

  const [loading, setLoading] = useState(true)
  const [images, setImages] = useState<ImageFile[]>([])
  const [draggedImage, setDraggedImage] = useState<ImageFile | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [addressSelected, setAddressSelected] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [geocodingBlocked, setGeocodingBlocked] = useState(false)
  const [placesBlocked, setPlacesBlocked] = useState(false)

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
        const project = await getProject(projectId)
        
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
      } catch (err) {
        console.error('Failed to load project:', err)
        setSubmitError('Failed to load project. Please try again.')
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
          })

          const marker = new google.maps.Marker({
            position: { lat, lng },
            map,
            draggable: true,
            title: "Project Location",
            cursor: "pointer"
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
          marker.addListener("dragend", () => {
            const pos = marker.getPosition()
            if (pos) {
              form.setValue("latitude", pos.lat(), { shouldValidate: true })
              form.setValue("longitude", pos.lng(), { shouldValidate: true })
              reverseGeocode(pos.lat(), pos.lng())
            }
          })

          // Map click - move marker and update coordinates
          map.addListener("click", (e: google.maps.MapMouseEvent) => {
            if (!e.latLng || !markerRef.current) return
            markerRef.current.setPosition(e.latLng)
            form.setValue("latitude", e.latLng.lat(), { shouldValidate: true })
            form.setValue("longitude", e.latLng.lng(), { shouldValidate: true })
            reverseGeocode(e.latLng.lat(), e.latLng.lng())
          })

        } catch (error) {
          console.error('Failed to initialize Google Maps:', error)
        }
      }

      initMapAndPlaces()
    }
  }, [loading, form, geocodingBlocked])

  // Places Autocomplete setup
  useEffect(() => {
    if (!mapInstanceRef.current || !addressInputRef.current) return
    
    const initAutocomplete = async () => {
      try {
        const google = await ensureGoogleMaps()
        
        if (placesBlocked) {
          return
        }
        
        const autocomplete = new google.maps.places.Autocomplete(addressInputRef.current!, {
          componentRestrictions: { country: "bg" }, // Restrict to Bulgaria
          fields: ["address_components", "formatted_address", "geometry", "place_id"],
          types: ["address"]
        })
        
        // Handle place selection
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()
          
          if (place.geometry && place.geometry.location && mapInstanceRef.current && markerRef.current) {
            const location = place.geometry.location
            const newCenter = { lat: location.lat(), lng: location.lng() }
            
            // Update map and marker
            mapInstanceRef.current.setCenter(newCenter)
            mapInstanceRef.current.setZoom(16)
            markerRef.current.setPosition(newCenter)
            
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
            
            // Update form values
            form.setValue("latitude", newCenter.lat, { shouldValidate: true })
            form.setValue("longitude", newCenter.lng, { shouldValidate: true })
            
            // Set city and country if found
            if (city) form.setValue("city", city, { shouldValidate: true })
            if (country) form.setValue("country", country, { shouldValidate: true })
            
            // Set the full address
            form.setValue("address", place.formatted_address || (addressInputRef.current?.value || ''), { shouldValidate: true })
            setAddressSelected(true)
          }
        })
      } catch (error) {
        console.error('Failed to initialize Places Autocomplete:', error)
        setPlacesBlocked(true)
      }
    }

    initAutocomplete()
  }, [mapInstanceRef.current, addressInputRef.current, placesBlocked, form])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const newImage: ImageFile = {
            id: `new-${Date.now()}-${Math.random()}`,
            file,
            preview: e.target?.result as string,
            isMain: images.length === 0,
            order: images.length,
            existing: false
          }
          setImages(prev => [...prev, newImage])
        }
        reader.readAsDataURL(file)
      }
    })
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleImageDelete = async (imageToDelete: ImageFile) => {
    try {
      // If it's an existing image, delete it from backend
      if (imageToDelete.existing && imageToDelete.imageId) {
        await deleteProjectImage(parseInt(projectId), imageToDelete.imageId)
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
    } catch (error) {
      console.error('Failed to delete image:', error)
      setSubmitError('Failed to delete image. Please try again.')
    }
  }

  const handleSetMainImage = (targetImage: ImageFile) => {
    setImages(prev => prev.map(img => ({
      ...img,
      isMain: img.id === targetImage.id
    })))
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
      await attachProjectImages(projectId, uploadedImages)
      
      setSubmitSuccess('Project and images updated successfully!')
      
      setTimeout(() => {
        router.push('/developer/properties')
      }, 2000)

    } catch (error) {
      console.error('Failed to upload images:', error)
      setSubmitError('Failed to upload images. Please try again.')
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

      await updateProject(parseInt(projectId), projectData)
      
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
      
    } catch (err) {
      console.error('Failed to update project:', err)
      setSubmitError('Failed to update project. Please try again.')
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
            Back to Properties
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Project</h1>
          <p className="text-gray-600">Update your project details and features</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">Edit Project</CardTitle>
          <p className="text-gray-600">Update your project details and features</p>
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
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Project Details</h3>
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Project Name <span className="text-red-500">*</span></FormLabel>
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
                          <FormLabel className="text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></FormLabel>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="project_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Project Type <span className="text-red-500">*</span></FormLabel>
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
                          <FormLabel className="text-sm font-medium text-gray-700">Completion Month</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., March" {...field} />
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
                          <FormLabel className="text-sm font-medium text-gray-700">Completion Year</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 2025" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Project Images */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Project Images</h3>
                  
                  <div className="space-y-4">
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-1">Click to upload project images</p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 10MB each</p>
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
                        {images.map((image) => (
                          <div
                            key={image.id}
                            className="relative group aspect-square rounded-lg overflow-hidden border"
                          >
                            <img
                              src={image.preview}
                              alt="Project"
                              className="w-full h-full object-cover"
                            />
                            
                            {/* Main image indicator */}
                            {image.isMain && (
                              <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                                <Star className="h-3 w-3 inline mr-1" />
                                Main
                              </div>
                            )}
                            
                            {/* Action buttons */}
                            <div className="absolute top-2 right-2 flex gap-1">
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
                              <div className="absolute bottom-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                                Existing
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
                          <FormLabel>Request Price</FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Check this if you prefer inquiries instead of showing price
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
                          <FormLabel className="text-sm font-medium text-gray-700">Price per m² (EUR)</FormLabel>
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
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Location & Map</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Project Address <span className="text-red-500">*</span></FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input 
                                ref={addressInputRef}
                                placeholder="Start typing an address (e.g., Sofia, Bulgaria)" 
                                className={`${addressSelected ? "border-green-500 bg-green-50" : ""} h-11`}
                                value={field.value}
                                onChange={(e) => {
                                  field.onChange(e.target.value)
                                  setAddressSelected(false)
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
                      <p>• Address is pre-filled from your current project data</p>
                      <p>• You can update the address and fine-tune the position on the map</p>
                      <p>• Click on the map or drag the marker to adjust the exact location</p>
                    </div>
                  </div>
                  
                  <div className="h-80 rounded-lg overflow-hidden border shadow-sm">
                    <div ref={mapRef} className="w-full h-full" />
                  </div>
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
                        title="Property Features"
                        description="Update the features and amenities available in your property. This helps potential buyers understand what your project offers."
                        disabled={isSubmitting}
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
                        Saving Changes...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                  
                  <Link href="/developer/properties">
                    <Button type="button" variant="outline" disabled={isSubmitting} className="px-8 h-12 text-base">
                      Cancel
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