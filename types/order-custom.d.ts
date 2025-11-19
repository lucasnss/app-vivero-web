import { PaymentStatus, FulfillmentStatus, ShippingMethod } from '../src/lib/orderStatus';

// Extender la interfaz Order para incluir las propiedades faltantes
declare module '@/types/order' {
  interface Order {
    shipping_method: ShippingMethod;
    fulfillment_status: FulfillmentStatus;
    admin_notes?: string;
  }
}
