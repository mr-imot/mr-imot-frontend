"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { apiClient, createProject } from "@/lib/api"
import { Loader } from "lucide-react"
import { Loader as GoogleLoader } from "@googlemaps/js-api-loader"

export default function NewPropertyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const mapRef = useRef<HTMLDivElement | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)

  const [form, setForm] = useState({
    name: "",
    description: "",
    city: "Sofia",
    country: "Bulgaria",
    project_type: "apartment",
    completion_note: "",
    price_label: "",
    latitude: 42.6977,
    longitude: 23.3219,
  })

  useEffect(() => {
    const initMap = async () => {
      try {
        const loader = new GoogleLoader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
          version: "weekly",
          libraries: ["places"],
        })
        await loader.load()

        if (!mapRef.current) return
        const center = { lat: form.latitude, lng: form.longitude }
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
            setForm((f) => ({ ...f, latitude: pos.lat(), longitude: pos.lng() }))
          }
        })

        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (!e.latLng || !markerRef.current) return
          markerRef.current.setPosition(e.latLng)
          setForm((f) => ({ ...f, latitude: e.latLng!.lat(), longitude: e.latLng!.lng() }))
        })

        setMapReady(true)
      } catch (e) {
        console.error("Failed to initialize Google Maps", e)
      }
    }
    initMap()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createProject({
        name: form.name,
        description: form.description,
        city: form.city,
        country: form.country,
        project_type: form.project_type,
        completion_note: form.completion_note || undefined,
        price_label: form.price_label || undefined,
        latitude: form.latitude,
        longitude: form.longitude,
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
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>City</Label>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Project Type</Label>
                  <Input value={form.project_type} onChange={(e) => setForm({ ...form, project_type: e.target.value })} />
                </div>
                <div>
                  <Label>Price Label</Label>
                  <Input value={form.price_label} onChange={(e) => setForm({ ...form, price_label: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Latitude</Label>
                  <Input type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: parseFloat(e.target.value) })} required />
                </div>
                <div>
                  <Label>Longitude</Label>
                  <Input type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: parseFloat(e.target.value) })} required />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <Loader className="h-4 w-4 animate-spin" /> : "Create Project"}
              </Button>
            </div>
            <div className="h-96 rounded-lg overflow-hidden border">
              <div ref={mapRef} className="w-full h-full" />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


