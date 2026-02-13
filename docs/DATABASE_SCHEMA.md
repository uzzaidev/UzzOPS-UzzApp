# 🗄️ DATABASE SCHEMA | UZZOPS

**Versão:** 0.2.0
**Database:** PostgreSQL (Supabase)
**Última Atualização:** 2026-02-07

---

## 📊 DIAGRAMA ER (Entity-Relationship)

```
┌────────────┐
│  tenants   │───┐
└────────────┘   │
                 │
     ┌───────────┴───────────────────────────┐
     │                                       │
┌────▼──────┐                          ┌────▼────────┐
│ projects  │                          │team_members │
└────┬──────┘                          └─────────────┘
     │
     ├──────────────┬──────────────┬──────────────┐
     │              │              │              │
┌────▼──────┐  ┌───▼─────┐    ┌───▼────┐    ┌───▼──────┐
│ features  │  │ sprints │    │ risks  │    │ uzzapp_  │
│           │  │         │    │        │    │ clients  │
└────┬──────┘  └───┬─────┘    └────────┘    └──────────┘
     │              │
     │              │
     │         ┌────▼────────────┐
     │         │sprint_features  │
     │         │  (many-to-many) │
     │         └────┬────────────┘
     │              │
     └──────────────┴──────────────┐
                                   │
                    ┌──────────────▼──────────┐
                    │ sprint_scope_changes   │
                    │     (audit log)         │
                    └─────────────────────────┘

┌────────────┐
│user_stories│
└────┬───────┘
     │ (opcional - relaciona com features)
     │
┌────▼───┐
│ tasks  │
└────────┘
```

---

## 📋 TABELAS PRINCIPAIS

### 1. `tenants`
Organizações no sistema (multi-tenancy).

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PK, DEFAULT uuid | ID único |
| `slug` | TEXT | UNIQUE, NOT NULL | URL-friendly identifier |
| `name` | TEXT | NOT NULL | Nome da organização |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Data criação |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Data última atualização |

**Exemplo:**
```sql
INSERT INTO tenants (id, slug, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'uzzai', 'UzzAI');
```

**Relações:**
- 1 tenant → N projects
- 1 tenant → N team_members
- 1 tenant → N features
- 1 tenant → N sprints

---

### 2. `projects`
Projetos gerenciados pela organização.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PK | ID único |
| `tenant_id` | UUID | FK → tenants | Organização dona |
| `code` | TEXT | UNIQUE, NOT NULL | Código do projeto (ex: "UZZAPP") |
| `name` | TEXT | NOT NULL | Nome do projeto |
| `description` | TEXT | NULL | Descrição detalhada |
| `status` | TEXT | CHECK | 'active', 'on_hold', 'completed', 'cancelled' |
| `progress` | INTEGER | CHECK 0-100 | % de progresso |
| `budget` | DECIMAL(15,2) | NULL | Orçamento total |
| `budget_spent` | DECIMAL(15,2) | DEFAULT 0 | Orçamento gasto |
| `start_date` | DATE | NULL | Data início |
| `end_date` | DATE | NULL | Data fim |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Data criação |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Data atualização |

**Exemplo:**
```sql
INSERT INTO projects (tenant_id, code, name, status, start_date)
VALUES ('00000000-0000-0000-0000-000000000001', 'UZZAPP', 'UzzApp - Chatbot WhatsApp', 'active', '2025-12-01');
```

**Relações:**
- 1 project → N features
- 1 project → N sprints
- 1 project → N risks

---

### 3. `features`
Features / User Stories do projeto.

#### Campos Básicos

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PK | ID único |
| `tenant_id` | UUID | FK → tenants | Organização |
| `project_id` | UUID | FK → projects | Projeto |
| `code` | TEXT | UNIQUE, NOT NULL | Código (ex: "US-001") |
| `name` | TEXT | NOT NULL | Nome da feature |
| `description` | TEXT | NULL | Descrição detalhada |
| `category` | TEXT | NOT NULL | Categoria (User Story, Bug Fix, etc) |

#### Versionamento

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `version` | TEXT | CHECK, DEFAULT 'MVP' | 'MVP', 'V1', 'V2', 'V3', 'V4' |

#### Status e Workflow

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `status` | TEXT | CHECK, DEFAULT 'backlog' | 'backlog', 'todo', 'in_progress', 'review', 'testing', 'done', 'blocked' |

#### Priorização

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `priority` | TEXT | CHECK, DEFAULT 'P2' | 'P0', 'P1', 'P2', 'P3' |
| `moscow` | TEXT | CHECK, NULL | 'Must', 'Should', 'Could', 'Wont' |

#### GUT Score (Gravidade × Urgência × Tendência)

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `gut_g` | INTEGER | CHECK 1-5 | Gravidade |
| `gut_u` | INTEGER | CHECK 1-5 | Urgência |
| `gut_t` | INTEGER | CHECK 1-5 | Tendência |
| `gut_score` | INTEGER | **COMPUTED** | `gut_g * gut_u * gut_t` (1-125) |

**Fórmula:**
```sql
gut_score INTEGER GENERATED ALWAYS AS (gut_g * gut_u * gut_t) STORED
```

#### Definition of Done (DoD)

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `dod_functional` | BOOLEAN | DEFAULT false | Funcionalidade implementada |
| `dod_tests` | BOOLEAN | DEFAULT false | Testes escritos e passando |
| `dod_code_review` | BOOLEAN | DEFAULT false | Code review aprovado |
| `dod_documentation` | BOOLEAN | DEFAULT false | Documentação atualizada |
| `dod_deployed` | BOOLEAN | DEFAULT false | Deploy realizado |
| `dod_user_acceptance` | BOOLEAN | DEFAULT false | User acceptance OK |
| `dod_progress` | INTEGER | **COMPUTED** | % de DoD (0, 16, 33, 50, 66, 83, 100) |

**Fórmula:**
```sql
dod_progress INTEGER GENERATED ALWAYS AS (
  (CASE WHEN dod_functional THEN 1 ELSE 0 END +
   CASE WHEN dod_tests THEN 1 ELSE 0 END +
   CASE WHEN dod_code_review THEN 1 ELSE 0 END +
   CASE WHEN dod_documentation THEN 1 ELSE 0 END +
   CASE WHEN dod_deployed THEN 1 ELSE 0 END +
   CASE WHEN dod_user_acceptance THEN 1 ELSE 0 END) * 100 / 6
) STORED
```

#### Assignment e Prazos

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `responsible` | TEXT[] | NULL | Array de nomes ['Pedro', 'Luis'] |
| `due_date` | DATE | NULL | Data limite |

#### Estimativa

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `story_points` | INTEGER | NULL | Story points (Fibonacci: 1,2,3,5,8,13...) |

#### BV/W Ratio (Business Value / Work)

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `business_value` | INTEGER | CHECK 1-10 | Valor de negócio |
| `work_effort` | INTEGER | CHECK 1-10 | Esforço de trabalho |
| `bv_w_ratio` | DECIMAL(10,2) | **COMPUTED** | `business_value / work_effort` |

**Fórmula:**
```sql
bv_w_ratio DECIMAL(10, 2) GENERATED ALWAYS AS (
  CASE WHEN work_effort > 0 THEN business_value::DECIMAL / work_effort ELSE 0 END
) STORED
```

**Exemplo de Feature:**
```sql
INSERT INTO features (
  tenant_id, project_id, code, name, category,
  version, status, priority, moscow,
  story_points, business_value, work_effort
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'project-uuid',
  'US-001',
  'Dashboard Overview',
  'User Story',
  'MVP',
  'done',
  'P0',
  'Must',
  8,
  9,
  3
);
-- gut_score = calculado automaticamente (se gut_g, gut_u, gut_t fornecidos)
-- dod_progress = 0% (todos false)
-- bv_w_ratio = 9/3 = 3.0
```

**Relações:**
- N features → 1 project
- N features → M sprints (via `sprint_features`)
- 1 feature → N tasks

---

### 4. `sprints`
Sprints do projeto (ciclos de desenvolvimento Scrum).

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PK | ID único |
| `tenant_id` | UUID | FK → tenants | Organização |
| `project_id` | UUID | FK → projects | Projeto |
| `code` | TEXT | UNIQUE, NOT NULL | Código (ex: "SP001") |
| `name` | TEXT | NOT NULL | Nome do sprint |
| `sprint_goal` | TEXT | NULL | Objetivo do sprint (min 10 chars) |
| `start_date` | DATE | NOT NULL | Data início |
| `end_date` | DATE | NOT NULL | Data fim |
| `duration_weeks` | INTEGER | NULL | Duração em semanas (1-4) |
| `status` | TEXT | CHECK, DEFAULT 'planned' | 'planned', 'active', 'completed', 'cancelled' |
| `is_protected` | BOOLEAN | DEFAULT false | Escopo protegido? |
| `capacity_total` | INTEGER | NULL | Capacidade total (story points) |
| `velocity_target` | INTEGER | NULL | Velocity alvo (story points) |
| `velocity_actual` | INTEGER | NULL | Velocity real (story points done) |
| `started_at` | TIMESTAMPTZ | NULL | Timestamp início real |
| `completed_at` | TIMESTAMPTZ | NULL | Timestamp conclusão |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Data criação |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Data atualização |

**Regras de Negócio:**
- **Sprint Goal obrigatório** com mínimo 10 caracteres
- **Duração fixa:** Não pode mudar após start
- **Proteção de escopo:** Quando `is_protected = true`, mudanças requerem confirmação

**Exemplo:**
```sql
INSERT INTO sprints (
  tenant_id, project_id, code, name, sprint_goal,
  start_date, end_date, duration_weeks,
  status, velocity_target
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'project-uuid',
  'SP001',
  'Sprint 1',
  'Implementar autenticação e dashboard básico',
  '2026-01-20',
  '2026-02-03',
  2,
  'completed',
  20
);
```

**Relações:**
- 1 sprint → M features (via `sprint_features`)
- 1 sprint → N scope_changes

---

### 5. `sprint_features`
Relacionamento Many-to-Many entre Sprints e Features.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PK | ID único |
| `sprint_id` | UUID | FK → sprints, ON DELETE CASCADE | Sprint |
| `feature_id` | UUID | FK → features, ON DELETE CASCADE | Feature |
| `priority` | INTEGER | NULL | Prioridade no sprint |
| `added_at` | TIMESTAMPTZ | DEFAULT now() | Quando foi adicionada |

**Constraints:**
- `UNIQUE(sprint_id, feature_id)` - Uma feature não pode aparecer 2x no mesmo sprint

**Exemplo:**
```sql
INSERT INTO sprint_features (sprint_id, feature_id, priority)
VALUES ('sprint-uuid', 'feature-uuid', 1);
```

**Consulta Comum:**
```sql
-- Buscar features de um sprint
SELECT f.*, sf.priority, sf.added_at
FROM features f
JOIN sprint_features sf ON f.id = sf.feature_id
WHERE sf.sprint_id = 'sprint-uuid'
ORDER BY sf.priority;
```

---

### 6. `sprint_scope_changes`
Audit log de mudanças de escopo em sprints.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PK | ID único |
| `sprint_id` | UUID | FK → sprints | Sprint afetado |
| `feature_id` | UUID | FK → features | Feature adicionada/removida |
| `action` | TEXT | CHECK, NOT NULL | 'ADD', 'REMOVE' |
| `reason` | TEXT | NULL | Justificativa da mudança |
| `changed_by` | TEXT | NULL | Quem fez a mudança |
| `changed_at` | TIMESTAMPTZ | DEFAULT now() | Quando |
| `tenant_id` | UUID | FK → tenants | Organização |

**Uso:**
Toda mudança de escopo em sprint protegido é registrada aqui.

**Exemplo:**
```sql
INSERT INTO sprint_scope_changes (
  sprint_id, feature_id, action, reason, changed_by
) VALUES (
  'sprint-uuid',
  'feature-uuid',
  'ADD',
  'Cliente solicitou urgência P0',
  'Pedro Vitor'
);
```

---

### 7. `team_members`
Membros da equipe.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PK | ID único |
| `tenant_id` | UUID | FK → tenants | Organização |
| `name` | TEXT | NOT NULL | Nome completo |
| `email` | TEXT | UNIQUE, NOT NULL | Email |
| `avatar_url` | TEXT | NULL | URL da foto |
| `role` | TEXT | NOT NULL | Cargo (Dev, PO, SM, etc) |
| `department` | TEXT | NULL | Departamento |
| `allocation_percent` | INTEGER | CHECK 0-100, DEFAULT 100 | % alocação no projeto |
| `velocity_avg` | INTEGER | NULL | Velocity média (story points/sprint) |
| `is_active` | BOOLEAN | DEFAULT true | Ativo? |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Data criação |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Data atualização |

---

### 8. `risks`
Riscos do projeto.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PK | ID único |
| `tenant_id` | UUID | FK → tenants | Organização |
| `project_id` | UUID | FK → projects | Projeto |
| `public_id` | TEXT | UNIQUE, NOT NULL | Código (ex: "R-001") |
| `title` | TEXT | NOT NULL | Título do risco |
| `description` | TEXT | NULL | Descrição |
| `gut_g` | INTEGER | CHECK 1-5 | Gravidade |
| `gut_u` | INTEGER | CHECK 1-5 | Urgência |
| `gut_t` | INTEGER | CHECK 1-5 | Tendência |
| `gut_score` | INTEGER | **COMPUTED** | `gut_g * gut_u * gut_t` |
| `severity_label` | TEXT | NULL | 'Crítico', 'Alto', 'Médio', 'Baixo' |
| `status` | TEXT | CHECK | 'identified', 'analyzing', 'mitigated', 'accepted', 'resolved' |
| `mitigation_plan` | TEXT | NULL | Plano de mitigação |
| `owner_id` | UUID | FK → team_members | Responsável |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Data criação |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Data atualização |

---

### 9. `tasks`
Subtasks de features.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PK | ID único |
| `tenant_id` | UUID | FK → tenants | Organização |
| `feature_id` | UUID | FK → features | Feature pai |
| `title` | TEXT | NOT NULL | Título da task |
| `description` | TEXT | NULL | Descrição |
| `status` | TEXT | CHECK, DEFAULT 'todo' | 'todo', 'in_progress', 'done' |
| `assigned_to` | TEXT | NULL | Nome do responsável |
| `estimated_hours` | DECIMAL(5,2) | NULL | Horas estimadas |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Data criação |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Data atualização |

---

## 🔍 ÍNDICES (Performance)

```sql
-- Features
CREATE INDEX idx_features_project_status ON features(tenant_id, project_id, status);
CREATE INDEX idx_features_version ON features(tenant_id, version);
CREATE INDEX idx_features_priority ON features(tenant_id, priority);
CREATE INDEX idx_features_gut_score ON features(tenant_id, gut_score DESC);

-- Sprints
CREATE INDEX idx_sprints_project_status ON sprints(tenant_id, project_id, status);

-- Risks
CREATE INDEX idx_risks_gut_score ON risks(tenant_id, gut_score DESC);
```

**Motivo:**
- Queries filtram frequentemente por `tenant_id` + `project_id` + `status`
- Ordenação por `gut_score DESC` para priorização

---

## 🔄 TRIGGERS

### Auto-update `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em todas as tabelas
CREATE TRIGGER update_features_updated_at
  BEFORE UPDATE ON features
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- (Repetir para projects, sprints, team_members, risks, tasks, etc)
```

---

## 🛡️ ROW LEVEL SECURITY (RLS)

### Exemplo: Policy na tabela `features`

```sql
-- Habilitar RLS
ALTER TABLE features ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários só veem features do seu tenant
CREATE POLICY "Users can only see their tenant's features"
  ON features FOR SELECT
  USING (tenant_id = (auth.jwt() -> 'tenant_id')::uuid);

-- Policy: Usuários só podem inserir features no seu tenant
CREATE POLICY "Users can only insert features in their tenant"
  ON features FOR INSERT
  WITH CHECK (tenant_id = (auth.jwt() -> 'tenant_id')::uuid);

-- (Similar para UPDATE e DELETE)
```

**Aplicado em todas as tabelas com `tenant_id`.**

---

## 📦 MIGRAÇÕES

### Histórico

| # | Arquivo | Descrição | Data |
|---|---------|-----------|------|
| 001 | `001_init.sql` | Schema inicial (12 tabelas) | 2025-12-15 |
| 003 | `003_sprint_essentials.sql` | Campos sprint essenciais | 2026-02-06 |
| 004 | `004_sprint_scope_audit.sql` | Tabela `sprint_scope_changes` | 2026-02-06 |
| 005 | `005_fix_sprint_features_priority.sql` | Adicionar `priority` em `sprint_features` | 2026-02-06 |
| 006 | `006_fix_missing_columns.sql` | Corrigir colunas faltantes (`added_at`) | 2026-02-07 |

---

## 📊 QUERIES ÚTEIS

### Buscar features de um projeto com DoD

```sql
SELECT
  code,
  name,
  status,
  dod_progress,
  story_points
FROM features
WHERE project_id = 'project-uuid'
  AND tenant_id = 'tenant-uuid'
ORDER BY dod_progress DESC, priority;
```

### Calcular velocity de um sprint

```sql
SELECT
  s.code,
  s.name,
  SUM(f.story_points) FILTER (WHERE f.status = 'done') AS velocity_actual
FROM sprints s
LEFT JOIN sprint_features sf ON s.id = sf.sprint_id
LEFT JOIN features f ON sf.feature_id = f.id
WHERE s.id = 'sprint-uuid'
GROUP BY s.id, s.code, s.name;
```

### Features com DoD 100%

```sql
SELECT code, name
FROM features
WHERE dod_progress = 100
  AND tenant_id = 'tenant-uuid';
```

### Audit trail de um sprint

```sql
SELECT
  ssc.action,
  f.code AS feature_code,
  f.name AS feature_name,
  ssc.reason,
  ssc.changed_by,
  ssc.changed_at
FROM sprint_scope_changes ssc
JOIN features f ON ssc.feature_id = f.id
WHERE ssc.sprint_id = 'sprint-uuid'
ORDER BY ssc.changed_at DESC;
```

---

## 🔐 CONSTRAINTS E VALIDAÇÕES

### Business Rules via CHECK

```sql
-- Features: Status válido
CHECK (status IN ('backlog', 'todo', 'in_progress', 'review', 'testing', 'done', 'blocked'))

-- Features: Priority válida
CHECK (priority IN ('P0', 'P1', 'P2', 'P3'))

-- Features: GUT entre 1-5
CHECK (gut_g >= 1 AND gut_g <= 5)

-- Sprints: Status válido
CHECK (status IN ('planned', 'active', 'completed', 'cancelled'))

-- Projects: Progress entre 0-100
CHECK (progress >= 0 AND progress <= 100)
```

---

## 📝 NOTAS IMPORTANTES

### Campos Computed (GENERATED ALWAYS)
- `features.gut_score`
- `features.dod_progress`
- `features.bv_w_ratio`
- `risks.gut_score`

**Não podem ser inseridos/atualizados manualmente!**

### Soft Delete vs Hard Delete
- Atualmente: **Hard delete** (CASCADE)
- Futuro: Considerar `deleted_at` para soft delete

### Multi-tenancy
- Todas as queries devem filtrar por `tenant_id`
- RLS garante isolamento automático

---

**Última atualização:** 2026-02-07
**Próxima revisão:** Sprint 3

*Veja também: ARCHITECTURE.md, API_DOCUMENTATION.md*
