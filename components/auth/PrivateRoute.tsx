'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, usePermissions } from '@/contexts/AuthContext'
import { Loader2, Shield } from 'lucide-react'

interface PrivateRouteProps {
  children: React.ReactNode
  requiredPermissions?: string[]
  requireAdmin?: boolean
  redirectTo?: string
  fallback?: React.ReactNode
}

export function PrivateRoute({
  children,
  requiredPermissions = [],
  requireAdmin = false,
  redirectTo = '/login',
  fallback
}: PrivateRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const { hasAllPermissions, isAdmin } = usePermissions()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, isLoading, router, redirectTo])

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-sm text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, no mostrar nada (el useEffect se encarga de redirigir)
  if (!isAuthenticated) {
    return null
  }

  // Verificar si el usuario está activo
  if (!user?.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="max-w-md text-center p-6">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Cuenta Desactivada
          </h2>
          <p className="text-red-600 mb-4">
            Tu cuenta ha sido desactivada. Contacta al administrador del sistema.
          </p>
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:underline"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  // Verificar permisos específicos si se requieren
  if (requiredPermissions.length > 0 && !hasAllPermissions(requiredPermissions)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yellow-50">
        <div className="max-w-md text-center p-6">
          <Shield className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">
            Permisos Insuficientes
          </h2>
          <p className="text-yellow-600 mb-4">
            No tienes los permisos necesarios para acceder a esta página.
          </p>
          <div className="text-sm text-gray-600 mb-4">
            <p className="font-medium">Permisos requeridos:</p>
            <ul className="list-disc list-inside">
              {requiredPermissions.map(permission => (
                <li key={permission} className="text-xs">{permission}</li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="text-blue-600 hover:underline"
          >
            Volver al panel de administración
          </button>
        </div>
      </div>
    )
  }

  // Verificar si requiere admin
  if (requireAdmin && !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="max-w-md text-center p-6">
          <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-blue-800 mb-2">
            Administrador Requerido
          </h2>
          <p className="text-blue-600 mb-4">
            Esta página requiere permisos de administrador.
          </p>
          <button
            onClick={() => router.push('/admin')}
            className="text-blue-600 hover:underline"
          >
            Volver al panel de administración
          </button>
        </div>
      </div>
    )
  }

  // Si todas las verificaciones pasan, mostrar el contenido
  return <>{children}</>
}

// Hook para proteger páginas completas
export function useRequireAuth(options: {
  requiredPermissions?: string[]
  requireAdmin?: boolean
  redirectTo?: string
} = {}) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const { hasAllPermissions, isAdmin } = usePermissions()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(options.redirectTo || '/login')
        return
      }

      if (!user?.is_active) {
        router.push('/')
        return
      }

      if (options.requiredPermissions && !hasAllPermissions(options.requiredPermissions)) {
        router.push('/admin')
        return
      }

      if (options.requireAdmin && !isAdmin()) {
        router.push('/admin')
        return
      }
    }
  }, [
    isAuthenticated,
    isLoading,
    user?.is_active,
    hasAllPermissions,
    isAdmin,
    router,
    options.requiredPermissions,
    options.requireAdmin,
    options.redirectTo
  ])

  return {
    isAuthenticated,
    isLoading,
    user,
    hasPermissions: options.requiredPermissions ? hasAllPermissions(options.requiredPermissions) : true,
    isAdmin: options.requireAdmin ? isAdmin() : true
  }
} 