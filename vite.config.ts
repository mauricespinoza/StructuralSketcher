import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// La app se publica en GitHub Pages bajo https://<usuario>.github.io/StructuralSketcher/,
// así que `base` vale lo mismo en dev, preview y build: el servidor de desarrollo
// sirve en http://localhost:5173/StructuralSketcher/ y no hay rutas rotas al desplegar.
export default defineConfig({
  base: '/StructuralSketcher/',
  plugins: [react()],
  server: { port: 5173, strictPort: true },
});
