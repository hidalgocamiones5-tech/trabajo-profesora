import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Plugin para registrar peticiones en la terminal
const requestLogger = () => ({
  name: 'request-logger',
  configureServer(server: any) {
    server.middlewares.use((req: any, _res: any, next: () => void) => {
      // Ignorar peticiones de hot-reload internas para no saturar
      if (!req.url?.includes('__vite_ping') && !req.url?.includes('@fs')) {
        console.log(`Petición Vite: ${req.method} ${req.url}`);
      }
      next();
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), requestLogger()],
})
