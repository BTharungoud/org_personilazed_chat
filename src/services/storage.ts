import { appConfig } from '../config/appConfig'
import type { AuthSession } from '../types/api'

const isBrowser = typeof window !== 'undefined'

export const getStoredAuthToken = () => {
  if (!isBrowser) return appConfig.api.jwtToken
  return (
    window.localStorage.getItem(appConfig.storageKeys.authToken) ||
    appConfig.api.jwtToken
  )
}

export const isAuthenticated = () => {
  if (!isBrowser) return false
  return Boolean(window.localStorage.getItem(appConfig.storageKeys.authToken))
}

export const getStoredUserId = () => {
  if (!isBrowser) return appConfig.defaults.userId
  const raw = window.localStorage.getItem(appConfig.storageKeys.userId)
  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : appConfig.defaults.userId
}

export const persistAuthSession = (session: AuthSession) => {
  if (!isBrowser) return
  window.localStorage.setItem(appConfig.storageKeys.authToken, session.token)
  window.localStorage.setItem(appConfig.storageKeys.userId, String(session.userId))

  if (session.userName) {
    window.localStorage.setItem(appConfig.storageKeys.userName, session.userName)
  }

  if (session.userEmail) {
    window.localStorage.setItem(appConfig.storageKeys.userEmail, session.userEmail)
  }

  if (session.departmentName) {
    window.localStorage.setItem(appConfig.storageKeys.departmentName, session.departmentName)
  }

  if (session.roleName) {
    window.localStorage.setItem(appConfig.storageKeys.roleName, session.roleName)
  }

  if (typeof session.isAdmin === 'boolean') {
    window.localStorage.setItem(appConfig.storageKeys.isAdmin, String(session.isAdmin))
  }

  if (session.refreshToken) {
    window.localStorage.setItem(appConfig.storageKeys.refreshToken, session.refreshToken)
  }
}

export const clearAuthSession = () => {
  if (!isBrowser) return
  window.localStorage.removeItem(appConfig.storageKeys.authToken)
  window.localStorage.removeItem(appConfig.storageKeys.refreshToken)
  window.localStorage.removeItem(appConfig.storageKeys.userId)
  window.localStorage.removeItem(appConfig.storageKeys.userName)
  window.localStorage.removeItem(appConfig.storageKeys.userEmail)
  window.localStorage.removeItem(appConfig.storageKeys.departmentName)
  window.localStorage.removeItem(appConfig.storageKeys.roleName)
  window.localStorage.removeItem(appConfig.storageKeys.isAdmin)
}

export const getStoredUserName = () => {
  if (!isBrowser) return 'User'
  return window.localStorage.getItem(appConfig.storageKeys.userName) || 'User'
}

export const getStoredUserEmail = () => {
  if (!isBrowser) return ''
  return window.localStorage.getItem(appConfig.storageKeys.userEmail) || ''
}

export const getStoredDepartmentName = () => {
  if (!isBrowser) return ''
  return window.localStorage.getItem(appConfig.storageKeys.departmentName) || ''
}

export const getStoredRoleName = () => {
  if (!isBrowser) return ''
  return window.localStorage.getItem(appConfig.storageKeys.roleName) || ''
}

export const updateStoredProfile = (profile: {
  userName?: string
  userEmail?: string
  departmentName?: string
  roleName?: string
}) => {
  if (!isBrowser) return

  if (typeof profile.userName === 'string') {
    window.localStorage.setItem(appConfig.storageKeys.userName, profile.userName)
  }

  if (typeof profile.userEmail === 'string') {
    window.localStorage.setItem(appConfig.storageKeys.userEmail, profile.userEmail)
  }

  if (typeof profile.departmentName === 'string') {
    window.localStorage.setItem(appConfig.storageKeys.departmentName, profile.departmentName)
  }

  if (typeof profile.roleName === 'string') {
    window.localStorage.setItem(appConfig.storageKeys.roleName, profile.roleName)
  }
}
