import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === "pagina-unica" ? [viteSingleFile()] : [])],
  build: mode === "pagina-unica" ? { outDir: "dist-pagina-unica" } : {},
  resolve: {
    alias: {
      "@engine": fileURLToPath(new URL("../../packages/engine/src/index.ts", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
}));
