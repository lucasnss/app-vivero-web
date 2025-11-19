import { NextRequest, NextResponse } from 'next/server';
import { adminService } from '@/services/adminService';
import { logService } from '@/services/logService';
import { withAuth } from '@/lib/authMiddleware';
import { AdminUser } from '@/types/admin';

// GET - Obtener lista de administradores (requiere permiso read_admin_users)
export const GET = withAuth(async (request: NextRequest, admin: AdminUser) => {
  try {
    // Obtener todos los administradores
    const admins = await adminService.getAllAdmins();
    
    // Registrar actividad
    await logService.recordActivity({
      user_id: admin.id,
      action: 'list_admins',
      entity_type: 'admin',
      entity_id: 'all',
      details: { count: admins.length }
    });
    
    return NextResponse.json({
      success: true,
      data: admins
    });
    
  } catch (error) {
    console.error('Error en GET /api/admin/users:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}, ['read_admin_users']);

// POST - Crear nuevo administrador (requiere permiso create_admin_users)
export const POST = withAuth(async (request: NextRequest, admin: AdminUser) => {
  try {
    const body = await request.json();
    
    // Crear nuevo administrador
    const newAdmin = await adminService.createAdmin(body);
    
    // Registrar actividad
    await logService.recordActivity({
      user_id: admin.id,
      action: 'create_admin',
      entity_type: 'admin',
      entity_id: newAdmin.id,
      details: {
        email: newAdmin.email,
        role: newAdmin.role
      }
    });
    
    return NextResponse.json({
      success: true,
      data: newAdmin
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error en POST /api/admin/users:', error);
    
    // Manejar errores específicos
    if (error instanceof Error) {
      if (error.message.includes('ya existe')) {
        return NextResponse.json({
          success: false,
          error: error.message,
          code: 'EMAIL_EXISTS'
        }, { status: 400 });
      }
      
      if (error.message.includes('validación')) {
        return NextResponse.json({
          success: false,
          error: error.message,
          code: 'VALIDATION_ERROR'
        }, { status: 400 });
      }
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}, ['create_admin_users']);