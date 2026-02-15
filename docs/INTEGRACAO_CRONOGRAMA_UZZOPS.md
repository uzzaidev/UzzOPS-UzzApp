# Integração: Metodologia de Cronograma com Features Existentes do UzzOPS

**Versão:** 1.0  
**Data:** 2026-02-14  
**Objetivo:** Mapear como usar cada feature do UzzOPS para implementar a metodologia de cronograma

---

## 1. Mapeamento: Metodologia → Features do UzzOPS

### 1.1 Roadmap Adaptativo (OST + Decision Log)

**Metodologia:** Roadmap por outcomes, não por features fixas

**Features UzzOPS:**
- **Épicos** (`features` com `is_epic = true`) → Representam "soluções" do OST
- **Features** → Representam "testes/MVP tests"
- **Marketing Campaigns** → Agrupam conteúdos por objetivo/outcome
- **Documentação externa** (`docs/ost-[projeto].md`) → Árvore completa de oportunidades

**Como usar:**
1. Criar OST em `docs/ost-[projeto].md`
2. Mapear soluções como Épicos no UzzOPS
3. Features vinculadas aos épicos representam testes
4. Campaigns agrupam por outcome de marketing

**Exemplo:**
```
OST:
Outcome: Reduzir tempo de criação de conteúdo
  └── Oportunidade: Falta de calendário
      └── Solução: Calendário no UzzOPS
          └── Épico: Marketing (UzzOPS)
              └── Features: Calendário mensal, Filtros, etc.
```

### 1.2 Backlog Estruturado (Temas → Épicos → Histórias)

**Metodologia:** Backlog hierárquico e ordenado

**Features UzzOPS:**
- **Épicos** → Temas/Agrupadores
- **Features** → Histórias entregáveis
- **User Stories** → Critérios de aceite detalhados
- **Tasks** → Sub-tarefas de features
- **Epic Decomposition** → Vincula features filhas ao épico

**Como usar:**
1. Criar épico com `is_epic = true`
2. Criar features vinculadas (via `epic_decomposition`)
3. Criar user stories para cada feature
4. Criar tasks para decomposição técnica

**Campos importantes:**
- `moscow`: Must/Should/Could/Wont (priorização)
- `story_points`: Estimativa relativa
- `priority`: P0/P1/P2/P3
- `version`: MVP/V1/V2 (marcos)

### 1.3 Sprints e Planejamento

**Metodologia:** Cadência Scrum com Sprint Goal e forecast

**Features UzzOPS:**
- **Sprints** → Iterações com goal e velocity
- **Sprint Features** → Features selecionadas para o sprint
- **Planning Result** (MD Feeder) → Registra estimativas do Planning Poker
- **Velocity History** → Histórico para forecast

**Como usar:**
1. Criar sprint com `sprint_goal` claro
2. Selecionar features do backlog
3. Estimar com Planning Poker
4. Registrar `planning_result` via MD Feeder
5. Sistema calcula velocity automaticamente

**Campos importantes:**
- `sprint_goal`: Por que o sprint é valioso (mín. 10 caracteres)
- `velocity_target`: Meta de pontos
- `velocity_actual`: Pontos realmente entregues
- `status`: planned/active/completed/cancelled

### 1.4 Definition of Done (DoD)

**Metodologia:** Gate de qualidade para incrementos

**Features UzzOPS:**
- **DoD Levels** (`dod_levels`) → Níveis de qualidade
- **DoD Progress** (`features.dod_progress`) → % de compliance
- **DoD History** → Histórico de evolução

**Como usar:**
1. Definir níveis de DoD em `dod_levels`
2. Cada feature tem `dod_progress` (0-100%) por nível
3. Feature só é "Done" se passar em todos os níveis ativos
4. Dashboard mostra DoD médio do projeto

**Exemplo de níveis:**
- Nível 1: Código revisado, testes passando
- Nível 2: Deploy staging, validação UX
- Nível 3: Performance, segurança, monitoramento

### 1.5 Daily Scrum

**Metodologia:** Inspeção diária do progresso

**Features UzzOPS:**
- **Daily Scrum Logs** → Registros diários
- **Daily Feature Mentions** → Vincula features mencionadas
- **Activity Feed** → Mostra dailies na timeline

**Como usar:**
1. Registrar daily via UI ou MD Feeder
2. Mencionar features em progresso
3. Documentar impedimentos
4. Sistema vincula automaticamente features

**Templates MD Feeder:**
- `daily` → Coletivo
- `daily_member` → Por membro individual

### 1.6 Sprint Review e Retrospective

**Metodologia:** Inspeção do resultado e adaptação

**Features UzzOPS:**
- **Sprint Update** (MD Feeder) → Fecha sprint com velocity
- **Retrospective Actions** → Ações de melhoria
- **Activity Feed** → Mostra eventos de review/retro

**Como usar:**
1. Atualizar sprint com `sprint_update` (status: completed)
2. Registrar velocity atual
3. Criar ações de retrospective
4. Documentar aprendizados

**Templates MD Feeder:**
- `sprint_update` → Fechar sprint
- `retrospective` → Criar ação de melhoria

### 1.7 Gestão de Riscos

**Metodologia:** Identificação e mitigação proativa

**Features UzzOPS:**
- **Risks** → Riscos com GUT (Gravidade, Urgência, Tendência)
- **GUT Score** → Calculado automaticamente (G × U × T)
- **Dashboard** → Mostra riscos críticos (GUT ≥ 100)

**Como usar:**
1. Criar risco com GUT 1-5
2. Sistema calcula `gut_score` automaticamente
3. Riscos críticos aparecem no dashboard
4. Documentar mitigation plan
5. Criar spikes se necessário para investigar

**Campos importantes:**
- `gut_g`, `gut_u`, `gut_t`: 1-5 cada
- `gut_score`: G × U × T (calculado)
- `status`: identified/analyzing/mitigated/accepted/resolved
- `mitigation_plan`: Como mitigar

### 1.8 Spikes (Investigação Timeboxed)

**Metodologia:** Reduzir incerteza antes de estimar

**Features UzzOPS:**
- **Features** com `is_spike = true` → Spikes
- **Spike Timebox** (`spike_timebox_hours`) → Limite de horas
- **Spike Result** (MD Feeder) → Outcome da investigação

**Como usar:**
1. Criar feature com `is_spike = true`
2. Definir `spike_timebox_hours` (ex: 8, 16, 24h)
3. Após investigação, registrar `spike_result`
4. Se `convert_to_story = true`, cria feature derivada

**Template MD Feeder:**
- `spike` → Criar spike
- `spike_result` → Fechar spike com outcome

### 1.9 Estimativa e Forecast

**Metodologia:** Story points + velocity + forecast probabilístico

**Features UzzOPS:**
- **Story Points** (`features.story_points`) → Estimativa relativa
- **Velocity** (`sprints.velocity_actual`) → Pontos entregues
- **Velocity History** → Histórico para forecast
- **Project Progress Snapshots** → Métricas agregadas

**Como usar:**
1. Estimar features em story points (Fibonacci)
2. Medir velocity ao fechar sprints
3. Usar média dos últimos 3 sprints para forecast
4. Evoluir para Monte Carlo (ferramenta externa)

**Dashboard:**
- Mostra velocity atual vs target
- Burndown mostra progresso
- Health score considera velocity

### 1.10 Métricas e KPIs

**Metodologia:** Evidência, não opinião

**Features UzzOPS:**
- **Dashboard Enterprise** → KPIs em tempo real
- **Project Progress Snapshots** → Histórico de métricas
- **Activity Feed** → Timeline de eventos
- **Health Score** → Score composto (0-100)

**KPIs principais:**
- Health Score (0-100)
- Sprint Progress (%)
- Features Done/Total
- Critical Risks
- Velocity atual vs target
- DoD Compliance
- MVP Progress

**Como visualizar:**
- Dashboard `/dashboard` → Visão executiva
- Página `/progress` (quando implementada) → Histórico e trends
- Activity Feed → Timeline unificada

---

## 2. Fluxos de Trabalho Completos

### 2.1 Fluxo: Criar e Planejar Sprint

**Passo a passo:**
1. **Criar Sprint:**
   - UzzOPS → Sprints → Criar
   - Preencher: name, sprint_goal, start_date, end_date, velocity_target

2. **Selecionar Features:**
   - UzzOPS → Sprints → [Sprint] → Adicionar Features
   - Selecionar do backlog

3. **Estimar (Planning Poker):**
   - Realizar Planning Poker
   - Registrar via MD Feeder (template `planning_result`)

4. **Verificar:**
   - Sprint Goal claro
   - Features estimadas
   - Velocity target realista

**Artefatos gerados:**
- Sprint criado
- Features vinculadas
- Planning result registrado

### 2.2 Fluxo: Executar Sprint (Diário)

**Passo a passo:**
1. **Daily Scrum:**
   - Registrar daily (UI ou MD Feeder)
   - Mencionar features
   - Documentar impedimentos

2. **Atualizar Features:**
   - Atualizar status (in_progress, review, testing)
   - Atualizar dod_progress
   - Registrar bloqueios se necessário

3. **Verificar Burndown:**
   - UzzOPS → Sprints → [Sprint] → Burndown
   - Verificar se está no ritmo

4. **Registrar Riscos:**
   - Se identificar risco, criar em Risks
   - Documentar mitigation plan

**Artefatos gerados:**
- Daily logs
- Features atualizadas
- Riscos identificados

### 2.3 Fluxo: Fechar Sprint (Review + Retro)

**Passo a passo:**
1. **Sprint Review:**
   - Verificar features Done (status = done, dod_progress = 100%)
   - Demonstrar incrementos
   - Calcular velocity atual

2. **Fechar Sprint:**
   - UzzOPS → Sprints → [Sprint] → Fechar
   - Ou via MD Feeder (template `sprint_update`)
   - Registrar velocity_actual

3. **Retrospective:**
   - Identificar o que funcionou/melhorar
   - Criar ações (MD Feeder template `retrospective`)
   - Vincular ao próximo sprint

4. **Atualizar Backlog:**
   - Features não concluídas voltam ao backlog
   - Novas features priorizadas

**Artefatos gerados:**
- Sprint fechado
- Velocity registrada
- Retrospective actions criadas
- Backlog atualizado

### 2.4 Fluxo: Importar Planejamento via MD Feeder

**Passo a passo:**
1. **Reunião acontece:**
   - Sprint Planning, Review, Daily, etc.

2. **Transcrição gerada:**
   - Externa (Zoom, Meet, etc.)

3. **IA gera MD:**
   - Usar contexto do repositório (`GET /api/projects/[id]/repo-context`)
   - IA externa gera `.md` com template uzzops-feeder

4. **Upload no UzzOPS:**
   - UzzOPS → Importar MD (topbar)
   - Upload do arquivo `.md`

5. **Preview e Confirmação:**
   - Sistema mostra preview
   - Usuário confirma itens
   - Dados inseridos no sistema

**Templates úteis:**
- `sprint`, `sprint_update`
- `planning_result`
- `daily`, `daily_member`
- `retrospective`
- `risk`
- `spike`, `spike_result`

---

## 3. Integração com Módulos Existentes

### 3.1 Marketing

**Conexão com Cronograma:**
- **Campaigns** → Agrupam conteúdos por outcome
- **Content Pieces** → Podem ser vinculados a features de marketing
- **Publications** → Aparecem no calendário

**Como usar:**
- Criar épico "Marketing" para agrupar features
- Features de marketing podem gerar content pieces
- Calendário editorial mostra publicações agendadas

### 3.2 CRM

**Conexão com Cronograma:**
- **Clients** → Podem ter features vinculadas (ex: onboarding)
- **Contacts** → Podem gerar features (ex: solicitação de feature)

**Como usar:**
- Feature de onboarding de cliente
- Feature de integração solicitada por cliente
- Pipeline de vendas pode influenciar priorização

### 3.3 Dashboard Enterprise

**Conexão com Cronograma:**
- **KPIs** → Mostram estado do cronograma
- **Activity Feed** → Timeline de eventos
- **Health Score** → Considera velocity, DoD, riscos

**Como usar:**
- Visualizar estado geral do projeto
- Identificar problemas rapidamente
- Acompanhar progresso em tempo real

---

## 4. Boas Práticas de Uso

### 4.1 Nomenclatura Consistente

**Sprints:**
- Padrão: "Sprint X — [Objetivo]"
- Exemplo: "Sprint 4 — Marketing e Qualidade"

**Features:**
- Padrão: "F-XXX" (auto-gerado)
- Nome descritivo e claro

**Épicos:**
- Padrão: "Epic: [Tema]"
- Exemplo: "Epic: Execução Confiável no Revit"

### 4.2 Documentação

**Obrigatório:**
- Sprint Goal sempre preenchido (mín. 10 caracteres)
- Features com description clara
- Riscos com mitigation plan

**Recomendado:**
- User stories com acceptance criteria
- Spikes com outcome documentado
- Retrospective actions com success criteria

### 4.3 Qualidade de Dados

**Regras:**
- Feature só é "Done" se DoD = 100%
- Velocity só conta features realmente Done
- Riscos devem ter status atualizado
- Spikes devem ter timebox definido

**Validações:**
- Sistema valida campos obrigatórios
- DoD progress não pode ser > 100%
- GUT scores calculados automaticamente

---

## 5. Limitações Atuais e Workarounds

### 5.1 Forecast Probabilístico

**Limitação:** Não implementado nativamente

**Workaround:**
- Exportar velocity history
- Usar ferramenta externa (ActionableAgile, FocusedObjective)
- Comunicar ranges manualmente

**Roadmap:** Implementação futura

### 5.2 OST Visual

**Limitação:** Não há visualização de OST no sistema

**Workaround:**
- Manter OST em `docs/ost-[projeto].md`
- Mapear soluções como Épicos
- Features representam testes

**Roadmap:** Visualização futura

### 5.3 Decision Log Automatizado

**Limitação:** Decision Log é manual

**Workaround:**
- Manter em `docs/decision-log.md`
- ADRs em `docs/adr/`
- Observations em features/épicos

**Roadmap:** Automação futura

---

## 6. Checklist de Implementação

### Setup Inicial

- [ ] Product Charter criado
- [ ] Backlog estruturado (Épicos → Features)
- [ ] DoD levels configurados
- [ ] Primeiro sprint criado
- [ ] Team members adicionados

### Operação Contínua

- [ ] Sprints criados com goal claro
- [ ] Features estimadas em story points
- [ ] Dailies registrados
- [ ] Velocity medida e registrada
- [ ] Riscos identificados e mitigados
- [ ] Retrospectives realizadas

### Qualidade

- [ ] DoD sempre verificado antes de "Done"
- [ ] Velocity baseada em features realmente Done
- [ ] Riscos atualizados regularmente
- [ ] Aprendizados documentados
- [ ] Backlog refinado continuamente

---

**Documento de integração:** Use este guia para mapear a metodologia nas features existentes do UzzOPS. Atualize conforme novas features são implementadas.

