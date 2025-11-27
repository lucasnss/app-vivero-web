'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { AdminUser } from '@/types/admin'
import { toast } from '@/hooks/use-toast'

// Tipos para el contexto de autenticación
interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: AdminUser | null
  error: string | null
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
  clearError: () => void
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Hook para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}

// Provider de autenticación
interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null
  })

  // Función para verificar la sesión actual
  const checkAuthStatus = async (): Promise<{ isAuthenticated: boolean; user?: AdminUser }> => {
    try {
      console.log('🔍 [checkAuthStatus] Verificando sesión...')
      
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include', // Importante para enviar cookies
        headers: {
          'Content-Type': 'application/json',
        },
        // Agregar timeout para evitar bloqueos en producción
        signal: AbortSignal.timeout(10000) // 10 segundos timeout
      })

      console.log('📡 [checkAuthStatus] Respuesta recibida:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ [checkAuthStatus] Datos parseados:', {
          success: result.success,
          hasAdmin: !!result.data?.admin,
          adminEmail: result.data?.admin?.email
        })
        
        if (result.success && result.data?.admin) {
          return {
            isAuthenticated: true,
            user: result.data.admin
          }
        }
      }

      console.log('⚠️ [checkAuthStatus] No autenticado')
      return { isAuthenticated: false }
    } catch (error) {
      console.error('❌ [checkAuthStatus] Error verificando autenticación:', error)
      return { isAuthenticated: false }
    }
  }

  // Función de login
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: result.data.admin,
          error: null
        })
        
        // Forzar una re-verificación del estado para asegurar sincronización
        setTimeout(() => {
          refreshAuth()
        }, 50)
        
        toast({
          title: "Login exitoso",
          description: `Bienvenido, ${result.data.admin.name}`,
        })

        return { success: true }
      } else {
        const errorMessage = result.error?.message || 'Error de login'
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage
        }))
        return { success: false, error: errorMessage }
      }
    } catch (error) {
      const errorMessage = 'Error de conexión durante el login'
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      return { success: false, error: errorMessage }
    }
  }

  // Función de logout
  const logout = async (): Promise<void> => {
    try {
      // Intentar logout en el servidor
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    } catch (error) {
      console.error('Error durante logout:', error)
    } finally {
      // Limpiar estado local independientemente del resultado del servidor
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null
      })
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      })
    }
  }

  // Función para refrescar la autenticación
  const refreshAuth = async (): Promise<void> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data?.admin) {
          setAuthState(prev => ({
            ...prev,
            user: result.data.admin,
            error: null
          }))
        }
      }
    } catch (error) {
      console.error('Error refrescando autenticación:', error)
    }
  }

  // Función para limpiar errores
  const clearError = (): void => {
    setAuthState(prev => ({ ...prev, error: null }))
  }

  // Verificar autenticación al montar el componente
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔐 [AuthContext] Iniciando verificación de autenticación...')
        const authStatus = await checkAuthStatus()
        
        console.log('✅ [AuthContext] Verificación completada:', {
          isAuthenticated: authStatus.isAuthenticated,
          hasUser: !!authStatus.user,
          userEmail: authStatus.user?.email
        })
        
        setAuthState({
          isAuthenticated: authStatus.isAuthenticated,
          isLoading: false,
          user: authStatus.user || null,
          error: null
        })
      } catch (error) {
        console.error('❌ [AuthContext] Error inicializando auth:', error)
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: 'Error al verificar autenticación'
        })
      }
    }

    initializeAuth()
  }, [])

  // Auto-refresh del token cada 23 horas (antes de que expire)
  useEffect(() => {
    if (authState.isAuthenticated) {
      const refreshInterval = setInterval(() => {
        refreshAuth()
      }, 23 * 60 * 60 * 1000) // 23 horas

      return () => clearInterval(refreshInterval)
    }
  }, [authState.isAuthenticated])

  // Interceptor global para manejar errores 401/403
  useEffect(() => {
    const handleUnauthorized = async (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail?.status === 401 || customEvent.detail?.status === 403) {
        if (authState.isAuthenticated) {
          await logout()
          toast({
            title: "Sesión expirada",
            description: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
            variant: "destructive",
          })
        }
      }
    }

    window.addEventListener('auth-error', handleUnauthorized)
    return () => window.removeEventListener('auth-error', handleUnauthorized)
  }, [authState.isAuthenticated])

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshAuth,
    clearError,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook para verificar si el usuario tiene permisos específicos
export const usePermissions = () => {
  const { user } = useAuth()
  
  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    
    // Importar permisos desde los tipos
    const { ADMIN_PERMISSIONS } = require('@/types/admin')
    const userPermissions = ADMIN_PERMISSIONS[user.role] || []
    
    return userPermissions.includes(permission)
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission))
  }

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission))
  }

  const isAdmin = (): boolean => {
    return user?.role === 'admin'
  }

  // Mantener compatibilidad hacia atrás
  const isSuperAdmin = (): boolean => {
    return user?.role === 'admin'
  }

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isSuperAdmin,
  }
} 