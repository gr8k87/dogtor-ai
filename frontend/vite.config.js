import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: [
      "localhost",
      ".replit.dev",
      "a309397c-1107-4558-9747-b6617f9917d8-00-ci083a6stxsg.spock.replit.dev",
    ],
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
