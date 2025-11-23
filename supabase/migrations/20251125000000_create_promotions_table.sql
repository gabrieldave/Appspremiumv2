/*
  # Create Promotions Table

  1. New Table
    - `promotions`
      - `id` (uuid, primary key)
      - `title` (text) - Título de la promoción
      - `description` (text) - Descripción/texto de la promoción
      - `image_url` (text) - URL de la imagen
      - `video_url` (text, nullable) - URL del video (opcional)
      - `sort_order` (int) - Orden de visualización
      - `is_active` (boolean) - Si está activa o no
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on promotions table
    - Add policies for public read access (todos pueden ver promociones activas)
    - Add policies for admin write access (solo admins pueden crear/editar/eliminar)

  3. Indexes
    - Index on is_active and sort_order for efficient queries
*/

-- Create promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  video_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read active promotions
CREATE POLICY "Promotions are viewable by everyone"
  ON promotions
  FOR SELECT
  USING (is_active = true);

-- Policy: Admins can read all promotions (including inactive)
CREATE POLICY "Admins can read all promotions"
  ON promotions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Only admins can insert promotions
CREATE POLICY "Only admins can insert promotions"
  ON promotions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Only admins can update promotions
CREATE POLICY "Only admins can update promotions"
  ON promotions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Only admins can delete promotions
CREATE POLICY "Only admins can delete promotions"
  ON promotions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_promotions_active_sort 
  ON promotions (is_active, sort_order DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_promotions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_promotions_updated_at
  BEFORE UPDATE ON promotions
  FOR EACH ROW
  EXECUTE FUNCTION update_promotions_updated_at();

-- Create table for social media links
CREATE TABLE IF NOT EXISTS social_media_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL UNIQUE, -- 'facebook', 'instagram', 'twitter', 'youtube', etc.
  url TEXT NOT NULL,
  icon_name TEXT NOT NULL, -- lucide icon name
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE social_media_links ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read active social media links
CREATE POLICY "Social media links are viewable by everyone"
  ON social_media_links
  FOR SELECT
  USING (is_active = true);

-- Policy: Admins can read all social media links
CREATE POLICY "Admins can read all social media links"
  ON social_media_links
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Only admins can manage social media links
CREATE POLICY "Only admins can insert social media links"
  ON social_media_links
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Only admins can update social media links"
  ON social_media_links
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Only admins can delete social media links"
  ON social_media_links
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create index for social media links
CREATE INDEX IF NOT EXISTS idx_social_media_active_sort 
  ON social_media_links (is_active, sort_order ASC);

-- Create function to update social_media_links updated_at timestamp
CREATE OR REPLACE FUNCTION update_social_media_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for social_media_links
CREATE TRIGGER update_social_media_links_updated_at
  BEFORE UPDATE ON social_media_links
  FOR EACH ROW
  EXECUTE FUNCTION update_social_media_links_updated_at();






