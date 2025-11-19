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

// Constante global para placeholder
const PLACEHOLDER_IMAGE = '/placeholder.svg'

// GET - Obtener productos (acceso público)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    // ✅ CASO: Producto específico por ID
    if (id) {
      try {
        productIdSchema.parse(id)
        const product = await productService.getProductById(id)
        
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

// POST - Crear nuevo producto (sin autenticación para prueba)
export async function POST(request: NextRequest) {
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
    
    return NextResponse.json(createSuccessResponse(newProduct), { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/products:', error)
    const errorResponse = handleError(error)
    return NextResponse.json(errorResponse, { 
      status: errorResponse.error.status 
    })
  }
}

// PUT - Actualizar producto (sin autenticación para prueba)
export async function PUT(request: NextRequest) {
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
    
    return NextResponse.json(createSuccessResponse(updatedProduct))
  } catch (error) {
    console.error('Error en PUT /api/products:', error)
    const errorResponse = handleError(error)
    return NextResponse.json(errorResponse, { 
      status: errorResponse.error.status 
    })
  }
} 