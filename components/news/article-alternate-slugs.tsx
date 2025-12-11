"use client"

import { useEffect } from "react"

type AlternateSlugs = {
  en?: string
  bg?: string
  ru?: string
  gr?: string
}

export function ArticleAlternateSlugs({ slugs }: { slugs: AlternateSlugs }) {
  useEffect(() => {
    // Store alternate slugs globally for language switcher to read
    (window as unknown as { __articleAlternateSlugs?: AlternateSlugs }).__articleAlternateSlugs = slugs
    
    return () => {
      // Cleanup when leaving the article page
      delete (window as unknown as { __articleAlternateSlugs?: AlternateSlugs }).__articleAlternateSlugs
    }
  }, [slugs])
  
  return null
}
