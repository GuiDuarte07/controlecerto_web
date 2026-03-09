"use client";

import { useEffect } from "react";
import { useInvestmentsStore } from "../context/investmentsContext";

export function useInvestmentsList(autoFetch = true) {
  const investments = useInvestmentsStore((s) => s.investments);
  const isLoading = useInvestmentsStore((s) => s.isLoading);
  const error = useInvestmentsStore((s) => s.error);
  const fetchAll = useInvestmentsStore((s) => s.fetchAll);

  useEffect(() => {
    if (autoFetch) {
      void fetchAll();
    }
  }, [autoFetch, fetchAll]);

  return { investments, isLoading, error, refetch: fetchAll };
}

export function useInvestmentDetail(id: number) {
  const selectedInvestment = useInvestmentsStore((s) => s.selectedInvestment);
  const isLoading = useInvestmentsStore((s) => s.isLoading);
  const isSubmitting = useInvestmentsStore((s) => s.isSubmitting);
  const error = useInvestmentsStore((s) => s.error);
  const fetchById = useInvestmentsStore((s) => s.fetchById);
  const deposit = useInvestmentsStore((s) => s.deposit);
  const withdraw = useInvestmentsStore((s) => s.withdraw);
  const adjust = useInvestmentsStore((s) => s.adjust);
  const update = useInvestmentsStore((s) => s.update);
  const remove = useInvestmentsStore((s) => s.remove);
  const setSelectedInvestment = useInvestmentsStore(
    (s) => s.setSelectedInvestment,
  );
  const clearError = useInvestmentsStore((s) => s.clearError);

  useEffect(() => {
    void fetchById(id);
    return () => setSelectedInvestment(null);
  }, [id, fetchById, setSelectedInvestment]);

  return {
    investment: selectedInvestment,
    isLoading,
    isSubmitting,
    error,
    refetch: () => fetchById(id),
    deposit: (data: Parameters<typeof deposit>[1]) => deposit(id, data),
    withdraw: (data: Parameters<typeof withdraw>[1]) => withdraw(id, data),
    adjust: (data: Parameters<typeof adjust>[1]) => adjust(id, data),
    update: (data: Parameters<typeof update>[1]) => update(id, data),
    remove: () => remove(id),
    clearError,
  };
}
