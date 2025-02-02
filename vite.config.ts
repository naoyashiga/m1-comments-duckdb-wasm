import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/m1-comments-duckdb-wasm/',
  plugins: [react()],
})
