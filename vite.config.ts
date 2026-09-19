import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), "");
  const authorizationHeaders = environment.SYSTEM_ONE_API_KEY
    ? { Authorization: `Bearer ${environment.SYSTEM_ONE_API_KEY}` }
    : undefined;

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api": {
          target: "https://api.typesafe.ai",
          changeOrigin: true,
          headers: authorizationHeaders,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
