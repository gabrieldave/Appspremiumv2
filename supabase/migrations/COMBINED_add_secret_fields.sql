/*
  # Migraciones combinadas: Agregar campos secret_code y secret_notes a premium_apps
  
  Este archivo contiene ambas migraciones para agregar los campos secretos.
  Ejecuta este SQL en el SQL Editor de Supabase Dashboard.
*/

-- Migración 1: Agregar campo secret_code a premium_apps
ALTER TABLE premium_apps 
ADD COLUMN IF NOT EXISTS secret_code text;

-- Migración 2: Agregar campo secret_notes a premium_apps
ALTER TABLE premium_apps 
ADD COLUMN IF NOT EXISTS secret_notes text;







