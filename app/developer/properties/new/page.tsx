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
import { createProject } from "@/lib/api"
import { ensureGoogleMaps } from "@/lib/google-maps"
import { Info, Loader } from "lucide-react"

const projectTypeOptions = [
  { label: "Apartment building", value: "apartment_building" },
  { label: "House complex", value: "house_complex" },
]

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(10, "Please provide a more detailed description"),
  city: z.string().optional(),
  country: z.string().optional(),
  project_type: z.enum(["apartment_building", "house_complex"], {
    required_error: "Select a project type",
  }),
  requestPrice: z.boolean().default(false),
  price_per_m2: z
    .union([z.number().positive("Enter a valid price"), z.nan()])
    .optional()
    .transform((v) => (Number.isNaN(v) ? undefined : v)),
  location: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  coverImage: z.any().optional(),
  galleryImages: z.any().optional(),
}).refine((data) => data.requestPrice || !!data.price_per_m2, {
  path: ["price_per_m2"],
  message: "Price per m² is required unless Request price is checked",
})

type FormValues = z.infer<typeof formSchema>

export default function NewPropertyPage() {
  const router = useRouter()
  const mapRef = useRef<HTMLDivElement | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const autocompleteInputRef = useRef<HTMLInputElement | null>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  const [loading, setLoading] = useState(false)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])

  const defaultCenter = useMemo(() => ({ lat: 42.6977, lng: 23.3219 }), [])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      city: "Sofia",
      country: "Bulgaria",
      project_type: "apartment_building",
      requestPrice: false,
      price_per_m2: undefined,
      location: "",
      latitude: defaultCenter.lat,
      longitude: defaultCenter.lng,
      coverImage: undefined,
      galleryImages: undefined,
    },
    mode: "onBlur",
  })

  const latitude = form.watch("latitude")
  const longitude = form.watch("longitude")

  useEffect(() => {
    const initMapAndPlaces = async () => {
      try {
        const google = await ensureGoogleMaps()

        if (!mapRef.current) return

        const center = { lat: latitude, lng: longitude }
        const map = new google.maps.Map(mapRef.current, {
          center,
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        })
        mapInstanceRef.current = map

        const marker = new google.maps.Marker({
          position: center,
          map,
          draggable: true,
        })
        markerRef.current = marker

        marker.addListener("dragend", () => {
          const pos = marker.getPosition()
          if (pos) {
            form.setValue("latitude", pos.lat(), { shouldValidate: true })
            form.setValue("longitude", pos.lng(), { shouldValidate: true })
          }
        })

        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (!e.latLng || !markerRef.current) return
          markerRef.current.setPosition(e.latLng)
          form.setValue("latitude", e.latLng.lat(), { shouldValidate: true })
          form.setValue("longitude", e.latLng.lng(), { shouldValidate: true })
        })

        // Places Autocomplete - restrict to street addresses in Bulgaria
        if (autocompleteInputRef.current) {
          const ac = new google.maps.places.Autocomplete(autocompleteInputRef.current, {
            fields: ["geometry", "address_components", "formatted_address", "name"],
            types: ["address"],
            componentRestrictions: { country: ["bg"] },
          })
          autocompleteRef.current = ac
          ac.addListener("place_changed", () => {
            const place = ac.getPlace()
            const geometry = place.geometry
            if (geometry && geometry.location) {
              const loc = geometry.location
              const newCenter = { lat: loc.lat(), lng: loc.lng() }
              map.setCenter(newCenter)
              marker.setPosition(newCenter)
              form.setValue("latitude", newCenter.lat, { shouldValidate: true })
              form.setValue("longitude", newCenter.lng, { shouldValidate: true })
            }

            // Try to populate city/country
            const comps = place.address_components || []
            const getComp = (type: string) => comps.find((c) => c.types.includes(type))
            const locality = getComp("locality")?.long_name || getComp("sublocality")?.long_name
            const country = getComp("country")?.long_name
            if (locality) form.setValue("city", locality)
            if (country) form.setValue("country", country)
            if (place.formatted_address) form.setValue("location", place.formatted_address)
          })

          // Fallback: if user presses Enter without selecting a suggestion, geocode the raw text
          autocompleteInputRef.current.addEventListener("keydown", (ev) => {
            if (ev.key === "Enter") {
              ev.preventDefault()
              const query = autocompleteInputRef.current?.value?.trim()
              if (!query) return
              const geocoder = new google.maps.Geocoder()
              geocoder.geocode(
                { address: query, componentRestrictions: { country: "BG" } },
                (results, status) => {
                  if (status === "OK" && results && results[0]) {
                    const loc = results[0].geometry.location
                    const newCenter = { lat: loc.lat(), lng: loc.lng() }
                    map.setCenter(newCenter)
                    marker.setPosition(newCenter)
                    form.setValue("latitude", newCenter.lat, { shouldValidate: true })
                    form.setValue("longitude", newCenter.lng, { shouldValidate: true })
                    form.setValue("location", results[0].formatted_address)
                  }
                }
              )
            }
          })
        }
      } catch (e) {
        console.error("Failed to initialize Google Maps/Places", e)
      }
    }

    initMapAndPlaces()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // Keep marker in sync when lat/lng change externally
    if (markerRef.current && mapInstanceRef.current) {
      const pos = { lat: latitude, lng: longitude }
      markerRef.current.setPosition(pos)
      // don't recenter map to avoid disrupting user interaction
    }
  }, [latitude, longitude])

  useEffect(() => {
    return () => {
      // Cleanup object URLs
      if (coverPreview) URL.revokeObjectURL(coverPreview)
      galleryPreviews.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [coverPreview, galleryPreviews])

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      await createProject({
        name: values.name,
        description: values.description,
        city: values.city,
        country: values.country,
        project_type: values.project_type,
        price_label: values.requestPrice ? "Request price" : undefined,
        price_per_m2: values.requestPrice ? undefined : values.price_per_m2,
        latitude: values.latitude,
        longitude: values.longitude,
      })
      router.push("/developer/dashboard")
    } catch (err) {
      console.error("Failed to create project", err)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Sunrise Residences" {...field} />
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
                        <FormLabel>Description</FormLabel>
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
                        <Textarea rows={5} placeholder="Tell buyers what makes this project special" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
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
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="Country" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="project_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
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

                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="requestPrice"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                        </FormControl>
                        <FormLabel className="mb-0">Request price</FormLabel>
                      </FormItem>
                    )}
                  />

                  {!form.watch("requestPrice") && (
                    <FormField
                      control={form.control}
                      name="price_per_m2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price per m²</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              inputMode="decimal"
                              step="0.01"
                              placeholder="e.g., 1200"
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

                <div className="space-y-2">
                  <FormLabel>Cover image</FormLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      form.setValue("coverImage", file)
                      if (coverPreview) URL.revokeObjectURL(coverPreview)
                      setCoverPreview(file ? URL.createObjectURL(file) : null)
                    }}
                  />
                  {coverPreview && (
                    <img src={coverPreview} alt="Cover preview" className="h-40 w-full object-cover rounded-md border" />
                  )}
                </div>

                <div className="space-y-2">
                  <FormLabel>Gallery images</FormLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = e.target.files ? Array.from(e.target.files) : []
                      form.setValue("galleryImages", files)
                      // cleanup existing
                      galleryPreviews.forEach((u) => URL.revokeObjectURL(u))
                      setGalleryPreviews(files.map((f) => URL.createObjectURL(f)))
                    }}
                  />
                  {galleryPreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {galleryPreviews.map((src, idx) => (
                        <img key={idx} src={src} alt={`Preview ${idx + 1}`} className="h-24 w-full object-cover rounded-md border" />
                      ))}
                    </div>
                  )}
                </div>

                {/* hidden lat/lng to send to backend only */}
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

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? <Loader className="h-4 w-4 animate-spin" /> : "Create Project"}
                </Button>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <FormLabel>Search location</FormLabel>
                  <Input ref={autocompleteInputRef} placeholder="Type an address, area, or city" />
                </div>
                <div className="h-96 rounded-lg overflow-hidden border">
                  <div ref={mapRef} className="w-full h-full" />
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}


