import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
    strictPort: false,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifestFilename: 'manifest-v2.json',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        maximumFileSizeToCacheInBytes: 5000000 // Aumentado para 5MB para suportar o bundle principal
      },
      manifest: {
        name: "Worklly",
        short_name: "Worklly",
        description: "Seu trabalho, organizado.",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0ea5e9",
        icons: [
          {
            src: "/icon-192-v2.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/icon-512-v2.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ],
        shortcuts: [
          {
            name: "Novo Serviço",
            short_name: "Serviço",
            description: "Criar uma nova ordem de serviço",
            url: "/services/new",
            icons: [{ "src": "/icon-192-v2.png", "sizes": "192x192" }]
          },
          {
            name: "Agenda",
            short_name: "Agenda",
            description: "Ver compromissos",
            url: "/agenda",
            icons: [{ "src": "/icon-192-v2.png", "sizes": "192x192" }]
          }
        ]
      }
    }),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
