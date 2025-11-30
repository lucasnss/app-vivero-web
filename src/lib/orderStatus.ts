// 🎯 Sistema de Estados Unificados de Órdenes
// Proyecto: ViveroWeb
// Fecha: 2024-12-19
// Objetivo: Centralizar lógica de estados y colores UI

// =============================================================================
// 📊 TIPOS DE ESTADOS
// =============================================================================

/**
 * Estados de pago de Mercado Pago
 */
export type PaymentStatus = 
  | 'pending'      // Pendiente de pago
  | 'approved'     // Pago aprobado
  | 'rejected'     // Pago rechazado
  | 'cancelled'    // Pago cancelado
  | 'in_process'   // Pago en proceso
  | 'authorized'   // Pago autorizado
  | 'refunded';    // Pago reembolsado

/**
 * Estados logísticos de la orden
 */
export type FulfillmentStatus = 
  | 'none'                 // Sin estado logístico definido
  | 'awaiting_shipment'    // Esperando envío
  | 'awaiting_pickup'      // Listo para retirar
  | 'shipped'              // Enviado (opcional, para tracking)
  | 'delivered'            // Entregado
  | 'pickup_completed'     // Retirado por cliente
  | 'cancelled_by_admin';  // Cancelado operativamente por admin

/**
 * Estados UI unificados para mostrar al usuario
 */
export type UiState = 
  | 'Completado'
  | 'Envío pendiente'
  | 'Listo para retirar'
  | 'Pendiente'
  | 'Rechazado'
  | 'Cancelado';

/**
 * Método de envío
 */
export type ShippingMethod = 'delivery' | 'pickup';

// =============================================================================
// 🔄 FUNCIONES DE MAPEO
// =============================================================================

/**
 * Convierte estados de pago y logística en estado UI unificado
 */
export function toUiState(
  paymentStatus: PaymentStatus, 
  fulfillmentStatus: FulfillmentStatus
): UiState {
  // Si el pago fue aprobado, mostrar estado logístico
  if (paymentStatus === 'approved') {
    if (fulfillmentStatus === 'delivered' || fulfillmentStatus === 'pickup_completed') {
      return 'Completado';
    }
    if (fulfillmentStatus === 'awaiting_shipment') {
      return 'Envío pendiente';
    }
    if (fulfillmentStatus === 'awaiting_pickup') {
      return 'Listo para retirar';
    }
    if (fulfillmentStatus === 'shipped') {
      return 'Envío pendiente'; // Enviado pero no entregado
    }
    // Fallback: si no definieron fulfillment aún, tratar como envío pendiente
    return 'Envío pendiente';
  }

  // Estados de pago no aprobados
  if (paymentStatus === 'pending' || paymentStatus === 'in_process' || paymentStatus === 'authorized') {
    return 'Pendiente';
  }
  if (paymentStatus === 'rejected') {
    return 'Rechazado';
  }
  if (paymentStatus === 'cancelled' || paymentStatus === 'refunded') {
    return 'Cancelado';
  }

  // Fallback
  return 'Pendiente';
}

/**
 * Obtiene las clases CSS de Tailwind para el estado UI
 */
export function uiColorClasses(state: UiState): string {
  switch (state) {
      case 'Completado':
        return 'bg-emerald-500 text-white font-bold border-emerald-700';
      case 'Envío pendiente':
        return 'bg-yellow-500 text-black font-bold border-yellow-600';
      case 'Listo para retirar':
        return 'bg-lime-500 text-black font-bold border-lime-600';
      case 'Pendiente':
        return 'bg-orange-400 text-black font-bold border-orange-600';
      case 'Rechazado':
        return 'bg-red-600 text-white font-bold border-red-800';
      case 'Cancelado':
        return 'bg-gray-500 text-white font-bold border-gray-600';
      default:
        return 'bg-slate-400 text-black font-bold border-slate-600';
  }    
}

/**
 * Obtiene el ícono de Lucide para el estado UI
 */
export function uiIcon(state: UiState): string {
  switch (state) {
    case 'Completado':
      return 'CheckCircle';
    case 'Envío pendiente':
      return 'Truck';
    case 'Listo para retirar':
      return 'Package';
    case 'Pendiente':
      return 'Clock';
    case 'Rechazado':
      return 'XCircle';
    case 'Cancelado':
      return 'Ban';
    default:
      return 'HelpCircle';
  }
}

// =============================================================================
// 🔧 FUNCIONES DE VALIDACIÓN
// =============================================================================

/**
 * Verifica si un estado de pago es final (no puede cambiar)
 */
export function isPaymentFinal(status: PaymentStatus): boolean {
  return ['approved', 'rejected', 'cancelled', 'refunded'].includes(status);
}

/**
 * Verifica si un estado logístico es final
 */
export function isFulfillmentFinal(status: FulfillmentStatus): boolean {
  return ['delivered', 'pickup_completed', 'cancelled_by_admin'].includes(status);
}

/**
 * Verifica si se puede cambiar el estado logístico
 */
export function canChangeFulfillment(
  paymentStatus: PaymentStatus, 
  currentFulfillment: FulfillmentStatus
): boolean {
  // Solo se puede cambiar si el pago fue aprobado
  if (paymentStatus !== 'approved') {
    return false;
  }
  
  // No se puede cambiar si ya está en estado final
  if (isFulfillmentFinal(currentFulfillment)) {
    return false;
  }
  
  return true;
}

// =============================================================================
// 📊 FUNCIONES DE ESTADÍSTICAS
// =============================================================================

/**
 * Agrupa órdenes por estado UI para estadísticas
 */
export function groupOrdersByUiState<T extends { payment_status: PaymentStatus; fulfillment_status: FulfillmentStatus }>(
  orders: T[]
): Record<UiState, T[]> {
  const grouped: Record<UiState, T[]> = {
    'Completado': [],
    'Envío pendiente': [],
    'Listo para retirar': [],
    'Pendiente': [],
    'Rechazado': [],
    'Cancelado': []
  };

  orders.forEach(order => {
    const uiState = toUiState(order.payment_status, order.fulfillment_status);
    grouped[uiState].push(order);
  });

  return grouped;
}

/**
 * Calcula estadísticas de órdenes por estado
 */
export function calculateOrderStats<T extends { payment_status: PaymentStatus; fulfillment_status: FulfillmentStatus; total_amount: number }>(
  orders: T[]
) {
  const grouped = groupOrdersByUiState(orders);
  
  return Object.entries(grouped).map(([state, stateOrders]) => ({
    state,
    count: stateOrders.length,
    totalAmount: stateOrders.reduce((sum, order) => sum + order.total_amount, 0),
    percentage: orders.length > 0 ? (stateOrders.length / orders.length) * 100 : 0
  }));
}

// =============================================================================
// 🎨 TIPOS PARA COMPONENTES DE UI
// =============================================================================

/**
 * Props para componentes de badge de estado
 */
export interface StatusBadgeProps {
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  className?: string;
  showIcon?: boolean;
}

// NOTA: El componente StatusBadge fue movido a un componente React separado
// para evitar problemas de JSX en archivos .ts

// =============================================================================
// 📝 CONSTANTES Y CONFIGURACIÓN
// =============================================================================

/**
 * Estados de pago válidos
 */
export const VALID_PAYMENT_STATUSES: PaymentStatus[] = [
  'pending', 'approved', 'rejected', 'cancelled', 'in_process', 'authorized', 'refunded'
];

/**
 * Estados logísticos válidos
 */
export const VALID_FULFILLMENT_STATUSES: FulfillmentStatus[] = [
  'none', 'awaiting_shipment', 'awaiting_pickup', 'shipped', 'delivered', 'pickup_completed', 'cancelled_by_admin'
];

/**
 * Métodos de envío válidos
 */
export const VALID_SHIPPING_METHODS: ShippingMethod[] = ['delivery', 'pickup'];

/**
 * Estados UI válidos
 */
export const VALID_UI_STATES: UiState[] = [
  'Completado', 'Envío pendiente', 'Listo para retirar', 'Pendiente', 'Rechazado', 'Cancelado'
];

// =============================================================================
// ✅ EXPORTACIONES
// =============================================================================

export default {
  // Funciones principales
  toUiState,
  uiColorClasses,
  uiIcon,
  
  // Validaciones
  isPaymentFinal,
  isFulfillmentFinal,
  canChangeFulfillment,
  
  // Estadísticas
  groupOrdersByUiState,
  calculateOrderStats,
  
  // Constantes
  VALID_PAYMENT_STATUSES,
  VALID_FULFILLMENT_STATUSES,
  VALID_SHIPPING_METHODS,
  VALID_UI_STATES
};
