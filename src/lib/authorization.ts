import { AdminUser } from '@/types/admin'

// Definición de permisos disponibles en el sistema
export const PERMISSIONS = {
  // Productos
  read_products: 'read_products',
  create_products: 'create_products', 
  update_products: 'update_products',
  delete_products: 'delete_products',
  
  // Categorías
  read_categories: 'read_categories',
  create_categories: 'create_categories',
  update_categories: 'update_categories', 
  delete_categories: 'delete_categories',
  
  // Pedidos
  read_orders: 'read_orders',
  create_orders: 'create_orders',
  update_orders: 'update_orders',
  delete_orders: 'delete_orders',
  
  // Administradores
  read_admin_users: 'read_admin_users',
  create_admin_users: 'create_admin_users',
  update_admin_users: 'update_admin_users', 
  delete_admin_users: 'delete_admin_users',
  
  // Logs de actividad
  read_activity_logs: 'read_activity_logs',
  update_activity_logs: 'update_activity_logs',
  delete_activity_logs: 'delete_activity_logs',
  
  // Sistema
  manage_system_settings: 'manage_system_settings'
} as const

export type Permission = keyof typeof PERMISSIONS

// Permisos por rol (solo admin)
export const ROLE_PERMISSIONS: Record<'admin', Permission[]> = {
  admin: [
    'read_products', 'create_products', 'update_products', 'delete_products',
    'read_categories', 'create_categories', 'update_categories', 'delete_categories', 
    'read_orders', 'create_orders', 'update_orders', 'delete_orders',
    'read_admin_users', 'create_admin_users', 'update_admin_users', 'delete_admin_users',
    'read_activity_logs', 'update_activity_logs', 'delete_activity_logs',
    'manage_system_settings'
  ]
}

/**
 * Verificar si un usuario tiene un permiso específico
 */
export function hasPermission(user: AdminUser | null, permission: Permission): boolean {
  if (!user || !user.is_active) {
    return false
  }
  
  const userPermissions = ROLE_PERMISSIONS[user.role] || []
  return userPermissions.includes(permission)
}

/**
 * Verificar si un usuario tiene todos los permisos especificados
 */
export function hasAllPermissions(user: AdminUser | null, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(user, permission))
}

/**
 * Verificar si un usuario tiene al menos uno de los permisos especificados
 */
export function hasAnyPermission(user: AdminUser | null, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(user, permission))
}

/**
 * Verificar si un usuario es administrador
 */
export function isAdmin(user: AdminUser | null): boolean {
  return user?.role === 'admin' && user.is_active === true
}

/**
 * Obtener todos los permisos de un usuario
 */
export function getUserPermissions(user: AdminUser | null): Permission[] {
  if (!user || !user.is_active) {
    return []
  }
  
  return ROLE_PERMISSIONS[user.role] || []
} 