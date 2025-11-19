export interface CartItem {
  product_id: string
  product_name: string
  quantity: number
  price: number
  image?: string
  unit_price?: number // Para compatibilidad
}

export interface CartValidationResult {
  isValid: boolean
  availableStock: number
  message: string
}

export interface AddToCartResult {
  success: boolean
  message: string
  addedQuantity: number
}

export interface StoredCart {
  items: CartItem[]
  timestamp: number
  userId?: string // ID del usuario si está autenticado
}

// Nuevos tipos para el cálculo de envío
export interface ShippingOption {
  id: string
  name: string
  description: string
  price: number
  estimated_days: number
}

export interface ShippingCalculation {
  available_options: ShippingOption[]
  selected_option?: string
}

// Tipos para el resumen del carrito con envío
export interface CartSummary {
  subtotal: number
  shipping_cost: number
  total: number
  item_count: number
  has_shipping: boolean
} 