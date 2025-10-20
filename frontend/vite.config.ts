import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: [
      "73dc18552c43.ngrok-free.app",
      "eb4b35159fb3.ngrok-free.app",
    ],
    port: 5173,
  },
});
