# Instrucciones para corregir errores de Mercado Pago (Actualizado)

Este documento explica cómo corregir los errores encontrados al intentar crear una orden de pago con Mercado Pago.

## Problemas identificados

Se han identificado dos errores principales:

1. **Error 1**: `Could not find the 'customer_email' column of 'orders'`
   - La tabla `orders` no tiene el campo `customer_email` requerido por el servicio.

2. **Error 2**: `null value in column "customer_info" of relation "orders" violates not-null constraint`
   - La columna `customer_info` tiene una restricción NOT NULL pero no se está proporcionando un valor.

## Solución

Hemos creado dos scripts SQL para resolver estos problemas:

### 1. Agregar campos de cliente

El primer script (`add-customer-email-field.sql`) agrega los campos necesarios:
- `customer_email`: Email del cliente
- `customer_name`: Nombre del cliente
- `customer_phone`: Teléfono del cliente

### 2. Modificar restricción de customer_info

El segundo script (`update-customer-info-constraint.sql`) modifica la restricción de `customer_info`:
- Elimina la restricción NOT NULL
- Establece un valor por defecto como objeto JSON vacío `{}`
- Actualiza registros existentes con NULL

### 3. Actualización del código

También se ha actualizado el servicio `orderService.ts` para incluir un objeto vacío en `customer_info` al crear órdenes.

## Pasos para aplicar la corrección:

1. **Ejecutar los scripts SQL**

   Accede al panel de administración de Supabase y ejecuta los siguientes scripts SQL en orden:
   
   ```
   Fronted/scripts/add-customer-email-field.sql
   Fronted/scripts/update-customer-info-constraint.sql
   ```

2. **Verificar la estructura de la tabla**

   Después de ejecutar los scripts, verifica que los cambios se hayan aplicado correctamente ejecutando:
   
   ```sql
   SELECT column_name, data_type, is_nullable, column_default
   FROM information_schema.columns 
   WHERE table_name = 'orders' 
     AND column_name IN ('customer_email', 'customer_name', 'customer_phone', 'customer_info')
   ORDER BY column_name;
   ```

3. **Reiniciar la aplicación**

   Una vez aplicados los cambios en la base de datos, reinicia la aplicación:
   ```
   npm run dev
   ```

## Verificación

Para verificar que la corrección funciona correctamente:

1. Intenta realizar un pago con Mercado Pago desde la aplicación
2. Verifica que no aparezcan los errores mencionados
3. Confirma que la orden se crea correctamente en la base de datos

## Notas adicionales

- Si persisten los problemas después de aplicar esta corrección, revisa los logs de la aplicación para identificar posibles errores adicionales.
- Es recomendable hacer una copia de seguridad de la base de datos antes de ejecutar los scripts.
- Estos cambios son compatibles con la estructura existente y no afectan a las funcionalidades ya implementadas.