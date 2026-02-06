---
created: 2026-02-06T13:25
updated: 2026-02-06T16:23
project: Sistema de Gerenciamento UzzApp
type: Execution Plan
status: Ready to Execute
---

# PLANO DE EXECUÇÃO - SPRINTS PASSO A PASSO

**Versão:** 1.0.0
**Data:** 2026-02-06
**Autor:** Pedro Vitor Pagliarin + Claude AI
**Status:** ✅ Pronto para Execução

---

## 📋 ÍNDICE

1. [Como Usar Este Documento](#1-como-usar-este-documento)
2. [Sprint 0: Setup (1 semana)](#2-sprint-0-setup-1-semana)
3. [Sprint 1: Fundamentos (2 semanas)](#3-sprint-1-fundamentos-2-semanas)
4. [Sprint 2: Gestão Avançada (2 semanas)](#4-sprint-2-gestão-avançada-2-semanas)
5. [Sprint 3: MVP Final (2 semanas)](#5-sprint-3-mvp-final-2-semanas)
6. [Checklist de Deploy](#6-checklist-de-deploy)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. COMO USAR ESTE DOCUMENTO

### 1.1 Objetivo

Este documento é um **GUIA EXECUTÁVEL** com comandos concretos e checklists para implementar o Sistema de Gerenciamento UzzApp em 7 semanas (Sprint 0 + 3 Sprints do MVP).

### 1.2 Convenções

**Ícones:**
- ✅ **Ação obrigatória** (não pule)
- 🔧 **Comando terminal** (copie e execute)
- 📝 **Arquivo a criar/editar**
- ⚠️ **Atenção/Cuidado**
- 💡 **Dica/Sugestão**

**Responsáveis:**
- 🧑‍💻 **Pedro:** Gestor/PO + UX/UI + Frontend
- 👨‍💻 **Luis:** Backend + Frontend
- 📊 **Arthur:** Marketing
- 💼 **Vitor:** Vendas
- ⚖️ **Lucas:** Jurídico

### 1.3 Estrutura de Cada Sprint

Para cada sprint:
1. **Goal** (objetivo principal)
2. **Features** (user stories a implementar)
3. **Checklist Dia a Dia** (tarefas executáveis)
4. **Definition of Done** (critérios para considerar concluído)

---

## 2. SPRINT 0: SETUP (1 SEMANA)

### 2.1 Goal do Sprint

> **"Infraestrutura pronta para desenvolvimento do MVP."**

**Entrega:** Projeto Next.js rodando na Vercel com Supabase conectado, CI/CD configurado.

### 2.2 Checklist Sprint 0

---

#### **DIA 1 (Segunda-feira) - Repositório & Next.js**

**Responsável:** 👨‍💻 Luis + 🧑‍💻 Pedro

✅ **Ação 1: Criar repositório no GitHub**

🔧 Comandos:
```bash
# No terminal local
mkdir uzzapp-management
cd uzzapp-management

# Criar repo no GitHub via CLI (ou manualmente no site)
gh repo create uzzapp-management --public --clone

# Entrar no diretório
cd uzzapp-management
```

---

✅ **Ação 2: Inicializar Next.js 15**

🔧 Comandos:
```bash
# Usar pnpm (mais rápido)
npx create-next-app@latest . --typescript --tailwind --app --import-alias "@/*"

# Responder prompts:
# ✔ Would you like to use ESLint? Yes
# ✔ Would you like to use `src/` directory? Yes
# ✔ Would you like to use App Router? Yes
# ✔ Would you like to customize the default import alias? Yes (@/*)
```

---

✅ **Ação 3: Instalar dependências do projeto**

🔧 Comandos:
```bash
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

---

✅ **Ação 4: Instalar Shadcn/ui**

🔧 Comandos:
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
```

---

✅ **Ação 5: Estrutura de pastas**

📝 Criar estrutura:
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

---

✅ **Ação 6: Configurar Prettier**

📝 Criar `.prettierrc`:
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

---

✅ **Ação 7: Primeiro commit**

🔧 Comandos:
```bash
git add .
git commit -m "feat: Initial Next.js 15 setup with Tailwind and Shadcn/ui"
git push origin main
```

**Status fim do dia 1:** ✅ Next.js rodando localmente em `localhost:3000`

---

#### **DIA 2 (Terça-feira) - Supabase Setup**

**Responsável:** 👨‍💻 Luis

✅ **Ação 1: Criar projeto no Supabase**

1. Acessar https://supabase.com
2. Criar novo projeto:
   - **Name:** uzzapp-management
   - **Database Password:** [escolher senha forte]
   - **Region:** South America (São Paulo)
   - **Plan:** Free (para começar)
3. Anotar:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

---

✅ **Ação 2: Configurar variáveis de ambiente**

📝 Criar `.env.local`:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

📝 Adicionar ao `.gitignore`:
```
.env.local
.env*.local
```

---

✅ **Ação 3: Rodar migrations (criar tabelas)**

📝 Criar `supabase/migrations/001_init.sql`:
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

---

✅ **Ação 4: Executar migrations**

🔧 Comandos (no SQL Editor do Supabase Dashboard):
1. Acessar https://supabase.com/dashboard/project/xxx/sql
2. Copiar e colar o conteúdo de `001_init.sql`
3. Clicar em "Run"
4. Verificar que as tabelas foram criadas

**Alternativa (CLI):**
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link projeto
supabase link --project-ref xxx

# Rodar migrations
supabase db push
```

---

✅ **Ação 5: Seed inicial (dados de teste)**

📝 Criar `supabase/seed.sql`:
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

Executar no SQL Editor.

---

✅ **Ação 6: Criar Supabase clients**

📝 Criar `src/lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

📝 Criar `src/lib/supabase/server.ts`:
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

---

✅ **Ação 7: Commit**

🔧 Comandos:
```bash
git add .
git commit -m "feat: Setup Supabase with migrations and seed data"
git push origin main
```

**Status fim do dia 2:** ✅ Supabase conectado, tabelas criadas, seed rodado

---

#### **DIA 3 (Quarta-feira) - Deploy & CI/CD**

**Responsável:** 👨‍💻 Luis + 🧑‍💻 Pedro

✅ **Ação 1: Deploy inicial na Vercel**

1. Acessar https://vercel.com
2. Clicar em "Add New Project"
3. Import Git Repository: `uzzapp-management`
4. Configure Project:
   - Framework Preset: Next.js
   - Build Command: `pnpm build`
   - Output Directory: `.next`
5. Adicionar Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
6. Deploy

**URL:** https://uzzapp-management.vercel.app

---

✅ **Ação 2: Configurar CI/CD (GitHub Actions)**

📝 Criar `.github/workflows/ci.yml`:
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

Adicionar secrets no GitHub (Settings → Secrets and variables → Actions).

---

✅ **Ação 3: Criar layout base**

📝 Criar `src/app/(dashboard)/layout.tsx`:
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

📝 Criar `src/components/shared/sidebar.tsx`:
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
        <h1 className="text-2xl font-bold">UzzApp</h1>
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

📝 Criar `src/components/shared/topbar.tsx`:
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

---

✅ **Ação 4: Criar página de dashboard placeholder**

📝 Criar `src/app/(dashboard)/dashboard/page.tsx`:
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
            <p className="text-2xl font-bold">Ativo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progresso</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0%</p>
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

---

✅ **Ação 5: Testar localmente e fazer deploy**

🔧 Comandos:
```bash
# Testar
pnpm dev

# Commit e push (auto-deploy via Vercel)
git add .
git commit -m "feat: Add dashboard layout and placeholder page"
git push origin main
```

**Status fim do dia 3:** ✅ Deploy funcionando, layout básico pronto

---

#### **DIA 4 (Quinta-feira) - Auth + Testes**

**Responsável:** 👨‍💻 Luis

✅ **Ação 1: Configurar Supabase Auth**

No Supabase Dashboard:
1. Authentication → Email Auth → Enable
2. Configuration → Site URL: `https://uzzapp-management.vercel.app`
3. Configuration → Redirect URLs: adicionar `http://localhost:3000/**`

---

✅ **Ação 2: Criar páginas de login**

📝 Criar `src/app/(auth)/login/page.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    }

    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold">UzzApp</h2>
          <p className="mt-2 text-gray-600">Management System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  );
}
```

---

✅ **Ação 3: Middleware de autenticação**

📝 Criar `src/middleware.ts`:
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

---

✅ **Ação 4: Criar primeiro usuário**

No Supabase Dashboard → Authentication → Users → Add User:
- Email: pedro@uzzai.com
- Password: [escolher senha]
- Auto Confirm: Yes

---

✅ **Ação 5: Setup testes (Jest)**

🔧 Comandos:
```bash
pnpm install -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

📝 Criar `jest.config.js`:
```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
};

module.exports = createJestConfig(customJestConfig);
```

📝 Criar `jest.setup.js`:
```javascript
import '@testing-library/jest-dom';
```

📝 Adicionar script ao `package.json`:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

---

✅ **Ação 6: Commit**

🔧 Comandos:
```bash
git add .
git commit -m "feat: Add authentication with Supabase and middleware"
git push origin main
```

**Status fim do dia 4:** ✅ Auth funcionando, testes configurados

---

#### **DIA 5 (Sexta-feira) - Sprint Planning Sprint 1**

**Responsável:** 🧑‍💻 Pedro (facilita) + 👨‍💻 Luis

✅ **Ação 1: Sprint Planning Meeting (2 horas)**

**Agenda:**
1. Review do Sprint 0 (15 min)
2. Apresentar US-001, US-002, US-008 (30 min)
3. Quebrar cada US em subtasks (45 min)
4. Estimar com Planning Poker (30 min)

**Quadro:**
```
Sprint 1 Goal: "Autenticação + Dashboard + Gestão de Features funcionando"

Backlog do Sprint 1:
├─ US-008: Autenticação ✅ (JÁ FEITO no Sprint 0!)
├─ US-001: Dashboard Overview (3 dias)
│  ├─ Task: Criar API /api/projects/:id/overview [Luis - 1d]
│  ├─ Task: Componente DashboardCard [Pedro - 0.5d]
│  ├─ Task: Componente ProgressBar [Pedro - 0.5d]
│  ├─ Task: Integrar API com componentes [Pedro - 0.5d]
│  └─ Task: Testes E2E do dashboard [Pedro - 0.5d]
└─ US-002: Gestão de Features (5 dias)
   ├─ Task: Criar tabela features (JÁ FEITO)
   ├─ Task: Criar API CRUD /api/features [Luis - 2d]
   ├─ Task: Página de listagem /features [Pedro - 1d]
   ├─ Task: Formulário de criação [Pedro - 1d]
   ├─ Task: Página de detalhes /features/:id [Pedro - 0.5d]
   └─ Task: Testes E2E [Pedro - 0.5d]

Capacity: Pedro (5d) + Luis (5d) = 10 dias
Estimated: 8 dias
Buffer: 2 dias ✅
```

---

✅ **Ação 2: Criar issues no GitHub**

Para cada task, criar issue:
- Título: `[Sprint-1] Task: Criar API /api/projects/:id/overview`
- Labels: `sprint-1`, `backend`, `assigned:luis`
- Assignee: Luis
- Milestone: Sprint 1

---

✅ **Ação 3: Atualizar README**

📝 Editar `README.md`:
```markdown
# UzzApp Management System

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

**Sprint 1** (Semana 1-2)
- ✅ US-008: Autenticação (Done)
- 🚧 US-001: Dashboard Overview (In Progress)
- 📝 US-002: Gestão de Features (Todo)

## Team

- Pedro: PO + Frontend + UX
- Luis: Backend + Frontend
- Arthur: Marketing
- Vitor: Vendas
- Lucas: Jurídico
```

---

✅ **Ação 4: Retrospective do Sprint 0**

**Formato: Start/Stop/Continue**

**START:**
- Daily standups às 9h (15 min)
- Code review obrigatório antes de merge

**STOP:**
- Commits muito grandes (quebrar em atomic commits)

**CONTINUE:**
- Pair programming para features complexas
- Documentar decisões importantes

---

✅ **Ação 5: Commit e celebrar**

🔧 Comandos:
```bash
git add .
git commit -m "docs: Update README and Sprint 1 planning"
git push origin main
```

**Status fim do Sprint 0:** 🎉 **MVP PRONTO PARA COMEÇAR!**

---

## 3. SPRINT 1: FUNDAMENTOS (2 SEMANAS)

### 3.1 Goal do Sprint

> **"Autenticação ✅ + Dashboard com KPIs + CRUD completo de Features."**

**Entrega:** Dashboard mostrando dados reais + Página de gestão de features funcionando.

### 3.2 Features do Sprint 1

- ✅ US-008: Autenticação (JÁ FEITO)
- 🚧 US-001: Dashboard Overview
- 📝 US-002: Gestão de Features

### 3.3 Checklist Sprint 1

---

#### **SEMANA 1**

**Segunda (Dia 1):**
- Daily standup 9h
- 👨‍💻 Luis: Começar API `/api/projects/:id/overview`
- 🧑‍💻 Pedro: Começar componentes do Dashboard (Cards)

**Terça (Dia 2):**
- Daily standup 9h
- 👨‍💻 Luis: Finalizar API overview + testar com Postman
- 🧑‍💻 Pedro: Finalizar Dashboard components + integrar API

**Quarta (Dia 3):**
- Daily standup 9h
- 👨‍💻 Luis: Começar API CRUD `/api/features`
- 🧑‍💻 Pedro: Testes E2E do dashboard + ajustes

**Quinta (Dia 4):**
- Daily standup 9h
- 👨‍💻 Luis: Continuar API CRUD (GET list, POST create)
- 🧑‍💻 Pedro: Começar página `/features` (lista)

**Sexta (Dia 5):**
- Daily standup 9h
- 👨‍💻 Luis: Finalizar API CRUD (GET :id, PATCH, DELETE)
- 🧑‍💻 Pedro: Continuar página features (integrar API)
- **Sprint Review interno (16h):** Demo do Dashboard funcionando

---

#### **SEMANA 2**

**Segunda (Dia 6):**
- Daily standup 9h
- 👨‍💻 Luis: Ajustes na API baseados no feedback
- 🧑‍💻 Pedro: Criar formulário de feature (modal)

**Terça (Dia 7):**
- Daily standup 9h
- 🧑‍💻 Pedro: Finalizar formulário + validações (Zod)
- 👨‍💻 Luis: Code review + ajudar Pedro

**Quarta (Dia 8):**
- Daily standup 9h
- 🧑‍💻 Pedro: Criar página de detalhes `/features/:id`
- 👨‍💻 Luis: Preparar próximo sprint (US-003)

**Quinta (Dia 9):**
- Daily standup 9h
- 🧑‍💻 Pedro: Testes E2E de features
- 👨‍💻 Luis: Testes unitários da API

**Sexta (Dia 10):**
- Daily standup 9h
- **Sprint Review (14h):** Demo para toda equipe
- **Retrospective (16h):** O que melhorar?
- **Sprint Planning Sprint 2 (17h):** Planejar próximas 2 semanas
- **Deploy em produção** 🚀

---

### 3.4 Definition of Done - Sprint 1

**US-001: Dashboard Overview**
- [x] API `/api/projects/:id/overview` retorna JSON com KPIs
- [x] Dashboard mostra 4 cards: Status, Progresso, Features, Equipe
- [x] Progresso calcula automaticamente: `(features_done / features_total) * 100`
- [x] Seção "Tempo de Execução" com barra visual
- [x] Dashboard responsivo (mobile, tablet, desktop)
- [x] Testes E2E: Cypress testa loading do dashboard
- [x] Code review aprovado
- [x] Deploy em produção
- [x] Pedro validou

**US-002: Gestão de Features**
- [x] API CRUD completa: GET, POST, PATCH, DELETE
- [x] Página `/features` lista features em tabela
- [x] Filtros funcionam: versão, status, categoria
- [x] Botão "Nova Feature" abre modal
- [x] Formulário cria feature com validação (Zod)
- [x] Página `/features/:id` mostra detalhes
- [x] Busca por nome funciona
- [x] Testes E2E: criar, editar, deletar feature
- [x] Code review aprovado
- [x] Deploy em produção
- [x] Pedro validou

---

## 4. SPRINT 2: GESTÃO AVANÇADA (2 SEMANAS)

### 4.1 Goal do Sprint

> **"Definition of Done tracking + Gestão de Sprints + Atribuição de responsáveis funcionando."**

**Entrega:** Features com DoD rastreável + Sprints criados + Timeline visual.

### 4.2 Features do Sprint 2

- US-003: Definition of Done Tracker
- US-004: Gestão de Sprints
- US-005: Atribuição de Responsáveis e Prazos
- US-006: Timeline Visual (Gantt Simplificado)

### 4.3 Checklist Sprint 2

*(Formato similar ao Sprint 1, dia a dia)*

---

## 5. SPRINT 3: MVP FINAL (2 SEMANAS)

### 5.1 Goal do Sprint

> **"Gestão de Riscos + Testes completos + Deploy do MVP em produção estável."**

**Entrega:** MVP completo, testado e documentado.

### 5.2 Features do Sprint 3

- US-007: Gestão de Riscos Básica
- Testes E2E completos (Playwright)
- Documentação final
- Onboarding da equipe

### 5.3 Checklist Sprint 3

*(Formato similar)*

---

## 6. CHECKLIST DE DEPLOY

### 6.1 Pre-Deploy (antes de cada release)

- [ ] Todos os testes passando (unit + E2E)
- [ ] Build local funciona: `pnpm build`
- [ ] Sem errors no console do browser
- [ ] Sem TypeScript errors
- [ ] README atualizado
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Migrations rodadas no Supabase de produção
- [ ] Backup do banco feito

### 6.2 Deploy

- [ ] Merge para `main` via Pull Request
- [ ] CI/CD passa (GitHub Actions)
- [ ] Vercel auto-deploy
- [ ] Verificar URL de produção: https://uzzapp-management.vercel.app
- [ ] Testar login em produção
- [ ] Testar features principais

### 6.3 Post-Deploy

- [ ] Monitorar erros (Vercel Logs)
- [ ] Avisar equipe no Slack/WhatsApp
- [ ] Atualizar changelog
- [ ] Criar tag de release no GitHub: `v0.1.0`

---

## 7. TROUBLESHOOTING

### 7.1 Problemas Comuns

**Problema:** `Error: Database connection failed`
**Solução:**
1. Verificar `.env.local` tem as variáveis corretas
2. Testar conexão: `SELECT 1` no SQL Editor do Supabase
3. Verificar firewall/VPN não está bloqueando

---

**Problema:** `Error: Authentication required`
**Solução:**
1. Fazer logout e login novamente
2. Limpar cookies do browser
3. Verificar middleware.ts está funcionando

---

**Problema:** Build falha na Vercel
**Solução:**
1. Verificar variáveis de ambiente na Vercel
2. Rodar `pnpm build` localmente para reproduzir erro
3. Verificar logs de build na Vercel

---

**Problema:** Supabase Realtime não funciona
**Solução:**
1. Verificar RLS policies não estão bloqueando
2. Testar query manualmente no SQL Editor
3. Verificar usuário tem permissão

---

## 8. PALETA DE CORES UZZAI

**Para usar nos componentes:**

```typescript
// tailwind.config.ts
export default {
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
```

**Uso:**
- **Headers:** `bg-uzzai-primary`
- **Botões principais:** `bg-uzzai-primary hover:bg-uzzai-primary/90`
- **Links:** `text-uzzai-secondary`
- **Alertas:** `bg-uzzai-warning`

---

## 9. CONCLUSÃO

Este documento é seu **GUIA EXECUTÁVEL** para os próximos 7 semanas. Siga passo a passo, marque os checkboxes conforme avança, e você terá um MVP funcional do Sistema de Gerenciamento UzzApp.

**Próximos documentos a consultar:**
- `BACKLOG_INICIAL.md` - Todas as user stories detalhadas
- `PLANO_EXECUCAO_SISTEMA_GERENCIAMENTO_UZZAPP.md` - Visão estratégica completa

**Boa sorte! 🚀**

---

**Autor:** Pedro Vitor Pagliarin + Claude AI
**Data:** 2026-02-06
**Versão:** 1.0.0
**Status:** ✅ Pronto para Execução

---

*"Think Smart, Think Uzz.Ai"*
