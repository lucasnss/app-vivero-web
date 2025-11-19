"use client"

import { useState } from 'react'
import { CheckCircle2, Circle, Loader2, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PaymentStatus, FulfillmentStatus } from '@/src/lib/orderStatus'
import { useToast } from '@/hooks/use-toast'

interface OrderCompletionToggleProps {
  orderId: string
  paymentStatus: PaymentStatus
  fulfillmentStatus: FulfillmentStatus
  shippingMethod: 'delivery' | 'pickup'
  onStatusChange?: () => void
  variant?: 'checkbox' | 'button'
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Componente para marcar/desmarcar pedidos como completados
 * Soporta dos variantes: checkbox (para tabla) y button (para modal)
 */
export function OrderCompletionToggle({
  orderId,
  paymentStatus,
  fulfillmentStatus,
  shippingMethod,
  onStatusChange,
  variant = 'button',
  size = 'md'
}: OrderCompletionToggleProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Determinar si está completado
  const isCompleted = ['delivered', 'pickup_completed'].includes(fulfillmentStatus)

  // Determinar si se puede modificar
  const canModify = paymentStatus === 'approved'

  // Obtener label según método de envío
  const completionLabel = shippingMethod === 'delivery' 
    ? 'Entregado' 
    : 'Retirado'

  const handleToggle = async () => {
    if (!canModify) {
      toast({
        title: "Acción no permitida",
        description: "Solo se pueden completar pedidos con pago aprobado",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      const action = isCompleted ? 'revert' : 'complete'
      
      console.log(`🔄 ${action === 'complete' ? 'Marcando como completado' : 'Revirtiendo'} pedido ${orderId}...`)

      const response = await fetch(`/api/orders/${orderId}/fulfillment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action }),
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Error actualizando el pedido')
      }

      console.log('✅ Pedido actualizado:', data.data)

      // Mostrar notificación de éxito
      toast({
        title: action === 'complete' ? "✅ Pedido Completado" : "🔄 Pedido Revertido",
        description: data.data.emailSent 
          ? `${data.data.message} (Email enviado al cliente)` 
          : data.data.message,
        variant: "default"
      })

      // Llamar callback para refrescar la lista
      if (onStatusChange) {
        onStatusChange()
      }

    } catch (error) {
      console.error('❌ Error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // VARIANTE CHECKBOX (para usar en tablas)
  if (variant === 'checkbox') {
    return (
      <button
        onClick={handleToggle}
        disabled={!canModify || isLoading}
        className={`
          flex items-center gap-2 px-2 py-1 rounded-md transition-all
          ${isCompleted 
            ? 'text-green-700 bg-green-50 hover:bg-green-100' 
            : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
          }
          ${!canModify ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isLoading ? 'opacity-70' : ''}
        `}
        title={!canModify ? 'Solo se pueden completar pedidos con pago aprobado' : ''}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isCompleted ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <Circle className="h-4 w-4" />
        )}
        <span className="text-sm font-medium">
          {isCompleted ? completionLabel : 'Pendiente'}
        </span>
      </button>
    )
  }

  // VARIANTE BUTTON (para usar en modales o detalles)
  const buttonSize = size === 'sm' ? 'h-8 text-xs' : size === 'lg' ? 'h-12 text-base' : 'h-10 text-sm'

  return (
    <div className="flex gap-2">
      {isCompleted ? (
        // Botón para revertir
        <Button
          onClick={handleToggle}
          disabled={!canModify || isLoading}
          variant="outline"
          className={`${buttonSize} flex items-center gap-2`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Undo2 className="h-4 w-4" />
              Revertir a En Proceso
            </>
          )}
        </Button>
      ) : (
        // Botón para marcar como completado
        <Button
          onClick={handleToggle}
          disabled={!canModify || isLoading}
          variant="default"
          className={`${buttonSize} flex items-center gap-2 bg-green-600 hover:bg-green-700`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Marcar como {completionLabel}
            </>
          )}
        </Button>
      )}

      {/* Badge de estado */}
      <div className={`
        flex items-center gap-2 px-3 py-2 rounded-md border
        ${isCompleted 
          ? 'bg-green-50 border-green-200 text-green-700' 
          : 'bg-amber-50 border-amber-200 text-amber-700'
        }
      `}>
        {isCompleted ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-medium">{completionLabel}</span>
          </>
        ) : (
          <>
            <Circle className="h-4 w-4" />
            <span className="font-medium">Pendiente</span>
          </>
        )}
      </div>
    </div>
  )
}

