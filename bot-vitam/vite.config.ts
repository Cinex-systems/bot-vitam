import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// ---------------------------------------------------------
// RECRÉATION DE __dirname (Obligatoire en "type": "module")
// ---------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Maintenant ça va marcher sur Vercel !
      react: path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    },
  },
  optimizeDeps: {
    include: ['react-markdown', 'react', 'react-dom'],
  },
  build: {
    // Petit bonus : augmente la limite de mémoire au cas où
    chunkSizeWarningLimit: 1600,
  }
});

