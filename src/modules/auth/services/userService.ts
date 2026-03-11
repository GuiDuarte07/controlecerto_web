import { apiFetch } from "@/shared/lib/api-client";
import type { DetailsUserResponse } from "../types/auth.types";

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

export const userService = {
  getDetails,
  uploadAvatar,
  deleteAvatar,
};
