import { notFound } from "next/navigation"
import type { Metadata } from 'next'
import ListingDetailClient from './listing-detail-client'
import { Project } from '@/lib/api'

interface PageProps {
  params: Promise<{
    lang: 'en' | 'bg'
    id: string
  }>
}

// Server-side function to fetch project data
async function getProjectData(id: string): Promise<Project | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const baseUrl = apiUrl.replace(/\/$/, '')
    const response = await fetch(`${baseUrl}/api/v1/projects/${id}`, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Failed to fetch project: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching project for metadata:', error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, id } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mrimot.com'
  const baseUrl = siteUrl.replace(/\/$/, '')
  
  const project = await getProjectData(id)
  
  if (!project) {
    return {
      title: 'Project Not Found',
      robots: {
        index: false,
        follow: false,
      },
    }
  }
  
  const isBg = lang === 'bg'
  const brand = isBg ? 'Мистър Имот' : 'Mister Imot'
  const projectTitle = project.title || project.name || 'New Construction Project'
  const projectDescription = project.description 
    ? project.description.substring(0, 160) 
    : (isBg 
      ? `Открийте ${projectTitle} в ${project.city || 'България'}. Директна връзка със строителя, без посредници.`
      : `Discover ${projectTitle} in ${project.city || 'Bulgaria'}. Connect directly with the developer, no middlemen.`)
  
  const title = isBg
    ? `${projectTitle} – ${brand} | Ново Строителство в ${project.city || 'България'}`
    : `${projectTitle} – ${brand} | New Construction in ${project.city || 'Bulgaria'}`
  
  // Use pretty URL for Bulgarian, canonical for English
  const canonicalUrl = isBg 
    ? `${baseUrl}/bg/obiavi/${id}`
    : `${baseUrl}/en/listings/${id}`
  
  const ogLocale = isBg ? 'bg_BG' : 'en_US'
  const ogImage = project.cover_image_url || project.images?.[0]?.image_url
  
  return {
    title,
    description: projectDescription,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/en/listings/${id}`,
        bg: `${baseUrl}/bg/obiavi/${id}`,
        'x-default': `${baseUrl}/en/listings/${id}`,
      },
    },
    openGraph: {
      title,
      description: projectDescription,
      url: canonicalUrl,
      siteName: brand,
      locale: ogLocale,
      alternateLocale: ['en_US', 'bg_BG'],
      type: 'website',
      ...(ogImage && { images: [{ url: ogImage }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: projectDescription,
      ...(ogImage && { images: [ogImage] }),
    },
  }
}

export default async function ListingPage({ params }: PageProps) {
  const { lang, id } = await params
  
  // Verify project exists server-side
  const project = await getProjectData(id)
  
  if (!project) {
    notFound()
  }
  
  return <ListingDetailClient projectId={id} />
}
