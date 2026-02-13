---
created: 2026-02-06T15:15
updated: 2026-02-06T19:00
sprint: Sprint 2
dates: 07-18 Fev 2026
status: Planejado
project: UzzOPS - Sistema de Gerenciamento UzzApp
dependencies: Sprint 1 (completo)
---

# SPRINT 2 - CHECKLIST EXECUTÁVEL

**Sprint:** Sprint 2 - CRUD Completo + Gestão Avançada
**Período:** 07-18 Fev 2026 (2 semanas)
**Goal:** *"Finalizar CRUD de Features + DoD tracking + Gestão de Sprints funcionando"*

**Responsáveis:** 👨‍💻 Luis + 🧑‍💻 Pedro

**Dependências:**
- ✅ Sprint 1 completo (Dashboard + API Features + Identidade Visual)

---

## 📊 PROGRESSO GERAL

```
┌─────────────────────────────────────────────────────────┐
│  SPRINT 2 - PROGRESS                                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ████████████████████████████████████████  100% (5/5 US)│
│                                                           │
│  ✅ US-002.1: ████████ 3/3 tasks (Modal Nova Feature)  │
│  ✅ US-002.2: ████████ 3/3 tasks (Edit/Delete)         │
│  ✅ US-003: ████████ 5/5 tasks (DoD Interativo)        │
│  ✅ US-004: ████████ 5/5 tasks (CRUD Sprints)          │
│  ✅ US-005: ████████ 4/4 tasks (Vincular Sprints)      │
│                                                           │
│  🎉 SPRINT 2 COMPLETO! 🎉                                │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**Estimativa Total:** ~3.2 dias de desenvolvimento
**Complexidade:** Média (estrutura já existe do Sprint 1)

---

## 📂 ESTRUTURA DO PROJETO (CONTEXTO)

### 🗂️ Arquitetura Atual (Sprint 1 - Base):

```
UzzOPS - UzzApp/
├── src/
│   ├── app/
│   │   ├── (auth)/                    # Grupo de rotas de autenticação
│   │   │   ├── layout.tsx             # Layout sem sidebar
│   │   │   └── login/
│   │   │       └── page.tsx           # ✅ Login page (Supabase Auth)
│   │   │
│   │   ├── (dashboard)/               # Grupo de rotas autenticadas
│   │   │   ├── layout.tsx             # Layout com sidebar + topbar
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx           # ✅ Dashboard Overview
│   │   │   └── features/
│   │   │       ├── page.tsx           # ✅ Lista de Features
│   │   │       └── [id]/
│   │   │           └── page.tsx       # ✅ Detalhes da Feature
│   │   │
│   │   ├── api/
│   │   │   ├── features/
│   │   │   │   ├── route.ts           # ✅ GET list, POST create
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts       # ✅ GET :id, PATCH update, DELETE
│   │   │   └── projects/
│   │   │       └── [id]/
│   │   │           └── overview/
│   │   │               └── route.ts   # ✅ GET overview (Dashboard)
│   │   │
│   │   ├── globals.css                # ✅ Tailwind v4 + UzzAI theme
│   │   ├── layout.tsx                 # Root layout
│   │   └── page.tsx                   # Home (redirect /dashboard)
│   │
│   ├── components/
│   │   ├── dashboard/
│   │   │   └── dashboard-content.tsx  # ✅ Dashboard client component
│   │   │
│   │   ├── features/
│   │   │   └── features-table.tsx     # ✅ Tabela com filtros
│   │   │
│   │   ├── shared/
│   │   │   ├── sidebar.tsx            # ✅ Navegação lateral
│   │   │   ├── topbar.tsx             # ✅ Header com user menu
│   │   │   └── user-menu.tsx          # ✅ Dropdown de usuário
│   │   │
│   │   └── ui/                        # Shadcn/ui components
│   │       ├── button.tsx             # ✅ Botão reutilizável
│   │       ├── badge.tsx              # ✅ Badge colorido
│   │       ├── card.tsx               # ✅ Card container
│   │       ├── table.tsx              # ✅ Tabela
│   │       ├── input.tsx              # ✅ Input de texto
│   │       ├── dialog.tsx             # ⏭️ Modal (não usado ainda)
│   │       ├── form.tsx               # ⏭️ Form com validation
│   │       └── ...                    # Outros componentes UI
│   │
│   ├── hooks/
│   │   ├── useFeatures.ts             # ✅ React Query hooks (CRUD)
│   │   └── useProjectOverview.ts      # ✅ Dashboard data hook
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts              # ✅ Supabase client (browser)
│   │   │   └── server.ts              # ✅ Supabase client (server)
│   │   ├── query-provider.tsx         # ✅ React Query provider
│   │   └── utils.ts                   # ✅ Utility functions (cn, etc)
│   │
│   ├── types/
│   │   ├── index.ts                   # ✅ TypeScript types
│   │   └── database.ts                # ✅ Supabase database types
│   │
│   └── middleware.ts                  # ✅ Auth middleware
│
├── supabase/
│   ├── migrations/
│   │   └── 001_init.sql               # ✅ Schema completo (12 tabelas)
│   └── seed.sql                       # ✅ Dados iniciais (3 features)
│
├── Checklists/
│   ├── SPRINT-1-CHECKLIST.md          # ✅ Completo (100%)
│   └── SPRINT-2-CHECKLIST.md          # 📝 Este arquivo
│
├── .env.local                         # ✅ Supabase credentials
├── package.json                       # ✅ Dependencies
├── tailwind.config.ts                 # ❌ REMOVIDO (v4 usa CSS)
├── postcss.config.js                  # ✅ @tailwindcss/postcss
└── next.config.js                     # ✅ Next.js 16 config
```

---

### 🎯 O QUE FUNCIONA (Sprint 1 - Base sólida):

**Backend (APIs):**
- ✅ `/api/features` - GET list (com filtros: version, status, priority, search)
- ✅ `/api/features/:id` - GET single (com tasks relation)
- ✅ `/api/features` - POST create
- ✅ `/api/features/:id` - PATCH update
- ✅ `/api/features/:id` - DELETE
- ✅ `/api/projects/:id/overview` - GET dashboard KPIs

**Frontend (Pages):**
- ✅ `/login` - Autenticação Supabase
- ✅ `/dashboard` - Overview com KPIs reais
- ✅ `/features` - Tabela com filtros (version, status, priority) + search
- ✅ `/features/:id` - Detalhes completos (DoD, GUT, BV/W, Timeline)

**State Management:**
- ✅ React Query (TanStack) - cache + invalidation
- ✅ Hooks: useFeatures, useFeature, useCreateFeature, useUpdateFeature, useDeleteFeature
- ✅ Auto-refresh (30s) no dashboard

**UI/UX:**
- ✅ Identidade visual UzzAI (cores Tailwind v4)
- ✅ Sidebar com navegação
- ✅ Topbar com user menu
- ✅ Badges coloridos (status, prioridade, versão)
- ✅ Progress bars (DoD, progresso geral)
- ✅ Responsivo (mobile, tablet, desktop)

---

### ⚠️ O QUE FALTA (Pendências do Sprint 1 → Sprint 2):

**US-002.1: Modal "Nova Feature" (PENDENTE)**
- ❌ Modal dialog implementado
- ❌ Formulário com validação (Zod)
- ❌ Integração com useCreateFeature
- ✅ Botão "Nova Feature" existe na UI
- ✅ Hook useCreateFeature funcionando

**US-002.2: Botões Edit/Delete (PENDENTE)**
- ❌ Modal de edição implementado
- ❌ Confirmação de exclusão
- ❌ Integração com useUpdateFeature/useDeleteFeature
- ✅ Botões existem na UI (Eye, Edit, Trash)
- ✅ Hooks funcionando (useUpdateFeature, useDeleteFeature)

**Componentes UI disponíveis mas não usados:**
- ⏭️ `dialog.tsx` (Shadcn) - pronto para modais
- ⏭️ `form.tsx` (React Hook Form) - pronto para forms
- ⏭️ `select.tsx`, `checkbox.tsx`, `label.tsx` - prontos

---

## 📋 USER STORIES DO SPRINT 2

### 🔴 US-002.1: Modal "Nova Feature" (PENDENTE SPRINT 1)

**Contexto:** O botão "Nova Feature" existe mas não abre modal.

**Arquivos afetados:**
- `src/components/features/features-table.tsx` (linha 138)
- `src/components/features/create-feature-modal.tsx` (CRIAR)
- `src/hooks/useFeatures.ts` (useCreateFeature já existe ✅)

**Tasks:**
- [x] **Task 1:** Criar componente `CreateFeatureModal.tsx` [Pedro - 2h] ✅
  - Usar `Dialog` do Shadcn/ui
  - Form com react-hook-form + Zod validation
  - Campos: code, name, description, version, priority, category, status

- [x] **Task 2:** Integrar modal na `features-table.tsx` [Pedro - 1h] ✅
  - useState para controlar open/close
  - Conectar botão "Nova Feature" ao modal
  - Passar `useCreateFeature` hook

- [x] **Task 3:** Testar criação end-to-end [Pedro - 0.5h] ✅
  - Criar feature via modal
  - Verificar invalidação de cache
  - Verificar feature aparece na lista

**Estimativa:** 3.5h (~0.5d) ✅ COMPLETO (2026-02-07)

**Definition of Done:**
- [x] Modal abre ao clicar "Nova Feature" ✅
- [x] Form valida todos os campos obrigatórios ✅
- [x] Feature é criada no Supabase ✅
- [x] Lista de features atualiza automaticamente ✅
- [x] Modal fecha após sucesso ✅
- [x] Mensagem de erro se falhar ✅

---

### 🔴 US-002.2: Edição e Exclusão de Features (PENDENTE SPRINT 1)

**Contexto:** Botões Edit/Delete existem mas não fazem nada.

**Arquivos afetados:**
- `src/components/features/features-table.tsx` (linhas 244-252)
- `src/components/features/[id]/page.tsx` (linhas 103-110)
- `src/components/features/edit-feature-modal.tsx` (CRIAR)
- `src/components/features/delete-feature-dialog.tsx` (CRIAR)
- `src/hooks/useFeatures.ts` (hooks já existem ✅)

**Tasks:**
- [x] **Task 1:** Criar `EditFeatureModal.tsx` [Pedro - 2h] ✅
  - Reutilizar estrutura do CreateFeatureModal
  - Pre-popular campos com dados da feature
  - Usar `useUpdateFeature` hook

- [x] **Task 2:** Criar `DeleteFeatureDialog.tsx` [Pedro - 1h] ✅
  - Dialog de confirmação simples
  - Texto: "Tem certeza que deseja excluir [nome]?"
  - Botões: Cancelar / Excluir (vermelho)
  - Usar `useDeleteFeature` hook

- [x] **Task 3:** Integrar na tabela e página de detalhes [Pedro - 1h] ✅
  - Conectar botão Edit ao EditModal (tabela + detalhes)
  - Conectar botão Delete ao DeleteDialog (tabela + detalhes)
  - Testar invalidação de cache
  - Redirect após delete

**Estimativa:** 4h (~0.5d) ✅ COMPLETO (2026-02-07)

**Definition of Done:**
- [x] Botão Edit abre modal com dados pre-populados ✅
- [x] Edição salva no Supabase ✅
- [x] Lista/detalhes atualizam automaticamente ✅
- [x] Botão Delete mostra confirmação ✅
- [x] Feature é removida do Supabase ✅
- [x] Redirect para /features após delete ✅
- [x] Mensagens de erro apropriadas ✅

---

### 🟢 US-003: Definition of Done Tracker Interativo

**Contexto:** DoD já renderiza na página de detalhes, mas não é editável.

**Arquivos afetados:**
- `src/app/(dashboard)/features/[id]/page.tsx` (linhas 74-81, DoD read-only)
- `src/components/features/dod-section.tsx` (CRIAR - componente editável)
- `src/hooks/useFeatures.ts` (useUpdateFeature já existe ✅)

**Tasks:**
- [x] **Task 1:** Criar `DodSection.tsx` editável [Pedro - 2h] ✅
  - 6 checkboxes: functional, tests, code_review, documentation, deployed, user_acceptance
  - Usar `useUpdateFeature` ao clicar checkbox
  - Progress bar atualiza automaticamente (computed no DB)
  - Loading state durante update

- [x] **Task 2:** Substituir DoD read-only por editável [Pedro - 0.5h] ✅
  - Trocar seção estática no `/features/[id]/page.tsx`
  - Testar persistência no Supabase
  - Verificar invalidação de cache

- [x] **Task 3:** Adicionar validação "Done" requer 100% DoD [Luis - 1h] ✅
  - API PATCH `/api/features/:id` valida:
    - Se `status = 'done'` → `dod_progress` deve ser 100
  - Retornar erro 400 se inválido
  - Mensagem de erro no frontend

- [x] **Task 4:** Dashboard mostra % médio de DoD [Pedro - 1h] ✅
  - Calcular média de `dod_progress` de todas as features
  - Adicionar card "DoD Compliance" no dashboard
  - Progress bar + badge colorido (verde/amarelo/vermelho)

- [x] **Task 5:** Filtro "DoD completo" na lista [Pedro - 0.5h] ✅
  - Adicionar filtro: "Todas / DoD 100% ✓ / DoD < 100%"
  - Filtro client-side por `dod_progress`

**Estimativa:** 5.5h (~0.7d) ✅ COMPLETO (2026-02-07)

**Definition of Done:**
- [x] Checkboxes DoD funcionam e persistem ✅
- [x] Progress bar atualiza em tempo real ✅
- [x] Validação impede "Done" sem 100% DoD ✅
- [x] Dashboard mostra % médio de DoD ✅
- [x] Filtro por DoD funciona ✅
- [x] Cache invalida corretamente ✅

---

### 🟡 US-004: Gestão de Sprints (CRUD Básico)

**Contexto:** Tabela `sprints` existe no schema, precisa de UI.

**Arquivos afetados:**
- `src/app/api/sprints/route.ts` (CRIAR)
- `src/app/api/sprints/[id]/route.ts` (CRIAR)
- `src/app/(dashboard)/sprints/page.tsx` (CRIAR)
- `src/app/(dashboard)/sprints/[id]/page.tsx` (CRIAR)
- `src/hooks/useSprints.ts` (CRIAR)
- `src/components/sprints/sprints-table.tsx` (CRIAR)
- `src/components/shared/sidebar.tsx` (adicionar link "Sprints")

**Tasks:**
- [x] **Task 1:** API CRUD `/api/sprints` [Luis - 3h] ✅
  - GET list (com filtro: project_id, status)
  - GET :id (com features do sprint)
  - POST create
  - PATCH update
  - DELETE

- [x] **Task 2:** Hook `useSprints.ts` [Luis - 1h] ✅
  - useQuery para list + single
  - useMutation para create/update/delete
  - Invalidação de cache

- [x] **Task 3:** Página `/sprints` lista [Pedro - 3h] ✅
  - Tabela similar a features
  - Colunas: Nome, Datas, Status, Velocity, Ações
  - Badge colorido por status (planned, active, completed)
  - Botão "Novo Sprint"

- [x] **Task 4:** Modal criar sprint [Pedro - 2h] ✅
  - Campos: name, goal, start_date, end_date, velocity_target
  - Validação: end_date > start_date
  - Criar com status 'planned'

- [x] **Task 5:** Página `/sprints/:id` detalhes [Pedro - 2h] ✅
  - Header com nome + datas + métricas (Velocity, Features, DoD, Capacity)
  - Goal do sprint (editável inline)
  - Features do sprint (tabela com add/remove)
  - Progress bar (velocity_actual / velocity_target)
  - Workflows (Start/Complete/Cancel Sprint)
  - Navigation links da tabela principal

**Estimativa:** 11h (~1.4d) ✅ COMPLETO (2026-02-07)

**Definition of Done:**
- [x] API sprints completa ✅
- [x] Lista de sprints funcionando ✅
- [x] Criar sprint funcionando ✅
- [x] Detalhes sprint mostram features ✅
- [x] Status visual (badges coloridos) ✅
- [x] Link "Sprints" na sidebar funciona ✅
- [x] Sprint workflows implementados ✅
- [x] Sprint goal editável ✅
- [x] Métricas em tempo real ✅

---

### 🟡 US-005: Vincular Features a Sprints

**Contexto:** Feature tem campo `sprint_id`, precisa permitir vinculação.

**Arquivos afetados:**
- `src/components/features/edit-feature-modal.tsx` (adicionar select sprint)
- `src/components/features/create-feature-modal.tsx` (adicionar select sprint)
- `src/app/(dashboard)/sprints/[id]/page.tsx` (adicionar feature ao sprint)
- `src/hooks/useFeatures.ts` (já suporta sprint_id ✅)

**Tasks:**
- [x] **Task 1:** Adicionar campo "Sprint" nos modais [Pedro - 1h] ✅
  - Select dropdown com sprints disponíveis (FeatureSprintSelector)
  - Filtrar apenas sprints 'planned' ou 'active'
  - Permitir "Sem sprint" (null)

- [x] **Task 2:** Botão "Adicionar Feature" no sprint [Pedro - 2h] ✅
  - Modal com lista de features (AddFeaturesToSprintModal)
  - Abas: Sprint Backlog + Adicionar Features
  - Atualizar sprint_features via API

- [x] **Task 3:** Remover feature do sprint [Pedro - 1h] ✅
  - Botão "Remover" na SprintBacklogTable
  - DELETE /api/sprints/[id]/features
  - Proteção de escopo com confirmação

- [x] **Task 4:** Dashboard mostra sprint ativo [Pedro - 1h] ✅
  - Página de detalhes `/sprints/[id]` completa
  - Header com métricas: Velocity, Features, DoD, Capacity
  - Link na tabela de sprints

**Estimativa:** 5h (~0.6d) ✅ COMPLETO (2026-02-07)

**Definition of Done:**
- [x] Select sprint nos modais funciona ✅
- [x] Adicionar múltiplas features ao sprint funciona ✅
- [x] Remover feature do sprint funciona ✅
- [x] Detalhes do sprint mostram progresso ✅
- [x] Proteção de escopo auditada ✅
- [x] Two-way binding Feature ↔ Sprint ✅

---

## 📅 CRONOGRAMA SPRINT 2

**Prioridade:** Finalizar pendências do Sprint 1 primeiro!

### PRIMEIRA METADE (3.5 dias):
**Dia 1 (Manhã):** US-002.1 Modal Nova Feature (3.5h)
**Dia 1 (Tarde):** US-002.2 Edit/Delete Features (4h)
**Dia 2:** US-003 DoD Tracker Interativo (5.5h)
**Dia 3:** US-004 Gestão Sprints (11h) - dividir em 2 dias

### SEGUNDA METADE (1.5 dias):
**Dia 4 (continuação):** US-004 finalização
**Dia 5:** US-005 Vincular Features (5h)
**Dia 5 (Tarde):** Testes gerais + Review

---

## ✅ DEFINITION OF DONE - SPRINT 2

**Pendências Sprint 1:**
- [ ] US-002.1 ✅ (Modal Nova Feature)
- [ ] US-002.2 ✅ (Edit/Delete Features)

**Novas Features Sprint 2:**
- [ ] US-003 ✅ (DoD Tracker Interativo)
- [ ] US-004 ✅ (CRUD Sprints)
- [ ] US-005 ✅ (Vincular Features → Sprints)

**Qualidade:**
- [ ] Todas as funcionalidades testadas manualmente
- [ ] Cache invalidando corretamente
- [ ] Identidade visual consistente
- [ ] Responsivo em mobile

**Entrega:**
- [ ] Sistema funcionando end-to-end
- [ ] Documentação atualizada
- [ ] Pedro validou ✅

---

## 📊 MÉTRICAS ESTIMADAS

| Métrica | Sprint 1 | Sprint 2 (meta) |
|---------|----------|-----------------|
| User Stories | 3 | 5 (2 pendentes + 3 novas) |
| Story Points | 15 pts | 18 pts |
| Features CRUD | ✅ Estrutura | ✅ Completo |
| Sprints CRUD | ❌ | ✅ Completo |
| DoD Interativo | ❌ (read-only) | ✅ Editável |
| Vinculação Sprint | ❌ | ✅ Funcionando |

---

## 🎯 OBJETIVO FINAL DO SPRINT 2

**Quando completar este sprint, você terá:**
- ✅ CRUD de Features 100% completo (criar, editar, deletar via modais)
- ✅ CRUD de Sprints 100% completo
- ✅ Vinculação de Features → Sprints funcionando
- ✅ Definition of Done editável e trackável
- ✅ Dashboard mostrando sprint ativo e % DoD
- ✅ Sistema de gestão funcional end-to-end

**Próximo Sprint (Sprint 3):**
- Subtasks (CRUD de tarefas dentro de features)
- Planning Poker (estimativa colaborativa)
- Timeline/Gantt visual
- Deploy em produção (Vercel)

---

**Criado por:** Pedro Vitor + Claude AI
**Data de Criação:** 2026-02-06 15:15
**Última Atualização:** 2026-02-06 19:00
**Status:** 📝 Planejado (começa 07/Fev)

*"Think Smart, Think Uzz.Ai"*
