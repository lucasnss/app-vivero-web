"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { StatusBadge } from "./StatusBadge"
import { OrderCompletionToggle } from "./OrderCompletionToggle"
import { PaymentStatus, FulfillmentStatus } from "@/src/lib/orderStatus"
import { useEffect } from "react"
import { Download } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  image?: string
}

export interface OrderDetail {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address?: {
    street?: string
    number?: string
    city?: string
    state?: string // Puede ser 'state' o 'province'
    province?: string
    zip?: string // Puede ser 'zip' o 'postalCode'
    postalCode?: string
    notes?: string
    additional_info?: string // Campo adicional del formulario
  }
  payment_status: PaymentStatus
  fulfillment_status: FulfillmentStatus
  shipping_method: 'delivery' | 'pickup'
  total_amount: number
  created_at: string
  items: OrderItem[]
  payment_id?: string
  payment_method?: string
}

interface OrderDetailModalProps {
  isOpen: boolean
  onClose: () => void
  order: OrderDetail | null
  onOrderUpdate?: () => void
}

export function OrderDetailModal({ isOpen, onClose, order, onOrderUpdate }: OrderDetailModalProps) {
  // Debug logging para ver cuándo cambia la orden
  useEffect(() => {
    if (order) {
      console.log('📋 [OrderDetailModal] Nueva orden recibida:', {
        id: order.id,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        items_count: order.items?.length,
        shipping_method: order.shipping_method
      })
      
      console.log('📦 [OrderDetailModal] Items completos:', JSON.stringify(order.items, null, 2))
      console.log('💳 [OrderDetailModal] Estado de pago:', order.payment_status)
      console.log('👤 [OrderDetailModal] DATOS DEL CLIENTE:', {
        nombre: order.customer_name,
        email: order.customer_email,
        telefono: order.customer_phone,
        telefonoVacio: !order.customer_phone,
        telefonoTipo: typeof order.customer_phone
      })
      console.log('📮 [OrderDetailModal] Dirección de envío:', JSON.stringify(order.shipping_address, null, 2))
      console.log('💰 [OrderDetailModal] Total:', order.total_amount)
      console.log('📅 [OrderDetailModal] Fecha creación:', order.created_at)
    }
  }, [order?.id]) // Dependencia en order.id para detectar cambios
  
  if (!order) {
    console.log('⚠️ [OrderDetailModal] Order es null, no renderizando')
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const generatePDF = () => {
    try {
      console.log('📄 Generando PDF de la orden:', order.id)
      
      const doc = new jsPDF()
      
      // Configuración de fuentes y colores
      const primaryColor = [34, 139, 34] // Verde
      const textColor = [0, 0, 0] // Negro
      
      // Título
      doc.setFontSize(20)
      doc.setTextColor(...primaryColor)
      doc.text('Detalle de Orden', 105, 20, { align: 'center' })
      
      // ID de orden
      doc.setFontSize(12)
      doc.setTextColor(...textColor)
      doc.text(`ID: #${order.id.slice(-8)}`, 105, 28, { align: 'center' })
      
      // Fecha de creación
      doc.setFontSize(10)
      doc.text(`Fecha: ${formatDate(order.created_at)}`, 105, 34, { align: 'center' })
      
      let yPosition = 45
      
      // Información del Cliente
      doc.setFontSize(14)
      doc.setTextColor(...primaryColor)
      doc.text('Información del Cliente', 14, yPosition)
      yPosition += 8
      
      doc.setFontSize(10)
      doc.setTextColor(...textColor)
      doc.text(`Nombre: ${order.customer_name}`, 14, yPosition)
      yPosition += 6
      doc.text(`Email: ${order.customer_email}`, 14, yPosition)
      yPosition += 6
      doc.text(`Teléfono: ${order.customer_phone}`, 14, yPosition)
      yPosition += 10
      
      // Información de Entrega
      doc.setFontSize(14)
      doc.setTextColor(...primaryColor)
      doc.text('Información de Entrega', 14, yPosition)
      yPosition += 8
      
      doc.setFontSize(10)
      doc.setTextColor(...textColor)
      doc.text(`Método: ${order.shipping_method === 'delivery' ? 'Envío a Domicilio' : 'Retiro en Local'}`, 14, yPosition)
      yPosition += 6
      
      // Dirección de envío (si aplica)
      if (order.shipping_method === 'delivery' && order.shipping_address) {
        const addr = order.shipping_address
        if (addr.street || addr.number) {
          doc.text(`Dirección: ${addr.street || ''} ${addr.number || ''}`, 14, yPosition)
          yPosition += 6
        }
        if (addr.city) {
          doc.text(`Ciudad: ${addr.city}`, 14, yPosition)
          yPosition += 6
        }
        if (addr.state || addr.province) {
          doc.text(`Provincia: ${addr.state || addr.province}`, 14, yPosition)
          yPosition += 6
        }
        if (addr.zip || addr.postalCode) {
          doc.text(`Código Postal: ${addr.zip || addr.postalCode}`, 14, yPosition)
          yPosition += 6
        }
        if (addr.additional_info || addr.notes) {
          doc.text(`Info adicional: ${addr.additional_info || addr.notes}`, 14, yPosition)
          yPosition += 6
        }
      }
      yPosition += 5
      
      // Estado de la Orden
      doc.setFontSize(14)
      doc.setTextColor(...primaryColor)
      doc.text('Estado de la Orden', 14, yPosition)
      yPosition += 8
      
      doc.setFontSize(10)
      doc.setTextColor(...textColor)
      
      // Mapeo de estados a español
      const paymentStatusMap: Record<string, string> = {
        'pending': 'Pendiente',
        'approved': 'Aprobado',
        'rejected': 'Rechazado',
        'cancelled': 'Cancelado',
        'in_process': 'En Proceso'
      }
      
      const fulfillmentStatusMap: Record<string, string> = {
        'none': 'Sin Procesamiento',
        'awaiting_shipment': 'Esperando Envío',
        'awaiting_pickup': 'Esperando Retiro',
        'shipped': 'Enviado',
        'delivered': 'Entregado',
        'pickup_completed': 'Retiro Completado',
        'cancelled_by_admin': 'Cancelado'
      }
      
      doc.text(`Estado de Pago: ${paymentStatusMap[order.payment_status] || order.payment_status}`, 14, yPosition)
      yPosition += 6
      doc.text(`Estado de Entrega: ${fulfillmentStatusMap[order.fulfillment_status] || order.fulfillment_status}`, 14, yPosition)
      yPosition += 6
      
      if (order.payment_id) {
        doc.text(`ID de Pago: ${order.payment_id.slice(-8)}`, 14, yPosition)
        yPosition += 6
      }
      
      if (order.payment_method) {
        doc.text(`Método de Pago: ${order.payment_method}`, 14, yPosition)
        yPosition += 6
      }
      
      yPosition += 5
      
      // Tabla de Productos
      doc.setFontSize(14)
      doc.setTextColor(...primaryColor)
      doc.text('Productos', 14, yPosition)
      yPosition += 5
      
      // Preparar datos de la tabla
      const tableData = order.items.map(item => [
        item.name,
        item.quantity.toString(),
        `$${item.price.toLocaleString('es-AR')}`,
        `$${(item.price * item.quantity).toLocaleString('es-AR')}`
      ])
      
      // Generar tabla con autoTable
      autoTable(doc, {
        startY: yPosition,
        head: [['Producto', 'Cantidad', 'Precio Unit.', 'Subtotal']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 35, halign: 'right' },
          3: { cellWidth: 35, halign: 'right' }
        }
      })
      
      // Obtener la posición Y final de la tabla
      const finalY = (doc as any).lastAutoTable.finalY || yPosition + 30
      
      // Total
      doc.setFontSize(12)
      doc.setTextColor(...textColor)
      doc.setFont('helvetica', 'bold')
      doc.text('TOTAL:', 140, finalY + 10, { align: 'right' })
      doc.text(`$${order.total_amount.toLocaleString('es-AR')}`, 196, finalY + 10, { align: 'right' })
      
      // Pie de página
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(128, 128, 128)
      doc.text('Gracias por su compra', 105, 285, { align: 'center' })
      
      // Guardar PDF
      const fileName = `Orden_${order.id.slice(-8)}_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
      
      console.log('✅ PDF generado exitosamente:', fileName)
      
    } catch (error) {
      console.error('❌ Error generando PDF:', error)
      alert('Error al generar el PDF. Por favor, intenta nuevamente.')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-black">
                Detalle de Orden #{order.id.slice(-8)}
              </DialogTitle>
              <DialogDescription className="text-black">
                Creada el {formatDate(order.created_at)}
              </DialogDescription>
            </div>
            <Button
              onClick={generatePDF}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-green-700 border-green-700 hover:bg-green-50 mr-10"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Descargar PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Información del cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black">Información del Cliente</h3>
            <div className="space-y-2">
              <p className="text-black"><span className="font-medium">Nombre:</span> {order.customer_name}</p>
              <p className="text-black"><span className="font-medium">Email:</span> {order.customer_email}</p>
              <p className="text-black"><span className="font-medium">Teléfono:</span> {order.customer_phone}</p>
            </div>
          </div>

          {/* Información de entrega */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black">Información de Entrega</h3>
            <div className="space-y-2">
              <p className="text-black">
                <span className="font-medium">Forma de entrega:</span> {order.shipping_method === 'delivery' ? 'Domicilio' : 'Retiro'}
              </p>
              
              {order.shipping_method === 'delivery' && order.shipping_address && (
                <>
                  {/* Calle y Número */}
                  {(order.shipping_address.street || order.shipping_address.number) && (
                    <p className="text-black">
                      <span className="font-medium">Dirección:</span> {order.shipping_address.street || ''} {order.shipping_address.number || ''}
                    </p>
                  )}
                  
                  {/* Ciudad */}
                  {order.shipping_address.city && (
                    <p className="text-black">
                      <span className="font-medium">Ciudad:</span> {order.shipping_address.city}
                    </p>
                  )}
                  
                  {/* Estado/Provincia */}
                  {(order.shipping_address.state || order.shipping_address.province) && (
                    <p className="text-black">
                      <span className="font-medium">Provincia:</span> {order.shipping_address.state || order.shipping_address.province}
                    </p>
                  )}
                  
                  {/* Código Postal */}
                  {(order.shipping_address.zip || order.shipping_address.postalCode) && (
                    <p className="text-black">
                      <span className="font-medium">Código Postal:</span> {order.shipping_address.zip || order.shipping_address.postalCode}
                    </p>
                  )}
                  
                  {/* Información Adicional */}
                  {(order.shipping_address.additional_info || order.shipping_address.notes) && (
                    <p className="text-black">
                      <span className="font-medium">Información adicional:</span> {order.shipping_address.additional_info || order.shipping_address.notes}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Estado de la orden */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-black mb-2">Estado de la Orden</h3>
          <div className="flex flex-wrap gap-3">
            <StatusBadge 
              paymentStatus={order.payment_status} 
              fulfillmentStatus={order.fulfillment_status} 
            />
            {order.payment_id && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100 border border-blue-200 text-sm font-medium text-black">
                ID Pago: {order.payment_id.slice(-8)}
              </span>
            )}
            {order.payment_method && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-100 border border-purple-200 text-sm font-medium text-black">
                Método: {order.payment_method}
              </span>
            )}
          </div>
        </div>

        {/* Acción de completar pedido */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-black mb-3">Gestionar Pedido</h3>
          <OrderCompletionToggle
            orderId={order.id}
            paymentStatus={order.payment_status}
            fulfillmentStatus={order.fulfillment_status}
            shippingMethod={order.shipping_method}
            onStatusChange={() => {
              if (onOrderUpdate) {
                onOrderUpdate()
              }
            }}
            variant="button"
            size="md"
          />
        </div>

        {/* Productos */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-black mb-2">Productos</h3>
          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] text-black">Imagen</TableHead>
                  <TableHead className="text-black">Producto</TableHead>
                  <TableHead className="text-right text-black">Cant.</TableHead>
                  <TableHead className="text-right text-black">Precio</TableHead>
                  <TableHead className="text-right text-black">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.image ? (
                        <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-md overflow-hidden">
                          <Image 
                            src={item.image} 
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-md flex items-center justify-center">
                          <span className="text-gray-400 text-xs">Sin imagen</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-black">
                      <div className="max-w-[120px] sm:max-w-none truncate sm:whitespace-normal">
                        {item.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-black">{item.quantity}</TableCell>
                    <TableCell className="text-right text-black">${item.price.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-black">${(item.price * item.quantity).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-bold text-black">Total</TableCell>
                  <TableCell className="text-right font-bold text-black">${order.total_amount.toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
