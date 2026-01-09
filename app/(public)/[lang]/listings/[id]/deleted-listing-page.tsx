"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"

interface DeletedListingPageProps {
  listingId: string
  lang: 'en' | 'bg'
}

export default function DeletedListingPage({ listingId, lang }: DeletedListingPageProps) {
  const isBg = lang === 'bg'
  
  const browseUrl = isBg ? '/bg/obiavi' : '/listings'
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <Badge variant="secondary" className="text-sm px-4 py-2">
            {isBg ? 'Премахната' : 'Removed'}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <AlertCircle className="h-12 w-12 mx-auto text-gray-400" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {isBg 
              ? 'Обявата е премахната'
              : 'This listing has been removed'}
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            {isBg
              ? 'Тази обява вече не е налична. Моля, разгледайте други проекти.'
              : 'This listing is no longer available. Please browse other projects.'}
          </p>
        </div>
        
        <div className="pt-4">
          <Link href={browseUrl}>
            <Button size="lg">
              {isBg ? 'Разгледайте други проекти' : 'Browse Other Projects'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

