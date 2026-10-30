/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly APP_NAME?: string
  readonly API_BASE_URL?: string
  readonly API_JWT_TOKEN?: string
  readonly API_TIMEOUT_MS?: string
  readonly API_AI_TIMEOUT_MS?: string
  readonly API_UPLOAD_TIMEOUT_MS?: string
  readonly DEFAULT_AGENT_MODEL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const __APP_CONFIG__: {
  APP_NAME?: string
  API_BASE_URL?: string
  API_JWT_TOKEN?: string
  API_TIMEOUT_MS?: string
  API_AI_TIMEOUT_MS?: string
  API_UPLOAD_TIMEOUT_MS?: string
  DEFAULT_AGENT_MODEL?: string
}
