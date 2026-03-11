"use client";

import { useEffect, useMemo } from "react";
import { useNotesStore } from "../context/notesContext";
import type { Note } from "../types/notes.types";

export function useNotesData() {
  const monthNotes = useNotesStore((state) => state.monthNotes);
  const generalNotes = useNotesStore((state) => state.generalNotes);
  const periodSearchNotes = useNotesStore((state) => state.periodSearchNotes);
  const periodSearchYear = useNotesStore((state) => state.periodSearchYear);
  const periodSearchMonth = useNotesStore((state) => state.periodSearchMonth);
  const activeNoteId = useNotesStore((state) => state.activeNoteId);
  const isLoading = useNotesStore((state) => state.isLoading);
  const isSearchingPeriod = useNotesStore((state) => state.isSearchingPeriod);
  const error = useNotesStore((state) => state.error);
  const fetchInitialData = useNotesStore((state) => state.fetchInitialData);

  useEffect(() => {
    void fetchInitialData();
  }, [fetchInitialData]);

  const tabs = useMemo(() => {
    const ids = new Set<number>();
    return [...monthNotes, ...generalNotes, ...periodSearchNotes].filter(
      (note) => {
        if (ids.has(note.id)) return false;
        ids.add(note.id);
        return true;
      },
    );
  }, [monthNotes, generalNotes, periodSearchNotes]);

  const activeNote = useMemo<Note | null>(() => {
    if (!activeNoteId) return tabs[0] ?? null;
    return tabs.find((note) => note.id === activeNoteId) ?? tabs[0] ?? null;
  }, [activeNoteId, tabs]);

  return {
    monthNotes,
    generalNotes,
    periodSearchNotes,
    periodSearchYear,
    periodSearchMonth,
    tabs,
    activeNote,
    isLoading,
    isSearchingPeriod,
    error,
    refetch: fetchInitialData,
  };
}

export function useNotesPanelState() {
  const isOpen = useNotesStore((state) => state.isOpen);
  const isExpanded = useNotesStore((state) => state.isExpanded);
  const view = useNotesStore((state) => state.view);
  const isSubmitting = useNotesStore((state) => state.isSubmitting);
  const togglePanel = useNotesStore((state) => state.togglePanel);
  const closePanel = useNotesStore((state) => state.closePanel);
  const openPanel = useNotesStore((state) => state.openPanel);
  const toggleExpanded = useNotesStore((state) => state.toggleExpanded);
  const setExpanded = useNotesStore((state) => state.setExpanded);
  const setView = useNotesStore((state) => state.setView);

  return {
    isOpen,
    isExpanded,
    view,
    isSubmitting,
    togglePanel,
    closePanel,
    openPanel,
    toggleExpanded,
    setExpanded,
    setView,
  };
}

export function useNotesActions() {
  const selectNote = useNotesStore((state) => state.selectNote);
  const backToList = useNotesStore((state) => state.backToList);
  const searchByPeriod = useNotesStore((state) => state.searchByPeriod);
  const clearPeriodSearch = useNotesStore((state) => state.clearPeriodSearch);
  const createNote = useNotesStore((state) => state.createNote);
  const createInContext = useNotesStore((state) => state.createInContext);
  const updateNote = useNotesStore((state) => state.updateNote);
  const deleteNote = useNotesStore((state) => state.deleteNote);
  const clearError = useNotesStore((state) => state.clearError);

  return {
    selectNote,
    backToList,
    searchByPeriod,
    clearPeriodSearch,
    createNote,
    createInContext,
    updateNote,
    deleteNote,
    clearError,
  };
}

export function useNotesModule() {
  const data = useNotesData();
  const panel = useNotesPanelState();
  const actions = useNotesActions();

  return {
    ...data,
    ...panel,
    ...actions,
  };
}
