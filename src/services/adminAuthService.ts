import { AdminUser, LoginRequest, LoginResponse } from '@/types/admin'
import { supabase } from '@/lib/supabaseClient'
import { logService } from './logService'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Constantes para JWT
const JWT_SECRET = process.env.JWT_SECRET || 'vivero-web-secret-key-development'
const JWT_EXPIRES_IN = '24h' // Token válido por 24 horas

export const adminAuthService = {
  /**
   * Iniciar sesión de administrador
   */
  async loginAdmin(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('🔐 Intentando login para:', credentials.email)

      // Buscar admin por email en la tabla admins (admin o super_admin)
      const { data: admin, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', credentials.email.toLowerCase().trim())
        .eq('role', 'admin')
        .single()

      if (error || !admin) {
        console.log('❌ Admin no encontrado:', error?.message)
        throw new Error('Credenciales inválidas')
      }

      // Verificar que el admin esté activo
      if (!admin.is_active) {
        console.log('❌ Admin inactivo:', admin.email)
        throw new Error('Cuenta desactivada. Contacte al administrador.')
      }

      // Verificar password
      const isValidPassword = await this.verifyPassword(credentials.password, admin.password_hash || 'temp', credentials.email)
      
      if (!isValidPassword) {
        console.log('❌ Password inválido para:', admin.email)
        throw new Error('Credenciales inválidas')
      }

      // Generar token JWT
      const token = jwt.sign(
        { 
          sub: admin.id,
          email: admin.email,
          role: admin.role,
          iat: Math.floor(Date.now() / 1000)
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      )

      // Actualizar last_login
      await supabase
        .from('admins')
        .update({ last_login: new Date().toISOString() })
        .eq('id', admin.id)

      // Log de actividad
      await logService.recordActivity({
        action: 'admin_login',
        entity_type: 'admin',
        entity_id: admin.id,
        details: { email: admin.email }
      })

      const adminUser: AdminUser = {
        id: admin.id,
        email: admin.email,
        name: admin.full_name || admin.email,
        role: admin.role as 'admin',
        last_login: admin.last_login,
        is_active: admin.is_active !== false,
        created_at: admin.created_at,
        updated_at: admin.updated_at
      }

      console.log('✅ Login exitoso para:', admin.email)

      return {
        success: true,
        admin: adminUser,
        token
      }

    } catch (error) {
      console.error('❌ Error en login:', error)
      
      // Log de actividad (intento fallido)
      await logService.recordActivity({
        action: 'admin_login_failed',
        entity_type: 'admin',
        entity_id: 'unknown',
        details: { 
          email: credentials.email,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      })

      if (error instanceof Error) {
        throw error
      }
      
      throw new Error('Error interno del servidor')
    }
  },

  /**
   * Cerrar sesión de administrador
   */
  async logoutAdmin(): Promise<{ success: boolean }> {
    try {
      // Log de actividad
      await logService.recordActivity({
        action: 'admin_logout',
        entity_type: 'admin',
        entity_id: 'current', // TODO: obtener admin actual
        details: {}
      })

      console.log('✅ Logout exitoso')
      return { success: true }

    } catch (error) {
      console.error('❌ Error en logout:', error)
      return { success: false }
    }
  },

  /**
   * Obtener administrador actual por token
   */
  async getCurrentAdmin(token: string): Promise<AdminUser | null> {
    try {
      // Verificar token JWT
      const decoded = jwt.verify(token, JWT_SECRET) as any
      
      if (!decoded.sub) {
        throw new Error('Token inválido')
      }

      // Buscar admin en base de datos
      const { data: admin, error } = await supabase
        .from('admins')
        .select('*')
        .eq('id', decoded.sub)
        .eq('role', 'admin')
        .single()

      if (error || !admin) {
        console.log('❌ Admin no encontrado por token')
        return null
      }

      // Verificar que esté activo
      if (!admin.is_active) {
        console.log('❌ Admin inactivo')
        return null
      }

      return {
        id: admin.id,
        email: admin.email,
        name: admin.full_name || admin.email,
        role: admin.role as 'admin',
        last_login: admin.last_login,
        is_active: admin.is_active !== false,
        created_at: admin.created_at,
        updated_at: admin.updated_at
      }

    } catch (error) {
      console.error('❌ Error obteniendo admin actual:', error)
      return null
    }
  },

  /**
   * Verificar token de administrador
   */
  async verifyAdminToken(token: string): Promise<{ valid: boolean; admin?: AdminUser }> {
    try {
      const admin = await this.getCurrentAdmin(token)
      
      if (!admin) {
        return { valid: false }
      }

      return { valid: true, admin }

    } catch (error) {
      console.error('❌ Error verificando token:', error)
      return { valid: false }
    }
  },

  /**
   * Generar hash de password
   */
  async hashPassword(password: string): Promise<string> {
    try {
      const saltRounds = 10
      return await bcrypt.hash(password, saltRounds)
    } catch (error) {
      console.error('❌ Error generando hash:', error)
      throw new Error('Error procesando contraseña')
    }
  },

  /**
   * Verificar password
   */
  async verifyPassword(plainPassword: string, hashedPassword: string, email?: string): Promise<boolean> {
    try {
      // Por ahora, implementación temporal para desarrollo
      if (hashedPassword === 'temp') {
        // Passwords temporales para desarrollo
        const devPasswords: { [key: string]: string } = {
          'admin@vivero.com': 'admin123',
          'superadmin@vivero.com': 'super123'
        }
        
        // Verificar si el email coincide con algún password temporal
        if (!email) return false
        return devPasswords[email] === plainPassword
      }

      // Verificación real con bcrypt
      return await bcrypt.compare(plainPassword, hashedPassword)
      
    } catch (error) {
      console.error('❌ Error verificando password:', error)
      return false
    }
  }
} 