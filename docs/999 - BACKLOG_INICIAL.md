---
created: 2026-02-06T13:15
updated: 2026-02-06T16:23
project: Sistema de Gerenciamento UzzApp
type: Backlog
status: Ativo
---

# BACKLOG INICIAL - SISTEMA DE GERENCIAMENTO UZZAPP

**Versão:** 1.0.0
**Data:** 2026-02-06
**Autor:** Pedro Vitor Pagliarin + Claude AI
**Sprint Atual:** Sprint 0 (Setup)

---

## 📋 ÍNDICE

1. [Visão Geral do Backlog](#1-visão-geral-do-backlog)
2. [MVP - 8 User Stories Core](#2-mvp-8-user-stories-core)
3. [V1 - 10 User Stories Avançadas](#3-v1-10-user-stories-avançadas)
4. [V2 - 6 User Stories Clientes](#4-v2-6-user-stories-clientes)
5. [Priorização GUT](#5-priorização-gut)
6. [Backlog Board](#6-backlog-board)

---

## 1. VISÃO GERAL DO BACKLOG

### 1.1 Objetivo

Este backlog contém todas as **User Stories** necessárias para construir o Sistema de Gerenciamento do UzzApp, focado em:

✅ **Gestão de Features** do UzzApp (chatbot)
✅ **Tracking de Definition of Done** por feature
✅ **Gerenciamento de Sprints** reais
✅ **Atribuição de responsáveis** e prazos
✅ **Visualização de progresso** em dashboards

### 1.2 Estrutura de Versões

```
MVP (8 stories) → V1 (10 stories) → V2 (6 stories)
     ↓                 ↓                  ↓
  Essencial        Analytics          Clientes
  Gestão           Avançado           UzzApp
```

### 1.3 Formato das User Stories

Cada user story segue o template:

```markdown
## US-XXX: [Título]

**Como** [persona]
**Eu quero** [ação]
**Para que** [benefício]

**Critérios de Aceitação:**
- [ ] Critério 1
- [ ] Critério 2
- [ ] Critério N

**Notas Técnicas:**
- Dependências, implementação, etc

**Prioridade:** P0 / P1 / P2 / P3
**GUT Score:** G x U x T = Score
**BV/W:** Business Value / Work = Ratio
**Sprint:** Sprint-X
**Responsável:** Nome
**Status:** Backlog / Todo / In Progress / In Review / Done
```

---

## 2. MVP - 8 USER STORIES CORE

### 2.1 Features de Gestão de Projeto (Core)

---

## US-001: Dashboard Overview do Projeto UzzApp

**Como** Product Owner (Pedro)
**Eu quero** visualizar um dashboard com KPIs principais do projeto UzzApp
**Para que** eu possa ter uma visão rápida do status geral em um só lugar

**Critérios de Aceitação:**
- [ ] Dashboard mostra 4 cards de KPIs:
  - Status do projeto (Ativo, Pausado, Completo)
  - Progresso geral (% de features completas)
  - Total de features (número absoluto)
  - Tamanho da equipe (número de pessoas)
- [ ] Seção "Tempo de Execução" com:
  - Barra de progresso visual (previsto vs realizado)
  - Análise automática: "Projeto está X% acima/abaixo do previsto"
- [ ] Seção "Orçamento" (opcional para MVP) com:
  - Budget planejado vs gasto
  - Alerta visual se gasto > 75% do budget
- [ ] Dashboard responsivo (mobile, tablet, desktop)
- [ ] Carrega em menos de 2 segundos

**Notas Técnicas:**
- API: `GET /api/projects/:id/overview`
- Componentes: `DashboardCard`, `ProgressBar`, `AnalysisBox`
- Calcular progresso: `(features_done / features_total) * 100`

**Design:**
- Usar cores da paleta UzzAI:
  - Verde escuro (#2D6A5E) para headers
  - Azul médio (#4A90A4) para progresso positivo
  - Amarelo (#F4D03F) para alertas

**Prioridade:** P0 (Crítico)
**GUT:** G5 x U5 x T5 = **125** (Máximo)
**BV/W:** 10 / 3 = **3.33**
**Sprint:** Sprint-1
**Responsável:** Pedro (Frontend) + Luis (Backend API)
**Status:** Backlog
**Estimativa:** 3 dias

---

## US-002: Gestão de Features do UzzApp

**Como** Product Owner (Pedro)
**Eu quero** visualizar, criar, editar e deletar features do UzzApp
**Para que** eu possa mapear todas as funcionalidades que precisamos desenvolver

**Critérios de Aceitação:**
- [ ] Página `/features` lista todas as features em tabela:
  - Colunas: Code (F001), Nome, Categoria, Versão (MVP/V1/V2), Status, Responsável, Prazo
- [ ] Filtros funcionando:
  - Por versão (MVP, V1, V2, V3)
  - Por status (Backlog, In Progress, Done)
  - Por categoria (Chatbot Engine, RAG, Multi-tenant, etc)
  - Por responsável (Pedro, Luis, Arthur, Vitor)
- [ ] Botão "Nova Feature" abre modal/página de criação
- [ ] Formulário de Feature contém:
  - Code (auto-gerado: F001, F002...)
  - Nome da feature
  - Descrição detalhada
  - Categoria (dropdown)
  - Versão (dropdown: MVP, V1, V2, V3, V4)
  - Status (dropdown: Backlog, In Progress, Done, Cancelled)
  - Prioridade (dropdown: P0, P1, P2, P3)
  - Responsável (multi-select: Pedro, Luis, Arthur, Vitor, Lucas)
  - Prazo estimado (date picker)
- [ ] Ao clicar em uma feature, abre página de detalhes: `/features/:id`
- [ ] Busca por nome ou descrição (full-text search)
- [ ] Ordenação por: Code, Nome, Prazo, Status

**Notas Técnicas:**
- API:
  - `GET /api/features` (list with filters)
  - `POST /api/features` (create)
  - `GET /api/features/:id` (details)
  - `PATCH /api/features/:id` (update)
  - `DELETE /api/features/:id` (delete)
- Tabela: `features` (já definida no schema)
- Usar Shadcn/ui: Table, Dialog, Form, Select, DatePicker

**Prioridade:** P0 (Crítico)
**GUT:** G5 x U5 x T5 = **125**
**BV/W:** 10 / 5 = **2.00**
**Sprint:** Sprint-1
**Responsável:** Pedro (Frontend) + Luis (Backend API)
**Status:** Backlog
**Estimativa:** 5 dias

---

## US-003: Definition of Done Tracker por Feature

**Como** Product Owner (Pedro)
**Eu quero** rastrear o Definition of Done (DoD) de cada feature em 6 checkboxes
**Para que** eu possa garantir qualidade e não deixar nada para trás antes de marcar como "Done"

**Critérios de Aceitação:**
- [ ] Na página de detalhes da feature (`/features/:id`), exibir seção "Definition of Done"
- [ ] 6 checkboxes editáveis:
  1. ✅ **Funcional:** Feature funciona conforme especificado
  2. ✅ **Testes:** Testes unitários + E2E passando
  3. ✅ **Code Review:** Aprovado por 1+ dev
  4. ✅ **Documentação:** README atualizado
  5. ✅ **Deployed:** Em produção (Vercel)
  6. ✅ **User Acceptance:** Validado por Pedro (PO)
- [ ] Ao marcar/desmarcar checkbox, atualiza no banco
- [ ] Barra de progresso do DoD: `(checkboxes_marcados / 6) * 100%`
- [ ] Feature só pode mudar para status "Done" se todos os 6 checkboxes estiverem marcados
  - Se tentar marcar como Done sem todos os checkboxes, exibir erro: "Complete todos os itens do Definition of Done"
- [ ] Dashboard overview mostra % médio de DoD de todas as features

**Notas Técnicas:**
- Usar colunas do DB:
  - `dod_functional` BOOLEAN
  - `dod_tests` BOOLEAN
  - `dod_code_review` BOOLEAN
  - `dod_documentation` BOOLEAN
  - `dod_deployed` BOOLEAN
  - `dod_user_acceptance` BOOLEAN
- API: `PATCH /api/features/:id/dod` (atualizar checkboxes)
- Componente: `DoD Checklist` (Shadcn/ui Checkbox)

**Prioridade:** P0 (Crítico)
**GUT:** G5 x U5 x T4 = **100**
**BV/W:** 10 / 3 = **3.33**
**Sprint:** Sprint-1
**Responsável:** Pedro (Frontend) + Luis (Backend)
**Status:** Backlog
**Estimativa:** 3 dias

---

## US-004: Gestão de Sprints

**Como** Scrum Master (Pedro)
**Eu quero** criar, visualizar e gerenciar sprints
**Para que** eu possa organizar o trabalho em iterações de 2 semanas

**Critérios de Aceitação:**
- [ ] Página `/sprints` lista todos os sprints em cards:
  - Sprint Atual (destaque visual - cor verde)
  - Sprints Futuros (cor azul)
  - Sprints Passados (cor cinza, colapsados)
- [ ] Cada card de sprint mostra:
  - Code (Sprint-2025-W49)
  - Nome (Sprint Planning - Chatbot)
  - Datas (13/Jan - 24/Jan)
  - Status (Planned, Active, Completed)
  - Goal do sprint (texto)
  - Progresso (% de features concluídas)
  - Velocity target vs actual (pontos)
- [ ] Botão "Novo Sprint" abre formulário:
  - Code (auto-gerado baseado em data)
  - Nome
  - Goal (textarea)
  - Start date (date picker)
  - End date (date picker, mínimo 7 dias após start)
  - Capacity total (número de story points disponíveis)
  - Velocity target (pontos esperados)
- [ ] Ao clicar no sprint, vai para `/sprints/:id` com:
  - Features incluídas neste sprint
  - Burndown chart (se sprint ativo)
  - Botão "Adicionar Feature ao Sprint"
- [ ] Drag & Drop para adicionar features ao sprint (opcional no MVP)

**Notas Técnicas:**
- API:
  - `GET /api/sprints`
  - `POST /api/sprints`
  - `GET /api/sprints/:id`
  - `PATCH /api/sprints/:id`
- Tabela: `sprints`
- Validação: end_date > start_date

**Prioridade:** P0 (Crítico)
**GUT:** G5 x U5 x T5 = **125**
**BV/W:** 9 / 4 = **2.25**
**Sprint:** Sprint-2
**Responsável:** Pedro (Frontend) + Luis (Backend)
**Status:** Backlog
**Estimativa:** 4 dias

---

## US-005: Atribuição de Responsáveis e Prazos

**Como** Product Owner (Pedro)
**Eu quero** atribuir responsáveis e prazos para cada feature
**Para que** fique claro quem deve fazer o quê e até quando

**Critérios de Aceitação:**
- [ ] No formulário de feature, campo "Responsáveis" permite multi-seleção:
  - Pedro
  - Luis
  - Arthur
  - Vitor
  - Lucas
- [ ] Campo "Prazo Estimado" (date picker)
- [ ] Na lista de features, mostrar avatar dos responsáveis + prazo
- [ ] Filtro por responsável funciona
- [ ] Página `/team` mostra:
  - Lista de membros da equipe
  - Para cada membro: foto, nome, papel, features atribuídas (count)
  - Clicar no membro filtra features daquela pessoa
- [ ] Dashboard mostra "Features Atrasadas" (prazo < hoje e status != Done)

**Notas Técnicas:**
- Tabela `features` já tem:
  - `responsible` TEXT[] (array de nomes)
  - `due_date` DATE
- API:
  - `GET /api/team` (lista de membros)
  - `GET /api/features?responsible=Pedro` (filtrar)
- Componente: `AvatarGroup` (Shadcn/ui)

**Prioridade:** P0 (Crítico)
**GUT:** G5 x U5 x T4 = **100**
**BV/W:** 8 / 3 = **2.67**
**Sprint:** Sprint-2
**Responsável:** Pedro (Frontend) + Luis (Backend)
**Status:** Backlog
**Estimativa:** 3 dias

---

## US-006: Timeline Visual (Gantt Simplificado)

**Como** Product Owner (Pedro)
**Eu quero** visualizar uma timeline das features com prazos
**Para que** eu possa ter uma visão temporal do roadmap

**Critérios de Aceitação:**
- [ ] Página `/timeline` exibe timeline visual
- [ ] Eixo X: tempo (meses)
- [ ] Eixo Y: features (uma barra por feature)
- [ ] Cada barra mostra:
  - Nome da feature
  - Duração (start → end date)
  - Cor baseada no status (verde = done, azul = in progress, cinza = backlog)
- [ ] Hover na barra mostra tooltip com detalhes
- [ ] Zoom in/out (opcional no MVP)
- [ ] Filtros: por versão, por responsável

**Notas Técnicas:**
- Biblioteca: `react-gantt-chart` ou custom com SVG
- API: `GET /api/features?include=dates` (retorna start_date, end_date)
- Alternativa simples: usar `recharts` com BarChart horizontal

**Prioridade:** P1 (Alto)
**GUT:** G4 x U4 x T4 = **64**
**BV/W:** 7 / 5 = **1.40**
**Sprint:** Sprint-2
**Responsável:** Pedro (Frontend)
**Status:** Backlog
**Estimativa:** 4 dias

---

## US-007: Gestão de Riscos Básica

**Como** Product Owner (Pedro)
**Eu quero** registrar riscos do projeto e suas mitigações
**Para que** eu possa antecipar problemas e ter planos de ação

**Critérios de Aceitação:**
- [ ] Página `/risks` lista riscos em tabela:
  - Colunas: ID, Título, GUT Score, Severidade, Status, Owner, Ações
- [ ] Botão "Novo Risco" abre formulário:
  - Título
  - Descrição
  - Gravidade (1-5)
  - Urgência (1-5)
  - Tendência (1-5)
  - GUT Score (calculado automaticamente: G x U x T)
  - Severidade (calculada: < 40 = Baixa, 40-80 = Média, > 80 = Alta)
  - Status (Identified, Mitigating, Mitigated)
  - Plano de Mitigação (textarea)
  - Owner (select: Pedro, Luis, etc)
- [ ] Ordenação padrão: GUT Score DESC (riscos críticos primeiro)
- [ ] Dashboard overview mostra: "X riscos críticos (GUT > 80)"

**Notas Técnicas:**
- API:
  - `GET /api/risks`
  - `POST /api/risks`
  - `PATCH /api/risks/:id`
- Tabela: `risks`
- Validação: GUT score recalculado no backend (GENERATED column)

**Prioridade:** P1 (Alto)
**GUT:** G4 x U4 x T3 = **48**
**BV/W:** 6 / 3 = **2.00**
**Sprint:** Sprint-3
**Responsável:** Pedro (Frontend) + Luis (Backend)
**Status:** Backlog
**Estimativa:** 3 dias

---

## US-008: Autenticação e Controle de Acesso

**Como** Administrador (Pedro)
**Eu quero** que apenas pessoas autorizadas acessem o sistema
**Para que** os dados do projeto fiquem seguros

**Critérios de Aceitação:**
- [ ] Página de login `/login` com:
  - Email
  - Password
  - Botão "Entrar"
  - Link "Esqueci minha senha"
- [ ] Após login, redireciona para `/dashboard`
- [ ] Se não autenticado, todas as rotas redirecionam para `/login`
- [ ] Supabase Auth configurado
- [ ] Middleware Next.js valida JWT em todas as páginas
- [ ] Logout funciona (botão no header)
- [ ] Signup inicial manual (Pedro cria usuários no Supabase diretamente)

**Notas Técnicas:**
- Supabase Auth (built-in)
- Middleware: `middleware.ts` (verificar token)
- Não precisa RBAC complexo no MVP (todos têm acesso total)

**Prioridade:** P0 (Crítico)
**GUT:** G5 x U5 x T5 = **125**
**BV/W:** 8 / 2 = **4.00**
**Sprint:** Sprint-1 (deve ser primeira feature implementada)
**Responsável:** Luis (Backend/Auth)
**Status:** Backlog
**Estimativa:** 2 dias

---

## 3. V1 - 10 USER STORIES AVANÇADAS

### 3.1 Analytics e Métricas

---

## US-010: Burndown Chart do Sprint

**Como** Scrum Master (Pedro)
**Eu quero** visualizar o burndown chart do sprint ativo
**Para que** eu possa acompanhar se estamos no ritmo certo

**Critérios de Aceitação:**
- [ ] Na página do sprint (`/sprints/:id`), exibir gráfico de burndown
- [ ] Eixo X: dias do sprint (Day 1, Day 2, ..., Day N)
- [ ] Eixo Y: story points restantes
- [ ] 2 linhas no gráfico:
  - **Linha Ideal** (reta decrescente de total_points → 0)
  - **Linha Real** (atualizada quando features mudam para "Done")
- [ ] Tooltip ao hover mostra:
  - Data
  - Pontos restantes
  - Pontos ideais
  - Diferença (+ ou -)
- [ ] Indicador visual:
  - Verde: se abaixo da linha ideal (ahead)
  - Vermelho: se acima da linha ideal (behind)
- [ ] Atualiza em tempo real (Supabase Realtime)

**Notas Técnicas:**
- API: `GET /api/sprints/:id/burndown`
- Biblioteca: Recharts (LineChart)
- Cálculo:
  - Linha ideal: `y = total_points - (total_points / sprint_days) * day`
  - Linha real: queries de tasks concluídas por dia

**Prioridade:** P1 (Alto)
**GUT:** G4 x U4 x T4 = **64**
**BV/W:** 8 / 4 = **2.00**
**Sprint:** Sprint-4
**Responsável:** Pedro (Frontend) + Luis (Backend)
**Status:** Backlog
**Estimativa:** 4 dias

---

## US-011: Velocity Chart (Histórico)

**Como** Product Owner (Pedro)
**Eu quero** ver um gráfico de velocity dos últimos sprints
**Para que** eu possa melhorar estimativas futuras

**Critérios de Aceitação:**
- [ ] Página `/analytics` com seção "Velocity"
- [ ] Gráfico de barras verticais:
  - Eixo X: sprints (Sprint-W45, Sprint-W46, ...)
  - Eixo Y: story points completados
  - Barra azul: Velocity target (planejado)
  - Barra verde: Velocity actual (realizado)
- [ ] Linha horizontal com média de velocity
- [ ] Tooltip mostra: sprint name, target, actual, diferença
- [ ] Filtro: últimos 3, 6 ou 12 sprints

**Notas Técnicas:**
- API: `GET /api/analytics/velocity?last=6`
- Biblioteca: Recharts (BarChart)

**Prioridade:** P1 (Alto)
**GUT:** G4 x U3 x T3 = **36**
**BV/W:** 7 / 3 = **2.33**
**Sprint:** Sprint-4
**Responsável:** Pedro (Frontend) + Luis (Backend)
**Status:** Backlog
**Estimativa:** 3 dias

---

## US-012: Lead Time e Cycle Time

**Como** Process Improvement Lead (Pedro)
**Eu quero** medir Lead Time e Cycle Time das features
**Para que** eu possa identificar gargalos no processo

**Critérios de Aceitação:**
- [ ] Tabela `features` tem campos:
  - `created_at` (já existe)
  - `started_at` (quando status muda para "In Progress")
  - `completed_at` (quando status muda para "Done")
- [ ] Na página `/analytics`:
  - **Lead Time** médio = AVG(completed_at - created_at)
  - **Cycle Time** médio = AVG(completed_at - started_at)
- [ ] Cards mostram:
  - "Lead Time Médio: 3.2 dias"
  - "Cycle Time Médio: 2.1 dias"
- [ ] Lista de features mostra Lead Time individual

**Notas Técnicas:**
- API: `GET /api/analytics/metrics`
- Trigger no DB para preencher `started_at` e `completed_at` automaticamente

**Prioridade:** P2 (Médio)
**GUT:** G3 x U3 x T3 = **27**
**BV/W:** 6 / 2 = **3.00**
**Sprint:** Sprint-5
**Responsável:** Luis (Backend) + Pedro (Frontend)
**Status:** Backlog
**Estimativa:** 2 dias

---

## US-013: Project Health Score

**Como** Product Owner (Pedro)
**Eu quero** ver um "Health Score" agregado do projeto
**Para que** eu saiba rapidamente se está tudo ok ou se preciso intervir

**Critérios de Aceitação:**
- [ ] Dashboard overview mostra card "Project Health Score"
- [ ] Score de 0 a 100, calculado com base em:
  - **Velocity** (30%): Velocity real vs target (se >= 90% do target = 30pts)
  - **Budget** (20%): Gasto vs planejado (se <= 85% = 20pts)
  - **Deadlines** (30%): % de features entregues no prazo (se >= 80% = 30pts)
  - **Quality** (20%): % de features com DoD 100% completo (se >= 90% = 20pts)
- [ ] Cor do score:
  - Verde (80-100): Saudável ✅
  - Amarelo (60-79): Atenção 🟡
  - Vermelho (< 60): Crítico 🔴
- [ ] Tooltip explica como o score é calculado

**Notas Técnicas:**
- API: `GET /api/projects/:id/health`
- Cálculo no backend (PostgreSQL function ou API logic)

**Prioridade:** P1 (Alto)
**GUT:** G4 x U4 x T3 = **48**
**BV/W:** 8 / 3 = **2.67**
**Sprint:** Sprint-5
**Responsável:** Luis (Backend) + Pedro (Frontend)
**Status:** Backlog
**Estimativa:** 3 dias

---

## US-014: Comentários em Features

**Como** Desenvolvedor (Luis/Pedro)
**Eu quero** adicionar comentários em features
**Para que** eu possa discutir detalhes de implementação

**Critérios de Aceitação:**
- [ ] Na página de detalhes da feature, seção "Comentários"
- [ ] Lista de comentários mostra:
  - Avatar do autor
  - Nome do autor
  - Timestamp (relativo: "há 2 horas")
  - Texto do comentário (Markdown support)
- [ ] Campo de texto para novo comentário (textarea)
- [ ] Botão "Enviar Comentário"
- [ ] Comentários ordenados: mais recentes primeiro
- [ ] Notificação: quando alguém comenta, responsáveis recebem email (opcional no MVP)

**Notas Técnicas:**
- Tabela: `feature_comments`
  - `id`, `feature_id`, `user_id`, `content`, `created_at`
- API:
  - `GET /api/features/:id/comments`
  - `POST /api/features/:id/comments`
- Usar Tiptap (rich text editor) ou textarea simples

**Prioridade:** P2 (Médio)
**GUT:** G3 x U3 x T2 = **18**
**BV/W:** 5 / 3 = **1.67**
**Sprint:** Sprint-5
**Responsável:** Luis (Backend) + Pedro (Frontend)
**Status:** Backlog
**Estimativa:** 3 dias

---

## US-015: Export de Relatórios (CSV)

**Como** Product Owner (Pedro)
**Eu quero** exportar lista de features em CSV
**Para que** eu possa compartilhar com stakeholders externos

**Critérios de Aceitação:**
- [ ] Na página `/features`, botão "Exportar CSV"
- [ ] Ao clicar, baixa arquivo `features-2025-12-03.csv`
- [ ] CSV contém colunas:
  - Code, Nome, Categoria, Versão, Status, Prioridade, Responsáveis, Prazo, DoD %
- [ ] Respeita filtros ativos (se filtrou por "MVP", exporta só MVP)

**Notas Técnicas:**
- API: `GET /api/features/export?format=csv`
- Biblioteca: `json2csv` (Node.js)
- Alternativa: gerar CSV no frontend com `papaparse`

**Prioridade:** P2 (Médio)
**GUT:** G3 x U2 x T2 = **12**
**BV/W:** 4 / 2 = **2.00**
**Sprint:** Sprint-6
**Responsável:** Luis (Backend)
**Status:** Backlog
**Estimativa:** 2 dias

---

## US-016: Tags/Labels para Features

**Como** Product Owner (Pedro)
**Eu quero** adicionar tags às features (ex: "urgent", "bug", "enhancement")
**Para que** eu possa categorizar e filtrar de forma flexível

**Critérios de Aceitação:**
- [ ] Na página de detalhes da feature, campo "Tags"
- [ ] Adicionar tags digitando e pressionando Enter
- [ ] Tags aparecem como badges coloridos
- [ ] Remover tag clicando no "X"
- [ ] Filtro por tag na lista de features
- [ ] Dashboard mostra "Features urgentes" (tag:urgent)

**Notas Técnicas:**
- Tabela: `tags` (id, name, color)
- Tabela: `feature_tags` (feature_id, tag_id)
- API: `GET /api/tags`, `POST /api/features/:id/tags`

**Prioridade:** P2 (Médio)
**GUT:** G3 x U2 x T2 = **12**
**BV/W:** 5 / 3 = **1.67**
**Sprint:** Sprint-6
**Responsável:** Luis (Backend) + Pedro (Frontend)
**Status:** Backlog
**Estimativa:** 3 dias

---

## US-017: Histórico de Mudanças (Audit Log)

**Como** Product Owner (Pedro)
**Eu quero** ver histórico de mudanças em cada feature
**Para que** eu saiba quem mudou o quê e quando

**Critérios de Aceitação:**
- [ ] Na página de detalhes da feature, seção "Histórico"
- [ ] Lista cronológica de mudanças:
  - "Pedro alterou Status de 'In Progress' para 'Done' - há 2 horas"
  - "Luis adicionou tag 'urgent' - há 1 dia"
  - "Pedro marcou DoD 'Deployed' como concluído - há 3 dias"
- [ ] Paginação (10 itens por página)

**Notas Técnicas:**
- Tabela: `feature_changes`
  - `id`, `feature_id`, `user_id`, `field_changed`, `old_value`, `new_value`, `changed_at`
- Trigger no DB para preencher automaticamente ao UPDATE
- API: `GET /api/features/:id/history`

**Prioridade:** P2 (Médio)
**GUT:** G3 x U2 x T2 = **12**
**BV/W:** 4 / 3 = **1.33**
**Sprint:** Sprint-6
**Responsável:** Luis (Backend) + Pedro (Frontend)
**Status:** Backlog
**Estimativa:** 3 dias

---

## US-018: Notificações por Email

**Como** Responsável por uma feature (Luis/Pedro/Arthur/Vitor)
**Eu quero** receber email quando houver mudanças na minha feature
**Para que** eu fique sempre atualizado sem ter que abrir o sistema

**Critérios de Aceitação:**
- [ ] Quando feature muda de status, envia email para responsáveis
- [ ] Quando alguém comenta em feature que estou alocado, recebo email
- [ ] Quando prazo está próximo (3 dias antes), recebo email de lembrete
- [ ] Email tem link direto para a feature
- [ ] Configuração: cada user pode ligar/desligar notificações

**Notas Técnicas:**
- Usar Resend (transactional emails)
- Templates de email (HTML simples)
- Queue de emails (opcional: usar Supabase Edge Functions)

**Prioridade:** P3 (Baixo - Nice to have)
**GUT:** G2 x U2 x T2 = **8**
**BV/W:** 3 / 4 = **0.75**
**Sprint:** Sprint-7 (se houver tempo)
**Responsável:** Luis (Backend)
**Status:** Backlog
**Estimativa:** 4 dias

---

## US-019: Mobile Responsivo

**Como** Usuário mobile (Pedro/Luis)
**Eu quero** acessar o sistema do celular com boa usabilidade
**Para que** eu possa checar status mesmo fora do escritório

**Critérios de Aceitação:**
- [ ] Todas as páginas responsivas (breakpoints: mobile, tablet, desktop)
- [ ] Menu lateral vira hamburger menu no mobile
- [ ] Tabelas viram cards empilhados no mobile
- [ ] Gráficos são touch-friendly
- [ ] Testado em iOS Safari e Android Chrome

**Notas Técnicas:**
- Tailwind responsive classes (`sm:`, `md:`, `lg:`)
- Shadcn/ui já é responsivo por padrão
- Testar com Chrome DevTools (mobile emulation)

**Prioridade:** P1 (Alto)
**GUT:** G4 x U3 x T3 = **36**
**BV/W:** 7 / 2 = **3.50**
**Sprint:** Sprint-5 (dev paralelo durante implementação)
**Responsável:** Pedro (Frontend)
**Status:** Backlog
**Estimativa:** 2 dias (testing + ajustes)

---

## 4. V2 - 6 USER STORIES CLIENTES

### 4.1 Gestão de Clientes do UzzApp

*(Estas user stories são para quando o UzzApp começar a ter clientes reais)*

---

## US-030: Diretório de Clientes UzzApp

**Como** Sales Manager (Vitor)
**Eu quero** visualizar lista de todos os clientes do UzzApp
**Para que** eu possa acompanhar o pipeline de vendas

**Critérios de Aceitação:**
- [ ] Página `/clients` lista clientes em cards/tabela:
  - Logo do cliente (opcional)
  - Nome da empresa
  - Status (Trial, Active, Churned)
  - Data de onboarding
  - Número de conversas/mês
  - CSAT score médio
- [ ] Filtros: por status, por data de onboarding
- [ ] Busca por nome
- [ ] Botão "Novo Cliente"

**Prioridade:** P1 (Alto - para V2)
**Sprint:** Sprint-8
**Responsável:** Vitor (Vendas) + Pedro (Frontend) + Luis (Backend)
**Status:** Backlog (V2)
**Estimativa:** 3 dias

---

## US-031: Onboarding de Cliente (Wizard)

**Como** Sales Manager (Vitor)
**Eu quero** onboardar novos clientes via wizard de 4 etapas
**Para que** o processo seja rápido e padronizado

**Critérios de Aceitação:**
- [ ] Wizard de 4 steps:
  1. **Informações Básicas:** Nome, CNPJ, Email, Telefone
  2. **Configuração WhatsApp:** WhatsApp Business ID, Número
  3. **Upload de Documentos:** Arrastar PDFs para RAG
  4. **Catálogo Inicial:** Importar CSV de produtos
- [ ] Botões: "Anterior", "Próximo", "Finalizar"
- [ ] Validação em cada step
- [ ] Ao finalizar, cria cliente no DB + envia email de boas-vindas

**Prioridade:** P0 (Crítico - para V2)
**Sprint:** Sprint-8
**Responsável:** Vitor (Vendas/Especificação) + Pedro (Frontend) + Luis (Backend)
**Status:** Backlog (V2)
**Estimativa:** 5 dias

---

## US-032: Gestão de Catálogo do Cliente

**Como** Cliente do UzzApp (Umana, Colavoro)
**Eu quero** adicionar/editar/deletar produtos do meu catálogo
**Para que** o chatbot possa consultar e vender meus produtos

**Critérios de Aceitação:**
- [ ] Na página do cliente (`/clients/:id/catalog`), tabela de produtos:
  - Code, Nome, Descrição, Preço, Imagem, Status
- [ ] CRUD completo de produtos
- [ ] Import CSV em massa (upload de arquivo)
- [ ] Export CSV
- [ ] Busca e filtros

**Prioridade:** P0 (Crítico - para V2)
**Sprint:** Sprint-9
**Responsável:** Arthur (Marketing/Copy) + Pedro (Frontend) + Luis (Backend)
**Status:** Backlog (V2)
**Estimativa:** 4 dias

---

## US-033: Upload de Documentos para RAG

**Como** Cliente do UzzApp
**Eu quero** fazer upload de PDFs para a base de conhecimento
**Para que** o chatbot possa responder perguntas baseadas nesses docs

**Critérios de Aceitação:**
- [ ] Página `/clients/:id/knowledge-base` com área de upload
- [ ] Drag & drop de arquivos (PDF, TXT, MD)
- [ ] Lista de documentos uploadados:
  - Nome do arquivo, Data de upload, Status (Indexado / Processando)
- [ ] Deletar documento
- [ ] Indicador de progresso: "87 documentos indexados"

**Prioridade:** P0 (Crítico - para V2)
**Sprint:** Sprint-9
**Responsável:** Luis (Backend/Infra) + Pedro (Frontend)
**Status:** Backlog (V2)
**Estimativa:** 5 dias

---

## US-034: Analytics por Cliente

**Como** Sales Manager (Vitor)
**Eu quero** ver métricas de uso de cada cliente
**Para que** eu possa identificar clientes em risco de churn

**Critérios de Aceitação:**
- [ ] Na página do cliente, aba "Analytics"
- [ ] Cards de KPIs:
  - Total de conversas (mês atual)
  - Taxa de resolução (%)
  - CSAT Score médio (1-5)
  - RAG Hit Rate (% de queries resolvidas via docs)
- [ ] Gráfico de conversas por dia (últimos 30 dias)
- [ ] Gráfico de satisfação ao longo do tempo

**Prioridade:** P1 (Alto - para V2)
**Sprint:** Sprint-10
**Responsável:** Vitor (Vendas/Análise) + Pedro (Frontend) + Luis (Backend)
**Status:** Backlog (V2)
**Estimativa:** 4 dias

---

## US-035: Configuração de Fluxos Conversacionais

**Como** Cliente do UzzApp (Admin)
**Eu quero** criar/editar fluxos conversacionais do chatbot
**Para que** eu possa customizar as respostas sem precisar de dev

**Critérios de Aceitação:**
- [ ] Página `/clients/:id/flows` com editor visual de fluxos
- [ ] Drag & drop de nós:
  - Nó "Mensagem" (envia texto)
  - Nó "Pergunta" (espera resposta do usuário)
  - Nó "Condição" (if/else)
  - Nó "API Call" (chama API externa)
- [ ] Conectar nós com linhas
- [ ] Testar fluxo (preview)
- [ ] Publicar fluxo

**Prioridade:** P2 (Médio - para V2)
**Sprint:** Sprint-10
**Responsável:** Arthur (Marketing/Copy) + Pedro (Frontend) + Luis (Backend)
**Status:** Backlog (V2)
**Estimativa:** 8 dias (complexo)

---

## 5. PRIORIZAÇÃO GUT

### 5.1 Ranking por GUT Score

| Rank | US ID | User Story | GUT | Prioridade | Sprint |
|------|-------|------------|-----|------------|--------|
| 1 | US-001 | Dashboard Overview | 125 | P0 | Sprint-1 |
| 1 | US-002 | Gestão de Features | 125 | P0 | Sprint-1 |
| 1 | US-004 | Gestão de Sprints | 125 | P0 | Sprint-2 |
| 1 | US-008 | Autenticação | 125 | P0 | Sprint-1 |
| 5 | US-003 | Definition of Done Tracker | 100 | P0 | Sprint-1 |
| 5 | US-005 | Atribuição de Responsáveis | 100 | P0 | Sprint-2 |
| 7 | US-006 | Timeline Visual | 64 | P1 | Sprint-2 |
| 7 | US-010 | Burndown Chart | 64 | P1 | Sprint-4 |
| 9 | US-007 | Gestão de Riscos | 48 | P1 | Sprint-3 |
| 9 | US-013 | Project Health Score | 48 | P1 | Sprint-5 |

### 5.2 MVP Final (8 User Stories)

**Sprint 1 (Semana 1-2):**
- US-008: Autenticação (2 dias)
- US-001: Dashboard Overview (3 dias)
- US-002: Gestão de Features (5 dias)

**Sprint 2 (Semana 3-4):**
- US-003: Definition of Done Tracker (3 dias)
- US-004: Gestão de Sprints (4 dias)
- US-005: Atribuição de Responsáveis (3 dias)

**Sprint 3 (Semana 5-6):**
- US-006: Timeline Visual (4 dias)
- US-007: Gestão de Riscos (3 dias)
- Testes E2E + Deploy MVP (3 dias)

---

## 6. BACKLOG BOARD

### 6.1 Status das User Stories

```
┌─────────────────────────────────────────────────────────────────┐
│                        BACKLOG BOARD                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  📋 BACKLOG (24 stories)                                         │
│  ├─ MVP (8 stories)                                              │
│  │  ├─ US-001: Dashboard Overview [GUT 125]                     │
│  │  ├─ US-002: Gestão de Features [GUT 125]                     │
│  │  ├─ US-003: DoD Tracker [GUT 100]                            │
│  │  ├─ US-004: Gestão de Sprints [GUT 125]                      │
│  │  ├─ US-005: Responsáveis [GUT 100]                           │
│  │  ├─ US-006: Timeline [GUT 64]                                │
│  │  ├─ US-007: Riscos [GUT 48]                                  │
│  │  └─ US-008: Autenticação [GUT 125]                           │
│  ├─ V1 (10 stories)                                              │
│  │  ├─ US-010: Burndown [GUT 64]                                │
│  │  ├─ US-011: Velocity Chart [GUT 36]                          │
│  │  ├─ US-012: Lead/Cycle Time [GUT 27]                         │
│  │  ├─ US-013: Health Score [GUT 48]                            │
│  │  ├─ US-014: Comentários [GUT 18]                             │
│  │  ├─ US-015: Export CSV [GUT 12]                              │
│  │  ├─ US-016: Tags [GUT 12]                                    │
│  │  ├─ US-017: Audit Log [GUT 12]                               │
│  │  ├─ US-018: Notificações [GUT 8]                             │
│  │  └─ US-019: Mobile Responsivo [GUT 36]                       │
│  └─ V2 (6 stories)                                               │
│     ├─ US-030: Diretório Clientes                               │
│     ├─ US-031: Onboarding Wizard                                │
│     ├─ US-032: Catálogo                                         │
│     ├─ US-033: Upload Docs                                      │
│     ├─ US-034: Analytics Cliente                                │
│     └─ US-035: Fluxos Conversacionais                           │
│                                                                   │
│  📝 TODO (0 stories)                                             │
│                                                                   │
│  🚧 IN PROGRESS (0 stories)                                      │
│                                                                   │
│  ✅ DONE (0 stories)                                             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Próximas Ações

**Antes do Sprint 1:**
1. ✅ Aprovar este backlog
2. ✅ Criar projeto no GitHub
3. ✅ Setup Supabase
4. ✅ Sprint Planning do Sprint 1
5. ✅ Quebrar US-001, US-002, US-008 em subtasks

**Durante Sprint 1:**
- Daily standup 9h
- Mover stories de Backlog → Todo → In Progress → Done
- Code review obrigatório
- Testar cada feature antes de marcar como Done

---

## 📊 RESUMO DO BACKLOG

**Total de User Stories:** 24
- **MVP:** 8 stories (Sprint 1-3)
- **V1:** 10 stories (Sprint 4-7)
- **V2:** 6 stories (Sprint 8-10)

**Esforço Estimado:**
- **MVP:** 28 dias (6 semanas com 2 devs)
- **V1:** 26 dias (4 semanas)
- **V2:** 29 dias (6 semanas)
- **TOTAL:** 83 dias (~16 semanas)

**GUT Score Médio:** 65 (Alta prioridade geral)

**Business Value / Work Ratio Médio:** 2.1 (Bom ROI)

---

**Autor:** Pedro Vitor Pagliarin + Claude AI
**Data:** 2026-02-06
**Versão:** 1.0.0
**Status:** ✅ Pronto para Sprint Planning

---

*"Think Smart, Think Uzz.Ai"*
