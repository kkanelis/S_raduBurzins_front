
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'VITE_')
  const apiTarget = env.VITE_API_PROXY_TARGET || 'https://api.raduburzins.lv'

  return {
    plugins: [
      react(),
      VitePWA({
        injectRegister: null,
        registerType: 'autoUpdate',

        devOptions: {
          enabled: true,
        },

        includeAssets: ['icons/rb-icon.svg', 'icons/rb-icon-180.png'],

        manifest: {
          id: '/',
          name: 'Radu Burziņš',
          short_name: 'Radu Burziņš',
          description: 'Tava ģimene. Vienuviet.',
          lang: 'lv',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          background_color: '#f1f0ea',
          theme_color: '#302832',

          icons: [
            {
              src: '/icons/rb-icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/icons/rb-icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
          ],
        },

        workbox: {
          importScripts: ['/push-sw.js'],
          navigateFallbackDenylist: [/^\/api\//, /^\/broadcasting\//],
        },
      }),
    ],

    server: {
      host: '127.0.0.1',
      port: 5173,
      hmr: {
        host: '127.0.0.1',
        clientPort: 5173,
      },
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/broadcasting/auth': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },

    test: {
      environment: 'jsdom',
    },
  }
})
