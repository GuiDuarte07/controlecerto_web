# ControleCerto Web - Project Guidelines

## Stack
- Next.js App Router com TypeScript
- i18n via `next-intl`
- UI com componentes (shadcn) em `src/shared/components/ui`
- Estado de auth em `src/modules/auth`

## Code Style
- Preferir TypeScript estrito, sem `any`
- Manter componentes pequenos e focados
- Reutilizar utilitários de `src/shared/lib/utils.ts` antes de criar novos helpers
- **Utilitários compartilhados**: Sempre verificar `src/shared/utils/` antes de implementar funções auxiliares. Utilitários de cor (`getContrastTextColor`, `getColoredBadgeStyle`, `normalizeHexColor`, `isLightColor`) já existem em `src/shared/utils/colors.ts` — **nunca duplicar** essas funções em módulos ou componentes
- **Comentários**: Evitar comentários desnecessários; comentar apenas o que for realmente necessário para clareza (lógica complexa, decisões não óbvias, workarounds). Código limpo e bem nomeado deve ser autoexplicativo.
- Caso a feature a ser implementada é um módulo e precisa uma página para ela, acessar `src\shared\components\layout\Sidebar.tsx` e adicionar a rota da página nova no menu lateral seguindo o padrão das outras rotas.

## Formulários (Obrigatório)
- **SEMPRE** usar React Hook Form (`react-hook-form`) para gerenciamento de formulários
- Integrar com Zod através de `@hookform/resolvers/zod` para validação
- Usar componentes shadcn Form (`Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`) para estrutura padrão
- Validações devem ser definidas em schemas Zod em `src/modules/<modulo>/schemas/`
- Mensagens de erro de validação devem usar chaves i18n, nunca texto hardcoded

### Exemplo de Formulário Padrão
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { mySchema } from "../schemas/my.schemas";

const t = useTranslations("myModule");
const form = useForm({
  resolver: zodResolver(mySchema),
  defaultValues: { name: "", email: "" },
});

const onSubmit = form.handleSubmit(async (data) => {
  // lógica de submit
});

// No JSX, usar componentes Form do shadcn
<Form {...form}>
  <form onSubmit={onSubmit}>
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("labels.name")}</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

## Internacionalização (Obrigatório)
- **NUNCA** usar textos hardcoded em português ou inglês no código
- **SEMPRE** usar `next-intl` via hook `useTranslations()` para todos os textos visíveis ao usuário
- Chaves de tradução devem estar em `src/translations/pt.json` e `src/translations/en.json`
- Organizar traduções por namespace/módulo para melhor manutenibilidade
- Mensagens de erro de validação (Zod), labels, placeholders, títulos, descrições, botões - TUDO deve ser i18n

### Exemplo de Uso Correto
```typescript
// ✅ CORRETO
const t = useTranslations("accounts");
<h1>{t("title")}</h1>
<Button>{t("actions.create")}</Button>

// ❌ ERRADO - texto hardcoded
<h1>Minhas Contas</h1>
<Button>Criar Conta</Button>
```

### Estrutura de Traduções
```json
// src/translations/pt.json
{
  "accounts": {
    "title": "Minhas Contas",
    "actions": {
      "create": "Criar Conta"
    }
  }
}
```

## UI e Componentes
- Sempre priorizar componentes shadcn de `src/shared/components/ui` ao criar novas telas ou features
- Evitar escrever Tailwind CSS diretamente quando existe componente shadcn equivalente
- Usar Tailwind apenas para layout, espaçamento e ajustes finos após composição com shadcn
- Motivo: facilitar manutenção, consistência visual e redução de código customizado
- Segue lista de todos os componentes shadcn disponíveis para uso: 
  1. accordion.tsx   
  2. alert-dialog.tsx
  3. alert.tsx       
  4. aspect-ratio.tsx
  5. avatar.tsx      
  6. badge.tsx       
  7. breadcrumb.tsx  
  8. button-group.tsx
  9. button.tsx      
  10. calendar.tsx    
  11. card.tsx
  12. carousel.tsx
  13. chart.tsx
  14. checkbox.tsx
  15. collapsible.tsx
  16. combobox.tsx
  17. command.tsx
  18. context-menu.tsx
  19. dialog.tsx
  20. direction.tsx
  21. drawer.tsx
  22. dropdown-menu.tsx
  23. empty.tsx
  24. field.tsx
  25. form.tsx
  26. hover-card.tsx
  27. input-group.tsx
  28. input-otp.tsx
  29. input.tsx
  30. item.tsx
  31. kbd.tsx
  32. label.tsx
  33. menubar.tsx
  34. native-select.tsx
  35. navigation-menu.tsx
  36. pagination.tsx
  37. popover.tsx
  38. progress.tsx
  39. radio-group.tsx
  40. resizable.tsx
  41. scroll-area.tsx
  42. select.tsx
  43. separator.tsx
  44. sheet.tsx
  45. sidebar.tsx
  46. skeleton.tsx
  47. slider.tsx
  48. sonner.tsx (toast deprecado, usar este no lugar)
  49. spinner.tsx
  50. switch.tsx
  51. table.tsx
  52. tabs.tsx
  53. textarea.tsx
  54. toggle-group.tsx
  55. toggle.tsx
  56. tooltip.tsx

## Responsividade (Obrigatorio)
- Todas as funcionalidades devem funcionar perfeitamente em celular, tablet e desktop
- Testar comportamento mobile antes de considerar a feature concluida
- Usar breakpoints do Tailwind (`sm:`, `md:`, `lg:`) para adaptar layouts
- Componentes de navegacao (sidebar, header, menus) devem ter versao mobile dedicada

## Page Header (Obrigatorio)
- Toda página do sistema DEVE usar o hook `usePageHeader()` para configurar o cabeçalho
- O hook permite customizar título, descrição, botão de ação e campo de busca no header
- Todos os parâmetros são opcionais - omita o que não for necessário para aquela página
- Gerenciado internamente via Zustand store (`usePageHeaderStore`)

### Uso Básico
```typescript
import { usePageHeader } from "@/shared/hooks/use-page-header";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

export default function MyPage() {
  const t = useTranslations("myModule");

  // Página completa: título, descrição e ação
  usePageHeader({
    title: t("title"),
    description: t("description"),
    actionLabel: t("actionLabel"),
    actionIcon: Plus,
    onAction: () => setIsDialogOpen(true),
  });

  // Ou apenas título
  usePageHeader({
    title: t("title"),
  });

  // Ou título e descrição (sem botão)
  usePageHeader({
    title: t("title"),
    description: t("description"),
  });

  // Ou título + busca controlada no header
  usePageHeader({
    title: t("title"),
    searchValue: search,
    searchPlaceholder: t("searchPlaceholder"),
    searchAriaLabel: t("searchPlaceholder"),
    onSearchChange: setSearch,
  });

  return (/* ... */);
}
```

### Parâmetros do Hook
- `title` (opcional): Título principal da página
- `description` (opcional): Subtítulo/descrição em texto menor e cor secundária
- `actionLabel` (opcional): Texto do botão de ação (ex: "Nova Categoria")
- `actionIcon` (opcional): Ícone do lucide-react para o botão (padrão: Plus)
- `onAction` (opcional): Função chamada ao clicar no botão
- `searchValue` (opcional): Valor atual do campo de busca no header (controlado)
- `searchPlaceholder` (opcional): Placeholder exibido no input de busca
- `searchAriaLabel` (opcional): `aria-label` do input de busca para acessibilidade
- `onSearchChange` (opcional): Função chamada quando o valor da busca muda (`(value: string) => void`)

### Regras
- Use mensagens i18n para título e descrição (via `useTranslations`)
- Se não houver ação relevante para a página, omita `actionLabel` e `onAction`
- O botão só aparece se AMBOS `actionLabel` e `onAction` estiverem definidos
- O campo de busca no header só aparece se `onSearchChange` estiver definido
- Para busca controlada, sempre passe `searchValue` junto de `onSearchChange`
- Em mobile, apenas o ícone do botão é exibido (label oculto para economizar espaço)
- **Importante**: Declare `onAction` fora do objeto ou use `useCallback` para evitar re-renders desnecessários
- O hook usa desestruturação de props - passe as propriedades diretamente, não um objeto nested

### Boas Práticas
```typescript
// ✅ BOM: função estável
const handleCreate = () => setIsDialogOpen(true);
usePageHeader({
  title: t("title"),
  onAction: handleCreate,
});

// ✅ BOM: com useCallback
const handleCreate = useCallback(() => {
  setIsDialogOpen(true);
}, []);

// ⚠️ EVITAR: função inline (pode causar re-renders)
usePageHeader({
  title: t("title"),
  onAction: () => setIsDialogOpen(true), // Nova referência a cada render
});
```

### Arquitetura Interna
- Store: `usePageHeaderStore` (Zustand) em `src/shared/hooks/use-page-header.ts`
- Consumidor: `usePageHeaderState()` usado pelo componente `Header`
- Estado é limpo automaticamente quando componente desmonta
- Usa seletores individuais para evitar re-renders desnecessários

## Arquitetura
- Regras de auth ficam em `src/modules/auth`
- Paginas localizadas devem respeitar o prefixo `/{locale}`
- Evitar hardcode de rotas sem locale

## Services (Obrigatorio)
- Todo service deve usar `apiFetch()` de `src/shared/lib/api-client.ts` para requisicoes HTTP
- NUNCA usar `fetch()` nativo ou criar instancias customizadas de Axios
- O `apiFetch()` possui interceptores globais que:
  - Injetam automaticamente o JWT token em todas as requisicoes (via header `Authorization: Bearer {token}`)
  - Tratam automaticamente erro 401 (unauthorized) tentando refresh token
  - Redirecionam para login se refresh falhar ou nao houver token

### Padrao de Criacao de Services
```typescript
// src/modules/<modulo>/services/<resource>.service.ts
import { apiFetch } from "@/shared/lib/api-client";
import type { MyRequest, MyResponse } from "../types/<modulo>.types";

async function getAll(): Promise<MyResponse[]> {
  return apiFetch<MyResponse[]>("/api/<resource>", {
    method: "GET",
  });
}

async function getById(id: string): Promise<MyResponse> {
  return apiFetch<MyResponse>(`/api/<resource>/${id}`, {
    method: "GET",
  });
}

async function create(data: MyRequest): Promise<MyResponse> {
  return apiFetch<MyResponse>("/api/<resource>", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function update(id: string, data: Partial<MyRequest>): Promise<MyResponse> {
  return apiFetch<MyResponse>(`/api/<resource>/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

async function remove(id: string): Promise<void> {
  return apiFetch<void>(`/api/<resource>/${id}`, {
    method: "DELETE",
  });
}

export const myResourceService = {
  getAll,
  getById,
  create,
  update,
  remove,
};
```

### Regras de Services
- Services devem morar em `src/modules/<modulo>/services/`
- Exportar objeto com metodos (nao usar classes)
- Sempre tipar o retorno de `apiFetch<T>()` com o tipo esperado
- NAO adicionar manualmente header `Authorization` (interceptor ja faz isso)
- NAO tratar erro 401 manualmente (interceptor ja faz refresh automatico)
- NAO usar `try/catch` para autenticacao (deixar erro propagar para o interceptor)
- Usar `JSON.stringify()` para `body` quando enviar objetos
- Endpoints devem comecar com `/api/` para manter consistencia com backend .NET

### Exemplo Real (authService)
Ver `src/modules/auth/services/authService.ts` como referencia de implementacao correta.

## Context e Hooks (Obrigatorio)
- Context/Store de modulo deve ser criado com Zustand em `src/modules/<modulo>/context/`
- Hooks customizados devem morar em `src/modules/<modulo>/hooks/`
- Logica de dados, filtros, paginacao e estado da feature deve ser gerenciada pelo context/hooks do modulo
- Validações de formularios devem usar Zod em `src/modules/<modulo>/schemas/`

### Padrao de Context com Zustand
```typescript
// src/modules/<modulo>/context/<modulo>Context.tsx
import { create } from "zustand";
import { myModuleService } from "../services/myModule.service";
import type { MyData } from "../types/<modulo>.types";
import { ApiError, toApiError } from "@/shared/lib/api-client";

// Separar estado de acoes para melhor organizacao
interface MyModuleState {
  data: MyData[];
  selectedItem: MyData | null;
  filters: {
    search: string;
    category: string | null;
    dateRange: { start: Date | null; end: Date | null };
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  isLoading: boolean;
  error: ApiError | null;
}

interface MyModuleActions {
  // Data fetching
  fetchData: () => Promise<void>;
  fetchById: (id: string) => Promise<void>;
  
  // CRUD operations
  createItem: (data: Partial<MyData>) => Promise<void>;
  updateItem: (id: string, data: Partial<MyData>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  
  // UI state
  setSelectedItem: (item: MyData | null) => void;
  
  // Filters and pagination
  setSearch: (search: string) => void;
  setCategory: (category: string | null) => void;
  setDateRange: (start: Date | null, end: Date | null) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  
  // Error handling
  clearError: () => void;
}

type MyModuleStore = MyModuleState & MyModuleActions;

const initialState: MyModuleState = {
  data: [],
  selectedItem: null,
  filters: {
    search: "",
    category: null,
    dateRange: { start: null, end: null },
  },
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
  },
  isLoading: false,
  error: null,
};

export const useMyModuleStore = create<MyModuleStore>((set, get) => ({
  ...initialState,

  fetchData: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filters, pagination } = get();
      const response = await myModuleService.getAll({
        search: filters.search,
        category: filters.category,
        page: pagination.page,
        pageSize: pagination.pageSize,
      });
      
      set({
        data: response.items,
        pagination: { ...pagination, total: response.total },
        isLoading: false,
      });
    } catch (err) {
      const error = toApiError(err, "Failed to fetch data");
      set({ error, isLoading: false });
      throw error;
    }
  },

  setSearch: (search: string) => {
    set((state) => ({
      filters: { ...state.filters, search },
      pagination: { ...state.pagination, page: 1 }, // Reset page on filter change
    }));
  },

  clearFilters: () => {
    set((state) => ({
      filters: initialState.filters,
      pagination: { ...state.pagination, page: 1 },
    }));
  },

  clearError: () => set({ error: null }),
}));
```

### Padrao de Hooks Customizados
```typescript
// src/modules/<modulo>/hooks/useMyModule.hooks.ts
"use client";

import { useEffect } from "react";
import { useMyModuleStore } from "../context/myModuleContext";

/**
 * Hook para buscar dados automaticamente ao montar componente
 */
export function useMyModuleData(autoFetch = true) {
  const data = useMyModuleStore((state) => state.data);
  const isLoading = useMyModuleStore((state) => state.isLoading);
  const error = useMyModuleStore((state) => state.error);
  const fetchData = useMyModuleStore((state) => state.fetchData);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

/**
 * Hook para gerenciar filtros com debounce
 */
export function useMyModuleFilters() {
  const filters = useMyModuleStore((state) => state.filters);
  const setSearch = useMyModuleStore((state) => state.setSearch);
  const setCategory = useMyModuleStore((state) => state.setCategory);
  const clearFilters = useMyModuleStore((state) => state.clearFilters);
  const fetchData = useMyModuleStore((state) => state.fetchData);

  const applyFilters = () => {
    fetchData();
  };

  return {
    filters,
    setSearch,
    setCategory,
    clearFilters,
    applyFilters,
  };
}

/**
 * Hook para paginacao
 */
export function useMyModulePagination() {
  const pagination = useMyModuleStore((state) => state.pagination);
  const setPage = useMyModuleStore((state) => state.setPage);
  const setPageSize = useMyModuleStore((state) => state.setPageSize);
  const fetchData = useMyModuleStore((state) => state.fetchData);

  const goToPage = (page: number) => {
    setPage(page);
    fetchData();
  };

  const changePageSize = (pageSize: number) => {
    setPageSize(pageSize);
    setPage(1); // Reset to first page
    fetchData();
  };

  return {
    ...pagination,
    goToPage,
    changePageSize,
  };
}
```

### Padrao de Schemas com Zod
```typescript
// src/modules/<modulo>/schemas/<modulo>.schemas.ts
import { z } from "zod";

export const myItemSchema = z.object({
  name: z
    .string()
    .min(1, { message: "myModule.errors.nameRequired" })
    .min(3, { message: "myModule.errors.nameTooShort" })
    .max(100, { message: "myModule.errors.nameTooLong" }),
  
  description: z
    .string()
    .max(500, { message: "myModule.errors.descriptionTooLong" })
    .optional(),
  
  category: z
    .string()
    .min(1, { message: "myModule.errors.categoryRequired" }),
  
  amount: z
    .number({ invalid_type_error: "myModule.errors.amountInvalid" })
    .positive({ message: "myModule.errors.amountPositive" })
    .max(1000000, { message: "myModule.errors.amountTooLarge" }),
  
  date: z.date({ required_error: "myModule.errors.dateRequired" }),
  
  tags: z.array(z.string()).optional(),
});

// Schema para filtros
export const myFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  dateStart: z.date().optional(),
  dateEnd: z.date().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
});

// Inferir tipos dos schemas
export type MyItemFormData = z.infer<typeof myItemSchema>;
export type MyFiltersFormData = z.infer<typeof myFiltersSchema>;
```

### Regras de Context e Hooks
- Context deve usar Zustand (nao usar React Context API para estado global de modulo)
- Separar claramente estado (State) de acoes (Actions) na interface do store
- Estado inicial deve ser extraido em constante `initialState` para facilitar reset
- Hooks customizados devem:
  - Ter prefixo `use` seguido do nome do modulo
  - Encapsular logica complexa de consumo da store
  - Retornar objetos com propriedades semanticas (nao arrays)
  - Ser marcados com `"use client"` quando usarem hooks do React
- Filtros e paginacao devem sempre resetar para pagina 1 quando alterados
- Toda acao async deve:
  - Setar `isLoading: true` no inicio
  - Setar `error: null` para limpar erros anteriores
  - Usar `try/catch` e converter erro para `ApiError` via `toApiError()`
  - Setar `isLoading: false` no final
- Schemas Zod devem usar mensagens i18n (chaves de traducao, nao texto hardcoded)
- Inferir tipos TypeScript dos schemas com `z.infer<typeof schema>`

### Exemplo Real
Ver `src/modules/auth/context/authContext.tsx` e `src/modules/auth/hooks/useAuth.hooks.ts` como referencia de implementacao correta.

## Modelagem de Arquitetura Modular (Obrigatorio)
- Toda feature deve nascer como modulo em `src/modules/<modulo>`.
- Tudo que pertence ao modulo deve ficar dentro dele: `models`, `services`, `components`, `consts`, `enums`, `hooks`, `schemas`, `types`, `utils`, `context` e similares.
- Evitar espalhar codigo de dominio fora do modulo.
- Cada modulo deve expor uma API publica via `index.ts` para reduzir imports acoplados.
- Compartilhar apenas o que for realmente global em `src/shared` (componentes, hooks, lib, types, utils).

### Excecao Next.js (App Router)
- Arquivos de rota do Next.js devem ficar em `src/app/**` (`page.tsx`, `layout.tsx`, `loading.tsx`, etc.).
- A `page.tsx` deve ser fina: orquestra rota, params e i18n; regra de negocio e UI de feature ficam no modulo.
- A pagina deve consumir componentes/servicos do modulo correspondente, em vez de implementar dominio direto na camada de rota.

### Desenho de Organizacao de Pastas
```text
src/
	app/
		[locale]/
			<rota>/
				page.tsx            # Rota Next.js (excecao)
				layout.tsx          # Opcional por rota

	modules/
		<modulo>/
			components/           # Componentes da feature
			models/               # Modelos de dominio
			services/             # Integracao API e regras de aplicacao
			hooks/                # Hooks da feature
			context/              # Context providers da feature
			schemas/              # Validacoes (zod, etc.)
			types/                # Tipos e contratos TS
			consts/               # Constantes da feature
			enums/                # Enums da feature
			utils/                # Helpers internos da feature
			index.ts              # API publica do modulo

	shared/
		components/
			ui/                   # Componentes shadcn globais
		hooks/                  # Hooks globais reutilizaveis
		lib/                    # Utils e configuracoes globais
		types/                  # Tipos compartilhados
		utils/                  # Helpers compartilhados
```

### Regra de Ouro
- Se a regra, tipo, componente ou servico pertence a um dominio/feature, ele deve morar no modulo da feature.
- Se a regra é compartilhada por todo o sistema (sem dominio especifico), pode morar em `src/shared`.

## Build e Teste
- Instalar: `pnpm install`
- Type check: `pnpm exec tsc --noEmit`
- Lint: `pnpm exec eslint .`

## Convenções
- Sempre considerar `pt` e `en` ao alterar rotas
- Preferir textos via arquivos de tradução em `src/translations`
- Garantir que alteracoes nao quebrem comportamento em nenhum tipo de tela (mobile/tablet/desktop)

## Complementos para IA
- Este arquivo deve permanecer alinhado com `.github/copilot-instructions.md`; quando uma regra estrutural mudar, atualizar os dois.
- O arquivo `src/shared/lib/AUTHENTICATION.md` tem orientacoes antigas sobre `authenticatedFetch`. O padrao atual dos services e usar `apiFetch()` de `src/shared/lib/api-client.ts`, que ja injeta token, trata refresh e normaliza erros.
- Ao criar rota nova em `src/app/[locale]/**`, manter `page.tsx` fina: envolver com `AppLayout` quando for area autenticada e delegar UI/regra de negocio para `src/modules/<modulo>`.
- Ao criar modulo novo, exportar a API publica pelo `index.ts` do modulo e evitar imports profundos desnecessarios entre modulos.
- Se a nova pagina precisa aparecer na navegacao, atualizar `src/shared/components/layout/Sidebar.tsx` e adicionar as chaves correspondentes em `src/translations/pt.json` e `src/translations/en.json`.
- Para acoes destrutivas, preferir os componentes shadcn de dialog/alert-dialog ja existentes e mensagens via i18n.
