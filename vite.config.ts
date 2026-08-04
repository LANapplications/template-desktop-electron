import { defineConfig, loadEnv } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Config del proceso MAIN que se "hornea" en el bundle en tiempo de build. En
// dev sale del archivo .env; en el build de CI, de las Variables del repo (ver
// .github/workflows/release.yml). No son secretos: en una app nativa con PKCE
// el client_id/domain/audience son públicos.
const MAIN_ENV_KEYS = [
  'API_URL',
  'AUTH0_DOMAIN',
  'AUTH0_CLIENT_ID',
  'AUTH0_AUDIENCE',
  'AUTH0_SCOPE',
  'AUTH0_PROMPT',
  'AUTH0_CALLBACK_URL',
]

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Reemplaza cada `process.env.X` del main por su valor literal.
  const mainDefine = Object.fromEntries(
    MAIN_ENV_KEYS.map((key) => {
      const value = process.env[key] ?? env[key]
      return [
        `process.env.${key}`,
        value !== undefined ? JSON.stringify(value) : 'undefined',
      ]
    }),
  )

  return {
    plugins: [
      react(),
      tailwindcss(),
      electron({
        main: {
          entry: 'electron/main.ts',
          // define solo en el build del MAIN (no en el renderer).
          vite: { define: mainDefine },
        },

        preload: {
          input: path.join(__dirname, 'electron/preload.ts'),
        },
        renderer: process.env.NODE_ENV === 'test'
          // https://github.com/electron-vite/vite-plugin-electron-renderer/issues/78#issuecomment-2053600808
          ? undefined
          : {},
      }),
    ],
  }
})
