import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [react(), svgr()],
  define: {
    global: "globalThis",
    "process.env": {},
  },
  server: {
    proxy: {
      '/api': 'http://localhost:5001',
      '/socket.io': {
        target: 'ws://localhost:5001',
        ws: true,
      },
    },
  },
  build: {
    target: 'es2022',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2022',
    },
  },
});
