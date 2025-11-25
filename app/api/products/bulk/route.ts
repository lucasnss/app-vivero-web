import { NextRequest, NextResponse } from 'next/server'
import { productService } from '@/services/productService'
import { logService } from '@/services/logService'
import { withAuth } from '@/lib/authMiddleware'
import { AdminUser } from '@/types/admin'
import { handleError, createSuccessResponse } from '@/lib/errorHandler'
import { ZodError } from 'zod'
import { createProductSchema } from '@/lib/validations'

/**
 * POST - Crear múltiples productos en una sola operación (bulk insert)
 * Requiere autenticación de admin
 */
export const POST = withAuth(async (request: NextRequest, admin: AdminUser) => {
  try {
    // Parsear body
    let body
    try {
      body = await request.json()
    } catch (jsonError) {
      return NextResponse.json({
        success: false,
        error: {
          type: 'INVALID_JSON',
          message: 'JSON inválido en el cuerpo de la petición',
          status: 400
        }
      }, { status: 400 })
    }

    // Validar que se envíe un array de productos
    if (!Array.isArray(body)) {
      return NextResponse.json({
        success: false,
        error: {
          type: 'INVALID_INPUT',
          message: 'Se esperaba un array de productos',
          status: 400
        }
      }, { status: 400 })
    }

    // Validar límite de productos
    if (body.length === 0) {
      return NextResponse.json({
        success: false,
        error: {
          type: 'EMPTY_ARRAY',
          message: 'El array de productos está vacío',
          status: 400
        }
      }, { status: 400 })
    }

    if (body.length > 500) {
      return NextResponse.json({
        success: false,
        error: {
          type: 'LIMIT_EXCEEDED',
          message: `El máximo de productos por importación es 500. Se recibieron ${body.length}`,
          status: 400
        }
      }, { status: 400 })
    }

    // Validar campos requeridos en cada producto
    const productsWithErrors: Array<{ index: number; errors: string[] }> = []
    
    body.forEach((product, index) => {
      const errors: string[] = []
      
      if (!product.name || typeof product.name !== 'string') {
        errors.push('name es requerido')
      }
      if (!product.category_id || typeof product.category_id !== 'string') {
        errors.push('category_id es requerido')
      }
      if (product.price === undefined || product.price === null || typeof product.price !== 'number') {
        errors.push('price es requerido')
      }
      
      if (errors.length > 0) {
        productsWithErrors.push({ index: index + 1, errors })
      }
    })

    if (productsWithErrors.length > 0) {
      return NextResponse.json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Algunos productos tienen errores de validación',
          status: 400,
          details: productsWithErrors
        }
      }, { status: 400 })
    }

    // Normalizar productos (asegurar valores por defecto)
    const normalizedProducts = body.map(product => ({
      name: product.name,
      description: product.description || '',
      category_id: product.category_id,
      price: product.price,
      stock: product.stock ?? 0,
      image: product.image || '/placeholder.svg',
      images: Array.isArray(product.images) && product.images.length > 0 
        ? product.images 
        : (product.image ? [product.image] : ['/placeholder.svg']),
      scientificName: product.scientificName || '',
      care: product.care || '',
      characteristics: product.characteristics || '',
      origin: product.origin || '',
      featured: product.featured ?? false
    }))

    // Crear productos usando el servicio (bulk insert en una sola consulta)
    const createdProducts = await productService.bulkCreateProducts(normalizedProducts)

    // Registrar actividad con admin autenticado
    await logService.recordActivity({
      user_id: admin.id,
      action: 'bulk_import_products',
      entity_type: 'product',
      entity_id: 'bulk_operation',
      details: {
        count: createdProducts.length,
        admin_email: admin.email,
        timestamp: new Date().toISOString()
      }
    })

    return NextResponse.json(
      createSuccessResponse({
        insertedCount: createdProducts.length,
        products: createdProducts
      }),
      { status: 201 }
    )

  } catch (error) {
    console.error('Error en POST /api/products/bulk:', error)
    
    // Manejo específico de errores de validación
    if (error instanceof ZodError) {
      return NextResponse.json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Error de validación en los datos',
          status: 400,
          details: error.errors
        }
      }, { status: 400 })
    }

    const errorResponse = handleError(error)
    return NextResponse.json(errorResponse, { 
      status: errorResponse.error.status 
    })
  }
})

