export interface Note {
  id: number;
  title: string;
  content: string;
  year: number | null;
  month: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  year?: number | null;
  month?: number | null;
}

export interface UpdateNoteRequest {
  title: string;
  content: string;
}

export type NotesContextType = "general" | "period";

export interface NotesContext {
  type: NotesContextType;
  year: number | null;
  month: number | null;
}

export interface CreateNotePayload {
  title: string;
  content: string;
  contextType: NotesContextType;
  year?: number | null;
  month?: number | null;
}

export type NotesPanelView = "list" | "editor";
