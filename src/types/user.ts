export interface User {
  id: string
  email: string
  full_name?: string
  phone?: string
  address?: any
  role: 'user' // Solo usuario regular (admins están en tabla separada)
  preferences?: any
  password_hash?: string
  last_login?: string
  is_active?: boolean
  created_at: string
  updated_at: string
}

export interface UserAddress {
  street?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  is_default?: boolean
}

export interface UserPreferences {
  newsletter_subscription?: boolean
  notifications?: {
    email?: boolean
    sms?: boolean
    push?: boolean
  }
  language?: string
  currency?: string
  theme?: 'light' | 'dark' | 'auto'
}

export interface CreateUserRequest {
  id: string // UUID from auth.users
  email: string
  full_name?: string
  phone?: string
  address?: UserAddress
  role?: User['role']
  preferences?: UserPreferences
}

export interface UpdateUserRequest {
  email?: string
  full_name?: string
  phone?: string
  address?: UserAddress
  preferences?: UserPreferences
}

export interface UpdateUserRoleRequest {
  role: User['role']
}

export type UserRole = User['role']

export const USER_ROLES: { [key in UserRole]: string } = {
  user: 'Usuario'
}

export const USER_ROLE_COLORS: { [key in UserRole]: string } = {
  user: 'bg-gray-100 text-gray-800'
}

export const USER_ROLE_PERMISSIONS: { [key in UserRole]: string[] } = {
  user: ['read_products', 'create_orders', 'read_own_orders']
} 