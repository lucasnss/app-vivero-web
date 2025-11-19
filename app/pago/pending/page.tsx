"use client"

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Download, Loader2 } from 'lucide-react'
import { cartService } from '@/services/cartService'

export default function PaymentPendingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [cartRestored, setCartRestored] = useState(false)

  const paymentId = searchParams.get('payment_id')
  const status = searchParams.get('status')
  const externalReference = searchParams.get('external_reference')

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setPaymentData({
        payment_id: paymentId,
        status: status,
        order_id: externalReference,
        payment_method: 'efectivo'
      })
      
      // ✅ CAMBIO: Restaurar carrito temporal si el usuario vuelve sin pagar
      const restored = cartService.restoreTemporaryCart()
      if (restored) {
        console.log('🔄 Carrito restaurado después de volver de Mercado Pago sin completar pago')
        setCartRestored(true)
      }
      
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [paymentId, status, externalReference])

  const getStatusMessage = (status: string | null) => {
    switch (status) {
      case 'pending':
        return {
          title: 'Pago Pendiente',
          message: 'Tu pedido está confirmado y esperando el pago.',
          icon: <Clock className="h-16 w-16 text-yellow-600" />
        }
      case 'in_process':
        return {
          title: 'Pago en Proceso',
          message: 'Estamos verificando tu pago. Te notificaremos cuando esté confirmado.',
          icon: <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
        }
      default:
        return {
          title: 'Pago Pendiente',
          message: 'Tu pedido está siendo procesado.',
          icon: <Clock className="h-16 w-16 text-yellow-600" />
        }
    }
  }

  const statusInfo = getStatusMessage(status)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-600" />
              <p className="text-center text-gray-600">
                Cargando información del pago...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
      {/* Notificación de carrito restaurado */}
      {cartRestored && (
        <div className="fixed top-4 left-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-md">
          <p className="text-sm font-medium">
            ✅ Tu carrito ha sido restaurado. Puedes continuar comprando.
          </p>
        </div>
      )}
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {statusInfo.icon}
          </div>
          <CardTitle className="text-2xl text-yellow-800">
            {statusInfo.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              {statusInfo.message}
            </p>
            
            {paymentData && (
              <div className="bg-yellow-50 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID de Pago:</span>
                  <span className="font-mono text-yellow-800">
                    {paymentData.payment_id}
                  </span>
                </div>
                {paymentData.order_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID de Orden:</span>
                    <span className="font-mono text-yellow-800">
                      {paymentData.order_id}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span className="font-semibold text-yellow-800 capitalize">
                    {status === 'pending' ? 'Pendiente' : 'En Proceso'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Información específica para pagos en efectivo */}
          {paymentData?.payment_method === 'efectivo' && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">
                Instrucciones de Pago
              </h4>
              <p className="text-sm text-blue-700 mb-3">
                Presentá este comprobante en cualquier punto de pago autorizado para completar tu compra.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar Comprobante
              </Button>
            </div>
          )}

          <div className="space-y-2">
            {cartRestored && (
              <Button 
                onClick={() => router.push('/carrito')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Ver mi carrito
              </Button>
            )}
            
            <Button 
              onClick={() => router.push('/')}
              className="w-full bg-yellow-600 hover:bg-yellow-700"
            >
              Volver al inicio
            </Button>
            
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
            >
              Actualizar estado
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>
              Te enviaremos una notificación cuando se procese tu pago.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}