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
import { createProject, uploadProjectImages } from "@/lib/api"
import { ensureGoogleMaps } from "@/lib/google-maps"
import { Info, Loader, Upload, X, Move, Star, Image as ImageIcon, Plus } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getCurrentDeveloper } from "@/lib/api"

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: typeof google
  }
}

const projectTypeOptions = [
  { label: "Apartment building", value: "apartment_building" },
  { label: "House complex", value: "house_complex" },
]

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(10, "Please provide a more detailed description"),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
  address: z.string().min(5, "Address is required"),
  project_type: z.enum(["apartment_building", "house_complex"], {
    required_error: "Choose a project type",
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
}).refine((data) => data.requestPrice || !!data.price_per_m2, {
  path: ["price_per_m2"],
  message: "Price per m² is required unless Request price is checked",
}).refine((data) => data.coverImage || (data.galleryImages && data.galleryImages.length > 0), {
  path: ["coverImage"],
  message: "At least one project image is required",
})

type FormValues = z.infer<typeof formSchema>

interface ImageFile {
  id: string
  file: File
  preview: string
  isMain: boolean
  order: number
}

export default function NewPropertyPage() {
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

  const defaultCenter = useMemo(() => ({ lat: 42.6977, lng: 23.3219 }), [])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      city: "",
      country: "Bulgaria",
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
        })
        mapInstanceRef.current = map

        const marker = new google.maps.Marker({
          position: center,
          map,
          draggable: true,
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
      if (galleryImages && galleryImages.length > 0) {
        files.push(...galleryImages)
      }
      
      if (files.length > 0) {
        await uploadProjectImages(parseInt(projectId), files)
        setSubmitSuccess("Images uploaded successfully!")
        
        // Clear the images
        setImages([])
        form.setValue("coverImage", undefined)
        form.setValue("galleryImages", undefined)
      }
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
      markerRef.current.setPosition(pos)
    }
  }, [latitude, longitude])

  // Initialize autocomplete after map is ready
  useEffect(() => {
    if (!mapInstanceRef.current || !addressInputRef.current) return
    
    const initAutocomplete = async () => {
      console.log('Map is ready, initializing autocomplete...')
      
      try {
        const google = await ensureGoogleMaps()
        console.log('Google Maps loaded successfully')
        
        // Create Google Places Autocomplete (defensive against blocked Places API)
        let autocomplete: google.maps.places.Autocomplete | null = null
        try {
          autocomplete = new google.maps.places.Autocomplete(addressInputRef.current!, {
            componentRestrictions: { country: 'bg' },
            types: ['address'], // Only addresses, not businesses
            fields: ['formatted_address', 'geometry', 'place_id', 'address_components']
          })
          setPlacesBlocked(false)
        } catch (err) {
          console.warn('Places Autocomplete failed to initialize. Ensure "Places API" is enabled for this key.', err)
          setPlacesBlocked(true)
          return
        }
        
        console.log('Autocomplete created successfully')
        
        // Handle place selection
        autocomplete.addListener('place_changed', () => {
          console.log('Place changed event fired')
          const place = autocomplete.getPlace()
          console.log('Selected place:', place)
          
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
            
            console.log('Form updated with place data')
          }
        })
      } catch (error) {
        console.error('Failed to initialize autocomplete:', error)
      }
    }

    // Small delay to ensure everything is ready
    const timer = setTimeout(initAutocomplete, 100)
    return () => clearTimeout(timer)
  }, [mapInstanceRef.current, addressInputRef.current]) // Depend on when these refs are ready

  useEffect(() => {
    return () => {
      // Cleanup object URLs
      images.forEach(img => URL.revokeObjectURL(img.preview))
    }
  }, [images])

  const onSubmit = async (values: FormValues) => {
    if (isSubmitting) return // Prevent duplicate submissions
    
    // DEBUG: Show environment variables
    console.log('🌍 Environment Debug:', {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      isDevelopment: process.env.NODE_ENV === 'development'
    });
    
    setLoading(true)
    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(null)
    
    try {
      // Validate required fields before submission
      if (!values.name?.trim()) {
        throw new Error("Project name is required")
      }
      if (!values.description?.trim()) {
        throw new Error("Project description is required")
      }
      if (!values.address?.trim()) {
        throw new Error("Project address is required")
      }
      if (!values.project_type) {
        throw new Error("Project type is required")
      }
      if (!values.completion_month) {
        throw new Error("Project completion month is required")
      }
      if (!values.completion_year) {
        throw new Error("Project completion year is required")
      }
      if (!values.coverImage && (!values.galleryImages || values.galleryImages.length === 0)) {
        throw new Error("At least one project image is required")
      }
      
      // First, create the project
      const project = await createProject({
        name: values.name,
        description: values.description,
        city: values.city,
        country: values.country,
        address: values.address,
        project_type: values.project_type,
        website: values.website || undefined,
        price_label: values.requestPrice ? "Request price" : undefined,
        price_per_m2: values.requestPrice ? undefined : values.price_per_m2,
        latitude: values.latitude,
        longitude: values.longitude,
        completion_date: `${values.completion_month} ${values.completion_year}`,
      })
      
      setSubmitSuccess("Project created successfully!")
      setCreatedProjectId(project.id.toString())
      
      // Then upload images if any
      if (values.coverImage || (values.galleryImages && values.galleryImages.length > 0)) {
        try {
          const files: File[] = []
          
          // Add cover image first (it will be marked as cover)
          if (values.coverImage) {
            files.push(values.coverImage)
          }
          
          // Add gallery images
          if (values.galleryImages && values.galleryImages.length > 0) {
            files.push(...values.galleryImages)
          }
          
          // Upload images to the project
          await uploadProjectImages(project.id, files)
          setSubmitSuccess("Project created with images successfully!")
        } catch (imageError) {
          console.error("Failed to upload images", imageError)
          setSubmitError("Project created but image upload failed. You can add images later from the project page.")
          setLoading(false)
          return
        }
      }
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push("/developer/dashboard")
      }, 1500)
      
    } catch (err: any) {
      console.error("Failed to create project", err)
      let errorMessage = "Failed to create project. Please try again."
      
      if (err.message) {
        if (err.message.includes("Failed to fetch")) {
          errorMessage = "Connection error. Please check if the backend is running and try again."
        } else if (err.message.includes("required")) {
          errorMessage = err.message
        } else {
          errorMessage = err.message
        }
      }
      
      setSubmitError(errorMessage)
    } finally {
      setLoading(false)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">Create New Project</CardTitle>
          <p className="text-gray-600">Fill in the details below to showcase your real estate project</p>
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
                              <TooltipTrigger className="text-muted-foreground">
                                <Info className="h-4 w-4" />
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
                              <SelectValue placeholder="Choose project type" />
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
                         <FormLabel className="text-sm font-medium text-gray-700">Project Completion Month <span className="text-red-500">*</span></FormLabel>
                         <FormControl>
                           <Select onValueChange={field.onChange} value={field.value}>
                             <SelectTrigger className="h-11">
                               <SelectValue placeholder="Choose month" />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="January">January</SelectItem>
                               <SelectItem value="February">February</SelectItem>
                               <SelectItem value="March">March</SelectItem>
                               <SelectItem value="April">April</SelectItem>
                               <SelectItem value="May">May</SelectItem>
                               <SelectItem value="June">June</SelectItem>
                               <SelectItem value="July">July</SelectItem>
                               <SelectItem value="August">August</SelectItem>
                               <SelectItem value="September">September</SelectItem>
                               <SelectItem value="October">October</SelectItem>
                               <SelectItem value="November">November</SelectItem>
                               <SelectItem value="December">December</SelectItem>
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
                         <FormLabel className="text-sm font-medium text-gray-700">Project Completion Year <span className="text-red-500">*</span></FormLabel>
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

                                     <FormField
                     control={form.control}
                     name="city"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel className="text-sm font-medium text-gray-700">City <span className="text-red-500">*</span></FormLabel>
                         <FormControl>
                           <Input placeholder="e.g., Sofia" className="h-11" {...field} />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />

                   <FormField
                     control={form.control}
                     name="country"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel className="text-sm font-medium text-gray-700">Country <span className="text-red-500">*</span></FormLabel>
                         <FormControl>
                           <Input placeholder="e.g., Bulgaria" className="h-11" {...field} />
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
                         <FormLabel className="text-sm font-medium text-gray-700">Project Website</FormLabel>
                         <FormControl>
                           <Input 
                             type="url" 
                             placeholder="https://example.com" 
                             className="h-11"
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
                          <FormLabel className="mb-0 text-sm font-medium text-gray-700">Request price</FormLabel>
                        </FormItem>
                      )}
                    />

                    {!form.watch("requestPrice") && (
                      <FormField
                        control={form.control}
                        name="price_per_m2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">Price per m² <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                placeholder="e.g., 1200"
                                className="h-11"
                                value={field.value ?? ""}
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
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Project Images</h3>
                  
                  {/* Image Upload Area */}
                  <div className="space-y-4">
                                         <div className="flex items-center justify-between">
                       <div>
                         <h4 className="text-sm font-medium text-gray-700">Project Gallery <span className="text-red-500">*</span></h4>
                         <p className="text-xs text-gray-500">First image will be the main cover image</p>
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
                        Add Images
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
                        <p className="text-sm text-gray-600 mb-2">Click here to upload images or drag and drop</p>
                        <p className="text-xs text-gray-500">Upload images to showcase your project</p>
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
                                Main
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
                                {image.isMain ? 'Main' : 'Set Main'}
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
                            <p className="font-medium mb-1">Image Tips:</p>
                            <ul className="space-y-1 text-xs">
                              <li>• Drag images to reorder them</li>
                              <li>• First image becomes the main cover image</li>
                              <li>• Images will appear in this order on your listing</li>
                              <li>• Main image shows on map cards and search results</li>
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
                                  onKeyDown={() => {
                                    // allow free typing; Places library will hook into key events itself
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
                        <p>• Start typing in the address field above - Google will suggest addresses</p>
                        <p>• Select an address to automatically pin it on the map and fill city/country fields</p>
                        <p>• Click on the map or drag the marker to fine-tune the exact position</p>
                        <p>• The address field will update automatically when you move the marker</p>
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

              {/* Submit Section */}
              <div className="pt-6 border-t">
                {!createdProjectId ? (
                  <Button type="submit" disabled={isSubmitting} className="w-full lg:w-auto px-8 h-12 text-base">
                    {isSubmitting ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin mr-2" />
                        Creating Project...
                      </>
                    ) : (
                      "Create Project"
                    )}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Button 
                      type="button"
                      onClick={() => uploadImagesToProject(
                        createdProjectId, 
                        form.getValues("coverImage"),
                        form.getValues("galleryImages")
                      )}
                      disabled={loading || (!form.getValues("coverImage") && !form.getValues("galleryImages")?.length)}
                      className="w-full lg:w-auto px-8 h-12 text-base"
                      variant="outline"
                    >
                      {loading ? (
                        <>
                          <Loader className="h-5 w-5 animate-spin mr-2" />
                          Uploading Images...
                        </>
                      ) : (
                        "Upload Images"
                      )}
                    </Button>
                    
                    <Button 
                      type="button"
                      onClick={() => router.push("/developer/dashboard")}
                      className="w-full lg:w-auto px-8 h-12 text-base"
                    >
                      Go to Dashboard
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


