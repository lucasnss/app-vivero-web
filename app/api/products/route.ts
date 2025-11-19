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
import { imageService } from '@/services/imageService'

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

// 🔍 HELPER: Aplicar filtros avanzados
async function applyAdvancedFilters(params: any) {
  let products = await productService.getAllProducts()
  
  // Filtro por categoría
  if (params.categoryId) {
    products = products.filter(p => p.category_id === params.categoryId)
  }
  
  // Filtro por búsqueda
  if (params.search) {
    const searchLower = params.search.toLowerCase()
    products = products.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      p.scientificName.toLowerCase().includes(searchLower)
    )
  }
  
  // Filtro por productos destacados
  if (params.featured === 'true') {
    products = products.filter(p => p.featured)
  }
  
  // Filtro por rango de precios
  if (params.minPrice !== undefined) {
    products = products.filter(p => p.price >= params.minPrice)
  }
  if (params.maxPrice !== undefined) {
    products = products.filter(p => p.price <= params.maxPrice)
  }
  
  // Filtro por disponibilidad de stock
  if (params.inStock === 'true') {
    products = products.filter(p => p.stock > 0)
  } else if (params.inStock === 'false') {
    products = products.filter(p => p.stock === 0)
  }
  
  // Ordenamiento
  products.sort((a, b) => {
    let aValue, bValue
    
    switch (params.sortBy) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'price':
        aValue = a.price
        bValue = b.price
        break
      case 'stock':
        aValue = a.stock
        bValue = b.stock
        break
      case 'created_at':
      default:
        // Asumir que el orden de getAllProducts ya es por created_at desc
        return params.sortOrder === 'asc' ? 1 : -1
    }
    
    if (aValue < bValue) return params.sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return params.sortOrder === 'asc' ? 1 : -1
    return 0
  })
  
  return products
}

// 🔍 HELPER: Aplicar paginación
function applyPagination(products: any[], page: number, limit: number) {
  const total = products.length
  const totalPages = Math.ceil(total / limit)
  const offset = (page - 1) * limit
  const paginatedProducts = products.slice(offset, offset + limit)
  
  return {
    products: paginatedProducts,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
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
    
    // ✅ VALIDAR parámetros de paginación
    const paginationResult = paginationSchema.safeParse({
      page: params.page,
      limit: params.limit
    })
    
    if (!paginationResult.success) {
      return NextResponse.json({ 
        error: 'Parámetros de paginación inválidos',
        details: paginationResult.error.errors,
        code: 'INVALID_PAGINATION' 
      }, { status: 400 })
    }
    
    const { page, limit } = paginationResult.data
    
    // ✅ VALIDAR rango de precios si se proporciona
    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      const priceRangeResult = priceRangeSchema.safeParse({
        min: params.minPrice,
        max: params.maxPrice
      })
      
      if (!priceRangeResult.success) {
        return NextResponse.json({ 
          error: 'Rango de precios inválido',
          details: priceRangeResult.error.errors,
          code: 'INVALID_PRICE_RANGE' 
        }, { status: 400 })
      }
    }
    
    // ✅ VALIDAR query de búsqueda si se proporciona
    if (params.search) {
      const searchResult = searchQuerySchema.safeParse(params.search)
      if (!searchResult.success) {
        return NextResponse.json({ 
          error: 'Query de búsqueda inválido',
          details: searchResult.error.errors,
          code: 'INVALID_SEARCH_QUERY' 
        }, { status: 400 })
      }
    }
    
    // 🔍 APLICAR filtros avanzados
    const filteredProducts = await applyAdvancedFilters(params)
    
    // 📄 APLICAR paginación
    const result = applyPagination(filteredProducts, page, limit)
    
    // 📊 AGREGAR metadatos de respuesta
    const response = {
      success: true,
      data: result.products,
      pagination: result.pagination,
      metadata: {
        filters: {
          categoryId: params.categoryId,
          search: params.search,
          featured: params.featured === 'true',
          priceRange: {
            min: params.minPrice,
            max: params.maxPrice
          },
          inStock: params.inStock
        },
        sorting: {
          sortBy: params.sortBy,
          sortOrder: params.sortOrder
        }
      }
    }
    
    return NextResponse.json(response)
    
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
    // Manejar JSON en lugar de formData
    let body
    try {
      body = await request.json()
    } catch (jsonError) {
      return NextResponse.json({
        error: 'JSON inválido en el cuerpo de la petición',
        code: 'INVALID_JSON'
      }, { status: 400 })
    }

    // Asegurar que images sea un array válido si se proporciona
    let productData = { ...body }
    
    // Si no hay imagen principal, usar placeholder
    if (!productData.image) {
      productData.image = './placeholder.svg'
    }
    
    // Asegurar que images sea un array
    if (!Array.isArray(productData.images) || productData.images.length === 0) {
      productData.images = productData.image ? [productData.image] : ['./placeholder.svg']
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
      image: validationResult.data.image || './placeholder.svg',
      images: validationResult.data.images ?? [validationResult.data.image || './placeholder.svg'] 
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
    // Manejar JSON en lugar de formData
    let body
    try {
      body = await request.json()
    } catch (jsonError) {
      return NextResponse.json({
        error: 'JSON inválido en el cuerpo de la petición',
        code: 'INVALID_JSON'
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

    // Asegurar que images sea un array válido si se proporciona
    if (updateData.images && (!Array.isArray(updateData.images) || updateData.images.length === 0)) {
      updateData.images = updateData.image ? [updateData.image] : ['./placeholder.svg']
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

    // Si no hay imagen, mantener como está (no forzar placeholder en actualizaciones)
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