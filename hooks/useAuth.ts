'use client'

import { useAuth as useAuthContext } from '@/contexts/AuthContext'

/**
 * Hook de conveniencia para acceder al contexto de autenticación.
 * Mantiene una API estable en `Fronted/hooks` y evita importaciones
 * directas desde `contexts` en el resto de la app.
 */
export function useAuth() {
	return useAuthContext()
}



