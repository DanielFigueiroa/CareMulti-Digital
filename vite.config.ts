import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_ACTIONS === 'true' ? '/CareMulti-Digital/' : '/',
  plugins: [react(), tailwindcss()],
  build: {
    // Os painéis já viram pedaços próprios via `React.lazy` em `App.tsx`.
    // Não usamos `manualChunks`: medindo o projeto, separar os vendors deixou o
    // download inicial maior (77,6 KB gzip contra 70,4 KB) porque a divisão
    // impede parte da deduplicação entre pedaços. O ganho de cache não compensa
    // nesse tamanho de aplicação.
  },
})
