import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cartService } from '@/services/cartService'
import { CreateOrderRequest } from '@/types/order'

interface CheckoutState {
  loading: boolean
  error: string | null
  processingPayment: boolean
}

interface CustomerInfo {
  name: string
  email: string
  phone: string
  address: {
    street: string
    number: string
    city: string
    state: string
    zip: string
    additional_info?: string
  }
}

export function useCheckoutMP() {
  const [state, setState] = useState<CheckoutState>({
    loading: false,
    error: null,
    processingPayment: false
  })
  const router = useRouter()

  /**
   * Crear preferencia de pago y redirigir a Mercado Pago
   */
  const createPreferenceAndRedirect = async (
    customerInfo: CustomerInfo,
    paymentMethod: 'mercadopago' | 'cash',
    includeShipping: boolean = false
  ) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      // Limpiar carrito de items inválidos
      cartService.cleanCart()
      
      // Obtener items del carrito
      const cart = cartService.getCart()
      if (cart.items.length === 0) {
        throw new Error('El carrito está vacío')
      }

      // Validar stock antes de proceder
      for (const item of cart.items) {
        // Validar que el item tenga los datos necesarios
        if (!item.product_id || !item.product_name || !item.quantity || !item.price) {
          throw new Error(`Datos de producto incompletos. Por favor, actualiza tu carrito.`)
        }

        const stockValid = await cartService.validateStockForCheckout(item.product_id, item.quantity)
        if (!stockValid.isValid) {
          throw new Error(`Stock insuficiente para ${item.product_name}: ${stockValid.message}`)
        }
      }

      // Calcular costo de envío
      const shippingCost = includeShipping ? 2000 : 0
      const cartTotal = cartService.calculateCartTotal(cart.items)
      const totalAmount = cartTotal + shippingCost

      // ✅ CAMBIO: Separar email REAL del cliente vs email para MercadoPago
      const realCustomerEmail = customerInfo.email // Email REAL del cliente
      let emailForMP = customerInfo.email // Email para enviar a MercadoPago
      
      // En desarrollo, usar email de test SOLO para MercadoPago
      if (process.env.NODE_ENV === 'development') {
        if (!emailForMP.includes('@test') && !emailForMP.includes('test@mercadopago')) {
          console.log('🔧 [DEV] Usando email de test para MP sandbox:', emailForMP, '→ test_user_123456@testuser.com')
          console.log('📧 Email REAL del cliente que se guardará:', realCustomerEmail)
          emailForMP = 'test_user_123456@testuser.com'
        }
      }

      // Preparar datos de la orden
      const orderData: any = {
        items: cart.items.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price,
          image: item.image
        })),
        shipping_address: customerInfo.address,
        payment_method: paymentMethod,
        customer_email: realCustomerEmail, // ✅ Email REAL del cliente (para guardar en BD)
        customer_email_for_mp: emailForMP, // ✅ Email para MercadoPago (mockeado en dev)
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        // ✅ NUEVO: Guardar información de envío en la orden
        shipping_method: includeShipping ? 'delivery' : 'pickup',
        notes: includeShipping ? 'Envío a domicilio incluido' : undefined
      } as CreateOrderRequest

      if (paymentMethod === 'mercadopago') {
        setState(prev => ({ ...prev, processingPayment: true }))
        
        console.log('🚀 Iniciando creación de preferencia de pago...')
        console.log('📦 Datos a enviar:', JSON.stringify(orderData, null, 2))
        
        // Crear preferencia de pago
        const response = await fetch('/api/mercadopago/create-preference', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData)
        })

        console.log('📡 Respuesta recibida:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        })

        const result = await response.json()
        console.log('📄 Resultado parseado:', JSON.stringify(result, null, 2))

        if (!result.success) {
          console.error('❌ Error en la respuesta del servidor:', result)
          const errorMessage = result.details ? 
            `${result.error}\n\nDetalles técnicos: ${JSON.stringify(result.details, null, 2)}` : 
            result.error
          throw new Error(errorMessage || 'Error al crear preferencia de pago')
        }

        // ✅ CAMBIO: Guardar carrito temporal en lugar de limpiarlo
        // El carrito se limpiaremos solo cuando el pago sea exitoso (en el webhook)
        cartService.saveTemporaryCart()
        console.log('💾 Carrito temporal guardado. Se limpiar solo después de pago exitoso.')

        // Redirigir a Mercado Pago (usar sandbox_init_point si la clave pública es de TEST)
        const isTestKey = (process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || '').startsWith('TEST-')
        const redirectUrl = isTestKey && result.data.sandbox_init_point
          ? result.data.sandbox_init_point
          : result.data.init_point
        console.log('🔗 Redirigiendo a:', redirectUrl, 'isTestKey:', isTestKey)
        window.location.href = redirectUrl

      } else {
        // Para método cash, crear orden directamente
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData)
        })

        if (!response.ok) {
          throw new Error('Error al crear orden')
        }

        // Limpiar carrito
        cartService.clearCart()

        // Redirigir a página de confirmación
        router.push('/carrito/confirmacion')
      }

    } catch (error) {
      console.error('💥 === ERROR EN CHECKOUT ===')
      console.error('❌ Error completo:', error)
      console.error('❌ Error message:', error instanceof Error ? error.message : 'Error desconocido')
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack')
      
      let userFriendlyMessage = 'Error desconocido'
      
      if (error instanceof Error) {
        console.error('❌ Error type:', error.constructor.name)
        
        // Extraer mensaje amigable del error
        if (error.message.includes('fetch')) {
          userFriendlyMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.'
        } else if (error.message.includes('Stock insuficiente')) {
          userFriendlyMessage = error.message
        } else if (error.message.includes('Variables de entorno faltantes')) {
          userFriendlyMessage = 'Error de configuración del servidor. Contacta al administrador.'
        } else if (error.message.includes('MP_ACCESS_TOKEN')) {
          userFriendlyMessage = 'Error de configuración de Mercado Pago. Contacta al administrador.'
        } else {
          userFriendlyMessage = error.message
        }
      }
      
      console.error('💥 === FIN ERROR CHECKOUT ===')
      
      setState(prev => ({
        ...prev,
        loading: false,
        processingPayment: false,
        error: userFriendlyMessage
      }))
    }
  }

  /**
   * Verificar estado de pago de una orden
   */
  const checkPaymentStatus = async (orderId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const response = await fetch(`/api/mercadopago/payment-status/${orderId}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Error al verificar estado de pago')
      }

      setState(prev => ({ ...prev, loading: false }))
      return result.data

    } catch (error) {
      console.error('Error checking payment status:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }))
      return null
    }
  }

  /**
   * Reiniciar estado de error
   */
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }))
  }

  /**
   * Validar información del cliente
   */
  const validateCustomerInfo = (customerInfo: CustomerInfo): string | null => {
    if (!customerInfo.name.trim()) {
      return 'El nombre es requerido'
    }
    if (!customerInfo.email.trim()) {
      return 'El email es requerido'
    }
    if (!/\S+@\S+\.\S+/.test(customerInfo.email)) {
      return 'El email no es válido'
    }
    if (!customerInfo.phone.trim()) {
      return 'El teléfono es requerido'
    }
    if (!customerInfo.address.street.trim()) {
      return 'La dirección es requerida'
    }
    if (!customerInfo.address.number.trim()) {
      return 'El número de dirección es requerido'
    }
    if (!customerInfo.address.city.trim()) {
      return 'La ciudad es requerida'
    }
    if (!customerInfo.address.state.trim()) {
      return 'La provincia es requerida'
    }
    if (!customerInfo.address.zip.trim()) {
      return 'El código postal es requerido'
    }
    return null
  }

  return {
    ...state,
    createPreferenceAndRedirect,
    checkPaymentStatus,
    clearError,
    validateCustomerInfo
  }
}