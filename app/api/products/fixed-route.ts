import { NextRequest, NextResponse } from 'next/server'
import { productService } from '@/services/productService'
import { ZodError } from 'zod'
import { 
  createProductSchema, 
  updateProductSchema, 
  productIdSchema,
  paginationSchema,
  priceRangeSchema,
  searchQuerySchema
} from '@/lib/validations'
import { handleError, createSuccessResponse } from '@/lib/errorHandler'
import { logService } from '@/services/logService'
import { withAuth, withAdmin } from '@/lib/authMiddleware'
import { AdminUser } from '@/types/admin'

// Constante global para placeholder
const PLACEHOLDER_IMAGE = '/placeholder.svg'

// 🔍 HELPER: Extraer y validar parámetros de query
function extractQueryParams(url: string) {
  const { searchParams } = new URL(url)
  
  return {
    // Parámetros básicos
    id: searchParams.get('id'),
    categoryId: searchParams.get('category_id') || searchParams.get('category'),
    search: searchParams.get('search') || searchParams.get('q'),
    featured: searchParams.get('featured'),
    
    // Paginación
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '20'),
    
    // Filtros avanzados
    minPrice: searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined,
    maxPrice: searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined,
    inStock: searchParams.get('in_stock'),
    sortBy: searchParams.get('sort_by') || 'created_at',
    sortOrder: searchParams.get('sort_order') || 'desc'
  }
}

// GET - Obtener productos con filtros avanzados y paginación (acceso público)
export async function GET(request: NextRequest) {
  try {
    const params = extractQueryParams(request.url)
    
    // ✅ CASO: Producto específico por ID
    if (params.id) {
      try {
        productIdSchema.parse(params.id)
        const product = await productService.getProductById(params.id)
        
        if (!product) {
          return NextResponse.json({ 
            error: 'Producto no encontrado',
            code: 'PRODUCT_NOT_FOUND' 
          }, { status: 404 })
        }
        
        return NextResponse.json(createSuccessResponse(product))
      } catch (validationError) {
        return NextResponse.json({ 
          error: 'ID de producto inválido',
          code: 'INVALID_PRODUCT_ID' 
        }, { status: 400 })
      }
    }
    
    // ✅ Obtener todos los productos
    const products = await productService.getAllProducts()
    
    return NextResponse.json(createSuccessResponse(products))
    
  } catch (error) {
    console.error('Error en GET /api/products:', error)
    const errorResponse = handleError(error)
    return NextResponse.json(errorResponse, { 
      status: errorResponse.error.status 
    })
  }
}

// POST - Crear nuevo producto (requiere autenticación de admin)
export const POST = withAuth(async (request: NextRequest, admin: AdminUser) => {
  try {
    // ✅ MANEJO DE JSON INVÁLIDO
    let body
    try {
      body = await request.json()
    } catch (jsonError) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'JSON inválido en el cuerpo de la petición',
          code: 'INVALID_JSON',
          status: 400
        }
      }, { status: 400 })
    }
    
    // Asegurar que 'images' siempre sea un array válido
    let productData = { ...body }
    
    // Si no hay imagen, usar placeholder temporal válido
    if (!productData.image) {
      productData.image = PLACEHOLDER_IMAGE
    }
    
    if (!Array.isArray(productData.images) || productData.images.length === 0) {
      productData.images = productData.image ? [productData.image] : [PLACEHOLDER_IMAGE]
    }
    
    // Validar datos de entrada con Zod
    const validationResult = createProductSchema.safeParse(productData)
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Datos de producto inválidos',
        details: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        })),
        code: 'VALIDATION_ERROR'
      }, { status: 400 })
    }
    
    // Asegurar que images nunca sea undefined
    const validData = { 
      ...validationResult.data, 
      image: validationResult.data.image || PLACEHOLDER_IMAGE,
      images: validationResult.data.images ?? [validationResult.data.image || PLACEHOLDER_IMAGE] 
    }
    
    // Crear producto
    const newProduct = await productService.createProduct(validData)
    
    // Registrar actividad con admin autenticado
    await logService.recordActivity({
      user_id: admin.id,
      action: 'create_product',
      entity_type: 'product',
      entity_id: newProduct.id,
      details: {
        product_name: newProduct.name,
        category_id: newProduct.category_id
      }
    })
    
    return NextResponse.json(createSuccessResponse(newProduct), { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/products:', error)
    const errorResponse = handleError(error)
    return NextResponse.json(errorResponse, { 
      status: errorResponse.error.status 
    })
  }
})

// PUT - Actualizar producto (requiere autenticación de admin)
export const PUT = withAuth(async (request: NextRequest, admin: AdminUser) => {
  try {
    // ✅ MANEJO DE JSON INVÁLIDO
    let body
    try {
      body = await request.json()
    } catch (jsonError) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'JSON inválido en el cuerpo de la petición',
          code: 'INVALID_JSON',
          status: 400
        }
      }, { status: 400 })
    }
    
    if (!body.id) {
      return NextResponse.json({
        error: 'ID de producto requerido',
        code: 'MISSING_PRODUCT_ID'
      }, { status: 400 })
    }
    
    const idValidation = productIdSchema.safeParse(body.id)
    if (!idValidation.success) {
      return NextResponse.json({
        error: 'ID de producto inválido',
        code: 'INVALID_PRODUCT_ID'
      }, { status: 400 })
    }
    
    const { id, ...updateData } = body
    
    // Asegurar que 'images' siempre sea un array válido si se proporciona
    if (updateData.images && (!Array.isArray(updateData.images) || updateData.images.length === 0)) {
      updateData.images = updateData.image ? [updateData.image] : [PLACEHOLDER_IMAGE]
    }
    
    const validationResult = updateProductSchema.safeParse(updateData)
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Datos de actualización inválidos',
        details: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        })),
        code: 'VALIDATION_ERROR'
      }, { status: 400 })
    }
    
    // Asegurar que images nunca sea undefined si se proporciona image
    const validUpdate = { ...validationResult.data }
    if (validUpdate.images === undefined && validUpdate.image) {
      validUpdate.images = [validUpdate.image]
    }
    
    // Actualizar producto
    const updatedProduct = await productService.updateProduct(id, validUpdate)
    if (!updatedProduct) {
      return NextResponse.json({
        error: 'Producto no encontrado',
        code: 'PRODUCT_NOT_FOUND'
      }, { status: 404 })
    }
    
    // Registrar actividad con admin autenticado
    await logService.recordActivity({
      user_id: admin.id,
      action: 'update_product',
      entity_type: 'product',
      entity_id: id,
      details: {
        product_name: updatedProduct.name,
        updated_fields: Object.keys(updateData)
      }
    })
    
    return NextResponse.json(createSuccessResponse(updatedProduct))
  } catch (error) {
    console.error('Error en PUT /api/products:', error)
    const errorResponse = handleError(error)
    return NextResponse.json(errorResponse, { 
      status: errorResponse.error.status 
    })
  }
})

// DELETE - Eliminar producto (requiere admin)
export const DELETE = withAdmin(async (request: NextRequest, admin: AdminUser) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({
        error: 'ID de producto requerido',
        code: 'MISSING_PRODUCT_ID'
      }, { status: 400 })
    }
    
    const idValidation = productIdSchema.safeParse(id)
    if (!idValidation.success) {
      return NextResponse.json({
        error: 'ID de producto inválido',
        code: 'INVALID_PRODUCT_ID'
      }, { status: 400 })
    }
    
    // Obtener producto antes de eliminar para el log
    const product = await productService.getProductById(id)
    if (!product) {
      return NextResponse.json({
        error: 'Producto no encontrado',
        code: 'PRODUCT_NOT_FOUND'
      }, { status: 404 })
    }
    
    const success = await productService.deleteProduct(id)
    
    // Registrar actividad con admin autenticado
    await logService.recordActivity({
      user_id: admin.id,
      action: 'delete_product',
      entity_type: 'product',
      entity_id: id,
      details: {
        product_name: product.name,
        category_id: product.category_id
      }
    })
    
    return NextResponse.json(createSuccessResponse({ 
      message: 'Producto eliminado exitosamente',
      deletedId: id 
    }))
    
  } catch (error) {
    console.error('Error en DELETE /api/products:', error)
    const errorResponse = handleError(error)
    return NextResponse.json(errorResponse, { 
      status: errorResponse.error.status 
    })
  }
}) 