# Instrucciones para corregir el error de Mercado Pago

Este documento explica cómo corregir el error `Could not find the 'customer_email' column of 'orders'` que ocurre al intentar crear una orden de pago con Mercado Pago.

## Problema identificado

El error ocurre porque la tabla `orders` en la base de datos no tiene el campo `customer_email` que es requerido por el servicio de Mercado Pago. Este campo es necesario para identificar al cliente que realiza el pedido.

## Solución

Hemos creado un script SQL que agrega los campos necesarios a la tabla `orders`:
- `customer_email`: Email del cliente
- `customer_name`: Nombre del cliente
- `customer_phone`: Teléfono del cliente

### Pasos para aplicar la corrección:

1. **Ejecutar el script SQL**

   Accede al panel de administración de Supabase y ejecuta el script SQL ubicado en:
   ```
   Fronted/scripts/add-customer-email-field.sql
   ```

2. **Verificar la estructura de la tabla**

   Después de ejecutar el script, verifica que los campos se hayan agregado correctamente ejecutando la siguiente consulta SQL en Supabase:
   ```sql
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns 
   WHERE table_name = 'orders' 
     AND column_name IN ('customer_email', 'customer_name', 'customer_phone')
   ORDER BY column_name;
   ```

3. **Reiniciar la aplicación**

   Una vez aplicados los cambios en la base de datos, reinicia la aplicación para que los cambios surtan efecto:
   ```
   npm run dev
   ```

## Verificación

Para verificar que la corrección funciona correctamente:

1. Intenta realizar un pago con Mercado Pago desde la aplicación
2. Verifica que no aparezca el error `Could not find the 'customer_email' column of 'orders'`
3. Confirma que la orden se crea correctamente en la base de datos

## Notas adicionales

- El script también migra automáticamente los datos desde el campo `customer_info` (si existe) hacia los nuevos campos
- Se crean índices para optimizar las búsquedas por email y nombre del cliente
- No es necesario modificar el código TypeScript ya que los modelos ya incluyen estos campos

Si persisten los problemas después de aplicar esta corrección, revisa los logs de la aplicación para identificar posibles errores adicionales.