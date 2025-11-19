import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para las tablas de Supabase
export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string
          category_id: string
          price: number
          stock: number
          image: string
          images: string[]
          scientific_name: string
          care: string
          characteristics: string
          origin: string
          featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category_id: string
          price: number
          stock: number
          image: string
          images?: string[]
          scientific_name: string
          care: string
          characteristics: string
          origin: string
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category_id?: string
          price?: number
          stock?: number
          image?: string
          images?: string[]
          scientific_name?: string
          care?: string
          characteristics?: string
          origin?: string
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          color: string
          slug: string
          parent_id?: string
          image?: string
          featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon: string
          color: string
          slug: string
          parent_id?: string
          image?: string
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          color?: string
          slug?: string
          parent_id?: string
          image?: string
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          timestamp: string
          user_id?: string
          action: string
          entity_type: string
          entity_id: string
          details: Record<string, any>
        }
        Insert: {
          id?: string
          timestamp?: string
          user_id?: string
          action: string
          entity_type: string
          entity_id: string
          details: Record<string, any>
        }
        Update: {
          id?: string
          timestamp?: string
          user_id?: string
          action?: string
          entity_type?: string
          entity_id?: string
          details?: Record<string, any>
        }
      }
      orders: {
        Row: {
          id: string
          customer_info: Record<string, any>
          status: string
          total_amount: number
          shipping_address: Record<string, any>
          payment_method?: string
          notes?: string
          admin_notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_info: Record<string, any>
          status?: string
          total_amount: number
          shipping_address: Record<string, any>
          payment_method?: string
          notes?: string
          admin_notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_info?: Record<string, any>
          status?: string
          total_amount?: number
          shipping_address?: Record<string, any>
          payment_method?: string
          notes?: string
          admin_notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          subtotal: number
          product_snapshot?: Record<string, any>
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          subtotal: number
          product_snapshot?: Record<string, any>
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          subtotal?: number
          product_snapshot?: Record<string, any>
          created_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          email: string
          password_hash: string
          name: string
          role: string
          last_login?: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          name: string
          role?: string
          last_login?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          name?: string
          role?: string
          last_login?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 