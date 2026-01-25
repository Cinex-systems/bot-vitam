import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// Recréation de __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 👇 C'EST LA LIGNE QUI MANQUAIT ! 👇
      "@": path.resolve(__dirname, "./src"),
      
      // La correction pour React qu'on avait déjà faite
      react: path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    },
  },
  optimizeDeps: {
    include: ['react-markdown', 'react', 'react-dom', 'tailwindcss-animate'],
  },
  build: {
    chunkSizeWarningLimit: 1600,
  }
});
