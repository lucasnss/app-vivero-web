import { NextRequest, NextResponse } from 'next/server'
import { adminAuthService } from '@/services/adminAuthService'
import { handleError, createSuccessResponse } from '@/lib/errorHandler'

export async function POST(request: NextRequest) {
  try {
    // Obtener el token de la cookie HttpOnly
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'No hay sesión activa para cerrar',
          code: 'NO_SESSION',
          status: 401
        }
      }, { status: 401 })
    }

    // Obtener el admin actual para registrar el logout
    try {
      const admin = await adminAuthService.getCurrentAdmin(token)
      
      // Registrar el logout en el sistema
      await adminAuthService.logoutAdmin()
    } catch (error) {
      // Si el token es inválido, continuamos con el logout para limpiar la cookie
      console.warn('Token inválido durante logout, limpiando cookie:', error)
    }

    // Crear respuesta y borrar la cookie
    const response = NextResponse.json(createSuccessResponse({
      message: 'Sesión cerrada exitosamente',
      session: {
        isAuthenticated: false,
        loggedOut: true
      }
    }))

    // Borrar cookie HttpOnly estableciendo maxAge a 0
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Esto borra la cookie
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Error en POST /api/auth/logout:', error)
    const errorResponse = handleError(error)
    
    // Incluso si hay error, intentamos borrar la cookie
    const response = NextResponse.json(errorResponse, {
      status: errorResponse.error.status
    })
    
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })
    
    return response
  }
} 