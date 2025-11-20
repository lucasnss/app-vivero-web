"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Loader2 } from 'lucide-react'
import { cartService } from '@/services/cartService'

// Componente que usa useSearchParams
function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [paymentData, setPaymentData] = useState<any>(null)

  const paymentId = searchParams.get('payment_id')
  const status = searchParams.get('status')
  const externalReference = searchParams.get('external_reference')

  useEffect(() => {
    // Simular verificación de pago
    const timer = setTimeout(() => {
      setPaymentData({
        payment_id: paymentId,
        status: status,
        order_id: externalReference
      })
      
      // ✅ CAMBIO: Limpiar carrito temporal cuando el pago es exitoso
      if (status === 'approved') {
        console.log('✅ Pago exitoso, limpiando carrito temporal')
        cartService.clearCart() // Limpiar carrito normal también
        cartService.clearTemporaryCart() // Limpiar carrito temporal
      }
      
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [paymentId, status, externalReference])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              <p className="text-center text-gray-600">
                Verificando tu pago...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">
            ¡Pago Exitoso!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Tu pedido ha sido confirmado y procesado correctamente.
            </p>
            
            {paymentData && (
              <div className="bg-green-50 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID de Pago:</span>
                  <span className="font-mono text-green-800">
                    {paymentData.payment_id}
                  </span>
                </div>
                {paymentData.order_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID de Orden:</span>
                    <span className="font-mono text-green-800">
                      {paymentData.order_id}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span className="font-semibold text-green-800">
                    {paymentData.status === 'approved' ? 'Aprobado' : 'Procesado'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Button 
              onClick={() => router.push('/')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Volver al inicio
            </Button>
            <Button 
              onClick={() => router.push('/carrito')}
              variant="outline"
              className="w-full"
            >
              Ver carrito
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>
              Recibirás un email de confirmación en breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente de fallback mientras se carga
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <p className="text-center text-gray-600">
              Cargando información del pago...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Página principal con Suspense
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentSuccessContent />
    </Suspense>
  )
}