export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'admin' // Solo un rol de administrador
  last_login?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  admin: AdminUser
  token: string
  message?: string
}

export interface UpdateAdminRequest {
  email?: string
  name?: string
  role?: AdminUser['role']
  is_active?: boolean
}

export interface CreateAdminRequest {
  email: string
  password: string
  name: string
  role?: 'admin' // Siempre admin por defecto
}

export type AdminRole = AdminUser['role']

export const ADMIN_ROLES: { [key in AdminRole]: string } = {
  admin: 'Administrador'
}

export const ADMIN_ROLE_COLORS: { [key in AdminRole]: string } = {
  admin: 'bg-blue-100 text-blue-800'
}

export const ADMIN_PERMISSIONS: { [key in AdminRole]: string[] } = {
  admin: [
    'read_products', 'create_products', 'update_products', 'delete_products',
    'read_categories', 'create_categories', 'update_categories', 'delete_categories',
    'read_orders', 'create_orders', 'update_orders', 'delete_orders',
    'read_admin_users', 'create_admin_users', 'update_admin_users', 'delete_admin_users',
    'read_activity_logs', 'update_activity_logs', 'delete_activity_logs',
    'manage_system_settings'
  ]
} 