import { create } from "zustand";
import { ApiError, toApiError } from "@/shared/lib/api-client";
import { notesService } from "../services/notes.service";
import type {
  CreateNotePayload,
  Note,
  NotesContext,
  NotesPanelView,
} from "../types/notes.types";

interface NotesState {
  isOpen: boolean;
  isExpanded: boolean;
  view: NotesPanelView;
  monthNotes: Note[];
  generalNotes: Note[];
  periodSearchNotes: Note[];
  periodSearchYear: number | null;
  periodSearchMonth: number | null;
  activeNoteId: number | null;
  isLoading: boolean;
  isSubmitting: boolean;
  isSearchingPeriod: boolean;
  error: ApiError | null;
}

interface NotesActions {
  togglePanel: () => void;
  closePanel: () => void;
  openPanel: () => void;
  toggleExpanded: () => void;
  setExpanded: (value: boolean) => void;
  setView: (view: NotesPanelView) => void;
  selectNote: (noteId: number) => void;
  backToList: () => void;
  fetchInitialData: (year?: number, month?: number) => Promise<void>;
  searchByPeriod: (year: number, month: number) => Promise<void>;
  clearPeriodSearch: () => void;
  createNote: (payload: CreateNotePayload) => Promise<Note>;
  createInContext: (context: NotesContext, title: string) => Promise<Note>;
  updateNote: (noteId: number, title: string, content: string) => Promise<Note>;
  deleteNote: (noteId: number) => Promise<void>;
  clearError: () => void;
}

type NotesStore = NotesState & NotesActions;

const initialState: NotesState = {
  isOpen: false,
  isExpanded: false,
  view: "list",
  monthNotes: [],
  generalNotes: [],
  periodSearchNotes: [],
  periodSearchYear: null,
  periodSearchMonth: null,
  activeNoteId: null,
  isLoading: false,
  isSubmitting: false,
  isSearchingPeriod: false,
  error: null,
};

function upsertNote(list: Note[], note: Note): Note[] {
  const index = list.findIndex((item) => item.id === note.id);

  if (index === -1) {
    return [note, ...list];
  }

  const clone = [...list];
  clone[index] = note;
  return clone;
}

function removeNote(list: Note[], noteId: number): Note[] {
  return list.filter((item) => item.id !== noteId);
}

function getMonthYearContext(date = new Date()): { year: number; month: number } {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
  };
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  ...initialState,

  togglePanel: () => {
    set((state) => ({ isOpen: !state.isOpen, error: null }));
  },

  closePanel: () => {
    set({
      isOpen: false,
      isExpanded: false,
      view: "list",
      error: null,
    });
  },

  openPanel: () => {
    set({ isOpen: true, error: null });
  },

  toggleExpanded: () => {
    set((state) => ({ isExpanded: !state.isExpanded }));
  },

  setExpanded: (value) => {
    set({ isExpanded: value });
  },

  setView: (view) => {
    set({ view });
  },

  selectNote: (noteId) => {
    set({ activeNoteId: noteId, view: "editor", error: null, isOpen: true });
  },

  backToList: () => {
    set({ view: "list", error: null });
  },

  fetchInitialData: async (year, month) => {
    set({ isLoading: true, error: null });

    try {
      const fallback = getMonthYearContext();
      const safeYear = year ?? fallback.year;
      const safeMonth = month ?? fallback.month;

      const [monthNotes, generalNotes] = await Promise.all([
        notesService.getByMonth(safeYear, safeMonth),
        notesService.getGeneral(),
      ]);

      set((state) => {
        const mergedIds = new Set<number>();
        const tabs = [...monthNotes, ...generalNotes].filter((note) => {
          if (mergedIds.has(note.id)) return false;
          mergedIds.add(note.id);
          return true;
        });

        const activeExists =
          state.activeNoteId !== null && tabs.some((item) => item.id === state.activeNoteId);

        return {
          monthNotes,
          generalNotes,
          isLoading: false,
          activeNoteId: activeExists ? state.activeNoteId : tabs[0]?.id ?? null,
        };
      });
    } catch (err) {
      const error = toApiError(err, "notes.feedback.loadError");
      set({ isLoading: false, error });
      throw error;
    }
  },

  searchByPeriod: async (year, month) => {
    set({
      isSearchingPeriod: true,
      error: null,
      periodSearchYear: year,
      periodSearchMonth: month,
    });

    try {
      const notes = await notesService.getByMonth(year, month);
      set({
        periodSearchNotes: notes,
        isSearchingPeriod: false,
      });
    } catch (err) {
      const error = toApiError(err, "notes.feedback.searchError");
      set({ isSearchingPeriod: false, error });
      throw error;
    }
  },

  clearPeriodSearch: () => {
    set({
      periodSearchNotes: [],
      periodSearchYear: null,
      periodSearchMonth: null,
      error: null,
    });
  },

  createNote: async (payload) => {
    set({ isSubmitting: true, error: null });

    try {
      const safeTitle = payload.title.trim();

      if (!safeTitle) {
        throw new ApiError({ detail: "notes.errors.titleRequired" });
      }

      const request = {
        title: safeTitle,
        content: payload.content,
        year: payload.contextType === "period" ? (payload.year ?? null) : null,
        month: payload.contextType === "period" ? (payload.month ?? null) : null,
      };

      const created = await notesService.create(request);

      set((state) => {
        const isGeneral = created.year === null && created.month === null;
        const monthNotes = isGeneral
          ? state.monthNotes
          : upsertNote(state.monthNotes, created);
        const generalNotes = isGeneral
          ? upsertNote(state.generalNotes, created)
          : state.generalNotes;

        const shouldAddToSearch =
          state.periodSearchYear !== null &&
          state.periodSearchMonth !== null &&
          created.year === state.periodSearchYear &&
          created.month === state.periodSearchMonth;

        return {
          monthNotes,
          generalNotes,
          periodSearchNotes: shouldAddToSearch
            ? upsertNote(state.periodSearchNotes, created)
            : state.periodSearchNotes,
          activeNoteId: created.id,
          view: "editor",
          isOpen: true,
          isSubmitting: false,
        };
      });

      return created;
    } catch (err) {
      const error = toApiError(err, "notes.feedback.createError");
      set({ isSubmitting: false, error });
      throw error;
    }
  },

  createInContext: async (context, title) => {
    const payload: CreateNotePayload =
      context.type === "general"
        ? {
            contextType: "general",
            title,
            content: "",
          }
        : {
            contextType: "period",
            title,
            content: "",
            year: context.year,
            month: context.month,
          };

    return get().createNote(payload);
  },

  updateNote: async (noteId, title, content) => {
    set({ isSubmitting: true, error: null });

    try {
      const updated = await notesService.update(noteId, {
        title,
        content,
      });

      const isGeneral = updated.year === null && updated.month === null;

      set((state) => ({
        monthNotes: isGeneral
          ? removeNote(state.monthNotes, updated.id)
          : upsertNote(state.monthNotes, updated),
        generalNotes: isGeneral
          ? upsertNote(state.generalNotes, updated)
          : removeNote(state.generalNotes, updated.id),
        periodSearchNotes: upsertNote(state.periodSearchNotes, updated),
        isSubmitting: false,
      }));

      return updated;
    } catch (err) {
      const error = toApiError(err, "notes.feedback.updateError");
      set({ isSubmitting: false, error });
      throw error;
    }
  },

  deleteNote: async (noteId) => {
    set({ isSubmitting: true, error: null });

    try {
      await notesService.remove(noteId);

      set((state) => {
        const monthNotes = removeNote(state.monthNotes, noteId);
        const generalNotes = removeNote(state.generalNotes, noteId);
        const periodSearchNotes = removeNote(state.periodSearchNotes, noteId);

        const mergedIds = new Set<number>();
        const all = [...monthNotes, ...generalNotes, ...periodSearchNotes].filter((note) => {
          if (mergedIds.has(note.id)) return false;
          mergedIds.add(note.id);
          return true;
        });

        const activeNoteId =
          state.activeNoteId === noteId
            ? (all[0]?.id ?? null)
            : state.activeNoteId !== null &&
                all.some((item) => item.id === state.activeNoteId)
              ? state.activeNoteId
              : (all[0]?.id ?? null);

        return {
          monthNotes,
          generalNotes,
          periodSearchNotes,
          activeNoteId,
          view: activeNoteId ? "editor" : "list",
          isSubmitting: false,
        };
      });
    } catch (err) {
      const error = toApiError(err, "notes.feedback.deleteError");
      set({ isSubmitting: false, error });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
