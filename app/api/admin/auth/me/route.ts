import { NextRequest, NextResponse } from 'next/server'
import { adminAuthService } from '@/services/adminAuthService'
import { handleError, createSuccessResponse } from '@/lib/errorHandler'

// Forzar renderizado dinámico para evitar errores en producción con headers
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
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

    // Obtener el admin actual
    const admin = await adminAuthService.getCurrentAdmin(token)

    if (!admin) {
      return NextResponse.json({
        error: 'Token inválido o usuario no encontrado',
        code: 'INVALID_TOKEN'
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
      }
    }))

  } catch (error) {
    console.error('Error en GET /api/admin/auth/me:', error)
    const errorResponse = handleError(error)
    return NextResponse.json(errorResponse, {
      status: errorResponse.error.status
    })
  }
} 