import { ImageKitProvider } from "@imagekit/next"
import { IK_URL_ENDPOINT } from "@/lib/imagekit"

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ImageKitProvider
      urlEndpoint={IK_URL_ENDPOINT}
      transformationPosition="path"
    >
      {children}
    </ImageKitProvider>
  )
}
