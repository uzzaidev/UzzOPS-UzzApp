---
created: 2026-02-06T13:40
updated: 2026-02-06T15:08
sprint: Sprint 0
dates: 10-14 Fev 2026
status: Em Andamento
project: UzzOPS - Sistema de Gerenciamento UzzApp
---

# SPRINT 0 - CHECKLIST EXECUTÁVEL

**Sprint:** Sprint 0 - Setup & Infraestrutura
**Período:** 10-14 Fev 2026 (1 semana)
**Goal:** *"Infraestrutura pronta para desenvolvimento do MVP"*

**Responsáveis:** 👨‍💻 Luis + 🧑‍💻 Pedro

---

## 📊 PROGRESSO GERAL

```
┌─────────────────────────────────────────────────────────┐
│  SPRINT 0 - PROGRESS                                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ████████████░░░░░░░░░░░░░░░░░░░░░░░░  0/35 (0%)       │
│                                                           │
│  DIA 1: ░░░░░░░░ 0/7                                    │
│  DIA 2: ░░░░░░░░ 0/7                                    │
│  DIA 3: ░░░░░░░░ 0/7                                    │
│  DIA 4: ░░░░░░░░ 0/7                                    │
│  DIA 5: ░░░░░░░░ 0/7                                    │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 📅 DIA 1 - SEGUNDA-FEIRA (10 FEV)
### Repositório & Next.js

**Horário:** 9h - 18h
**Responsáveis:** 👨‍💻 Luis + 🧑‍💻 Pedro

---

### ✅ AÇÃO 1: Criar Repositório no GitHub

**Comandos:**
```bash
# No terminal local
mkdir uzzapp-management
cd uzzapp-management

# Criar repo no GitHub via CLI
gh repo create uzzapp-management --public --clone

# Entrar no diretório
cd uzzapp-management
```

**Checklist:**
- [ ] Pasta `uzzapp-management` criada
- [ ] Repositório GitHub criado
- [ ] Repository URL: https://github.com/[seu-user]/uzzapp-management
- [ ] Clone local funcionando

**Tempo estimado:** 10 minutos

---

### ✅ AÇÃO 2: Inicializar Next.js 15

**Comandos:**
```bash
# Usar pnpm (mais rápido)
npx create-next-app@latest . --typescript --tailwind --app --import-alias "@/*"

# Responder prompts:
# ✔ Would you like to use ESLint? Yes
# ✔ Would you like to use `src/` directory? Yes
# ✔ Would you like to use App Router? Yes
# ✔ Would you like to customize the default import alias? Yes (@/*)
```

**Checklist:**
- [ ] Next.js 15 instalado
- [ ] TypeScript configurado
- [ ] Tailwind CSS configurado
- [ ] App Router habilitado
- [ ] `src/` directory criado
- [ ] `pnpm dev` funciona (http://localhost:3000)

**Tempo estimado:** 15 minutos

---

### ✅ AÇÃO 3: Instalar Dependências

**Comandos:**
```bash
# Core dependencies
pnpm install @supabase/supabase-js@latest
pnpm install @supabase/ssr@latest
pnpm install zustand
pnpm install @tanstack/react-query
pnpm install zod
pnpm install react-hook-form
pnpm install date-fns
pnpm install recharts
pnpm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Dev dependencies
pnpm install -D @types/node
pnpm install -D prettier prettier-plugin-tailwindcss
pnpm install -D eslint-config-prettier
```

**Checklist:**
- [ ] Todas as dependências instaladas
- [ ] `package.json` atualizado
- [ ] `node_modules` criado
- [ ] Sem erros no terminal

**Tempo estimado:** 10 minutos

---

### ✅ AÇÃO 4: Instalar Shadcn/ui

**Comandos:**
```bash
npx shadcn@latest init

# Responder prompts:
# ✔ Which style would you like to use? › New York
# ✔ Which color would you like to use as base color? › Slate
# ✔ Do you want to use CSS variables for colors? › yes

# Instalar componentes básicos
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add dialog
npx shadcn@latest add table
npx shadcn@latest add form
npx shadcn@latest add badge
npx shadcn@latest add avatar
npx shadcn@latest add dropdown-menu
npx shadcn@latest add checkbox
```

**Checklist:**
- [ ] Shadcn/ui inicializado
- [ ] `components.json` criado
- [ ] `src/components/ui/` criado
- [ ] 12 componentes instalados
- [ ] Sem erros

**Tempo estimado:** 15 minutos

---

### ✅ AÇÃO 5: Estrutura de Pastas

**Criar estrutura:**
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── features/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── sprints/
│   │   │   └── page.tsx
│   │   ├── team/
│   │   │   └── page.tsx
│   │   ├── risks/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   ├── projects/
│   │   ├── features/
│   │   ├── sprints/
│   │   ├── team/
│   │   └── risks/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/ (shadcn components)
│   ├── dashboard/
│   ├── features/
│   ├── sprints/
│   └── shared/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── utils.ts
│   └── validations.ts
├── types/
│   ├── database.ts
│   └── index.ts
└── hooks/
    ├── useFeatures.ts
    ├── useSprints.ts
    └── useAuth.ts
```

**Checklist:**
- [ ] Todas as pastas criadas
- [ ] Estrutura verificada
- [ ] VSCode Explorer mostra árvore correta

**Tempo estimado:** 10 minutos

---

### ✅ AÇÃO 6: Configurar Prettier

**Criar `.prettierrc`:**
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

**Criar `.prettierignore`:**
```
node_modules
.next
dist
build
```

**Checklist:**
- [ ] `.prettierrc` criado
- [ ] `.prettierignore` criado
- [ ] Testar: `pnpm prettier --write "src/**/*.{ts,tsx}"`

**Tempo estimado:** 5 minutos

---

### ✅ AÇÃO 7: Primeiro Commit

**Comandos:**
```bash
git add .
git commit -m "feat: Initial Next.js 15 setup with Tailwind and Shadcn/ui"
git push origin main
```

**Checklist:**
- [ ] Commit criado
- [ ] Push para GitHub feito
- [ ] Verificar no GitHub que os arquivos estão lá

**Tempo estimado:** 5 minutos

---

### ✅ STATUS FIM DO DIA 1

- [ ] **Next.js rodando localmente** em `http://localhost:3000`
- [ ] **Repositório no GitHub** com primeiro commit
- [ ] **Estrutura de pastas** criada
- [ ] **Shadcn/ui** instalado e funcionando

**Tempo total:** ~1h 10min

---

## 📅 DIA 2 - TERÇA-FEIRA (11 FEV)
### Supabase Setup

**Horário:** 9h - 18h
**Responsável:** 👨‍💻 Luis

---

### ✅ AÇÃO 1: Criar Projeto no Supabase

**Passos:**
1. Acessar https://supabase.com
2. Login com GitHub
3. Clicar em "New Project"
4. Preencher:
   - **Name:** uzzapp-management
   - **Database Password:** [escolher senha forte e anotar]
   - **Region:** South America (São Paulo)
   - **Plan:** Free
5. Aguardar criação (~2 minutos)

**Anotar (Settings → API):**
- `SUPABASE_URL`: https://xxx.supabase.co
- `SUPABASE_ANON_KEY`: eyJxxx...
- `SUPABASE_SERVICE_ROLE_KEY`: eyJxxx... (Settings → API → service_role)

**Checklist:**
- [ ] Projeto criado
- [ ] URL anotada
- [ ] ANON_KEY anotada
- [ ] SERVICE_ROLE_KEY anotada

**Tempo estimado:** 10 minutos

---

### ✅ AÇÃO 2: Configurar Variáveis de Ambiente

**Criar `.env.local`:**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Adicionar ao `.gitignore`:**
```
.env.local
.env*.local
```

**Checklist:**
- [ ] `.env.local` criado
- [ ] Variáveis preenchidas corretamente
- [ ] `.gitignore` atualizado
- [ ] `.env.local` NÃO está no Git (verificar)

**Tempo estimado:** 5 minutos

---

### ✅ AÇÃO 3: Rodar Migrations (Criar Tabelas)

**Criar pasta:** `supabase/migrations/`

**Criar `supabase/migrations/001_init.sql`:**
```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tenants
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert UzzAI tenant
INSERT INTO tenants (id, slug, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'uzzai', 'UzzAI');

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  budget DECIMAL(15, 2),
  budget_spent DECIMAL(15, 2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Features
CREATE TABLE features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,

  version TEXT DEFAULT 'MVP',
  status TEXT DEFAULT 'backlog',
  priority TEXT DEFAULT 'P2',

  -- DoD tracking
  dod_functional BOOLEAN DEFAULT false,
  dod_tests BOOLEAN DEFAULT false,
  dod_code_review BOOLEAN DEFAULT false,
  dod_documentation BOOLEAN DEFAULT false,
  dod_deployed BOOLEAN DEFAULT false,
  dod_user_acceptance BOOLEAN DEFAULT false,

  -- Assignment
  responsible TEXT[],
  due_date DATE,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sprints
CREATE TABLE sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  goal TEXT,

  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  status TEXT DEFAULT 'planned',

  capacity_total INTEGER,
  velocity_target INTEGER,
  velocity_actual INTEGER,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Team Members
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL,
  department TEXT,

  allocation_percent INTEGER DEFAULT 100,
  velocity_avg INTEGER,

  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Risks
CREATE TABLE risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  public_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,

  gut_g INTEGER CHECK (gut_g >= 1 AND gut_g <= 5),
  gut_u INTEGER CHECK (gut_u >= 1 AND gut_u <= 5),
  gut_t INTEGER CHECK (gut_t >= 1 AND gut_t <= 5),
  gut_score INTEGER GENERATED ALWAYS AS (gut_g * gut_u * gut_t) STORED,

  severity_label TEXT,
  status TEXT DEFAULT 'identified',

  mitigation_plan TEXT,
  owner_id UUID REFERENCES team_members(id),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_features_project_status ON features(tenant_id, project_id, status);
CREATE INDEX idx_features_version ON features(tenant_id, version);
CREATE INDEX idx_sprints_project_status ON sprints(tenant_id, project_id, status);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_features_updated_at
  BEFORE UPDATE ON features
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sprints_updated_at
  BEFORE UPDATE ON sprints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risks_updated_at
  BEFORE UPDATE ON risks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Executar migrations:**
1. Acessar Supabase Dashboard → SQL Editor
2. Criar nova query
3. Copiar e colar o conteúdo de `001_init.sql`
4. Clicar em "Run"
5. Verificar: "Success. No rows returned"

**Verificar tabelas criadas:**
1. Ir em Table Editor
2. Ver: `tenants`, `projects`, `features`, `sprints`, `team_members`, `risks`

**Checklist:**
- [ ] Arquivo `001_init.sql` criado
- [ ] Migration executada sem erros
- [ ] 6 tabelas criadas
- [ ] Tenant "uzzai" inserido

**Tempo estimado:** 20 minutos

---

### ✅ AÇÃO 4: Seed Inicial (Dados de Teste)

**Criar `supabase/seed.sql`:**
```sql
-- Criar projeto UzzApp
INSERT INTO projects (tenant_id, code, name, description, status, progress, start_date)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'UZZAPP',
  'UzzApp - Chatbot WhatsApp',
  'Sistema de chatbot com IA integrada para WhatsApp Business',
  'active',
  0,
  '2026-02-10'
);

-- Criar equipe
INSERT INTO team_members (tenant_id, name, email, role, department)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Pedro Vitor', 'pedro@uzzai.com', 'Product Owner + Frontend + UX', 'Dev'),
  ('00000000-0000-0000-0000-000000000001', 'Luis Fernando', 'luis@uzzai.com', 'Tech Lead Full-Stack', 'Dev'),
  ('00000000-0000-0000-0000-000000000001', 'Arthur', 'arthur@uzzai.com', 'Marketing Manager', 'Marketing'),
  ('00000000-0000-0000-0000-000000000001', 'Vitor', 'vitor@uzzai.com', 'Sales Manager', 'Sales'),
  ('00000000-0000-0000-0000-000000000001', 'Lucas', 'lucas@uzzai.com', 'Legal Advisor', 'Legal');
```

**Executar no SQL Editor.**

**Checklist:**
- [ ] Arquivo `seed.sql` criado
- [ ] Seed executado
- [ ] 1 projeto criado (verificar em `projects`)
- [ ] 5 membros criados (verificar em `team_members`)

**Tempo estimado:** 10 minutos

---

### ✅ AÇÃO 5: Criar Supabase Clients

**Criar `src/lib/supabase/client.ts`:**
```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Criar `src/lib/supabase/server.ts`:**
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}
```

**Checklist:**
- [ ] `client.ts` criado
- [ ] `server.ts` criado
- [ ] Imports sem erros
- [ ] TypeScript valida

**Tempo estimado:** 10 minutos

---

### ✅ AÇÃO 6: Testar Conexão

**Criar teste rápido `src/app/page.tsx`:**
```typescript
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: projects } = await supabase.from('projects').select('*');

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Teste Supabase</h1>
      <pre className="mt-4 p-4 bg-gray-100 rounded">
        {JSON.stringify(projects, null, 2)}
      </pre>
    </div>
  );
}
```

**Testar:**
```bash
pnpm dev
# Acessar http://localhost:3000
# Deve mostrar o projeto UzzApp
```

**Checklist:**
- [ ] Página mostra dados do projeto
- [ ] Sem erros no console
- [ ] Conexão funcionando

**Tempo estimado:** 10 minutos

---

### ✅ AÇÃO 7: Commit

**Comandos:**
```bash
git add .
git commit -m "feat: Setup Supabase with migrations and seed data"
git push origin main
```

**Checklist:**
- [ ] Commit criado
- [ ] Push feito

**Tempo estimado:** 5 minutos

---

### ✅ STATUS FIM DO DIA 2

- [ ] **Supabase conectado**
- [ ] **6 tabelas criadas**
- [ ] **Dados seed inseridos**
- [ ] **Teste de conexão passou**

**Tempo total:** ~1h 10min

---

## 📅 DIA 3 - QUARTA-FEIRA (12 FEV)
### Deploy & CI/CD

**Horário:** 9h - 18h
**Responsáveis:** 👨‍💻 Luis + 🧑‍💻 Pedro

---

### ✅ AÇÃO 1: Deploy Inicial na Vercel

**Passos:**
1. Acessar https://vercel.com
2. Login com GitHub
3. Clicar em "Add New Project"
4. Import Git Repository: `uzzapp-management`
5. Configure Project:
   - Framework Preset: Next.js
   - Build Command: `pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`
6. Adicionar Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
7. Clicar em "Deploy"
8. Aguardar build (~3 minutos)

**URL de produção:** https://uzzapp-management.vercel.app

**Checklist:**
- [ ] Projeto importado
- [ ] Environment variables configuradas
- [ ] Deploy bem-sucedido
- [ ] URL funcionando

**Tempo estimado:** 15 minutos

---

### ✅ AÇÃO 2: Configurar CI/CD (GitHub Actions)

**Criar `.github/workflows/ci.yml`:**
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Type Check
        run: pnpm tsc --noEmit

      - name: Build
        run: pnpm build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

**Adicionar secrets no GitHub:**
1. Settings → Secrets and variables → Actions
2. New repository secret:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Checklist:**
- [ ] Arquivo `ci.yml` criado
- [ ] Secrets adicionados
- [ ] Push para testar CI
- [ ] GitHub Actions passa ✅

**Tempo estimado:** 15 minutos

---

### ✅ AÇÃO 3: Criar Layout Base

**Criar `src/app/(dashboard)/layout.tsx`:**
```typescript
import { Sidebar } from '@/components/shared/sidebar';
import { Topbar } from '@/components/shared/topbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
```

**Criar `src/components/shared/sidebar.tsx`:**
```typescript
import Link from 'next/link';
import { Home, FileText, Calendar, Users, AlertTriangle } from 'lucide-react';

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: FileText, label: 'Features', href: '/features' },
  { icon: Calendar, label: 'Sprints', href: '/sprints' },
  { icon: Users, label: 'Team', href: '/team' },
  { icon: AlertTriangle, label: 'Risks', href: '/risks' },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-[#2D6A5E] text-white">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-2xl font-bold">UzzOps</h1>
        <p className="text-sm text-white/70">Management System</p>
      </div>

      {/* Menu */}
      <nav className="px-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

**Criar `src/components/shared/topbar.tsx`:**
```typescript
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export function Topbar() {
  return (
    <header className="h-16 border-b bg-white px-6 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold">Sistema de Gerenciamento</h2>
        <p className="text-sm text-gray-500">UzzApp</p>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost">Logout</Button>
        <Avatar>
          <AvatarImage src="/pedro.jpg" />
          <AvatarFallback>PV</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
```

**Instalar lucide-react:**
```bash
pnpm install lucide-react
```

**Checklist:**
- [ ] Layout criado
- [ ] Sidebar criado
- [ ] Topbar criado
- [ ] Lucide icons instalado
- [ ] Layout renderiza

**Tempo estimado:** 20 minutos

---

### ✅ AÇÃO 4: Criar Dashboard Placeholder

**Criar `src/app/(dashboard)/dashboard/page.tsx`:**
```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#2D6A5E]">Ativo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progresso</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#4A90A4]">0%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Equipe</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">5 pessoas</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

**Checklist:**
- [ ] Dashboard page criado
- [ ] 4 cards renderizando
- [ ] Cores da paleta UzzAI aplicadas
- [ ] Responsivo

**Tempo estimado:** 15 minutos

---

### ✅ AÇÃO 5: Testar e Fazer Deploy

**Comandos:**
```bash
# Testar localmente
pnpm dev

# Commit e push (auto-deploy via Vercel)
git add .
git commit -m "feat: Add dashboard layout and placeholder page"
git push origin main
```

**Aguardar deploy na Vercel (~2 min).**

**Testar produção:**
- Acessar https://uzzapp-management.vercel.app/dashboard
- Verificar layout

**Checklist:**
- [ ] Teste local funcionou
- [ ] Commit feito
- [ ] Deploy automático na Vercel
- [ ] Produção funcionando

**Tempo estimado:** 10 minutos

---

### ✅ AÇÃO 6: Configurar Tailwind com Paleta UzzAI

**Editar `tailwind.config.ts`:**
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  // ... (existing config)
  theme: {
    extend: {
      colors: {
        uzzai: {
          primary: '#2D6A5E', // Verde escuro
          secondary: '#4A90A4', // Azul médio (turquesa)
          warning: '#F4D03F', // Amarelo/Dourado
          dark: '#1F1F1F', // Preto/Charcoal
          gray: '#B0B0B0', // Cinza médio
        },
      },
    },
  },
};

export default config;
```

**Checklist:**
- [ ] `tailwind.config.ts` atualizado
- [ ] Cores da paleta adicionadas
- [ ] Rebuild: `pnpm dev` (reiniciar)

**Tempo estimado:** 5 minutos

---

### ✅ AÇÃO 7: Commit Final do Dia

**Comandos:**
```bash
git add .
git commit -m "feat: Configure Tailwind with UzzAI color palette"
git push origin main
```

**Checklist:**
- [ ] Commit feito
- [ ] Deploy automático

**Tempo estimado:** 5 minutos

---

### ✅ STATUS FIM DO DIA 3

- [ ] **Deploy funcionando** na Vercel
- [ ] **Layout básico** pronto
- [ ] **CI/CD** configurado
- [ ] **Paleta de cores** aplicada

**Tempo total:** ~1h 25min

---

## 📅 DIA 4 - QUINTA-FEIRA (13 FEV)
### Autenticação + Testes

**Horário:** 9h - 18h
**Responsável:** 👨‍💻 Luis

---

### ✅ AÇÃO 1: Configurar Supabase Auth

**No Supabase Dashboard:**
1. Authentication → Providers → Email → Enable
2. Configuration → Site URL: `https://uzzapp-management.vercel.app`
3. Configuration → Redirect URLs:
   - `http://localhost:3000/**`
   - `https://uzzapp-management.vercel.app/**`

**Checklist:**
- [ ] Email Auth habilitado
- [ ] Site URL configurado
- [ ] Redirect URLs configuradas

**Tempo estimado:** 5 minutos

---

### ✅ AÇÃO 2: Criar Página de Login

**Criar `src/app/(auth)/login/page.tsx`:**
```typescript
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      router.push('/dashboard');
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="w-16 h-16 bg-uzzai-primary rounded-lg mx-auto flex items-center justify-center">
            <span className="text-2xl font-bold text-white">Uzz</span>
          </div>
          <CardTitle className="text-2xl">UzzOps</CardTitle>
          <p className="text-gray-600">Management System</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-uzzai-primary hover:bg-uzzai-primary/90"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Criar `src/app/(auth)/layout.tsx`:**
```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
```

**Checklist:**
- [ ] Login page criada
- [ ] Layout auth criado
- [ ] Form funciona
- [ ] Estilos aplicados

**Tempo estimado:** 20 minutos

---

### ✅ AÇÃO 3: Criar Middleware de Autenticação

**Criar `src/middleware.ts`:**
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirecionar para login se não autenticado
  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirecionar para dashboard se já autenticado e tentando acessar login
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
```

**Checklist:**
- [ ] Middleware criado
- [ ] Auth check funciona
- [ ] Redirects funcionam

**Tempo estimado:** 15 minutos

---

### ✅ AÇÃO 4: Criar Primeiro Usuário

**No Supabase Dashboard:**
1. Authentication → Users → Add User
2. Preencher:
   - Email: pedro@uzzai.com
   - Password: [escolher senha]
   - Auto Confirm User: Yes
3. Create User

**Checklist:**
- [ ] Usuário criado
- [ ] Email confirmado automaticamente

**Tempo estimado:** 5 minutos

---

### ✅ AÇÃO 5: Testar Login

**Passos:**
1. Rodar `pnpm dev`
2. Acessar http://localhost:3000
3. Deve redirecionar para `/login`
4. Entrar com pedro@uzzai.com + senha
5. Deve redirecionar para `/dashboard`
6. Tentar acessar `/login` novamente
7. Deve redirecionar para `/dashboard` (já autenticado)

**Checklist:**
- [ ] Redirect para login funciona
- [ ] Login bem-sucedido
- [ ] Redirect para dashboard funciona
- [ ] Proteção de rotas funciona

**Tempo estimado:** 10 minutos

---

### ✅ AÇÃO 6: Setup Testes (Jest)

**Instalar:**
```bash
pnpm install -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom @testing-library/user-event
```

**Criar `jest.config.js`:**
```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

module.exports = createJestConfig(customJestConfig);
```

**Criar `jest.setup.js`:**
```javascript
import '@testing-library/jest-dom';
```

**Adicionar script ao `package.json`:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

**Criar teste exemplo `src/__tests__/example.test.tsx`:**
```typescript
import { render, screen } from '@testing-library/react';

describe('Example Test', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});
```

**Rodar:**
```bash
pnpm test
```

**Checklist:**
- [ ] Jest instalado
- [ ] Config criada
- [ ] Teste exemplo passa
- [ ] `pnpm test` funciona

**Tempo estimado:** 15 minutos

---

### ✅ AÇÃO 7: Commit

**Comandos:**
```bash
git add .
git commit -m "feat: Add authentication with Supabase and setup Jest"
git push origin main
```

**Checklist:**
- [ ] Commit feito
- [ ] Deploy automático

**Tempo estimado:** 5 minutos

---

### ✅ STATUS FIM DO DIA 4

- [ ] **Auth funcionando**
- [ ] **Login page** completa
- [ ] **Middleware** protegendo rotas
- [ ] **Jest** configurado

**Tempo total:** ~1h 15min

---

## 📅 DIA 5 - SEXTA-FEIRA (14 FEV)
### Sprint Planning Sprint 1

**Horário:** 14h - 18h (4 horas)
**Responsáveis:** 🧑‍💻 Pedro (facilita) + 👨‍💻 Luis + 📊 Arthur + 💼 Vitor + ⚖️ Lucas

---

### ✅ AÇÃO 1: Retrospective do Sprint 0

**Formato: Start/Stop/Continue (30 min)**

**Perguntas:**
1. O que começar a fazer? (START)
2. O que parar de fazer? (STOP)
3. O que continuar fazendo? (CONTINUE)

**Exemplo:**
- START: Daily standups às 9h (15 min)
- STOP: Commits muito grandes
- CONTINUE: Pair programming

**Checklist:**
- [ ] Retrospective realizada
- [ ] Ações documentadas
- [ ] Compromissos assumidos

**Tempo estimado:** 30 minutos

---

### ✅ AÇÃO 2: Review do Sprint 0

**Demo (15 min):**
- Mostrar repositório GitHub
- Mostrar Supabase (tabelas)
- Mostrar deploy Vercel
- Mostrar login funcionando
- Mostrar dashboard placeholder

**Checklist:**
- [ ] Demo realizada
- [ ] Feedback coletado

**Tempo estimado:** 15 minutos

---

### ✅ AÇÃO 3: Apresentar User Stories do Sprint 1

**User Stories (30 min):**
- ✅ US-008: Autenticação (JÁ FEITO!)
- 🚧 US-001: Dashboard Overview
- 📝 US-002: Gestão de Features

**Pedro apresenta cada US:**
- Ler "Como/Eu quero/Para que"
- Ler critérios de aceitação
- Tirar dúvidas

**Checklist:**
- [ ] US-001 apresentada
- [ ] US-002 apresentada
- [ ] Dúvidas esclarecidas

**Tempo estimado:** 30 minutos

---

### ✅ AÇÃO 4: Quebrar em Subtasks

**US-001: Dashboard Overview (3 dias)**
- [ ] Task 1: Criar API `/api/projects/:id/overview` [Luis - 1d]
- [ ] Task 2: Componente `DashboardCard` [Pedro - 0.5d]
- [ ] Task 3: Componente `ProgressBar` [Pedro - 0.5d]
- [ ] Task 4: Integrar API com componentes [Pedro - 0.5d]
- [ ] Task 5: Testes E2E do dashboard [Pedro - 0.5d]

**US-002: Gestão de Features (5 dias)**
- [ ] Task 1: Criar API CRUD `/api/features` [Luis - 2d]
- [ ] Task 2: Página de listagem `/features` [Pedro - 1d]
- [ ] Task 3: Formulário de criação [Pedro - 1d]
- [ ] Task 4: Página de detalhes `/features/:id` [Pedro - 0.5d]
- [ ] Task 5: Testes E2E [Pedro - 0.5d]

**Checklist:**
- [ ] Todas as subtasks definidas
- [ ] Responsável atribuído
- [ ] Estimativa definida

**Tempo estimado:** 45 minutos

---

### ✅ AÇÃO 5: Criar Issues no GitHub

**Para cada task:**
1. Ir em Issues → New Issue
2. Título: `[Sprint-1] Task: Criar API /api/projects/:id/overview`
3. Labels: `sprint-1`, `backend`, `assigned:luis`
4. Assignee: Luis
5. Milestone: Sprint 1
6. Create Issue

**Checklist:**
- [ ] 10 issues criadas (5 US-001 + 5 US-002)
- [ ] Todas com labels corretas
- [ ] Assignees corretos

**Tempo estimado:** 20 minutos

---

### ✅ AÇÃO 6: Definir Sprint Goal

**Sprint 1 Goal:**
> "Dashboard com KPIs reais + CRUD completo de Features funcionando"

**Capacity:**
- Pedro: 10 dias (2 semanas)
- Luis: 10 dias (2 semanas)
- Total: 20 dias

**Estimated Work:**
- US-001: 3 dias
- US-002: 5 dias
- Total: 8 dias

**Buffer:** 12 dias (60%) ✅ **Ótimo!**

**Checklist:**
- [ ] Goal definido
- [ ] Capacity calculada
- [ ] Buffer adequado

**Tempo estimado:** 10 minutos

---

### ✅ AÇÃO 7: Atualizar README

**Editar `README.md`:**
```markdown
# UzzOps - Sistema de Gerenciamento UzzApp

Sistema de gerenciamento de projetos para desenvolvimento do UzzApp.

## Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind, Shadcn/ui
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Deploy:** Vercel

## Development

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Run tests
pnpm test

# Build
pnpm build
```

## Current Sprint

**Sprint 1** (17 Fev - 28 Fev 2026)
- ✅ US-008: Autenticação (Done)
- 📝 US-001: Dashboard Overview (Todo)
- 📝 US-002: Gestão de Features (Todo)

**Goal:** Dashboard com KPIs reais + CRUD completo de Features funcionando

## Team

- Pedro: PO + Frontend + UX
- Luis: Backend + Frontend
- Arthur: Marketing
- Vitor: Vendas
- Lucas: Jurídico

## Sprint 0 Done ✅

- ✅ Next.js 15 + TypeScript
- ✅ Supabase conectado (6 tabelas)
- ✅ Deploy na Vercel
- ✅ CI/CD com GitHub Actions
- ✅ Autenticação funcionando
- ✅ Layout básico
```

**Checklist:**
- [ ] README atualizado
- [ ] Commit e push

**Tempo estimado:** 10 minutos

---

### ✅ AÇÃO 8: Commit e Celebrar 🎉

**Comandos:**
```bash
git add .
git commit -m "docs: Update README with Sprint 1 planning"
git push origin main
```

**Celebrar:**
- Sprint 0 completo! 🎉
- Infraestrutura pronta!
- Próxima segunda começamos o Sprint 1!

**Checklist:**
- [ ] Commit feito
- [ ] Equipe alinhada
- [ ] Próxima semana planejada

**Tempo estimado:** 10 minutos

---

### ✅ STATUS FIM DO SPRINT 0

# 🎉 SPRINT 0 COMPLETO! 🎉

**Entregas:**
- ✅ Repositório GitHub criado
- ✅ Next.js 15 + TypeScript funcionando
- ✅ Supabase conectado (6 tabelas criadas)
- ✅ Deploy na Vercel
- ✅ CI/CD com GitHub Actions
- ✅ Autenticação funcionando
- ✅ Layout básico (Sidebar + Topbar)
- ✅ Dashboard placeholder
- ✅ Jest configurado
- ✅ Paleta de cores UzzAI aplicada

**Próximo Sprint:**
- Sprint 1 começa Segunda-feira (17 Fev)
- Daily standup: 9h
- Foco: US-001 + US-002

**Tempo total Sprint 0:** ~6 horas de trabalho efetivo

---

## 📊 MÉTRICAS DO SPRINT 0

| Métrica | Target | Atual | Status |
|---------|--------|-------|--------|
| Setup completo | 5 dias | 5 dias | ✅ |
| Deploy funcionando | Sim | Sim | ✅ |
| CI/CD | Sim | Sim | ✅ |
| Auth | Sim | Sim | ✅ |
| Testes | Setup | Done | ✅ |

---

## 🚀 READY FOR SPRINT 1!

**Segunda-feira (17 Fev):**
- 9h: Daily standup
- 9h15: Luis começa API overview
- 9h15: Pedro começa Dashboard components

**Documentação:**
- Ver `SPRINT-1-CHECKLIST.md` (próximo arquivo)
- Ver `999 - BACKLOG_INICIAL.md` para detalhes das US

---

**Criado por:** Pedro Vitor + Claude AI
**Data:** 2026-02-06
**Status:** ✅ COMPLETO

*"Think Smart, Think Uzz.Ai"*
