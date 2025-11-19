import nodemailer from 'nodemailer'
import { Order } from '@/src/types/order'
import { generateOrderReceiptPDF } from './pdfService'

/**
 * Configurar transportador de email
 * Usa las variables de entorno para la configuración
 */
function createTransporter() {
  const emailUser = process.env.EMAIL_USER
  const emailPassword = process.env.EMAIL_PASSWORD

  if (!emailUser || !emailPassword) {
    console.warn('⚠️ Variables de entorno EMAIL_USER o EMAIL_PASSWORD no configuradas')
    throw new Error('Configuración de email incompleta')
  }

  return nodemailer.createTransport({
    service: 'gmail', // Puedes cambiar a 'resend', 'sendgrid', etc.
    auth: {
      user: emailUser,
      pass: emailPassword
    }
  })
}

/**
 * Envía un email de notificación cuando se completa un pedido
 * Incluye PDF adjunto y mensaje personalizado según el método de envío
 * 
 * @param order - Orden completada
 * @returns true si se envió exitosamente, false si hubo error
 */
export async function sendCompletionEmail(order: Order): Promise<boolean> {
  try {
    console.log(`📧 Preparando email para ${order.customer_email}...`)

    // =============================================================================
    // 🔍 DIAGNÓSTICO: Ver qué datos tiene la orden ANTES de generar PDF
    // =============================================================================
    console.log('🔍 Datos de la orden completa:', {
      id: order.id,
      total_amount: order.total_amount,
      items: order.items?.map(i => ({
        name: i.product_name,
        quantity: i.quantity,
        unit_price: i.unit_price,
        subtotal: i.quantity * i.unit_price
      })),
      shipping_method: order.shipping_method,
      customer_name: order.customer_name,
      customer_email: order.customer_email
    })

    const isDelivery = order.shipping_method === 'delivery'
    const phoneNumber = '3813554711'
    const whatsappLink = `https://wa.me/549${phoneNumber}`

    // =============================================================================
    // GENERAR PDF
    // =============================================================================
    console.log('📄 Generando PDF...')
    const pdfBuffer = await generateOrderReceiptPDF(order)
    console.log('✅ PDF generado exitosamente')

    // =============================================================================
    // MENSAJE PERSONALIZADO SEGÚN MÉTODO DE ENVÍO
    // =============================================================================
    const deliveryMessage = isDelivery
      ? `
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <h3 style="color: #856404; margin: 0 0 10px 0;">🚚 Envío a Domicilio</h3>
          <p style="color: #856404; margin: 0; font-size: 15px;">
            <strong>Tiempo estimado de entrega:</strong> 1 a 3 días hábiles
          </p>
          <p style="color: #856404; margin: 10px 0 0 0; font-size: 14px;">
            Recibirás tu pedido en la dirección: <strong>${getFullAddress(order)}</strong>
          </p>
        </div>
      `
      : `
        <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <h3 style="color: #155724; margin: 0 0 10px 0;">🏪 Retiro en Tienda</h3>
          <p style="color: #155724; margin: 0; font-size: 16px;">
            <strong>¡Tu pedido está listo para retirar!</strong>
          </p>
          <p style="color: #155724; margin: 10px 0 0 0; font-size: 14px;">
            Podés pasar a buscarlo en nuestro horario de atención.
          </p>
        </div>
      `

    // =============================================================================
    // HTML DEL EMAIL
    // =============================================================================
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Pedido Completado</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  
                  <!-- HEADER -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">
                        ✅ ¡Pedido Completado!
                      </h1>
                      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                        Pedido #${order.id.substring(0, 8).toUpperCase()}
                      </p>
                    </td>
                  </tr>

                  <!-- CONTENIDO PRINCIPAL -->
                  <tr>
                    <td style="padding: 30px;">
                      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Hola <strong>${order.customer_name}</strong>,
                      </p>
                      
                      <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                        Tu pedido ha sido procesado exitosamente. Adjuntamos el comprobante de compra en formato PDF.
                      </p>

                      <!-- MENSAJE PERSONALIZADO SEGÚN MÉTODO DE ENVÍO -->
                      ${deliveryMessage}

                      <!-- RESUMEN DEL PEDIDO -->
                      <div style="background: #f9f9f9; border-radius: 6px; padding: 20px; margin: 20px 0;">
                        <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">
                          📦 Resumen del Pedido
                        </h3>
                        <table width="100%" cellpadding="5" style="color: #666; font-size: 14px;">
                          <tr>
                            <td><strong>Fecha:</strong></td>
                            <td>${new Date(order.created_at).toLocaleDateString('es-AR', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}</td>
                          </tr>
                          <tr>
                            <td><strong>Método de Pago:</strong></td>
                            <td>${getPaymentMethodLabel(order.payment_method || 'mercadopago')}</td>
                          </tr>
                          <tr>
                            <td><strong>Total:</strong></td>
                            <td style="color: #4CAF50; font-size: 18px; font-weight: bold;">
                              $${(order.total_amount ?? 0).toFixed(2)}
                            </td>
                          </tr>
                        </table>
                      </div>

                      <!-- CONTACTO -->
                      <div style="background: #e3f2fd; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        <p style="color: #1565c0; margin: 0 0 10px 0; font-size: 15px;">
                          <strong>📱 ¿Tenés alguna consulta?</strong>
                        </p>
                        <p style="color: #1976d2; margin: 0; font-size: 14px;">
                          Comunicate con nosotros por WhatsApp:
                        </p>
                        <a href="${whatsappLink}" 
                           style="display: inline-block; background: #25D366; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin-top: 10px; font-weight: bold;">
                          💬 Chatear por WhatsApp
                        </a>
                        <p style="color: #666; margin: 10px 0 0 0; font-size: 13px;">
                          O llamanos al: <strong>+54 9 381 355-4711</strong>
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- FOOTER -->
                  <tr>
                    <td style="background: #f5f5f5; padding: 20px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                      <p style="color: #999; font-size: 13px; margin: 0 0 5px 0;">
                        Gracias por confiar en nosotros 💚
                      </p>
                      <p style="color: #bbb; font-size: 12px; margin: 0;">
                        Este es un email automático, por favor no responder.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `

    // =============================================================================
    // ENVIAR EMAIL
    // =============================================================================
    console.log('📮 Enviando email...')
    
    const transporter = createTransporter()
    
    const info = await transporter.sendMail({
      from: `"Vivero Web" <${process.env.EMAIL_USER}>`,
      to: order.customer_email,
      subject: `✅ Pedido #${order.id.substring(0, 8).toUpperCase()} - ${isDelivery ? 'En camino' : 'Listo para retirar'}`,
      html: htmlContent,
      attachments: [
        {
          filename: `Comprobante-Pedido-${order.id.substring(0, 8)}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    })

    console.log('✅ Email enviado exitosamente. ID:', info.messageId)
    return true

  } catch (error) {
    console.error('❌ Error enviando email:', error)
    if (error instanceof Error) {
      console.error('   Detalles:', error.message)
    }
    return false
  }
}

// =============================================================================
// FUNCIONES AUXILIARES
// =============================================================================

/**
 * Obtiene la dirección completa formateada
 */
function getFullAddress(order: Order): string {
  if (!order.shipping_address) {
    return 'No especificada'
  }

  const addr = order.shipping_address
  let fullAddress = `${addr.street} ${addr.number}, ${addr.city}, ${addr.state}`
  
  if (addr.zip) {
    fullAddress += ` (CP: ${addr.zip})`
  }
  
  return fullAddress
}

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

