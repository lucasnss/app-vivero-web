import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/styles/globals.css" // Importar desde la ruta correcta
import ClientThemeProvider from "@/components/client-theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/AuthContext"
import { ApiSetup } from "@/components/auth/ApiSetup"
import { SWRConfig } from 'swr'
import { swrConfig } from '@/lib/swr-config'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Vivero El Ombú",
  description: "Más de 15 años transformando espacios con plantas naturales",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        <AuthProvider>
          <ClientThemeProvider>
            <SWRConfig value={swrConfig}>
              <ApiSetup />
              <main className="relative flex min-h-screen flex-col">
                {children}
              </main>
              <Toaster />
            </SWRConfig>
          </ClientThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
