import { httpClient } from './httpClient'
import type { SettingsUpdateRequest } from '../types/api'

export const settingsService = {
  getByUser: (userId: number) => httpClient.get(`/settings/${userId}`),

  update: (userId: number, payload: SettingsUpdateRequest) =>
    httpClient.put(`/settings/${userId}`, payload),

  updateSidebarPosition: (userId: number, position: 'left' | 'right') =>
    httpClient.put(`/settings/${userId}/sidebar-position`, undefined, {
      params: { position },
    }),

  toggleDarkMode: (userId: number) =>
    httpClient.put(`/settings/${userId}/dark-mode`),
}
