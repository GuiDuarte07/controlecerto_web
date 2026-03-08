"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type { LucideIcon } from "lucide-react";

interface PageHeaderState {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
  searchValue?: string;
  searchPlaceholder?: string;
  searchAriaLabel?: string;
  onSearchChange?: (value: string) => void;
}

interface PageHeaderActions {
  setPageHeader: (config: PageHeaderState) => void;
  clearPageHeader: () => void;
}

type PageHeaderStore = PageHeaderState & PageHeaderActions;

const initialPageHeaderState: PageHeaderState = {
  title: undefined,
  description: undefined,
  actionLabel: undefined,
  actionIcon: undefined,
  onAction: undefined,
  searchValue: undefined,
  searchPlaceholder: undefined,
  searchAriaLabel: undefined,
  onSearchChange: undefined,
};

const usePageHeaderStore = create<PageHeaderStore>((set) => ({
  ...initialPageHeaderState,

  setPageHeader: (config) =>
    set((state) => {
      const nextState: PageHeaderState = {
        title: config.title,
        description: config.description,
        actionLabel: config.actionLabel,
        actionIcon: config.actionIcon,
        onAction: config.onAction,
        searchValue: config.searchValue,
        searchPlaceholder: config.searchPlaceholder,
        searchAriaLabel: config.searchAriaLabel,
        onSearchChange: config.onSearchChange,
      };

      const isSameState =
        state.title === nextState.title &&
        state.description === nextState.description &&
        state.actionLabel === nextState.actionLabel &&
        state.actionIcon === nextState.actionIcon &&
        state.onAction === nextState.onAction &&
        state.searchValue === nextState.searchValue &&
        state.searchPlaceholder === nextState.searchPlaceholder &&
        state.searchAriaLabel === nextState.searchAriaLabel &&
        state.onSearchChange === nextState.onSearchChange;

      return isSameState ? state : { ...state, ...nextState };
    }),
  clearPageHeader: () =>
    set((state) => {
      const isAlreadyClear =
        state.title === undefined &&
        state.description === undefined &&
        state.actionLabel === undefined &&
        state.actionIcon === undefined &&
        state.onAction === undefined &&
        state.searchValue === undefined &&
        state.searchPlaceholder === undefined &&
        state.searchAriaLabel === undefined &&
        state.onSearchChange === undefined;

      return isAlreadyClear ? state : { ...state, ...initialPageHeaderState };
    }),
}));

/**
 * Hook para configurar o cabeçalho da página
 * Deve ser chamado em toda página para personalizar título, descrição e ação
 *
 * @example
 * ```tsx
 * // Página com título, descrição e botão de ação
 * usePageHeader({
 *   title: "Categorias",
 *   description: "Gerencie suas categorias de transações",
 *   actionLabel: "Nova Categoria",
 *   actionIcon: Plus,
 *   onAction: () => setIsDialogOpen(true),
 * });
 *
 * // Página apenas com título
 * usePageHeader({
 *   title: "Dashboard",
 * });
 *
 * // Página sem botão de ação
 * usePageHeader({
 *   title: "Relatórios",
 *   description: "Visualize seus relatórios financeiros",
 * });
 *
 * // Página com busca no header
 * usePageHeader({
 *   title: "Contas",
 *   searchValue: search,
 *   searchPlaceholder: "Buscar por banco ou descrição",
 *   searchAriaLabel: "Buscar por banco ou descrição",
 *   onSearchChange: setSearch,
 * });
 * ```
 */
export function usePageHeader({
  title,
  description,
  actionLabel,
  actionIcon,
  onAction,
  searchValue,
  searchPlaceholder,
  searchAriaLabel,
  onSearchChange,
}: PageHeaderState) {
  // Atualiza o header quando montar ou quando as props mudarem
  useEffect(() => {
    usePageHeaderStore.getState().setPageHeader({
      title,
      description,
      actionLabel,
      actionIcon,
      onAction,
      searchValue,
      searchPlaceholder,
      searchAriaLabel,
      onSearchChange,
    });
  }, [
    title,
    description,
    actionLabel,
    actionIcon,
    onAction,
    searchValue,
    searchPlaceholder,
    searchAriaLabel,
    onSearchChange,
  ]);

  // Limpa quando desmontar
  useEffect(() => {
    return () => {
      usePageHeaderStore.getState().clearPageHeader();
    };
  }, []);
}

/**
 * Hook interno usado pelo componente Header
 * Não deve ser usado diretamente nas páginas
 */
export function usePageHeaderState() {
  return usePageHeaderStore(
    useShallow((state) => ({
      title: state.title,
      description: state.description,
      actionLabel: state.actionLabel,
      actionIcon: state.actionIcon,
      onAction: state.onAction,
      searchValue: state.searchValue,
      searchPlaceholder: state.searchPlaceholder,
      searchAriaLabel: state.searchAriaLabel,
      onSearchChange: state.onSearchChange,
    })),
  );
}
