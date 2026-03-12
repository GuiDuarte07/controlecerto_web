import { apiFetch } from "@/shared/lib/api-client";
import type {
  ChangePasswordRequest,
  DetailsUserResponse,
  ForgotPasswordEmailRequest,
  ForgotPasswordResetRequest,
} from "../types/auth.types";

async function getDetails(): Promise<DetailsUserResponse> {
  return apiFetch<DetailsUserResponse>("/api/users/me", {
    method: "GET",
  });
}

async function uploadAvatar(file: File): Promise<DetailsUserResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<DetailsUserResponse>("/api/users/me/avatar", {
    method: "POST",
    body: formData as unknown as BodyInit,
  });
}

async function deleteAvatar(): Promise<void> {
  return apiFetch<void>("/api/users/me/avatar", {
    method: "DELETE",
  });
}

async function sendConfirmEmail(): Promise<void> {
  return apiFetch<void>("/api/users/me/confirm-email", {
    method: "POST",
  });
}

async function changePassword(data: ChangePasswordRequest): Promise<void> {
  return apiFetch<void>("/api/users/me/password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function requestForgotPassword(
  data: ForgotPasswordEmailRequest,
): Promise<void> {
  return apiFetch<void>("/api/users/password/forgot", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function verifyForgotPasswordToken(token: string): Promise<void> {
  return apiFetch<void>(`/api/users/password/forgot/${token}`, {
    method: "GET",
  });
}

async function resetForgotPassword(
  token: string,
  data: ForgotPasswordResetRequest,
): Promise<void> {
  return apiFetch<void>(`/api/users/password/forgot/${token}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function confirmEmail(token: string): Promise<void> {
  return apiFetch<void>(`/api/users/confirm-email/${token}`, {
    method: "GET",
  });
}

export const userService = {
  getDetails,
  uploadAvatar,
  deleteAvatar,
  sendConfirmEmail,
  changePassword,
  requestForgotPassword,
  verifyForgotPasswordToken,
  resetForgotPassword,
  confirmEmail,
};
