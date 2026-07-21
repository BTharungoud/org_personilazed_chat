import axios, { type InternalAxiosRequestConfig } from 'axios'
import { appConfig } from '../config/appConfig'
import { getStoredAuthToken } from './storage'

export const httpClient = axios.create({
  baseURL: appConfig.api.baseUrl,
  timeout: appConfig.api.timeoutMs,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const requestUrl = config.url ?? ''
  const isPublicRoute =
    requestUrl.includes('/user/login') ||
    requestUrl.includes('/user/register') ||
    requestUrl.includes('/user/forgot-password') ||
    requestUrl.includes('/user/refresh-token') ||
    requestUrl.includes('/registration/metadata') ||
    requestUrl.includes('/actuator/health')

  const token = getStoredAuthToken()
  if (token && !isPublicRoute) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (config.data instanceof FormData && config.headers) {
    delete (config.headers as Record<string, unknown>)['Content-Type']
    delete (config.headers as Record<string, unknown>)['content-type']
  }

  return config
})
