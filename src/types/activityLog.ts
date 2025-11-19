export interface ActivityLog {
  id: string
  timestamp: Date
  user_id?: string
  action: string
  entity_type: string
  entity_id: string
  details: Record<string, any>
}

export interface CreateActivityLogRequest extends Omit<ActivityLog, 'id' | 'timestamp'> {
  // Para crear logs sin ID y timestamp (se generan automáticamente)
}

export type ActivityAction = 
  | 'product_created'
  | 'product_updated'
  | 'product_deleted'
  | 'category_created'
  | 'category_updated'
  | 'category_deleted'
  | 'order_created'
  | 'order_updated'
  | 'user_login'
  | 'user_logout'

export type EntityType = 
  | 'product'
  | 'category'
  | 'order'
  | 'user'
  | 'cart' 