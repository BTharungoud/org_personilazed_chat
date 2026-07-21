import { httpClient } from './httpClient'

export interface RegistrationMetadataItem {
  id: number
  name?: string
}

export interface RegistrationMetadataResponse {
  success?: boolean
  message?: string
  data?: {
    departments?: RegistrationMetadataItem[]
    roles?: RegistrationMetadataItem[]
  }
  errors?: unknown
}

export const registrationService = {
  getMetadata: (organizationId: number) =>
    httpClient.get<RegistrationMetadataResponse>('/registration/metadata', {
      params: { organizationId },
    }),
}
