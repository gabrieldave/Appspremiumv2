/*
  # Insert Initial Social Media Links
  
  Este script inserta los enlaces de redes sociales proporcionados.
  Puedes ejecutarlo después de aplicar la migración de la tabla social_media_links.
*/

-- Insertar enlaces de redes sociales
-- Nota: Los icon_name deben coincidir con los nombres de iconos de lucide-react
-- Iconos disponibles: MessageCircle, Send, Star, Facebook, Twitter, Instagram, Youtube, Linkedin, Share2, etc.

INSERT INTO social_media_links (platform, url, icon_name, sort_order, is_active) VALUES
  ('WhatsApp Soporte', 'https://wa.me/5215645530082', 'MessageCircle', 1, true),
  ('WhatsApp Comunidad', 'https://chat.whatsapp.com/Lryh2qr01r24zLPw3Yojmt?mode=ems_copy_c', 'MessageCircle', 2, true),
  ('Telegram', 'https://t.me/todoss0mostr4ders', 'Send', 3, true),
  ('Trustpilot', 'https://es.trustpilot.com/review/tradingsinperdidas.com', 'Star', 4, true),
  ('Facebook Página', 'https://www.facebook.com/share/1Jq9XMZ6xN/', 'Facebook', 5, true),
  ('Facebook', 'https://www.facebook.com/share/14N3qgheG1U/', 'Facebook', 6, true),
  ('X (Twitter)', 'https://x.com/todoss0mostr4dr?t=Bg2Cq-mbev0HsZm0_CyzFg&s=09', 'Twitter', 7, true),
  ('Instagram', 'https://www.instagram.com/todoss0mostr4ders?igsh=eDJtZTkzZHVodWp0', 'Instagram', 8, true),
  ('YouTube', 'https://www.youtube.com/@todossomostraders', 'Youtube', 9, true),
  ('TikTok', 'https://www.tiktok.com/@todossomostraders0?_t=ZS-90TOLp5oE53&_r=1', 'Share2', 10, true),
  ('Threads', 'https://www.threads.com/@todoss0mostr4ders', 'Share2', 11, true),
  ('LinkedIn', 'https://www.linkedin.com/in/david-del-rio-93512538a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app', 'Linkedin', 12, true)
ON CONFLICT (platform) DO UPDATE SET
  url = EXCLUDED.url,
  icon_name = EXCLUDED.icon_name,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

