# 🚀 Guía Completa: Poner ViveroWeb en Producción

Esta es la guía maestra para pasar tu aplicación de desarrollo a producción real con Mercado Pago funcionando.

---

## 📚 Documentos Disponibles

He creado varios documentos para guiarte paso a paso:

### 1. **PRODUCCION-MERCADOPAGO-CHECKLIST.md** ⭐ EMPEZAR AQUÍ
   - Checklist completo con TODOS los pasos
   - Incluye verificaciones y solución de problemas
   - Sigue este documento paso a paso

### 2. **INSTRUCCIONES-PARA-CLIENTE.md** 📧 ENVIAR AL CLIENTE
   - Instrucciones que el CLIENTE debe seguir
   - Explica cómo crear cuenta de Mercado Pago
   - Cómo obtener las credenciales de producción
   - Envíale este documento por email/WhatsApp

### 3. **DEPLOY-VERCEL-PASO-A-PASO.md** 🌐 PARA TI
   - Guía completa de cómo hacer deploy a Vercel
   - Desde cero hasta tener la app online
   - Incluye troubleshooting

### 4. **COMANDOS-RAPIDOS.md** ⚡ REFERENCIA
   - Lista de comandos útiles
   - Para consulta rápida
   - Desarrollo, deploy, debug

### 5. **env.example** 🔐 CONFIGURACIÓN
   - Plantilla actualizada con comentarios
   - Explica qué poner en desarrollo vs producción
   - Úsala como referencia

---

## 🎯 Flujo de Trabajo Recomendado

### Semana 1: Preparación (1-3 días)

**Día 1:**
1. ✅ Lee `PRODUCCION-MERCADOPAGO-CHECKLIST.md`
2. ✅ Envía `INSTRUCCIONES-PARA-CLIENTE.md` al cliente
3. ✅ Espera a que el cliente cree su cuenta de MP

**Días 2-3:**
- El cliente completa verificación de identidad en MP (1-3 días)
- El cliente vincula su cuenta bancaria
- El cliente te envía las credenciales de PRODUCCIÓN

### Semana 2: Configuración Técnica (1 hora)

**Paso 1: Verificar tu código**
```bash
npm run build
npm run verify-mp-config
```

**Paso 2: Deploy a Vercel**
- Sigue: `DEPLOY-VERCEL-PASO-A-PASO.md`
- Tiempo: 10 minutos
- Resultado: Obtienes tu URL de producción

**Paso 3: Configurar Variables de Entorno**
- En Vercel Dashboard
- Usar credenciales del CLIENTE
- Tiempo: 5 minutos

**Paso 4: Registrar Webhook**
- En panel de Mercado Pago del cliente
- Mejor hacerlo en videollamada con el cliente
- Tiempo: 5 minutos

### Semana 2: Pruebas (30 minutos)

**Prueba 1: Con tarjeta de test**
- Usar tarjeta de prueba de MP
- Verificar que todo funcione
- Tiempo: 15 minutos

**Prueba 2: Con pago real pequeño**
- Tu propia tarjeta, monto pequeño
- VERIFICAR que el dinero llegue al CLIENTE
- Tiempo: 15 minutos

### Semana 2: ¡En producción! 🎉

- Sistema funcionando
- Clientes pueden comprar
- El dinero va al vivero
- ¡Listo!

---

## ✅ Checklist Rápido

Usa esto para verificar que completaste todo:

### Antes de Deploy
- [ ] npm run build funciona sin errores
- [ ] Tienes las credenciales del CLIENTE (no tuyas)
- [ ] Las credenciales son de PRODUCCIÓN (APP_USR-)

### Deploy
- [ ] Deploy a Vercel exitoso
- [ ] Variables de entorno configuradas en Vercel
- [ ] URL de producción guardada

### Mercado Pago
- [ ] Webhook registrado en panel de MP
- [ ] Webhook en modo PRODUCCIÓN (no test)

### Pruebas
- [ ] Prueba con tarjeta de test: ✅
- [ ] Prueba con pago real: ✅
- [ ] Dinero llega al cliente: ✅

### Verificaciones Finales
- [ ] Emails se envían correctamente
- [ ] Stock se reduce automáticamente
- [ ] Órdenes aparecen en /admin/sales-history
- [ ] Cliente puede ver sus ventas en MP

---

## 🆘 ¿Problemas?

### "No tengo las credenciales del cliente"
→ Envíale `INSTRUCCIONES-PARA-CLIENTE.md`

### "El build falla"
→ Ejecuta `npm run build` y lee el error

### "No sé cómo hacer deploy"
→ Lee `DEPLOY-VERCEL-PASO-A-PASO.md`

### "El webhook no funciona"
→ Revisa logs en Vercel Dashboard → Functions → Logs

### "El dinero llega a mi cuenta y no al cliente"
→ Estás usando tus credenciales, usa las del cliente

---

## 🎓 Orden de Lectura Sugerido

1. **Primero:** Lee este documento (README-PRODUCCION.md)
2. **Segundo:** Lee PRODUCCION-MERCADOPAGO-CHECKLIST.md
3. **Tercero:** Envía INSTRUCCIONES-PARA-CLIENTE.md al cliente
4. **Cuando tengas credenciales:** Lee DEPLOY-VERCEL-PASO-A-PASO.md
5. **Para consultas:** COMANDOS-RAPIDOS.md

---

## 📊 Script de Verificación

Antes de hacer deploy, ejecuta:

```bash
npm run verify-mp-config
```

Esto verificará:
- ✅ Todas las variables de entorno están configuradas
- ✅ Las credenciales tienen el formato correcto
- ⚠️ Si estás usando credenciales de test o producción
- ⚠️ Si tu URL es de desarrollo o producción

---

## 🔧 Cambios Realizados en el Código

He preparado tu código para producción con estos cambios:

### Archivos Creados:
1. ✅ `PRODUCCION-MERCADOPAGO-CHECKLIST.md` - Guía completa paso a paso
2. ✅ `INSTRUCCIONES-PARA-CLIENTE.md` - Para enviar al cliente
3. ✅ `DEPLOY-VERCEL-PASO-A-PASO.md` - Guía de deploy
4. ✅ `COMANDOS-RAPIDOS.md` - Referencia de comandos
5. ✅ `scripts/verify-mp-production-config.js` - Script de verificación
6. ✅ `README-PRODUCCION.md` - Este documento

### Archivos Actualizados:
1. ✅ `env.example` - Ahora tiene comentarios claros sobre producción
2. ✅ `package.json` - Agregado script `verify-mp-config`

### Tu código NO necesita cambios:
- ✅ `src/lib/mercadopagoConfig.ts` - Ya detecta automáticamente el ambiente
- ✅ `app/api/mercadopago/webhook/route.ts` - Ya funciona en producción
- ✅ `src/services/mercadopagoService.ts` - Ya funciona en producción

**Todo está listo, solo necesitas seguir los pasos en los documentos. 🚀**

---

## 💡 Consejos Importantes

### 1. Credenciales del Cliente, NO Tuyas
El error #1 es usar tus propias credenciales. El dinero DEBE ir a la cuenta del cliente.

### 2. Modo PRODUCCIÓN en MP
Las credenciales deben ser de PRODUCCIÓN (APP_USR-), no de prueba (TEST-).

### 3. URL de Vercel, NO ngrok
En producción, usa tu URL de Vercel. Ngrok es solo para desarrollo local.

### 4. Probar ANTES de ir live
Siempre haz pruebas con tarjetas de test antes de cobrar dinero real.

### 5. Comunicar Comisiones al Cliente
El cliente debe saber que MP cobra ~3.49% + $5 por transacción.

---

## 📞 Soporte

Si tienes dudas durante el proceso:

- **Vercel:** https://vercel.com/support
- **Mercado Pago:** https://www.mercadopago.com.ar/ayuda
- **Documentación MP:** https://www.mercadopago.com.ar/developers/es/docs

---

## 🎉 ¿Cuándo estará listo?

**Estimación de tiempo total:**

- Preparación cuenta del cliente: **1-3 días** (espera de MP)
- Configuración técnica: **1 hora** (deploy + config)
- Pruebas: **30 minutos**

**Total: ~3-4 días** (considerando tiempos de espera)

---

## ✨ Resultado Final

Cuando termines tendrás:

- ✅ Tienda online funcionando en Vercel
- ✅ Pagos con Mercado Pago activos
- ✅ El dinero va directo al cliente
- ✅ Emails automáticos a compradores
- ✅ Stock se actualiza automáticamente
- ✅ Panel admin para gestionar ventas

**¡Tu cliente podrá vender online! 🚀**

---

**Siguiente paso:** Abre `PRODUCCION-MERCADOPAGO-CHECKLIST.md` y empieza con el Paso 1.

