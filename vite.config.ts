import nodeCrypto from 'node:crypto'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const ensureWebCrypto = () => {
  const existingCrypto = globalThis.crypto as Crypto | undefined
  if (existingCrypto && typeof existingCrypto.getRandomValues === 'function') {
    return
  }

  const polyfilledCrypto = {
    getRandomValues: <T extends ArrayBufferView | null>(array: T) => {
      if (array) {
        nodeCrypto.randomFillSync(array)
      }
      return array
    },
    randomUUID:
      typeof nodeCrypto.randomUUID === 'function'
        ? nodeCrypto.randomUUID.bind(nodeCrypto)
        : undefined,
    subtle: nodeCrypto.webcrypto?.subtle,
  } as Crypto

  ;(globalThis as typeof globalThis & { crypto: Crypto }).crypto = polyfilledCrypto
}

ensureWebCrypto()

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const runtimeConfig = {
    APP_NAME: env.APP_NAME || 'Org Per Chat',
    API_BASE_URL: env.API_BASE_URL || 'https://cf8vd512-8081.euw.devtunnels.ms',
    API_JWT_TOKEN: env.API_JWT_TOKEN || '',
    API_TIMEOUT_MS: env.API_TIMEOUT_MS || '30000',
    API_AI_TIMEOUT_MS: env.API_AI_TIMEOUT_MS || '90000',
    API_UPLOAD_TIMEOUT_MS: env.API_UPLOAD_TIMEOUT_MS || '600000',
    DEFAULT_AGENT_MODEL: env.DEFAULT_AGENT_MODEL || 'gemini-2.5-flash-lite',
    DEFAULT_ORGANIZATION_ID: env.DEFAULT_ORGANIZATION_ID || '1',
  }

  return {
    plugins: [react()],
    define: {
      __APP_CONFIG__: JSON.stringify(runtimeConfig),
    },
    server: {
      port: 5173,
    },
  }
})
