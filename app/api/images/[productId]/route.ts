import { NextRequest, NextResponse } from 'next/server';
import { adminAuthService } from '@/src/services/adminAuthService';
import { imageService } from '@/src/services/imageService';
import { z } from 'zod';
import { errorHandler } from '@/src/lib/errorHandler';

const ProductIdSchema = z.string().uuid();

// Reusa withAuth de route.ts (copiar o import si posible)
async function withAuth(req) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ success: false, error: 'Token requerido' }, { status: 401 });
  const isValid = await adminAuthService.verifyAdminToken(token);
  if (!isValid) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
  return null;
}

export async function GET(req, { params }) {
  const authError = await withAuth(req);
  if (authError) return authError;

  try {
    const { productId } = ProductIdSchema.parse(params);
    const res = await imageService.getImagesByProduct(productId);
    return NextResponse.json(res);
  } catch (error) {
    return NextResponse.json(errorHandler(error, 400));
  }
}

export async function POST(req, { params }) {
  const authError = await withAuth(req);
  if (authError) return authError;

  try {
    const { productId } = ProductIdSchema.parse(params);
    const formData = await req.formData();
    const files = formData.getAll('files').map(f => f);
    const res = await imageService.uploadImages(files, productId);
    return NextResponse.json(res);
  } catch (error) {
    return NextResponse.json(errorHandler(error, 400));
  }
}

export async function DELETE(req, { params }) {
  const authError = await withAuth(req);
  if (authError) return authError;

  try {
    const { productId } = ProductIdSchema.parse(params);
    const body = await req.json();
    const { url } = z.object({ url: z.string().url() }).parse(body); // Single delete
    const res = await imageService.deleteImage(url, productId);
    return NextResponse.json(res);
  } catch (error) {
    return NextResponse.json(errorHandler(error, 400));
  }
}

export async function PUT(req, { params }) {
  const authError = await withAuth(req);
  if (authError) return authError;

  try {
    const { productId } = ProductIdSchema.parse(params);
    const body = await req.json();
    const { images } = z.object({ images: z.array(z.string().url()).max(3) }).parse(body);
    const res = await imageService.updateProductImages(productId, images);
    return NextResponse.json(res);
  } catch (error) {
    return NextResponse.json(errorHandler(error, 400));
  }
}
