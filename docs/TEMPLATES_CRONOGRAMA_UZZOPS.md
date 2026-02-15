# Templates e Checklists — Cronograma UzzOPS

**Versão:** 1.0  
**Data:** 2026-02-14  
**Uso:** Copiar e adaptar conforme necessário

---

## 1. Product Charter Template

```markdown
# Product Charter — [Nome do Projeto]

## Visão/Outcome Principal
[Descrever o resultado desejado em termos de valor para o usuário]

## Usuários-alvo e Contextos
- **Perfil:** [Quem usa]
- **Contexto:** [Em que situação]
- **Job-to-be-done:** [O que o usuário está tentando fazer]

## Hipóteses Críticas

### Valor
**Hipótese:** Se [perfil] usar [capability] para [job-to-be-done],
então teremos [resultado mensurável], porque [mecanismo].

**Critério de sucesso:**
- [Métrica 1]: [threshold]
- [Métrica 2]: [threshold]

### Usabilidade
**Hipótese:** [Usuário consegue usar sem treinamento extensivo]

**Critério de sucesso:**
- [Métrica de usabilidade]

### Feasibility
**Hipótese:** [É tecnicamente viável com tecnologia atual]

**Critério de sucesso:**
- [Prova técnica mínima]

### Viabilidade
**Hipótese:** [É viável do ponto de vista de negócio]

**Critério de sucesso:**
- [Métrica de negócio]

## Casos Âncora do MVP (3)

### Caso 1: [Nome]
- **Descrição:** [O que o usuário faz]
- **Critérios de aceite:**
  - [Critério 1]
  - [Critério 2]
- **Métrica de sucesso:** [Como medir]

### Caso 2: [Nome]
[Repetir estrutura]

### Caso 3: [Nome]
[Repetir estrutura]

## Métricas de Sucesso (Scorecard)

| Dimensão | Métrica | Como medir | Limite para "MVP OK" |
|----------|---------|------------|----------------------|
| Confiabilidade | Taxa de sucesso | Logs de execução | ≥ X% |
| Latência | Tempo total | Timestamps por etapa | p95 ≤ limite |
| Qualidade | Precision@k | Avaliação offline/online | ≥ alvo |
| Cobertura | Command types | Contagem de comandos | ≥ alvo |
| Segurança | Rollback correto | Simular falhas | 100% |

## Restrições Não-negociáveis

- [Restrição 1: ex. segurança, compatibilidade]
- [Restrição 2: ex. performance, escalabilidade]
- [Restrição 3: ex. governança, IP]

## Riscos Top-10 e Estratégia de Mitigação

| # | Risco | Tipo | Mitigação | Spike/Teste |
|---|-------|------|-----------|-------------|
| 1 | [Risco] | Feasibility | [Mitigação] | [Spike se necessário] |
| 2 | [Risco] | Value | [Mitigação] | [MVP Test] |
| 3 | [Risco] | Usability | [Mitigação] | [Teste de UX] |

## Regras de IP/Divulgação

- [ ] Não divulgar antes do depósito de patente
- [ ] Todo material público passa por gate "IP OK?"
- [ ] Evidências de autoria documentadas (versionamento + ADRs)
```

---

## 2. Sprint Plan Template

```markdown
# Sprint XX — Sprint Plan

**Sprint:** SPR-XXX  
**Período:** [Data início] a [Data fim]  
**Duração:** 2 semanas  
**Velocity Target:** [X] pontos

## Sprint Goal

**Por que este sprint é valioso:**
[Descrever o valor/outcome que este sprint entrega]

**Exemplo:**
"Entregar calendário editorial funcional para reduzir tempo de planejamento de conteúdo em 30%"

## Itens Selecionados

| Code | Nome | Story Points | Por quê (valor/risco) |
|------|------|--------------|----------------------|
| F-XXX | [Feature] | 5 | [Justificativa] |
| F-YYY | [Feature] | 8 | [Justificativa] |

**Total de pontos:** [X]  
**Velocity target:** [Y]  
**Margem:** [X-Y] pontos

## Definition of Done Aplicada

- [ ] Nível 1: Código revisado, testes passando
- [ ] Nível 2: Deploy em staging, validação de UX
- [ ] Nível 3: Performance validada, monitoramento ativo

## Plano de Validação

**Testes:**
- [ ] Teste 1: [Descrição]
- [ ] Teste 2: [Descrição]

**Métricas:**
- [ ] Métrica 1: [Como medir]
- [ ] Métrica 2: [Como medir]

**Evidências esperadas na Review:**
- [ ] Demo funcional
- [ ] Logs de execução
- [ ] Métricas coletadas

## Riscos do Sprint + Mitigação

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| [Risco] | Alta/Média/Baixa | Alto/Médio/Baixo | [Ação] |

## Dependências e Decisões Pendentes

**Dependências:**
- [ ] Dependência 1: [Descrição] → [Responsável]
- [ ] Dependência 2: [Descrição] → [Responsável]

**Decisões pendentes:**
- [ ] Decisão 1: [Descrição] → [Prazo]
- [ ] Decisão 2: [Descrição] → [Prazo]
```

---

## 3. Sprint Backlog Template (Enxuto)

```markdown
# Sprint XX — Sprint Backlog

| Item | Tipo | Critério de Aceite | Evidência na Review | Status |
|------|------|-------------------|-------------------|--------|
| F-001 | Feature | - CoS 1<br>- CoS 2 | Demo funcional | in_progress |
| F-002 | Bug | - Bug corrigido<br>- Teste passando | Teste de regressão | todo |
| F-003 | Spike | - Pergunta respondida<br>- Decisão documentada | Nota de spike | done |
```

---

## 4. Spike Template

```markdown
# Spike — [Título]

**Code:** F-XXX  
**Timebox:** [X] horas  
**Responsável:** [Nome]

## Pergunta que Precisa Ser Respondida

[Formular pergunta específica que bloqueia estimativa]

**Exemplo:**
"É possível extrair campos de NF-e com precisão ≥ 90% usando OCR?"

## Hipótese Técnica

[Descrever abordagem técnica que será testada]

## Método (Experimento/Benchmark/Protótipo)

1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

## Dados Coletados

[Registrar resultados, métricas, logs]

## Decisão (Go/No-Go/Como)

**Resultado:** [Go / No-Go / Como fazer]

**Justificativa:**
[Por que esta decisão]

**Próximos passos:**
- [ ] Se Go: Criar feature derivada
- [ ] Se No-Go: Documentar alternativa
- [ ] Se Como: Documentar abordagem escolhida

## Impacto no Backlog

- [ ] Feature estimada após spike
- [ ] Feature criada (se convert_to_story = true)
- [ ] Riscos atualizados
```

---

## 5. ADR Template (Architecture Decision Record)

```markdown
# ADR-XXX — [Decisão]

**Status:** [Proposta | Aceita | Rejeitada | Depreciada]  
**Data:** [Data]  
**Decisores:** [Nomes]

## Contexto

[Descrever a situação que levou à necessidade desta decisão]

**Problema:**
[Qual problema estamos resolvendo]

**Forças:**
- [Força 1]
- [Força 2]

## Decisão

[Descrever a decisão tomada]

**Exemplo:**
"Usar Supabase Storage para armazenar assets de marketing"

## Alternativas Consideradas

### Alternativa A: [Nome]
- **Prós:** [Lista]
- **Contras:** [Lista]
- **Por que não:** [Razão]

### Alternativa B: [Nome]
[Repetir estrutura]

## Trade-offs

**Prós:**
- [Pró 1]
- [Pró 2]

**Contras:**
- [Contra 1]
- [Contra 2]

## Consequências

**Imediatas:**
- [Consequência 1]
- [Consequência 2]

**Longo prazo:**
- [Consequência 3]

## Como Reavaliar (Gatilhos)

Esta decisão deve ser reavaliada se:
- [Gatilho 1]
- [Gatilho 2]

**Exemplo:**
- Limite de tamanho de arquivo se tornar problema
- Custo de storage exceder orçamento
```

---

## 6. Decision Log Template

```markdown
# Decision Log — [Projeto]

| Data | Decisão | Evidência | Impacto no Roadmap | Quem | Link (ADR/Spike) |
|------|---------|-----------|-------------------|------|------------------|
| 2026-02-14 | Usar Supabase Storage | Benchmark de custo | Nenhum | Pedro Vitor | ADR-001 |
| 2026-02-15 | Priorizar MVP sobre V1 | Feedback de piloto | Features V1 movidas | Time | - |
```

---

## 7. Sprint Review Template (Pauta)

```markdown
# Sprint XX — Sprint Review

**Data:** [Data]  
**Duração:** 45-60 minutos  
**Participantes:** [Lista]

## 1. Sprint Goal e o que Foi Done

**Sprint Goal:**
[Relembrar goal do sprint]

**Features Done:**
- [ ] F-XXX: [Nome] — [Evidência]
- [ ] F-YYY: [Nome] — [Evidência]

**Velocity:**
- Target: [X] pontos
- Actual: [Y] pontos
- %: [Z]%

## 2. O que Não Foi Done e Por Quê

**Features não concluídas:**
- F-ZZZ: [Nome] — [Razão: risco/decisão, sem desculpas]

**Aprendizado:**
[O que aprendemos com isso]

## 3. Aprendizados (Spikes / Pilotos / Dados)

**Spikes:**
- [Spike 1]: [Outcome]

**Pilotos:**
- [Piloto 1]: [Feedback]

**Dados:**
- [Métrica 1]: [Valor] vs [Target]

## 4. Decisões (Backlog/Roadmap/Hipóteses)

**Backlog:**
- [ ] Feature X movida para próximo sprint
- [ ] Feature Y priorizada

**Roadmap:**
- [ ] Épico Z ajustado (escopo reduzido)

**Hipóteses:**
- [ ] Hipótese A validada
- [ ] Hipótese B invalidada

## 5. Próximos Passos (Proposta de Sprint Goal Seguinte)

**Sprint Goal proposto:**
[Goal do próximo sprint]

**Features candidatas:**
- [Lista]
```

---

## 8. Sprint Retrospective Template

```markdown
# Sprint XX — Retrospective

**Data:** [Data]  
**Duração:** 30-45 minutos  
**Facilitador:** [Nome]

## O que Funcionou Bem

1. [Item 1]
2. [Item 2]
3. [Item 3]

## O que Precisa Melhorar

1. [Item 1]
2. [Item 2]
3. [Item 3]

## Experimentos (O que Vamos Tentar)

1. [Experimento 1]
   - **Owner:** [Nome]
   - **Prazo:** [Data]
   - **Critério de sucesso:** [Como saber se funcionou]

2. [Experimento 2]
   [Repetir estrutura]

## Ações de Melhoria

| Ação | Categoria | Owner | Prazo | Status |
|------|-----------|-------|-------|--------|
| [Ação] | needs_improvement | [Nome] | [Data] | pending |
```

---

## 9. Release Forecast Template (Monte Carlo Input)

```yaml
forecast:
  unit: "story_points"  # ou "items" (throughput)
  history_window: "últimos 3 sprints"
  samples: 10000
  backlog_scope:
    - epic: "Execução confiável"
      remaining_points: 45
    - epic: "Inserir tomadas + circuitos"
      remaining_points: 30
    - epic: "RAG/DB"
      remaining_points: 25
  output:
    confidence_levels: [0.5, 0.8, 0.9]
    report: "data provável por nível + range"

assumptions:
  sprint_length_days: 14  # não-fixo
  definition_of_done_stable: true
  velocity_trend: "stable"  # stable | increasing | decreasing
```

**Output esperado:**
- 50% de chance: 3-4 sprints (42-56 dias)
- 80% de chance: 4-5 sprints (56-70 dias)
- 90% de chance: 5-6 sprints (70-84 dias)

---

## 10. Checklist: Início de Projeto

### Setup Inicial

- [ ] Product Charter criado
- [ ] Backlog inicial estruturado (Temas → Épicos → Features)
- [ ] DoD definido e documentado
- [ ] Riscos top-10 mapeados
- [ ] OST (Opportunity Solution Tree) criado
- [ ] Decision Log iniciado

### Primeiro Sprint

- [ ] Sprint 1 criado no UzzOPS
- [ ] Sprint Goal definido
- [ ] Features selecionadas e estimadas
- [ ] Velocity target definido (estimativa inicial)
- [ ] Daily Scrum agendado
- [ ] Sprint Review agendada
- [ ] Retrospective agendada

### Configuração do Sistema

- [ ] Projeto criado no UzzOPS
- [ ] Team members adicionados
- [ ] DoD levels configurados
- [ ] Canais de marketing configurados (se aplicável)
- [ ] Integrações configuradas (se aplicável)

---

## 11. Checklist: Operação Semanal

### Segunda-feira (Início de Sprint)

- [ ] Sprint Planning realizado
- [ ] Sprint criado/atualizado no UzzOPS
- [ ] Features selecionadas
- [ ] Planning result registrado
- [ ] Sprint Goal documentado
- [ ] Velocity target definido

### Terça a Quinta (Execução)

- [ ] Daily registrado (todos os dias)
- [ ] Features atualizadas (status, progresso)
- [ ] Riscos identificados
- [ ] Impedimentos registrados
- [ ] Burndown verificado

### Sexta-feira (Preparação)

- [ ] Features Done verificadas
- [ ] Velocity atual calculada
- [ ] Aprendizados documentados
- [ ] Review preparada

### Após Sprint (Review + Retro)

- [ ] Sprint Review realizada
- [ ] Sprint fechado
- [ ] Velocity atual registrada
- [ ] Retrospective realizada
- [ ] Ações criadas
- [ ] Backlog atualizado

---

## 12. Checklist: Qualidade de Dados

### Antes de Fechar Sprint

- [ ] Todas as features Done têm DoD = 100%
- [ ] Velocity atual é precisa (pontos realmente Done)
- [ ] Riscos atualizados (status, mitigation)
- [ ] Retrospective actions criadas
- [ ] Aprendizados documentados

### Antes de Forecast

- [ ] Velocity histórica confiável (≥ 3 sprints)
- [ ] DoD estável (não mudou recentemente)
- [ ] Backlog refinado (features estimáveis)
- [ ] Dependências mapeadas

### Antes de Release

- [ ] MVP features identificadas
- [ ] Casos âncora validados
- [ ] Métricas de sucesso coletadas
- [ ] Riscos críticos mitigados
- [ ] Documentação atualizada

---

**Uso:** Copie e adapte estes templates conforme necessário. Mantenha consistência dentro do projeto.

