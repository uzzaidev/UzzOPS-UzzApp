---
created: 2026-02-06T17:09
updated: 2026-02-06T17:09
---
# UzzOps - Sistema de Gerenciamento UzzApp

Sistema de gerenciamento de projetos para desenvolvimento do **UzzApp** (Chatbot WhatsApp com IA).

## 📋 Sobre o Projeto

UzzOps é uma ferramenta interna de gestão de projetos focada em:
- Mapear todas as features a serem implementadas no UzzApp
- Versionar releases (MVP, V1, V2, V3, V4)
- Definir Definition of Done para cada feature
- Atribuir responsáveis por área (Dev, Marketing, Vendas, Jurídico)
- Estabelecer prazos e prioridades
- Visualizar progresso em dashboards

## 🚀 Stack Tecnológica

### Frontend
- **Next.js 16** (App Router)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4**
- **Shadcn/ui** (componentes)

### Backend
- **Next.js API Routes**
- **Supabase** (PostgreSQL + Auth + Realtime)

### State Management
- **Zustand** (client state)
- **@tanstack/react-query** (server state)

### Outros
- **React Hook Form** + **Zod** (forms & validation)
- **Recharts** (gráficos)
- **dnd-kit** (drag & drop)
- **date-fns** (manipulação de datas)
- **lucide-react** (ícones)

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 20+
- pnpm 10+
- Conta no Supabase (para produção)

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
cp .env.local.example .env.local
```

Preencha com suas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Executar migrations no Supabase

1. Acesse o [Supabase Dashboard](https://supabase.com)
2. Crie um novo projeto
3. Vá em **SQL Editor**
4. Execute o arquivo `supabase/migrations/001_init.sql`
5. Execute o arquivo `supabase/seed.sql` (dados iniciais)

### 4. Rodar o servidor de desenvolvimento

```bash
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/login/          # Página de login
│   ├── (dashboard)/           # Rotas protegidas
│   │   ├── dashboard/         # Dashboard principal
│   │   ├── features/          # Gestão de features
│   │   ├── sprints/           # Gestão de sprints
│   │   ├── team/              # Gestão de equipe
│   │   └── risks/             # Gestão de riscos
│   ├── api/                   # API Routes
│   ├── layout.tsx             # Layout raiz
│   └── page.tsx               # Redirect para /dashboard
├── components/
│   ├── ui/                    # Componentes Shadcn/ui
│   ├── shared/                # Componentes compartilhados
│   └── ...                    # Componentes específicos
├── lib/
│   ├── supabase/              # Clientes Supabase
│   ├── utils.ts               # Utilitários
│   └── validations.ts         # Schemas Zod
├── types/
│   ├── database.ts            # Types do banco
│   └── index.ts               # Types principais
└── hooks/                     # Custom hooks
```

## 🗃️ Database Schema

### Principais Tabelas

- **tenants**: Multi-tenancy (UzzAI)
- **projects**: Projetos (ex: UzzApp)
- **features**: Features/User Stories
- **sprints**: Sprints de desenvolvimento
- **team_members**: Membros da equipe
- **risks**: Riscos do projeto
- **user_stories**: Detalhamento de US
- **tasks**: Subtasks de features

## 🎯 Sprint Atual

**Sprint 1** (17-28 Fev 2026)
- ✅ US-008: Autenticação (Completo)
- 🚧 US-001: Dashboard Overview
- 📝 US-002: Gestão de Features (CRUD)

**Goal:** Dashboard com KPIs reais + CRUD completo de Features funcionando

## 📊 Progresso do Projeto

- **Sprint 0**: ✅ Completo (Infraestrutura)
- **Sprint 1**: 🚧 Em andamento
- **Sprint 2**: 📅 Planejado (03-14 Mar)
- **Sprint 3**: 📅 Planejado (17-28 Mar)

## 👥 Equipe

- **Pedro Vitor** - Product Owner + Frontend + UX/UI
- **Luis Fernando** - Tech Lead Full-Stack
- **Arthur** - Marketing Manager
- **Vitor** - Sales Manager
- **Lucas** - Legal Advisor

## 📝 Comandos Úteis

```bash
# Desenvolvimento
pnpm dev          # Rodar servidor de desenvolvimento
pnpm build        # Build para produção
pnpm start        # Rodar build de produção
pnpm lint         # Verificar código com ESLint
pnpm test         # Rodar testes (Jest)

# Formatação
pnpm prettier --write "src/**/*.{ts,tsx}"

# Adicionar componentes Shadcn/ui
npx shadcn@latest add [component-name]
```

## 🔐 Autenticação

O sistema usa **Supabase Auth** com:
- Login via email/senha
- Middleware de proteção de rotas
- Redirect automático baseado em autenticação

**Usuários seed:**
- pedro@uzzai.com
- luis@uzzai.com
- arthur@uzzai.com
- vitor@uzzai.com
- lucas@uzzai.com

(Senhas devem ser configuradas no Supabase Dashboard)

## 🎨 Paleta de Cores UzzAI

```css
--uzzai-primary: #2D6A5E    /* Verde escuro */
--uzzai-secondary: #4A90A4  /* Azul médio/turquesa */
--uzzai-warning: #F4D03F    /* Amarelo/Dourado */
--uzzai-dark: #1F1F1F       /* Preto/Charcoal */
--uzzai-gray: #B0B0B0       /* Cinza médio */
```

## 📖 Documentação

Veja a pasta `docs/` para documentação completa:
- `999 - PLANO_EXECUCAO_SISTEMA_GERENCIAMENTO_UZZAPP.md`
- `999 - BACKLOG_INICIAL.md`
- `999 - PLANO_EXECUCAO_SPRINTS.md`

## 📄 Licença

MIT

---

**Criado por:** Pedro Vitor Pagliarin + Claude AI
**Data:** 2026-02-06
**Versão:** 0.1.0

*"Think Smart, Think Uzz.Ai"*
