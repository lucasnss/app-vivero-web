import { NextRequest, NextResponse } from 'next/server'
import { logService } from '@/services/logService'
import { handleError, createSuccessResponse } from '@/lib/errorHandler'

export async function GET(request: NextRequest) {
  try {
    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const userId = searchParams.get('user_id')
    const entityType = searchParams.get('entity_type')
    const action = searchParams.get('action')

    // Obtener logs de actividad
    const logs = await logService.getActivityLogs({
      page: Math.floor(offset / limit) + 1,
      limit,
      entity_type: entityType || undefined,
      entity_id: userId || undefined,
      action: action || undefined
    })

    return NextResponse.json(createSuccessResponse({
      data: logs.logs,
      pagination: {
        limit,
        offset,
        total: logs.pagination.total,
        page: logs.pagination.page
      }
    }))

  } catch (error) {
    console.error('Error en GET /api/admin/activity-logs:', error)
    const errorResponse = handleError(error)
    return NextResponse.json(errorResponse, {
      status: errorResponse.error.status
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar campos requeridos
    if (!body.action || !body.entity_type || !body.entity_id) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'action, entity_type y entity_id son requeridos',
          code: 'MISSING_REQUIRED_FIELDS',
          status: 400
        }
      }, { status: 400 })
    }

    // Registrar actividad
    const activityLog = await logService.recordActivity({
      action: body.action,
      entity_type: body.entity_type,
      entity_id: body.entity_id,
      details: body.details || {},
      user_id: body.user_id
    })

    return NextResponse.json(createSuccessResponse({
      data: activityLog,
      message: 'Actividad registrada exitosamente'
    }))

  } catch (error) {
    console.error('Error en POST /api/admin/activity-logs:', error)
    const errorResponse = handleError(error)
    return NextResponse.json(errorResponse, {
      status: errorResponse.error.status
    })
  }
} 