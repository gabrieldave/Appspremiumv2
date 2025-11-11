/*
  # Sistema de Clasificación de Productos MT4

  1. Nuevas Tablas
    - `mt4_products`
      - `id` (uuid, primary key)
      - `name` (text) - Nombre del producto (ej: "Alpha Strategy", "Alpha Lite")
      - `code` (text, unique) - Código único (ej: "alpha_strategy", "alpha_lite")
      - `description` (text) - Descripción del producto
      - `is_premium` (boolean) - Si es producto premium o no
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `mt4_downloads`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key) - Referencia a mt4_products
      - `version_name` (text) - Nombre de la versión (ej: "Versión 2.0 Alpha Strategy")
      - `version_number` (text) - Número de versión (ej: "2.0")
      - `file_url` (text) - URL del archivo para descargar
      - `file_size` (text) - Tamaño del archivo (ej: "9.17 MB")
      - `release_date` (date) - Fecha de lanzamiento
      - `release_notes` (text) - Novedades de la versión
      - `is_active` (boolean) - Si está disponible para descarga
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `user_products`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key) - Referencia a auth.users
      - `product_id` (uuid, foreign key) - Referencia a mt4_products
      - `assigned_at` (timestamptz) - Cuando se asignó
      - `assigned_by` (uuid) - Admin que asignó
      - `notes` (text) - Notas opcionales
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Seguridad
    - Enable RLS en todas las tablas
    - Los usuarios pueden ver sus productos asignados
    - Los usuarios pueden ver descargas basadas en sus productos
    - Solo admins pueden asignar productos
    - Solo admins pueden gestionar productos y descargas

  3. Datos Iniciales
    - Insertar productos base: Alpha Strategy y Alpha Lite
*/

-- Tabla de productos MT4
CREATE TABLE IF NOT EXISTS mt4_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  is_premium boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de descargas MT4
CREATE TABLE IF NOT EXISTS mt4_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES mt4_products(id) ON DELETE CASCADE NOT NULL,
  version_name text NOT NULL,
  version_number text NOT NULL,
  file_url text NOT NULL,
  file_size text,
  release_date date DEFAULT CURRENT_DATE,
  release_notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de asignación de productos a usuarios
CREATE TABLE IF NOT EXISTS user_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES mt4_products(id) ON DELETE CASCADE NOT NULL,
  assigned_at timestamptz DEFAULT now(),
  assigned_by uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_mt4_downloads_product_id ON mt4_downloads(product_id);
CREATE INDEX IF NOT EXISTS idx_user_products_user_id ON user_products(user_id);
CREATE INDEX IF NOT EXISTS idx_user_products_product_id ON user_products(product_id);

-- Enable RLS
ALTER TABLE mt4_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE mt4_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_products ENABLE ROW LEVEL SECURITY;

-- Policies para mt4_products
CREATE POLICY "Anyone can view products"
  ON mt4_products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage products"
  ON mt4_products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policies para mt4_downloads
CREATE POLICY "Users can view downloads for their products"
  ON mt4_downloads FOR SELECT
  TO authenticated
  USING (
    is_active = true AND (
      -- Admin puede ver todo
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
      )
      OR
      -- Usuario puede ver descargas de productos asignados
      EXISTS (
        SELECT 1 FROM user_products
        WHERE user_products.user_id = auth.uid()
        AND user_products.product_id = mt4_downloads.product_id
      )
      OR
      -- Todos pueden ver versiones Lite (no premium)
      EXISTS (
        SELECT 1 FROM mt4_products
        WHERE mt4_products.id = mt4_downloads.product_id
        AND mt4_products.is_premium = false
      )
    )
  );

CREATE POLICY "Only admins can manage downloads"
  ON mt4_downloads FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policies para user_products
CREATE POLICY "Users can view their assigned products"
  ON user_products FOR SELECT
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

CREATE POLICY "Only admins can assign products"
  ON user_products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Only admins can update product assignments"
  ON user_products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Only admins can delete product assignments"
  ON user_products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Insertar productos base
INSERT INTO mt4_products (name, code, description, is_premium) VALUES
  ('Alpha Strategy', 'alpha_strategy', 'Producto premium con todas las funcionalidades avanzadas', true),
  ('Alpha Lite', 'alpha_lite', 'Versión básica gratuita para todos los suscriptores', false)
ON CONFLICT (code) DO NOTHING;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_mt4_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_mt4_products_updated_at'
  ) THEN
    CREATE TRIGGER update_mt4_products_updated_at
      BEFORE UPDATE ON mt4_products
      FOR EACH ROW
      EXECUTE FUNCTION update_mt4_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_mt4_downloads_updated_at'
  ) THEN
    CREATE TRIGGER update_mt4_downloads_updated_at
      BEFORE UPDATE ON mt4_downloads
      FOR EACH ROW
      EXECUTE FUNCTION update_mt4_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_products_updated_at'
  ) THEN
    CREATE TRIGGER update_user_products_updated_at
      BEFORE UPDATE ON user_products
      FOR EACH ROW
      EXECUTE FUNCTION update_mt4_updated_at();
  END IF;
END $$;