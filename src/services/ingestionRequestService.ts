import { httpClient } from './httpClient'
import type { IngestionReviewRequest } from '../types/api'

export const ingestionRequestService = {
  submit: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return httpClient.post('/ingestion-requests', formData)
  },

  mine: () => httpClient.get('/ingestion-requests/mine'),

  list: () => httpClient.get('/ingestion-requests'),

  approve: (payload: IngestionReviewRequest) =>
    httpClient.post('/ingestion-requests/approve', payload),
}
