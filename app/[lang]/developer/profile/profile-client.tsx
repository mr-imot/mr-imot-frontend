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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ensureGoogleMaps } from "@/lib/google-maps"
import { useAuth } from "@/lib/auth-context"
import { getCurrentDeveloper, updateDeveloperProfile, changeDeveloperPassword } from "@/lib/api"
import { Loader, MapPin, Building, User, Phone, Mail, Globe, Lock, Save, Eye, EyeOff, Upload, Camera, X, Maximize2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { upload } from "@imagekit/next"
import { ProtectedRoute } from "@/components/protected-route"
import { DeveloperSidebar } from "@/components/developer-sidebar"

interface ProfileClientProps {
  dict: any
  lang: 'en' | 'bg'
}

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: typeof google
  }
}

const profileSchema = z.object({
  company_name: z.string().min(2, "Company name is required"),
  contact_person: z.string().min(2, "Contact person is required"),
  phone: z.string().min(10, "Phone number is required"),
  office_address: z.string().min(5, "Office address is required"),
  website: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  office_latitude: z.number().optional(),
  office_longitude: z.number().optional(),
})

const passwordSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string().min(8, "Please confirm your password"),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
})

interface DeveloperProfile {
  id: string
  email?: string
  company_name: string
  contact_person: string
  phone: string
  office_address: string
  office_latitude?: number
  office_longitude?: number
  website?: string
  profile_image_url?: string
  verification_status: string
  created_at: string
}

export default function DeveloperProfilePage({ dict, lang }: ProfileClientProps) {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  
  // Access translations from dict.developer.profile
  const t = dict?.developer?.profile || {}
  
  // Refs for Google Maps
  const mapRef = useRef<HTMLDivElement | null>(null)
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const addressInputRef = useRef<HTMLInputElement | null>(null)

  // State
  const [profile, setProfile] = useState<DeveloperProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [addressSelected, setAddressSelected] = useState(false)
  const [geocodingBlocked, setGeocodingBlocked] = useState(false)
  const [placesBlocked, setPlacesBlocked] = useState(false)
  const [autocompleteOpen, setAutocompleteOpen] = useState(false)
  const [isMapExpanded, setIsMapExpanded] = useState(false)
  const autocompleteInstanceRef = useRef<google.maps.places.Autocomplete | null>(null)
  
  // Image upload state
  const [imageUploading, setImageUploading] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [imageSuccess, setImageSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Default center for Sofia
  const defaultCenter = useMemo(() => ({ lat: 42.6977, lng: 23.3219 }), [])

  // Forms
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      company_name: "",
      contact_person: "",
      phone: "",
      office_address: "",
      website: "",
      office_latitude: undefined,
      office_longitude: undefined,
    }
  })

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    }
  })

  // Authentication check
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

  // Load developer profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!user || user.user_type !== 'developer') return
      
      try {
        setLoading(true)
        setError(null)
        const developerData = await getCurrentDeveloper()
        setProfile(developerData)
        
        // Update form with loaded data
        
        profileForm.reset({
          company_name: developerData.company_name || "",
          contact_person: developerData.contact_person || "",
          phone: developerData.phone || "",
          office_address: developerData.office_address || "",
          website: developerData.website || "",
          office_latitude: developerData.office_latitude,
          office_longitude: developerData.office_longitude,
        })
        
        setAddressSelected(!!developerData.office_address)
      } catch (err) {
        console.error('Error loading profile:', err)
        setError('Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user, profileForm])

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return

      try {
        await ensureGoogleMaps()
        
        const mapCenter = profile?.office_latitude && profile?.office_longitude 
          ? { lat: profile.office_latitude, lng: profile.office_longitude }
          : defaultCenter
        
        const map = new google.maps.Map(mapRef.current, {
          center: mapCenter,
          zoom: 15,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          zoomControl: true,
          scrollwheel: true,
          gestureHandling: 'greedy',
          mapId: 'e1ea25ce333a0b0deb34ff54', // Required for AdvancedMarkerElement
        })

        mapInstanceRef.current = map

        // Create marker pin element
        const pinElement = document.createElement('div')
        pinElement.innerHTML = '📍'
        pinElement.style.cursor = 'grab'
        pinElement.style.fontSize = '24px'
        pinElement.style.textAlign = 'center'

        // Create marker
        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: profile?.office_latitude && profile?.office_longitude 
            ? { lat: profile.office_latitude, lng: profile.office_longitude }
            : defaultCenter,
          map: map,
          content: pinElement,
          gmpDraggable: true,
        })

        markerRef.current = marker

        // Handle marker drag
        marker.addEventListener('dragend', (event) => {
          const target = event.target as google.maps.marker.AdvancedMarkerElement | null
          if (!target || !target.position) return
          
          // Handle both LatLng object (functions) and LatLngLiteral (numbers)
          const position = target.position
          const lat = typeof position.lat === 'function' ? position.lat() : position.lat
          const lng = typeof position.lng === 'function' ? position.lng() : position.lng
          
          if (typeof lat === 'number' && typeof lng === 'number') {
            profileForm.setValue("office_latitude", lat, { shouldValidate: true })
            profileForm.setValue("office_longitude", lng, { shouldValidate: true })
            
            // Reverse geocode to get address
            reverseGeocode(lat, lng)
          }
        })

        // Map click - move marker and update coordinates
        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (!e.latLng || !markerRef.current) return
          const newPosition = { lat: e.latLng.lat(), lng: e.latLng.lng() }
          markerRef.current.position = newPosition
          profileForm.setValue("office_latitude", newPosition.lat, { shouldValidate: true })
          profileForm.setValue("office_longitude", newPosition.lng, { shouldValidate: true })
          reverseGeocode(newPosition.lat, newPosition.lng)
        })

        // If we have an address but no coordinates, geocode it after map is ready
        if (profile?.office_address && (!profile.office_latitude || !profile.office_longitude)) {
          setTimeout(() => {
            forwardGeocode(profile.office_address)
          }, 500) // Small delay to ensure map is fully rendered
        }

      } catch (error) {
        console.error('Error initializing map:', error)
        setGeocodingBlocked(true)
      }
    }

    if (profile) {
      initMap()
    }
  }, [profile, defaultCenter, profileForm])

  // Initialize address autocomplete
  useEffect(() => {
    if (!mapInstanceRef.current || !addressInputRef.current) return
    
    let checkInterval: NodeJS.Timeout | null = null
    const inputElement = addressInputRef.current
    let startCheckingDropdown: (() => void) | null = null
    
    const initAutocomplete = async () => {
      try {
        const google = await ensureGoogleMaps()
        
        if (placesBlocked) {
          return
        }
        
        const autocomplete = new google.maps.places.Autocomplete(addressInputRef.current!, {
          componentRestrictions: { country: "bg" }, // Restrict to Bulgaria
          fields: ["address_components", "formatted_address", "geometry", "place_id"],
          types: ["geocode"] // Includes addresses, cities, villages, and other geographic locations
        })

        autocompleteInstanceRef.current = autocomplete

        // Track when autocomplete dropdown opens/closes
        // Note: Google Places Autocomplete doesn't have direct events for dropdown visibility
        // We'll use a workaround by checking if pac-container is visible
        startCheckingDropdown = () => {
          if (checkInterval) return
          checkInterval = setInterval(() => {
            // Check if pac-container (Google's autocomplete dropdown) is visible
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

        // Start checking when user focuses or types
        inputElement.addEventListener('focus', startCheckingDropdown)
        inputElement.addEventListener('input', startCheckingDropdown)

        // Handle place selection
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()
          
          // Stop checking dropdown
          if (checkInterval) {
            clearInterval(checkInterval)
            checkInterval = null
          }
          setAutocompleteOpen(false)
          
          if (place.geometry && place.geometry.location && mapInstanceRef.current && markerRef.current) {
            const location = place.geometry.location
            const newCenter = { lat: location.lat(), lng: location.lng() }
            const formattedAddress = place.formatted_address || (addressInputRef.current?.value || '')
            
            // Update map and marker
            mapInstanceRef.current.setCenter(newCenter)
            mapInstanceRef.current.setZoom(16)
            markerRef.current.position = newCenter
            
            // Update form values - ensure input field is synced
            profileForm.setValue("office_latitude", newCenter.lat, { shouldValidate: true })
            profileForm.setValue("office_longitude", newCenter.lng, { shouldValidate: true })
            profileForm.setValue("office_address", formattedAddress, { shouldValidate: true })
            
            // Also update the input field directly to ensure UI sync
            if (addressInputRef.current) {
              addressInputRef.current.value = formattedAddress
            }
            
            setAddressSelected(true)
          }
        })
      } catch (error) {
        console.error('Error initializing autocomplete:', error)
        setPlacesBlocked(true)
      }
    }

    initAutocomplete()

    // Cleanup function
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval)
      }
      if (inputElement && startCheckingDropdown) {
        inputElement.removeEventListener('focus', startCheckingDropdown)
        inputElement.removeEventListener('input', startCheckingDropdown)
      }
      if (autocompleteInstanceRef.current && typeof window !== 'undefined' && window.google) {
        window.google.maps.event.clearInstanceListeners(autocompleteInstanceRef.current)
      }
    }
  }, [mapInstanceRef.current, addressInputRef.current, placesBlocked, profileForm])

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

  // Reverse geocode function
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const google = await ensureGoogleMaps()
      const geocoder = new google.maps.Geocoder()
      
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const address = results[0].formatted_address
          // Update form value
          profileForm.setValue("office_address", address, { shouldValidate: true })
          // Also update the input field directly to ensure UI sync
          if (addressInputRef.current) {
            addressInputRef.current.value = address
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
      console.error('Error reverse geocoding:', error)
      setGeocodingBlocked(true)
    }
  }

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
          
          // Update form values - IMPORTANT: Update the input field value too
          profileForm.setValue("office_latitude", newPosition.lat, { shouldValidate: true })
          profileForm.setValue("office_longitude", newPosition.lng, { shouldValidate: true })
          profileForm.setValue("office_address", formattedAddress, { shouldValidate: true })
          
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

  // Handle profile form submission
  const onProfileSubmit = async (data: z.infer<typeof profileSchema>) => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      await updateDeveloperProfile(data)
      setSuccess('Profile updated successfully!')
      
      // Update local profile state
      if (profile) {
        setProfile({ ...profile, ...data })
      }
      
      // Re-initialize map with new coordinates if they exist
      if (data.office_latitude && data.office_longitude && mapInstanceRef.current && markerRef.current) {
        const newPosition = { lat: data.office_latitude, lng: data.office_longitude }
        mapInstanceRef.current.setCenter(newPosition)
        mapInstanceRef.current.setZoom(16)
        markerRef.current.position = newPosition
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  // Handle password form submission
  const onPasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
    try {
      setPasswordSaving(true)
      setPasswordError(null)
      setPasswordSuccess(null)

      await changeDeveloperPassword({
        current_password: data.current_password,
        new_password: data.new_password
      })
      
      setPasswordSuccess('Password changed successfully!')
      passwordForm.reset()
    } catch (err) {
      console.error('Error changing password:', err)
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setPasswordSaving(false)
    }
  }

  // Toggle password visibility
  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  // Handle profile image upload
  const handleImageUpload = async (file: File) => {
    try {
      setImageUploading(true)
      setImageError(null)
      setImageSuccess(null)

      // Get auth params for ImageKit upload
      const authRes = await fetch("/api/upload-auth")
      if (!authRes.ok) throw new Error("Failed to get upload auth params")
      const { token, expire, signature, publicKey } = await authRes.json()

      // Upload to ImageKit
      const uploadResponse = await upload({
        file,
        fileName: `developer_profile_${profile?.id}_${Date.now()}_${file.name}`,
        token,
        expire,
        signature,
        publicKey,
      })

      if (!uploadResponse.url || !uploadResponse.fileId) {
        throw new Error('ImageKit upload failed - missing url or fileId')
      }

      // Update developer profile with new image URL
      await updateDeveloperProfile({
        profile_image_url: uploadResponse.url
      })

      // Update local state
      setProfile(prev => prev ? { ...prev, profile_image_url: uploadResponse.url } : null)
      setImageSuccess('Profile image updated successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setImageSuccess(null), 3000)

    } catch (error) {
      console.error('Failed to upload image:', error)
      setImageError(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setImageUploading(false)
    }
  }

  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setImageError('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setImageError('Image size must be less than 5MB')
        return
      }
      
      handleImageUpload(file)
    }
  }

  // Remove profile image
  const handleRemoveImage = async () => {
    try {
      setImageUploading(true)
      setImageError(null)
      setImageSuccess(null)

      await updateDeveloperProfile({
        profile_image_url: null
      })

      // Update local state
      setProfile(prev => prev ? { ...prev, profile_image_url: undefined } : null)
      setImageSuccess('Profile image removed successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setImageSuccess(null), 3000)

    } catch (error) {
      console.error('Failed to remove image:', error)
      setImageError(error instanceof Error ? error.message : 'Failed to remove image')
    } finally {
      setImageUploading(false)
    }
  }

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute requiredRole="developer">
      <DeveloperSidebar dict={dict} lang={lang}>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{t.title || "Profile Settings"}</h1>
              <p className="mt-2 text-gray-600">{t.description || "Manage your company information and account settings"}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Profile Information */}
              <div className="space-y-6">
            {/* Profile Image */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  {t.profileImage || "Profile Image"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-6">
                  {/* Avatar Display */}
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage 
                        src={profile?.profile_image_url} 
                        alt={`${profile?.company_name} profile`}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                        {profile?.company_name?.charAt(0) || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    {imageUploading && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <Loader className="h-6 w-6 animate-spin text-white" />
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-3">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={imageUploading}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        {profile?.profile_image_url ? (t.uploadImage || 'Change Image') : (t.uploadImage || 'Upload Image')}
                      </Button>
                      
                      {profile?.profile_image_url && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveImage}
                          disabled={imageUploading}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                          {t.removeImage || "Remove"}
                        </Button>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Upload a professional photo for your developer profile. 
                      Max size: 5MB. Supported formats: JPG, PNG, WebP.
                    </p>

                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {/* Image upload messages */}
                    {imageError && (
                      <Alert variant="destructive">
                        <AlertDescription>{imageError}</AlertDescription>
                      </Alert>
                    )}
                    
                    {imageSuccess && (
                      <Alert className="border-green-200 bg-green-50">
                        <AlertDescription className="text-green-800">
                          {imageSuccess}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  {t.personalInfo || "Company Information"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    {/* Company Name */}
                    <FormField
                      control={profileForm.control}
                      name="company_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.companyName || "Company Name"}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={t.enterCompanyName || "Enter company name"} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Contact Person */}
                    <FormField
                      control={profileForm.control}
                      name="contact_person"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.contactPerson || "Contact Person"}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={t.enterContactPerson || "Enter contact person name"} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Phone */}
                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.phone || "Phone Number"}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={t.enterPhoneNumber || "Enter phone number"} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Website */}
                    <FormField
                      control={profileForm.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.website || "Website (Optional)"}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://example.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Office Address */}
                    <FormField
                      control={profileForm.control}
                      name="office_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.officeAddress || "Office Address"}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                {...field}
                                ref={addressInputRef}
                                className="pl-10"
                                placeholder={t.searchOfficeAddress || "Search for office address"}
                                onChange={(e) => {
                                  field.onChange(e)
                                  setAddressSelected(false) // Reset when user types
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
                                    // User must use the "Save Changes" button to submit the form
                                  }
                                }}
                                onBlur={(e) => {
                                  if (e.target.value && !addressSelected) {
                                    forwardGeocode(e.target.value)
                                  }
                                }}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                          {placesBlocked && (
                            <p className="text-sm text-amber-600">
                              Address search is not available. You can still enter the address manually.
                            </p>
                          )}
                        </FormItem>
                      )}
                    />

                    {/* Error/Success Messages */}
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    {success && (
                      <Alert className="border-green-200 bg-green-50">
                        <AlertDescription className="text-green-800">{success}</AlertDescription>
                      </Alert>
                    )}

                    {/* Submit Button */}
                    <Button type="submit" disabled={saving} className="w-full">
                      {saving ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          {t.savingChanges || "Saving..."}
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {t.saveChanges || "Save Changes"}
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Password Change */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  {t.changePassword || "Change Password"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    {/* Current Password */}
                    <FormField
                      control={passwordForm.control}
                      name="current_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.currentPassword || "Current Password"}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type={showPasswords.current ? "text" : "password"}
                                placeholder={t.enterCurrentPassword || "Enter current password"}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => togglePasswordVisibility('current')}
                              >
                                {showPasswords.current ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* New Password */}
                    <FormField
                      control={passwordForm.control}
                      name="new_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.newPassword || "New Password"}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type={showPasswords.new ? "text" : "password"}
                                placeholder={t.enterNewPassword || "Enter new password"}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => togglePasswordVisibility('new')}
                              >
                                {showPasswords.new ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Confirm Password */}
                    <FormField
                      control={passwordForm.control}
                      name="confirm_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.confirmPassword || "Confirm New Password"}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type={showPasswords.confirm ? "text" : "password"}
                                placeholder={t.confirmNewPasswordPlaceholder || "Confirm new password"}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => togglePasswordVisibility('confirm')}
                              >
                                {showPasswords.confirm ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Password Error/Success Messages */}
                    {passwordError && (
                      <Alert variant="destructive">
                        <AlertDescription>{passwordError}</AlertDescription>
                      </Alert>
                    )}
                    {passwordSuccess && (
                      <Alert className="border-green-200 bg-green-50">
                        <AlertDescription className="text-green-800">{passwordSuccess}</AlertDescription>
                      </Alert>
                    )}

                    {/* Submit Button */}
                    <Button type="submit" disabled={passwordSaving} className="w-full">
                      {passwordSaving ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          {t.changingPassword || "Changing Password..."}
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          {t.changePasswordButton || "Change Password"}
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Map and Account Info */}
          <div className="space-y-6">
            {/* Office Location Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Office Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    {addressSelected 
                      ? (t.dragMarkerOrSearch || "Drag the marker or search for a new address to update your office location.")
                      : (t.searchForOfficeAddress || "Search for your office address to set the location on the map.")
                    }
                  </p>
                  
                  {geocodingBlocked ? (
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Map is not available</p>
                    </div>
                  ) : (
                    <>
                      {/* Map container - conditionally styled for expanded view */}
                      <div 
                        className={`relative overflow-hidden transition-all duration-200 ${
                          isMapExpanded 
                            ? 'fixed z-[9999] rounded-2xl border-2 border-gray-300 shadow-2xl' 
                            : 'h-64 w-full rounded-lg border'
                        }`}
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
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t.accountInfo || "Account Information"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.email || "Email"}</p>
                    <p className="text-sm text-gray-600">{profile?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge 
                          variant={profile?.verification_status === 'verified' ? 'default' : 'secondary'}
                          className="w-fit cursor-help"
                        >
                          {profile?.verification_status === 'verified' ? (t.verified || 'Verified') : 'Limited Access'}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent 
                        side="top" 
                        align="center"
                        className="max-w-xs p-3"
                      >
                        <p className="text-sm">
                          {profile?.verification_status === 'verified' 
                            ? 'Your account is fully verified and you can create projects' 
                            : 'Manual verification required for full access to create projects'
                          }
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="flex items-center gap-3">
                  <p className="text-sm text-gray-500">
                    {t.memberSince || "Member since"} {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </CardContent>
            </Card>
              </div>
            </div>
          </div>
        </div>
      </DeveloperSidebar>
    </ProtectedRoute>
  )
}
