import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react-dom")) return "react-dom";
          if (id.includes("node_modules/react/") || id.includes("node_modules\\react\\")) return "react";
          if (id.includes("framer-motion")) return "motion";
          if (id.includes("react-helmet-async")) return "helmet";
        },
      },
    },
    chunkSizeWarningLimit: 550,
  },
});
