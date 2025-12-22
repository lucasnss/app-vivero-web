// src/lib/mercadopagoSignature.ts
import crypto from 'crypto';

/**
 * Valida la firma X-Signature de MercadoPago para verificar autenticidad del webhook
 * Implementado según documentación oficial: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 * 
 * @param request - NextRequest object
 * @param secretKey - Secret key from MercadoPago dashboard (opcional, usa env var por defecto)
 * @returns boolean - true si la firma es válida
 */
export async function validateMercadoPagoSignature(
  request: Request,
  secretKey?: string
): Promise<boolean> {
  try {
    // 1. Obtener secret key (desde env o parámetro)
    const secret = secretKey || process.env.MERCADOPAGO_WEBHOOK_SECRET;
    
    if (!secret) {
      console.error('❌ [MP_SIGNATURE] MERCADOPAGO_WEBHOOK_SECRET no configurado en variables de entorno');
      return false;
    }

    // 2. Extraer headers necesarios
    const xSignature = request.headers.get('x-signature');
    const xRequestId = request.headers.get('x-request-id');
    
    if (!xSignature || !xRequestId) {
      console.error('❌ [MP_SIGNATURE] Headers x-signature o x-request-id faltantes');
      console.error('   x-signature:', xSignature ? 'presente' : 'FALTANTE');
      console.error('   x-request-id:', xRequestId ? 'presente' : 'FALTANTE');
      return false;
    }

    // 3. Extraer query params de la URL
    // ✅ Soporta ambos formatos: 
    //    - Notificaciones de pago: ?data.id=XXX&type=payment
    //    - Notificaciones de merchant_order: ?id=XXX&topic=merchant_order
    const url = new URL(request.url);
    const dataId = url.searchParams.get('data.id') || url.searchParams.get('id');
    console.log(`🔍 Query param detectado: ${dataId}`);
    
    if (!dataId) {
      console.error('❌ [MP_SIGNATURE] Query params data.id o id faltantes en URL:', request.url);
      return false;
    }

    // 4. Parsear x-signature para extraer ts y v1
    // Formato esperado: "ts=1742505638683,v1=ced36ab6d33566bb1e16c125819b8d840d6b8ef136b0b9127c76064466f5229b"
    const parts = xSignature.split(',');
    let ts: string | null = null;
    let hash: string | null = null;

    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key?.trim() === 'ts') {
        ts = value?.trim();
      } else if (key?.trim() === 'v1') {
        hash = value?.trim();
      }
    }

    if (!ts || !hash) {
      console.error('❌ [MP_SIGNATURE] No se pudo extraer ts o v1 de x-signature');
      console.error('   x-signature recibido:', xSignature);
      console.error('   ts extraído:', ts);
      console.error('   hash extraído:', hash);
      return false;
    }

    // 5. Verificar que el timestamp no sea muy antiguo (prevenir replay attacks)
    // ✅ Convertir timestamp de SEGUNDOS a MILISEGUNDOS (MercadoPago envía en segundos)
    const currentTimestamp = Date.now();
    const messageTimestamp = parseInt(ts, 10) * 1000;
    const timeDifference = Math.abs(currentTimestamp - messageTimestamp);
    
    // 🔍 DEBUG: Mostrar timestamp parseado SIEMPRE
    console.log('🕐 [MP_SIGNATURE] Timestamp parseado:');
    console.log('   - Raw (segundos):', ts);
    console.log('   - Convertido (ms):', messageTimestamp);
    console.log('   - Fecha:', new Date(messageTimestamp).toISOString());
    console.log('   - Diferencia:', timeDifference, 'ms');
    
    // Permitir máximo 5 minutos de diferencia (300000 ms)
    if (timeDifference > 300000) {
      console.error('❌ [MP_SIGNATURE] Timestamp del webhook muy antiguo (posible replay attack)');
      console.error('   Timestamp mensaje: ' + new Date(messageTimestamp).toISOString() + ' (ts=' + ts + ' segundos)');
      console.error('   Timestamp actual:', new Date(currentTimestamp).toISOString());
      console.error('   Diferencia (ms):', timeDifference);
      return false;
    }

    // 6. Construir el manifest según documentación de MercadoPago
    // Formato: id:{data.id};request-id:{x-request-id};ts:{ts};
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

    // 7. Calcular HMAC SHA256
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(manifest);
    const calculatedHash = hmac.digest('hex');

    // 8. Comparar hashes (timing-safe comparison para prevenir timing attacks)
    const isValid = crypto.timingSafeEqual(
      Buffer.from(calculatedHash, 'hex'),
      Buffer.from(hash, 'hex')
    );

    if (isValid) {
      console.log('✅ [MP_SIGNATURE] Firma de MercadoPago validada correctamente');
      console.log('   data.id:', dataId);
      console.log('   request-id:', xRequestId);
      return true;
    } else {
      console.error('❌ [MP_SIGNATURE] Firma de MercadoPago inválida - POSIBLE ATAQUE');
      console.error('   Manifest usado:', manifest);
      console.error('   Hash esperado:', calculatedHash);
      console.error('   Hash recibido:', hash);
      return false;
    }

  } catch (error: any) {
    console.error('❌ [MP_SIGNATURE] Error validando firma de MercadoPago:', error.message);
    console.error('   Stack:', error.stack);
    return false;
  }
}

/**
 * Interface para la notificación de MercadoPago
 */
export interface MercadoPagoNotification {
  action: string;
  api_version: string;
  data: {
    id: string;
  };
  date_created: string;
  id: string;
  live_mode: boolean;
  type: string;
  user_id: number;
}

/**
 * Valida y parsea una notificación de MercadoPago en un solo paso
 * Útil para simplificar el código del webhook
 * 
 * @param request - NextRequest object
 * @returns Objeto con valid (boolean) y notification (parsed o null)
 */
export async function validateAndParseNotification(
  request: Request
): Promise<{ valid: boolean; notification: MercadoPagoNotification | null }> {
  // 1. Validar firma
  const isValid = await validateMercadoPagoSignature(request);
  
  if (!isValid) {
    return { valid: false, notification: null };
  }

  // 2. Parsear body
  try {
    const notification = await request.json() as MercadoPagoNotification;
    console.log('✅ [MP_SIGNATURE] Notificación parseada correctamente:', {
      type: notification.type,
      action: notification.action,
      data_id: notification.data.id
    });
    return { valid: true, notification };
  } catch (error: any) {
    console.error('❌ [MP_SIGNATURE] Error parseando notificación:', error.message);
    return { valid: false, notification: null };
  }
}


