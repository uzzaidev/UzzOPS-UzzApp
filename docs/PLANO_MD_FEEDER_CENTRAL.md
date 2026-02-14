# Plano de Implementação — MD Feeder: Alimentador Central de Informações

**Versão:** 1.1
**Data:** 2026-02-13
**Status:** Draft para aprovação (revisão completa — cobertura de 39 tabelas)
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
Clientes ativos: [Cliente A, Cliente B, ...]
Próximos códigos disponíveis: feature=F-088, sprint=SPR-004, risk=RSK-004
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
| **Bug resolvido** | Atualiza `features.status` + insere em `work_item_status_history` |
| **Falha parcial** | Insere os válidos, reporta erros dos inválidos sem bloquear o lote inteiro |

---

## 4. Mapeamento Completo de Tabelas (39 tabelas)

### 4.0 Tabela de Cobertura

Cada tabela do schema `public` foi avaliada para determinar se precisa de um template de input.

| Tabela | Template | Motivo se "sem template" |
|---|---|---|
| `features` (type=feature) | `feature` | — |
| `features` (type=feature, is_epic) | `epic` | Campos específicos: decomposição de filhos |
| `features` (type=feature, is_spike) | `spike` | Campos específicos: timebox + outcome |
| `features` (spike outcome) | `spike_result` | Update com outcome + conversão para story |
| `features` (type=bug) | `bug` | — |
| `features` (bug resolution) | `bug_resolution` | Update status + histório |
| `features` (update pontuação) | `planning_result` | Bulk update após planning poker |
| `user_stories` | `user_story` | — |
| `tasks` | `task` | — |
| `feature_dependencies` | `feature_dependency` | — |
| `epic_decomposition` | via `epic` | Populada como parte do template epic |
| `feature_attachments` | sem template | Upload de arquivo — não via .md |
| `sprints` (criar) | `sprint` | — |
| `sprints` (atualizar) | `sprint_update` | Fechamento de sprint, ajuste de velocity |
| `sprint_features` | sem template | Gerenciado via UI de sprint planning |
| `sprint_scope_changes` | sem template | Gerado automaticamente pelo sistema |
| `sprint_burndown_snapshots` | sem template | Gerado automaticamente por trigger/cron |
| `risks` | `risk` | — |
| `daily_scrum_logs` (coletivo) | `daily` | — |
| `daily_scrum_logs` (por membro) | `daily_member` | — |
| `daily_feature_mentions` | via `daily`/`daily_member` | Populada como parte do parse do daily |
| `retrospective_actions` | `retrospective` | — |
| `baseline_metrics` | `baseline_metric` | — |
| `marketing_campaigns` | `marketing_campaign` | — |
| `marketing_content_pieces` + `marketing_publications` | `marketing_post` | — |
| `marketing_channels` | sem template | Configuração admin — raramente via reunião |
| `marketing_assets` | sem template | Upload de arquivo — não via .md |
| `team_members` | `team_member` | — |
| `uzzapp_clients` | `uzzapp_client` | — |
| `client_catalogs` | sem template | Operacional — raramente via reunião |
| `work_item_status_history` | via `bug_resolution`/`spike_result` | Populada como efeito colateral |
| `project_progress_snapshots` | sem template | Gerado automaticamente por trigger |
| `project_progress_settings` | sem template | Config admin via UI |
| `planning_poker_sessions` | sem template | Ferramenta interativa |
| `planning_poker_votes` | sem template | Ferramenta interativa |
| `planning_poker_results` | via `planning_result` | Importa resultado final da sessão |
| `velocity_history` | sem template | Gerado automaticamente por trigger |
| `dod_levels` / `dod_history` | sem template | Config admin |
| `feature_clusters` / `feature_cluster_members` | sem template | Ferramenta visual/interativa |
| `export_history` | sem template | Gerado automaticamente |
| `company_members` | sem template | Gerenciado via sistema de auth |
| `tenants` / `projects` / `profiles` | sem template | Admin/setup |

**Resultado: 21 tipos de template** (sendo 1 opcional/Tier 3)

### 4.0.1 Categorias de Templates

**Categoria A — Features e Itens de Trabalho (7 tipos)**
`feature`, `epic`, `spike`, `spike_result`, `bug`, `bug_resolution`, `planning_result`

**Categoria B — Planejamento e Sprints (3 tipos)**
`sprint`, `sprint_update`, `task`

**Categoria C — Cerimônias e Colaboração (4 tipos)**
`daily`, `daily_member`, `retrospective`, `user_story`

**Categoria D — Dependências, Métricas e Arquitetura (2 tipos)**
`feature_dependency`, `baseline_metric`

**Categoria E — Marketing (2 tipos)**
`marketing_campaign`, `marketing_post`

**Categoria F — Riscos e Time (2 tipos)**
`risk`, `team_member`

**Categoria G — Clientes (1 tipo, Tier 3/opcional)**
`uzzapp_client`

---

## 5. Templates Individuais (os "Moldes")

Cada template abaixo representa um bloco dentro do arquivo `.md`.
O parser identifica cada bloco pelo `## tipo` e processa como uma entidade separada.

---

### CATEGORIA A — Features e Itens de Trabalho

---

### 5.1 Template: `feature`

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
observation: |                 # OPCIONAL — se code já existe, adiciona como observação
  Discutido na reunião de 13/02. Depende da feature F-040 estar concluída antes.
```

**Campos obrigatórios:** `name`, `category`, `version` (ou herda do header), `priority`
**Geração automática:** `code` (próximo disponível no projeto), `tenant_id`, `project_id`

---

### 5.2 Template: `epic`

Cria um item em `features` com `is_epic = true`.
Opcionalmente vincula stories filhas existentes em `epic_decomposition`.

```markdown
## epic
code: F-XXX                    # opcional — gerado automaticamente
name: Epic: Módulo de Marketing Completo
description: |
  Epic que agrupa todas as features do módulo de marketing:
  calendário editorial, gestão de conteúdos e acervo de assets.
category: Produto
version: V1
priority: P1
moscow: Must
due_date: 2026-04-30
responsible:
  - Pedro Vitor
decomposition:                 # opcional — stories filhas já existentes ou a criar
  strategy: vertical           # vertical | horizontal | by_complexity
  children:
    - code: F-045              # referência a feature existente
    - code: F-046
    - name: Upload de assets de marketing   # nova story a criar (sem code)
      priority: P1
      story_points: 5
observation: |
  Mapeado na reunião de arquitetura de produto do sprint 3.
```

**Comportamento:**
- Cria a feature com `is_epic = true`
- Se `decomposition.children` tem `code` existente → insere em `epic_decomposition` vinculando
- Se `decomposition.children` tem `name` → cria nova feature filha + vincula em `epic_decomposition`

---

### 5.3 Template: `spike`

Cria um item em `features` com `is_spike = true`.

```markdown
## spike
code: F-XXX                    # opcional
name: Investigar viabilidade de OCR para leitura de NFe
description: |
  Investigar se alguma lib open-source de OCR ou API
  consegue extrair campos de NF-e com precisão > 90%.
category: AI
version: V1
priority: P1
spike_timebox_hours: 16        # máximo de horas alocadas para a investigação
due_date: 2026-03-07
responsible:
  - Pedro Vitor
observation: |
  Aprovado na sessão de arquitetura. Resultado esperado: decisão go/no-go + PoC mínima.
```

**Campos obrigatórios:** `name`, `category`, `priority`, `spike_timebox_hours`

---

### 5.4 Template: `spike_result`

Fecha um spike existente com o resultado da investigação.
Atualiza `features` + registra em `work_item_status_history`.

```markdown
## spike_result
code: F-XXX                    # OBRIGATÓRIO — referência ao spike existente
status: done                   # done | cancelled
spike_outcome: |
  OCR nativo (Tesseract) não atingiu 90% de precisão em campos monetários.
  Google Vision API atingiu 94% com custo de R$0.003/documento.
  Recomendação: usar Google Vision API com cache de 30 dias.
convert_to_story: true         # true = cria nova feature derivada do spike
converted_story:               # preenchido apenas se convert_to_story = true
  name: Integrar Google Vision API para extração de NF-e
  priority: P1
  version: V2
  story_points: 13
resolved_at: 2026-03-07
observation: |
  PoC disponível em src/experiments/ocr-poc. Revisado pelo time.
```

**Comportamento:**
1. Atualiza `features.status` e `spike_outcome` no registro original
2. Insere em `work_item_status_history`
3. Se `convert_to_story = true` → cria nova feature filha + vincula em `spike_converted_to_story_id`

---

### 5.5 Template: `bug`

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

### 5.6 Template: `bug_resolution`

Atualiza um bug existente + registra em `work_item_status_history`.

```markdown
## bug_resolution
code: F-038                    # OBRIGATÓRIO — referência ao bug existente
status: done                   # novo status (geralmente 'done', pode ser 'blocked', etc.)
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
4. Adiciona `observation` ao array de observações
5. Se `code` não encontrado → erro (não cria novo)

---

### 5.7 Template: `planning_result`

Atualiza pontuações de features existentes após uma sessão de planning poker.
Escreve em `features` (update) e opcionalmente em `planning_poker_results`.

```markdown
## planning_result
session_name: Planning Poker — Sprint 4       # opcional, para registro
session_date: 2026-02-13
facilitator: Pedro Vitor
items:
  - code: F-050
    story_points: 8
    business_value: 9
    work_effort: 7
    consensus: unanimous      # unanimous | majority | forced
    discussion_notes: |
      Discutido por 15 min. Complexidade maior pela integração com Supabase Storage.
  - code: F-051
    story_points: 3
    business_value: 6
    work_effort: 3
    consensus: majority
  - code: F-052
    story_points: 13
    business_value: 10
    work_effort: 9
    consensus: forced
    discussion_notes: |
      Divergência entre 8 e 13. Fechado em 13 após análise de dependências.
```

**Comportamento:**
- Para cada item: atualiza `features.story_points`, `business_value`, `work_effort`
- Registra em `planning_poker_results` se `session_name` fornecido
- **Nunca pula**: planning_result sempre atualiza (override dos valores anteriores)

---

### CATEGORIA B — Planejamento e Sprints

---

### 5.8 Template: `sprint`

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
features:                      # opcional — features a incluir no sprint
  - F-088
  - F-089
  - F-090
observation: |
  Planejado na reunião de 13/02. Prioridade: módulo de marketing.
```

**Campos obrigatórios:** `name`, `sprint_goal` (mín 10 chars), `start_date`, `end_date`
**Nota:** `sprint_goal` é obrigatório pelo CHECK do banco.

---

### 5.9 Template: `sprint_update`

Atualiza um sprint existente (fechamento, ajuste de velocity, etc.).

```markdown
## sprint_update
code: SPR-003                  # OBRIGATÓRIO — referência ao sprint existente
status: completed              # planned | active | completed | cancelled
velocity_actual: 31            # pontos efetivamente entregues
completed_at: 2026-02-28       # opcional — default: hoje se status=completed
observation: |
  Sprint fechado com 88% do planejado. 2 features movidas para SPR-004 por dependência externa.
```

**Comportamento:**
- Atualiza `sprints.status`, `velocity_actual`, `completed_at`
- Se `status = completed` → trigger de recálculo de progresso é ativado automaticamente

---

### 5.10 Template: `task`

Cria sub-tarefas em `tasks` vinculadas a uma feature existente.

```markdown
## task
feature: F-088                 # OBRIGATÓRIO — código da feature pai
title: Implementar parser de frontmatter YAML
description: |
  Criar a função parseFrontmatter() em src/lib/md-feeder/parser.ts
  que extrai os campos do bloco --- inicial do arquivo .md
status: todo                   # todo | in_progress | done
assigned_to: Pedro Vitor       # nome do membro do time
estimated_hours: 4

---

## task
feature: F-088
title: Implementar split de blocos por ## tipo
status: todo
assigned_to: Pedro Vitor
estimated_hours: 3

---

## task
feature: F-088
title: Testes unitários do parser
status: todo
assigned_to: Pedro Vitor
estimated_hours: 2
```

**Campos obrigatórios:** `feature`, `title`
**Nota:** Múltiplas tasks podem ser criadas em sequência para a mesma feature, separadas por `---`.

---

### CATEGORIA C — Cerimônias e Colaboração

---

### 5.11 Template: `user_story`

Cria uma user story em `user_stories` vinculada a uma feature existente.

```markdown
## user_story
feature: F-088                 # OBRIGATÓRIO — código da feature pai
as_a: Gerente de Projeto
i_want: fazer upload de um arquivo .md estruturado
so_that: as informações da reunião sejam automaticamente inseridas no sistema sem digitação manual
acceptance_criteria:
  - O arquivo deve ser aceito apenas se tiver o frontmatter com template=uzzops-feeder
  - O sistema deve mostrar preview de todos os itens antes de confirmar
  - Itens inválidos devem ser reportados com mensagem clara
  - A confirmação deve ser atômica por item (falha parcial permitida)
observation: |
  Refinada na reunião de 13/02. Critérios revisados com o time.
```

**Campos obrigatórios:** `feature`, `as_a`, `i_want`, `so_that`
**Nota:** Se feature com o code já tem uma user story → adiciona como observação na story existente.

---

### 5.12 Template: `daily` (coletivo)

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
o log coletivo usa o `team_member_id` do usuário que fez o import.

---

### 5.13 Template: `daily_member` (por membro)

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

### 5.14 Template: `retrospective`

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

### CATEGORIA D — Dependências, Métricas e Arquitetura

---

### 5.15 Template: `feature_dependency`

Registra dependências entre features em `feature_dependencies`.

```markdown
## feature_dependency
feature: F-042                 # OBRIGATÓRIO — feature que TEM a dependência
depends_on: F-038              # OBRIGATÓRIO — feature da qual depende
dependency_type: blocks        # blocks | relates_to | duplicates

---

## feature_dependency
feature: F-043
depends_on: F-040
dependency_type: relates_to

---

## feature_dependency
feature: F-044
depends_on: F-041
dependency_type: blocks
```

**Comportamento:**
- Cria registro em `feature_dependencies`
- Duplicata (mesmo par feature + depends_on) → skip
- Validação: ambas as features devem existir no projeto

---

### 5.16 Template: `baseline_metric`

Registra ou atualiza métricas baseline em `baseline_metrics`.

```markdown
## baseline_metric
metric_name: Velocity média do time
metric_category: velocity      # velocity | quality | process | business
baseline_value: 28             # valor atual de referência
target_value: 40               # meta
unit: story_points_por_sprint
baseline_date: 2026-01-01
target_date: 2026-06-30
description: |
  Velocity medida nos últimos 3 sprints (SP-001, SP-002, SP-003).
  Meta de 40 pontos por sprint para Q2 2026.
notes: |
  Baseline ajustado após inclusão do Brunno no time.

---

## baseline_metric
metric_name: Taxa de bugs por sprint
metric_category: quality
baseline_value: 4.5            # média de bugs novos por sprint
target_value: 2
unit: bugs_por_sprint
baseline_date: 2026-01-01
target_date: 2026-06-30
```

**Comportamento:**
- Se métrica com mesmo `metric_name + project_id` existe → atualiza valores
- Se não existe → cria novo registro

---

### CATEGORIA E — Marketing

---

### 5.17 Template: `marketing_campaign`

Cria uma campanha em `marketing_campaigns`.

```markdown
## marketing_campaign
name: Lançamento UzzOPS — Q1 2026
description: |
  Campanha de lançamento do UzzOPS como produto.
  Foco em awareness e geração de leads via conteúdo orgânico.
objective: awareness           # awareness | consideration | conversion | engagement | retention
start_date: 2026-03-01
end_date: 2026-03-31
status: draft                  # draft | active | completed | archived
color: "#6366F1"               # cor para identificação visual no calendário
observation: |
  Aprovado na reunião de marketing de 13/02. Budget definido: R$ 3.000.
```

**Campos obrigatórios:** `name`, `objective`, `start_date`

---

### 5.18 Template: `marketing_post`

Cria um `marketing_content_pieces` + N `marketing_publications` (um por canal).

```markdown
## marketing_post
title: Quem Somos — Conheça o Fundador
content_type: feed             # feed | reels | carrossel | stories | artigo | video
topic: Quem Somos
objective: awareness           # awareness | consideration | conversion | engagement
campaign: Lançamento UzzOPS — Q1 2026  # opcional — nome da campanha existente
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

### CATEGORIA F — Riscos e Time

---

### 5.19 Template: `risk`

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

### 5.20 Template: `team_member`

Registra um novo membro do time em `team_members`.

```markdown
## team_member
name: João Silva
email: joao@uzzai.com.br       # opcional
role: developer                # developer | designer | qa | product | devops | analyst | manager
department: Engenharia         # opcional
allocation_percent: 100        # 0–100, porcentagem de dedicação ao projeto
velocity_avg: 18               # opcional — velocity média histórica em SP
is_active: true
observation: |
  Integrado ao time a partir do sprint 4. Responsável pelo módulo de integrações.
```

**Comportamento:**
- Verifica duplicata por `email` (se fornecido) ou `name + tenant_id`
- Se duplicata → adiciona observação ao campo existente

---

### CATEGORIA G — Clientes (Tier 3 / Opcional)

---

### 5.21 Template: `uzzapp_client` *(Tier 3 — baixa prioridade)*

Registra um novo cliente UzzApp em `uzzapp_clients`.

```markdown
## uzzapp_client
name: Maria Oliveira
company: Boutique da Maria
phone: 5511999998888          # formato internacional sem espaços
email: maria@boutiquedamaria.com.br  # opcional
plan: starter                  # starter | pro | enterprise
status: trial                  # active | trial | churned | paused
onboarded_at: 2026-02-13      # opcional — default: hoje
observation: |
  Onboarding realizado na reunião de 13/02. 30 dias de trial.
```

---

## 6. Template Master (Arquivo Completo)

Este é o arquivo `.md` que o usuário faz upload. Combina qualquer subconjunto dos templates acima.
Cada bloco `## tipo` é separado do próximo por `---`.

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

---

## feature
name: Implementar parser de markdown para o MD Feeder
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

---

## bug
name: Campo sprint_goal aceita string vazia no frontend
category: Frontend
priority: P1
status: in_progress
due_date: 2026-02-15

---

## bug_resolution
code: F-038
status: done
solution_notes: |
  Corrigido o middleware de tenant em src/middleware.ts linha 47.
resolved_at: 2026-02-13

---

## user_story
feature: F-088
as_a: Gerente de Projeto
i_want: fazer upload de um .md estruturado
so_that: as informações da reunião sejam inseridas automaticamente

---

## task
feature: F-088
title: Implementar parser de frontmatter YAML
status: todo
assigned_to: Pedro Vitor
estimated_hours: 4

---

## feature_dependency
feature: F-089
depends_on: F-088
dependency_type: blocks

---

## sprint_update
code: SPR-002
status: completed
velocity_actual: 31
completed_at: 2026-02-12

---

## daily
date: 2026-02-13
type: collective
summary: |
  Reunião de planejamento da sprint 4.
  Pedro apresentou os planos para o MD Feeder.
impediments:
  - Deploy de hotfix bloqueado por review pendente

---

## risk
title: Complexidade do parser MD pode atrasar entrega
gut_g: 3
gut_u: 4
gut_t: 3
status: identified
mitigation_plan: |
  Começar pelo subconjunto mínimo: feature + bug + bug_resolution.

---

## retrospective
sprint: SPR-002
category: needs_improvement
action_text: |
  Definir DoD antes do início do sprint.
owner: Pedro Vitor
due_date: 2026-03-01

---

## planning_result
session_date: 2026-02-13
items:
  - code: F-050
    story_points: 8
    business_value: 9
    consensus: unanimous
  - code: F-051
    story_points: 5
    business_value: 7
    consensus: majority

---

## marketing_campaign
name: Lançamento UzzOPS — Q1 2026
objective: awareness
start_date: 2026-03-01
end_date: 2026-03-31
status: draft

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
  - "#buildinpublic"
publish:
  - channel: instagram
    date: 2026-03-05
```

---

## 7. Banco de Dados — Alterações Necessárias

### 7.1 Migration `019_md_feeder.sql`

#### 7.1.1 Nova coluna: `features.observations`

```sql
ALTER TABLE public.features
ADD COLUMN observations JSONB DEFAULT '[]'::jsonb NOT NULL;

COMMENT ON COLUMN public.features.observations IS
  'Array de observações adicionadas via import. Schema: [{text, source, imported_at, imported_by_name}]';
```

Estrutura de cada observação:
```json
{
  "text": "Discutido na reunião de 13/02.",
  "source": "ata-reuniao-13fev2026",
  "imported_at": "2026-02-13T18:30:00Z",
  "imported_by": "Pedro Vitor"
}
```

#### 7.1.2 Nova tabela: `md_feeder_imports`

```sql
CREATE TABLE public.md_feeder_imports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id),
  project_id      UUID REFERENCES public.projects(id),
  sprint_context  TEXT,
  original_filename TEXT NOT NULL,
  file_content    TEXT NOT NULL,
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
  created_by_name TEXT,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_md_feeder_imports_tenant ON public.md_feeder_imports(tenant_id, created_at DESC);
CREATE INDEX idx_md_feeder_imports_project ON public.md_feeder_imports(project_id);
```

#### 7.1.3 Nova tabela: `md_feeder_import_items`

```sql
CREATE TABLE public.md_feeder_import_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL,
  import_id         UUID NOT NULL REFERENCES public.md_feeder_imports(id) ON DELETE CASCADE,

  item_index        INTEGER NOT NULL,
  item_type         TEXT NOT NULL
                    CHECK (item_type IN (
                      'feature','epic','spike','spike_result',
                      'bug','bug_resolution','planning_result',
                      'sprint','sprint_update','task',
                      'user_story','daily','daily_member','retrospective',
                      'feature_dependency','baseline_metric',
                      'marketing_campaign','marketing_post',
                      'risk','team_member','uzzapp_client'
                    )),

  raw_data          JSONB NOT NULL,

  validation_status TEXT NOT NULL DEFAULT 'pending'
                    CHECK (validation_status IN (
                      'pending','valid','invalid','duplicate','duplicate_with_extras'
                    )),
  validation_errors JSONB DEFAULT '[]'::jsonb NOT NULL,

  action            TEXT
                    CHECK (action IN ('create','update','skip','add_observation',NULL)),

  entity_type       TEXT,
  entity_id         UUID,
  entity_code       TEXT,
  conflict_reason   TEXT,

  created_at        TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_md_feeder_items_import ON public.md_feeder_import_items(import_id, item_index);
```

#### 7.1.4 RLS Policies

```sql
ALTER TABLE public.md_feeder_imports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.md_feeder_imports
  USING (tenant_id = public.get_user_tenant_id());

ALTER TABLE public.md_feeder_import_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.md_feeder_import_items
  USING (tenant_id = public.get_user_tenant_id());
```

---

## 8. Lógica de Parse

### 8.1 Etapas do Parser (Node.js/TypeScript)

```
Arquivo .md recebido
    ↓
Passo 1: Parse do frontmatter YAML (entre --- e ---)
    → extrai: template, version, project, sprint, date, author, source
    → valida: project existe? sprint existe (ou criar novo)?
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
    → referências existem? (bug_resolution → code existe; feature_dependency → ambas existem?)
    ↓
Passo 5: Detecção de duplicatas
    → por chave primária de negócio (ver tabela abaixo)
    ↓
Passo 6: Determinação da action por item
    → valid + não-duplicata → "create"
    → valid + duplicata + sem observation → "skip"
    → valid + duplicata + com observation → "add_observation"
    → tipos sempre-update (bug_resolution, spike_result, sprint_update, planning_result) → "update"
    → invalid → erro, ação = null
    ↓
Passo 7: Montar preview response
```

### 8.2 Regras por Item Type

| Item Type | Chave de duplicata | Action padrão se duplicata | Comportamento especial |
|---|---|---|---|
| `feature` | `code` ou `name+project_id` | skip / add_observation | Gera code se ausente |
| `epic` | `code` ou `name+project_id` | skip / add_observation | Cria filhas em epic_decomposition |
| `spike` | `code` ou `name+project_id` | skip / add_observation | — |
| `spike_result` | `code` obrigatório | **sempre update** | Cria feature derivada se convert_to_story=true |
| `bug` | `code` ou `name+project_id` | skip / add_observation | — |
| `bug_resolution` | `code` obrigatório | **sempre update** | Insere em work_item_status_history |
| `planning_result` | por item: `code` obrigatório | **sempre update** | Atualiza story_points/BV/effort |
| `sprint` | `code` ou `name+project_id` | skip | Gera code se ausente |
| `sprint_update` | `code` obrigatório | **sempre update** | — |
| `task` | `title + feature_id` | skip | — |
| `user_story` | `feature_id` | add_observation | Uma user story por feature |
| `daily` | `date + type=collective + project_id` | add_observation no summary | Evitar 2 coletivos no mesmo dia |
| `daily_member` | `date + member + project_id` | skip | — |
| `feature_dependency` | `feature_id + depends_on_id` | skip | Valida que ambas existem |
| `baseline_metric` | `metric_name + project_id` | **sempre update** | Upsert de métricas |
| `retrospective` | `action_text + sprint_id` (fuzzy 80%) | skip | — |
| `marketing_campaign` | `name + tenant_id` | skip / add_observation | — |
| `marketing_post` | `title + tenant_id` | skip / add_observation | Cria publicações vinculadas |
| `risk` | `title + project_id` (fuzzy 80%) | add_observation | Gera public_id se ausente |
| `team_member` | `email` ou `name+tenant_id` | skip / add_observation | — |
| `uzzapp_client` | `phone` ou `email+tenant_id` | skip / add_observation | — |

---

## 9. API Endpoints

### 9.1 Upload e Parse
```
POST /api/import/md/upload
Content-Type: multipart/form-data
Body: { file: File, project_id?: string }

Response 200: {
  import_id: "uuid",
  parse_status: "parsed",
  preview: {
    items_total: 12,
    items_valid: 9,
    items_update: 2,
    items_observation: 1,
    items_skip: 0,
    items_invalid: 0,
    items: [ { index, item_type, validation_status, action, entity_code, summary, raw_data }, ... ],
    errors: []
  }
}
```

### 9.2 Confirmar Import
```
POST /api/import/md/[import_id]/confirm
Body: { item_overrides?: { [item_index]: { action: "skip" | "create" } } }

Response 200: {
  import_id: "uuid",
  parse_status: "completed",
  items_created: 9,
  items_updated: 2,
  items_skipped: 1,
  items_failed: 0,
  results: [ { index, entity_id, entity_code, status }, ... ]
}
```

### 9.3 Histórico
```
GET /api/import/history?limit=20&offset=0
    → lista imports do tenant com status e resumo

GET /api/import/md/[import_id]
    → detalhe completo com todos os itens
```

### 9.4 Contexto do Repositório (para IA externa)
```
GET /api/projects/[id]/repo-context
    ?format=text   → texto plano para colar no prompt da IA
    ?format=json   → JSON estruturado

Response (text):
  PROJETO: UZZAPP — status: active — progress: 45%
  SPRINT ATIVO: SPR-003 (13/02–28/02) — goal: "Entrega módulo marketing"
  FEATURES (últimas 50): F-001 backlog | F-002 done | ...
  BUGS ABERTOS: F-041 P0 blocked | F-055 P1 in_progress
  RISCOS: RSK-001 GUT=45 mitigated | RSK-003 GUT=125 identified
  MEMBROS: Pedro Vitor (admin) | Brunno (member)
  CLIENTES ATIVOS: 3
  PRÓXIMOS CODES: feature=F-088, sprint=SPR-004, risk=RSK-004, epic=F-090
```

---

## 10. UI — Fluxo Completo

### 10.1 Onde fica o botão
- **Sidebar global:** ícone `Upload` ao lado do nome do projeto
- **Topbar:** botão "Importar MD" visível em qualquer página do projeto
- **Dashboard:** card de acesso rápido

### 10.2 Modal de Upload (Passo 1)

```
┌────────────────────────────────────────────────────────┐
│ Importar via MD Feeder                          [×]    │
├────────────────────────────────────────────────────────┤
│ Projeto: [UZZAPP ▼]                                    │
│                                                        │
│ ┌──────────────────────────────────────────────────┐   │
│ │     Arraste seu arquivo .md aqui ou clique       │   │
│ │     Apenas .md — máx 500KB                       │   │
│ └──────────────────────────────────────────────────┘   │
│                                                        │
│ Baixar template:  [Vazio] [Exemplo] [Templates por tipo]│
│ Contexto do repositório:  [Copiar para usar com IA]    │
│                                                        │
│                          [Cancelar] [Fazer Parse →]    │
└────────────────────────────────────────────────────────┘
```

### 10.3 Preview (Passo 2)

```
┌──────────────────────────────────────────────────────────────────┐
│ Preview — ata-reuniao-13fev2026.md                    [×]       │
│ 12 itens encontrados                                             │
├──────────────┬──────────────┬──────────┬─────────────────────────┤
│  CRIAR (9)   │ ATUALIZAR(2) │ PULAR (0)│  ERROS (0)              │
├──────────────┴──────────────┴──────────┴─────────────────────────┤
│ # │ Tipo             │ Código  │ Nome                 │ Ação      │
├───┼──────────────────┼─────────┼──────────────────────┼───────────┤
│ 1 │ ● feature        │ F-088*  │ Parser de markdown   │ ✓ Criar   │
│ 2 │ ◎ bug            │ F-089*  │ sprint_goal vazio    │ ✓ Criar   │
│ 3 │ ✎ bug_resolution │ F-038   │ Bug middleware        │ ✓ Atualiz.│
│ 4 │ ● user_story     │ —       │ Para F-088           │ ✓ Criar   │
│ 5 │ ● task           │ —       │ Parser frontmatter   │ ✓ Criar   │
│ 6 │ → dependency     │ —       │ F-089 blocks F-088   │ ✓ Criar   │
│ 7 │ ✎ sprint_update  │ SPR-002 │ Fechar sprint        │ ✓ Atualiz.│
│ 8 │ ● daily          │ —       │ Coletivo 13/02       │ ✓ Criar   │
│ 9 │ ▲ risk           │ RSK-004*│ Complexidade parser  │ ✓ Criar   │
│10 │ ● retrospective  │ —       │ DoD antes do sprint  │ ✓ Criar   │
│11 │ ✎ planning_result│ —       │ F-050, F-051         │ ✓ Atualiz.│
│12 │ ● mkt_post       │ MKT-023*│ Lançamento bastidores│ ✓ Criar   │
├───┴──────────────────┴─────────┴──────────────────────┴───────────┤
│ * = código gerado automaticamente                                │
│ [← Voltar]   [Expandir item]    [Confirmar Import →]            │
└──────────────────────────────────────────────────────────────────┘
```

### 10.4 Resultado (Passo 3)

```
┌──────────────────────────────────────────────────────┐
│ ✅ Import concluído!                          [×]    │
├──────────────────────────────────────────────────────┤
│  9 criados  │  3 atualizados  │  0 pulados │ 0 erros  │
├──────────────────────────────────────────────────────┤
│ ▶ F-088 criada — Parser de markdown                  │
│ ▶ F-089 criada (bug) — sprint_goal vazio             │
│ ✎ F-038 atualizada → done                           │
│ ▶ User story criada para F-088                       │
│ ▶ Task criada para F-088                             │
│ ▶ Dependência F-089 → F-088 criada                  │
│ ✎ SPR-002 fechado — velocity: 31sp                  │
│ ▶ Daily coletivo 13/02 registrado                    │
│ ▶ RSK-004 criado                                     │
│ ▶ Retrospective criada para SPR-002                  │
│ ✎ Planning result: F-050, F-051 atualizadas         │
│ ▶ MKT-023 criado + 2 publicações agendadas          │
├──────────────────────────────────────────────────────┤
│        [Ver features] [Ver histórico de imports]     │
└──────────────────────────────────────────────────────┘
```

---

## 11. Plano de Implementação em Fases

### Fase 1 — Fundação (MVP mínimo viável)

**Suporte a:** `feature`, `bug`, `bug_resolution`
**Objetivo:** Provar o conceito com as entidades mais usadas

1. Migration `019_md_feeder.sql`: observations JSONB, md_feeder_imports, md_feeder_import_items, RLS
2. Parser TypeScript: frontmatter YAML, split de blocos, validação de feature/bug/bug_resolution
3. API: `POST /api/import/md/upload`, `POST /api/import/md/[id]/confirm`
4. UI: modal upload (3 passos), botão na topbar

### Fase 2 — Planejamento e Cerimônias

**Suporte a:** `epic`, `spike`, `spike_result`, `sprint`, `sprint_update`, `task`, `user_story`, `daily`, `daily_member`, `feature_dependency`

5. Parsers para todos esses tipos
6. Lógica de epic + decomposição de filhos
7. Lógica de spike_result + conversão para story
8. Mapeamento de team_member por nome no daily_member
9. API: `GET /api/projects/[id]/repo-context`
10. UI: botão "Copiar contexto para IA" no modal

### Fase 3 — Métricas, Marketing e Riscos

**Suporte a:** `risk`, `retrospective`, `planning_result`, `baseline_metric`, `marketing_campaign`, `marketing_post`

11. Parsers para todos esses tipos
12. Lógica de marketing_post: campaign lookup, publicações vinculadas
13. `GET /api/import/history` + página de histórico
14. Download de templates individuais + master exemplo

### Fase 4 — Time e Clientes (Tier 3)

**Suporte a:** `team_member`, `uzzapp_client`

15. Parsers para tipos Tier 3
16. Refinamento do repo-context para consumo por LLMs

### Fase 5 — Preparação para Agente

17. Formato de texto otimizado para LLMs no repo-context
18. Versionamento de template (`template_version` no header)
19. Webhook trigger quando import é concluído
20. Agente interno que gera o .md diretamente a partir de transcrição

---

## 12. Critérios de Aceite Global

- [ ] Upload de `.md` gera preview antes de qualquer INSERT no banco
- [ ] Features com `code` existente são puladas ou recebem observação
- [ ] `bug_resolution` e `spike_result` sempre atualizam + gravam `work_item_status_history`
- [ ] `planning_result` sempre atualiza pontuações das features
- [ ] Itens inválidos reportados com mensagem clara sem bloquear os válidos
- [ ] Histórico de todos os imports com rastreabilidade completa + arquivo .md salvo
- [ ] Multi-tenant: RLS em `md_feeder_imports` e `md_feeder_import_items`
- [ ] `GET /api/projects/[id]/repo-context` retorna snapshot utilizável como contexto de IA
- [ ] Templates disponíveis para download por tipo e master exemplo
- [ ] 21 tipos de template suportados ao longo das 5 fases

---

## 13. Impacto no Banco Atual

| Mudança | Tabela | Tipo | Risco |
|---|---|---|---|
| Adicionar coluna `observations` | `features` | ALTER TABLE | Baixo — DEFAULT '[]', sem null |
| Nova tabela `md_feeder_imports` | — | CREATE TABLE | Baixo |
| Nova tabela `md_feeder_import_items` | — | CREATE TABLE + CHECK atualizado | Baixo |
| Nenhuma mudança em tabelas existentes de negócio | — | — | Zero |

**Nota:** Tabelas `marketing_*`, `user_stories`, `tasks`, `feature_dependencies`, `baseline_metrics`,
`planning_poker_results`, `team_members`, `uzzapp_clients` já existem. O parser apenas escreve nelas
sem necessidade de DDL adicional.

---

## 14. Template para Geração por IA (Prompt Base)

```
Você é um assistente de gestão de projetos ágeis para UzzOPS.
Abaixo está o CONTEXTO ATUAL do projeto:

[COLAR AQUI O OUTPUT DE /api/projects/UZZAPP/repo-context]

---

Agora leia esta ATA DE REUNIÃO:

[COLAR AQUI O TEXTO DA ATA OU TRANSCRIÇÃO]

---

Com base na ata e no contexto do projeto, gere um arquivo .md
seguindo EXATAMENTE o template uzzops-feeder v1.0.

Tipos disponíveis: feature, epic, spike, spike_result, bug, bug_resolution,
planning_result, sprint, sprint_update, task, user_story, daily, daily_member,
feature_dependency, baseline_metric, retrospective, marketing_campaign,
marketing_post, risk, team_member, uzzapp_client.

Regras:
- Não crie features com códigos que já existem (veja lista no contexto)
- Se feature existente foi mencionada para fechar → use bug_resolution ou spike_result
- Se feature existente ganhou observação → inclua o campo observation:
- sprint_goal deve ter no mínimo 10 caracteres
- Datas no formato YYYY-MM-DD
- gut_g, gut_u, gut_t devem ser inteiros de 1 a 5
- Apenas inclua o que foi claramente discutido na ata (seja conservador)
- Use os campos obrigatórios de cada tipo (consulte PLANO_MD_FEEDER_CENTRAL.md)

Referência de templates: docs/PLANO_MD_FEEDER_CENTRAL.md
```

---

*Versão 1.1 — Revisão completa com mapeamento das 39 tabelas do schema.*
*Versão 1.0 tinha 9 tipos. Esta versão tem 21 tipos cobrindo todas as entidades relevantes.*
