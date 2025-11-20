import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminAuthService } from './src/services/adminAuthService'
// Eliminado import de NextCors

// Bandera para desarrollo - REMOVER EN PRODUCCIÓN
const SKIP_AUTH_IN_DEV = process.env.NODE_ENV === 'development'

// Rutas que requieren autenticación de admin
const PROTECTED_ROUTES = [
  // Rutas de productos (solo operaciones de escritura)
  '/api/products/(POST|PUT|DELETE)',
  // Rutas de categorías (excepto GET)
  '/api/categories/(POST|PUT|DELETE)',
  // Rutas de admin (excepto autenticación)
  '/api/admin/(?!auth).*', // Excluye /api/admin/auth/*
  // Rutas de pedidos (admin)
  '/api/orders/(?!guest).*', // Excluye /api/orders/guest/*
  // Panel de admin
  '/admin/.*'
]

// Función auxiliar para aplicar headers CORS
function handleCorsResponse(request: NextRequest, response: NextResponse) {
  const origin = request.headers.get('origin') || ''
  const allowedOrigins = process.env.NODE_ENV === 'development'
    ? [origin] // En desarrollo, permitir el origen de la solicitud
    : (process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['https://tudominio.com'])
  
  // Si es una solicitud de origen permitido o estamos en desarrollo
  if (process.env.NODE_ENV === 'development' || allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-token')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }
  
  return response
}

export async function middleware(request: NextRequest) {
  const url = new URL(request.url)
  const pathname = url.pathname
  const method = request.method
  
  // Verificar si es OPTIONS (preflight)
  if (method === 'OPTIONS') {
    return handleCorsResponse(request, new NextResponse(null, { status: 204 }))
  }

  // Verificar si la ruta requiere autenticación
  const requiresAuth = PROTECTED_ROUTES.some(route => {
    const regex = new RegExp(route)
    if (route.includes('(POST|PUT|DELETE)')) {
      // Para rutas que solo protegen ciertos métodos
      return regex.test(pathname) && new RegExp('(POST|PUT|DELETE)').test(method)
    }
    return regex.test(pathname)
  })

  if (!requiresAuth) {
    return handleCorsResponse(request, NextResponse.next())
  }

  // En desarrollo, permitir acceso sin token
  if (SKIP_AUTH_IN_DEV) {
    console.log('⚠️ MODO DESARROLLO: Saltando autenticación para:', pathname)
    const response = NextResponse.next()
    // Headers compatibles con authMiddleware
    response.headers.set('x-admin-id', 'dev-admin-id')
    response.headers.set('x-admin-email', 'admin@vivero.com')
    response.headers.set('x-admin-role', 'admin')
    response.headers.set('x-admin-name', 'Admin Desarrollo')
    response.headers.set('x-auth-method', 'development')
    return handleCorsResponse(request, response)
  }

  // Obtener token de cookies HttpOnly (método preferido) o headers (fallback)
  const cookieToken = request.cookies.get('auth-token')?.value
  const authHeader = request.headers.get('authorization')
  const adminToken = request.headers.get('x-admin-token')
  
  let token: string | null = null

  // Prioridad: 1) Cookie HttpOnly, 2) Headers (compatibilidad)
  if (cookieToken) {
    token = cookieToken
  } else if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]
  } else if (adminToken) {
    token = adminToken
  }

  if (!token) {
    // Para rutas de admin del frontend, redirigir al login con returnUrl
    if (pathname.startsWith('/admin')) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('returnUrl', pathname)
      return handleCorsResponse(request, NextResponse.redirect(loginUrl))
    }
    
    // Para APIs, devolver error JSON
    const errorResponse = NextResponse.json(
      { 
        success: false,
        error: {
          message: 'No autorizado - sesión requerida',
          code: 'UNAUTHORIZED',
          status: 401
        }
      },
      { status: 401 }
    )
    
    return handleCorsResponse(request, errorResponse)
  }

  try {
    // Verificar token y obtener información del admin
    const admin = await adminAuthService.getCurrentAdmin(token)
    
    if (!admin || !admin.is_active) {
      // Para rutas de admin del frontend, redirigir al login con returnUrl
      if (pathname.startsWith('/admin')) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('returnUrl', pathname)
        return handleCorsResponse(request, NextResponse.redirect(loginUrl))
      }
      
      const errorResponse = NextResponse.json(
        { 
          success: false,
          error: {
            message: 'Token inválido o usuario inactivo',
            code: 'INVALID_TOKEN',
            status: 401
          }
        },
        { status: 401 }
      )
      
      return handleCorsResponse(request, errorResponse)
    }

    // Token válido, continuar con información del admin propagada
    const response = NextResponse.next()

    // Propagar información del admin autenticado para uso en API Routes
    response.headers.set('x-admin-id', admin.id)
    response.headers.set('x-admin-email', admin.email)
    response.headers.set('x-admin-role', admin.role)
    response.headers.set('x-admin-name', admin.name || '')
    response.headers.set('x-auth-method', cookieToken ? 'cookie' : 'header')

    // Mantener el token para compatibilidad con APIs que lo necesiten
    response.headers.set('x-admin-token', token)

    // Aplicar headers CORS a la respuesta
    return handleCorsResponse(request, response)

  } catch (error) {
    console.error('Error en middleware de autenticación:', error)
    
    // Para rutas de admin del frontend, redirigir al login
    if (pathname.startsWith('/admin')) {
      return handleCorsResponse(request, NextResponse.redirect(new URL('/login', request.url)))
    }
    
    // Para APIs, devolver error JSON
    const errorResponse = NextResponse.json(
      { 
        success: false,
        error: {
          message: 'Error de autenticación interno',
          code: 'AUTH_ERROR',
          status: 500
        }
      },
      { status: 500 }
    )
    
    return handleCorsResponse(request, errorResponse)
  }
}

// Configurar el matcher para las rutas que queremos procesar
export const config = {
  matcher: [
    // Rutas de productos (las exclusiones se manejan en el middleware)
    '/api/products/:path*',
    '/api/categories/:path*',
    // Solo admin routes que no sean auth
    '/api/admin/users/:path*',
    '/api/orders/:path*',
    '/admin/:path*',
    // Asegurar que OPTIONS se maneje para CORS
    '/(api|admin)/:path*'
  ]
} 