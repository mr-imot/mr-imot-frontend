"use client"

import { Facebook, Linkedin, Twitter, Link as LinkIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function SocialShare({ title }: { title: string }) {
  const pathname = usePathname()
  
  const getUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.href
    }
    return `https://mrimot.com${pathname}`
  }

  const shareOnFacebook = () => {
    const url = getUrl()
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank")
  }

  const shareOnTwitter = () => {
    const url = getUrl()
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, "_blank")
  }

  const shareOnLinkedin = () => {
    const url = getUrl()
    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, "_blank")
  }

  const copyLink = () => {
    const url = getUrl()
    navigator.clipboard.writeText(url)
    toast.success("Link copied to clipboard")
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground mr-2">Share:</span>
      <Button variant="outline" size="icon" onClick={shareOnFacebook} className="h-8 w-8 rounded-full">
        <Facebook className="h-4 w-4" />
        <span className="sr-only">Share on Facebook</span>
      </Button>
      <Button variant="outline" size="icon" onClick={shareOnTwitter} className="h-8 w-8 rounded-full">
        <Twitter className="h-4 w-4" />
        <span className="sr-only">Share on Twitter</span>
      </Button>
      <Button variant="outline" size="icon" onClick={shareOnLinkedin} className="h-8 w-8 rounded-full">
        <Linkedin className="h-4 w-4" />
        <span className="sr-only">Share on LinkedIn</span>
      </Button>
      <Button variant="outline" size="icon" onClick={copyLink} className="h-8 w-8 rounded-full">
        <LinkIcon className="h-4 w-4" />
        <span className="sr-only">Copy link</span>
      </Button>
    </div>
  )
}












