import { NextRequest, NextResponse } from 'next/server';
import { adminAuthService } from '@/src/services/adminAuthService';
import { ImageService } from '@/src/services/imageService';
import { z } from 'zod';
import { handleError } from '@/src/lib/errorHandler';

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
async function withAuth(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ success: false, error: 'Token requerido' }, { status: 401 });
  const isValid = await adminAuthService.verifyAdminToken(token);
  if (!isValid) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
  return null; // OK
}

export async function GET(req: NextRequest) {
  const authError = await withAuth(req);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const parsed = ImageApiSchema.parse({ productId, limit });

    // Lógica simple: si productId, usa listImages; sino, simula list (futuro DB index)
    let images: Array<{ url: string; productId: string; uploadedAt: Date }> = [];
    if (productId) {
      const res = await ImageService.listImages(`products/${productId}`);
      if (!res.success) return NextResponse.json(res, { status: 404 });
      images = res.data!.images.map(url => ({ url, productId, uploadedAt: new Date() }));
    }
    return NextResponse.json({ success: true, data: { images: images.slice(0, parsed.limit) } });
  } catch (error) {
    return NextResponse.json(handleError(error));
  }
}

export async function POST(req: NextRequest) {
  const authError = await withAuth(req);
  if (authError) return authError;

  // Rate limit removido temporalmente - implementar después si es necesario

  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const productId = formData.get('productId') as string;
    const folder = productId ? `products/${productId}` : 'products';
    const res = await ImageService.uploadMultipleImages(files, folder);
    return NextResponse.json({ success: true, data: res });
  } catch (error) {
    return NextResponse.json(handleError(error));
  }
}

export async function DELETE(req: NextRequest) {
  const authError = await withAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const parsed = DeleteSchema.parse(body);
    let deletedCount = 0;
    for (const url of parsed.urls) {
      const res = await ImageService.deleteImage(url);
      if (res.success) deletedCount++;
    }
    return NextResponse.json({ success: true, data: { deleted: deletedCount } });
  } catch (error) {
    return NextResponse.json(handleError(error));
  }
}

export async function PUT(req: NextRequest) {
  const authError = await withAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const parsed = UpdateSchema.parse(body);
    // ImageService no tiene updateProductImages, necesitaríamos implementarlo
    return NextResponse.json({ success: false, error: 'Función no implementada aún' }, { status: 501 });
  } catch (error) {
    return NextResponse.json(handleError(error));
  }
}