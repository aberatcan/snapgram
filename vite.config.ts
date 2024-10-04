// https://vitejs.dev/config/

import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

/**
 * Vite configuration for Snapgram project.
 * This configuration sets up the Vite development server with React support,
 * and defines path aliases for easier imports.
 */

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
