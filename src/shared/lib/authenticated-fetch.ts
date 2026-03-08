import { apiFetch } from "./api-client";

/**
 * Fetch autenticado. O token JWT e tratado globalmente no interceptor.
 */
export async function authenticatedFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  return apiFetch<T>(path, options);
}

/**
 * Hook utilitario para componentes que precisam chamar endpoints protegidos.
 */
export function useAuthenticatedFetch() {
  return authenticatedFetch;
}
