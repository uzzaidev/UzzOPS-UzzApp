# Metodologia de Cronograma e Planejamento — UzzOPS

**Versão:** 1.0  
**Data:** 2026-02-14  
**Status:** Documentação Operacional  
**Contexto:** Sistema de gestão de cronograma profissional baseado em Scrum/Sprint para projetos UzzOPS

---

## 1. Visão Geral da Metodologia

### 1.1 Princípios Fundamentais

A metodologia implementada no UzzOPS segue três eixos simultâneos:

1. **Direção (Outcomes + Hipóteses + Roadmap Adaptativo)**
   - Planejamento orientado a resultados, não a features fixas
   - Discovery paralelo para validar hipóteses antes de construir
   - Roadmap adaptativo que muda com evidências

2. **Entrega (Sprints com Sprint Goal, DoD e Incrementos Verificáveis)**
   - Cadência Scrum para manter previsibilidade
   - Definition of Done (DoD) como gate de qualidade
   - Incrementos verificáveis a cada sprint

3. **Previsão (Forecast por Dados)**
   - Story points + velocity para estimativa relativa
   - Evolução para Monte Carlo (probabilidades e ranges)
   - Evita "data única" — comunica ranges com probabilidade

### 1.2 Suposições Operacionais (Ajustáveis)

- **Sprint:** 2 semanas (padrão, não fixo)
- **Release:** 6 sprints (referência, revisável)
- **Estimativa:** Story points (não horas/pessoa)
- **Previsibilidade:** Velocity empírica + forecast probabilístico

---

## 2. Estrutura de Planejamento em Camadas

### 2.1 Camada de Produto (Roadmap Adaptativo)

**Artefato no UzzOPS:** `Features` com `is_epic = true` + `Marketing Campaigns`

**Como registrar:**
- Criar **Épicos** (`epic`) agrupando features relacionadas
- Usar **Campanhas de Marketing** para agrupar conteúdos por objetivo
- Documentar **Outcomes** no campo `description` do épico
- Usar `version` (MVP, V1, V2) para marcar marcos de produto

**Template de Épico:**
```markdown
## epic
name: Epic: Módulo de Marketing Completo
description: |
  Outcome: Reduzir tempo de criação de conteúdo em 50%
  Hipótese: Se tivermos calendário editorial + acervo centralizado,
  então reduziremos retrabalho e aumentaremos consistência.
category: Produto
version: V1
priority: P1
moscow: Must
```

### 2.2 Camada de Release (Marcos)

**Artefato no UzzOPS:** `Sprints` agrupados por release

**Como registrar:**
- Criar **Sprints** com `sprint_goal` claro
- Agrupar sprints em releases (usar `name` com padrão: "Release 1 - Q1 2026")
- Documentar marcos no `sprint_goal` ou `observation`

**Template de Sprint:**
```markdown
## sprint
name: Sprint 4 — Marketing e Qualidade
sprint_goal: Entregar calendário editorial e corrigir 3 bugs críticos P0
start_date: 2026-03-01
end_date: 2026-03-14
duration_weeks: 2
velocity_target: 35
```

### 2.3 Camada de Iteração (Sprint)

**Artefato no UzzOPS:** `Sprint Features` + `Sprint Planning` (via MD Feeder)

**Como registrar:**
- No **Sprint Planning**, selecionar features do backlog
- Definir **Sprint Goal** no campo `sprint_goal` do sprint
- Estimar com **Story Points** no campo `story_points` das features
- Registrar **Planning Result** via MD Feeder após Planning Poker

**Template de Planning Result:**
```markdown
## planning_result
session_date: 2026-02-13
items:
  - code: F-050
    story_points: 8
    business_value: 9
    work_effort: 7
    consensus: unanimous
```

### 2.4 Camada Diária (Operacional)

**Artefato no UzzOPS:** `Daily Scrum Logs`

**Como registrar:**
- Registrar **Daily** coletivo ou por membro
- Mencionar features em `features_mentioned`
- Documentar impedimentos em `impediments`
- Usar MD Feeder para importar dailies de reuniões

**Template de Daily:**
```markdown
## daily
date: 2026-02-13
type: collective
summary: |
  Brunno finalizou testes de regressão.
  Pedro iniciou parser de MD.
impediments:
  - Ambiente staging instável
features_mentioned:
  - F-038
  - F-042
```

---

## 3. Backlog Estruturado: Temas → Épicos → Histórias

### 3.1 Estrutura Recomendada

**Tema (Outcome/Bet):** Agrupa múltiplos épicos por objetivo estratégico  
**Épico:** Agrupa features relacionadas (pode ter decomposição)  
**Feature/História:** Item entregável com critérios de aceite  
**Spike:** Investigação timeboxed para reduzir incerteza

### 3.2 Como Registrar no UzzOPS

**Temas:**
- Usar **Épicos** com `is_epic = true` como "pasta mãe"
- Documentar tema no `description` do épico pai

**Épicos:**
- Criar feature com `is_epic = true`
- Usar `epic_decomposition` para vincular features filhas
- Campo `version` para marcar release do épico

**Features:**
- Seguir template INVEST (Independente, Negociável, Valiosa, Estimável, Pequena, Testável)
- Usar `story_points` para estimativa relativa
- Campo `moscow` (Must/Should/Could/Wont) para priorização

**Spikes:**
- Criar feature com `is_spike = true`
- Campo `spike_timebox_hours` para limitar investigação
- Após spike, usar `spike_result` para registrar outcome

---

## 4. Definition of Done (DoD) e Critérios de Aceite

### 4.1 DoD no UzzOPS

**Artefato:** `dod_levels` + `features.dod_progress`

**Como usar:**
- Definir níveis de DoD em `dod_levels` (Nível 1, 2, 3...)
- Cada feature tem `dod_progress` (0-100%) por nível
- Feature só é "Done" se passar em todos os níveis ativos

**Template de DoD (exemplo):**
- **Nível 1 (Mínimo):** Código revisado, testes passando, documentação básica
- **Nível 2 (Produção):** + Deploy em staging, validação de UX, métricas coletadas
- **Nível 3 (Enterprise):** + Performance validada, segurança auditada, monitoramento ativo

### 4.2 Critérios de Aceite (CoS)

**Artefato:** `user_stories.acceptance_criteria`

**Como registrar:**
- Criar **User Story** vinculada à feature
- Documentar critérios em `acceptance_criteria` (array)
- Cada critério deve ser testável e mensurável

**Template:**
```markdown
## user_story
feature: F-088
as_a: Gerente de Projeto
i_want: fazer upload de arquivo .md estruturado
so_that: informações da reunião sejam inseridas automaticamente
acceptance_criteria:
  - O arquivo deve ser aceito apenas se tiver frontmatter com template=uzzops-feeder
  - O sistema deve mostrar preview de todos os itens antes de confirmar
  - Itens inválidos devem ser reportados com mensagem clara
```

---

## 5. Estimativa e Forecast

### 5.1 Story Points (Estimativa Relativa)

**Artefato no UzzOPS:** `features.story_points`

**Como usar:**
- Estimar features em **story points** (Fibonacci: 1, 2, 3, 5, 8, 13, 21)
- Não estimar em horas — story points são relativos
- Usar **Planning Poker** para consenso (registrar via `planning_result`)

**Escala sugerida:**
- 1-2: Tarefa simples, bem conhecida
- 3-5: Tarefa média, alguma incerteza
- 8-13: Tarefa complexa, requer investigação
- 21+: Spike ou épico a decompor

### 5.2 Velocity (Medição Empírica)

**Artefato no UzzOPS:** `sprints.velocity_actual` + `velocity_history`

**Como medir:**
- Ao fechar sprint, registrar `velocity_actual` (pontos Done)
- Sistema calcula `velocity_history` automaticamente
- Usar média dos últimos 3 sprints para forecast

**Dashboard:** Visualizar velocity no gráfico de burndown do sprint

### 5.3 Forecast Probabilístico (Monte Carlo)

**Artefato no UzzOPS:** `project_progress_snapshots` + forecast manual

**Como usar:**
- Velocity histórica alimenta distribuição probabilística
- Comunicar ranges: "50% de chance de entregar 30-40 pontos em 3 sprints"
- Não prometer data única — sempre range com probabilidade

**Ferramenta externa recomendada:** Usar velocity do UzzOPS como input para ferramenta de Monte Carlo (ex: ActionableAgile, FocusedObjective)

---

## 6. Cerimônias Scrum no UzzOPS

### 6.1 Sprint Planning

**Artefato:** `Sprint` criado + features selecionadas

**Como registrar:**
1. Criar novo Sprint com `sprint_goal`
2. Selecionar features do backlog (via UI ou MD Feeder)
3. Estimar features selecionadas (Planning Poker)
4. Registrar `planning_result` via MD Feeder

**Checklist:**
- [ ] Sprint Goal definido e claro
- [ ] Features selecionadas estimadas
- [ ] Velocity target definido (baseado em histórico)
- [ ] Dependências mapeadas (`feature_dependencies`)

### 6.2 Daily Scrum

**Artefato:** `daily_scrum_logs`

**Como registrar:**
- Usar template `daily` ou `daily_member` no MD Feeder
- Mencionar features em progresso
- Documentar impedimentos
- Sistema vincula automaticamente features mencionadas

**Template:**
```markdown
## daily_member
date: 2026-02-13
member: Pedro Vitor
yesterday: |
  Corrigi bug F-038 do middleware.
today: |
  Vou implementar parser de MD.
impediments:
  - PR aguardando revisão há 2 dias
features_mentioned:
  - F-038
```

### 6.3 Sprint Review

**Artefato:** `Sprint` atualizado + `features` com status `done`

**Como registrar:**
1. Atualizar sprint com `sprint_update` (status: completed, velocity_actual)
2. Marcar features como `done` (se passaram DoD)
3. Documentar aprendizados em `observation` do sprint
4. Criar novas features do backlog refinado

**Checklist:**
- [ ] Features Done demonstradas
- [ ] Velocity atual registrada
- [ ] Aprendizados documentados
- [ ] Backlog atualizado com novas prioridades

### 6.4 Sprint Retrospective

**Artefato:** `retrospective_actions`

**Como registrar:**
- Usar template `retrospective` no MD Feeder
- Criar ações com owner e due_date
- Acompanhar status das ações no dashboard

**Template:**
```markdown
## retrospective
sprint: SPR-003
category: needs_improvement
action_text: |
  Definir critérios de DoD antes do início do sprint.
status: pending
owner: Pedro Vitor
due_date: 2026-03-01
```

---

## 7. Gestão de Riscos

### 7.1 Identificação de Riscos

**Artefato no UzzOPS:** `risks`

**Como registrar:**
- Criar risco com GUT (Gravidade, Urgência, Tendência) 1-5
- Sistema calcula `gut_score` automaticamente
- Riscos críticos (GUT ≥ 100) aparecem no dashboard

**Template:**
```markdown
## risk
title: Atraso no módulo de marketing pode impactar lançamento
description: |
  Complexidade do calendário pode exceder estimativa.
gut_g: 4
gut_u: 3
gut_t: 3
status: identified
mitigation_plan: |
  Dividir em 3 fases. Fase 1: só calendário.
owner: Pedro Vitor
```

### 7.2 Spikes para Mitigação

**Artefato:** `features` com `is_spike = true`

**Como usar:**
- Quando risco técnico bloqueia estimativa, criar spike
- Timebox obrigatório (`spike_timebox_hours`)
- Após spike, registrar `spike_result` com decisão

**Template:**
```markdown
## spike
name: Investigar viabilidade de OCR para NFe
spike_timebox_hours: 16
due_date: 2026-03-07

## spike_result
code: F-XXX
status: done
spike_outcome: |
  Google Vision API atingiu 94% com custo R$0.003/doc.
  Recomendação: usar Google Vision API.
convert_to_story: true
converted_story:
  name: Integrar Google Vision API
  story_points: 13
```

---

## 8. Roadmap Adaptativo (OST + Decision Log)

### 8.1 Opportunity Solution Tree (OST)

**Artefato no UzzOPS:** Documentação externa + Épicos como "soluções"

**Como registrar:**
- Criar documento `docs/ost-[projeto].md` com árvore de oportunidades
- Épicos no UzzOPS representam "soluções candidatas"
- Features representam "testes/MVP tests"

**Estrutura:**
```
Outcome (ex: Reduzir tempo de criação de conteúdo)
├── Oportunidade 1: Falta de calendário editorial
│   ├── Solução A: Calendário no UzzOPS (Épico: Marketing)
│   └── Solução B: Integração com Google Calendar
├── Oportunidade 2: Assets espalhados
│   └── Solução: Acervo centralizado (Épico: Marketing)
```

### 8.2 Decision Log

**Artefato no UzzOPS:** `features.observations` + ADRs em `docs/adr/`

**Como registrar:**
- Decisões arquiteturais: criar ADR em `docs/adr/ADR-XXX-[titulo].md`
- Decisões de produto: adicionar em `observation` do épico/feature
- Mudanças de roadmap: documentar em `docs/decision-log.md`

**Template ADR:**
```markdown
# ADR-001 — Usar Supabase Storage para assets de marketing

## Contexto
Precisamos armazenar imagens/vídeos de marketing.

## Decisão
Usar Supabase Storage com bucket `marketing-assets`.

## Alternativas Consideradas
- AWS S3 (mais complexo, custo adicional)
- Local storage (não escala)

## Trade-offs
- Prós: Integração nativa, sem setup adicional
- Contras: Limite de tamanho por arquivo

## Consequências
- Upload via API route `/api/marketing/assets/upload`
- RLS policies para isolamento multi-tenant
```

---

## 9. Métricas e KPIs

### 9.1 KPIs por Sprint

**Artefato no UzzOPS:** Dashboard Enterprise

**Métricas principais:**
- **Velocity:** `sprints.velocity_actual` vs `velocity_target`
- **Sprint Progress:** % de pontos Done sobre total
- **DoD Compliance:** `features.dod_progress` médio
- **Blocked Features:** Features com `status = blocked`

**Como visualizar:**
- Dashboard `/dashboard` mostra KPIs em tempo real
- Activity Feed mostra eventos recentes

### 9.2 KPIs por Release

**Artefato:** `project_progress_snapshots` + métricas agregadas

**Métricas principais:**
- **MVP Progress:** % de features MVP done
- **Health Score:** Score composto (0-100) do projeto
- **Critical Risks:** Contagem de riscos com GUT ≥ 100
- **Velocity Trend:** Evolução da velocity ao longo do tempo

**Como visualizar:**
- Página `/progress` (quando implementada)
- Dashboard Enterprise mostra health score

---

## 10. Templates e Checklists

### 10.1 Product Charter (1 página)

**Artefato:** Documento em `docs/charter-[projeto].md`

**Template:**
```markdown
# Product Charter — [Nome do Projeto]

## Visão/Outcome Principal
[Descrever o resultado desejado]

## Usuários-alvo e Contextos
[Quem usa, em que situação]

## Hipóteses Críticas
- Valor: [hipótese de valor]
- Usabilidade: [hipótese de usabilidade]
- Feasibility: [hipótese técnica]
- Viabilidade: [hipótese de negócio]

## Casos Âncora do MVP (3)
1. [Caso 1]
2. [Caso 2]
3. [Caso 3]

## Métricas de Sucesso
- [Métrica 1]: [threshold]
- [Métrica 2]: [threshold]

## Restrições Não-negociáveis
- [Restrição 1]
- [Restrição 2]

## Riscos Top-10 e Estratégia de Mitigação
1. [Risco] → [Spike/Mitigação]
2. [Risco] → [Spike/Mitigação]

## Regras de IP/Divulgação
- [Regra 1]
- [Regra 2]
```

### 10.2 Sprint Plan Checklist

**Antes do Sprint Planning:**
- [ ] Backlog refinado (features estimáveis)
- [ ] Velocity histórica conhecida
- [ ] DoD atualizado e claro
- [ ] Riscos abertos mapeados

**Durante o Sprint Planning:**
- [ ] Sprint Goal definido (por que é valiosa)
- [ ] Features selecionadas (o que)
- [ ] Plano de entrega (como)
- [ ] Dependências identificadas

**Após o Sprint Planning:**
- [ ] Sprint criado no UzzOPS
- [ ] Features vinculadas ao sprint
- [ ] Planning result registrado
- [ ] Sprint Goal documentado

### 10.3 Sprint Review Checklist

**Preparação:**
- [ ] Features Done listadas
- [ ] Demo preparada (se aplicável)
- [ ] Métricas coletadas (velocity, DoD, bugs)

**Durante a Review:**
- [ ] Demonstração de incrementos
- [ ] Feedback de stakeholders
- [ ] Aprendizados documentados
- [ ] Decisões sobre backlog

**Após a Review:**
- [ ] Sprint atualizado (status: completed)
- [ ] Velocity atual registrada
- [ ] Backlog atualizado
- [ ] Retrospective agendada

---

## 11. Integração com Features Existentes do UzzOPS

### 11.1 MD Feeder para Cronograma

**Uso:** Importar planejamento de reuniões diretamente no sistema

**Templates relevantes:**
- `sprint` — criar sprint
- `sprint_update` — fechar sprint
- `planning_result` — registrar estimativas
- `daily` / `daily_member` — registrar dailies
- `retrospective` — ações de melhoria
- `risk` — riscos identificados
- `spike` / `spike_result` — investigações

**Fluxo:**
1. Reunião acontece
2. Transcrição gerada
3. IA externa gera `.md` com template uzzops-feeder
4. Upload via MD Feeder
5. Preview → Confirmação → Dados no sistema

### 11.2 Dashboard Enterprise

**Uso:** Visão executiva do estado do cronograma

**KPIs exibidos:**
- Health Score (0-100)
- Sprint Progress (%)
- Features Done/Total
- Critical Risks
- Velocity atual vs target

**Seções:**
- Desenvolvimento: Burndown, Feature Pipeline, MVP Progress, DoD, Retro Actions
- Marketing: Posts do mês, Pipeline de conteúdo
- CRM: Funil, Hot Leads, Revenue

### 11.3 Activity Feed

**Uso:** Timeline unificada de eventos do cronograma

**Eventos capturados:**
- Features criadas/atualizadas
- Sprints iniciados/fechados
- Dailies registrados
- Riscos criados
- Retrospectivas atualizadas

**Visualização:** Feed cronológico no dashboard

---

## 12. Próximos Passos e Evolução

### 12.1 Fase Atual (MVP)

✅ **Implementado:**
- Estrutura de Sprints, Features, Risks
- MD Feeder para importação
- Dashboard Enterprise básico
- Activity Feed

🔄 **Em Evolução:**
- Forecast probabilístico (Monte Carlo)
- Página dedicada de Progresso
- OST integrado ao sistema
- Decision Log automatizado

### 12.2 Roadmap de Melhorias

**Curto Prazo:**
- [ ] Página `/progress` com histórico e trends
- [ ] Integração de forecast probabilístico
- [ ] Templates de Sprint Plan/Review no MD Feeder
- [ ] Alertas de riscos críticos

**Médio Prazo:**
- [ ] Visualização de OST no sistema
- [ ] Automatização de Decision Log
- [ ] Integração com ferramentas externas (Jira, Linear)
- [ ] Relatórios de velocity e forecast

**Longo Prazo:**
- [ ] Agente interno que gera MD a partir de transcrições
- [ ] Previsão automática de atrasos
- [ ] Recomendações de priorização baseadas em dados
- [ ] Integração com CI/CD para métricas de qualidade

---

## 13. Referências e Leituras

### 13.1 Documentos Base

- `docs/deep-research-report (1).md` — Documento operacional completo
- `docs/deep-research-report.md` — Playbook profissional
- `docs/PLANO_MD_FEEDER_CENTRAL.md` — Templates de importação

### 13.2 Fontes Externas Recomendadas

1. **Scrum Guide (PT-BR)** — Eventos, artefatos, DoD
2. **Agile Estimating & Planning (Cohn)** — Cone de incerteza, planejamento iterativo
3. **User Stories Applied (Cohn)** — INVEST, spikes timeboxed
4. **SVPG (Cagan)** — Roadmap por outcomes, discovery vs delivery
5. **Forecast Probabilístico / Monte Carlo** — Ranges com probabilidade

---

**Documento vivo:** Este guia deve ser atualizado conforme a metodologia evolui e novas features são implementadas no UzzOPS.

