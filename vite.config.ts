import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
    // Aumentar el límite de warning a 600 KB (el bundle principal puede ser grande)
    chunkSizeWarningLimit: 600,
  },
});
