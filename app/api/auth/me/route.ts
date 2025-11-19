import { NextRequest, NextResponse } from 'next/server'
import { adminAuthService } from '@/services/adminAuthService'
import { handleError, createSuccessResponse } from '@/lib/errorHandler'

export async function GET(request: NextRequest) {
  try {
    // Obtener el token de la cookie HttpOnly
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'No hay sesión activa',
          code: 'NO_SESSION',
          status: 401
        }
      }, { status: 401 })
    }

    // Obtener el admin actual usando el token de la cookie
    const admin = await adminAuthService.getCurrentAdmin(token)
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

    // Devolver el perfil del admin
    return NextResponse.json(createSuccessResponse({
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        last_login: admin.last_login,
        is_active: admin.is_active
      },
      session: {
        isAuthenticated: true,
        loginMethod: 'cookie'
      }
    }))

  } catch (error) {
    console.error('Error en GET /api/auth/me:', error)
    const errorResponse = handleError(error)
    return NextResponse.json(errorResponse, {
      status: errorResponse.error.status
    })
  }
} 