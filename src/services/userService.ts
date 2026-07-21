import { httpClient } from './httpClient'
import type { UserRoleAssignment } from '../types/api'

export const userService = {
  assignRole: (userId: number, payload: UserRoleAssignment) =>
    httpClient.put(`/user/${userId}/role`, undefined, {
      params: { roleId: payload.roleId },
    }),

  activate: (userId: number) => httpClient.put(`/user/${userId}/activate`),

  deactivate: (userId: number) => httpClient.put(`/user/${userId}/deactivate`),
}
