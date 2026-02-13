# Plano de Implementação — MD Feeder: Alimentador Central de Informações

**Versão:** 1.0
**Data:** 2026-02-13
**Status:** Draft para aprovação
**Contexto:** UzzOPS / UzzApp — upload de `.md` estruturado para popular múltiplas entidades

---

## 1. Visão Geral

O MD Feeder é um botão/modal de upload que recebe um arquivo `.md` formatado segundo um template
e insere ou atualiza dados em múltiplas tabelas do banco ao mesmo tempo.

**Fluxo do mundo real:**
```
Reunião acontece
    ↓
Transcrição gerada (externa ao sistema por ora)
    ↓
AI externa + contexto do repositório (RAG) → gera o .md preenchido com o template
    ↓
Usuário abre UzzOPS → Upload MD Feeder
    ↓
Sistema faz parse → Preview com itens (válido/erro/duplicata/observação)
    ↓
Usuário confirma → Banco populado em múltiplas tabelas
    ↓
Resultado: features criadas, sprint atualizado, daily registrado, bugs resolvidos, etc.
```

**No futuro:** um agente interno fará automaticamente o passo "AI externa → gera o .md".
Hoje é manual — mas o sistema já recebe o arquivo e é preparado para essa evolução.

---

## 2. Contexto do Repositório (RAG Input)

Antes de gerar o `.md` externamente, o gerador de IA precisa de contexto sobre o estado atual
do projeto. O sistema deve expor um endpoint de "snapshot do repositório" que retorna:

```
GET /api/projects/[id]/repo-context
```

Resposta (texto estruturado ou JSON simplificado):
```
Projeto: UZZAPP — status: active — progress: 45%
Sprint ativo: SPR-003 (13/02 – 28/02) — 12/18 features
Features criadas: [F-001 a F-087, lista com code + name + status]
Bugs abertos: [F-041 P0 blocked, F-055 P1 in_progress]
Riscos críticos: [RSK-003 GUT=125 identified]
Membros do time: [Pedro Vitor, Brunno, ...]
```

Este output é o que será colado como contexto para a IA externa gerar o template preenchido.

---

## 3. Princípios do Sistema

| Princípio | Decisão |
|---|---|
| **Contexto** | Header do arquivo declara projeto e sprint. Se sprint não mencionado, cria novo. |
| **Multi-entidade** | Um arquivo pode ter features + bugs + daily + marketing + riscos juntos |
| **Preview obrigatório** | Sempre mostra preview antes de inserir qualquer coisa |
| **Duplicata com code** | Se já existe (mesmo code) → skip. Se tem observação extra → adiciona à lista de observações |
| **Daily** | Suporta formato coletivo (summary do dia) e por membro individual |
| **Bug resolvido** | Atualiza `features.status = 'done'` + insere em `work_item_status_history` |
| **Falha parcial** | Insere os válidos, reporta erros dos inválidos sem bloquear o lote inteiro |

---

## 4. Templates Individuais (os "Moldes")

Cada template abaixo representa um bloco dentro do arquivo `.md`.
O parser identifica cada bloco pelo `## tipo` e processa como uma entidade separada.

---

### 4.1 Template: `feature`

Cria um item na tabela `features` com `work_item_type = 'feature'`.

```markdown
## feature
code: F-XXX                    # opcional — se omitido, o sistema gera o próximo código disponível
name: Nome claro da feature
description: |
  Descrição completa do que deve ser feito e por quê.
category: Frontend             # Frontend | Backend | AI | Infra | Design | Produto
version: MVP                   # MVP | V1 | V2 | V3 | V4
priority: P1                   # P0 | P1 | P2 | P3
status: backlog                # backlog | todo | in_progress | review | testing | done | blocked
moscow: Must                   # Must | Should | Could | Wont
story_points: 5
business_value: 8              # 1–10
work_effort: 4                 # 1–10
due_date: 2026-03-01           # formato YYYY-MM-DD, opcional
responsible:
  - Pedro Vitor
is_mvp: true
acceptance_criteria: |
  - Ao clicar no botão X, deve acontecer Y
  - O campo Z é obrigatório e valida formato de e-mail
is_epic: false
observation: |                 # OPCIONAL — se code já existe, adiciona este texto como observação
  Discutido na reunião de 13/02. Depende da feature F-040 estar concluída antes.
```

**Campos obrigatórios:** `name`, `category`, `version` (ou herda do header), `priority`
**Geração automática:** `code` (próximo disponível no projeto), `tenant_id`, `project_id`

---

### 4.2 Template: `bug`

Cria item em `features` com `work_item_type = 'bug'`.

```markdown
## bug
code: F-XXX                    # opcional — gerado automaticamente
name: Descrição do bug
description: |
  O que está acontecendo, quando, em qual tela/fluxo.
  Passos para reproduzir se disponível.
category: Backend              # onde o bug está
priority: P0                   # P0 = crítico, P1 = importante, P2 = normal, P3 = baixo
status: backlog                # backlog | in_progress | blocked
story_points: 2
due_date: 2026-02-15           # SLA de resolução
responsible:
  - Pedro Vitor
solution_notes: |              # opcional — diagnóstico ou hipótese de causa
  Suspeita: o middleware de tenant não está propagando o contexto corretamente.
observation: |
  Relatado pelo cliente durante o teste de aceitação do sprint 3.
```

**Campos obrigatórios:** `name`, `category`, `priority`
**Diferença da feature:** `work_item_type = 'bug'`, SLA de prazo por prioridade

---

### 4.3 Template: `bug_resolution`

Atualiza um bug existente para `done` + registra em `work_item_status_history`.

```markdown
## bug_resolution
code: F-038                    # OBRIGATÓRIO — referência ao bug existente
status: done                   # novo status (geralmente 'done', pode ser outro)
solution_notes: |
  Corrigido na função `calculateProgress()` em `src/lib/progress.ts`.
  O problema era um valor NULL não tratado no denominador.
resolved_at: 2026-02-13        # opcional — default: hoje
observation: |
  Testado por Brunno no ambiente de staging. Aprovado.
```

**Comportamento:**
1. Encontra feature pelo `code`
2. Atualiza `status` e `solution_notes`
3. Insere registro em `work_item_status_history` (from_status → to_status)
4. Adiciona `observation` ao array de observações da feature
5. Se `code` não encontrado → erro (não cria novo)

---

### 4.4 Template: `sprint`

Cria um novo sprint na tabela `sprints`.

```markdown
## sprint
code: SPR-XXX                  # opcional — gerado automaticamente
name: Sprint 4 — Marketing e Qualidade
sprint_goal: Entregar o calendário editorial e corrigir os 3 bugs críticos de P0
start_date: 2026-03-01
end_date: 2026-03-14
duration_weeks: 2              # 1 | 2 | 3 | 4
velocity_target: 35
capacity_total: 160            # horas totais do time no sprint
observation: |
  Planejado na reunião de 13/02. Prioridade: módulo de marketing.
```

**Campos obrigatórios:** `name`, `sprint_goal` (mín 10 chars), `start_date`, `end_date`
**Nota:** `sprint_goal` é obrigatório pelo CHECK do banco. O parser deve validar isso.

---

### 4.5 Template: `daily` (coletivo)

Cria um `daily_scrum_log` coletivo do dia.

```markdown
## daily
date: 2026-02-13               # opcional — default: hoje
sprint: SPR-003                # opcional — inferred do sprint ativo
type: collective
summary: |
  Brunno finalizou os testes de regressão do módulo de features.
  Pedro iniciou a implementação do parser de MD.
  Revisão do backlog realizada — 3 features movidas para SPR-004.
impediments:
  - Ambiente de staging instável desde ontem
  - PR do Pedro aguardando revisão há 2 dias
features_mentioned:            # opcional — vincula features ao daily
  - F-038
  - F-042
```

**Comportamento:** Cria um log coletivo. Como `daily_scrum_logs` requer `team_member_id`,
o log coletivo usa o `team_member_id` do usuário que fez o import ou um membro especial "time".

---

### 4.6 Template: `daily_member` (por membro)

```markdown
## daily_member
date: 2026-02-13
member: Pedro Vitor            # deve corresponder a um nome em team_members
yesterday: |
  Corrigi o bug F-038 do middleware de tenant. Fiz o deploy em staging.
today: |
  Vou implementar o parser de MD para o MD Feeder (feat nova).
impediments:
  - Nenhum
features_mentioned:
  - F-038
```

**Comportamento:** Procura `team_member_id` pelo nome. Se não encontrar → erro com sugestão.

---

### 4.7 Template: `risk`

Cria um registro na tabela `risks`.

```markdown
## risk
title: Atraso no módulo de marketing pode impactar o lançamento
description: |
  A complexidade do calendário editorial e do acervo de assets
  pode exceder a estimativa de 2 sprints.
gut_g: 4                       # Gravidade 1–5
gut_u: 3                       # Urgência 1–5
gut_t: 3                       # Tendência 1–5
status: identified             # identified | analyzing | mitigated | accepted | resolved
mitigation_plan: |
  Dividir em 3 fases. Fase 1: só calendário. Fase 2: conteúdos. Fase 3: acervo.
owner: Pedro Vitor
observation: |
  Identificado na reunião de planejamento do sprint 4.
```

**Campos obrigatórios:** `title`, `gut_g`, `gut_u`, `gut_t`, `status`
**Auto-gerado:** `public_id` (próximo RSK-XXX disponível), `gut_score` (calculado pelo DB)

---

### 4.8 Template: `retrospective`

Cria ação em `retrospective_actions`.

```markdown
## retrospective
sprint: SPR-003                # OBRIGATÓRIO — referência ao sprint
category: needs_improvement    # worked_well | needs_improvement | experiment
action_text: |
  Definir critérios de DoD antes do início do sprint,
  não durante a execução.
status: pending
owner: Pedro Vitor
due_date: 2026-03-01
success_criteria: |
  DoD revisado e documentado antes do kick-off do sprint 5.
observation: |
  Decisão tomada na retro do sprint 3.
```

---

### 4.9 Template: `marketing_post`

Cria um `marketing_content_pieces` + N `marketing_publications` (um por canal).

```markdown
## marketing_post
title: Quem Somos — Conheça o Fundador
content_type: feed             # feed | reels | carrossel | stories | artigo | video
topic: Quem Somos
objective: awareness           # awareness | consideration | conversion | engagement
brief: |
  Post apresentando Pedro Vitor e a origem do Uzz.AI.
  Tom: pessoal, inspiracional. Visual: foto do fundador.
caption_base: |
  Por trás de cada bot inteligente, tem uma história real.
  A nossa começou com... [continua]
hashtags:
  - "#uzzai"
  - "#chatbotwhatsapp"
  - "#empreendedorismo"
cta: Conheça nossa história no link da bio
due_date: 2026-02-28           # prazo para o conteúdo estar pronto
project: UZZAPP                # qual projeto este conteúdo representa
publish:
  - channel: instagram
    date: 2026-03-01
  - channel: linkedin
    date: 2026-03-01
    caption_override: |        # legenda específica do LinkedIn (mais formal)
      Compartilho hoje a origem da Uzz.AI e como chegamos até aqui...
observation: |
  Discutido na reunião de marketing de 13/02. Aprovado pelo Pedro.
```

---

## 5. Template Master (Arquivo Completo)

Este é o arquivo `.md` que o usuário faz upload. Combina qualquer subconjunto dos templates acima.

```markdown
---
template: uzzops-feeder
version: 1.0
project: UZZAPP
sprint: SPR-003
date: 2026-02-13
author: Pedro Vitor
source: ata-reuniao-13fev2026
---

# UzzOPS — Import 13/02/2026
# Gerado a partir da ata da reunião de planejamento

---

## feature
name: Implementar parser de markdown para o MD Feeder
description: |
  Criar o endpoint e lógica de parse do arquivo .md
  seguindo o template definido em PLANO_MD_FEEDER_CENTRAL.md
category: Backend
version: MVP
priority: P1
status: todo
moscow: Must
story_points: 8
business_value: 9
work_effort: 8
responsible:
  - Pedro Vitor
is_mvp: true
acceptance_criteria: |
  - Parser lê o frontmatter corretamente
  - Cada bloco ## tipo é processado de forma independente
  - Erros de validação são reportados por item sem bloquear o lote

---

## feature
name: UI de Preview do MD Feeder
description: |
  Tela de preview que mostra os itens parseados antes da confirmação
category: Frontend
version: MVP
priority: P1
status: backlog
moscow: Must
story_points: 5
business_value: 8
work_effort: 5
responsible:
  - Pedro Vitor
is_mvp: true

---

## bug
name: Campo sprint_goal aceita string vazia no frontend
description: |
  O formulário de criação de sprint não valida o campo sprint_goal
  no frontend, permitindo enviar string vazia que falha apenas no DB.
priority: P1
category: Frontend
status: in_progress
responsible:
  - Pedro Vitor
due_date: 2026-02-15

---

## bug_resolution
code: F-038
status: done
solution_notes: |
  Corrigido o middleware de tenant em src/middleware.ts linha 47.
  O cookie de tenant_id não estava sendo lido em rotas de API internas.
resolved_at: 2026-02-13
observation: |
  Testado em staging. Deploy realizado às 15h30.

---

## daily
date: 2026-02-13
type: collective
summary: |
  Reunião de planejamento da sprint 4.
  Pedro apresentou os planos para o MD Feeder.
  Brunno finalizou os testes do módulo de sprints.
  Definido o backlog provisório para SPR-004.
impediments:
  - Deploy de hotfix bloqueado por review pendente
features_mentioned:
  - F-038

---

## risk
title: Complexidade do parser MD pode atrasar entrega do Feeder
gut_g: 3
gut_u: 4
gut_t: 3
status: identified
mitigation_plan: |
  Começar pelo subconjunto mínimo: feature + bug + bug_resolution.
  Demais tipos como marketing_post e retrospective na fase 2.

---

## marketing_post
title: Lançamento do UzzOPS — Bastidores
content_type: reels
topic: Produto
objective: awareness
caption_base: |
  Construindo por dentro o sistema que vai mudar como gerenciamos o Uzz.AI...
hashtags:
  - "#uzzai"
  - "#produto"
  - "#buildinpublic"
cta: Siga para acompanhar o lançamento
publish:
  - channel: instagram
    date: 2026-03-05
  - channel: linkedin
    date: 2026-03-05
```

---

## 6. Banco de Dados — Alterações Necessárias

### 6.1 Migration `019_md_feeder.sql`

#### 6.1.1 Nova coluna: `features.observations`

Armazena observações adicionais vindas de imports futuros quando o item já existe.

```sql
ALTER TABLE public.features
ADD COLUMN observations JSONB DEFAULT '[]'::jsonb NOT NULL;

COMMENT ON COLUMN public.features.observations IS
  'Array de observações adicionadas via import. Schema: [{text, source, imported_at, imported_by_name}]';
```

**Por que JSONB e não TEXT[]?**
Porque cada observação precisa de metadados (quando veio, de qual arquivo, quem importou).
Um array de objetos é mais consultável e auditável.

**Estrutura de cada observação:**
```json
{
  "text": "Discutido na reunião de 13/02. Depende da F-040.",
  "source": "ata-reuniao-13fev2026",
  "imported_at": "2026-02-13T18:30:00Z",
  "imported_by": "Pedro Vitor"
}
```

#### 6.1.2 Nova tabela: `md_feeder_imports`

Registro de cada import realizado (auditoria + histórico).

```sql
CREATE TABLE public.md_feeder_imports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id),
  project_id      UUID REFERENCES public.projects(id), -- inferred do header
  sprint_context  TEXT,                                -- sprint mencionado no header
  original_filename TEXT NOT NULL,
  file_content    TEXT NOT NULL,                       -- conteúdo bruto do .md (auditoria)
  parse_status    TEXT NOT NULL DEFAULT 'pending'
                  CHECK (parse_status IN ('pending','parsed','confirmed','completed','failed')),
  items_total     INTEGER DEFAULT 0 NOT NULL,
  items_created   INTEGER DEFAULT 0 NOT NULL,
  items_updated   INTEGER DEFAULT 0 NOT NULL,
  items_skipped   INTEGER DEFAULT 0 NOT NULL,
  items_failed    INTEGER DEFAULT 0 NOT NULL,
  parse_errors    JSONB DEFAULT '[]'::jsonb NOT NULL,
  parsed_at       TIMESTAMPTZ,
  confirmed_at    TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_by      UUID REFERENCES auth.users(id),
  created_by_name TEXT,                                -- snapshot do nome (desnormalizado)
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_md_feeder_imports_tenant ON public.md_feeder_imports(tenant_id, created_at DESC);
CREATE INDEX idx_md_feeder_imports_project ON public.md_feeder_imports(project_id);
```

#### 6.1.3 Nova tabela: `md_feeder_import_items`

Cada linha do import: um item parseado (feature, bug, daily, etc.).

```sql
CREATE TABLE public.md_feeder_import_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL,
  import_id         UUID NOT NULL REFERENCES public.md_feeder_imports(id) ON DELETE CASCADE,

  -- Identificação do item
  item_index        INTEGER NOT NULL,   -- posição no arquivo (1-based)
  item_type         TEXT NOT NULL
                    CHECK (item_type IN (
                      'feature','bug','bug_resolution','sprint',
                      'daily','daily_member','risk','retrospective','marketing_post'
                    )),

  -- Dados parseados
  raw_data          JSONB NOT NULL,     -- o YAML parseado do bloco

  -- Validação
  validation_status TEXT NOT NULL DEFAULT 'pending'
                    CHECK (validation_status IN (
                      'pending','valid','invalid','duplicate','duplicate_with_extras'
                    )),
  validation_errors JSONB DEFAULT '[]'::jsonb NOT NULL,

  -- Ação a ser tomada
  action            TEXT
                    CHECK (action IN ('create','update','skip','add_observation',NULL)),

  -- Resultado após confirmação
  entity_type       TEXT,              -- 'features' | 'sprints' | 'risks' | etc.
  entity_id         UUID,              -- UUID do registro criado/atualizado
  entity_code       TEXT,              -- code para referência humana (F-042, SPR-003)
  conflict_reason   TEXT,              -- por que foi marcado duplicate

  created_at        TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_md_feeder_items_import ON public.md_feeder_import_items(import_id, item_index);
```

#### 6.1.4 RLS Policies

```sql
-- md_feeder_imports: apenas membros do tenant
ALTER TABLE public.md_feeder_imports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.md_feeder_imports
  USING (tenant_id = public.get_user_tenant_id());

-- md_feeder_import_items: apenas membros do tenant
ALTER TABLE public.md_feeder_import_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.md_feeder_import_items
  USING (tenant_id = public.get_user_tenant_id());
```

---

## 7. Lógica de Parse

### 7.1 Etapas do Parser (Node.js/TypeScript)

```
Arquivo .md recebido
    ↓
Passo 1: Parse do frontmatter YAML (entre --- e ---)
    → extrai: template, version, project, sprint, date, author, source
    → valida: project existe? sprint existe (ou cria novo)?
    ↓
Passo 2: Divide o body em blocos
    → cada bloco começa com "## tipo"
    → delimitador entre blocos: "---" ou próximo "## tipo"
    ↓
Passo 3: Para cada bloco → parse YAML dos campos
    ↓
Passo 4: Validação por item_type
    → campos obrigatórios presentes?
    → valores dentro dos CHECKs do banco?
    → referências existem? (bug_resolution → code existe; daily_member → membro existe?)
    ↓
Passo 5: Detecção de duplicatas
    → feature/bug: busca por code (se fornecido) ou name + project_id
    → sprint: busca por code ou name + project_id
    → risk: busca por title + project_id (fuzzy)
    → daily: busca por date + member (ou date + type collective)
    ↓
Passo 6: Determinação da action por item
    → valid + não-duplicata → "create"
    → valid + duplicata + sem observation → "skip"
    → valid + duplicata + com observation → "add_observation"
    → bug_resolution → "update"
    → invalid → erro, ação = null
    ↓
Passo 7: Montar preview response
```

### 7.2 Regras por Item Type

| Item Type | Chave de duplicata | Action se duplicata | Notes |
|---|---|---|---|
| `feature` | `code` (se dado) ou `name+project_id` | skip (ou add_observation se tiver `observation:`) | Gera code se ausente |
| `bug` | `code` (se dado) ou `name+project_id` | skip (ou add_observation) | Peso maior no score de progresso |
| `bug_resolution` | `code` — **obrigatório** | update | Sempre update, nunca skip |
| `sprint` | `code` (se dado) ou `name+project_id` | skip | Gera code se ausente |
| `daily` | `date + type=collective + project_id` | add_observation no campo summary | Evitar 2 coletivos no mesmo dia |
| `daily_member` | `date + member + project_id` | skip (já logou hoje) | |
| `risk` | `title + project_id` (fuzzy 80%) | add_observation | Gera public_id se ausente |
| `retrospective` | `action_text + sprint` | skip | |
| `marketing_post` | `title + tenant_id` | skip (ou add_observation) | Cria publicações vinculadas |

---

## 8. API Endpoints

### 8.1 Upload e Parse
```
POST /api/import/md/upload
Content-Type: multipart/form-data
Body: { file: File, project_id?: string }

Response 200: {
  import_id: "uuid",
  parse_status: "parsed",
  preview: {
    items_total: 7,
    items_valid: 5,       // to create
    items_update: 1,      // bug_resolution
    items_observation: 1, // add_observation
    items_skip: 0,
    items_invalid: 0,
    items: [
      {
        index: 1,
        item_type: "feature",
        validation_status: "valid",
        action: "create",
        entity_code: "F-088",  // próximo disponível
        summary: "Feature: Implementar parser de markdown",
        raw_data: { ... }
      },
      {
        index: 4,
        item_type: "bug_resolution",
        validation_status: "valid",
        action: "update",
        entity_code: "F-038",
        summary: "Bug resolvido: F-038 → done",
        raw_data: { ... }
      },
      {
        index: 6,
        item_type: "feature",
        validation_status: "duplicate_with_extras",
        action: "add_observation",
        entity_code: "F-042",
        conflict_reason: "Feature F-042 já existe",
        summary: "Observação adicionada a F-042",
        raw_data: { ... }
      }
    ],
    errors: []
  }
}
```

### 8.2 Confirmar Import
```
POST /api/import/md/[import_id]/confirm
Body: { item_overrides?: { [item_index]: { action: "skip" | "create" } } }
// Permite o usuário mudar a action de um item no preview antes de confirmar

Response 200: {
  import_id: "uuid",
  parse_status: "completed",
  items_created: 5,
  items_updated: 1,
  items_skipped: 1,
  items_failed: 0,
  results: [
    { index: 1, entity_id: "uuid", entity_code: "F-088", status: "created" },
    { index: 4, entity_id: "uuid", entity_code: "F-038", status: "updated" },
    ...
  ]
}
```

### 8.3 Histórico
```
GET /api/import/history
    ?limit=20&offset=0
    → lista imports do tenant com status e resumo

GET /api/import/md/[import_id]
    → detalhe completo de um import com todos os itens
```

### 8.4 Contexto do Repositório (para IA externa)
```
GET /api/projects/[id]/repo-context
    ?format=text   → retorna texto plano (para colar no prompt da IA)
    ?format=json   → retorna JSON estruturado

Response (text):
  PROJETO: UZZAPP — status: active — progress: 45%
  SPRINT ATIVO: SPR-003 (13/02–28/02) — goal: "Entrega módulo marketing"
  FEATURES (últimas 50): F-001 backlog | F-002 done | ...
  BUGS ABERTOS: F-041 P0 blocked | F-055 P1 in_progress
  RISCOS: RSK-001 GUT=45 mitigated | RSK-003 GUT=125 identified
  MEMBROS: Pedro Vitor (admin) | Brunno (member)
  PRÓXIMOS CODES: feature=F-088, bug=F-089, sprint=SPR-004, risk=RSK-004
```

---

## 9. UI — Fluxo Completo

### 9.1 Onde fica o botão
- **Sidebar global:** ícone `Upload` ao lado do nome do projeto — sempre acessível
- **Topbar:** botão "Importar MD" visível em qualquer página do projeto
- **Dashboard:** card de acesso rápido na área de ações

### 9.2 Modal de Upload (Passo 1)

```
┌────────────────────────────────────────────────────────┐
│ Importar via MD Feeder                          [×]    │
├────────────────────────────────────────────────────────┤
│ Projeto: [UZZAPP ▼]                                    │
│                                                        │
│ ┌──────────────────────────────────────────────────┐   │
│ │                                                  │   │
│ │     Arraste seu arquivo .md aqui ou clique       │   │
│ │     para selecionar                              │   │
│ │     Apenas arquivos .md — máx 500KB              │   │
│ └──────────────────────────────────────────────────┘   │
│                                                        │
│ Baixar template:  [Template vazio] [Exemplo preenchido]│
│                                                        │
│ Contexto do repositório:  [Copiar para usar com IA]    │
│                                                        │
│                          [Cancelar] [Fazer Parse →]    │
└────────────────────────────────────────────────────────┘
```

### 9.3 Preview (Passo 2)

```
┌──────────────────────────────────────────────────────────────────┐
│ Preview do Import — ata-reuniao-13fev2026.md          [×]       │
│ 7 itens encontrados                                              │
├────────────┬────────────┬──────────┬────────────────────────────┤
│ CRIAR (5)  │ATUALIZAR(1)│PULAR (0) │ ERROS (0)                  │
├────────────┴────────────┴──────────┴────────────────────────────┤
│ # │ Tipo           │ Código  │ Nome                │ Ação       │
├───┼────────────────┼─────────┼─────────────────────┼────────────┤
│ 1 │ ● feature      │ F-088*  │ Impl. parser MD     │ ✓ Criar    │
│ 2 │ ● feature      │ F-089*  │ UI de Preview...    │ ✓ Criar    │
│ 3 │ ◎ bug          │ F-090*  │ sprint_goal vazio   │ ✓ Criar    │
│ 4 │ ✎ bug_resolut. │ F-038   │ Bug middleware       │ ✓ Atualizar│
│ 5 │ ● daily        │ —       │ Coletivo 13/02      │ ✓ Criar    │
│ 6 │ ▲ risk         │ RSK-004*│ Complexidade parser │ ✓ Criar    │
│ 7 │ ● mkt_post     │ MKT-023*│ Lançamento UzzOPS   │ ✓ Criar    │
├───┴────────────────┴─────────┴─────────────────────┴────────────┤
│ * = código gerado automaticamente                               │
│                                                                  │
│ [← Voltar]   [Expandir item para revisar]   [Confirmar Import →]│
└──────────────────────────────────────────────────────────────────┘
```

**Legenda de ícones no preview:**
- `●` Criar novo
- `✎` Atualizar existente
- `↷` Adicionar observação
- `—` Pular (duplicata sem extras)
- `✗` Erro (não será inserido)

### 9.4 Resultado (Passo 3)

```
┌──────────────────────────────────────────────────────┐
│ ✅ Import concluído!                          [×]    │
├──────────────────────────────────────────────────────┤
│  5 criados  │  1 atualizado  │  0 pulados  │ 0 erros │
├──────────────────────────────────────────────────────┤
│ ▶ F-088 criada — Implementar parser de markdown      │
│ ▶ F-089 criada — UI de Preview do MD Feeder          │
│ ▶ F-090 criada (bug) — sprint_goal vazio             │
│ ✎ F-038 atualizada → status: done                   │
│ ▶ Daily coletivo 13/02 registrado                    │
│ ▶ RSK-004 criado                                     │
│ ▶ MKT-023 criado + 2 publicações agendadas          │
├──────────────────────────────────────────────────────┤
│        [Ver features] [Ver histórico de imports]     │
└──────────────────────────────────────────────────────┘
```

---

## 10. Plano de Implementação em Fases

### Fase 1 — Fundação (MVP mínimo viável)

**Suporte a:** `feature`, `bug`, `bug_resolution`
**Objetivo:** Provar o conceito com as entidades mais usadas

1. Migration `019_md_feeder.sql`:
   - `features.observations` JSONB
   - `md_feeder_imports` table
   - `md_feeder_import_items` table
   - RLS policies

2. Parser TypeScript (`src/lib/md-feeder/parser.ts`):
   - Parse de frontmatter YAML
   - Parse de blocos `## tipo`
   - Validação de `feature`, `bug`, `bug_resolution`
   - Detecção de duplicatas (por code)

3. API:
   - `POST /api/import/md/upload`
   - `POST /api/import/md/[id]/confirm`

4. UI:
   - Modal de upload (Passo 1)
   - Preview simples em tabela (Passo 2)
   - Resultado (Passo 3)
   - Botão na topbar/sidebar

### Fase 2 — Expansão

**Suporte a:** `sprint`, `daily`, `daily_member`, `risk`

5. Adicionar parsers para esses tipos
6. Lógica de `sprint`: criar novo se não existe, validar sprint_goal
7. Lógica de `daily`: mapeamento de member por nome
8. API: `GET /api/projects/[id]/repo-context`
9. UI: botão "Copiar contexto para IA" no modal de upload

### Fase 3 — Marketing e Histórico

**Suporte a:** `marketing_post`, `retrospective`

10. Parser de `marketing_post` + criação de publicações vinculadas
11. Parser de `retrospective`
12. `GET /api/import/history` + página de histórico de imports
13. Download de templates vazios e preenchidos

### Fase 4 — Preparação para Agente

14. Endpoint `GET /api/projects/[id]/repo-context` completo e refinado
15. Formato de texto otimizado para consumo por LLMs
16. Versionamento de template (`template_version` no header do .md)
17. Webhook trigger quando import é concluído (para automações futuras)

---

## 11. Critérios de Aceite Global

- [ ] Upload de `.md` gera preview antes de qualquer INSERT no banco
- [ ] Features com `code` existente são puladas (sem observação) ou recebem observação (com campo `observation:`)
- [ ] `bug_resolution` atualiza status + insere em `work_item_status_history`
- [ ] Itens inválidos são reportados com mensagem clara sem bloquear os válidos
- [ ] Histórico de todos os imports fica acessível com rastreabilidade completa
- [ ] O arquivo bruto `.md` fica salvo no banco para auditoria (`file_content`)
- [ ] Multi-tenant: RLS em `md_feeder_imports` e `md_feeder_import_items`
- [ ] `GET /api/projects/[id]/repo-context` retorna snapshot utilizável como contexto de IA
- [ ] Templates disponíveis para download direto do modal de upload

---

## 12. Impacto no Banco Atual

| Mudança | Tabela | Tipo | Risco |
|---|---|---|---|
| Adicionar coluna `observations` | `features` | ALTER TABLE | Baixo — DEFAULT '[]', sem null |
| Nova tabela `md_feeder_imports` | — | CREATE TABLE | Baixo |
| Nova tabela `md_feeder_import_items` | — | CREATE TABLE | Baixo |
| Nenhuma mudança em tabelas existentes de negócio | — | — | Zero |

**Nota importante:** As tabelas `marketing_*` já estão no banco (implementadas pós-plano anterior).
O parser de `marketing_post` escreve em `marketing_content_pieces` + `marketing_publications` — sem
necessidade de migration adicional para essas tabelas.

---

## 13. Template para Geração por IA (Prompt Base)

Este é o prompt que o usuário usará externamente (com ChatGPT, Claude, etc.) para gerar o `.md`:

```
Você é um assistente de gestão de projetos ágeis.
Abaixo está o CONTEXTO ATUAL do projeto UzzOPS:

[COLAR AQUI O OUTPUT DE /api/projects/UZZAPP/repo-context]

---

Agora leia esta ATA DE REUNIÃO:

[COLAR AQUI O TEXTO DA ATA OU TRANSCRIÇÃO]

---

Com base na ata e no contexto do projeto, gere um arquivo .md
seguindo EXATAMENTE o template uzzops-feeder v1.0.

Regras:
- Não crie features com códigos que já existem (veja lista no contexto)
- Se uma feature existente foi mencionada, use bug_resolution ou observation
- Use os campos obrigatórios de cada template
- sprint_goal deve ter no mínimo 10 caracteres
- Datas no formato YYYY-MM-DD
- Se não há sprint mencionado, crie um novo com ## sprint
- Seja conservador: apenas inclua o que foi claramente discutido na ata

Template de referência: docs/PLANO_MD_FEEDER_CENTRAL.md
```

---

*Documento criado para orientar a implementação do MD Feeder no UzzOPS.*
*Revisar fases e critérios de aceite antes de iniciar a codificação.*
