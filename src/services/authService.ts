import { httpClient } from './httpClient'
import type {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
} from '../types/api'

export const authService = {
  login: (payload: LoginRequest) => httpClient.post('/user/login', payload),

  register: (payload: RegisterRequest) => httpClient.post('/user/register', payload),

  refreshToken: (refreshToken: string) =>
    httpClient.post('/user/refresh-token', { refreshToken }),

  logout: () => httpClient.post('/user/logout'),

  forgotPassword: (payload: ForgotPasswordRequest) =>
    httpClient.post(
      '/user/forgot-password',
      new URLSearchParams({
        username: payload.username,
        newPassword: payload.newPassword,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    ),
}
