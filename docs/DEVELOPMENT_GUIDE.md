# 🛠️ UZZOPS - DEVELOPMENT GUIDE

**Versão:** 1.0.0
**Última Atualização:** 2026-02-07
**Autor:** UzzAI Team

---

## 📑 ÍNDICE

1. [Requisitos e Instalação](#requisitos-e-instalação)
2. [Configuração do Ambiente](#configuração-do-ambiente)
3. [Setup do Supabase](#setup-do-supabase)
4. [Rodando o Projeto](#rodando-o-projeto)
5. [Comandos Úteis](#comandos-úteis)
6. [Workflow de Desenvolvimento](#workflow-de-desenvolvimento)
7. [Padrões de Código](#padrões-de-código)
8. [Estrutura de Commits](#estrutura-de-commits)
9. [Troubleshooting](#troubleshooting)
10. [Deploy](#deploy)
11. [CI/CD](#cicd)

---

## 🎯 PRÉ-REQUISITOS

### Software Obrigatório

| Software | Versão Mínima | Versão Recomendada | Link |
|----------|--------------|-------------------|------|
| **Node.js** | 20.x | 22.x | [nodejs.org](https://nodejs.org) |
| **pnpm** | 10.x | 10.28.0 | [pnpm.io](https://pnpm.io) |
| **Git** | 2.40+ | Latest | [git-scm.com](https://git-scm.com) |
| **VS Code** | Latest | Latest | [code.visualstudio.com](https://code.visualstudio.com) |

### Contas Necessárias

- **Supabase Account** - [supabase.com](https://supabase.com) (Free tier OK)
- **Vercel Account** - [vercel.com](https://vercel.com) (para deploy)
- **GitHub Account** - [github.com](https://github.com) (para CI/CD)

---

## 📦 REQUISITOS E INSTALAÇÃO

### 1. Clonar o Repositório

```bash
git clone https://github.com/uzzai/uzzops-uzzapp.git
cd uzzops-uzzapp
```

### 2. Instalar pnpm (se não tiver)

```bash
# Via npm
npm install -g pnpm@10.28.0

# Via Homebrew (macOS)
brew install pnpm

# Verificar instalação
pnpm --version
```

### 3. Instalar Dependências

```bash
# Instalar todas as dependências
pnpm install

# Verificar se instalou corretamente
pnpm list
```

**Dependências Principais Instaladas:**
- `next@16.1.6` - Framework React
- `react@19.2.4` - Biblioteca UI
- `typescript@5.9.3` - Type safety
- `@supabase/supabase-js@2.95.3` - Cliente Supabase
- `@tanstack/react-query@5.90.20` - Server state
- `tailwindcss@4.1.18` - Styling
- `zod@4.3.6` - Validation
- `react-hook-form@7.71.1` - Forms

---

## ⚙️ CONFIGURAÇÃO DO AMBIENTE

### 1. Variáveis de Ambiente

Copie o arquivo de exemplo:

```bash
cp .env.local.example .env.local
```

**Estrutura do `.env.local`:**

```env
# ========================================
# SUPABASE
# ========================================
# Obter em: https://supabase.com → Seu Projeto → Settings → API

# URL do projeto Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co

# Chave anon (pública - pode ser exposta no frontend)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Chave service role (PRIVADA - nunca expor no frontend)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ========================================
# APP
# ========================================
# URL da aplicação (localhost em dev, domínio em prod)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**IMPORTANTE:**
- **NUNCA** commitar o arquivo `.env.local`
- `.env.local` está no `.gitignore`
- Usar `.env.local.example` apenas como template

### 2. Configurar VS Code (Recomendado)

**Extensões Recomendadas:**

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "yoavbls.pretty-ts-errors",
    "formulahendry.auto-rename-tag",
    "dsznajder.es7-react-js-snippets"
  ]
}
```

**Configurações do Workspace (`.vscode/settings.json`):**

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

---

## 🗄️ SETUP DO SUPABASE

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Escolha um nome: `uzzops-dev` (ou similar)
4. Escolha uma senha segura para o banco
5. Escolha a região (ex: South America - São Paulo)
6. Aguarde ~2 minutos para provisionar

### 2. Obter Credenciais

1. Vá em **Settings** → **API**
2. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`
3. Cole no `.env.local`

### 3. Executar Migrações

**Opção A: Via Supabase Dashboard (Recomendado para primeira vez)**

1. Acesse o **SQL Editor** no dashboard
2. Clique em "New Query"
3. Abra o arquivo `database/migrations/001_initial_schema.sql`
4. Copie TODO o conteúdo e cole no SQL Editor
5. Clique em "Run" (F5)
6. Repita para cada arquivo de migração (em ordem):
   - `001_initial_schema.sql`
   - `002_add_dod_fields.sql`
   - `003_add_sprints.sql`
   - `004_add_sprint_features.sql`
   - `005_add_sprint_protection.sql`
   - `006_add_audit_trail.sql`

**Opção B: Via Supabase CLI (Avançado)**

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref seu-project-id

# Aplicar migrações
supabase db push

# Verificar status
supabase db status
```

### 4. Seed Data (Dados Iniciais)

Execute o arquivo `database/seed.sql` no SQL Editor:

```sql
-- Criar tenant UzzAI
INSERT INTO tenants (id, name, slug) VALUES
  ('00000000-0000-0000-0000-000000000001', 'UzzAI', 'uzzai');

-- Criar projeto UzzApp
INSERT INTO projects (name, description, status, tenant_id) VALUES
  ('UzzApp', 'Chatbot WhatsApp com IA', 'active', '00000000-0000-0000-0000-000000000001');

-- Criar usuários de exemplo
-- (Senhas devem ser configuradas manualmente no Supabase Auth)
```

### 5. Configurar Autenticação

1. Vá em **Authentication** → **Providers**
2. Habilite **Email** provider
3. Desabilite "Confirm email" (para dev)
4. Vá em **Users** → **Add user**
5. Crie usuários:
   - pedro@uzzai.com
   - luis@uzzai.com
   - (outros membros da equipe)

### 6. Configurar RLS (Row Level Security)

As policies de RLS já estão nas migrações, mas verifique:

1. Vá em **Database** → **Tables**
2. Clique em cada tabela
3. Vá na aba **Policies**
4. Verifique se as policies estão ativas

**Exemplo de Policy:**

```sql
-- Permitir read para usuários autenticados do mesmo tenant
CREATE POLICY "Users can view features from their tenant"
  ON features
  FOR SELECT
  TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));
```

---

## 🚀 RODANDO O PROJETO

### 1. Modo Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
pnpm dev

# Servidor estará rodando em:
# → http://localhost:3000
```

**O que acontece ao rodar `pnpm dev`:**
- Next.js inicia servidor em modo desenvolvimento
- Hot Module Replacement (HMR) ativo
- TypeScript type checking
- Tailwind CSS compilation
- API Routes disponíveis

### 2. Acessar a Aplicação

1. Abra [http://localhost:3000](http://localhost:3000)
2. Você será redirecionado para `/login`
3. Faça login com credenciais do Supabase
4. Será redirecionado para `/dashboard`

### 3. Modo Produção (Local)

```bash
# Build para produção
pnpm build

# Iniciar servidor de produção
pnpm start

# Acesse http://localhost:3000
```

**Diferenças do modo produção:**
- Código otimizado e minificado
- Sem HMR
- Mais rápido
- Não mostra erros detalhados

---

## 🔧 COMANDOS ÚTEIS

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Iniciar servidor de produção
pnpm start

# Verificar tipos TypeScript
pnpm tsc --noEmit

# Lint (verificar código)
pnpm lint

# Lint e corrigir automaticamente
pnpm lint --fix
```

### Testes (Sprint 3)

```bash
# Rodar todos os testes
pnpm test

# Rodar testes em watch mode
pnpm test:watch

# Rodar testes com coverage
pnpm test:coverage

# Rodar testes E2E (Playwright)
pnpm test:e2e

# Abrir Playwright UI
pnpm test:e2e:ui
```

### Formatação

```bash
# Formatar todos os arquivos
pnpm prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,md}"

# Verificar formatação sem alterar
pnpm prettier --check "src/**/*.{ts,tsx}"
```

### Componentes Shadcn/ui

```bash
# Adicionar novo componente
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog

# Ver componentes disponíveis
npx shadcn@latest add
```

### Database

```bash
# Conectar ao banco Supabase
supabase db remote connect

# Executar query
supabase db query "SELECT * FROM features LIMIT 5;"

# Criar nova migração
supabase migration new nome_da_migracao

# Aplicar migrações
supabase db push

# Reverter última migração
supabase db reset
```

### Package Management

```bash
# Adicionar dependência
pnpm add nome-do-pacote

# Adicionar dependência de desenvolvimento
pnpm add -D nome-do-pacote

# Remover dependência
pnpm remove nome-do-pacote

# Atualizar dependências
pnpm update

# Verificar dependências desatualizadas
pnpm outdated
```

---

## 🔄 WORKFLOW DE DESENVOLVIMENTO

### 1. Iniciar Nova Feature

```bash
# 1. Atualizar main
git checkout main
git pull origin main

# 2. Criar branch da feature
git checkout -b feature/US-XXX-nome-descritivo

# Exemplo:
git checkout -b feature/US-009-metrics-dashboard
```

**Convenção de Branches:**
- `feature/US-XXX-descrição` - Nova feature
- `fix/descrição` - Bug fix
- `refactor/descrição` - Refatoração
- `docs/descrição` - Documentação
- `test/descrição` - Testes

### 2. Desenvolvimento

```bash
# 1. Rodar servidor
pnpm dev

# 2. Fazer alterações no código

# 3. Testar localmente

# 4. Verificar tipos
pnpm tsc --noEmit

# 5. Verificar lint
pnpm lint
```

### 3. Commit

```bash
# 1. Verificar mudanças
git status

# 2. Adicionar arquivos
git add src/components/dashboard/metrics-card.tsx
git add src/app/api/metrics/route.ts

# 3. Commit com mensagem descritiva
git commit -m "feat(dashboard): add metrics card component

- Create MetricsCard component with velocity display
- Add API endpoint for metrics calculation
- Update dashboard to show metrics

Relates to US-009"
```

**Ver seção [Estrutura de Commits](#estrutura-de-commits) abaixo**

### 4. Push e Pull Request

```bash
# 1. Push para origin
git push origin feature/US-009-metrics-dashboard

# 2. Abrir PR no GitHub
# - Título: [US-009] Metrics Dashboard
# - Descrição: Explicar o que foi feito
# - Reviewers: @luis, @pedro
# - Labels: feature, sprint-3

# 3. Aguardar review e aprovação

# 4. Merge para main (após aprovação)
```

### 5. Deploy Automático

- Merge para `main` → Deploy automático no Vercel
- Preview branches → Deploy de preview automático

---

## 📋 PADRÕES DE CÓDIGO

### TypeScript

**1. Usar tipos explícitos (não `any`):**

```typescript
// ❌ Evitar
function processData(data: any) {
  return data.items;
}

// ✅ Correto
interface DataResponse {
  items: Item[];
  total: number;
}

function processData(data: DataResponse): Item[] {
  return data.items;
}
```

**2. Usar interfaces para objetos, types para unions:**

```typescript
// ✅ Interface para objetos
interface Feature {
  id: string;
  name: string;
  status: FeatureStatus;
}

// ✅ Type para unions
type FeatureStatus = 'backlog' | 'todo' | 'in_progress' | 'done';
```

**3. Usar optional chaining e nullish coalescing:**

```typescript
// ✅ Correto
const userName = user?.profile?.name ?? 'Guest';
const count = items?.length ?? 0;
```

### React Components

**1. Server Components por padrão:**

```typescript
// ✅ Server Component (padrão)
export default async function DashboardPage() {
  const data = await fetchData();
  return <div>{data.title}</div>;
}
```

**2. Client Components quando necessário:**

```typescript
// ✅ Client Component (quando precisa de interatividade)
'use client';

import { useState } from 'react';

export function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**3. Props com interface:**

```typescript
interface CardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, description, children, className }: CardProps) {
  return (
    <div className={cn('border rounded-lg p-4', className)}>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {children}
    </div>
  );
}
```

### Styling (Tailwind)

**1. Usar classes do Tailwind (não CSS inline):**

```typescript
// ❌ Evitar
<div style={{ padding: '16px', color: 'red' }}>

// ✅ Correto
<div className="p-4 text-red-600">
```

**2. Usar `cn()` para classes condicionais:**

```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  'base-class',
  isActive && 'active-class',
  variant === 'primary' && 'primary-class'
)} />
```

**3. Usar cores da marca:**

```typescript
// ✅ Usar variáveis customizadas
<div className="bg-uzzai-primary text-white">
<div className="border-uzzai-secondary">
```

### React Query

**1. Usar hooks customizados:**

```typescript
// ✅ Criar hook em src/hooks/useFeatures.ts
export function useFeatures(projectId: string) {
  return useQuery({
    queryKey: ['features', projectId],
    queryFn: () => fetchFeatures(projectId),
  });
}

// ✅ Usar no componente
function FeaturesList({ projectId }: Props) {
  const { data, isLoading, error } = useFeatures(projectId);
  // ...
}
```

**2. Invalidar queries após mutations:**

```typescript
export function useCreateFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFeature,
    onSuccess: () => {
      // ✅ Invalidar para refetch
      queryClient.invalidateQueries({ queryKey: ['features'] });
    },
  });
}
```

### Validação (Zod)

**1. Definir schemas separadamente:**

```typescript
// src/lib/validations/feature.ts
import { z } from 'zod';

export const createFeatureSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  code: z.string().regex(/^[A-Z0-9-]+$/, 'Código inválido'),
  priority: z.enum(['P0', 'P1', 'P2', 'P3']),
});

export type CreateFeatureInput = z.infer<typeof createFeatureSchema>;
```

**2. Usar no form:**

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFeatureSchema } from '@/lib/validations/feature';

const form = useForm({
  resolver: zodResolver(createFeatureSchema),
  defaultValues: { name: '', code: '', priority: 'P2' },
});
```

---

## 📝 ESTRUTURA DE COMMITS

### Conventional Commits

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/).

**Formato:**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

| Type | Descrição | Exemplo |
|------|-----------|---------|
| `feat` | Nova feature | `feat(features): add DoD tracker` |
| `fix` | Bug fix | `fix(api): correct validation error` |
| `refactor` | Refatoração | `refactor(hooks): simplify useFeatures` |
| `style` | Formatação | `style: format with prettier` |
| `test` | Testes | `test(features): add unit tests` |
| `docs` | Documentação | `docs: update README` |
| `chore` | Manutenção | `chore: update dependencies` |
| `perf` | Performance | `perf(api): optimize query` |

**Scopes Comuns:**

- `dashboard` - Dashboard components/pages
- `features` - Features module
- `sprints` - Sprints module
- `api` - API routes
- `auth` - Authentication
- `db` - Database/migrations
- `ui` - UI components
- `hooks` - Custom hooks

**Exemplos:**

```bash
# Feature simples
git commit -m "feat(dashboard): add KPI cards"

# Feature com descrição
git commit -m "feat(features): add DoD tracker component

- Create DoDSection component
- Add 6 checkboxes for DoD criteria
- Auto-calculate progress bar
- Update feature details page

Closes US-003"

# Bug fix
git commit -m "fix(api): correct sprint protection validation

Sprint protection was not being checked correctly.
Now validates is_protected flag before allowing changes.

Fixes #123"

# Refatoração
git commit -m "refactor(hooks): extract common query logic"

# Breaking change
git commit -m "feat(api)!: change features endpoint response format

BREAKING CHANGE: The /api/features endpoint now returns
data in a different format. Update all clients.

Before: { features: [] }
After: { data: [], meta: {} }"
```

---

## 🐛 TROUBLESHOOTING

### Problema: Erro ao instalar dependências

**Sintoma:**
```bash
pnpm install
# ERR_PNPM_FETCH_404
```

**Solução:**
```bash
# Limpar cache do pnpm
pnpm store prune

# Deletar node_modules e lock file
rm -rf node_modules pnpm-lock.yaml

# Reinstalar
pnpm install
```

---

### Problema: TypeScript errors após pull

**Sintoma:**
```
Type 'X' is not assignable to type 'Y'
```

**Solução:**
```bash
# Limpar cache do TypeScript
rm -rf .next

# Restartar VS Code TypeScript server
# VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"

# Verificar tipos
pnpm tsc --noEmit
```

---

### Problema: Supabase connection error

**Sintoma:**
```
Error: Invalid API key
```

**Solução:**
```bash
# 1. Verificar .env.local
cat .env.local

# 2. Verificar se variáveis estão corretas no Supabase Dashboard
# Settings → API

# 3. Restart do servidor
# Ctrl+C
pnpm dev
```

---

### Problema: Build error em produção

**Sintoma:**
```
Error: Export 'default' not found in module
```

**Solução:**
```typescript
// ❌ Evitar exports mistos
export default function Component() {}
export const otherThing = 123;

// ✅ Usar um padrão consistente
export function Component() {}
export const otherThing = 123;

// Ou
export default Component;
```

---

### Problema: Tailwind classes não aplicadas

**Sintoma:**
Classes do Tailwind não aparecem no browser

**Solução:**
```bash
# 1. Verificar se está no array content do tailwind.config.ts
# content: ['./src/**/*.{ts,tsx}']

# 2. Limpar cache e rebuildar
rm -rf .next
pnpm dev

# 3. Verificar se não está usando string dinâmica
# ❌ Evitar
const color = 'red';
className={`text-${color}-500`}  // NÃO funciona

# ✅ Correto
className={color === 'red' ? 'text-red-500' : 'text-blue-500'}
```

---

### Problema: React Query não refetch após mutation

**Sintoma:**
Dados não atualizam após criar/editar

**Solução:**
```typescript
// Verificar se invalidateQueries está correto
export function useCreateFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFeature,
    onSuccess: () => {
      // ✅ Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['features'] });
      queryClient.invalidateQueries({ queryKey: ['project-overview'] });
    },
  });
}
```

---

### Problema: CORS error em API routes

**Sintoma:**
```
CORS policy: No 'Access-Control-Allow-Origin' header
```

**Solução:**
```typescript
// src/app/api/features/route.ts
export async function GET(request: Request) {
  // ✅ Adicionar headers CORS se necessário
  const response = NextResponse.json(data);
  response.headers.set('Access-Control-Allow-Origin', '*');
  return response;
}

// Ou configurar no next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
};
```

---

### Problema: Hydration error

**Sintoma:**
```
Error: Hydration failed because the initial UI does not match
```

**Solução:**
```typescript
// Causas comuns:
// 1. Server e Client renderizam diferente
// 2. Date/Time sem formatação consistente
// 3. Random values
// 4. Usar window/document em Server Component

// ✅ Solução 1: Usar 'use client' se precisa de browser APIs
'use client';
import { useEffect, useState } from 'react';

// ✅ Solução 2: Suprimir hydration warning (última opção)
<div suppressHydrationWarning>
  {new Date().toLocaleString()}
</div>
```

---

## 🚀 DEPLOY

### Deploy no Vercel (Produção)

**1. Conectar GitHub ao Vercel:**

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Import do GitHub repository
4. Selecione `uzzops-uzzapp`

**2. Configurar Variáveis de Ambiente:**

```bash
# No Vercel Dashboard → Settings → Environment Variables

NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_APP_URL=https://uzzops.vercel.app
```

**3. Deploy:**

- Push para `main` → Deploy automático
- Pull Requests → Preview deploy automático

**4. Domínio Customizado (Opcional):**

1. Vercel Dashboard → Settings → Domains
2. Adicionar domínio: `uzzops.uzzai.com`
3. Configurar DNS (seguir instruções do Vercel)

---

### Deploy Manual (Self-hosted)

```bash
# 1. Build
pnpm build

# 2. Start
pnpm start

# Ou com PM2
pm2 start npm --name "uzzops" -- start
pm2 save
```

---

## 🔄 CI/CD

### GitHub Actions (Futuro - Sprint 3)

Criar `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10.28.0

      - name: Install dependencies
        run: pnpm install

      - name: Type check
        run: pnpm tsc --noEmit

      - name: Lint
        run: pnpm lint

      - name: Test
        run: pnpm test

      - name: Build
        run: pnpm build
```

---

## 📊 MÉTRICAS DE QUALIDADE

### Targets

| Métrica | Target | Como Medir |
|---------|--------|------------|
| **TypeScript Coverage** | 100% | Sem arquivos .js |
| **Test Coverage** | > 70% | `pnpm test:coverage` |
| **Build Time** | < 60s | Vercel dashboard |
| **Bundle Size** | < 500KB | Vercel analytics |
| **Lighthouse Score** | > 90 | Chrome DevTools |
| **Zero ESLint Errors** | ✅ | `pnpm lint` |

---

## 📚 RECURSOS ADICIONAIS

### Documentação Oficial

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Shadcn/ui Docs](https://ui.shadcn.com)

### UzzOPS Docs

- `PROJECT_OVERVIEW.md` - Visão geral do projeto
- `ARCHITECTURE.md` - Arquitetura técnica
- `DATABASE_SCHEMA.md` - Schema do banco
- `API_DOCUMENTATION.md` - Documentação das APIs
- `COMPONENTS_GUIDE.md` - Guia dos componentes
- `DEVELOPMENT_GUIDE.md` - Este arquivo

### Checklists de Sprints

- `SPRINT-1-CHECKLIST.md`
- `SPRINT-2-CHECKLIST.md`
- `SPRINT-3-CHECKLIST.md`

---

## 🎓 ONBOARDING (NOVOS DEVS)

### Checklist para Novos Desenvolvedores

**Dia 1: Setup**
- [ ] Instalar Node.js 22+
- [ ] Instalar pnpm 10+
- [ ] Clonar repositório
- [ ] Instalar dependências (`pnpm install`)
- [ ] Configurar `.env.local`
- [ ] Rodar projeto (`pnpm dev`)
- [ ] Fazer login no sistema

**Dia 2: Conhecer o Código**
- [ ] Ler `PROJECT_OVERVIEW.md`
- [ ] Ler `ARCHITECTURE.md`
- [ ] Explorar estrutura de pastas
- [ ] Entender fluxo de autenticação
- [ ] Entender fluxo de data fetching (React Query)

**Dia 3: Primeira Contribuição**
- [ ] Criar branch de feature
- [ ] Fazer pequena alteração (ex: adicionar campo)
- [ ] Testar localmente
- [ ] Criar commit seguindo padrão
- [ ] Abrir Pull Request
- [ ] Receber review

**Semana 1: Tarefas Pequenas**
- [ ] Corrigir bug simples
- [ ] Adicionar nova validação
- [ ] Melhorar mensagem de erro
- [ ] Adicionar teste

---

## 🤝 CONTRIBUINDO

### Pull Request Guidelines

1. **Fork e Branch**
   - Fork do repositório
   - Criar branch descritiva

2. **Código**
   - Seguir padrões de código
   - Adicionar testes (quando aplicável)
   - Atualizar documentação

3. **Commit**
   - Usar Conventional Commits
   - Commits atômicos (uma mudança por commit)

4. **Pull Request**
   - Título descritivo
   - Descrição completa do que foi feito
   - Screenshots (se UI)
   - Linkar issues relacionadas

5. **Review**
   - Responder comentários
   - Fazer alterações solicitadas
   - Re-request review após mudanças

---

## 📞 SUPORTE

### Canais de Comunicação

- **Slack:** `#uzzops-dev` (questões técnicas)
- **GitHub Issues:** Bugs e features
- **Daily Standup:** Terça e Quinta 9h
- **Tech Lead:** Luis Fernando

### Quando Pedir Ajuda

✅ **Pode perguntar:**
- Dúvidas sobre arquitetura
- Como implementar feature
- Bloqueios técnicos
- Sugestões de melhoria

❌ **Antes de perguntar:**
- Ler documentação
- Tentar debugar por 30min
- Buscar no código similar existente

---

**Última Atualização:** 2026-02-07
**Próxima Revisão:** Após Sprint 3

*"Think Smart, Think Uzz.Ai"*
