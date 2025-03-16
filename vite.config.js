import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
        output: {
            format: 'cjs', // Ensuring compatibility with Electron
        },
    },
    outDir: 'dist',
},
})
