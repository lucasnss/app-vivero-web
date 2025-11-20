import { NextRequest, NextResponse } from 'next/server'
import { adminAuthService } from '@/services/adminAuthService'
import { handleError, createSuccessResponse } from '@/lib/errorHandler'
import jwt from 'jsonwebtoken'

// Forzar renderizado dinámico para evitar errores en producción con cookies
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    // Obtener el token actual de la cookie HttpOnly
    const currentToken = request.cookies.get('auth-token')?.value
    
    if (!currentToken) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'No hay sesión activa para renovar',
          code: 'NO_SESSION',
          status: 401
        }
      }, { status: 401 })
    }

    // Verificar el token actual y obtener el admin
    const admin = await adminAuthService.getCurrentAdmin(currentToken)
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Sesión inválida o expirada',
          code: 'INVALID_SESSION',
          status: 401
        }
      }, { status: 401 })
    }

    // Verificar si el token está próximo a vencer (dentro de 2 horas)
    try {
      const decoded = jwt.decode(currentToken) as any
      if (decoded && decoded.exp) {
        const expiresAt = decoded.exp * 1000 // Convertir a milliseconds
        const now = Date.now()
        const timeUntilExpiry = expiresAt - now
        const twoHours = 2 * 60 * 60 * 1000 // 2 horas en milliseconds

        // Solo renovar si el token expira en menos de 2 horas
        if (timeUntilExpiry > twoHours) {
          return NextResponse.json(createSuccessResponse({
            message: 'Token aún válido, no es necesario renovar',
            admin: {
              id: admin.id,
              email: admin.email,
              name: admin.name,
              role: admin.role,
              last_login: admin.last_login,
              is_active: admin.is_active
            },
            refreshed: false,
            expiresIn: Math.floor(timeUntilExpiry / 1000) // Segundos hasta expiración
          }))
        }
      }
    } catch (jwtError) {
      console.warn('Error decodificando JWT durante refresh:', jwtError)
      // Continuamos con el refresh si no podemos verificar la expiración
    }

    // Generar nuevo token directamente (sin revalidar password)
    const JWT_SECRET = process.env.JWT_SECRET || 'vivero-web-secret-key-development'
    const newToken = jwt.sign(
      {
        sub: admin.id,
        email: admin.email,
        role: admin.role,
        iat: Math.floor(Date.now() / 1000)
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )
    
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    // Crear respuesta con nuevo token
    const response = NextResponse.json(createSuccessResponse({
      message: 'Token renovado exitosamente',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        last_login: admin.last_login,
        is_active: admin.is_active
      },
      refreshed: true,
      refreshedAt: new Date().toISOString()
    }))

    // Configurar nueva cookie HttpOnly con el token renovado
    response.cookies.set('auth-token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 horas
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Error en POST /api/auth/refresh:', error)
    
    const errorResponse = handleError(error)
    
    // Si el token es inválido, sugerimos hacer login nuevamente
    if (errorResponse.error.status === 401) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Sesión expirada, es necesario hacer login nuevamente',
          code: 'SESSION_EXPIRED',
          status: 401,
          action: 'LOGIN_REQUIRED'
        }
      }, { status: 401 })
    }
    
    return NextResponse.json(errorResponse, {
      status: errorResponse.error.status
    })
  }
} 