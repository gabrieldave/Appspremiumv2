/*
  # Sistema de Múltiples Enlaces de Descarga y Límites por Usuario

  1. Nuevas Tablas
    - `mt4_download_links`
      - Almacena múltiples enlaces de descarga para cada versión
      - Cada descarga puede tener varios enlaces (para diferentes computadoras)
    
    - `user_downloads`
      - Rastrea las descargas realizadas por cada usuario
      - Permite controlar límites de descarga por usuario

  2. Modificaciones
    - Agregar campo `download_limit` a `mt4_downloads` para configurar límite por descarga
    - Mantener `file_url` en `mt4_downloads` para compatibilidad (será el enlace principal)
*/

-- Tabla de enlaces de descarga múltiples
CREATE TABLE IF NOT EXISTS mt4_download_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  download_id uuid REFERENCES mt4_downloads(id) ON DELETE CASCADE NOT NULL,
  file_url text NOT NULL,
  label text, -- Etiqueta opcional para identificar el enlace (ej: "Windows 64-bit", "Mac", etc.)
  display_order integer DEFAULT 0, -- Orden de visualización
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de rastreo de descargas por usuario
CREATE TABLE IF NOT EXISTS user_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  download_id uuid REFERENCES mt4_downloads(id) ON DELETE CASCADE NOT NULL,
  download_link_id uuid REFERENCES mt4_download_links(id) ON DELETE SET NULL, -- Enlace específico descargado
  downloaded_at timestamptz DEFAULT now(),
  ip_address text, -- Opcional: para auditoría
  user_agent text, -- Opcional: para auditoría
  UNIQUE(user_id, download_id) -- Un usuario solo puede descargar una vez por versión
);

-- Agregar campo download_limit a mt4_downloads
ALTER TABLE mt4_downloads 
ADD COLUMN IF NOT EXISTS download_limit integer DEFAULT 1; -- Por defecto 1 descarga por usuario

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_mt4_download_links_download_id ON mt4_download_links(download_id);
CREATE INDEX IF NOT EXISTS idx_user_downloads_user_id ON user_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_user_downloads_download_id ON user_downloads(download_id);
CREATE INDEX IF NOT EXISTS idx_user_downloads_user_download ON user_downloads(user_id, download_id);

-- Enable RLS
ALTER TABLE mt4_download_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_downloads ENABLE ROW LEVEL SECURITY;

-- Policies para mt4_download_links
CREATE POLICY "Users can view download links for their products"
  ON mt4_download_links FOR SELECT
  TO authenticated
  USING (
    -- Admin puede ver todo
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
    OR
    -- Usuario puede ver enlaces de descargas de productos asignados
    EXISTS (
      SELECT 1 FROM mt4_downloads
      JOIN user_products ON user_products.product_id = mt4_downloads.product_id
      WHERE mt4_downloads.id = mt4_download_links.download_id
      AND user_products.user_id = auth.uid()
      AND mt4_downloads.is_active = true
    )
    OR
    -- Todos pueden ver enlaces de productos no premium
    EXISTS (
      SELECT 1 FROM mt4_downloads
      JOIN mt4_products ON mt4_products.id = mt4_downloads.product_id
      WHERE mt4_downloads.id = mt4_download_links.download_id
      AND mt4_products.is_premium = false
      AND mt4_downloads.is_active = true
    )
  );

CREATE POLICY "Only admins can manage download links"
  ON mt4_download_links FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policies para user_downloads
CREATE POLICY "Users can view their own download history"
  ON user_downloads FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can insert their own downloads"
  ON user_downloads FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND
    -- Verificar que el usuario tiene acceso al producto
    (
      EXISTS (
        SELECT 1 FROM mt4_downloads
        JOIN user_products ON user_products.product_id = mt4_downloads.product_id
        WHERE mt4_downloads.id = user_downloads.download_id
        AND user_products.user_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM mt4_downloads
        JOIN mt4_products ON mt4_products.id = mt4_downloads.product_id
        WHERE mt4_downloads.id = user_downloads.download_id
        AND mt4_products.is_premium = false
      )
    )
  );

-- Trigger para actualizar updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_mt4_download_links_updated_at'
  ) THEN
    CREATE TRIGGER update_mt4_download_links_updated_at
      BEFORE UPDATE ON mt4_download_links
      FOR EACH ROW
      EXECUTE FUNCTION update_mt4_updated_at();
  END IF;
END $$;

