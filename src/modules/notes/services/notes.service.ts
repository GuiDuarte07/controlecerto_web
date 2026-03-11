import { apiFetch } from "@/shared/lib/api-client";
import type {
  CreateNoteRequest,
  Note,
  UpdateNoteRequest,
} from "../types/notes.types";

async function getAll(): Promise<Note[]> {
  return apiFetch<Note[]>("/api/notes", {
    method: "GET",
  });
}

async function getByMonth(year?: number, month?: number): Promise<Note[]> {
  const params = new URLSearchParams();

  if (typeof year === "number") {
    params.set("year", String(year));
  }

  if (typeof month === "number") {
    params.set("month", String(month));
  }

  const query = params.toString();

  return apiFetch<Note[]>(`/api/notes/month${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

async function getGeneral(): Promise<Note[]> {
  return apiFetch<Note[]>("/api/notes/general", {
    method: "GET",
  });
}

async function create(data: CreateNoteRequest): Promise<Note> {
  return apiFetch<Note>("/api/notes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function update(id: number, data: UpdateNoteRequest): Promise<Note> {
  return apiFetch<Note>(`/api/notes/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

async function remove(id: number): Promise<void> {
  return apiFetch<void>(`/api/notes/${id}`, {
    method: "DELETE",
  });
}

export const notesService = {
  getAll,
  getByMonth,
  getGeneral,
  create,
  update,
  remove,
};
