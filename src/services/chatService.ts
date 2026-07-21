import { httpClient } from './httpClient'
import type { ChatGenerateRequest } from '../types/api'

export const chatService = {
  generate: (payload: ChatGenerateRequest) => httpClient.post('/ai/generate', payload),

  generateLegacy: (message: string) =>
    httpClient.get('/ai/generate', {
      params: { message },
    }),

  ingestFile: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    return httpClient.post('/ai/admin/ingest', formData)
  },

  ingestMultipleFiles: (files: File[]) => {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))

    return httpClient.post('/ai/admin/ingest-multiple', formData)
  },

  ingestFromUrl: (url: string) =>
    httpClient.post('/ai/admin/ingest-from-url', undefined, {
      params: { url },
    }),

  checkIngestion: (query: string) =>
    httpClient.get('/ai/check-ingestion', {
      params: { query },
    }),

  getHistoryByUser: (userId: number) => httpClient.get(`/chat-history/user/${userId}`),

  getHistoryByUserAndCategory: (userId: number, category: string) =>
    httpClient.get(`/chat-history/user/${userId}/category/${category}`),
}
