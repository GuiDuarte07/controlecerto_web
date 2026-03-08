# Autenticação em Requisições API

## Visão Geral

Todo serviço que faz requisições a endpoints protegidos deve usar `authenticatedFetch` em vez de `apiFetch`. Isso injeta automaticamente o token JWT do `useAuthStore` no header `Authorization: Bearer <token>`.

## Como Usar

### Em Serviços (Não-Componentes)

Use a função `authenticatedFetch` diretamente:

```typescript
import { authenticatedFetch } from "@/lib/authenticated-fetch";

export async function getTransactions(filters: TransactionFilters) {
  return authenticatedFetch<TransactionListResponse>(
    `/api/transactions?startDate=...&endDate=...`,
    { method: "GET" }
  );
}
```

O token é injetado automaticamente! ✅

### Em Componentes

Use o hook `useAuthenticatedFetch` se precisar chamar requisições authenticated dentro de um componente:

```typescript
"use client";

import { useAuthenticatedFetch } from "@/lib/authenticated-fetch";

export function MyComponent() {
  const authenticatedFetch = useAuthenticatedFetch();

  const handleFetch = async () => {
    const data = await authenticatedFetch(
      "/api/my-endpoint",
      { method: "GET" }
    );
  };

  return <button onClick={handleFetch}>Fetch</button>;
}
```

## Quando Usar Qual?

| Cenário | Use |
|---------|-----|
| Serviço não autenticado (login, register) | `apiFetch` |
| Serviço autenticado (transações, contas) | `authenticatedFetch` |
| Componente que precisa fazer requisição autenticada | `useAuthenticatedFetch()` (hook) |
| Logout/Refresh Token (recebem token como param) | `apiFetch` (token passado manualmente) |

## Implementação Interna

### `authenticatedFetch`

Função que:
1. Obtém o token do `useAuthStore.getState().accessToken`
2. Injeta no header `Authorization: Bearer {token}`
3. Chama `apiFetch` com headers modificados

### `useAuthenticatedFetch`

Hook que:
1. Força re-render quando token muda (reatividade)
2. Retorna `authenticatedFetch` com token sempre atualizado

## Tratamento de Erros

Ambas retornam `ApiError` em caso de falha:

```typescript
try {
  const data = await authenticatedFetch("/api/endpoint", { method: "GET" });
} catch (err) {
  const apiError = toApiError(err, "Fallback message");
  console.log(apiError.message); // Mensagem principal
  console.log(apiError.errors);  // Erros de validação (se houver)
}
```

## Exemplo Completo: Serviço de Transações

```typescript
// src/modules/transactions/services/transactionService.ts
import { authenticatedFetch } from "@/lib/authenticated-fetch";
import type { TransactionListResponse } from "../types/transaction.types";

export async function getTransactions(
  startDate: Date,
  endDate: Date
): Promise<TransactionListResponse> {
  const params = new URLSearchParams({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  return authenticatedFetch<TransactionListResponse>(
    `/api/transactions?${params.toString()}`,
    { method: "GET" }
  );
}
```

## Fluxo de Autenticação

```
Componente chama transactionService.getTransactions()
  ↓
transactionService usa authenticatedFetch()
  ↓
authenticatedFetch obtém token de useAuthStore
  ↓
Injeta "Authorization: Bearer {token}" no header
  ↓
Chama apiFetch com headers modificados
  ↓
Response volta para componente
```

## Troubleshooting

### "Erro 401 Unauthorized"

- [ ] Token está sendo gerado corretamente (checar `useAuthStore`)
- [ ] Endpoint realmente requer autenticação
- [ ] Token não expirou

### "Token undefined"

- Certifique-se de estar usando `authenticatedFetch`, não `apiFetch`
- Usuário está autenticado? (cheque `useAuthStore((state) => state.accessToken)`)

### "CORS Error"

Check CORS configuration no backend .NET
