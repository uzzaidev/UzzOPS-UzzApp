# Guia Prático: Criando e Gerenciando Cronograma no UzzOPS

**Versão:** 1.0  
**Data:** 2026-02-14  
**Público:** Usuários do UzzOPS que precisam criar e gerenciar cronogramas de projeto

---

## 1. Início Rápido: Criando seu Primeiro Cronograma

### Passo 1: Definir o Product Charter

**Onde:** Criar documento em `docs/charter-[projeto].md`

**O que fazer:**
1. Definir outcome principal do projeto
2. Listar 3 casos âncora do MVP
3. Documentar hipóteses críticas (valor, usabilidade, feasibility, viabilidade)
4. Definir métricas de sucesso

**Exemplo:**
```markdown
# Product Charter — UzzBIM

## Visão/Outcome Principal
Automação de elétrica predial no Revit para escritórios piloto,
reduzindo tempo de tarefas repetitivas em 50% mantendo taxa de sucesso ≥ 90%.

## Casos Âncora do MVP
1. Inserir tomada 220V a 0,30m do piso em parede selecionada
2. Criar circuito elétrico conectando tomadas
3. Validar script antes de executar (AST + rollback)
```

### Passo 2: Criar Backlog Estruturado

**Onde:** UzzOPS → Features → Criar Feature

**Estrutura recomendada:**
1. **Criar Épicos** (Temas):
   - Feature com `is_epic = true`
   - Nome: "Epic: [Tema]"
   - Exemplo: "Epic: Execução Confiável no Revit"

2. **Criar Features** (Histórias):
   - Vincular ao épico (se aplicável)
   - Estimar em story points
   - Definir `moscow` (Must/Should/Could/Wont)
   - Status inicial: `backlog`

**Exemplo no UzzOPS:**
```
Feature: F-001
Name: Inserir tomada 220V a 0,30m do piso
Category: Backend
Version: MVP
Priority: P1
Story Points: 5
Moscow: Must
Status: backlog
Is MVP: true
```

### Passo 3: Criar Primeiro Sprint

**Onde:** UzzOPS → Sprints → Criar Sprint

**Campos obrigatórios:**
- `name`: "Sprint 1 — [Objetivo]"
- `sprint_goal`: "Por que este sprint é valioso" (mín. 10 caracteres)
- `start_date` e `end_date`
- `velocity_target`: Estimativa inicial (ajustar após histórico)

**Exemplo:**
```
Sprint: SPR-001
Name: Sprint 1 — Caso Âncora End-to-End
Sprint Goal: Entregar inserção de tomadas funcionando end-to-end
Start: 2026-02-17
End: 2026-03-02
Duration: 2 semanas
Velocity Target: 20 pontos
```

### Passo 4: Planejar o Sprint

**Onde:** UzzOPS → Sprints → [Sprint] → Adicionar Features

**Processo:**
1. Selecionar features do backlog
2. Estimar com Planning Poker (se necessário)
3. Registrar estimativas via MD Feeder (template `planning_result`)
4. Vincular features ao sprint

**Checklist:**
- [ ] Sprint Goal claro e acordado
- [ ] Features selecionadas estimadas
- [ ] Velocity target realista (baseado em histórico ou estimativa inicial)
- [ ] Dependências mapeadas

---

## 2. Operação Diária: Executando o Sprint

### Daily Scrum

**Onde:** UzzOPS → Daily → Registrar Daily

**Opções:**
1. **Via UI:** Preencher formulário de daily
2. **Via MD Feeder:** Importar daily de reunião

**Template MD Feeder:**
```markdown
## daily_member
date: 2026-02-14
member: Pedro Vitor
yesterday: |
  Corrigi bug F-038 do middleware de tenant.
  Fiz deploy em staging.
today: |
  Vou implementar parser de MD para o MD Feeder.
impediments:
  - PR aguardando revisão há 2 dias
features_mentioned:
  - F-038
  - F-042
```

**O que acontece:**
- Daily registrado em `daily_scrum_logs`
- Features mencionadas vinculadas automaticamente
- Impedimentos aparecem no Activity Feed

### Atualizar Progresso de Features

**Onde:** UzzOPS → Features → [Feature] → Editar

**Campos importantes:**
- `status`: backlog → todo → in_progress → review → testing → done
- `dod_progress`: % de compliance com DoD (0-100)
- `story_points`: Ajustar se estimativa mudou

**Regra:** Feature só é `done` se:
- Status = `done`
- `dod_progress` = 100% (todos os níveis de DoD passaram)

### Registrar Riscos

**Onde:** UzzOPS → Risks → Criar Risco

**Quando criar:**
- Bloqueio técnico identificado
- Dependência externa incerta
- Estimativa pode estar errada
- Recurso crítico indisponível

**Template MD Feeder:**
```markdown
## risk
title: Complexidade do parser MD pode atrasar entrega
description: |
  Parsing de YAML aninhado pode ser mais complexo que estimado.
gut_g: 3
gut_u: 4
gut_t: 3
status: identified
mitigation_plan: |
  Criar spike de 8h para validar abordagem antes de implementar.
owner: Pedro Vitor
```

**O que acontece:**
- Risco criado com GUT score calculado
- Riscos críticos (GUT ≥ 100) aparecem no dashboard
- Mitigation plan documentado

---

## 3. Fechamento de Sprint: Review e Retrospective

### Sprint Review

**Onde:** UzzOPS → Sprints → [Sprint] → Fechar Sprint

**Processo:**
1. **Verificar Features Done:**
   - Listar features com `status = done` e `dod_progress = 100%`
   - Demonstrar incrementos (se aplicável)

2. **Registrar Velocity:**
   - Contar story points das features Done
   - Atualizar sprint com `velocity_actual`

3. **Atualizar Sprint:**
   - Status: `completed`
   - `completed_at`: data de fechamento
   - `observation`: aprendizados e decisões

**Template MD Feeder:**
```markdown
## sprint_update
code: SPR-001
status: completed
velocity_actual: 18
completed_at: 2026-03-02
observation: |
  Sprint fechado com 90% do planejado (18/20 pontos).
  2 features movidas para SPR-002 por dependência externa.
  Aprendizado: DoD precisa ser definido antes do sprint.
```

### Sprint Retrospective

**Onde:** UzzOPS → Sprints → [Sprint] → Retrospective

**Processo:**
1. Identificar o que funcionou bem
2. Identificar o que precisa melhorar
3. Criar ações de melhoria

**Template MD Feeder:**
```markdown
## retrospective
sprint: SPR-001
category: needs_improvement
action_text: |
  Definir critérios de DoD antes do início do sprint,
  não durante a execução.
status: pending
owner: Pedro Vitor
due_date: 2026-03-15
success_criteria: |
  DoD revisado e documentado antes do kick-off do sprint 2.
```

**O que acontece:**
- Ação criada em `retrospective_actions`
- Aparece no dashboard (seção Retro Actions)
- Pode ser vinculada ao próximo sprint

---

## 4. Planejamento de Release: Roadmap Adaptativo

### Criar Roadmap por Outcomes

**Onde:** Documentação externa + Épicos no UzzOPS

**Processo:**
1. **Criar OST (Opportunity Solution Tree):**
   - Documento em `docs/ost-[projeto].md`
   - Outcome no topo
   - Oportunidades → Soluções → Testes

2. **Mapear no UzzOPS:**
   - Épicos = Soluções candidatas
   - Features = Testes/MVP tests
   - Spikes = Investigação de viabilidade

**Exemplo de estrutura:**
```
Outcome: Reduzir tempo de criação de conteúdo em 50%

├── Oportunidade: Falta de calendário editorial
│   ├── Solução A: Calendário no UzzOPS
│   │   └── Épico: Marketing (UzzOPS)
│   │       ├── Feature: Calendário mensal
│   │       └── Feature: Filtros por canal
│   └── Solução B: Integração Google Calendar
│       └── Épico: Marketing (Integração)
│
└── Oportunidade: Assets espalhados
    └── Solução: Acervo centralizado
        └── Épico: Marketing (UzzOPS)
            └── Feature: Upload e galeria de assets
```

### Agrupar Sprints em Releases

**Onde:** UzzOPS → Sprints (usar `name` com padrão de release)

**Convenção sugerida:**
- `name`: "Release 1 - Q1 2026 — Sprint 1"
- Agrupar 6 sprints por release (referência, não fixo)

**Como visualizar:**
- Lista de sprints ordenada por `start_date`
- Dashboard mostra sprint atual
- Activity Feed mostra eventos de release

---

## 5. Gestão de Riscos e Spikes

### Quando Criar um Spike

**Situações:**
- Feature não é estimável por incerteza técnica
- Tecnologia desconhecida precisa ser investigada
- Decisão arquitetural bloqueia estimativa
- Risco técnico alto precisa ser mitigado

**Processo:**
1. Criar feature com `is_spike = true`
2. Definir `spike_timebox_hours` (ex: 8, 16, 24h)
3. Executar investigação
4. Registrar `spike_result` com outcome

**Template:**
```markdown
## spike
name: Investigar viabilidade de OCR para leitura de NFe
category: AI
spike_timebox_hours: 16
due_date: 2026-03-07
responsible:
  - Pedro Vitor

## spike_result
code: F-XXX
status: done
spike_outcome: |
  Google Vision API atingiu 94% de precisão com custo R$0.003/doc.
  Recomendação: usar Google Vision API com cache de 30 dias.
convert_to_story: true
converted_story:
  name: Integrar Google Vision API para extração de NF-e
  priority: P1
  story_points: 13
```

### Mitigar Riscos Críticos

**Onde:** UzzOPS → Risks → [Risco] → Editar

**Processo:**
1. Identificar risco (GUT score calculado automaticamente)
2. Criar mitigation plan
3. Se necessário, criar spike para investigar
4. Atualizar status: identified → analyzing → mitigated

**Riscos críticos (GUT ≥ 100):**
- Aparecem no dashboard (card de Riscos)
- Alertam no Activity Feed
- Devem ter mitigation plan ativo

---

## 6. Usando o MD Feeder para Cronograma

### Importar Planejamento de Reunião

**Fluxo completo:**
1. Reunião acontece (Sprint Planning, Review, etc.)
2. Transcrição gerada (externa)
3. IA externa gera `.md` com template uzzops-feeder
4. Upload via MD Feeder no UzzOPS
5. Preview → Confirmação → Dados no sistema

**Templates úteis para cronograma:**
- `sprint` — criar sprint
- `sprint_update` — fechar sprint
- `planning_result` — registrar estimativas
- `daily` / `daily_member` — dailies
- `retrospective` — ações de melhoria
- `risk` — riscos
- `spike` / `spike_result` — investigações

**Exemplo de arquivo completo:**
```markdown
---
template: uzzops-feeder
version: 1.0
project: UZZAPP
sprint: SPR-003
date: 2026-02-13
author: Pedro Vitor
source: sprint-planning-13fev2026
---

# Sprint Planning — Sprint 3

## sprint
name: Sprint 3 — RAG e Qualidade
sprint_goal: Entregar RAG com precision@k ≥ 80% e validação AST
start_date: 2026-03-01
end_date: 2026-03-14
velocity_target: 35

## planning_result
session_date: 2026-02-13
items:
  - code: F-050
    story_points: 8
    business_value: 9
    work_effort: 7
    consensus: unanimous
  - code: F-051
    story_points: 5
    business_value: 7
    consensus: majority

## risk
title: Complexidade do RAG pode atrasar entrega
gut_g: 3
gut_u: 4
gut_t: 3
status: identified
mitigation_plan: |
  Criar spike de 16h para validar abordagem de embedding.
```

### Obter Contexto do Repositório

**Onde:** UzzOPS → API → `GET /api/projects/[id]/repo-context`

**Uso:** Fornecer contexto para IA externa gerar MD

**O que retorna:**
- Estado atual do projeto
- Features criadas (últimas 50)
- Bugs abertos
- Riscos críticos
- Próximos códigos disponíveis

**Exemplo de uso:**
1. Copiar contexto do repositório
2. Colar no prompt da IA junto com transcrição
3. IA gera MD estruturado
4. Upload no MD Feeder

---

## 7. Visualizando o Cronograma: Dashboard e Métricas

### Dashboard Enterprise

**Onde:** UzzOPS → Dashboard

**O que ver:**
- **KPI Strip:** Health Score, Sprint Progress, Features, Riscos, Marketing, CRM
- **Desenvolvimento:** Burndown, Feature Pipeline, MVP Progress, DoD, Retro Actions
- **Activity Feed:** Timeline unificada de eventos

**KPIs importantes:**
- **Health Score (0-100):** Score composto do projeto
- **Sprint Progress (%):** % de pontos Done sobre total
- **Features Done/Total:** Progresso geral
- **Critical Risks:** Riscos com GUT ≥ 100

### Burndown do Sprint

**Onde:** UzzOPS → Sprints → [Sprint] → Burndown

**O que ver:**
- Linha ideal (pontos restantes ao longo do tempo)
- Linha atual (pontos realmente restantes)
- Se atual > ideal: sprint em risco

**Como usar:**
- Verificar diariamente se está no ritmo
- Ajustar se necessário (remover features, reduzir escopo)

### Velocity History

**Onde:** UzzOPS → Sprints → Velocity (quando implementado)

**O que ver:**
- Histórico de velocity por sprint
- Média dos últimos 3 sprints
- Trend (aumentando, diminuindo, estável)

**Como usar:**
- Usar média para forecast do próximo sprint
- Identificar tendências (time melhorando ou piorando)

---

## 8. Checklist de Operação Semanal

### Segunda-feira (Início de Sprint)

- [ ] Sprint Planning realizado
- [ ] Sprint criado no UzzOPS
- [ ] Features selecionadas e estimadas
- [ ] Sprint Goal documentado
- [ ] Velocity target definido

### Terça a Quinta (Execução)

- [ ] Daily registrado (todos os dias)
- [ ] Features atualizadas (status, progresso)
- [ ] Riscos identificados e documentados
- [ ] Impedimentos registrados nos dailies
- [ ] Burndown verificado

### Sexta-feira (Preparação para Review)

- [ ] Features Done verificadas (DoD completo)
- [ ] Velocity atual calculada
- [ ] Aprendizados documentados
- [ ] Retrospective agendada

### Após Sprint (Review + Retro)

- [ ] Sprint Review realizada
- [ ] Sprint fechado (`sprint_update`)
- [ ] Velocity atual registrada
- [ ] Retrospective realizada
- [ ] Ações de melhoria criadas
- [ ] Backlog atualizado

---

## 9. Troubleshooting: Problemas Comuns

### Problema: Velocity muito baixa

**Possíveis causas:**
- Features muito grandes (decompor)
- DoD muito rigoroso (revisar)
- Bloqueios não resolvidos (verificar impedimentos)
- Estimativas otimistas (ajustar processo)

**Soluções:**
- Decompor features grandes em menores
- Revisar DoD (pode estar muito rigoroso)
- Resolver impedimentos rapidamente
- Ajustar estimativas (usar Planning Poker)

### Problema: Muitas features bloqueadas

**Possíveis causas:**
- Dependências não mapeadas
- Recursos externos indisponíveis
- Decisões pendentes

**Soluções:**
- Mapear dependências (`feature_dependencies`)
- Criar spikes para investigar bloqueios
- Documentar decisões pendentes
- Priorizar features não-bloqueadas

### Problema: Riscos críticos acumulando

**Possíveis causas:**
- Riscos não mitigados
- Mitigation plans não executados
- Novos riscos não identificados

**Soluções:**
- Revisar mitigation plans semanalmente
- Criar spikes para riscos técnicos
- Atualizar status dos riscos
- Priorizar mitigação de riscos críticos

### Problema: DoD não sendo cumprido

**Possíveis causas:**
- DoD muito rigoroso
- DoD não claro
- Time não conhece DoD

**Soluções:**
- Revisar DoD (pode estar muito rigoroso)
- Documentar DoD claramente
- Treinar time no DoD
- Ajustar DoD se necessário (mas não reduzir qualidade)

---

## 10. Próximos Passos e Evolução

### Melhorias Planejadas

**Curto Prazo:**
- [ ] Página `/progress` com histórico e trends
- [ ] Forecast probabilístico integrado
- [ ] Alertas de riscos críticos
- [ ] Templates de Sprint Plan/Review no MD Feeder

**Médio Prazo:**
- [ ] Visualização de OST no sistema
- [ ] Automatização de Decision Log
- [ ] Relatórios de velocity e forecast
- [ ] Integração com ferramentas externas

**Longo Prazo:**
- [ ] Agente interno que gera MD de transcrições
- [ ] Previsão automática de atrasos
- [ ] Recomendações de priorização
- [ ] Integração com CI/CD

---

**Documento prático:** Use este guia como referência diária para operar o cronograma no UzzOPS. Atualize conforme novas features são implementadas.

