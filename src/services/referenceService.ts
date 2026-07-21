import { httpClient } from './httpClient'
import type { DepartmentRequest, RoleRequest } from '../types/api'

const toUrlEncoded = (payload: Record<string, string>) => new URLSearchParams(payload)

export const referenceService = {
  listDepartments: () => httpClient.get('/department'),

  getDepartmentById: (departmentId: number) => httpClient.get(`/department/${departmentId}`),

  createDepartment: (payload: DepartmentRequest) =>
    httpClient.post(
      '/department',
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

  updateDepartment: (departmentId: number, payload: DepartmentRequest) =>
    httpClient.put(
      `/department/${departmentId}`,
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

  deleteDepartment: (departmentId: number) => httpClient.delete(`/department/${departmentId}`),

  listRoles: () => httpClient.get('/role'),

  listRolesByDepartment: (departmentId: number) =>
    httpClient.get(`/role/department/${departmentId}`),

  getRoleById: (roleId: number) => httpClient.get(`/role/${roleId}`),

  createRole: (payload: RoleRequest) =>
    httpClient.post(
      '/role',
      toUrlEncoded({
        name: payload.name,
        description: payload.description ?? '',
        departmentId: payload.departmentId ? String(payload.departmentId) : '',
        isAdmin: String(Boolean(payload.isAdmin)),
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    ),

  updateRole: (roleId: number, payload: RoleRequest) =>
    httpClient.put(
      `/role/${roleId}`,
      toUrlEncoded({
        name: payload.name,
        description: payload.description ?? '',
        departmentId: payload.departmentId ? String(payload.departmentId) : '',
        isAdmin: String(Boolean(payload.isAdmin)),
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    ),

  deleteRole: (roleId: number) => httpClient.delete(`/role/${roleId}`),
}
