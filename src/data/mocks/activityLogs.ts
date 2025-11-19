import { ActivityLog } from '@/types/activityLog'

// Mock data para logs de actividad
export const mockActivityLogs: ActivityLog[] = [
  {
    id: "1",
    timestamp: new Date('2024-01-15T10:30:00Z'),
    user_id: "admin-1",
    action: "product_created",
    entity_type: "product",
    entity_id: "1",
    details: {
      product: {
        name: "Monstera Deliciosa",
        price: 2500,
        stock: 15
      }
    }
  },
  {
    id: "2",
    timestamp: new Date('2024-01-15T11:15:00Z'),
    user_id: "admin-1",
    action: "product_updated",
    entity_type: "product",
    entity_id: "1",
    details: {
      changes: { price: 2500 },
      product: {
        name: "Monstera Deliciosa",
        price: 2500,
        stock: 15
      }
    }
  },
  {
    id: "3",
    timestamp: new Date('2024-01-15T14:20:00Z'),
    user_id: "customer-1",
    action: "order_created",
    entity_type: "order",
    entity_id: "order-1",
    details: {
      order: {
        total_amount: 2500,
        items: [
          { product_id: "1", quantity: 1, unit_price: 2500 }
        ]
      }
    }
  }
] 