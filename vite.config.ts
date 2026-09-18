import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// La app se sirve bajo una subruta en GitHub Pages, así que `base` vale lo mismo
// en dev, preview y build (el dev server queda en /StructuralSketcher/ y no hay
// rutas rotas al desplegar). VITE_BASE permite publicarla bajo otra subruta,
// por ejemplo dentro del sitio de ClaudeCoding.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/StructuralSketcher/',
  plugins: [react()],
  server: { port: 5173, strictPort: true },
});
