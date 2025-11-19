import { ZodError } from 'zod'
import { PostgrestError } from '@supabase/supabase-js'

// Tipos de errores personalizados
export class ValidationError extends Error {
  constructor(
    message: string,
    public details: Record<string, string[]> = {},
    public status: number = 400
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class AuthorizationError extends Error {
  constructor(message = 'No autorizado') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Recurso no encontrado') {
    super(message)
    this.name = 'NotFoundError'
  }
}

// Interfaz para respuestas de error estandarizadas
export interface ErrorResponse {
  success: false
  error: {
    message: string
    code: string
    details?: Record<string, string[]>
    status: number
  }
}

// Función para formatear errores de Zod
function formatZodError(error: ZodError): Record<string, string[]> {
  const formattedErrors: Record<string, string[]> = {}
  error.errors.forEach((err) => {
    const path = err.path.join('.')
    if (!formattedErrors[path]) {
      formattedErrors[path] = []
    }
    formattedErrors[path].push(err.message)
  })
  return formattedErrors
}

// Función para formatear errores de Supabase
function formatSupabaseError(error: PostgrestError): string {
  // Manejar errores comunes de Supabase
  switch (error.code) {
    case '23505':
      return 'Ya existe un registro con estos datos'
    case '23503':
      return 'No se puede realizar la operación porque hay registros relacionados'
    case '42P01':
      return 'Error en la base de datos: Tabla no encontrada'
    default:
      return error.message || 'Error en la base de datos'
  }
}

// Función principal para manejar errores
export function handleError(error: unknown): ErrorResponse {
  console.error('Error original:', error)

  // Error de validación de Zod
  if (error instanceof ZodError) {
    return {
      success: false,
      error: {
        message: 'Error de validación',
        code: 'VALIDATION_ERROR',
        details: formatZodError(error),
        status: 400
      }
    }
  }

  // Error de Supabase
  if (error instanceof PostgrestError) {
    return {
      success: false,
      error: {
        message: formatSupabaseError(error),
        code: `SUPABASE_${error.code || 'ERROR'}`,
        status: 500
      }
    }
  }

  // Errores personalizados
  if (error instanceof ValidationError) {
    return {
      success: false,
      error: {
        message: error.message,
        code: 'VALIDATION_ERROR',
        details: error.details,
        status: error.status
      }
    }
  }

  if (error instanceof AuthorizationError) {
    return {
      success: false,
      error: {
        message: error.message,
        code: 'AUTHORIZATION_ERROR',
        status: 401
      }
    }
  }

  if (error instanceof NotFoundError) {
    return {
      success: false,
      error: {
        message: error.message,
        code: 'NOT_FOUND',
        status: 404
      }
    }
  }

  // Error genérico
  if (error instanceof Error) {
    return {
      success: false,
      error: {
        message: error.message || 'Error interno del servidor',
        code: 'INTERNAL_SERVER_ERROR',
        status: 500
      }
    }
  }

  // Error desconocido
  return {
    success: false,
    error: {
      message: 'Error interno del servidor',
      code: 'UNKNOWN_ERROR',
      status: 500
    }
  }
}

// Tipado simple para interoperar con rutas existentes
export interface AppErrorLike {
  message: string
  code?: string
  statusCode?: number
  details?: Record<string, string[]>
}

// Compatibilidad: usados por varias rutas existentes
export function handleServiceError(error: unknown, _context?: string): AppErrorLike {
  const formatted = handleError(error)
  return {
    message: formatted.error.message,
    code: formatted.error.code,
    statusCode: formatted.error.status,
    details: formatted.error.details,
  }
}

// Función para crear respuestas exitosas
export function createSuccessResponse<T>(data: T) {
  return {
    success: true as const,
    data
  }
}

// Compatibilidad: alias con el nombre usado en rutas
export function createSuccessResult<T>(data: T) {
  return createSuccessResponse(data)
}

// Compatibilidad: construir estructura de error esperada en rutas
export function createErrorResult(appError: AppErrorLike) {
  return {
    success: false as const,
    error: appError.message,
    code: appError.code,
    details: appError.details,
  }
}

// Middleware de validación para API Routes
export function withValidation<T>(schema: any) {
  return async (data: unknown) => {
    try {
      const validatedData = await schema.parseAsync(data)
      return createSuccessResponse(validatedData as T)
    } catch (error) {
      throw new ValidationError(
        'Error de validación',
        error instanceof ZodError ? formatZodError(error) : undefined
      )
    }
  }
}

// Rate limiting básico
const rateLimits = new Map<string, { count: number; timestamp: number }>()

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const record = rateLimits.get(key)

  if (!record) {
    rateLimits.set(key, { count: 1, timestamp: now })
    return true
  }

  if (now - record.timestamp > windowMs) {
    rateLimits.set(key, { count: 1, timestamp: now })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}

// Función para limpiar rate limits antiguos
export function cleanupRateLimits() {
  const now = Date.now()
  for (const [key, record] of rateLimits.entries()) {
    if (now - record.timestamp > 24 * 60 * 60 * 1000) { // 24 horas
      rateLimits.delete(key)
    }
  }
}

// Limpiar rate limits cada hora
setInterval(cleanupRateLimits, 60 * 60 * 1000) 