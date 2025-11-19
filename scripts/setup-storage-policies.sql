-- Script para configurar políticas de storage en Supabase
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Crear el bucket si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- 2. Política para permitir inserción de archivos (subida)
CREATE POLICY "Allow public uploads to product-images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' AND
  (storage.foldername(name))[1] = 'products'
);

-- 3. Política para permitir lectura de archivos (acceso público)
CREATE POLICY "Allow public reads from product-images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'product-images'
);

-- 4. Política para permitir actualización de archivos
CREATE POLICY "Allow public updates to product-images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images' AND
  (storage.foldername(name))[1] = 'products'
);

-- 5. Política para permitir eliminación de archivos
CREATE POLICY "Allow public deletes from product-images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' AND
  (storage.foldername(name))[1] = 'products'
);

-- 6. Verificar que las políticas se crearon correctamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 7. Verificar que el bucket existe
SELECT * FROM storage.buckets WHERE id = 'product-images';