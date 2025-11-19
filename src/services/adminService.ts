import { AdminUser, CreateAdminRequest, UpdateAdminRequest } from '@/types/admin'
import { supabase } from '@/lib/supabaseClient'
import { logService } from './logService'
import { adminAuthService } from './adminAuthService'
import { validateCreateAdminData, validateUpdateAdminData } from '../lib/validations'
import { ZodError } from 'zod'

export const adminService = {
  /**
   * Obtener perfil de administrador por ID
   */
  async getAdminProfile(adminId: string): Promise<AdminUser> {
    try {
      console.log('👤 Obteniendo perfil del admin:', adminId)

      // Obtener admin de la base de datos
      const { data: admin, error } = await supabase
        .from('admins')
        .select('*')
        .eq('id', adminId)
        .eq('role', 'admin')
        .single()

      if (error || !admin) {
        console.error('❌ Error obteniendo admin:', error)
        throw new Error('Administrador no encontrado')
      }

      // Mapear a AdminUser
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

      console.log('✅ Perfil obtenido exitosamente')
      return adminUser

    } catch (error) {
      console.error('❌ Error en getAdminProfile:', error)
      
      if (error instanceof Error) {
        throw error
      }
      
      throw new Error('Error obteniendo perfil de administrador')
    }
  },

  /**
   * Actualizar perfil de administrador
   */
  async updateAdminProfile(adminId: string, updateData: UpdateAdminRequest): Promise<AdminUser> {
    try {
      console.log('✏️ Actualizando perfil del admin:', adminId)

      // Validar datos de entrada
      const validatedData = validateUpdateAdminData(updateData)

      // Preparar datos para actualización
      const updateFields: any = {
        updated_at: new Date().toISOString()
      }

      if (validatedData.email) updateFields.email = validatedData.email
      if (validatedData.name) updateFields.full_name = validatedData.name
      if (typeof validatedData.is_active === 'boolean') updateFields.is_active = validatedData.is_active

      // Actualizar en base de datos
      const { data: updatedAdmin, error } = await supabase
        .from('admins')
        .update(updateFields)
        .eq('id', adminId)
        .eq('role', 'admin')
        .select()
        .single()

      if (error || !updatedAdmin) {
        console.error('❌ Error actualizando admin:', error)
        throw new Error('Error al actualizar administrador')
      }

      // Mapear respuesta
      const adminUser: AdminUser = {
        id: updatedAdmin.id,
        email: updatedAdmin.email,
        name: updatedAdmin.full_name || updatedAdmin.email,
        role: updatedAdmin.role as 'admin',
        last_login: updatedAdmin.last_login,
        is_active: updatedAdmin.is_active !== false,
        created_at: updatedAdmin.created_at,
        updated_at: updatedAdmin.updated_at
      }

      // Log de actividad
      await logService.recordActivity({
        action: 'admin_profile_updated',
        entity_type: 'admin',
        entity_id: adminId,
        details: { 
          changes: validatedData,
          updated_by: adminId // TODO: obtener admin actual
        }
      })

      console.log('✅ Perfil actualizado exitosamente')
      return adminUser

    } catch (error) {
      console.error('❌ Error en updateAdminProfile:', error)
      
      if (error instanceof ZodError) {
        const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        throw new Error(`Error de validación: ${messages}`)
      }
      
      if (error instanceof Error) {
        throw error
      }
      
      throw new Error('Error actualizando perfil de administrador')
    }
  },

  /**
   * Obtener todos los administradores (solo admin)
   */
  async getAllAdmins(): Promise<AdminUser[]> {
    try {
      const { data: admins, error } = await supabase
        .from('admins')
        .select('*')
        .eq('role', 'admin')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error obteniendo admins:', error)
        throw new Error('Error al obtener administradores')
      }

      // Mapear a AdminUser[]
      const adminUsers: AdminUser[] = (admins || []).map(admin => ({
        id: admin.id,
        email: admin.email,
        name: admin.full_name || admin.email,
        role: admin.role as 'admin',
        last_login: admin.last_login,
        is_active: admin.is_active !== false,
        created_at: admin.created_at,
        updated_at: admin.updated_at
      }))

      console.log(`✅ Obtenidos ${adminUsers.length} administradores`)
      return adminUsers

    } catch (error) {
      console.error('❌ Error en getAllAdmins:', error)
      
      if (error instanceof Error) {
        throw error
      }
      
      throw new Error('Error obteniendo lista de administradores')
    }
  },

  /**
   * Crear nuevo administrador (solo admin)
   */
  async createAdmin(adminData: CreateAdminRequest): Promise<AdminUser> {
    try {
      // Validar datos de entrada
      const validatedData = validateCreateAdminData(adminData)

      // Verificar que el email no exista
      const { data: existingUser } = await supabase
        .from('admins')
        .select('id')
        .eq('email', validatedData.email.toLowerCase().trim())
        .single()

      if (existingUser) {
        throw new Error('Ya existe un usuario con este email')
      }

      // Hash de password
      const passwordHash = await adminAuthService.hashPassword(validatedData.password)

      // Preparar datos para inserción
      const insertData = {
        email: validatedData.email.toLowerCase().trim(),
        full_name: validatedData.name,
        role: 'admin', // Siempre admin
        password_hash: passwordHash,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Crear en base de datos
      const { data: newAdmin, error } = await supabase
        .from('admins')
        .insert(insertData)
        .select()
        .single()

      if (error || !newAdmin) {
        console.error('❌ Error creando admin:', error)
        throw new Error('Error al crear administrador: ' + (error?.message || 'Unknown error'))
      }

      // Mapear respuesta
      const adminUser: AdminUser = {
        id: newAdmin.id,
        email: newAdmin.email,
        name: newAdmin.full_name || newAdmin.email,
        role: newAdmin.role as 'admin',
        last_login: newAdmin.last_login,
        is_active: newAdmin.is_active !== false,
        created_at: newAdmin.created_at,
        updated_at: newAdmin.updated_at
      }

      // Log de actividad
      await logService.recordActivity({
        action: 'admin_created',
        entity_type: 'admin',
        entity_id: newAdmin.id,
        details: { 
          email: newAdmin.email,
          role: newAdmin.role,
          created_by: 'system' // TODO: obtener admin actual
        }
      })

      console.log('✅ Admin creado exitosamente:', newAdmin.email)
      return adminUser

    } catch (error) {
      console.error('❌ Error en createAdmin:', error)
      
      if (error instanceof ZodError) {
        const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        throw new Error(`Error de validación: ${messages}`)
      }
      
      if (error instanceof Error) {
        throw error
      }
      
      throw new Error('Error creando administrador')
    }
  },

  /**
   * Desactivar administrador (solo admin puede desactivar otros)
   */
  async deactivateAdmin(adminId: string): Promise<AdminUser> {
    try {
      console.log('🚫 Desactivando admin:', adminId)

      // Actualizar estado en base de datos
      const { data: updatedAdmin, error } = await supabase
        .from('admins')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', adminId)
        .eq('role', 'admin')
        .select()
        .single()

      if (error || !updatedAdmin) {
        console.error('❌ Error desactivando admin:', error)
        throw new Error('Error al desactivar administrador')
      }

      // Log de actividad
      await logService.recordActivity({
        action: 'admin_deactivated',
        entity_type: 'admin',
        entity_id: adminId,
        details: { 
          deactivated_by: 'system' // TODO: obtener admin actual
        }
      })

      // Mapear respuesta
      const adminUser: AdminUser = {
        id: updatedAdmin.id,
        email: updatedAdmin.email,
        name: updatedAdmin.full_name || updatedAdmin.email,
        role: updatedAdmin.role as 'admin',
        last_login: updatedAdmin.last_login,
        is_active: false,
        created_at: updatedAdmin.created_at,
        updated_at: updatedAdmin.updated_at
      }

      console.log('✅ Admin desactivado exitosamente')
      return adminUser

    } catch (error) {
      console.error('❌ Error en deactivateAdmin:', error)
      
      if (error instanceof Error) {
        throw error
      }
      
      throw new Error('Error desactivando administrador')
    }
  },

  /**
   * Reactivar administrador
   */
  async reactivateAdmin(adminId: string): Promise<AdminUser> {
    try {
      console.log('✅ Reactivando admin:', adminId)

      // Actualizar estado en base de datos
      const { data: updatedAdmin, error } = await supabase
        .from('admins')
        .update({ 
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', adminId)
        .eq('role', 'admin')
        .select()
        .single()

      if (error || !updatedAdmin) {
        console.error('❌ Error reactivando admin:', error)
        throw new Error('Error al reactivar administrador')
      }

      // Log de actividad
      await logService.recordActivity({
        action: 'admin_reactivated',
        entity_type: 'admin',
        entity_id: adminId,
        details: { 
          reactivated_by: 'system' // TODO: obtener admin actual
        }
      })

      // Mapear respuesta
      const adminUser: AdminUser = {
        id: updatedAdmin.id,
        email: updatedAdmin.email,
        name: updatedAdmin.full_name || updatedAdmin.email,
        role: updatedAdmin.role as 'admin',
        last_login: updatedAdmin.last_login,
        is_active: true,
        created_at: updatedAdmin.created_at,
        updated_at: updatedAdmin.updated_at
      }

      console.log('✅ Admin reactivado exitosamente')
      return adminUser

    } catch (error) {
      console.error('❌ Error en reactivateAdmin:', error)
      
      if (error instanceof Error) {
        throw error
      }
      
      throw new Error('Error reactivando administrador')
    }
  }
} 