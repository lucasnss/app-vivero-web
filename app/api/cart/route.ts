import { NextRequest, NextResponse } from 'next/server'
import { cartService } from '@/services/cartService'
import { handleServiceError, createSuccessResult, createErrorResult } from '@/lib/errorHandler'

// GET - Obtener carrito actual
export async function GET(request: NextRequest) {
  try {
    const cart = await cartService.getCart()
    return NextResponse.json(createSuccessResult({ cart }))
  } catch (error) {
    console.error('Error en GET /api/cart:', error)
    const appError = handleServiceError(error, 'GET /api/cart')
    return NextResponse.json(createErrorResult(appError), {
      status: appError.statusCode || 500
    })
  }
}

// POST - Agregar item al carrito
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar datos de entrada
    if (!body.product_id || !body.quantity || body.quantity < 1) {
      return NextResponse.json({
        error: 'Datos de item inválidos',
        code: 'INVALID_CART_ITEM'
      }, { status: 400 })
    }

    // Validar stock antes de agregar
    const validationResult = await cartService.validateStock(body.product_id, body.quantity)
    if (!validationResult.isValid) {
      return NextResponse.json({
        error: validationResult.message,
        code: 'INSUFFICIENT_STOCK',
        details: {
          availableStock: validationResult.availableStock
        }
      }, { status: 400 })
    }

    // Agregar al carrito
    const result = await cartService.addToCart(body.product_id, body.quantity)

    return NextResponse.json(createSuccessResult({
      success: result.success,
      message: result.message,
      addedQuantity: result.addedQuantity
    }))

  } catch (error) {
    console.error('Error en POST /api/cart:', error)
    const appError = handleServiceError(error, 'POST /api/cart')
    return NextResponse.json(createErrorResult(appError), {
      status: appError.statusCode || 500
    })
  }
}

// PUT - Actualizar cantidad de item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar datos de entrada
    if (!body.product_id || typeof body.quantity !== 'number' || body.quantity < 0) {
      return NextResponse.json({
        error: 'Datos de actualización inválidos',
        code: 'INVALID_UPDATE_DATA'
      }, { status: 400 })
    }

    // Si la cantidad es 0, eliminar el item
    if (body.quantity === 0) {
      await cartService.removeFromCart(body.product_id)
      return NextResponse.json(createSuccessResult({
        message: 'Item eliminado del carrito'
      }))
    }

    // Validar stock antes de actualizar
    const validationResult = await cartService.validateStock(body.product_id, body.quantity)
    if (!validationResult.isValid) {
      return NextResponse.json({
        error: validationResult.message,
        code: 'INSUFFICIENT_STOCK',
        details: {
          availableStock: validationResult.availableStock
        }
      }, { status: 400 })
    }

    // Actualizar cantidad
    await cartService.updateCartItemQuantity(body.product_id, body.quantity)

    return NextResponse.json(createSuccessResult({
      message: 'Cantidad actualizada exitosamente'
    }))

  } catch (error) {
    console.error('Error en PUT /api/cart:', error)
    const appError = handleServiceError(error, 'PUT /api/cart')
    return NextResponse.json(createErrorResult(appError), {
      status: appError.statusCode || 500
    })
  }
}

// DELETE - Vaciar carrito
export async function DELETE(request: NextRequest) {
  try {
    await cartService.clearCart()
    return NextResponse.json(createSuccessResult({
      message: 'Carrito vaciado exitosamente'
    }))
  } catch (error) {
    console.error('Error en DELETE /api/cart:', error)
    const appError = handleServiceError(error, 'DELETE /api/cart')
    return NextResponse.json(createErrorResult(appError), {
      status: appError.statusCode || 500
    })
  }
} 