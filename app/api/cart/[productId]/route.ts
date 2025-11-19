import { NextRequest, NextResponse } from 'next/server'
import { cartService } from '@/services/cartService'
import { handleServiceError, createSuccessResult, createErrorResult } from '@/lib/errorHandler'

// Helper para obtener el ID del producto de la URL
function getProductIdFromUrl(request: NextRequest): string {
  const segments = request.url.split('/')
  return segments[segments.length - 1]
}

// DELETE - Eliminar item específico del carrito
export async function DELETE(request: NextRequest) {
  try {
    const productId = getProductIdFromUrl(request)

    // Validar que el producto exista en el carrito
    const cart = await cartService.getCart()
    const itemExists = cart.items.some(item => item.product_id === productId)

    if (!itemExists) {
      return NextResponse.json({
        error: 'Producto no encontrado en el carrito',
        code: 'ITEM_NOT_FOUND'
      }, { status: 404 })
    }

    // Eliminar item
    await cartService.removeFromCart(productId)

    return NextResponse.json(createSuccessResult({
      message: 'Item eliminado del carrito exitosamente'
    }))

  } catch (error) {
    console.error('Error en DELETE /api/cart/[productId]:', error)
    const appError = handleServiceError(error, 'DELETE /api/cart/[productId]')
    return NextResponse.json(createErrorResult(appError), {
      status: appError.statusCode || 500
    })
  }
} 