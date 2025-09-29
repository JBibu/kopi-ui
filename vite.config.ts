import { defineConfig } from "vite";
import { coverageConfigDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig(() => ({
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname || ".", "./src"),
    },
  },
  build: {
    outDir: "build",
    chunkSizeWarningLimit: 1000,
  },
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    testTimeout: 10000,
    reporters: [["default", { summary: false }]],
    coverage: {
      exclude: ["**/build/**", ...coverageConfigDefaults.exclude],
    },
  },
  server: {
    port: 3000,
    host: "localhost",
    https: false,
    strictPort: true,
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:51515",
        changeOrigin: true,
        secure: false,
      },
    },
  },
}));
