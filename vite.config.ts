import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/v1": {
        target: "https://wajunkai.onrender.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
