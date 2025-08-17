import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: "all",
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  define: {
    // PWA support
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
});
