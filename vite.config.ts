import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'image.png'],
      manifest: {
        name: 'Todos Somos Traders - Portal Premium',
        short_name: 'TST Premium',
        description: 'Portal premium de aplicaciones y herramientas para traders',
        theme_color: '#0ea5e9',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'https://pezisfaeecgjdguneuip.supabase.co/storage/v1/object/sign/icon/Analytics%20Mt4.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMGE4OTE1Ni0zMjNjLTRlNmEtYWRkMi01MDE0NTU5MDNhYjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpY29uL0FuYWx5dGljcyBNdDQucG5nIiwiaWF0IjoxNzYzNjcxMzMwLCJleHAiOjE3OTUyMDczMzB9.RgEQ27v8RUhcBMI2eHkKsJuSmxajgtgkwToeZKc96CI',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'https://pezisfaeecgjdguneuip.supabase.co/storage/v1/object/sign/icon/Analytics%20Mt4.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMGE4OTE1Ni0zMjNjLTRlNmEtYWRkMi01MDE0NTU5MDNhYjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpY29uL0FuYWx5dGljcyBNdDQucG5nIiwiaWF0IjoxNzYzNjcxMzMwLCJleHAiOjE3OTUyMDczMzB9.RgEQ27v8RUhcBMI2eHkKsJuSmxajgtgkwToeZKc96CI',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 horas
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 año
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar React y React DOM en su propio chunk
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Separar Supabase en su propio chunk
          'supabase-vendor': ['@supabase/supabase-js'],
          // Separar iconos (lucide-react) en su propio chunk
          'icons-vendor': ['lucide-react'],
        },
      },
    },
    // Aumentar el límite de warning a 1000 KB para evitar warnings innecesarios
    chunkSizeWarningLimit: 1000,
  },
});
