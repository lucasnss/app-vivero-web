# 🚀 PLAN DE LANZAMIENTO A PRODUCCIÓN

## ⏱️ TIMELINE: 2-3 días

---

## 🔴 DÍA 1: CRÍTICO (2 horas)

### Tarea 1.1: Configurar Webhook Secret

**Documento**: `GUIA-CONFIGURACION-WEBHOOK-SECRET.md`

```bash
⏱️ Tiempo: 20 minutos
```

**Pasos**:
1. Ir a MP Dashboard → Webhooks → copiar Secret Key
2. Agregar a `.env.local`: `MERCADOPAGO_WEBHOOK_SECRET=sk_...`
3. Agregar a Vercel Environment Variables
4. Esperar 2 minutos a que se aplique

**Verificación**:
- [ ] Secret está en `.env.local`
- [ ] Secret está en Vercel (Settings → Environment Variables)
- [ ] Reiniciaste `npm run dev`

---

### Tarea 1.2: Hacer Prueba Real

**Documento**: `GUIA-PRUEBA-REAL-PRODUCCION.md`

```bash
⏱️ Tiempo: 1.5 horas
```

**Checklist de 10 pasos**:
- [ ] Preparar producto de prueba ($100 ARS)
- [ ] Comprar desde frontend
- [ ] Verificar webhook procesado en Vercel logs
- [ ] Verificar orden creada en BD
- [ ] Verificar stock descontado
- [ ] Verificar email enviado
- [ ] Verificar dinero en cuenta MP
- [ ] Verificar en admin
- [ ] Verificar activity logs
- [ ] Documentar resultado

**Si TODO está ✅**:
```bash
✅ Sistema está listo para producción
```

**Si algo está ❌**:
```bash
❌ NO LANZAR - Revisar troubleshooting en guía
```

---

### 📋 Resultado esperado DÍA 1

```
✅ Secret configurado
✅ Prueba real completada exitosamente
✅ Documentado en CHANGELOG.md
→ Sistema funcionando 100%
```

---

## 🟡 DÍA 2-3: URGENTE (3-4 horas)

### Tarea 2.1: Implementar Estados Fallidos

**Documento**: `IMPLEMENTACION-ESTADOS-PAGO-PENDIENTES.md`

```bash
⏱️ Tiempo: 1.5 horas
```

**Qué hace**:
- Manejo de pagos `pending` (dinero en cuenta esperando 3 días)
- Manejo de pagos `rejected` (sin fondos, tarjeta bloqueada, etc)
- Manejo de pagos `cancelled` (cancelado por cliente)

**Pasos**:
1. Crear método `markOrderAsPending()` en orderService
2. Crear método `markOrderAsRejected()` en orderService
3. Crear método `markOrderAsCancelled()` en orderService
4. Crear método `increaseStock()` en productService
5. Actualizar webhook para usar los 3 métodos
6. Hacer pruebas de cada estado

**Verificación**:
- [ ] Build exitoso (`npm run build`)
- [ ] Prueba de pago pending completada
- [ ] Prueba de pago rejected completada
- [ ] Prueba de pago cancelled completada

---

### Tarea 2.2: Dashboard de Ventas

**Tiempo**: 2 horas

**Qué hace**:
- Mostrar: "Vendiste $X hoy en Y órdenes"
- Mostrar: "Pagos pendientes: Z"
- Mostrar: "Pagos fallidos: W"

**Pasos**:
1. Crear endpoint `/api/admin/dashboard` que retorne estadísticas
2. Crear componente Admin para mostrar métricas
3. Agregar a página `/admin`

**Verificación**:
- [ ] Dashboard muestra datos correctos
- [ ] Métricas se actualizan cada 5 minutos

---

### 📋 Resultado esperado DÍA 2-3

```
✅ Estados pending/rejected/cancelled funcionando
✅ Dashboard de ventas básico funcionando
✅ Documentado en CHANGELOG.md
→ Sistema con cobertura de 99% de casos
```

---

## 🎯 DECISIÓN FINAL

### ¿Puedo lanzar con solo DÍA 1 completado?

**Respuesta: SÍ, pero...**

```
✅ HACER:
- Día 1 (crítico): Obligatorio
- Deploy a producción
- Monitorear logs primeras 24 horas

❌ NO HACER:
- Lanzar SIN configurar secret (es una bomba)
- Lanzar SIN hacer prueba real (arriesgado)
- Lanzar CON modo debug activado (vulnerabilidad)

⏱️ TIMING:
- Si son las 14:00 hoy → Puedo lanzar a las 16:00
- Si son las 19:00 hoy → Lanzar mañana a la mañana
```

### ¿Y el DÍA 2-3?

```
✅ DEBE HACERSE en los próximos 3-5 días
❌ NO puede quedar pendiente indefinidamente
→ Porque sin manejo de "pending" los clientes
  se quejan después (dinero congelado 3 días)
```

---

## 📋 CHECKLIST PRE-LANZAMIENTO

### 🔴 CRÍTICO (Día 1)

- [ ] Secret configurado en Vercel
- [ ] Prueba real completada
- [ ] Dinero reflejado en cuenta MP
- [ ] Orden visible en admin
- [ ] Stock descontado
- [ ] Email enviado
- [ ] Logs sin errores 401

### 🟡 IMPORTANTE (Día 2-3)

- [ ] Estados pending/rejected/cancelled implementados
- [ ] Dashboard básico funcionando
- [ ] Documentación en CHANGELOG.md

### 🟢 OPCIONAL (Después de producción)

- [ ] Cron job de reconciliación
- [ ] Alertas por email si >5 pagos fallan
- [ ] Logging estructurado

---

## 🚨 GUARDRAILS (No cruces estas líneas)

```
❌ RIESGO CRÍTICO - NO LANZAR SI:
- No está configurado MERCADOPAGO_WEBHOOK_SECRET
- No se hizo prueba real de pago
- Modo debug sigue activado
- Hay error 401 en webhook logs

⚠️ RIESGO ALTO - CONSIDERAR SI:
- No está implementado manejo de pagos pending
- No hay dashboard de ventas
- Sin cron job de reconciliación

✅ SEGURO - PUEDE LANZAR SI:
- Día 1 completado al 100%
- Logs muestran "Firma validada correctamente"
- Prueba real funcionó perfectamente
```

---

## 📞 SI ALGO FALLA EN PRODUCCIÓN

### Escenario 1: Webhooks no procesándose (Error 401)

```bash
# Causa probable: Secret no configurado
# Solución: Verificar Vercel Environment Variables

1. Vercel Dashboard
2. Project Settings
3. Environment Variables
4. Buscar MERCADOPAGO_WEBHOOK_SECRET
5. Si no está → agregar
6. Redeploy
```

### Escenario 2: Pago aprobado pero orden no se crea

```bash
# Causa probable: Error en BD al buscar datos temporales
# Solución: Revisar activity_logs

1. Vercel Logs → buscar "webhook_received"
2. Buscar "webhook_order_not_found"
3. Si aparece → datos temporales no están en BD
4. Solución: Crear orden manualmente o reintentar pago
```

### Escenario 3: Stock no descontado

```bash
# Causa probable: Error en transacción de stock
# Solución: Check manually

1. Revisar logs: "stock_reduction_error"
2. Descontar stock manualmente en BD:
   UPDATE products SET stock = stock - 1 WHERE id = '...';
3. Documentar incidente
```

---

## 📝 DESPUÉS DE LANZAR

### Monitoreo Primeras 24 Horas

Revisa **cada 6 horas**:
```bash
Vercel Logs → buscar:
- [WEBHOOK] Firma validada correctamente ✅
- [WEBHOOK] Procesamiento completado ✅
- Error, 401, "Invalid signature" ❌
```

### Reportes Diarios (Primeros 7 días)

```bash
- ¿Cuántos pagos completados?
- ¿Algún error en webhooks?
- ¿Stock descontado correctamente?
- ¿Emails enviados?
```

### Después de 7 días

Si todo está bien:
```bash
✅ Cerrar fase de emergencia
✅ Empezar a implementar mejoras (Día 2-3)
✅ Considerar publicidad / marketing
```

---

## 🎓 LECCIONES APRENDIDAS

Este proyecto pasó de:

```
❌ "Parece que funciona" (sin pruebas)
→ ✅ "Funciona y está documentado" (pruebas reales)

❌ "Debug activado en producción" (vulnerabilidad)
→ ✅ "Seguridad implementada y verificada"

❌ "Solo manejo de aprobados" (casos incompletos)
→ ✅ "Todos los estados de pago cubiertos" (próximo)
```

**Moraleja**: La diferencia entre "el código funciona" y "está listo para producción" es:
1. Pruebas reales
2. Documentación
3. Manejo de errores
4. Seguridad

Esto lo acabas de implementar. ✅

---

## 📞 CONTACTO / SOPORTE

Si hay dudas:
1. Revisar guías en carpeta raíz del proyecto
2. Revisar CHANGELOG.md para entender cambios
3. Revisar Vercel logs para debugging

---

## ✅ RESUMEN EJECUTIVO

```
🎯 OBJETIVO: Lanzar a producción de forma segura

⏱️ TIEMPO: 2 horas críticas (Día 1) + 3-4 horas mejoras (Día 2-3)

📋 CHECKLIST CRÍTICO:
- [ ] Configurar secret
- [ ] Prueba real
- [ ] Verificar todo funciona

🚀 RESULTADO:
- Sistema listo para producción
- Documentación completa
- Seguridad implementada
```

---

**Última actualización**: 2025-12-20
**Estado**: LISTO PARA EJECUTAR
**Siguiente revisión**: Después de Día 1

