import type { AuthSession } from '../types/api'

const getObjectValue = (value: unknown, keys: string[]) => {
  if (!value || typeof value !== 'object') return undefined
  const record = value as Record<string, unknown>

  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) {
      return record[key]
    }
  }

  return undefined
}

export const extractMessage = (value: unknown, fallback = 'Request completed.') => {
  if (typeof value === 'string' && value.trim()) return value
  const maybeMessage =
    getObjectValue(value, ['message', 'msg', 'statusMessage', 'detail', 'data']) ??
    getObjectValue(getObjectValue(value, ['data', 'result', 'payload']), [
      'message',
      'msg',
      'statusMessage',
      'detail',
      'data',
    ])
  return typeof maybeMessage === 'string' && maybeMessage.trim()
    ? maybeMessage
    : fallback
}

export const extractList = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[]
  if (!value || typeof value !== 'object') return []

  const record = value as Record<string, unknown>
  const candidates = [record.data, record.items, record.results, record.content]

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate as T[]
    }

    if (candidate && typeof candidate === 'object') {
      const nested = extractList<T>(candidate)
      if (nested.length > 0) {
        return nested
      }
    }
  }

  return []
}

export const extractNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export const extractAuthSession = (value: unknown): AuthSession => {
  const responseContainer = getObjectValue(value, ['data', 'result', 'payload'])
  const tokenValue =
    getObjectValue(value, ['token', 'accessToken', 'jwt']) ??
    getObjectValue(responseContainer, ['token', 'accessToken', 'jwt'])
  const refreshTokenValue =
    getObjectValue(value, ['refreshToken']) ??
    getObjectValue(responseContainer, ['refreshToken'])
  const userValue =
    getObjectValue(value, ['user', 'profile', 'account']) ??
    getObjectValue(responseContainer, ['user', 'profile', 'account'])
  const resolvedUserName = getObjectValue(userValue, ['username', 'name', 'fullName'])
  const resolvedUserEmail = getObjectValue(userValue, ['email'])
  const resolvedDepartmentName = getObjectValue(
    responseContainer ?? value,
    ['departmentName'],
  )
  const resolvedRoleName = getObjectValue(responseContainer ?? value, ['roleName'])
  const resolvedTokenType = getObjectValue(
    responseContainer ?? value,
    ['tokenType', 'type'],
  )
  const resolvedExpiresIn = getObjectValue(
    responseContainer ?? value,
    ['expiresIn', 'expiresAt'],
  )
  const resolvedIsAdmin = getObjectValue(responseContainer ?? value, ['isAdmin'])

  return {
    token: typeof tokenValue === 'string' ? tokenValue : '',
    userId: extractNumber(
      getObjectValue(userValue, ['id', 'userId']) ??
        getObjectValue(responseContainer, ['userId', 'id']) ??
        getObjectValue(value, ['userId', 'id']),
      1,
    ),
    userName: typeof resolvedUserName === 'string' ? String(resolvedUserName) : undefined,
    userEmail: typeof resolvedUserEmail === 'string' ? String(resolvedUserEmail) : undefined,
    refreshToken:
      typeof refreshTokenValue === 'string' ? String(refreshTokenValue) : undefined,
    tokenType: typeof resolvedTokenType === 'string' ? String(resolvedTokenType) : undefined,
    expiresIn:
      typeof resolvedExpiresIn === 'number' ? resolvedExpiresIn : extractNumber(resolvedExpiresIn, 0),
    isAdmin: typeof resolvedIsAdmin === 'boolean' ? resolvedIsAdmin : undefined,
    departmentName:
      typeof resolvedDepartmentName === 'string' ? String(resolvedDepartmentName) : undefined,
    roleName: typeof resolvedRoleName === 'string' ? String(resolvedRoleName) : undefined,
  }
}

export const extractModelText = (value: unknown, fallback = '') => {
  if (typeof value === 'string') return value
  const maybeText = getObjectValue(value, ['reply', 'response', 'text', 'output', 'message'])
  return typeof maybeText === 'string' ? maybeText : fallback
}
