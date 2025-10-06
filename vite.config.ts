import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    hmr: {
      host: 'campus-connect-1-vwmy.onrender.com',
      protocol: 'wss',
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
