import apiClient from "./client";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  RefreshRequest,
} from "@/lib/types/auth";

export const authApi = {
  login: (body: LoginRequest) =>
    apiClient.post<AuthResponse>("/auth/login", body).then((r) => r.data),

  register: (body: RegisterRequest) =>
    apiClient.post<AuthResponse>("/auth/register", body).then((r) => r.data),

  refresh: (body: RefreshRequest) =>
    apiClient.post<AuthResponse>("/auth/refresh", body).then((r) => r.data),

  forgotPassword: (body: ForgotPasswordRequest) =>
    apiClient.post<void>("/auth/forgot-password", body).then((r) => r.data),

  resetPassword: (body: ResetPasswordRequest) =>
    apiClient.post<void>("/auth/reset-password", body).then((r) => r.data),

  changePassword: (body: ChangePasswordRequest) =>
    apiClient.put<void>("/auth/change-password", body).then((r) => r.data),

  logout: () =>
    apiClient.post<void>("/auth/logout").then((r) => r.data),
};
