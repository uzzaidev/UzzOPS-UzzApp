---
created: 2026-01-06
updated: 2026-01-07T12:50
tags:
  - scrum
  - templates
  - operacional
  - backlog
---

# 📝 Templates Operacionais — Cap. 9-12

## 📖 Como Usar Este Documento

Este arquivo contém **templates prontos** para copiar e usar no dia a dia:
- User Stories (formato padrão)
- Product Backlog Refinement (checklist)
- Definition of Done (múltiplos níveis)
- Sprint Zero Backlog (6 buckets)
- Snapshot do Backlog
- Scoreboard de Métricas

**Instruções:** Copie os templates, preencha com dados do seu projeto, e adapte conforme necessário.

---

# 📄 Template 1 — User Story Padrão

## Formato Básico

```markdown
## [ID] — Título da História

**Como** [tipo de usuário],
**Quero** [ação/funcionalidade],
**Para** [benefício/razão de negócio].

### Critérios de Aceitação

**Cenário 1: [Nome do cenário]**
- **Dado que** [contexto inicial]
- **Quando** [ação do usuário]
- **Então** [resultado esperado]

**Cenário 2: [Nome do cenário]**
- **Dado que** [contexto inicial]
- **Quando** [ação do usuário]
- **Então** [resultado esperado]

### Exemplos

✅ **Exemplo válido:**
- [Descrição de um caso de uso que deve funcionar]

❌ **Exemplo inválido:**
- [Descrição de um caso que NÃO deve acontecer ou deve falhar gracefully]

### Notas Técnicas (opcional)

- API: [endpoint relevante]
- Dependência: [história #X precisa estar Done antes]
- Risco: [se houver bloqueio técnico conhecido]

### Estimativa

- **Story Points:** [a preencher no Planning Poker]
- **Prioridade:** Alta | Média | Baixa
- **Sprint:** [número do Sprint planejado]

### Definition of Done

- [ ] Código segue padrão (lint pass)
- [ ] Code review feito
- [ ] Testes unitários (cobertura ≥ 70%)
- [ ] Testes de integração (cenários críticos)
- [ ] Deploy em staging
- [ ] PO aprovou demo funcional
- [ ] Sem bugs de severidade alta
```

---

## Exemplo Preenchido

```markdown
## US-042 — Editar Tarefa Existente

**Como** usuário do app de tarefas,
**Quero** editar tarefa já criada,
**Para** corrigir erros sem deletar e recriar.

### Critérios de Aceitação

**Cenário 1: Editar nome da tarefa**
- **Dado que** usuário tem tarefa "Comprar leite"
- **Quando** clica em "Editar" e muda nome para "Comprar leite desnatado"
- **Então** tarefa atualiza na lista sem duplicar

**Cenário 2: Cancelar edição**
- **Dado que** usuário abriu form de edição
- **Quando** clica "Cancelar"
- **Então** tarefa permanece inalterada

**Cenário 3: Validação de campos obrigatórios**
- **Dado que** usuário edita tarefa
- **Quando** deixa campo "nome" vazio e tenta salvar
- **Então** sistema mostra erro "Nome obrigatório"

### Exemplos

✅ **Exemplo válido:**
- Editar "Comprar leite" → "Comprar leite desnatado" → salvar → lista mostra atualizado

❌ **Exemplo inválido:**
- Editar e deixar nome vazio → sistema não permite salvar

### Notas Técnicas

- API: `PATCH /api/tasks/:id`
- Dependência: US-040 (CRUD básico) precisa estar Done
- Risco: Conflito se 2 usuários editarem mesma tarefa simultaneamente (não resolver nesta história — criar US futura)

### Estimativa

- **Story Points:** 3
- **Prioridade:** Alta
- **Sprint:** Sprint 3

### Definition of Done

- [x] Código segue padrão (lint pass)
- [x] Code review feito
- [x] Testes unitários (cobertura 85%)
- [x] Testes de integração (3 cenários)
- [x] Deploy em staging
- [x] PO aprovou demo funcional
- [x] Sem bugs de severidade alta
```

---

# 📄 Template 2 — Checklist PBR (Product Backlog Refinement)

## Antes da Sessão

**PO:**
- [ ] Priorizar top 10-15 itens do backlog
- [ ] Ter protótipo/wireframe (se aplicável)
- [ ] Preparar contexto do MVP (1-2 slides ou texto curto)

**SM:**
- [ ] Agendar sessão (60-90 min)
- [ ] Convidar time completo + stakeholders chave
- [ ] Preparar quadro com colunas: `Gostei | Falta | Confuso | Risco`
- [ ] Ter mapa mental do produto visível

**Time:**
- [ ] Revisar backlog atual (10 min antes)
- [ ] Testar protótipo (se houver)

---

## Durante a Sessão

- [ ] **00-10 min:** Contexto e objetivo do MVP
- [ ] **10-25 min:** Demo/encenação do protótipo
- [ ] **25-40 min:** Coletar feedback estruturado (post-its nas 4 categorias)
- [ ] **40-60 min:** Converter em mudanças no mapa mental + novas histórias
- [ ] **60-80 min:** Quebrar épicos e escrever critérios de aceitação
- [ ] **80-85 min:** Registrar snapshot do backlog
- [ ] **85-90 min:** Fechamento e próximos passos

---

## Após a Sessão

**SM:**
- [ ] Compartilhar snapshot (Notion/Confluence)
- [ ] Atualizar backlog no Trello/Jira
- [ ] Agendar próximo PBR (1-2 semanas)

**PO:**
- [ ] Priorizar backlog final (até 24h)
- [ ] Validar novas histórias com stakeholders (se necessário)

**Time:**
- [ ] Estimar novas histórias (Planning Poker no próximo refinamento)

---

## KPIs da Sessão

- [ ] Tempo total ≤ 90 min (não estoura)
- [ ] Novas histórias criadas: 3-10
- [ ] Histórias refinadas (com critérios de aceitação): 5-10
- [ ] Snapshot registrado (antes/depois)
- [ ] Todos participaram (nenhuma pessoa muda)

---

# 📄 Template 3 — Definition of Done (Múltiplos Níveis)

## DoD v1.0 — Mínimo Viável

### Done (Time)

- [ ] Código segue padrão acordado (lint, style guide)
- [ ] Code review por ≥ 1 pessoa
- [ ] Testes unitários (cobertura ≥ 70%)
- [ ] Testes de integração (cenários críticos cobertos)
- [ ] Código integrado em staging (não só dev local)
- [ ] Smoke test manual passou
- [ ] Sem bugs de alta severidade conhecidos

### Accepted (PO)

- [ ] Critérios de aceitação atendidos (100%)
- [ ] PO viu demo funcional na Sprint Review
- [ ] Sem "pendências escondidas" ou trabalho incompleto

---

## DoD v2.0 — Intermediário (após 3-5 Sprints)

### Done (Time)

- [ ] Código segue padrão acordado (lint, style guide)
- [ ] Code review por ≥ 1 pessoa
- [ ] Testes unitários (cobertura ≥ 80%)
- [ ] Testes de integração (cenários críticos + edge cases)
- [ ] **[NOVO]** Testes end-to-end (fluxo principal)
- [ ] **[NOVO]** Performance aceitável (load test básico)
- [ ] Código integrado em staging
- [ ] **[NOVO]** Documentação técnica atualizada (README, API doc)
- [ ] Smoke test manual passou
- [ ] Sem bugs de severidade média ou alta

### Accepted (PO)

- [ ] Critérios de aceitação atendidos (100%)
- [ ] PO viu demo funcional na Sprint Review
- [ ] **[NOVO]** Stakeholders testaram (se aplicável)
- [ ] Sem "pendências escondidas"

---

## DoD v3.0 — Maduro (após 10+ Sprints)

### Done (Time)

- [ ] Código segue padrão acordado (lint, style guide)
- [ ] Code review por ≥ 2 pessoas (1 senior)
- [ ] Testes unitários (cobertura ≥ 85%)
- [ ] Testes de integração (cenários críticos + edge cases + error paths)
- [ ] Testes end-to-end (fluxo principal + alternativo)
- [ ] Performance aceitável (load test + stress test)
- [ ] **[NOVO]** Segurança validada (OWASP top 10 checklist)
- [ ] Código integrado em staging
- [ ] Documentação técnica atualizada (README, API doc, arquitetura)
- [ ] **[NOVO]** Documentação de usuário (se público)
- [ ] **[NOVO]** CI/CD pipeline passou (build + testes + deploy automático)
- [ ] Smoke test manual passou
- [ ] Sem bugs conhecidos (nenhum severidade alta, < 2 média)

### Accepted (PO)

- [ ] Critérios de aceitação atendidos (100%)
- [ ] PO viu demo funcional na Sprint Review
- [ ] Stakeholders testaram e aprovaram
- [ ] **[NOVO]** Métricas de uso validadas (analytics configurado)
- [ ] Sem "pendências escondidas"

### Release Done (apenas para Release)

- [ ] Deploy em produção executado com sucesso
- [ ] Rollback testado (plano B pronto)
- [ ] Monitoramento ativo (logs, alertas)
- [ ] Comunicação enviada (usuários notificados se necessário)
- [ ] Post-mortem agendado (retrospectiva de release)

---

## Como Evoluir o DoD

**Gatilho de Evolução:**
1. PO rejeita história na Review → investigar motivo
2. Adicionar item ao DoD que teria prevenido a rejeição
3. Comunicar mudança ao time
4. Revisar DoD formalmente a cada 3 Sprints

**Exemplo:**
- Sprint 5: PO rejeita porque "quebrou integração com API de pagamento"
- Ação: adicionar ao DoD → "Testes de integração com APIs externas passam"
- Comunicação: SM avisa time na próxima Daily

---

# 📄 Template 4 — Sprint Zero Backlog (6 Buckets)

## Bucket A — Objetivo de Negócio e Governança

**User Stories de Preparação:**

- [ ] **Como** empresário, **quero** definir meta de produtividade (ex.: 300% em 6 meses), **para** alinhar expectativas com o time.
- [ ] **Como** stakeholder, **quero** participar de Sprint Reviews quinzenais, **para** acompanhar progresso e dar feedback.
- [ ] **Como** time, **quero** acordar formato de comunicação (ex.: Slack, email semanal), **para** manter stakeholders informados.

**Critérios de Saída:**
- [ ] Meta quantitativa definida (ex.: reduzir lead time de 12 para 4 semanas)
- [ ] Cadência de Reviews acordada (dia, horário, participantes)
- [ ] Canal de comunicação configurado

---

## Bucket B — Linguagem Comum

**User Stories de Preparação:**

- [ ] **Como** time, **quero** ler Scrum Guide (30 min cada), **para** entender papéis, eventos, artefatos.
- [ ] **Como** PO, **quero** apresentar visão do produto (1 slide ou texto), **para** alinhar todos no objetivo final.
- [ ] **Como** time, **quero** acordar definição de "User Story" e "Épico", **para** evitar confusão no backlog.

**Critérios de Saída:**
- [ ] 100% do time leu Scrum Guide
- [ ] Visão do produto escrita e compartilhada
- [ ] Formato de User Story definido (template escolhido)

---

## Bucket C — Papéis Capacitados

**User Stories de Preparação:**

- [ ] **Como** time, **quero** definir quem é PO, SM, time dev (nomes), **para** clarificar responsabilidades.
- [ ] **Como** PO, **quero** treinar em priorização (ex.: MoSCoW, Value vs Effort), **para** gerenciar backlog.
- [ ] **Como** SM, **quero** ler facilitação de Scrum (ex.: guia de Retrospectivas), **para** rodar cerimônias bem.

**Critérios de Saída:**
- [ ] Papéis atribuídos (PO, SM, time dev)
- [ ] PO sabe priorizar (exercício rápido feito)
- [ ] SM preparado para facilitar (checklist de eventos)

---

## Bucket D — Ferramentas e Ambiente

**User Stories de Preparação:**

- [ ] **Como** time, **quero** escolher ferramenta de board (Trello/Jira/Notion), **para** gerenciar backlog.
- [ ] **Como** dev, **quero** configurar Git + CI/CD básico, **para** automatizar build/testes.
- [ ] **Como** time, **quero** ambiente de staging funcional, **para** testar antes de produção.

**Critérios de Saída:**
- [ ] Board configurado (colunas: Backlog, Sprint Backlog, In Progress, Review, Done)
- [ ] Git repo criado (branches: main, dev)
- [ ] CI/CD básico rodando (build + testes automáticos)
- [ ] Staging acessível (URL pública ou interna)

---

## Bucket E — Acordos Essenciais

**User Stories de Preparação:**

- [ ] **Como** time, **quero** criar DoD v1.0 (7-10 itens), **para** definir "pronto".
- [ ] **Como** time, **quero** acordar cadência de Sprint (ex.: 2 semanas), **para** ritmo previsível.
- [ ] **Como** time, **quero** definir horário de Daily (ex.: 10h, 15 min), **para** sincronização diária.

**Critérios de Saída:**
- [ ] DoD v1.0 escrito e acordado
- [ ] Duração do Sprint definida (1-4 semanas, recomendado 2)
- [ ] Horário de Daily definido (mesmo horário todos os dias)
- [ ] Horário de Review/Retro definido (último dia do Sprint)

---

## Bucket F — Necessidades Específicas do Projeto

**User Stories de Preparação (exemplos — adaptar ao projeto):**

- [ ] **Como** time, **quero** estudar tecnologia X (ex.: React, Node.js), **para** estar pronto para codar.
- [ ] **Como** PO, **quero** mapear integrações externas (APIs de terceiros), **para** identificar riscos técnicos.
- [ ] **Como** time, **quero** criar protótipo de arquitetura (diagrama), **para** validar viabilidade técnica.

**Critérios de Saída (adaptar):**
- [ ] Time capacitado na tecnologia principal (tutorial/workshop feito)
- [ ] Integrações mapeadas (lista de APIs + documentação)
- [ ] Spike técnico concluído (protótipo/prova de conceito)

---

## Checklist de Saída do Sprint Zero

**Obrigatório para começar Sprint 1:**

- [ ] **Backlog inicial priorizado** (top 10-20 histórias estimadas)
- [ ] **DoD v1.0 escrito e acordado**
- [ ] **Formato de User Story definido**
- [ ] **Cadência de Sprint definida** (ex.: 2 semanas, Daily 10h)
- [ ] **Ferramentas prontas** (board, Git, staging)
- [ ] **Papéis claros** (PO, SM, time dev nomeados)
- [ ] **Time "habilitado"** (leu Scrum Guide, entende processo)
- [ ] **Ambiente técnico minimamente funcional** (dev local + staging)
- [ ] **Sprint 1 planejado** (top 3-5 histórias selecionadas para primeira iteração)

**Review do Sprint Zero:**
- [ ] Demo de preparação agendada (última sexta do Sprint Zero)
- [ ] Stakeholder validou baseline e metas

---

# 📄 Template 5 — Snapshot do Product Backlog

## Formato Padrão

```markdown
## Snapshot Sprint [X] — [Data]

### Razão
[Por que fizemos mudanças? Ex.: feedback do protótipo, mudança de prioridade, risco técnico descoberto]

### Mudanças no Backlog

**Adicionado:**
- [Epic/história nova #1] — [X pontos] — [razão]
- [Epic/história nova #2] — [Y pontos] — [razão]

**Removido:**
- [História #Z] — [razão: fora de escopo, não agrega valor, etc.]

**Re-priorizado:**
- [História #W] moveu de prioridade [Baixa → Alta] — [razão]

**Quebrado (split):**
- [Epic grande] → dividido em 3 histórias menores:
  - [História A] — [pontos]
  - [História B] — [pontos]
  - [História C] — [pontos]

### Impacto Quantitativo

- **Backlog Total:**
  - Antes: [X pontos] / [Y histórias]
  - Depois: [Z pontos] / [W histórias]
  - Δ: [+/- N pontos / +/- M histórias]

- **Top 10 Histórias (próximos 2-3 Sprints):**
  - Total: [X pontos]
  - Épicos: [listar]

### Decisões Importantes

- [Decisão #1: ex.: MVP não incluirá notificações push até Sprint 10]
- [Decisão #2: ex.: priorizar editar/deletar antes de filtros avançados]

### Riscos Identificados

- [Risco #1: ex.: integração com API de pagamento — dependência externa]
- [Risco #2: ex.: performance com > 1000 itens — spike necessário]

### Próximos Passos

- PO: [ação — ex.: priorizar backlog final até amanhã]
- SM: [ação — ex.: agendar spike técnico]
- Time: [ação — ex.: estimar novas histórias no próximo PBR]

---

**Mapa Mental:** [link ou foto antes/depois]
**Backlog Completo:** [link Trello/Jira/Notion]
```

---

## Exemplo Preenchido

```markdown
## Snapshot Sprint 2 — 06/01/2026

### Razão
Feedback do protótipo (Sprint 1) revelou gaps críticos no MVP: usuários confusos sobre como editar/deletar tarefas.

### Mudanças no Backlog

**Adicionado:**
- Epic: Gerenciamento de Tarefas (editar, deletar, filtros) — 18 pontos — necessário para MVP
- Spike: Notificação push (permissões iOS/Android) — 1 dia — validar viabilidade técnica

**Removido:**
- História: Dashboard analytics avançado — fora de escopo MVP (movido para backlog futuro)

**Re-priorizado:**
- História: Editar tarefa moveu de Baixa → Alta — bloqueio crítico para MVP
- História: Deletar tarefa moveu de Média → Alta — bloqueio crítico para MVP

**Quebrado (split):**
- Epic: Filtros → dividido em 2 histórias:
  - Filtro por data — 5 pontos
  - Filtro por status (feito/pendente) — 3 pontos

### Impacto Quantitativo

- **Backlog Total:**
  - Antes: 87 pontos / 15 histórias
  - Depois: 105 pontos / 18 histórias
  - Δ: +18 pontos / +3 histórias

- **Top 10 Histórias (Sprints 2-3):**
  - Total: 52 pontos
  - Épicos: Gerenciamento de Tarefas (18 pts), Notificações (12 pts), Filtros (8 pts)

### Decisões Importantes

- MVP incluirá editar/deletar tarefas (não é mais "nice to have")
- Notificações push só após spike validar viabilidade (bloqueio técnico iOS/Android)
- Dashboard analytics movido para fase 2 (pós-MVP)

### Riscos Identificados

- Notificação push: dependência de permissões nativas (iOS/Android) — pode inviabilizar feature
- Performance: lista grande (> 100 tarefas) pode demorar — spike necessário no Sprint 4

### Próximos Passos

- PO: priorizar backlog final até 07/01 (amanhã)
- SM: agendar spike de notificação (1 dev, 1 dia, Sprint 2)
- Time: estimar novas histórias no PBR de quarta-feira (08/01)

---

**Mapa Mental:** [link Miro — versão 2.1]
**Backlog Completo:** [link Trello Board]
```

---

# 📄 Template 6 — Scoreboard de Métricas

## Formato Padrão

```markdown
## Scoreboard — [Nome do Projeto/Empresa]

### Período
Baseline: [Data início]
Meta: [Data alvo — ex.: 6 meses]

---

### Métricas Rastreadas

| Métrica | Baseline | Meta 6m | S0 | S1 | S2 | S3 | S4 | S5 | S6 | Status | Δ |
|---------|----------|---------|----|----|----|----|----|----|-------|--------|---|
| **Velocidade: Story Points/Sprint** | [X] | [Y] | - | - | - | - | - | - | - | 🟡 | - |
| **Qualidade: Taxa Rejeição PO** | [X%] | [<Y%] | - | - | - | - | - | - | - | 🔴 | - |
| **Valor: NPS** | [X] | [≥Y] | - | - | - | - | - | - | - | 🟡 | - |
| **Valor: % Features Usadas** | [X%] | [≥Y%] | - | - | - | - | - | - | - | 🟡 | - |

**Legenda:**
- 🟢 Meta atingida ou superada
- 🟡 Melhorando (tendência positiva)
- 🔴 Estagnado ou piorando

**Δ:** Variação em relação ao baseline (ex.: +47%)

---

### Notas por Sprint

**Sprint 1:**
- [Observações: ex.: primeiro Sprint, velocidade instável]

**Sprint 2:**
- [Observações: ex.: taxa de rejeição caiu de 50% para 30% — DoD funcionando]

[...]

---

### Gráficos (opcional)

[Inserir gráfico de linha: Story Points ao longo do tempo]
[Inserir gráfico de barra: Taxa de Rejeição PO]

---

### Processo de Atualização

- **Quem:** SM (ou PM)
- **Quando:** Toda Sprint Review (último dia do Sprint)
- **Como:** coletar dados → atualizar tabela → compartilhar com time + stakeholders
- **Onde:** Notion/Google Sheets/Confluence
```

---

## Exemplo Preenchido

```markdown
## Scoreboard — Produtividade UzzAI

### Período
Baseline: 01/01/2026
Meta: 01/07/2026 (6 meses)

---

### Métricas Rastreadas

| Métrica | Baseline | Meta 6m | S0 | S1 | S2 | S3 | S4 | S5 | S6 | Status | Δ |
|---------|----------|---------|----|----|----|----|----|----|-------|--------|---|
| **Velocidade: Story Points/Sprint** | 17 | 25 | 0 | 19 | 22 | 24 | - | - | - | 🟡 | +41% |
| **Qualidade: Taxa Rejeição PO** | 50% | <10% | - | 30% | 20% | 10% | - | - | - | 🟢 | -80% |
| **Valor: NPS** | 20 | ≥40 | - | 25 | 28 | 32 | - | - | - | 🟡 | +60% |
| **Valor: % Features Usadas** | 40% | ≥60% | - | 45% | 50% | 55% | - | - | - | 🟡 | +38% |

**Legenda:**
- 🟢 Meta atingida ou superada
- 🟡 Melhorando (tendência positiva)
- 🔴 Estagnado ou piorando

---

### Notas por Sprint

**Sprint 0 (Zero):**
- Preparação: criado DoD v1, backlog inicial, ferramentas configuradas
- Sem entregas funcionais (normal)

**Sprint 1:**
- Velocidade: 19 pontos (instável — primeiro Sprint)
- Taxa Rejeição: 30% (PO rejeitou 1 de 3 histórias — faltou teste de integração)
- Ação: adicionado ao DoD → "testes de integração cobrem cenários críticos"

**Sprint 2:**
- Velocidade: 22 pontos (+16% vs S1)
- Taxa Rejeição: 20% (melhorando — DoD evoluído funcionando)
- NPS: subiu de 25 → 28 (pequena melhora após correção de bugs)

**Sprint 3:**
- Velocidade: 24 pontos (+41% vs baseline 🎉)
- Taxa Rejeição: 10% (META ATINGIDA 🟢)
- NPS: 32 (tendência positiva, mas ainda abaixo da meta de 40)

---

### Processo de Atualização

- **Quem:** SM (Pedro)
- **Quando:** Toda sexta-feira às 16h (após Sprint Review)
- **Como:**
  1. Coletar dados: somar pontos Done, calcular rejeições, rodar survey NPS
  2. Atualizar tabela no Notion
  3. Compartilhar screenshot no Slack #produtividade
- **Onde:** [Link Notion Scoreboard]
```

---

# 📄 Template 7 — Checklist de Spike (Investigação Técnica)

## Formato Padrão

```markdown
## Spike [ID] — [Título da Investigação]

### Objetivo
[O que precisamos descobrir? Ex.: viabilidade de notificações push em iOS/Android]

### Perguntas a Responder
- [ ] [Pergunta 1: ex.: Quais permissões são necessárias?]
- [ ] [Pergunta 2: ex.: Quanto tempo leva para implementar?]
- [ ] [Pergunta 3: ex.: Quais bibliotecas/serviços usar?]

### Timebox
- **Duração máxima:** [ex.: 1 dia / 4 horas / 1 Sprint]
- **Participantes:** [1-2 devs]

### Critérios de Conclusão
- [ ] Todas as perguntas respondidas (ou "não é possível descobrir com recursos atuais")
- [ ] Relatório escrito (1-2 páginas ou slides)
- [ ] Recomendação: GO (implementar) ou NO-GO (bloquear/adiar)

### Output Esperado
- **Relatório:** [link Google Doc / Notion / Markdown]
- **Decisão:** GO | NO-GO | Precisa mais investigação
- **Próximos passos:** [se GO: criar histórias detalhadas | se NO-GO: comunicar stakeholders]

---

### Relatório (preencher após spike)

**Perguntas Respondidas:**
1. [Pergunta 1]: [resposta + evidência]
2. [Pergunta 2]: [resposta + evidência]
3. [Pergunta 3]: [resposta + evidência]

**Recomendação:** [GO / NO-GO]

**Justificativa:** [explicar por que]

**Próximos passos:**
- [Passo 1]
- [Passo 2]
```

---

## Exemplo Preenchido

```markdown
## Spike S2-01 — Viabilidade Notificações Push iOS/Android

### Objetivo
Investigar viabilidade técnica de implementar notificações push em iOS e Android, incluindo permissões, complexidade, e tempo estimado.

### Perguntas a Responder
- [x] Quais permissões são necessárias (iOS vs Android)?
- [x] Quanto tempo leva para implementar (estimativa)?
- [x] Quais serviços/bibliotecas usar (Firebase, OneSignal, custom)?
- [x] Quais riscos técnicos (taxa de entrega, fallback)?

### Timebox
- **Duração máxima:** 1 dia (8 horas)
- **Participantes:** 1 dev (Luis)

### Critérios de Conclusão
- [x] Todas as perguntas respondidas
- [x] Relatório escrito (Google Doc)
- [x] Recomendação: GO ou NO-GO

### Output Esperado
- **Relatório:** [link Google Doc]
- **Decisão:** GO
- **Próximos passos:** criar 2 histórias (iOS + Android)

---

### Relatório

**Perguntas Respondidas:**

1. **Permissões necessárias:**
   - **iOS:** Permissão explícita (prompt ao usuário). Taxa aceitação ~60% segundo Apple docs.
   - **Android:** Permissão implícita (automatica até Android 12, depois prompt). Taxa aceitação ~80%.
   - **Evidência:** testei app exemplo com Firebase (iOS/Android).

2. **Tempo estimado:**
   - **iOS:** 3-5 dias (setup APNs + teste + handling de opt-in)
   - **Android:** 2-3 dias (setup FCM + teste)
   - **Total:** ~8 dias (1 Sprint completo com 2 devs)

3. **Serviços recomendados:**
   - **Firebase Cloud Messaging (FCM):** gratuito até 10M mensagens/mês, suporta iOS + Android
   - **Alternativa:** OneSignal (mais fácil, mas pago após 1k usuários)
   - **Recomendação:** FCM (suficiente para MVP)

4. **Riscos técnicos:**
   - Taxa de entrega ~95% (5% falham por conexão ruim)
   - Fallback: enviar email se push falhar (adiciona complexidade)
   - Risco de spam: usuário pode desabilitar → precisamos de UX para re-enable

**Recomendação:** **GO**

**Justificativa:**
- Tecnicamente viável com Firebase (gratuito + bem documentado)
- Tempo razoável (1 Sprint completo)
- Riscos gerenciáveis (taxa entrega aceitável)

**Próximos passos:**
1. Criar história: "Implementar push notifications iOS" — 5 pontos
2. Criar história: "Implementar push notifications Android" — 3 pontos
3. PO prioriza para Sprint 4 (após MVP básico)
4. Comunicar decisão GO para stakeholders
```

---

# 📄 Template 8 — Retro Actions (Ações de Melhoria Contínua)

## Formato Padrão

```markdown
## Retro Actions — Sprint [X] — [Data]

### Contexto
[1-2 frases sobre como foi o Sprint: ex.: primeiro Sprint pós-Sprint Zero, velocidade instável]

### Ações de Melhoria

| # | Ação | Responsável | Prazo | Status | Resultado |
|---|------|-------------|-------|--------|-----------|
| 1 | [Descrição da ação] | [Nome] | [Data/Sprint] | 🟡 | - |
| 2 | [Descrição da ação] | [Nome] | [Data/Sprint] | 🟢 | [O que melhorou] |
| 3 | [Descrição da ação] | [Nome] | [Data/Sprint] | 🔴 | [Por que não deu certo] |

**Legenda:**
- 🟢 Concluída
- 🟡 Em progresso
- 🔴 Bloqueada/Cancelada

### Experimentos (Opcional)

| Experimento | Hipótese | Como Testar | Resultado Esperado | Prazo |
|-------------|----------|-------------|-------------------|-------|
| [Nome do experimento] | Se [mudarmos X], então [Y melhora] | [Métricas/observações] | [Meta quantitativa] | [Sprint/data] |

---

### Revisão de Ações Anteriores

**Ações do Sprint [X-1] (anterior):**
- [x] ~~Ação 1~~ → Concluída → DoD evoluído (taxa rejeição caiu 50% → 30%)
- [ ] Ação 2 → Bloqueada (dependência externa) → Re-priorizar para Sprint X+1

---

### Próximos Passos

- SM: monitorar ações (check-in na próxima Daily)
- Time: implementar melhorias até próxima Retro
```

---

## Exemplo Preenchido

```markdown
## Retro Actions — Sprint 2 — 13/01/2026

### Contexto
Sprint 2 foi mais estável que Sprint 1 (velocidade 22 pts vs 19 pts). Taxa de rejeição PO caiu de 50% para 20%. Time sentiu sobrecarga em code review (gargalo identificado).

### Ações de Melhoria

| # | Ação | Responsável | Prazo | Status | Resultado |
|---|------|-------------|-------|--------|-----------|
| 1 | Adicionar 2º reviewer para PRs grandes (>500 linhas) | SM (Pedro) | Sprint 3 | 🟡 | - |
| 2 | Criar checklist de PR (template GitHub) | Dev (Luis) | 15/01 | 🟢 | PRs ficaram mais consistentes |
| 3 | Agendar pairing session 2x/semana (reduzir bloqueios) | Time | Sprint 3 | 🟡 | - |

### Experimentos

| Experimento | Hipótese | Como Testar | Resultado Esperado | Prazo |
|-------------|----------|-------------|-------------------|-------|
| Pair Programming | Se fizer pairing 2x/semana, então code review fica mais rápido | Medir tempo médio de review (antes vs depois) | Reduzir tempo de review de 8h para 4h | Sprint 3 |

---

### Revisão de Ações Anteriores

**Ações do Sprint 1:**
- [x] ~~Evoluir DoD (adicionar testes de integração)~~ → Concluída → Taxa rejeição caiu 50% → 20% 🎉
- [x] ~~Configurar CI/CD~~ → Concluída → Build automático rodando
- [ ] Melhorar documentação API → Bloqueada (PO priorizou features) → Re-priorizar para Sprint 4

---

### Próximos Passos

- SM: check-in diário sobre pairing sessions (Daily)
- Luis: finalizar template de PR até 15/01
- Time: experimentar pairing e coletar feedback na próxima Retro
```

---

**Próximos passos:**
1. Ver `Mermaids_Scrum_Cap9-12.md` para diagramas visuais
2. Ver `Guia_Scrum_Parte3_Cap9-12.md` para conceitos detalhados
3. Ver `Playbooks_Dinamicas_Cap9-12.md` para oficinas práticas

---

*Templates operacionais criados para UzzAI — Baseados em Scrum Guide e práticas de agilidade.*
