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
import { ensureGoogleMaps } from "@/lib/google-maps"
import { useAuth } from "@/lib/auth-context"
import { getCurrentDeveloper, updateDeveloperProfile, changeDeveloperPassword } from "@/lib/api"
import { Loader, MapPin, Building, User, Phone, Mail, Globe, Lock, Save, Eye, EyeOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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
  email: string
  company_name: string
  contact_person: string
  phone: string
  office_address: string
  office_latitude?: number
  office_longitude?: number
  website: string
  verification_status: string
  created_at: string
}

export default function DeveloperProfilePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  
  // Refs for Google Maps
  const mapRef = useRef<HTMLDivElement | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
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
        const map = new google.maps.Map(mapRef.current, {
          center: profile?.office_latitude && profile?.office_longitude 
            ? { lat: profile.office_latitude, lng: profile.office_longitude }
            : defaultCenter,
          zoom: 15,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          zoomControl: true,
          scrollwheel: true,
          gestureHandling: 'greedy',
        })

        mapInstanceRef.current = map

        // Create marker
        const marker = new google.maps.Marker({
          position: profile?.office_latitude && profile?.office_longitude 
            ? { lat: profile.office_latitude, lng: profile.office_longitude }
            : defaultCenter,
          map: map,
          draggable: true,
        })

        markerRef.current = marker

        // Handle marker drag
        marker.addListener('dragend', () => {
          const position = marker.getPosition()
          if (position) {
            const lat = position.lat()
            const lng = position.lng()
            
            profileForm.setValue("office_latitude", lat, { shouldValidate: true })
            profileForm.setValue("office_longitude", lng, { shouldValidate: true })
            
            // Reverse geocode to get address
            reverseGeocode(lat, lng)
          }
        })

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
    
    const initAutocomplete = async () => {
      try {
        const google = await ensureGoogleMaps()
        const autocomplete = new google.maps.places.Autocomplete(addressInputRef.current!, {
          types: ['establishment', 'geocode'],
          componentRestrictions: { country: 'bg' }
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
            
            // Update form values
            profileForm.setValue("office_latitude", newCenter.lat, { shouldValidate: true })
            profileForm.setValue("office_longitude", newCenter.lng, { shouldValidate: true })
            profileForm.setValue("office_address", place.formatted_address || (addressInputRef.current?.value || ''), { shouldValidate: true })
            setAddressSelected(true)
          }
        })
      } catch (error) {
        console.error('Error initializing autocomplete:', error)
        setPlacesBlocked(true)
      }
    }

    initAutocomplete()
  }, [profileForm])

  // Reverse geocode function
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const google = await ensureGoogleMaps()
      const geocoder = new google.maps.Geocoder()
      
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const address = results[0].formatted_address
          profileForm.setValue("office_address", address, { shouldValidate: true })
          setAddressSelected(true)
        }
      })
    } catch (error) {
      console.error('Error reverse geocoding:', error)
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-2 text-gray-600">Manage your company information and account settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Company Information
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
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter company name" />
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
                          <FormLabel>Contact Person</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter contact person name" />
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
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter phone number" />
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
                          <FormLabel>Website (Optional)</FormLabel>
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
                          <FormLabel>Office Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                {...field}
                                ref={addressInputRef}
                                className="pl-10"
                                placeholder="Search for office address"
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
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
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
                  Change Password
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
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type={showPasswords.current ? "text" : "password"}
                                placeholder="Enter current password"
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
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type={showPasswords.new ? "text" : "password"}
                                placeholder="Enter new password"
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
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type={showPasswords.confirm ? "text" : "password"}
                                placeholder="Confirm new password"
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
                          Changing Password...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Change Password
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
                      ? "Drag the marker or search for a new address to update your office location."
                      : "Search for your office address to set the location on the map."
                    }
                  </p>
                  
                  {geocodingBlocked ? (
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Map is not available</p>
                    </div>
                  ) : (
                    <div ref={mapRef} className="h-64 w-full rounded-lg border" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">{profile?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge 
                    variant={profile?.verification_status === 'verified' ? 'default' : 'secondary'}
                    className="w-fit"
                  >
                    {profile?.verification_status === 'verified' ? 'Verified' : 'Pending Verification'}
                  </Badge>
                </div>

                <div className="flex items-center gap-3">
                  <p className="text-sm text-gray-500">
                    Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
