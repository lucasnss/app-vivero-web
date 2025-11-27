// Extender la interfaz Order para incluir las propiedades faltantes
// NOTA: shipping_method y fulfillment_status ya están definidos en src/types/order.ts
// Solo agregamos admin_notes aquí
declare module '@/src/types/order' {
  interface Order {
    admin_notes?: string;
  }
}
