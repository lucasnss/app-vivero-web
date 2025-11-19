import { supabase } from '@/lib/supabaseClient'
import { ActivityLog } from '@/types/activityLog'

export const logService = {
  // Utilidad local para validar UUID v4
  // Acepta también el UUID cero usado como placeholder
  isValidUUID(value: string): boolean {
    if (!value) return false
    const zeroUuid = '00000000-0000-0000-0000-000000000000'
    if (value === zeroUuid) return true
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    const uuidGenericRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidV4Regex.test(value) || uuidGenericRegex.test(value)
  },
  /**
   * Registra una actividad en el sistema
   */
  async recordActivity(data: {
    action: string
    entity_type: string
    entity_id: string
    details?: any
    user_id?: string
  }): Promise<ActivityLog> {
    try {
      // Validar entity_id para evitar errores de UUID inválido
      let safeEntityId = data.entity_id
      const originalEntityId = data.entity_id
      if (!safeEntityId || safeEntityId === 'unknown' || !logService.isValidUUID(safeEntityId)) {
        safeEntityId = '00000000-0000-0000-0000-000000000000' // UUID cero para casos no UUID
      }

      // Enriquecer details con el entity_id original si fue reemplazado
      const detailsToStore = {
        ...(data.details || {}),
        ...(safeEntityId !== originalEntityId ? { _log_original_entity_id: originalEntityId } : {})
      }

      const { data: activity, error } = await supabase
        .from('activity_logs')
        .insert({
          action: data.action,
          entity_type: data.entity_type,
          entity_id: safeEntityId,
          details: detailsToStore,
          user_id: data.user_id || null,
          timestamp: new Date().toISOString()
        })
        .select('*')
        .single()

      if (error) {
        console.error('Error recording activity:', error)
        throw new Error('Error al registrar actividad')
      }

      return {
        id: activity.id,
        action: activity.action,
        entity_type: activity.entity_type,
        entity_id: activity.entity_id,
        details: activity.details,
        user_id: activity.user_id,
        timestamp: activity.timestamp
      }

    } catch (error) {
      console.error('Failed to record activity:', error)
      // En producción, podríamos querer manejar esto de manera más silenciosa
      // para no interrumpir el flujo principal si falla el registro
      throw error
    }
  },

  /**
   * Obtiene el historial de actividades
   */
  async getActivityLogs(options: {
    page: number
    limit: number
    entity_type?: string
    entity_id?: string
    action?: string
  }): Promise<{
    logs: ActivityLog[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }> {
    try {
      let query = supabase
        .from('activity_logs')
        .select('*', { count: 'exact' })

      // Aplicar filtros si se proporcionan
      if (options.entity_type) {
        query = query.eq('entity_type', options.entity_type)
      }

      if (options.entity_id) {
        query = query.eq('entity_id', options.entity_id)
      }

      if (options.action) {
        query = query.eq('action', options.action)
      }

      // Aplicar paginación
      const from = (options.page - 1) * options.limit
      const to = from + options.limit - 1

      const { data, count, error } = await query
        .order('timestamp', { ascending: false })
        .range(from, to)

      if (error) {
        console.error('Error fetching activity logs:', error)
        throw new Error('Error al obtener registros de actividad')
      }

      const total = count || 0
      const totalPages = Math.ceil(total / options.limit)

      return {
        logs: data.map(log => ({
          id: log.id,
          action: log.action,
          entity_type: log.entity_type,
          entity_id: log.entity_id,
          details: log.details,
          user_id: log.user_id,
          timestamp: log.timestamp
        })),
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          totalPages,
          hasNext: options.page < totalPages,
          hasPrev: options.page > 1
        }
      }

    } catch (error) {
      console.error('Error in getActivityLogs:', error)
      throw error
    }
  }
}