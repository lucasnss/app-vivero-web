"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CreditCard, Truck, MapPin, Phone, Mail, User } from "lucide-react"
import { cartService } from "@/services/cartService"
import { productService } from "@/services/productService"
import { useCheckoutMP } from "@/hooks/useCheckoutMP"
import { CartItem } from "@/types/cartItem"
import { Product } from "@/types/product"

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

export default function PagoPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [products, setProducts] = useState<(Product & { quantity: number; availableStock: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [showAlert, setShowAlert] = useState(false)
  const [envioDomicilio, setEnvioDomicilio] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'cash'>('mercadopago')
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      number: '',
      city: '',
      state: '',
      zip: '',
      additional_info: ''
    }
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  
  const router = useRouter()
  const { 
    loading: checkoutLoading, 
    error: checkoutError, 
    processingPayment,
    createPreferenceAndRedirect, 
    clearError,
    validateCustomerInfo 
  } = useCheckoutMP()

  useEffect(() => {
    const items = cartService.getCart().items
    setCartItems(items)
    if (items.length === 0) setShowAlert(true)
    
    // Leer preferencia de envío guardada
    const savedEnvio = localStorage.getItem('envioDomicilio')
    if (savedEnvio) setEnvioDomicilio(savedEnvio === 'true')
    
    // Leer información del cliente guardada
    const savedCustomerInfo = localStorage.getItem('customerInfo')
    if (savedCustomerInfo) {
      try {
        setCustomerInfo(JSON.parse(savedCustomerInfo))
      } catch (error) {
        console.error('Error parsing saved customer info:', error)
      }
    }
  }, [])

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      const items = cartService.getCart().items
      const prods: (Product & { quantity: number; availableStock: number })[] = []
      
      for (const item of items) {
        const prod = await productService.getProductById(item.product_id)
        if (prod) {
          const availableStock = await cartService.getAvailableStock(item.product_id)
          prods.push({ 
            ...prod, 
            quantity: item.quantity, 
            availableStock 
          })
        }
      }
      setProducts(prods)
      setLoading(false)
    }
    fetchProducts()
  }, [cartItems])

  const envioCosto = 2000
  const totalProductos = cartService.calculateCartTotal(cartItems)
  const total = envioDomicilio ? totalProductos + envioCosto : totalProductos

  const handleEnvioChange = () => {
    setEnvioDomicilio((prev) => {
      localStorage.setItem('envioDomicilio', (!prev).toString())
      return !prev
    })
  }

  const handleCustomerInfoChange = (field: string, value: string) => {
    setCustomerInfo(prev => {
      const newInfo = { ...prev }
      if (field.includes('.')) {
        const [parent, child] = field.split('.')
        newInfo[parent as keyof CustomerInfo] = {
          ...(newInfo[parent as keyof CustomerInfo] as any),
          [child]: value
        }
      } else {
        newInfo[field as keyof CustomerInfo] = value as any
      }
      
      // Guardar en localStorage
      localStorage.setItem('customerInfo', JSON.stringify(newInfo))
      return newInfo
    })
    
    // Limpiar error del campo si existe
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const validationError = validateCustomerInfo(customerInfo)
    if (validationError) {
      setFormErrors({ general: validationError })
      return false
    }
    
    setFormErrors({})
    return true
  }

  const handleCheckout = async () => {
    if (!validateForm()) {
      return
    }

    await createPreferenceAndRedirect(customerInfo, paymentMethod, envioDomicilio)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      {/* Header */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-600 to-yellow-500">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.push('/carrito')}
              className="flex items-center space-x-2 bg-yellow-400 hover:bg-yellow-500 text-green-900 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Volver al carrito</span>
            </button>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white text-center">
            Finalizar Compra
          </h1>
          <p className="text-xl text-green-100 text-center mt-2">
            Completa tus datos y elige tu método de pago
          </p>
        </div>
      </section>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Alerta de carrito vacío */}
          {showAlert && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8 text-center">
              <span className="block">¡Tu carrito está vacío!</span>
              <button
                className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg"
                onClick={() => router.push('/')}
              >
                Ir a comprar
              </button>
            </div>
          )}

          {/* Error de checkout */}
          {checkoutError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8">
              <div className="flex justify-between items-center">
                <span>{checkoutError}</span>
                <button
                  onClick={clearError}
                  className="text-red-600 hover:text-red-800 font-bold text-xl"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Error de formulario */}
          {formErrors.general && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8">
              <span>{formErrors.general}</span>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12 text-green-700">
              Cargando productos del carrito...
            </div>
          ) : products.length > 0 && !showAlert && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Columna izquierda - Información del cliente */}
              <div className="space-y-6">
                {/* Datos personales */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
                    <User className="h-6 w-6 mr-2" />
                    Datos Personales
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-1">
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        value={customerInfo.name}
                        onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Juan Pérez"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-1">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          value={customerInfo.email}
                          onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="juan@ejemplo.com"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-1">
                        Teléfono *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          value={customerInfo.phone}
                          onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="11 1234-5678"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dirección de entrega */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
                    <MapPin className="h-6 w-6 mr-2" />
                    Dirección de Entrega
                  </h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-green-700 mb-1">
                          Calle *
                        </label>
                        <input
                          type="text"
                          value={customerInfo.address.street}
                          onChange={(e) => handleCustomerInfoChange('address.street', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Av. Corrientes"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">
                          Número *
                        </label>
                        <input
                          type="text"
                          value={customerInfo.address.number}
                          onChange={(e) => handleCustomerInfoChange('address.number', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="1234"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">
                          Ciudad *
                        </label>
                        <input
                          type="text"
                          value={customerInfo.address.city}
                          onChange={(e) => handleCustomerInfoChange('address.city', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Buenos Aires"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">
                          Provincia *
                        </label>
                        <input
                          type="text"
                          value={customerInfo.address.state}
                          onChange={(e) => handleCustomerInfoChange('address.state', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="CABA"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-1">
                        Código Postal *
                      </label>
                      <input
                        type="text"
                        value={customerInfo.address.zip}
                        onChange={(e) => handleCustomerInfoChange('address.zip', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="1000"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-1">
                        Información adicional
                      </label>
                      <input
                        type="text"
                        value={customerInfo.address.additional_info}
                        onChange={(e) => handleCustomerInfoChange('address.additional_info', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Departamento, piso, etc."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna derecha - Resumen y pago */}
              <div className="space-y-6">
                {/* Resumen del pedido */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-green-800">Resumen del Pedido</h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {products.map((item) => (
                      <div key={item.id} className="p-4 flex items-center space-x-4">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-green-800 text-sm">{item.name}</h3>
                          <p className="text-green-600 font-bold">
                            ${item.price} x {item.quantity} = <span className="font-semibold">${item.price * item.quantity}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Opciones de envío */}
                  <div className="p-6 bg-green-50 border-t border-gray-200">
                    <div className="flex items-center mb-4">
                      <Truck className="h-5 w-5 text-green-600 mr-2" />
                      <label className="font-medium text-green-800">Opciones de entrega</label>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={envioDomicilio}
                          onChange={handleEnvioChange}
                          className="mr-2"
                        />
                        <span className="text-green-700">
                          Envío a domicilio (+${envioCosto})
                        </span>
                      </label>
                    </div>
                    
                    {envioDomicilio && (
                      <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-800">
                          El envío se realizará a la dirección proporcionada en 2-3 días hábiles.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="p-6 bg-gray-50">
                    <div className="flex justify-between items-center text-lg font-semibold text-green-800 mb-4">
                      <span>Total a pagar:</span>
                      <span className="text-2xl font-bold text-green-700">${total}</span>
                    </div>
                  </div>
                </div>

                {/* Métodos de pago */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
                    <CreditCard className="h-6 w-6 mr-2" />
                    Método de Pago
                  </h2>
                  
                  <div className="space-y-4 mb-6">
                    <label className="flex items-center p-4 border-2 border-blue-200 rounded-lg cursor-pointer hover:border-blue-300">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="mercadopago"
                        checked={paymentMethod === 'mercadopago'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'mercadopago')}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex items-center">
                          <img 
                            src="/mercadopago-logo.png" 
                            alt="Mercado Pago" 
                            className="h-8 mr-3"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                          <div>
                            <p className="font-semibold text-blue-600">Mercado Pago</p>
                            <p className="text-sm text-gray-600">Tarjetas, transferencia, efectivo</p>
                          </div>
                        </div>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'cash')}
                        className="mr-3"
                      />
                      <div>
                        <p className="font-semibold text-gray-700">Pago en efectivo</p>
                        <p className="text-sm text-gray-600">Coordinar pago al momento de entrega</p>
                      </div>
                    </label>
                  </div>

                  {/* Botón de pago */}
                  <button
                    onClick={handleCheckout}
                    disabled={checkoutLoading || processingPayment}
                    className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
                      checkoutLoading || processingPayment
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : paymentMethod === 'mercadopago'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {checkoutLoading ? (
                      'Validando...'
                    ) : processingPayment ? (
                      'Redirigiendo a Mercado Pago...'
                    ) : paymentMethod === 'mercadopago' ? (
                      'Pagar con Mercado Pago'
                    ) : (
                      'Confirmar Pedido'
                    )}
                  </button>

                  {paymentMethod === 'mercadopago' && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        Serás redirigido a Mercado Pago para completar el pago de forma segura.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 