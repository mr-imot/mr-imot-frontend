"use client"

import { Button } from "@/components/ui/button"
import { Building } from "lucide-react"

interface NotFoundPageProps {
  lang: 'en' | 'bg'
}

export default function NotFoundPage({ lang }: NotFoundPageProps) {
  const isBg = lang === 'bg'
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Building className="w-10 h-10 text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-3">
        {isBg ? 'Имотът не е намерен' : 'Property Not Found'}
      </h2>
      <p className="text-gray-600 mb-6">
        {isBg 
          ? 'Имотът, който търсите, не съществува или е премахнат.' 
          : "The property you're looking for doesn't exist or has been removed."}
      </p>
      <Button onClick={() => window.history.back()}>
        {isBg ? 'Назад' : 'Go Back'}
      </Button>
    </div>
  )
}

