---
created: 2026-02-06T15:20
updated: 2026-02-06T15:20
sprint: Sprint 3
dates: 17-28 Mar 2026
status: Futuro
project: UzzOPS - Sistema de Gerenciamento UzzApp
---

# SPRINT 3 - CHECKLIST EXECUTÁVEL

**Sprint:** Sprint 3 - MVP Final
**Período:** 17-28 Mar 2026 (2 semanas)
**Goal:** *"Gestão de Riscos + Testes completos + Deploy do MVP em produção estável"*

**Responsáveis:** 👨‍💻 Luis + 🧑‍💻 Pedro + Toda Equipe (testes)

**📚 Nota Importante:**
Documentação técnica completa já foi criada (2026-02-07):
- 6 arquivos .md em `docs/` com 4000+ linhas de documentação
- Pronto para uso como contexto para outras LLMs
- Cobre: Arquitetura, Database, APIs, Componentes, Development Guide

---

## 📊 PROGRESSO GERAL

```
┌─────────────────────────────────────────────────────────┐
│  SPRINT 3 - PROGRESS (MVP FINAL)                        │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ████████████████░░░░░░░░░░░░░░░░░░░░  40% (Docs Ready)│
│                                                           │
│  US-007: ░░░░░░░░ 0/4 tasks                             │
│  Testes E2E: ░░░░░░░░ 0/5                               │
│  Docs: ████████ 6/6 arquivos ✅                         │
│  Onboarding: ░░░░░░░░ 0/1                               │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 TAREFAS DO SPRINT

### US-007: Gestão de Riscos Básica

**Tasks:**
- [ ] **Task 1:** API CRUD `/api/risks` [Luis - 1d]
- [ ] **Task 2:** Página `/risks` lista riscos em tabela [Pedro - 1d]
- [ ] **Task 3:** Formulário criar risco com GUT Calculator [Pedro - 1d]
- [ ] **Task 4:** Dashboard mostra "X riscos críticos" [Pedro - 0.5d]

**Estimativa:** 3 dias

**DoD:**
- [ ] API CRUD funcionando
- [ ] Lista de riscos com GUT Score
- [ ] Criar/editar risco funcionando
- [ ] GUT Score calculado automaticamente
- [ ] Dashboard atualizado

---

### Testes E2E Completos (Playwright)

**Tasks:**
- [ ] **Task 1:** Setup Playwright [Luis - 0.5d]
- [ ] **Task 2:** Testes E2E: Login + Dashboard [Luis - 1d]
- [ ] **Task 3:** Testes E2E: Features CRUD [Pedro - 1d]
- [ ] **Task 4:** Testes E2E: Sprints [Pedro - 1d]
- [ ] **Task 5:** Testes E2E: Risks [Pedro - 0.5d]

**Estimativa:** 4 dias

**DoD:**
- [ ] Playwright configurado
- [ ] 15+ testes E2E passando
- [ ] CI/CD rodando testes automaticamente
- [ ] Code coverage > 70%

---

### Documentação Final

**Tasks:**
- [x] **Task 1:** ✅ Documentação técnica completa criada (6 arquivos .md) [Claude - 2026-02-07]
  - ✅ `docs/PROJECT_OVERVIEW.md` (503 linhas) - Visão geral do projeto
  - ✅ `docs/ARCHITECTURE.md` (454 linhas) - Arquitetura técnica detalhada
  - ✅ `docs/DATABASE_SCHEMA.md` (673 linhas) - Schema completo do banco
  - ✅ `docs/API_DOCUMENTATION.md` (680 linhas) - Documentação de todas as APIs
  - ✅ `docs/COMPONENTS_GUIDE.md` (1000+ linhas) - Guia completo de componentes
  - ✅ `docs/DEVELOPMENT_GUIDE.md` (800+ linhas) - Guia de desenvolvimento completo
- [ ] **Task 2:** README.md atualizado com screenshots [Pedro - 0.5d]
- [ ] **Task 3:** Guia de onboarding visual (como usar o sistema) [Pedro - 0.5d]
- [ ] **Task 4:** Changelog/Release notes v0.2.0 [Pedro - 0.5d]

**Estimativa:** 1.5 dias (reduzida de 2.5d - docs técnicos já completos)

**DoD:**
- [x] ✅ Documentação técnica completa (6 arquivos):
  - ✅ Visão geral do projeto e stack
  - ✅ Arquitetura e padrões
  - ✅ Schema do banco com ER diagram
  - ✅ APIs com exemplos de código
  - ✅ Componentes React documentados
  - ✅ Guia completo de desenvolvimento
- [ ] README atualizado com:
  - Screenshots do sistema
  - Quick start guide
  - Links para docs/
- [ ] Guia visual "Como usar o UzzOps" criado
- [ ] Release notes v0.2.0 publicadas

---

### Onboarding da Equipe

**Tasks:**
- [ ] **Task 1:** Workshop: "Como usar o UzzOps" (1 hora) [Pedro apresenta]
  - Demonstrar cada funcionalidade
  - Criar features de exemplo
  - Criar sprint de exemplo
  - Q&A

**Estimativa:** 1 dia (preparação + workshop)

**DoD:**
- [ ] Workshop realizado
- [ ] 5 pessoas treinadas (Pedro, Luis, Arthur, Vitor, Lucas)
- [ ] Cada pessoa criou pelo menos 1 feature
- [ ] Feedback coletado

---

## 📅 CRONOGRAMA RESUMIDO

### SEMANA 1
- **Seg:** US-007 início (Riscos)
- **Ter:** US-007 continuação
- **Qua:** US-007 finalização
- **Qui:** Testes E2E início
- **Sex:** Testes E2E continuação + Review interno

### SEMANA 2
- **Seg:** Testes E2E finalização
- **Ter:** Documentação início
- **Qua:** Documentação finalização
- **Qui:** Onboarding workshop + ajustes baseados em feedback
- **Sex:**
  - 14h: **Sprint Review FINAL MVP** (demo completa)
  - 16h: **Retrospective Geral** (Sprint 0-3)
  - 17h: **Planning V1** (próximas features)
  - 18h: **Deploy FINAL MVP** 🎉🚀

---

## ✅ DEFINITION OF DONE - MVP COMPLETO

### US-007: Gestão de Riscos
- [ ] API funcionando
- [ ] Lista de riscos funcionando
- [ ] GUT Calculator funcionando
- [ ] Dashboard atualizado

### Testes E2E
- [ ] 15+ testes E2E passando
- [ ] CI/CD executando testes
- [ ] Code coverage > 70%

### Documentação
- [x] ✅ Documentação técnica completa (6 arquivos em docs/)
- [ ] README com screenshots
- [ ] Guia de onboarding visual
- [ ] Release notes v0.2.0

### Onboarding
- [ ] Workshop realizado
- [ ] Equipe treinada
- [ ] Feedback positivo

### MVP COMPLETO
- [ ] ✅ US-008: Autenticação
- [ ] ✅ US-001: Dashboard Overview
- [ ] ✅ US-002: Gestão de Features
- [ ] ✅ US-003: DoD Tracker
- [ ] ✅ US-004: Gestão de Sprints
- [ ] ✅ US-005: Responsáveis e Prazos
- [ ] ✅ US-006: Timeline
- [ ] ✅ US-007: Gestão de Riscos
- [ ] Deploy em produção estável
- [ ] Equipe usando o sistema
- [ ] Retrospective MVP realizada

---

## 🎉 CRITÉRIOS DE SUCESSO DO MVP

| Critério | Target | Como Medir |
|----------|--------|------------|
| **3 usuários ativos** | 3 | Pedro, Luis, Arthur |
| **1 projeto criado** | 1 | Projeto UzzApp |
| **1 sprint ativo** | 1 | Sprint atual do UzzApp |
| **10 user stories no backlog** | 10 | Features do UzzApp mapeadas |
| **3 stories movidas pelo Kanban** | 3 | Features mudaram de status |
| **Burndown atualizando** | Sim | Testar mudança de status |
| **Sistema estável** | 99% uptime | Vercel Analytics |
| **Feedback positivo** | > 4/5 | Pesquisa pós-workshop |

---

## 🚀 PÓS-MVP (V1)

**Após completar o MVP, considerar:**

### Próximas features (V1):
- US-010: Burndown Chart (gráfico real)
- US-011: Velocity Chart
- US-012: Lead Time / Cycle Time
- US-013: Project Health Score
- US-014: Comentários em features
- US-015: Export CSV

### Melhorias técnicas:
- [ ] Adicionar Sentry (error tracking)
- [ ] Adicionar Analytics (PostHog/Mixpanel)
- [ ] Melhorar performance (React Query cache)
- [ ] Adicionar dark mode
- [ ] Mobile app (Capacitor)

### Processos:
- [ ] Definir cadência de releases (quinzenal?)
- [ ] Definir processo de onboarding de novos clientes
- [ ] Criar playbook de troubleshooting

---

## 📊 MÉTRICAS DO MVP (SPRINT 0-3)

| Métrica | Target | Atual | Status |
|---------|--------|-------|--------|
| Sprints completos | 4 | 0 | 🔄 |
| User Stories entregues | 8 | 0 | 🔄 |
| Velocity média | 15 pts/sprint | - | - |
| Deploy frequency | 4 deploys | - | - |
| System uptime | > 99% | - | - |
| Team satisfaction | > 4/5 | - | - |

---

## 💡 RETROSPECTIVE GERAL (MVP)

**Perguntas a fazer na Retrospective Final:**

1. **O que funcionou bem?**
   - Processo de desenvolvimento
   - Ferramentas escolhidas
   - Colaboração da equipe

2. **O que não funcionou?**
   - Blockers recorrentes
   - Problemas técnicos
   - Gaps de comunicação

3. **O que aprendemos?**
   - Técnicas novas
   - Melhores práticas
   - Erros a evitar

4. **O que mudar para V1?**
   - Processos
   - Ferramentas
   - Cerimônias

---

## 🎯 PRÓXIMOS PASSOS (PÓS-MVP)

1. **Semana 1 pós-MVP:** Descanso + Refinamento do backlog V1
2. **Semana 2 pós-MVP:** Sprint Planning V1 + início do desenvolvimento
3. **Longo prazo:** Roadmap de 6 meses (V1 → V2 → V3)

---

**Criado por:** Pedro Vitor + Claude AI
**Data:** 2026-02-06
**Status:** 📝 Futuro (começa 17/Mar)

*"Think Smart, Think Uzz.Ai"*
