import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:5000",
      "/temperature": "http://localhost:5000",
      "/humidity": "http://localhost:5000",
      "/reading": "http://localhost:5000",
      "/video_feed": "http://localhost:5000",
      "/snapshot": "http://localhost:5000",
      "/detection": "http://localhost:5000",
      "/health": "http://localhost:5000",
    },
  },
})
