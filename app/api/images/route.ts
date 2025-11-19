import { NextRequest, NextResponse } from 'next/server';
import { adminAuthService } from '@/src/services/adminAuthService';
import { imageService } from '@/src/services/imageService';
import { z } from 'zod';
import { errorHandler } from '@/src/lib/errorHandler';

// Schema para API
const ImageApiSchema = z.object({
  productId: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});

const DeleteSchema = z.object({
  urls: z.array(z.string().url()).min(1),
});

const UpdateSchema = z.object({
  productId: z.string().uuid(),
  images: z.array(z.string().url()).max(3),
});

// Middleware auth
async function withAuth(req) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ success: false, error: 'Token requerido' }, { status: 401 });
  const isValid = await adminAuthService.verifyAdminToken(token);
  if (!isValid) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
  return null; // OK
}

export async function GET(req) {
  const authError = await withAuth(req);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const parsed = ImageApiSchema.parse({ productId, limit });

    // Lógica simple: si productId, usa getImagesByProduct; sino, simula list (futuro DB index)
    let images;
    if (productId) {
      const res = await imageService.getImagesByProduct(productId);
      if (!res.success) return NextResponse.json(res, { status: 404 });
      images = res.data.images.map(url => ({ url, productId, uploadedAt: new Date() }));
    } else {
      // Placeholder: en prod, query DB o Storage list; por ahora vacío
      images = [];
    }
    return NextResponse.json({ success: true, data: { images: images.slice(0, parsed.limit) } });
  } catch (error) {
    return NextResponse.json(errorHandler(error, 400));
  }
}

export async function POST(req) {
  const authError = await withAuth(req);
  if (authError) return authError;

  // Rate limit simple (implementar full en lib)
  if (rateLimit.check(req.ip || 'unknown')) return NextResponse.json({ error: 'Rate limit excedido' }, { status: 429 });

  try {
    const formData = await req.formData();
    const files = formData.getAll('files');
    const productId = formData.get('productId');
    const parsedFiles = Array.from(files).map(f => f); // Convert to File[]
    const res = await imageService.uploadImages(parsedFiles, productId || null);
    return NextResponse.json(res);
  } catch (error) {
    return NextResponse.json(errorHandler(error, 400, 'Error en POST'));
  }
}

export async function DELETE(req) {
  const authError = await withAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const parsed = DeleteSchema.parse(body);
    let deletedCount = 0;
    for (const url of parsed.urls) {
      const res = await imageService.deleteImage(url);
      if (res.success) deletedCount++;
    }
    return NextResponse.json({ success: true, data: { deleted: deletedCount } });
  } catch (error) {
    return NextResponse.json(errorHandler(error, 400));
  }
}

export async function PUT(req) {
  const authError = await withAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const parsed = UpdateSchema.parse(body);
    const res = await imageService.updateProductImages(parsed.productId, parsed.images);
    return NextResponse.json(res);
  } catch (error) {
    return NextResponse.json(errorHandler(error, 400));
  }
}