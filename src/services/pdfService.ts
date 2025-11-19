import { PDFDocument, rgb } from 'pdf-lib'
import { Order } from '@/src/types/order'

// =============================================================================
// FUNCIONES DE SEGURIDAD PARA VALORES UNDEFINED
// =============================================================================

/**
 * Convierte cualquier valor a número seguro (sin undefined)
 * Si el valor es undefined, null o NaN, retorna 0
 */
const safeNumber = (value: any): number => {
  const num = Number(value ?? 0)
  return isNaN(num) ? 0 : num
}

/**
 * Convierte cualquier valor a string seguro (sin undefined)
 * Si el valor es undefined o null, retorna 'No especificado'
 */
const safeString = (value: any): string => {
  return String(value ?? 'No especificado')
}

/**
 * Genera un PDF con el comprobante de compra de una orden
 * Usa pdf-lib que funciona correctamente en Next.js Server
 * 
 * @param order - Orden completa con items
 * @returns Buffer con el PDF generado
 */
export async function generateOrderReceiptPDF(order: Order): Promise<Buffer> {
  try {
    // Crear documento PDF
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595, 842]) // A4 size
    const { width, height } = page.getSize()
    
    const margin = 40
    let yPosition = height - margin
    const pageWidth = width - (margin * 2)

    // =============================================================================
    // ENCABEZADO
    // =============================================================================
    
    // Título
    yPosition -= 30
    page.drawText('COMPROBANTE DE COMPRA', {
      x: margin,
      y: yPosition,
      size: 24,
      color: rgb(76 / 255, 175 / 255, 80 / 255), // Verde #4CAF50
    })

    yPosition -= 15
    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: width - margin, y: yPosition },
      color: rgb(76 / 255, 175 / 255, 80 / 255),
      thickness: 2,
    })

    // Fecha y ID
    yPosition -= 20
    const createdDate = new Date(order.created_at).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    page.drawText(`Fecha: ${createdDate}`, {
      x: margin,
      y: yPosition,
      size: 11,
      color: rgb(102 / 255, 102 / 255, 102 / 255),
    })

    yPosition -= 15
    page.drawText(`Pedido #${order.id.substring(0, 8).toUpperCase()}`, {
      x: margin,
      y: yPosition,
      size: 11,
      color: rgb(102 / 255, 102 / 255, 102 / 255),
    })

    yPosition -= 25

    // =============================================================================
    // DATOS DEL CLIENTE
    // =============================================================================
    yPosition -= 5
    page.drawText('DATOS DEL CLIENTE', {
      x: margin,
      y: yPosition,
      size: 13,
      color: rgb(0, 0, 0),
    })

    yPosition -= 15
    page.drawText(`Nombre: ${order.customer_name}`, {
      x: margin,
      y: yPosition,
      size: 10,
      color: rgb(51 / 255, 51 / 255, 51 / 255),
    })

    yPosition -= 12
    page.drawText(`Email: ${order.customer_email}`, {
      x: margin,
      y: yPosition,
      size: 10,
      color: rgb(51 / 255, 51 / 255, 51 / 255),
    })

    yPosition -= 12
    page.drawText(`Teléfono: ${order.customer_phone || 'No especificado'}`, {
      x: margin,
      y: yPosition,
      size: 10,
      color: rgb(51 / 255, 51 / 255, 51 / 255),
    })

    yPosition -= 25

    // =============================================================================
    // MÉTODO DE ENTREGA
    // =============================================================================
    const isDelivery = order.shipping_method === 'delivery'

    page.drawText('MÉTODO DE ENTREGA', {
      x: margin,
      y: yPosition,
      size: 13,
      color: rgb(0, 0, 0),
    })

    yPosition -= 15
    page.drawText(`Metodo: ${isDelivery ? 'Envio a Domicilio' : 'Retiro en Tienda'}`, {
      x: margin,
      y: yPosition,
      size: 10,
      color: rgb(51 / 255, 51 / 255, 51 / 255),
    })

    // Mostrar dirección si es delivery
    if (isDelivery && order.shipping_address) {
      const addr = order.shipping_address
      yPosition -= 12
      const fullAddress = `${addr.street} ${addr.number}, ${addr.city}, ${addr.state}`
      page.drawText(`Dirección: ${fullAddress}`, {
        x: margin,
        y: yPosition,
        size: 9,
        color: rgb(51 / 255, 51 / 255, 51 / 255),
      })
    }

    yPosition -= 25

    // =============================================================================
    // PRODUCTOS
    // =============================================================================
    page.drawText('DETALLE DE PRODUCTOS', {
      x: margin,
      y: yPosition,
      size: 13,
      color: rgb(0, 0, 0),
    })

    yPosition -= 15

    // Encabezados de tabla
    const colWidths = {
      product: 250,
      qty: 50,
      price: 80,
      subtotal: 90,
    }

    page.drawText('Producto', { x: margin, y: yPosition, size: 9, color: rgb(0, 0, 0) })
    page.drawText('Cant.', { x: margin + colWidths.product + 10, y: yPosition, size: 9, color: rgb(0, 0, 0) })
    page.drawText('Precio', { x: margin + colWidths.product + colWidths.qty + 20, y: yPosition, size: 9, color: rgb(0, 0, 0) })
    page.drawText('Subtotal', { x: margin + colWidths.product + colWidths.qty + colWidths.price + 30, y: yPosition, size: 9, color: rgb(0, 0, 0) })

    yPosition -= 12
    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: width - margin, y: yPosition },
      thickness: 0.5,
      color: rgb(200 / 255, 200 / 255, 200 / 255),
    })

    yPosition -= 15

    // Items del pedido
    if (order.items && order.items.length > 0) {
      order.items.forEach((item) => {
        // 🛡️ Proteger contra valores undefined
        const productName = safeString(item.product_name).substring(0, 30)
        const quantity = safeNumber(item.quantity)
        const unitPrice = safeNumber(item.unit_price)
        const subtotal = quantity * unitPrice

        console.log('📦 Item PDF:', {
          name: item.product_name,
          quantity,
          unitPrice,
          subtotal
        })

        page.drawText(productName, { x: margin, y: yPosition, size: 9 })
        page.drawText(quantity.toString(), { x: margin + colWidths.product + 10, y: yPosition, size: 9 })
        page.drawText(`$${unitPrice.toFixed(2)}`, { x: margin + colWidths.product + colWidths.qty + 20, y: yPosition, size: 9 })
        page.drawText(`$${subtotal.toFixed(2)}`, { x: margin + colWidths.product + colWidths.qty + colWidths.price + 30, y: yPosition, size: 9 })

        yPosition -= 12
      })
    }

    yPosition -= 10

    // =============================================================================
    // TOTALES
    // =============================================================================
    page.drawLine({
      start: { x: margin + colWidths.product + colWidths.qty, y: yPosition },
      end: { x: width - margin, y: yPosition },
      thickness: 0.5,
      color: rgb(200 / 255, 200 / 255, 200 / 255),
    })

    yPosition -= 15
    
    // 🛡️ Proteger contra valores undefined en total
    const totalAmount = safeNumber(order.total_amount)
    console.log('💰 Total a mostrar en PDF:', totalAmount)
    
    page.drawText('TOTAL:', { x: margin + colWidths.product + colWidths.qty, y: yPosition, size: 11 })
    page.drawText(`$${totalAmount.toFixed(2)}`, {
      x: margin + colWidths.product + colWidths.qty + colWidths.price,
      y: yPosition,
      size: 13,
      color: rgb(76 / 255, 175 / 255, 80 / 255),
    })

    yPosition -= 25

    // =============================================================================
    // MÉTODO DE PAGO
    // =============================================================================
    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: width - margin, y: yPosition },
      thickness: 2,
      color: rgb(76 / 255, 175 / 255, 80 / 255),
    })

    yPosition -= 15
    page.drawText(`Método de Pago: ${getPaymentMethodLabel(order.payment_method || 'mercadopago')}`, {
      x: margin,
      y: yPosition,
      size: 10,
    })

    yPosition -= 12
    page.drawText(`Estado de Pago: ${getPaymentStatusLabel(order.payment_status)}`, {
      x: margin,
      y: yPosition,
      size: 10,
    })

    yPosition -= 25

    // =============================================================================
    // FOOTER
    // =============================================================================
    page.drawText('Gracias por su compra', {
      x: margin,
      y: yPosition,
      size: 10,
      color: rgb(153 / 255, 153 / 255, 153 / 255),
    })

    yPosition -= 12
    page.drawText('Para consultas: +54 9 381 355-4711', {
      x: margin,
      y: yPosition,
      size: 9,
      color: rgb(180 / 255, 180 / 255, 180 / 255),
    })

    yPosition -= 10
    page.drawText('WhatsApp: wa.me/5493813554711', {
      x: margin,
      y: yPosition,
      size: 9,
      color: rgb(180 / 255, 180 / 255, 180 / 255),
    })

    // Generar PDF como bytes
    const pdfBytes = await pdfDoc.save()
    return Buffer.from(pdfBytes)

  } catch (error) {
    console.error('❌ Error generando PDF:', error)
    throw error
  }
}

// =============================================================================
// FUNCIONES AUXILIARES
// =============================================================================

/**
 * Obtiene el label en español del método de pago
 */
function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    cash: 'Efectivo',
    transfer: 'Transferencia Bancaria',
    card: 'Tarjeta de Crédito/Débito',
    mercadopago: 'Mercado Pago'
  }
  return labels[method] || method
}

/**
 * Obtiene el label en español del estado de pago
 */
function getPaymentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
    cancelled: 'Cancelado',
    in_process: 'En Proceso',
    authorized: 'Autorizado',
    refunded: 'Reembolsado'
  }
  return labels[status] || status
}
