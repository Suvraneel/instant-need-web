export interface LoginRequest {
  identifier: string; // email or phone
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  businessName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserDTO {
  id: string;
  email: string;
  phoneNumber: string;
  role: "CUSTOMER" | "ADMIN";
  active: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDTO;
}

export interface RefreshRequest {
  refreshToken: string;
}
