export interface AuthSession {
  token: string
  userId: number
  userName?: string
  userEmail?: string
  refreshToken?: string
  tokenType?: string
  expiresIn?: number
  isAdmin?: boolean
  departmentName?: string
  roleName?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  confirmPassword: string
  departmentId: number
  roleId: number
}

export interface ForgotPasswordRequest {
  username: string
  newPassword: string
}

export interface Department {
  id: number
  name?: string
  description?: string
}

export interface DepartmentRequest {
  name: string
  description?: string
}

export interface Role {
  id: number
  name?: string
  departmentId?: number
  description?: string
  isAdmin?: boolean
}

export interface RoleRequest {
  name: string
  description?: string
  departmentId?: number
  isAdmin?: boolean
}

export interface Organization {
  id: number
  name?: string
  description?: string
  active?: boolean
}

export interface OrganizationRequest {
  name: string
  description?: string
}

export interface IngestionReviewRequest {
  requestId: number
  approve: boolean
  comment?: string
}

export interface UserRoleAssignment {
  roleId: number
}

export interface SettingsUpdateRequest {
  darkMode?: boolean
  sidebarPosition?: 'left' | 'right'
}

export interface ChatGenerateRequest {
  userId: number
  message: string
  agentSelected: string
  category: string
}

export interface ChatHistoryRecord {
  id?: number | string
  title?: string
  timestamp?: string
  createdAt?: string
  updatedAt?: string
  messages?: Array<Record<string, unknown>>
  [key: string]: unknown
}

export interface SettingsRecord {
  id?: number | string
  darkMode?: boolean
  [key: string]: unknown
}

export interface ApiErrorLike {
  message: string
  status?: number
}
