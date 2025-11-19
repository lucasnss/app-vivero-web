'use client'

import { useEffect } from 'react'
import { setupApiInterceptor } from '@/utils/apiInterceptor'

export function ApiSetup() {
  useEffect(() => {
    // Inicializar el interceptor de API al montar el componente
    // Solo se ejecutará en el cliente
    setupApiInterceptor()
  }, [])

  // No renderizar nada
  return null
} 