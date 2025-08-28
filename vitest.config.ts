/// <reference types="vitest" />
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/postcss";
import path from "path";

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    globals: true,
  },
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./")
    }
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss,
      ]
    }
  }
})