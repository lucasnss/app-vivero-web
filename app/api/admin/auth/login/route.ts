import { NextRequest, NextResponse } from 'next/server'
import { adminAuthService } from '@/services/adminAuthService'
import { handleError, createSuccessResponse } from '@/lib/errorHandler'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar que se proporcionen las credenciales
    if (!body.email || !body.password) {
      return NextResponse.json({
        error: 'Email y password son requeridos',
        code: 'MISSING_CREDENTIALS'
      }, { status: 400 })
    }

    // Intentar login
    const loginResult = await adminAuthService.loginAdmin({
      email: body.email,
      password: body.password
    })

    // Devolver resultado exitoso con token
    return NextResponse.json(createSuccessResponse({
      admin: loginResult.admin,
      token: loginResult.token
    }))

  } catch (error) {
    console.error('Error en POST /api/admin/auth/login:', error)
    const errorResponse = handleError(error)
    return NextResponse.json(errorResponse, {
      status: errorResponse.error.status
    })
  }
} 