import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages project site serves from /oscilloscope/, not /.
  base: command === 'build' ? '/oscilloscope/' : '/',
  plugins: [react()],
}))
