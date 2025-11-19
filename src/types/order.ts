import { CartItem } from './cartItem'

export interface Order {
  id: string
  status: OrderStatus
  total_amount: number
  shipping_address: ShippingAddress
  payment_method: PaymentMethod
  notes?: string
  created_by_admin?: string
  created_at: string
  updated_at: string
  items: OrderItem[]
  customer_email: string
  customer_name: string
  customer_phone: string
  
  // Campos de Mercado Pago
  payment_id?: string
  comprobante_url?: string
  metodo_pago?: string
  email_comprador?: string
  fecha_pago?: string
  payment_status: PaymentStatus
  preference_id?: string
  payment_type?: string
  merchant_order_id?: string
  external_reference?: string
  
  // Tipo de pago (test o real)
  payment_source?: 'real' | 'test'
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export type PaymentMethod = 'cash' | 'transfer' | 'card' | 'mercadopago'

export type PaymentStatus = 
  | 'pending'     // Pago pendiente
  | 'approved'    // Pago aprobado
  | 'rejected'    // Pago rechazado
  | 'cancelled'   // Pago cancelado
  | 'in_process'  // Pago en proceso
  | 'authorized'  // Pago autorizado (para tarjetas)
  | 'refunded'    // Pago reembolsado

export type MercadoPagoPaymentType = 
  | 'credit_card'   // Tarjeta de crédito
  | 'debit_card'    // Tarjeta de débito
  | 'ticket'        // Cupón de pago (Rapipago, Pago Fácil)
  | 'bank_transfer' // Transferencia bancaria
  | 'account_money' // Dinero en cuenta MP
  | 'digital_currency' // Moneda digital

export interface ShippingAddress {
  street: string
  number: string
  city: string
  state: string
  zip: string
  additional_info?: string
}

export interface OrderItem extends Omit<CartItem, 'id'> {
  id: string
  order_id: string
  subtotal: number
  product_name: string
}

export interface CreateOrderRequest {
  items: Omit<CartItem, 'id'>[]
  shipping_address: ShippingAddress
  payment_method: PaymentMethod
  customer_email: string
  customer_email_for_mp?: string // ✅ Email para MercadoPago (mockeado en dev, opcional)
  customer_name: string
  customer_phone: string
  // ✅ NUEVO: Guardar método de envío
  shipping_method?: 'pickup' | 'delivery'
  notes?: string
  created_by_admin?: string
  payment_source?: 'real' | 'test'
  // ✅ CRÍTICO: external_reference para idempotencia en webhook
  external_reference?: string
}

export interface UpdateOrderRequest {
  status?: OrderStatus
  notes?: string
}

export interface OrdersResponse {
  orders: Order[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface GetOrdersOptions {
  page: number
  limit: number
  status?: OrderStatus
  email?: string
  payment_status?: PaymentStatus
}

// ==========================================
// INTERFACES ESPECÍFICAS DE MERCADO PAGO
// ==========================================

export interface MercadoPagoPaymentInfo {
  payment_id: string
  status: PaymentStatus
  status_detail: string
  payment_method_id: string
  payment_type_id: MercadoPagoPaymentType
  date_approved?: string
  date_created: string
  payer_email?: string
  transaction_amount: number
  net_received_amount?: number
  total_paid_amount?: number
  
  // Para métodos offline
  ticket_url?: string
  
  // Para tarjetas
  authorization_code?: string
  
  // Información adicional
  external_reference?: string
  merchant_order_id?: string
}

export interface CreateMercadoPagoPreferenceRequest {
  order_id: string
  items: Array<{
    id: string
    title: string
    description: string
    picture_url?: string
    category_id: string
    quantity: number
    currency_id: string
    unit_price: number
  }>
  payer?: {
    name?: string
    surname?: string
    email?: string
    phone?: {
      area_code?: string
      number?: string
    }
    address?: {
      street_name?: string
      street_number?: string
      zip_code?: string
    }
  }
  back_urls: {
    success: string
    failure: string
    pending: string
  }
  notification_url: string
  external_reference: string
  auto_return: 'approved' | 'all'
}

export interface MercadoPagoPreferenceResponse {
  id: string
  init_point: string
  sandbox_init_point: string
  date_created: string
  items: Array<any>
  payer: any
  back_urls: any
  auto_return: string
  notification_url: string
  external_reference: string
}

export interface WebhookNotification {
  id: number
  live_mode: boolean
  type: 'payment' | 'plan' | 'subscription' | 'invoice' | 'merchant_order'
  date_created: string
  application_id: number
  user_id: number
  version: number
  api_version: string
  action: 'payment.created' | 'payment.updated' | 'merchant_order.created' | string
  data: {
    id: string
  }
} 