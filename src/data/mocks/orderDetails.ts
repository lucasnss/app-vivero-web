import { OrderDetail } from "@/components/OrderDetailModal";

/**
 * Datos mock para detalles de órdenes
 * Estos datos simulan la respuesta de la API y serán reemplazados por datos reales
 * cuando la integración con Mercado Pago esté completa
 */
export const mockOrderDetails: Record<string, OrderDetail> = {
  // Orden con entrega a domicilio
  "order-001": {
    id: "order-001",
    customer_name: "Juan Pérez",
    customer_email: "juan.perez@example.com",
    customer_phone: "+54 9 1234-5678",
    shipping_address: {
      street: "Av. Siempre Viva",
      number: "1234",
      city: "San Miguel de Tucumán",
      province: "Tucumán",
      postalCode: "4000",
      notes: "Tocar timbre, casa con rejas verdes"
    },
    payment_status: "approved",
    fulfillment_status: "awaiting_shipment",
    shipping_method: "delivery",
    total_amount: 12500,
    created_at: "2024-01-15T14:30:00Z",
    payment_id: "1234567890",
    payment_method: "Mercado Pago",
    items: [
      {
        id: "prod-001",
        name: "Planta Monstera Deliciosa",
        quantity: 1,
        price: 8500,
        image: "/public/placeholder.jpg"
      },
      {
        id: "prod-002",
        name: "Maceta Cerámica Mediana",
        quantity: 2,
        price: 2000,
        image: "/public/placeholder.jpg"
      }
    ]
  },
  
  // Orden con retiro en tienda
  "order-002": {
    id: "order-002",
    customer_name: "María González",
    customer_email: "maria.gonzalez@example.com",
    customer_phone: "+54 9 9876-5432",
    payment_status: "approved",
    fulfillment_status: "awaiting_pickup",
    shipping_method: "pickup",
    total_amount: 5600,
    created_at: "2024-01-16T10:15:00Z",
    payment_id: "0987654321",
    payment_method: "Mercado Pago",
    items: [
      {
        id: "prod-003",
        name: "Kit de Jardinería Básico",
        quantity: 1,
        price: 3500,
        image: "/public/placeholder.jpg"
      },
      {
        id: "prod-004",
        name: "Tierra Fértil Premium 5kg",
        quantity: 1,
        price: 2100,
        image: "/public/placeholder.jpg"
      }
    ]
  },
  
  // Orden pendiente de pago
  "order-003": {
    id: "order-003",
    customer_name: "Carlos Rodríguez",
    customer_email: "carlos.rodriguez@example.com",
    customer_phone: "+54 9 3512-4567",
    shipping_address: {
      street: "Calle Los Álamos",
      number: "456",
      city: "San Miguel de Tucumán",
      province: "Tucumán",
      postalCode: "4000"
    },
    payment_status: "pending",
    fulfillment_status: "none",
    shipping_method: "delivery",
    total_amount: 18750,
    created_at: "2024-01-17T16:45:00Z",
    items: [
      {
        id: "prod-005",
        name: "Palmera Areca Grande",
        quantity: 1,
        price: 15000,
        image: "/public/placeholder.jpg"
      },
      {
        id: "prod-006",
        name: "Sustrato Especial Palmeras 5kg",
        quantity: 1,
        price: 3750,
        image: "/public/placeholder.jpg"
      }
    ]
  },
  
  // Orden rechazada
  "order-004": {
    id: "order-004",
    customer_name: "Laura Fernández",
    customer_email: "laura.fernandez@example.com",
    customer_phone: "+54 9 3815-7890",
    shipping_address: {
      street: "Av. Independencia",
      number: "789",
      city: "San Miguel de Tucumán",
      province: "Tucumán",
      postalCode: "4000"
    },
    payment_status: "rejected",
    fulfillment_status: "none",
    shipping_method: "delivery",
    total_amount: 7200,
    created_at: "2024-01-18T09:30:00Z",
    payment_id: "7890123456",
    payment_method: "Mercado Pago",
    items: [
      {
        id: "prod-007",
        name: "Suculentas Variadas (Pack x3)",
        quantity: 2,
        price: 3600,
        image: "/public/placeholder.jpg"
      }
    ]
  },
  
  // Orden cancelada
  "order-005": {
    id: "order-005",
    customer_name: "Roberto Gómez",
    customer_email: "roberto.gomez@example.com",
    customer_phone: "+54 9 3814-2345",
    payment_status: "cancelled",
    fulfillment_status: "cancelled_by_admin",
    shipping_method: "pickup",
    total_amount: 4500,
    created_at: "2024-01-19T14:00:00Z",
    items: [
      {
        id: "prod-008",
        name: "Fertilizante Orgánico 1L",
        quantity: 3,
        price: 1500,
        image: "/public/placeholder.jpg"
      }
    ]
  },
  
  // Orden completada (entregada)
  "order-006": {
    id: "order-006",
    customer_name: "Ana Martínez",
    customer_email: "ana.martinez@example.com",
    customer_phone: "+54 9 3513-6789",
    shipping_address: {
      street: "Calle Las Heras",
      number: "234",
      city: "San Miguel de Tucumán",
      province: "Tucumán",
      postalCode: "4000",
      notes: "Departamento 3B"
    },
    payment_status: "approved",
    fulfillment_status: "delivered",
    shipping_method: "delivery",
    total_amount: 22000,
    created_at: "2024-01-12T11:20:00Z",
    payment_id: "5678901234",
    payment_method: "Mercado Pago",
    items: [
      {
        id: "prod-009",
        name: "Ficus Lyrata Grande",
        quantity: 1,
        price: 18000,
        image: "/public/placeholder.jpg"
      },
      {
        id: "prod-010",
        name: "Maceta Decorativa Grande",
        quantity: 1,
        price: 4000,
        image: "/public/placeholder.jpg"
      }
    ]
  },
  
  // Orden completada (retirada)
  "order-007": {
    id: "order-007",
    customer_name: "Diego López",
    customer_email: "diego.lopez@example.com",
    customer_phone: "+54 9 3816-9012",
    payment_status: "approved",
    fulfillment_status: "pickup_completed",
    shipping_method: "pickup",
    total_amount: 9800,
    created_at: "2024-01-13T15:10:00Z",
    payment_id: "3456789012",
    payment_method: "Mercado Pago",
    items: [
      {
        id: "prod-011",
        name: "Herramientas de Jardinería Premium",
        quantity: 1,
        price: 7500,
        image: "/public/placeholder.jpg"
      },
      {
        id: "prod-012",
        name: "Guantes de Jardinería",
        quantity: 1,
        price: 2300,
        image: "/public/placeholder.jpg"
      }
    ]
  }
};

/**
 * Función para obtener detalles de una orden por ID
 * @param orderId ID de la orden
 * @returns Detalles de la orden o null si no existe
 */
export function getMockOrderDetail(orderId: string): OrderDetail | null {
  // Si el ID exacto existe, devolver esa orden
  if (mockOrderDetails[orderId]) {
    return mockOrderDetails[orderId];
  }
  
  // Si no existe, devolver la primera orden como fallback para demostración
  // En producción, esto sería reemplazado por una llamada a la API
  const fallbackId = Object.keys(mockOrderDetails)[0];
  return mockOrderDetails[fallbackId] || null;
}

export default mockOrderDetails;
