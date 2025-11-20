"use client"

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { XCircle, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react'

// Componente que usa useSearchParams
function PaymentFailureContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const paymentId = searchParams.get('payment_id')
  const status = searchParams.get('status')
  const statusDetail = searchParams.get('status_detail')

  const getErrorMessage = (status: string | null, statusDetail: string | null) => {
    if (status === 'rejected') {
      switch (statusDetail) {
        case 'cc_rejected_insufficient_amount':
          return 'Fondos insuficientes en la tarjeta'
        case 'cc_rejected_bad_filled_security_code':
          return 'Código de seguridad incorrecto'
        case 'cc_rejected_bad_filled_date':
          return 'Fecha de vencimiento incorrecta'
        case 'cc_rejected_bad_filled_other':
          return 'Datos de la tarjeta incorrectos'
        default:
          return 'El pago fue rechazado. Verifica los datos e intenta nuevamente.'
      }
    }
    
    return 'Hubo un problema procesando tu pago. Por favor, intenta nuevamente.'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <XCircle className="h-16 w-16 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-800">
            Pago No Procesado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              {getErrorMessage(status, statusDetail)}
            </p>
            
            {paymentId && (
              <div className="bg-red-50 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID de Pago:</span>
                  <span className="font-mono text-red-800">
                    {paymentId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span className="font-semibold text-red-800 capitalize">
                    {status || 'Rechazado'}
                  </span>
                </div>
                {statusDetail && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Detalle:</span>
                    <span className="text-red-800 text-xs">
                      {statusDetail}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Button 
              onClick={() => router.push('/carrito/pago')}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Intentar nuevamente
            </Button>
            
            <Button 
              onClick={() => router.push('/carrito')}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al carrito
            </Button>
            
            <Button 
              onClick={() => router.push('/')}
              variant="ghost"
              className="w-full"
            >
              Ir al inicio
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>
              Si el problema persiste, contacta a nuestro soporte.
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            <p className="text-center text-gray-600">
              Cargando información...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Página principal con Suspense
export default function PaymentFailurePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentFailureContent />
    </Suspense>
  )
}