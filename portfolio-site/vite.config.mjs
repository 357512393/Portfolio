import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Clean History API routes such as /Photo/40 must keep every script and
  // image rooted at the domain instead of resolving under /Photo/assets/.
  base: "/",
  build: {
    outDir: "dist/client",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) return "react-vendor";
          if (id.includes("node_modules/gsap")) return "gsap-vendor";
          if (id.includes("node_modules/ogl")) return "ogl-vendor";
          return undefined;
        },
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react()],
});
