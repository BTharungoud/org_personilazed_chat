import { httpClient } from './httpClient'
import type { OrganizationRequest } from '../types/api'

const toUrlEncoded = (payload: Record<string, string>) => new URLSearchParams(payload)

export const organizationService = {
  list: () => httpClient.get('/organization'),

  getById: (organizationId: number) => httpClient.get(`/organization/${organizationId}`),

  create: (payload: OrganizationRequest) =>
    httpClient.post(
      '/organization',
      toUrlEncoded({
        name: payload.name,
        description: payload.description ?? '',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    ),

  update: (organizationId: number, payload: OrganizationRequest) =>
    httpClient.put(`/organization/${organizationId}`, payload),

  delete: (organizationId: number) => httpClient.delete(`/organization/${organizationId}`),

  activate: (organizationId: number) => httpClient.put(`/organization/${organizationId}/activate`),

  deactivate: (organizationId: number) =>
    httpClient.put(`/organization/${organizationId}/deactivate`),
}
