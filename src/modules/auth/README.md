# Auth Module

O módulo de autenticação (`auth`) é responsável por toda a lógica de login, registro e gerenciamento de sessão do usuário.

## Estrutura

```
src/modules/auth/
├── components/          # Componentes React (Forms, Layout)
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── AuthLayout.tsx
│   └── index.ts        # Barrel export
├── context/            # Context API para estado global
│   ├── authContext.tsx
│   └── index.ts
├── services/           # Serviços de API
│   ├── authService.ts
│   └── index.ts
├── types/              # Tipagens TypeScript
│   ├── auth.types.ts
│   └── index.ts
└── index.ts           # Barrel export principal do módulo
```

## Uso

### Provider Setup (Layout)

```tsx
import { AuthProvider } from "@/modules/auth";

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
```

### Usar o Hook de Autenticação

```tsx
"use client";

import { useAuth } from "@/modules/auth";

export function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      {isAuthenticated && <p>Bem-vindo, {user?.name}</p>}
    </div>
  );
}
```

### Usar Componentes de Form

```tsx
import { LoginForm, AuthLayout } from "@/modules/auth";

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
```

## Tradução

As traduções são gerenciadas por módulo em `src/translations/`:

- `pt.json` - Português Brasileiro
- `en.json` - Inglês

Use `useTranslations()` do `next-intl`:

```tsx
import { useTranslations } from "next-intl";

export function MyComponent() {
  const t = useTranslations("auth.login");
  return <h1>{t("title")}</h1>;
}
```

## API Endpoints

- `POST /api/Auth/Authenticate` - Login
- `POST /api/User/CreateUser` - Registro
- `GET /api/Auth/GenerateAccessToken/{refreshToken}` - Refresh token
- `GET /api/Auth/Logout/{refreshToken}` - Logout

## Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

## Fluxo de Autenticação

1. Usuário faz login/registro via formulário
2. Dados são enviados para a API via `authService`
3. Token e usuário são armazenados no contexto
4. Dados são persistidos em `localStorage`
5. Usuario pode acessar dados via `useAuth()` hook
