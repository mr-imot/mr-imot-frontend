import { AuthProvider } from "@/lib/auth-context"
import { ImageKitProvider } from "@imagekit/next"
import { IK_URL_ENDPOINT } from "@/lib/imagekit"
import { ThemeProvider } from "@/components/theme-provider"
import GlobalMaintenanceWrapper from "@/components/maintenance/global-maintenance-wrapper"

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ThemeProvider>
      <ImageKitProvider
        urlEndpoint={IK_URL_ENDPOINT}
        transformationPosition="path"
      >
        <GlobalMaintenanceWrapper>
          <AuthProvider>
            {children}
          </AuthProvider>
        </GlobalMaintenanceWrapper>
      </ImageKitProvider>
    </ThemeProvider>
  )
}
