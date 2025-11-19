import { NextRequest, NextResponse } from 'next/server'
import { adminAuthService } from '@/services/adminAuthService'
import { handleError, createSuccessResponse } from '@/lib/errorHandler'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Verificar que se proporcione el token
    if (!body.token) {
      return NextResponse.json({
        error: 'Token no proporcionado',
        code: 'MISSING_TOKEN'
      }, { status: 400 })
    }

    // Verificar el token
    const isValid = await adminAuthService.verifyAdminToken(body.token)

    if (!isValid) {
      return NextResponse.json({
        error: 'Token inválido o expirado',
        code: 'INVALID_TOKEN'
      }, { status: 401 })
    }

    // Si el token es válido, obtener información del admin
    const admin = await adminAuthService.getCurrentAdmin(body.token)

    if (!admin) {
      return NextResponse.json({
        error: 'Token inválido o usuario no encontrado',
        code: 'INVALID_TOKEN'
      }, { status: 401 })
    }

    return NextResponse.json(createSuccessResponse({
      valid: true,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        is_active: admin.is_active
      }
    }))

  } catch (error) {
    console.error('Error en POST /api/admin/auth/verify:', error)
    const errorResponse = handleError(error)
    return NextResponse.json(errorResponse, {
      status: errorResponse.error.status
    })
  }
} 