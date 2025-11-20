import { NextRequest, NextResponse } from 'next/server'
import { adminAuthService } from '@/services/adminAuthService'
import { handleError, createSuccessResponse } from '@/lib/errorHandler'

// Forzar renderizado dinámico para evitar errores en producción con cookies
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar que se proporcionen las credenciales
    if (!body.email || !body.password) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Email y password son requeridos',
          code: 'MISSING_CREDENTIALS',
          status: 400
        }
      }, { status: 400 })
    }

    // Intentar login
    const loginResult = await adminAuthService.loginAdmin({
      email: body.email,
      password: body.password
    })

    // Crear respuesta con cookie HttpOnly
    const response = NextResponse.json(createSuccessResponse({
      admin: {
        id: loginResult.admin.id,
        email: loginResult.admin.email,
        name: loginResult.admin.name,
        role: loginResult.admin.role,
        last_login: loginResult.admin.last_login,
        is_active: loginResult.admin.is_active
      },
      message: 'Login exitoso'
    }))

    // Configurar cookie HttpOnly con el JWT
    response.cookies.set('auth-token', loginResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 horas
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Error en POST /api/auth/login:', error)
    const errorResponse = handleError(error)
    return NextResponse.json(errorResponse, {
      status: errorResponse.error.status
    })
  }
} 