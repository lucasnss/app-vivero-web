import { NextRequest, NextResponse } from 'next/server';
import { adminAuthService } from '@/src/services/adminAuthService';
import { ImageService } from '@/src/services/imageService';
import { z } from 'zod';
import { handleError } from '@/src/lib/errorHandler';

const ProductIdSchema = z.string().uuid();

// Reusa withAuth de route.ts (copiar o import si posible)
async function withAuth(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ success: false, error: 'Token requerido' }, { status: 401 });
  const isValid = await adminAuthService.verifyAdminToken(token);
  if (!isValid) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
  return null;
}

export async function GET(req: NextRequest, { params }: { params: { productId: string } }) {
  const authError = await withAuth(req);
  if (authError) return authError;

  try {
    const { productId } = ProductIdSchema.parse(params);
    const res = await ImageService.listImages(`products/${productId}`);
    return NextResponse.json(res);
  } catch (error) {
    return NextResponse.json(handleError(error));
  }
}

export async function POST(req: NextRequest, { params }: { params: { productId: string } }) {
  const authError = await withAuth(req);
  if (authError) return authError;

  try {
    const { productId } = ProductIdSchema.parse(params);
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const res = await ImageService.uploadMultipleImages(files, `products/${productId}`);
    return NextResponse.json({ success: true, data: res });
  } catch (error) {
    return NextResponse.json(handleError(error));
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { productId: string } }) {
  const authError = await withAuth(req);
  if (authError) return authError;

  try {
    const { productId } = ProductIdSchema.parse(params);
    const body = await req.json();
    const { url } = z.object({ url: z.string().url() }).parse(body); // Single delete
    const res = await ImageService.deleteImage(url);
    return NextResponse.json(res);
  } catch (error) {
    return NextResponse.json(handleError(error));
  }
}

export async function PUT(req: NextRequest, { params }: { params: { productId: string } }) {
  const authError = await withAuth(req);
  if (authError) return authError;

  try {
    const { productId } = ProductIdSchema.parse(params);
    const body = await req.json();
    const { images } = z.object({ images: z.array(z.string().url()).max(3) }).parse(body);
    // ImageService no tiene updateProductImages, necesitaríamos implementarlo o usar otra lógica
    return NextResponse.json({ success: false, error: 'Función no implementada aún' }, { status: 501 });
  } catch (error) {
    return NextResponse.json(handleError(error));
  }
}
