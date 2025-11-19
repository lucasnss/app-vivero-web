"use client"

import { ThemeProvider } from "@/components/theme-provider"
import ClientToaster from "@/components/client-toaster"

interface ClientThemeProviderProps {
  children: React.ReactNode
}

export default function ClientThemeProvider({ children }: ClientThemeProviderProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
      <ClientToaster />
    </ThemeProvider>
  )
} 