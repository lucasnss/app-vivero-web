# ⚡ Quick Start - Probar el Flujo de Datos del Cliente

## 🚀 3 Pasos para Probar

### Paso 1: Asegurar que el servidor está corriendo

```bash
# Terminal 1 - En la raíz del proyecto
npm run dev
```

**Espera ver:**
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

---

### Paso 2: Ejecutar el script de prueba

```bash
# Terminal 2 - En la carpeta Fronted
cd Fronted
node scripts/test-customer-data-flow.js
```

---

### Paso 3: Verificar los resultados

**Si ves esto:** ✅ TODO ESTÁ BIEN

```
📊 RESUMEN DE PRUEBAS
✅ Pruebas Pasadas: 15
❌ Pruebas Fallidas: 0
📈 Tasa de Éxito: 100% (15/15)

🎉 ¡TODAS LAS PRUEBAS PASARON!
```

**Si hay errores:** ❌ Revisa los detalles del error arriba

---

## 📊 ¿Qué Valida el Script?

✅ Los datos del cliente se guardan COMPLETAMENTE  
✅ Dirección con calle, número, ciudad, provincia, CP, info adicional  
✅ Método de envío (entrega o retiro)  
✅ Timestamp de captura  
✅ Compatible con cuenta test de Mercado Pago  

---

## 💡 Si Algo Falla

### Error: "Connection refused"
```bash
# Asegúrate que:
# 1. npm run dev está ejecutándose en otra terminal
# 2. Puerto 3000 no está siendo usado
lsof -i :3000
```

### Error: "customer_info no existe"
```bash
# Verifica que los cambios se guardaron
grep -n "captured_at" Fronted/src/services/orderService.ts
# Debe mostrar la línea con captured_at
```

### Error: "Dirección incorrecto"
```bash
# Verifica que el flujo pasa la dirección correctamente
grep -n "shipping_address" Fronted/src/hooks/useCheckoutMP.ts
```

---

## 📝 Para Más Detalles

- 📖 Revisa: `Fronted/GUIA-PRUEBA-CUSTOMER-DATA.md`
- 📖 Revisa: `Fronted/scripts/README-TEST-SCRIPTS.md`
- 📖 Revisa: `CHANGELOG.md` (entrada 13 Noviembre)

---

## ✅ Checklist Rápido

```
[ ] npm run dev ejecutándose (Terminal 1)
[ ] Ejecuté: node scripts/test-customer-data-flow.js (Terminal 2)
[ ] 100% de pruebas pasaron
[ ] No hay errores en rojo
[ ] customer_info contiene todos los campos
```

---

¡Listo! El flujo está funcionando correctamente. 🎉

