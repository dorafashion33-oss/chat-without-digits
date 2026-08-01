import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: null,
      filename: "sw.js",
      devOptions: { enabled: false },
      includeAssets: ["buzz-icon-192.png", "buzz-icon-512.png", "favicon.ico"],
      manifest: {
        name: "Buzz",
        short_name: "Buzz",
        description: "Chat Without Phone Numbers",
        start_url: "/",
        display: "standalone",
        background_color: "#0a0a1a",
        theme_color: "#7c3aed",
        icons: [
          { src: "/buzz-icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/buzz-icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,jpg,jpeg,svg,webp,woff2}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/~oauth/],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "buzz-html",
              networkTimeoutSeconds: 3,
            },
          },
          {
            urlPattern: ({ url, request, sameOrigin }) =>
              !!sameOrigin && ["style", "script", "image", "font"].includes(request.destination) && !!url,
            handler: "CacheFirst",
            options: {
              cacheName: "buzz-assets",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
