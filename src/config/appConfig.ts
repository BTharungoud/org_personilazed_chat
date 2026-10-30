const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, '')

const getEnvString = (value: string | undefined, fallback: string) =>
  value?.trim() || fallback

const getEnvNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const runtimeConfig = __APP_CONFIG__

export const appConfig = {
  appName: getEnvString(runtimeConfig.APP_NAME, 'Org Per Chat'),
  api: {
    baseUrl: normalizeBaseUrl(
      getEnvString(runtimeConfig.API_BASE_URL, 'https://cf8vd512-8081.euw.devtunnels.ms'),
    ),
    timeoutMs: getEnvNumber(runtimeConfig.API_TIMEOUT_MS, 30000),
    aiTimeoutMs: getEnvNumber(runtimeConfig.API_AI_TIMEOUT_MS, 90000),
    uploadTimeoutMs: getEnvNumber(runtimeConfig.API_UPLOAD_TIMEOUT_MS, 600000),
    jwtToken: getEnvString(runtimeConfig.API_JWT_TOKEN, ''),
  },
  defaults: {
    agentModel: getEnvString(
      runtimeConfig.DEFAULT_AGENT_MODEL,
      'gemini-2.5-flash-lite',
    ),
    organizationId: getEnvNumber(runtimeConfig.DEFAULT_ORGANIZATION_ID, 1),
    userId: 1,
  },
  storageKeys: {
    authToken: 'authToken',
    refreshToken: 'refreshToken',
    userEmail: 'userEmail',
    userId: 'userId',
    userName: 'userName',
    departmentName: 'departmentName',
    roleName: 'roleName',
    isAdmin: 'isAdmin',
  },
} as const
