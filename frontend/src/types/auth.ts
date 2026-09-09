export type UserRole =
  | "CUSTOMER"
  | "PROFESSIONAL"
  | "ADMIN";

export interface AuthUser {
  id: number;
  email: string;
  is_active: boolean;
  roles: UserRole[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: "CUSTOMER" | "PROFESSIONAL";
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  reset_token: string | null;
  reset_url: string | null;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  message: string;
}