import apiClient from "../../api/client";

import type {
  AuthUser,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from "../../types/auth";

export async function login(
  credentials: LoginRequest,
): Promise<LoginResponse> {
  const response =
    await apiClient.post<LoginResponse>(
      "/auth/login",
      credentials,
    );

  return response.data;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response =
    await apiClient.get<AuthUser>("/auth/me");

  return response.data;
}

export async function register(
  credentials: RegisterRequest,
): Promise<AuthUser> {
  const response =
    await apiClient.post<AuthUser>(
      "/auth/register",
      credentials,
    );

  return response.data;
}

export async function forgotPassword(
  payload: ForgotPasswordRequest,
): Promise<ForgotPasswordResponse> {
  const response =
    await apiClient.post<ForgotPasswordResponse>(
      "/auth/forgot-password",
      payload,
    );

  return response.data;
}

export async function resetPassword(
  payload: ResetPasswordRequest,
): Promise<ResetPasswordResponse> {
  const response =
    await apiClient.post<ResetPasswordResponse>(
      "/auth/reset-password",
      payload,
    );

  return response.data;
}