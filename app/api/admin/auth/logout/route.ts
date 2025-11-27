import { NextRequest, NextResponse } from 'next/server'
import { adminAuthService } from '@/services/adminAuthService'
import { handleError, createSuccessResponse } from '@/lib/errorHandler'

// Forzar renderizado dinámico para evitar errores en producción con headers
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    // Obtener el token del header Authorization
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : request.headers.get('x-admin-token')
    
    if (!token) {
      return NextResponse.json({
        error: 'Token no proporcionado',
        code: 'MISSING_TOKEN'
      }, { status: 401 })
    }

    // Obtener el admin actual para el logout
    const admin = await adminAuthService.getCurrentAdmin(token)
    
    if (!admin) {
      return NextResponse.json({
        error: 'Token inválido o usuario no encontrado',
        code: 'INVALID_TOKEN'
      }, { status: 401 })
    }
    
    // Registrar el logout (logoutAdmin no requiere parámetros según el servicio)
    await adminAuthService.logoutAdmin()

    return NextResponse.json(createSuccessResponse({
      message: 'Sesión cerrada exitosamente'
    }))

  } catch (error) {
    console.error('Error en POST /api/admin/auth/logout:', error)
    const errorResponse = handleError(error)
    return NextResponse.json(errorResponse, {
      status: errorResponse.error.status
    })
  }
} 