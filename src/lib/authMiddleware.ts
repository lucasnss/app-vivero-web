import { NextRequest, NextResponse } from 'next/server'
import { AdminUser } from '@/types/admin'
import { hasPermission, Permission } from './authorization'
import { adminAuthService } from '@/services/adminAuthService'

export interface AuthResult {
  success: boolean
  admin?: AdminUser
  error?: string
}

/**
 * Middleware para verificar autenticación de administrador
 * Usar esta función para envolver API routes que requieren autenticación admin
 */
export function withAuth(
  handler: (request: NextRequest, admin: AdminUser) => Promise<NextResponse>,
  requiredPermissions: Permission[] = []
) {
  return async function(request: NextRequest): Promise<NextResponse> {
    try {
      // Verificar autenticación usando información del middleware global
      const authResult = await verifyAdminAuth(request)

      if (!authResult.success || !authResult.admin) {
        return NextResponse.json({
          success: false,
          error: authResult.error || 'No autorizado',
          code: 'UNAUTHORIZED'
        }, { status: 401 })
      }

      // Verificar permisos específicos si se proporcionan
      if (requiredPermissions.length > 0) {
        const hasRequiredPermissions = requiredPermissions.every(permission => 
          hasPermission(authResult.admin!, permission)
        )

        if (!hasRequiredPermissions) {
          return NextResponse.json({
            success: false,
            error: 'Permisos insuficientes para esta operación',
            code: 'FORBIDDEN'
          }, { status: 403 })
        }
      }

      // Si llegamos aquí, el admin está autenticado y tiene permisos
      return await handler(request, authResult.admin)

    } catch (error) {
      console.error('❌ Error en middleware de autenticación:', error)
      return NextResponse.json({
        success: false,
        error: 'Error interno del servidor',
        code: 'INTERNAL_SERVER_ERROR'
      }, { status: 500 })
    }
  }
}

/**
 * Verificar autenticación de administrador usando headers del middleware global
 */
async function verifyAdminAuth(request: NextRequest): Promise<AuthResult> {
  try {
    // Primero, intentar usar información del middleware global (más eficiente)
    const adminIdFromMiddleware = request.headers.get('x-admin-id')
    const adminEmailFromMiddleware = request.headers.get('x-admin-email')
    const adminRoleFromMiddleware = request.headers.get('x-admin-role')
    const adminNameFromMiddleware = request.headers.get('x-admin-name')

    if (adminIdFromMiddleware && adminEmailFromMiddleware && adminRoleFromMiddleware) {
      // El middleware global ya validó, usar esa información
      const admin: AdminUser = {
        id: adminIdFromMiddleware,
        email: adminEmailFromMiddleware,
        name: adminNameFromMiddleware || '',
        role: adminRoleFromMiddleware as 'admin',
        is_active: true, // Si llegó hasta aquí, está activo
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      return { success: true, admin }
    }

    // Si no hay headers del middleware, hacer validación completa
    const token = request.cookies.get('auth-token')?.value || 
                  request.cookies.get('admin-token')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return { success: false, error: 'Token no proporcionado' }
    }

    // Verificar token usando adminAuthService
    const verificationResult = await adminAuthService.verifyAdminToken(token)

    if (!verificationResult.valid || !verificationResult.admin) {
      return { success: false, error: 'Token inválido o expirado' }
    }

    return { success: true, admin: verificationResult.admin }

  } catch (error) {
    console.error('❌ Error verificando autenticación:', error)
    return { success: false, error: 'Error de autenticación' }
  }
}

/**
 * Middleware para operaciones que requieren administrador
 */
export function withAdmin(
  handler: (request: NextRequest, admin: AdminUser) => Promise<NextResponse>
) {
  return async function(request: NextRequest): Promise<NextResponse> {
    try {
      const authResult = await verifyAdminAuth(request)

      if (!authResult.success || !authResult.admin) {
        return NextResponse.json({
          success: false,
          error: authResult.error || 'No autorizado',
          code: 'UNAUTHORIZED'
        }, { status: 401 })
      }

      // Verificar que sea administrador
      if (authResult.admin.role !== 'admin') {
        return NextResponse.json({
          success: false,
          error: 'Se requieren permisos de administrador',
          code: 'FORBIDDEN'
        }, { status: 403 })
      }

      return await handler(request, authResult.admin)

    } catch (error) {
      console.error('❌ Error en middleware de admin:', error)
      return NextResponse.json({
        success: false,
        error: 'Error interno del servidor',
        code: 'INTERNAL_SERVER_ERROR'
      }, { status: 500 })
    }
  }
}

/**
 * Función helper para obtener admin autenticado (sin wrapping)
 */
export async function getAuthenticatedAdmin(request: NextRequest): Promise<AdminUser | null> {
  const authResult = await verifyAdminAuth(request)
  return authResult.success ? authResult.admin || null : null
}

/**
 * Función helper para verificar si un request viene de un admin autenticado
 */
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const authResult = await verifyAdminAuth(request)
  return authResult.success && !!authResult.admin
}

/**
 * Función helper para verificar si un admin tiene permisos específicos
 */
export async function hasRequiredPermissions(
  request: NextRequest, 
  permissions: Permission[]
): Promise<boolean> {
  const admin = await getAuthenticatedAdmin(request)
  if (!admin) return false

  return permissions.every(permission => hasPermission(admin, permission))
} 