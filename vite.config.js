import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/ksp-modern/', // Ganti sesuai nama repository GitHub Anda
})
