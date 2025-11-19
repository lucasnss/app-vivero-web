"use client"

import dynamic from "next/dynamic"

// Importación dinámica del componente Toaster para evitar errores de hidratación
const Toaster = dynamic(
  () => import("@/components/ui/toaster").then((mod) => mod.Toaster),
  { ssr: false }
)

export default function ClientToaster() {
  return <Toaster />
} 