import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@app": path.resolve(__dirname, "./src/app"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@features": path.resolve(__dirname, "./src/features"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@contexts": path.resolve(__dirname, "./src/contexts"),
      "@ui": path.resolve(__dirname, "./src/ui"),
      "@lib": path.resolve(__dirname, "./src/lib"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@pages": path.resolve(__dirname, "./src/pages")
    }
  },
}));