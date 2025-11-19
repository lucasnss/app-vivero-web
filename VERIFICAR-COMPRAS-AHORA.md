# ⚡ VERIFICACIÓN RÁPIDA: ¿Por Qué No Aparecen las Compras?

**Tiempo estimado: 5 minutos**

---

## **Paso 1: Verifica que ngrok esté Activo**

```bash
# Abre ngrok dashboard en el navegador:
http://localhost:4040

# ¿Ves "Online" en la esquina superior izquierda?
# ¿Ves una URL como "https://abc123...ngrok-free.app"?

SI NO:
  → Abre otra terminal y ejecuta:
    $ ngrok http 3000
  
  → Espera hasta ver "Forwarding https://..."
  → Esta es tu URL pública
```

---

## **Paso 2: Copia la URL de ngrok**

```
Ejemplo: https://f9c5a233dcaa.ngrok-free.app

(Esta URL es diferente cada vez que reinician ngrok - ¡importante!)
```

---

## **Paso 3: Configura la URL en Mercado Pago Dashboard**

```
1. Abre: https://www.mercadopago.com.ar/developers/panel
2. Click en tu Aplicación
3. Click en "Integración" 
4. Scroll hasta "Webhooks"
5. En "URL", ingresa:
   https://tu-url-ngrok/api/mercadopago/webhook
   
   EJEMPLO:
   https://f9c5a233dcaa.ngrok-free.app/api/mercadopago/webhook

6. Topic: "payment" (debe estar seleccionado)
7. Click "Guardar"
8. ¿Ves verde con checkmark? → ✅ Listo
```

---

## **Paso 4: Haz una Compra de Prueba**

```
1. Abre: http://localhost:3000/carrito
2. Agrega un producto (click + en alguno)
3. Click "Proceder a pagar"
4. Llena el formulario:
   - Nombre: Test User
   - Email: test@vivero.com
   - Dirección: Calle 123
   - Provincia: Buenos Aires
   - Código Postal: 1000
   - Teléfono: 1112345678
   - Elige "Envío a domicilio" o "Retirar"
5. Click "Pagar con Mercado Pago"
```

---

## **Paso 5: Monitorea mientras se Procesa**

**En ngrok dashboard (http://localhost:4040):**
```
Debería ver dos requests:
  ✓ POST /api/mercadopago/create-preference (200)
  ✓ POST /api/mercadopago/webhook (200)
  
Si solo ves el primero y NO el segundo:
  → MP no envió webhook
  → Revisa que la URL en MP Dashboard esté correcta
  → Si ngrok fue reiniciado, la URL cambió, actualízala
```

**En la consola (npm run dev):**
```
Busca líneas como:
  🚀 === INICIO CREATE PREFERENCE ===
  💳 Creando preferencia de pago en MP...
  ✅ Preferencia de MP creada
  
Cuando llega el webhook:
  🔔 Webhook recibido de Mercado Pago
  📝 Creando orden real desde datos temporales
  ✅ Orden real creada
  
Si ves error después de "Creando orden":
  → Hay un problema al crear la orden, copia el error
```

---

## **Paso 6: Verifica la Orden Fue Creada**

### **En Supabase Table Editor:**
```
1. Abre Supabase dashboard (https://app.supabase.com)
2. Tabla "orders" 
3. ¿Hay una fila nueva?
   - payment_status: "approved"
   - total_amount: (el total que pagaste)
   - customer_info: {"email": "test@vivero.com", ...}

SI NO HAY FILA NUEVA:
  → El webhook no creó la orden correctamente
  → Revisa error en consola npm run dev
```

### **En Historial de Admin:**
```
1. Abre: http://localhost:3000/admin/sales-history
2. ¿Aparece una orden nueva?
   - Con estado "Pago OK · Envío pendiente" (naranja/verde)
   - Con el total que pagaste
   - Con la fecha actual

SI APARECE: ✅ TODO FUNCIONA CORRECTAMENTE
SI NO APARECE: → Revisa Paso 5
```

---

## **🐛 Si Aún No Funciona, Ejecuta el Diagnóstico**

```bash
cd Fronted
npm run debug:webhook

# Copia la salida completa (tendrá checks de dónde está el problema)
```

---

## **🚨 Problemas Comunes**

### **Problema: "URL no encontrada en MP Dashboard"**
```
Solución:
  1. Abre ngrok dashboard: http://localhost:4040
  2. Copia la URL actual (https://...ngrok-free.app)
  3. Ve a MP Dashboard
  4. Cambia la URL en Webhooks por la URL actual de ngrok
  5. Intenta compra de nuevo
```

### **Problema: "Veo el pago en MP pero no aparece orden"**
```
Solución:
  1. Verifica ngrok dashboard muestra POST al webhook (200)
  2. Si solo ves POST a create-preference pero NO webhook:
     → MP no envió notificación
     → Espera 30-60 segundos (a veces tarda)
     → Si sigue sin venir: URL en MP Dashboard está mal
```

### **Problema: "Veo orden en Supabase pero no en historial admin"**
```
Solución:
  1. Verifica que estés logueado como admin (debe decir "Panel Administrador" en navbar)
  2. Presiona F5 para refrescar la página
  3. Espera 2-3 segundos
  4. Abre consola (F12) y revisa si hay errores
```

---

## **✅ Confirmación Final**

Si puedes hacer esto sin errores, TODO FUNCIONA:

```
[ ] 1. Hago compra en /carrito/pago
[ ] 2. Veo POST /api/mercadopago/webhook en ngrok dashboard (200)
[ ] 3. Veo nueva fila en Supabase tabla orders
[ ] 4. Veo orden en /admin/sales-history
[ ] 5. El estado de la orden es "Pago OK"
```

Si todos están tildados: **¡Sistema 100% funcional!**

---

**Si sigues teniendo problemas, comparte:**
- Screenshot de ngrok dashboard (mostrando la URL y los requests)
- Output completo de `npm run debug:webhook`
- Screenshot de Supabase tabla orders
- Error específico de la consola

¡Rápidamente identificaremos el problema!


