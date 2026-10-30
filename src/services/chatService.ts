import { appConfig } from '../config/appConfig'
import type { ChatGenerateRequest } from '../types/api'
import { httpClient } from './httpClient'

export const chatService = {
  generate: (payload: ChatGenerateRequest) =>
    httpClient.post('/ai/generate', payload, { timeout: appConfig.api.aiTimeoutMs }),

  generateLegacy: (message: string) =>
    httpClient.get('/ai/generate', {
      params: { message },
      timeout: appConfig.api.aiTimeoutMs,
    }),

  ingestFile: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    return httpClient.post('/ai/admin/ingest', formData, {
      timeout: appConfig.api.uploadTimeoutMs,
    })
  },

  ingestMultipleFiles: (files: File[]) => {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))

    return httpClient.post('/ai/admin/ingest-multiple', formData, {
      timeout: appConfig.api.uploadTimeoutMs,
    })
  },

  ingestFromUrl: (url: string) =>
    httpClient.post('/ai/admin/ingest-from-url', undefined, {
      params: { url },
      timeout: appConfig.api.uploadTimeoutMs,
    }),

  checkIngestion: (query: string) =>
    httpClient.get('/ai/check-ingestion', {
      params: { query },
      timeout: appConfig.api.aiTimeoutMs,
    }),

  getHistoryByUser: (userId: number) => httpClient.get(`/chat-history/user/${userId}`),

  getHistoryByUserAndCategory: (userId: number, category: string) =>
    httpClient.get(`/chat-history/user/${userId}/category/${category}`),
}
