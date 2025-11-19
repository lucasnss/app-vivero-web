import { NextRequest, NextResponse } from 'next/server';
import { adminService } from '@/services/adminService';
import { logService } from '@/services/logService';
import { withAuth } from '@/lib/authMiddleware';
import { AdminUser } from '@/types/admin';

// GET - Obtener un administrador específico (requiere permiso read_admin_users)
export const GET = withAuth(async (request: NextRequest, admin: AdminUser) => {
  try {
    const id = request.url.split('/').pop();
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID de administrador no proporcionado',
        code: 'MISSING_ID'
      }, { status: 400 });
    }
    
    // Obtener el administrador
    const targetAdmin = await adminService.getAdminProfile(id);
    
    if (!targetAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Administrador no encontrado',
        code: 'ADMIN_NOT_FOUND'
      }, { status: 404 });
    }
    
    // Registrar actividad
    await logService.recordActivity({
      user_id: admin.id,
      action: 'view_admin',
      entity_type: 'admin',
      entity_id: id,
      details: { target_email: targetAdmin.email }
    });
    
    return NextResponse.json({
      success: true,
      data: targetAdmin
    });
    
  } catch (error) {
    console.error('Error en GET /api/admin/users/[id]:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}, ['read_admin_users']);

// PUT - Actualizar un administrador (requiere permiso update_admin_users)
export const PUT = withAuth(async (request: NextRequest, admin: AdminUser) => {
  try {
    const id = request.url.split('/').pop();
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID de administrador no proporcionado',
        code: 'MISSING_ID'
      }, { status: 400 });
    }
    
    const body = await request.json();
    
    // Actualizar el administrador
    const updatedAdmin = await adminService.updateAdminProfile(id, body);
    
    if (!updatedAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Administrador no encontrado',
        code: 'ADMIN_NOT_FOUND'
      }, { status: 404 });
    }
    
    // Registrar actividad
    await logService.recordActivity({
      user_id: admin.id,
      action: 'update_admin',
      entity_type: 'admin',
      entity_id: id,
      details: {
        target_email: updatedAdmin.email,
        updated_fields: Object.keys(body)
      }
    });
    
    return NextResponse.json({
      success: true,
      data: updatedAdmin
    });
    
  } catch (error) {
    console.error('Error en PUT /api/admin/users/[id]:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}, ['update_admin_users']);

// DELETE - Desactivar un administrador (requiere permiso delete_admin_users)
export const DELETE = withAuth(async (request: NextRequest, admin: AdminUser) => {
  try {
    const id = request.url.split('/').pop();
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID de administrador no proporcionado',
        code: 'MISSING_ID'
      }, { status: 400 });
    }
    
    // Obtener el administrador antes de desactivarlo
    const targetAdmin = await adminService.getAdminProfile(id);
    
    if (!targetAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Administrador no encontrado',
        code: 'ADMIN_NOT_FOUND'
      }, { status: 404 });
    }
    
    // No permitir desactivar al propio usuario
    if (id === admin.id) {
      return NextResponse.json({
        success: false,
        error: 'No puedes desactivar tu propia cuenta',
        code: 'CANNOT_DEACTIVATE_SELF'
      }, { status: 400 });
    }
    
    // Desactivar el administrador
    await adminService.deactivateAdmin(id);
    
    // Registrar actividad
    await logService.recordActivity({
      user_id: admin.id,
      action: 'deactivate_admin',
      entity_type: 'admin',
      entity_id: id,
      details: { target_email: targetAdmin.email }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        message: 'Administrador desactivado exitosamente',
        id: id
      }
    });
    
  } catch (error) {
    console.error('Error en DELETE /api/admin/users/[id]:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}, ['delete_admin_users']);