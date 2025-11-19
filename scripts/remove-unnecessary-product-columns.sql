-- ❌ ELIMINAR COLUMNAS INNECESARIAS DE LA TABLA PRODUCTS
-- Estas columnas no están en el formulario de creación de productos
-- y están causando problemas en la aplicación

-- Verificar que la tabla existe
\d products;

-- Eliminar las columnas innecesarias una por una
-- Nota: PostgreSQL no permite eliminar múltiples columnas en una sola declaración

-- 1. Eliminar columna 'material'
ALTER TABLE products DROP COLUMN IF EXISTS material;

-- 2. Eliminar columna 'size'  
ALTER TABLE products DROP COLUMN IF EXISTS size;

-- 3. Eliminar columna 'weight'
ALTER TABLE products DROP COLUMN IF EXISTS weight;

-- 4. Eliminar columna 'usage_type' (equivalente a usageType)
ALTER TABLE products DROP COLUMN IF EXISTS usage_type;

-- 5. Eliminar columna 'idea'
ALTER TABLE products DROP COLUMN IF EXISTS idea;

-- 6. Eliminar columna 'type'
ALTER TABLE products DROP COLUMN IF EXISTS type;

-- 7. Eliminar columna 'usage_form' (equivalente a usageForm)
ALTER TABLE products DROP COLUMN IF EXISTS usage_form;

-- ✅ Verificar la estructura final de la tabla
\d products;

-- 📋 La tabla products ahora debería tener solo estas columnas:
-- - id (uuid, primary key)
-- - name (text)
-- - description (text)
-- - category_id (uuid, foreign key)
-- - price (numeric)
-- - stock (integer)
-- - image (text)
-- - images (text[])
-- - scientific_name (text) - equivalente a scientificName
-- - care (text)
-- - characteristics (text) 
-- - origin (text)
-- - featured (boolean)
-- - created_at (timestamp)
-- - updated_at (timestamp)

-- ✅ CONFIRMAR CAMBIOS
SELECT 'Columnas innecesarias eliminadas exitosamente' as status; 