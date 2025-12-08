import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Heart, Settings } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { formatTitleWithBrand } from "@/lib/seo"
import type { Metadata } from 'next'

type TabType = "profile" | "saved" | "settings"

export async function generateMetadata(): Promise<Metadata> {
  const title = formatTitleWithBrand('Buyer Dashboard', 'en')
  return {
    title,
    robots: {
      index: false, // Buyer dashboard should not be indexed
      follow: false,
    },
  }
}

export default function BuyerDashboardPage() {
  const navItems = [
    { name: "Profile", icon: User, href: "/buyer/dashboard?tab=profile" },
    { name: "Saved Listings", icon: Heart, href: "/buyer/dashboard?tab=saved" },
    { name: "Settings", icon: Settings, href: "/buyer/dashboard?tab=settings" },
  ]

  // This would typically be dynamic based on URL params
  const activeTab = "profile" as TabType // Default to profile for demonstration

  const savedListings = [
    {
      id: 1,
      title: "Luxury Apartments - City Center",
      location: "Sofia, Bulgaria",
      image: "/placeholder.svg?height=150&width=200",
    },
    {
      id: 2,
      title: "Green Valley Villas",
      location: "Plovdiv, Bulgaria",
      image: "/placeholder.svg?height=150&width=200",
    },
  ]

  return (
    <div className="container py-xl md:py-2xl bg-nova-background text-nova-text-primary min-h-[calc(100vh-72px)]">
      <div className="flex flex-col md:flex-row gap-xl">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-nova-surface p-lg rounded-lg shadow-card flex-shrink-0">
          <h2 className="text-[2rem] font-semibold leading-[1.3] text-nova-secondary mb-lg">Buyer Dashboard</h2>
          <nav className="space-y-sm">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-md rounded-md px-md py-sm text-nova-text-primary transition-colors hover:bg-gray-100",
                  activeTab === item.name.toLowerCase().replace(/\s/g, "")
                    ? "bg-nova-secondary text-nova-secondary-foreground hover:bg-nova-secondary"
                    : "",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-nova-surface p-lg rounded-lg shadow-card">
          <h1 className="text-[2.5rem] font-bold leading-[1.2] text-nova-text-primary mb-xl">
            {activeTab === "profile" && "My Profile"}
            {activeTab === "saved" && "Saved Listings"}
            {activeTab === "settings" && "Account Settings"}
          </h1>

          {activeTab === "profile" && (
            <div className="space-y-lg">
              <p className="text-base font-normal leading-[1.6] text-nova-text-secondary">
                Manage your personal details and preferences.
              </p>
              <Card className="shadow-card rounded-lg">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-md">
                  <div>
                    <label className="block text-sm font-medium text-nova-text-primary">Full Name</label>
                    <Input value="Jane Doe" readOnly className="border-nova-border rounded-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nova-text-primary">Email</label>
                    <Input value="jane.doe@example.com" readOnly className="border-nova-border rounded-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nova-text-primary">Phone Number</label>
                    <Input value="+1 (555) 123-4567" readOnly className="border-nova-border rounded-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nova-text-primary">Preferred Location</label>
                    <Input value="Sofia, Bulgaria" readOnly className="border-nova-border rounded-sm" />
                  </div>
                  <Button className="bg-nova-primary text-nova-primary-foreground hover:bg-nova-primary-dark">
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "saved" && (
            <div className="space-y-md">
              <p className="text-base font-normal leading-[1.6] text-nova-text-secondary">
                Your favorite projects, saved for easy access.
              </p>
              {savedListings.length > 0 ? (
                <div className="grid gap-md md:grid-cols-2">
                  {savedListings.map((listing) => (
                    <Card
                      key={listing.id}
                      className="flex items-center bg-nova-surface shadow-card rounded-lg overflow-hidden transition-all duration-300 hover:shadow-hover"
                    >
                      <div className="relative h-24 w-24 flex-shrink-0">
                        <Image
                          src={listing.image || "/placeholder.svg"}
                          alt={listing.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardContent className="flex-grow p-md">
                        <h3 className="text-lg font-semibold leading-[1.4] text-nova-text-primary">
                          {listing.title}
                        </h3>
                        <p className="text-sm text-nova-text-secondary">
                          {listing.location}
                        </p>
                        <Button variant="link" className="p-0 h-auto text-nova-secondary hover:underline mt-sm">
                          View Project
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-base font-normal leading-[1.6] text-nova-text-secondary">
                  You haven&apos;t saved any listings yet.
                </p>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-md">
              <p className="text-base font-normal leading-[1.6] text-nova-text-secondary">
                Adjust your account settings.
              </p>
              <Card className="shadow-card rounded-lg">
                <CardHeader>
                  <CardTitle>Password Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-md">
                  <div>
                    <label className="block text-sm font-medium text-nova-text-primary">Current Password</label>
                    <Input type="password" className="border-nova-border rounded-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nova-text-primary">New Password</label>
                    <Input type="password" className="border-nova-border rounded-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nova-text-primary">Confirm New Password</label>
                    <Input type="password" className="border-nova-border rounded-sm" />
                  </div>
                  <Button className="bg-nova-primary text-nova-primary-foreground hover:bg-nova-primary-dark">
                    Update Password
                  </Button>
                </CardContent>
              </Card>
              <Card className="shadow-card rounded-lg">
                <CardHeader>
                  <CardTitle>Email Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base font-normal leading-[1.6] text-nova-text-secondary">
                    Control which emails you receive.
                  </p>
                  {/* Placeholder for toggles */}
                  <Button className="bg-nova-primary text-nova-primary-foreground hover:bg-nova-primary-dark mt-md">
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
