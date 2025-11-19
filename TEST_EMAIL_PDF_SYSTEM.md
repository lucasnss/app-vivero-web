# ✅ Guía de Testing - Sistema de Email + PDF

## 🚀 Pre-Testing Checklist

- [ ] Servidor reiniciado (`npm run dev`)
- [ ] `.env.local` con EMAIL_USER y EMAIL_PASSWORD configurados
- [ ] Consola del navegador abierta (F12)
- [ ] Logs del servidor visibles
- [ ] Al menos un pedido con pago aprobado en la BD

---

## 📋 Test 1: Completar Pedido desde Tabla

### Pasos:
1. Ir a `/admin/sales-history`
2. Buscar un pedido con:
   - Estado: "Completado" o "Pago OK · Listo para retirar"
   - Pago: Aprobado ✓
3. En la columna **"Completado"**, hacer click en el ⭕ (círculo gris)

### Logs esperados (servidor):
```
📦 [PUT /api/orders/[id]/fulfillment] Action: complete
📋 Orden actual: {
  id: '33b90da1-c907-4776-bc66-f774519711b0',
  payment_status: 'approved',
  fulfillment_status: 'awaiting_pickup',
  shipping_method: 'pickup'
}
🔄 Actualizando fulfillment_status de "awaiting_pickup" a "pickup_completed"
✅ Orden actualizada exitosamente
📧 Intentando enviar email de completación...
📧 Preparando email para lucasctmn@gmail.com...
📄 Generando PDF...
✅ PDF generado exitosamente ← DEBE APARECER (no error)
📮 Enviando email...
✅ Email enviado exitosamente. ID: <message-id>
```

### Logs esperados (navegador):
```
✅ Pedido Completado
Pedido marcado como completado (Email enviado al cliente)
```

### ✅ Criterios de Éxito:
- [ ] No hay error en "Generando PDF"
- [ ] Aparece "✅ Email enviado exitosamente"
- [ ] La fila se actualiza (checkbox se vuelve verde ✅)
- [ ] No hay error 500

---

## 📋 Test 2: Completar Pedido desde Modal

### Pasos:
1. Ir a `/admin/sales-history`
2. Hacer click en "Ver Detalle" de un pedido con pago aprobado
3. En la sección "Gestionar Pedido" (abajo del modal), hacer click en el botón verde

### Modal esperado:
```
┌─────────────────────────────────────────────┐
│ Gestionar Pedido                            │
├─────────────────────────────────────────────┤
│ [✅ Marcar como Entregado/Retirado]  [Estado] │
└─────────────────────────────────────────────┘
```

### Logs esperados: igual que Test 1

### ✅ Criterios de Éxito:
- [ ] Modal no se cierra con error
- [ ] Botón cambia a "Revertir a En Proceso"
- [ ] Badge de estado se actualiza
- [ ] Email enviado

---

## 📋 Test 3: Verificar Email Recibido

### ¿Dónde revisar?
- ✅ Gmail: Revisar inbox (o spam si no llega)
- ✅ Otro email: Revisar según el cliente configurado

### Email esperado debe tener:

**Asunto:**
```
✅ Pedido #12AB34CD - [En camino|Listo para retirar]
```

**Contenido:**
```
✅ ¡Pedido Completado!
Pedido #12AB34CD

Hola [Nombre Cliente],

Tu pedido ha sido procesado exitosamente...

🚚 Envío a Domicilio / 🏪 Retiro en Tienda
[Mensaje personalizado según tipo de envío]

📦 Resumen del Pedido
- Fecha: [Fecha]
- Método de Pago: Mercado Pago
- Total: $XXX.XX

[Link a WhatsApp]

Gracias por su compra 💚
```

**Adjuntos:**
```
Comprobante-Pedido-[ID].pdf ← PDF DEBE ESTAR INCLUIDO
```

### ✅ Criterios de Éxito:
- [ ] Email llega (no en spam)
- [ ] Tiene PDF adjunto
- [ ] Mensaje personalizado según tipo de envío:
  - [ ] "1 a 3 días hábiles" si es delivery
  - [ ] "¡Listo para retirar!" si es pickup
- [ ] Link a WhatsApp funciona

---

## 📋 Test 4: Protección contra Duplicados

Este test verifica que el sistema protege contra webhooks duplicados.

### Cómo generar un duplicado:
1. Crear una orden en Mercado Pago (puede ser test o real)
2. Esperar a que el webhook se procese
3. Revisar en `/admin/sales-history` que aparece UNA sola orden

### Logs esperados:
```
🔄 Procesando pago: 133894746453
📝 Creando orden real desde datos temporales...
✅ Orden real creada con external_reference: 33b90da1-c907-4776-bc66-f774519711b0

[Segunda petición del webhook llega]
⚠️ Webhook ya está siendo procesado: 133894746453
```

### ✅ Criterios de Éxito:
- [ ] Solo UNA orden creada (no dos)
- [ ] En logs aparece "Webhook ya está siendo procesado"
- [ ] No hay error de constraint en la BD

---

## 📋 Test 5: Revertir Completación

### Pasos:
1. Abrir modal de un pedido ya completado (con ✅ en tabla)
2. Hacer click en "Revertir a En Proceso"

### Logs esperados:
```
🔄 Actualizando fulfillment_status de "pickup_completed" a "awaiting_pickup"
✅ Orden actualizada exitosamente
📧 Intentando enviar email de completación...
❌ No se intentará enviar (action = 'revert')
```

### ✅ Criterios de Éxito:
- [ ] El checkbox vuelve a ⭕ (gris)
- [ ] No se envía email de revertir (solo de completar)
- [ ] Se puede volver a marcar como completado

---

## 🐛 Troubleshooting

### Problema: "Error generando PDF"
**Antes (SOLUCIONADO):**
```
❌ Error: ENOENT: no such file or directory, open '.../Helvetica.afm'
```

**Solución:**
- ✅ Verificar que `pdfkit` está desinstalado
- ✅ Verificar que `pdf-lib` está instalado
- ✅ Verificar `pdfService.ts` usa `pdf-lib`
- ✅ Reiniciar servidor

### Problema: "Error enviando email"
```
❌ Error enviando email: Error: Invalid login
```

**Soluciones:**
- [ ] Verificar `EMAIL_USER` en `.env.local`
- [ ] Verificar `EMAIL_PASSWORD` (App Password, no contraseña normal)
- [ ] Verificar que Gmail tiene Verificación en 2 pasos activada
- [ ] Generar nueva App Password

### Problema: Webhook se procesa dos veces
**Antes (SOLUCIONADO):**
```
Se creaban dos órdenes duplicadas
```

**Solución:**
- ✅ Verificar que `webhook/route.ts` tiene `processingCache`
- ✅ Verificar funciones `isPaymentBeingProcessed()` y `markPaymentAsProcessing()`
- ✅ Si sigue duplicando, revisar si es comportamiento de Mercado Pago en tu cuenta

---

## 📊 Matriz de Testing

| Test | Funcionalidad | Estado | Notas |
|------|---------------|--------|-------|
| 1 | Completar desde tabla | ⏳ Pendiente | Ver logs servidor |
| 2 | Completar desde modal | ⏳ Pendiente | Botón verde |
| 3 | Email recibido | ⏳ Pendiente | Revisar spam |
| 4 | Duplicados prevenidos | ⏳ Pendiente | Revisar logs |
| 5 | Revertir completación | ⏳ Pendiente | Vuelve a gris |

---

## ✅ Checklist Final

Antes de dar por completado:
- [ ] Test 1: PASSED ✅
- [ ] Test 2: PASSED ✅
- [ ] Test 3: PASSED ✅
- [ ] Test 4: PASSED ✅
- [ ] Test 5: PASSED ✅
- [ ] No hay errores en consola ✅
- [ ] No hay errores en logs servidor ✅
- [ ] Emails llegan correctamente ✅
- [ ] PDFs se generan ✅
- [ ] No hay órdenes duplicadas ✅

---

## 📞 Soporte

Si hay problemas, revisa:
1. `SOLUCION_ERRORES_EMAIL_PDF.md` - Explicación técnica
2. `ENV_CONFIG.md` - Configuración de email
3. Logs del servidor en consola
4. Errores en browser console (F12)

¡Listo! 🚀

