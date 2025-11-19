# ⚡ **ACCIÓN INMEDIATA: Verificar por Qué No Aparecen las Compras**

## **Tu Situación**
- ✅ Haces compra en Mercado Pago
- ✅ Tarjetas TEST funcionan (4500000000000000)
- ❌ Órdenes NO aparecen en `/admin/sales-history`
- ❌ Historial vacío

---

## **Verifica Esto AHORA (5 minutos)**

### **1. ¿Ngrok Está Activo?**
```bash
Abre en navegador: http://localhost:4040

✅ Si ves "Online" con URL verde (https://...ngrok-free.app):
   → Ngrok funciona, continúa

❌ Si no ves nada o dice "Offline":
   → Abre terminal y ejecuta:
   $ ngrok http 3000
   
   → Espera a ver "Forwarding https://..." 
   → Déjalo corriendo
```

### **2. ¿MP Dashboard Tiene la URL Correcta?**
```
1. Abre: https://www.mercadopago.com.ar/developers/panel
2. Aplicación → Integración → Webhooks
3. Busca la URL, debe ser:
   https://[TU-URL-NGROK]/api/mercadopago/webhook
   
   Ejemplo: https://f9c5a233dcaa.ngrok-free.app/api/mercadopago/webhook

✅ Si está ahí en VERDE con checkmark:
   → Configuración correcta

❌ Si no está, o está distinto:
   → Copia URL de ngrok dashboard (http://localhost:4040)
   → Cambia la URL en MP Dashboard
   → Guarda
   → Confirma que aparece en VERDE
```

### **3. Haz UNA Compra de Prueba**
```
1. http://localhost:3000/carrito
2. Agrega un producto
3. Checkout → llena formulario
4. "Pagar con Mercado Pago"
5. Tarjeta: 4500000000000000
6. Cualquier fecha futura (ej: 01/29)
7. CVC: 123
8. Click "Pagar"
```

### **4. Mientras se Procesa, Monitorea Esto**

**En ngrok dashboard (http://localhost:4040):**
- ¿Ves POST `/api/mercadopago/webhook` con status 200?
  - ✅ SÍ → El webhook llega, el problema es otro
  - ❌ NO → El webhook NO llega, revisa URL en MP Dashboard

**En Supabase (tabla orders):**
- ¿Aparece una fila nueva con payment_status = "approved"?
  - ✅ SÍ → Orden se creó, problema en frontend
  - ❌ NO → El webhook no creó la orden

**En Historial Admin:**
- http://localhost:3000/admin/sales-history
- ¿Aparece la orden?
  - ✅ SÍ → ¡TODO FUNCIONA!
  - ❌ NO → Continúa abajo

---

## **Si Aún No Funciona: Ejecuta Diagnóstico Automático**

```bash
cd Fronted
npm run debug:webhook

# Copia toda la salida
```

Esto te dirá EXACTAMENTE dónde está el problema:
- Servidor activo ✓/✗
- ngrok activo ✓/✗
- Órdenes en BD ✓/✗
- Datos temporales guardados ✓/✗
- Webhooks procesados ✓/✗

---

## **Problema 99% de las Veces**

```
❌ URL EN MP DASHBOARD ESTÁ DESACTUALIZADA

Causa: ngrok reinicia = URL nueva cada vez
Solución: 
  1. Copia URL actual de ngrok dashboard (http://localhost:4040)
  2. Cámbiala en MP Dashboard > Webhooks
  3. Guarda y confirma VERDE
  4. Haz compra de nuevo
```

---

## **Checklist Final**

- [ ] ngrok running y visible en localhost:4040
- [ ] URL en MP Dashboard es la actual de ngrok
- [ ] MP Dashboard muestra URL en VERDE
- [ ] Completé checkout real
- [ ] Veo POST /webhook en ngrok dashboard (200)
- [ ] Veo orden en Supabase tabla orders
- [ ] Veo orden en /admin/sales-history

Si todos ✅: **¡Sistema funcionando 100%!**

---

## **Si Necesitas Ayuda**

Comparte:
1. Output completo de: `npm run debug:webhook`
2. Screenshot de ngrok dashboard (URL y requests)
3. Screenshot de MP Dashboard > Webhooks (URL configurada)
4. Error de consola (npm run dev) si lo hay

¡Rápidamente identificaremos el problema!

---

**Última actualización: 03 Noviembre 2025**

