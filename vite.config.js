import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path disesuaikan dengan nama repositori GitHub
export default defineConfig({
  plugins: [react()],
  base: '/ksp-modern/',
})
