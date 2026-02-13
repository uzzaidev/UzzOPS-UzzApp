---

created: 2026-02-06T13:15
updated: 2026-02-06T16:23
project: Sistema de Gerenciamento UzzApp
type: Backlog
status: Ativo
---

> [!IMPORTANT]
> Documento legado/historico (frozen).
> Fonte canônica atual: `docs/AI_PROJECT_CONTEXT_MASTER.md`, `docs/RESTART_CHECKLIST.md`, `README.md`, `docs/README_DOCUMENTATION.md`.
> Use este arquivo apenas como referencia historica.


# BACKLOG INICIAL - SISTEMA DE GERENCIAMENTO UZZAPP

**VersÃ£o:** 1.0.0
**Data:** 2026-02-06
**Autor:** Pedro Vitor Pagliarin + Claude AI
**Sprint Atual:** Sprint 0 (Setup)

---

## ðŸ“‹ ÃNDICE

1. [VisÃ£o Geral do Backlog](#1-visÃ£o-geral-do-backlog)
2. [MVP - 8 User Stories Core](#2-mvp-8-user-stories-core)
3. [V1 - 10 User Stories AvanÃ§adas](#3-v1-10-user-stories-avanÃ§adas)
4. [V2 - 6 User Stories Clientes](#4-v2-6-user-stories-clientes)
5. [PriorizaÃ§Ã£o GUT](#5-priorizaÃ§Ã£o-gut)
6. [Backlog Board](#6-backlog-board)

---

## 1. VISÃƒO GERAL DO BACKLOG

### 1.1 Objetivo

Este backlog contÃ©m todas as **User Stories** necessÃ¡rias para construir o Sistema de Gerenciamento do UzzApp, focado em:

âœ… **GestÃ£o de Features** do UzzApp (chatbot)
âœ… **Tracking de Definition of Done** por feature
âœ… **Gerenciamento de Sprints** reais
âœ… **AtribuiÃ§Ã£o de responsÃ¡veis** e prazos
âœ… **VisualizaÃ§Ã£o de progresso** em dashboards

### 1.2 Estrutura de VersÃµes

```
MVP (8 stories) â†’ V1 (10 stories) â†’ V2 (6 stories)
     â†“                 â†“                  â†“
  Essencial        Analytics          Clientes
  GestÃ£o           AvanÃ§ado           UzzApp
```

### 1.3 Formato das User Stories

Cada user story segue o template:

```markdown
## US-XXX: [TÃ­tulo]

**Como** [persona]
**Eu quero** [aÃ§Ã£o]
**Para que** [benefÃ­cio]

**CritÃ©rios de AceitaÃ§Ã£o:**
- [ ] CritÃ©rio 1
- [ ] CritÃ©rio 2
- [ ] CritÃ©rio N

**Notas TÃ©cnicas:**
- DependÃªncias, implementaÃ§Ã£o, etc

**Prioridade:** P0 / P1 / P2 / P3
**GUT Score:** G x U x T = Score
**BV/W:** Business Value / Work = Ratio
**Sprint:** Sprint-X
**ResponsÃ¡vel:** Nome
**Status:** Backlog / Todo / In Progress / In Review / Done
```

---

## 2. MVP - 8 USER STORIES CORE

### 2.1 Features de GestÃ£o de Projeto (Core)

---

## US-001: Dashboard Overview do Projeto UzzApp

**Como** Product Owner (Pedro)
**Eu quero** visualizar um dashboard com KPIs principais do projeto UzzApp
**Para que** eu possa ter uma visÃ£o rÃ¡pida do status geral em um sÃ³ lugar

**CritÃ©rios de AceitaÃ§Ã£o:**
- [ ] Dashboard mostra 4 cards de KPIs:
  - Status do projeto (Ativo, Pausado, Completo)
  - Progresso geral (% de features completas)
  - Total de features (nÃºmero absoluto)
  - Tamanho da equipe (nÃºmero de pessoas)
- [ ] SeÃ§Ã£o "Tempo de ExecuÃ§Ã£o" com:
  - Barra de progresso visual (previsto vs realizado)
  - AnÃ¡lise automÃ¡tica: "Projeto estÃ¡ X% acima/abaixo do previsto"
- [ ] SeÃ§Ã£o "OrÃ§amento" (opcional para MVP) com:
  - Budget planejado vs gasto
  - Alerta visual se gasto > 75% do budget
- [ ] Dashboard responsivo (mobile, tablet, desktop)
- [ ] Carrega em menos de 2 segundos

**Notas TÃ©cnicas:**
- API: `GET /api/projects/:id/overview`
- Componentes: `DashboardCard`, `ProgressBar`, `AnalysisBox`
- Calcular progresso: `(features_done / features_total) * 100`

**Design:**
- Usar cores da paleta UzzAI:
  - Verde escuro (#2D6A5E) para headers
  - Azul mÃ©dio (#4A90A4) para progresso positivo
  - Amarelo (#F4D03F) para alertas

**Prioridade:** P0 (CrÃ­tico)
**GUT:** G5 x U5 x T5 = **125** (MÃ¡ximo)
**BV/W:** 10 / 3 = **3.33**
**Sprint:** Sprint-1
**ResponsÃ¡vel:** Pedro (Frontend) + Luis (Backend API)
**Status:** Backlog
**Estimativa:** 3 dias

---

## US-002: GestÃ£o de Features do UzzApp

**Como** Product Owner (Pedro)
**Eu quero** visualizar, criar, editar e deletar features do UzzApp
**Para que** eu possa mapear todas as funcionalidades que precisamos desenvolver

**CritÃ©rios de AceitaÃ§Ã£o:**
- [ ] PÃ¡gina `/features` lista todas as features em tabela:
  - Colunas: Code (F001), Nome, Categoria, VersÃ£o (MVP/V1/V2), Status, ResponsÃ¡vel, Prazo
- [ ] Filtros funcionando:
  - Por versÃ£o (MVP, V1, V2, V3)
  - Por status (Backlog, In Progress, Done)
  - Por categoria (Chatbot Engine, RAG, Multi-tenant, etc)
  - Por responsÃ¡vel (Pedro, Luis, Arthur, Vitor)
- [ ] BotÃ£o "Nova Feature" abre modal/pÃ¡gina de criaÃ§Ã£o
- [ ] FormulÃ¡rio de Feature contÃ©m:
  - Code (auto-gerado: F001, F002...)
  - Nome da feature
  - DescriÃ§Ã£o detalhada
  - Categoria (dropdown)
  - VersÃ£o (dropdown: MVP, V1, V2, V3, V4)
  - Status (dropdown: Backlog, In Progress, Done, Cancelled)
  - Prioridade (dropdown: P0, P1, P2, P3)
  - ResponsÃ¡vel (multi-select: Pedro, Luis, Arthur, Vitor, Lucas)
  - Prazo estimado (date picker)
- [ ] Ao clicar em uma feature, abre pÃ¡gina de detalhes: `/features/:id`
- [ ] Busca por nome ou descriÃ§Ã£o (full-text search)
- [ ] OrdenaÃ§Ã£o por: Code, Nome, Prazo, Status

**Notas TÃ©cnicas:**
- API:
  - `GET /api/features` (list with filters)
  - `POST /api/features` (create)
  - `GET /api/features/:id` (details)
  - `PATCH /api/features/:id` (update)
  - `DELETE /api/features/:id` (delete)
- Tabela: `features` (jÃ¡ definida no schema)
- Usar Shadcn/ui: Table, Dialog, Form, Select, DatePicker

**Prioridade:** P0 (CrÃ­tico)
**GUT:** G5 x U5 x T5 = **125**
**BV/W:** 10 / 5 = **2.00**
**Sprint:** Sprint-1
**ResponsÃ¡vel:** Pedro (Frontend) + Luis (Backend API)
**Status:** Backlog
**Estimativa:** 5 dias

---

## US-003: Definition of Done Tracker por Feature

**Como** Product Owner (Pedro)
**Eu quero** rastrear o Definition of Done (DoD) de cada feature em 6 checkboxes
**Para que** eu possa garantir qualidade e nÃ£o deixar nada para trÃ¡s antes de marcar como "Done"

**CritÃ©rios de AceitaÃ§Ã£o:**
- [ ] Na pÃ¡gina de detalhes da feature (`/features/:id`), exibir seÃ§Ã£o "Definition of Done"
- [ ] 6 checkboxes editÃ¡veis:
  1. âœ… **Funcional:** Feature funciona conforme especificado
  2. âœ… **Testes:** Testes unitÃ¡rios + E2E passando
  3. âœ… **Code Review:** Aprovado por 1+ dev
  4. âœ… **DocumentaÃ§Ã£o:** README atualizado
  5. âœ… **Deployed:** Em produÃ§Ã£o (Vercel)
  6. âœ… **User Acceptance:** Validado por Pedro (PO)
- [ ] Ao marcar/desmarcar checkbox, atualiza no banco
- [ ] Barra de progresso do DoD: `(checkboxes_marcados / 6) * 100%`
- [ ] Feature sÃ³ pode mudar para status "Done" se todos os 6 checkboxes estiverem marcados
  - Se tentar marcar como Done sem todos os checkboxes, exibir erro: "Complete todos os itens do Definition of Done"
- [ ] Dashboard overview mostra % mÃ©dio de DoD de todas as features

**Notas TÃ©cnicas:**
- Usar colunas do DB:
  - `dod_functional` BOOLEAN
  - `dod_tests` BOOLEAN
  - `dod_code_review` BOOLEAN
  - `dod_documentation` BOOLEAN
  - `dod_deployed` BOOLEAN
  - `dod_user_acceptance` BOOLEAN
- API: `PATCH /api/features/:id/dod` (atualizar checkboxes)
- Componente: `DoD Checklist` (Shadcn/ui Checkbox)

**Prioridade:** P0 (CrÃ­tico)
**GUT:** G5 x U5 x T4 = **100**
**BV/W:** 10 / 3 = **3.33**
**Sprint:** Sprint-1
**ResponsÃ¡vel:** Pedro (Frontend) + Luis (Backend)
**Status:** Backlog
**Estimativa:** 3 dias

---

## US-004: GestÃ£o de Sprints

**Como** Scrum Master (Pedro)
**Eu quero** criar, visualizar e gerenciar sprints
**Para que** eu possa organizar o trabalho em iteraÃ§Ãµes de 2 semanas

**CritÃ©rios de AceitaÃ§Ã£o:**
- [ ] PÃ¡gina `/sprints` lista todos os sprints em cards:
  - Sprint Atual (destaque visual - cor verde)
  - Sprints Futuros (cor azul)
  - Sprints Passados (cor cinza, colapsados)
- [ ] Cada card de sprint mostra:
  - Code (Sprint-2025-W49)
  - Nome (Sprint Planning - Chatbot)
  - Datas (13/Jan - 24/Jan)
  - Status (Planned, Active, Completed)
  - Goal do sprint (texto)
  - Progresso (% de features concluÃ­das)
  - Velocity target vs actual (pontos)
- [ ] BotÃ£o "Novo Sprint" abre formulÃ¡rio:
  - Code (auto-gerado baseado em data)
  - Nome
  - Goal (textarea)
  - Start date (date picker)
  - End date (date picker, mÃ­nimo 7 dias apÃ³s start)
  - Capacity total (nÃºmero de story points disponÃ­veis)
  - Velocity target (pontos esperados)
- [ ] Ao clicar no sprint, vai para `/sprints/:id` com:
  - Features incluÃ­das neste sprint
  - Burndown chart (se sprint ativo)
  - BotÃ£o "Adicionar Feature ao Sprint"
- [ ] Drag & Drop para adicionar features ao sprint (opcional no MVP)

**Notas TÃ©cnicas:**
- API:
  - `GET /api/sprints`
  - `POST /api/sprints`
  - `GET /api/sprints/:id`
  - `PATCH /api/sprints/:id`
- Tabela: `sprints`
- ValidaÃ§Ã£o: end_date > start_date

**Prioridade:** P0 (CrÃ­tico)
**GUT:** G5 x U5 x T5 = **125**
**BV/W:** 9 / 4 = **2.25**
**Sprint:** Sprint-2
**ResponsÃ¡vel:** Pedro (Frontend) + Luis (Backend)
**Status:** Backlog
**Estimativa:** 4 dias

---

## US-005: AtribuiÃ§Ã£o de ResponsÃ¡veis e Prazos

**Como** Product Owner (Pedro)
**Eu quero** atribuir responsÃ¡veis e prazos para cada feature
**Para que** fique claro quem deve fazer o quÃª e atÃ© quando

**CritÃ©rios de AceitaÃ§Ã£o:**
- [ ] No formulÃ¡rio de feature, campo "ResponsÃ¡veis" permite multi-seleÃ§Ã£o:
  - Pedro
  - Luis
  - Arthur
  - Vitor
  - Lucas
- [ ] Campo "Prazo Estimado" (date picker)
- [ ] Na lista de features, mostrar avatar dos responsÃ¡veis + prazo
- [ ] Filtro por responsÃ¡vel funciona
- [ ] PÃ¡gina `/team` mostra:
  - Lista de membros da equipe
  - Para cada membro: foto, nome, papel, features atribuÃ­das (count)
  - Clicar no membro filtra features daquela pessoa
- [ ] Dashboard mostra "Features Atrasadas" (prazo < hoje e status != Done)

**Notas TÃ©cnicas:**
- Tabela `features` jÃ¡ tem:
  - `responsible` TEXT[] (array de nomes)
  - `due_date` DATE
- API:
  - `GET /api/team` (lista de membros)
  - `GET /api/features?responsible=Pedro` (filtrar)
- Componente: `AvatarGroup` (Shadcn/ui)

**Prioridade:** P0 (CrÃ­tico)
**GUT:** G5 x U5 x T4 = **100**
**BV/W:** 8 / 3 = **2.67**
**Sprint:** Sprint-2
**ResponsÃ¡vel:** Pedro (Frontend) + Luis (Backend)
**Status:** Backlog
**Estimativa:** 3 dias

---

## US-006: Timeline Visual (Gantt Simplificado)

**Como** Product Owner (Pedro)
**Eu quero** visualizar uma timeline das features com prazos
**Para que** eu possa ter uma visÃ£o temporal do roadmap

**CritÃ©rios de AceitaÃ§Ã£o:**
- [ ] PÃ¡gina `/timeline` exibe timeline visual
- [ ] Eixo X: tempo (meses)
- [ ] Eixo Y: features (uma barra por feature)
- [ ] Cada barra mostra:
  - Nome da feature
  - DuraÃ§Ã£o (start â†’ end date)
  - Cor baseada no status (verde = done, azul = in progress, cinza = backlog)
- [ ] Hover na barra mostra tooltip com detalhes
- [ ] Zoom in/out (opcional no MVP)
- [ ] Filtros: por versÃ£o, por responsÃ¡vel

**Notas TÃ©cnicas:**
- Biblioteca: `react-gantt-chart` ou custom com SVG
- API: `GET /api/features?include=dates` (retorna start_date, end_date)
- Alternativa simples: usar `recharts` com BarChart horizontal

**Prioridade:** P1 (Alto)
**GUT:** G4 x U4 x T4 = **64**
**BV/W:** 7 / 5 = **1.40**
**Sprint:** Sprint-2
**ResponsÃ¡vel:** Pedro (Frontend)
**Status:** Backlog
**Estimativa:** 4 dias

---

## US-007: GestÃ£o de Riscos BÃ¡sica

**Como** Product Owner (Pedro)
**Eu quero** registrar riscos do projeto e suas mitigaÃ§Ãµes
**Para que** eu possa antecipar problemas e ter planos de aÃ§Ã£o

**CritÃ©rios de AceitaÃ§Ã£o:**
- [ ] PÃ¡gina `/risks` lista riscos em tabela:
  - Colunas: ID, TÃ­tulo, GUT Score, Severidade, Status, Owner, AÃ§Ãµes
- [ ] BotÃ£o "Novo Risco" abre formulÃ¡rio:
  - TÃ­tulo
  - DescriÃ§Ã£o
  - Gravidade (1-5)
  - UrgÃªncia (1-5)
  - TendÃªncia (1-5)
  - GUT Score (calculado automaticamente: G x U x T)
  - Severidade (calculada: < 40 = Baixa, 40-80 = MÃ©dia, > 80 = Alta)
  - Status (Identified, Mitigating, Mitigated)
  - Plano de MitigaÃ§Ã£o (textarea)
  - Owner (select: Pedro, Luis, etc)
- [ ] OrdenaÃ§Ã£o padrÃ£o: GUT Score DESC (riscos crÃ­ticos primeiro)
- [ ] Dashboard overview mostra: "X riscos crÃ­ticos (GUT > 80)"

**Notas TÃ©cnicas:**
- API:
  - `GET /api/risks`
  - `POST /api/risks`
  - `PATCH /api/risks/:id`
- Tabela: `risks`
- ValidaÃ§Ã£o: GUT score recalculado no backend (GENERATED column)

**Prioridade:** P1 (Alto)
**GUT:** G4 x U4 x T3 = **48**
**BV/W:** 6 / 3 = **2.00**
**Sprint:** Sprint-3
**ResponsÃ¡vel:** Pedro (Frontend) + Luis (Backend)
**Status:** Backlog
**Estimativa:** 3 dias

---

## US-008: AutenticaÃ§Ã£o e Controle de Acesso

**Como** Administrador (Pedro)
**Eu quero** que apenas pessoas autorizadas acessem o sistema
**Para que** os dados do projeto fiquem seguros

**CritÃ©rios de AceitaÃ§Ã£o:**
- [ ] PÃ¡gina de login `/login` com:
  - Email
  - Password
  - BotÃ£o "Entrar"
  - Link "Esqueci minha senha"
- [ ] ApÃ³s login, redireciona para `/dashboard`
- [ ] Se nÃ£o autenticado, todas as rotas redirecionam para `/login`
- [ ] Supabase Auth configurado
- [ ] Middleware Next.js valida JWT em todas as pÃ¡ginas
- [ ] Logout funciona (botÃ£o no header)
- [ ] Signup inicial manual (Pedro cria usuÃ¡rios no Supabase diretamente)

**Notas TÃ©cnicas:**
- Supabase Auth (built-in)
- Middleware: `middleware.ts` (verificar token)
- NÃ£o precisa RBAC complexo no MVP (todos tÃªm acesso total)

**Prioridade:** P0 (CrÃ­tico)
**GUT:** G5 x U5 x T5 = **125**
**BV/W:** 8 / 2 = **4.00**
**Sprint:** Sprint-1 (deve ser primeira feature implementada)
**ResponsÃ¡vel:** Luis (Backend/Auth)
**Status:** Backlog
**Estimativa:** 2 dias

---

## 3. V1 - 10 USER STORIES AVANÃ‡ADAS

### 3.1 Analytics e MÃ©tricas

---

## US-010: Burndown Chart do Sprint

**Como** Scrum Master (Pedro)
**Eu quero** visualizar o burndown chart do sprint ativo
**Para que** eu possa acompanhar se estamos no ritmo certo

**CritÃ©rios de AceitaÃ§Ã£o:**
- [ ] Na pÃ¡gina do sprint (`/sprints/:id`), exibir grÃ¡fico de burndown
- [ ] Eixo X: dias do sprint (Day 1, Day 2, ..., Day N)
- [ ] Eixo Y: story points restantes
- [ ] 2 linhas no grÃ¡fico:
  - **Linha Ideal** (reta decrescente de total_points â†’ 0)
  - **Linha Real** (atualizada quando features mudam para "Done")
- [ ] Tooltip ao hover mostra:
  - Data
  - Pontos restantes
  - Pontos ideais
  - DiferenÃ§a (+ ou -)
- [ ] Indicador visual:
  - Verde: se abaixo da linha ideal (ahead)
  - Vermelho: se acima da linha ideal (behind)
- [ ] Atualiza em tempo real (Supabase Realtime)

**Notas TÃ©cnicas:**
- API: `GET /api/sprints/:id/burndown`
- Biblioteca: Recharts (LineChart)
- CÃ¡lculo:
  - Linha ideal: `y = total_points - (total_points / sprint_days) * day`
  - Linha real: queries de tasks concluÃ­das por dia

**Prioridade:** P1 (Alto)
**GUT:** G4 x U4 x T4 = **64**
**BV/W:** 8 / 4 = **2.00**
**Sprint:** Sprint-4
**ResponsÃ¡vel:** Pedro (Frontend) + Luis (Backend)
**Status:** Backlog
**Estimativa:** 4 dias

---

## US-011: Velocity Chart (HistÃ³rico)

**Como** Product Owner (Pedro)
**Eu quero** ver um grÃ¡fico de velocity dos Ãºltimos sprints
**Para que** eu possa melhorar estimativas futuras

**CritÃ©rios de AceitaÃ§Ã£o:**
- [ ] PÃ¡gina `/analytics` com seÃ§Ã£o "Velocity"
- [ ] GrÃ¡fico de barras verticais:
  - Eixo X: sprints (Sprint-W45, Sprint-W46, ...)
  - Eixo Y: story points completados
  - Barra azul: Velocity target (planejado)
  - Barra verde: Velocity actual (realizado)
- [ ] Linha horizontal com mÃ©dia de velocity
- [ ] Tooltip mostra: sprint name, target, actual, diferenÃ§a
- [ ] Filtro: Ãºltimos 3, 6 ou 12 sprints

**Notas TÃ©cnicas:**
- API: `GET /api/analytics/velocity?last=6`
- Biblioteca: Recharts (BarChart)

**Prioridade:** P1 (Alto)
**GUT:** G4 x U3 x T3 = **36**
**BV/W:** 7 / 3 = **2.33**
**Sprint:** Sprint-4
**ResponsÃ¡vel:** Pedro (Frontend) + Luis (Backend)
**Status:** Backlog
**Estimativa:** 3 dias

---

## US-012: Lead Time e Cycle Time

**Como** Process Improvement Lead (Pedro)
**Eu quero** medir Lead Time e Cycle Time das features
**Para que** eu possa identificar gargalos no processo

**CritÃ©rios de AceitaÃ§Ã£o:**
- [ ] Tabela `features` tem campos:
  - `created_at` (jÃ¡ existe)
  - `started_at` (quando status muda para "In Progress")
  - `completed_at` (quando status muda para "Done")
- [ ] Na pÃ¡gina `/analytics`:
  - **Lead Time** mÃ©dio = AVG(completed_at - created_at)
  - **Cycle Time** mÃ©dio = AVG(completed_at - started_at)
- [ ] Cards mostram:
  - "Lead Time MÃ©dio: 3.2 dias"
  - "Cycle Time MÃ©dio: 2.1 dias"
- [ ] Lista de features mostra Lead Time individual

**Notas TÃ©cnicas:**
- API: `GET /api/analytics/metrics`
- Trigger no DB para preencher `started_at` e `completed_at` automaticamente

**Prioridade:** P2 (MÃ©dio)
**GUT:** G3 x U3 x T3 = **27**
**BV/W:** 6 / 2 = **3.00**
**Sprint:** Sprint-5
**ResponsÃ¡vel:** Luis (Backend) + Pedro (Frontend)
**Status:** Backlog
**Estimativa:** 2 dias

---

## US-013: Project Health Score

**Como** Product Owner (Pedro)
**Eu quero** ver um "Health Score" agregado do projeto
**Para que** eu saiba rapidamente se estÃ¡ tudo ok ou se preciso intervir

**CritÃ©rios de AceitaÃ§Ã£o:**
- [ ] Dashboard overview mostra card "Project Health Score"
- [ ] Score de 0 a 100, calculado com base em:
  - **Velocity** (30%): Velocity real vs target (se >= 90% do target = 30pts)
  - **Budget** (20%): Gasto vs planejado (se <= 85% = 20pts)
  - **Deadlines** (30%): % de features entregues no prazo (se >= 80% = 30pts)
  - **Quality** (20%): % de features com DoD 100% completo (se >= 90% = 20pts)
- [ ] Cor do score:
  - Verde (80-100): SaudÃ¡vel âœ…
  - Amarelo (60-79): AtenÃ§Ã£o ðŸŸ¡
  - Vermelho (< 60): CrÃ­tico ðŸ”´
- [ ] Tooltip explica como o score Ã© calculado

**Notas TÃ©cnicas:**
- API: `GET /api/projects/:id/health`
- CÃ¡lculo no backend (PostgreSQL function ou API logic)

**Prioridade:** P1 (Alto)
**GUT:** G4 x U4 x T3 = **48**
**BV/W:** 8 / 3 = **2.67**
**Sprint:** Sprint-5
**ResponsÃ¡vel:** Luis (Backend) + Pedro (Frontend)
**Status:** Backlog
**Estimativa:** 3 dias

---

## US-014: ComentÃ¡rios em Features

**Como** Desenvolvedor (Luis/Pedro)
**Eu quero** adicionar comentÃ¡rios em features
**Para que** eu possa discutir detalhes de implementaÃ§Ã£o

**CritÃ©rios de AceitaÃ§Ã£o:**
- [ ] Na pÃ¡gina de detalhes da feature, seÃ§Ã£o "ComentÃ¡rios"
- [ ] Lista de comentÃ¡rios mostra:
  - Avatar do autor
  - Nome do autor
  - Timestamp (relativo: "hÃ¡ 2 horas")
  - Texto do comentÃ¡rio (Markdown support)
- [ ] Campo de texto para novo comentÃ¡rio (textarea)
- [ ] BotÃ£o "Enviar ComentÃ¡rio"
- [ ] ComentÃ¡rios ordenados: mais recentes primeiro
- [ ] NotificaÃ§Ã£o: quando alguÃ©m comenta, responsÃ¡veis recebem email (opcional no MVP)

**Notas TÃ©cnicas:**
- Tabela: `feature_comments`
  - `id`, `feature_id`, `user_id`, `content`, `created_at`
- API:
  - `GET /api/features/:id/comments`
  - `POST /api/features/:id/comments`
- Usar Tiptap (rich text editor) ou textarea simples

**Prioridade:** P2 (MÃ©dio)
**GUT:** G3 x U3 x T2 = **18**
**BV/W:** 5 / 3 = **1.67**
**Sprint:** Sprint-5
**ResponsÃ¡vel:** Luis (Backend) + Pedro (Frontend)
**Status:** Backlog
**Estimativa:** 3 dias

---

## US-015: Export de RelatÃ³rios (CSV)

**Como** Product Owner (Pedro)
**Eu quero** exportar lista de features em CSV
**Para que** eu possa compartilhar com stakeholders externos

**CritÃ©rios de AceitaÃ§Ã£o:**
- [ ] Na pÃ¡gina `/features`, botÃ£o "Exportar CSV"
- [ ] Ao clicar, baixa arquivo `features-2025-12-03.csv`
- [ ] CSV contÃ©m colunas:
  - Code, Nome, Categoria, VersÃ£o, Status, Prioridade, ResponsÃ¡veis, Prazo, DoD %
- [ ] Respeita filtros ativos (se filtrou por "MVP", exporta sÃ³ MVP)

**Notas TÃ©cnicas:**
- API: `GET /api/features/export?format=csv`
- Biblioteca: `json2csv` (Node.js)
- Alternativa: gerar CSV no frontend com `papaparse`

**Prioridade:** P2 (MÃ©dio)
**GUT:** G3 x U2 x T2 = **12**
**BV/W:** 4 / 2 = **2.00**
**Sprint:** Sprint-6
**ResponsÃ¡vel:** Luis (Backend)
**Status:** Backlog
**Estimativa:** 2 dias

---

## US-016: Tags/Labels para Features

**Como** Product Owner (Pedro)
**Eu quero** adicionar tags Ã s features (ex: "urgent", "bug", "enhancement")
**Para que** eu possa categorizar e filtrar de forma flexÃ­vel

**CritÃ©rios de AceitaÃ§Ã£o:**
- [ ] Na pÃ¡gina de detalhes da feature, campo "Tags"
- [ ] Adicionar tags digitando e pressionando Enter
- [ ] Tags aparecem como badges coloridos
- [ ] Remover tag clicando no "X"
- [ ] Filtro por tag na lista de features
- [ ] Dashboard mostra "Features urgentes" (tag:urgent)

**Notas TÃ©cnicas:**
- Tabela: `tags` (id, name, color)
- Tabela: `feature_tags` (feature_id, tag_id)
- API: `GET /api/tags`, `POST /api/features/:id/tags`

**Prioridade:** P2 (MÃ©dio)
**GUT:** G3 x U2 x T2 = **12**
**BV/W:** 5 / 3 = **1.67**
**Sprint:** Sprint-6
**ResponsÃ¡vel:** Luis (Backend) + Pedro (Frontend)
**Status:** Backlog
**Estimativa:** 3 dias

---

## US-017: HistÃ³rico de MudanÃ§as (Audit Log)

**Como** Product Owner (Pedro)
**Eu quero** ver histÃ³rico de mudanÃ§as em cada feature
**Para que** eu saiba quem mudou o quÃª e quando

**CritÃ©rios de AceitaÃ§Ã£o:**
- [ ] Na pÃ¡gina de detalhes da feature, seÃ§Ã£o "HistÃ³rico"
- [ ] Lista cronolÃ³gica de mudanÃ§as:
  - "Pedro alterou Status de 'In Progress' para 'Done' - hÃ¡ 2 horas"
  - "Luis adicionou tag 'urgent' - hÃ¡ 1 dia"
  - "Pedro marcou DoD 'Deployed' como concluÃ­do - hÃ¡ 3 dias"
- [ ] PaginaÃ§Ã£o (10 itens por pÃ¡gina)

**Notas TÃ©cnicas:**
- Tabela: `feature_changes`
  - `id`, `feature_id`, `user_id`, `field_changed`, `old_value`, `new_value`, `changed_at`
- Trigger no DB para preencher automaticamente ao UPDATE
- API: `GET /api/features/:id/history`

**Prioridade:** P2 (MÃ©dio)
**GUT:** G3 x U2 x T2 = **12**
**BV/W:** 4 / 3 = **1.33**
**Sprint:** Sprint-6
**ResponsÃ¡vel:** Luis (Backend) + Pedro (Frontend)
**Status:** Backlog
**Estimativa:** 3 dias

---

## US-018: NotificaÃ§Ãµes por Email

**Como** ResponsÃ¡vel por uma feature (Luis/Pedro/Arthur/Vitor)
**Eu quero** receber email quando houver mudanÃ§as na minha feature
**Para que** eu fique sempre atualizado sem ter que abrir o sistema

**CritÃ©rios de AceitaÃ§Ã£o:**
- [ ] Quando feature muda de status, envia email para responsÃ¡veis
- [ ] Quando alguÃ©m comenta em feature que estou alocado, recebo email
- [ ] Quando prazo estÃ¡ prÃ³ximo (3 dias antes), recebo email de lembrete
- [ ] Email tem link direto para a feature
- [ ] ConfiguraÃ§Ã£o: cada user pode ligar/desligar notificaÃ§Ãµes

**Notas TÃ©cnicas:**
- Usar Resend (transactional emails)
- Templates de email (HTML simples)
- Queue de emails (opcional: usar Supabase Edge Functions)

**Prioridade:** P3 (Baixo - Nice to have)
**GUT:** G2 x U2 x T2 = **8**
**BV/W:** 3 / 4 = **0.75**
**Sprint:** Sprint-7 (se houver tempo)
**ResponsÃ¡vel:** Luis (Backend)
**Status:** Backlog
**Estimativa:** 4 dias

---

## US-019: Mobile Responsivo

**Como** UsuÃ¡rio mobile (Pedro/Luis)
**Eu quero** acessar o sistema do celular com boa usabilidade
**Para que** eu possa checar status mesmo fora do escritÃ³rio

**CritÃ©rios de AceitaÃ§Ã£o:**
- [ ] Todas as pÃ¡ginas responsivas (breakpoints: mobile, tablet, desktop)
- [ ] Menu lateral vira hamburger menu no mobile
- [ ] Tabelas viram cards empilhados no mobile
- [ ] GrÃ¡ficos sÃ£o touch-friendly
- [ ] Testado em iOS Safari e Android Chrome

**Notas TÃ©cnicas:**
- Tailwind responsive classes (`sm:`, `md:`, `lg:`)
- Shadcn/ui jÃ¡ Ã© responsivo por padrÃ£o
- Testar com Chrome DevTools (mobile emulation)

**Prioridade:** P1 (Alto)
**GUT:** G4 x U3 x T3 = **36**
**BV/W:** 7 / 2 = **3.50**
**Sprint:** Sprint-5 (dev paralelo durante implementaÃ§Ã£o)
**ResponsÃ¡vel:** Pedro (Frontend)
**Status:** Backlog
**Estimativa:** 2 dias (testing + ajustes)

---

## 4. V2 - 6 USER STORIES CLIENTES

### 4.1 GestÃ£o de Clientes do UzzApp

*(Estas user stories sÃ£o para quando o UzzApp comeÃ§ar a ter clientes reais)*

---

## US-030: DiretÃ³rio de Clientes UzzApp

**Como** Sales Manager (Vitor)
**Eu quero** visualizar lista de todos os clientes do UzzApp
**Para que** eu possa acompanhar o pipeline de vendas

**CritÃ©rios de AceitaÃ§Ã£o:**
- [ ] PÃ¡gina `/clients` lista clientes em cards/tabela:
  - Logo do cliente (opcional)
  - Nome da empresa
  - Status (Trial, Active, Churned)
  - Data de onboarding
  - NÃºmero de conversas/mÃªs
  - CSAT score mÃ©dio
- [ ] Filtros: por status, por data de onboarding
- [ ] Busca por nome
- [ ] BotÃ£o "Novo Cliente"

**Prioridade:** P1 (Alto - para V2)
**Sprint:** Sprint-8
**ResponsÃ¡vel:** Vitor (Vendas) + Pedro (Frontend) + Luis (Backend)
**Status:** Backlog (V2)
**Estimativa:** 3 dias

---

## US-031: Onboarding de Cliente (Wizard)

**Como** Sales Manager (Vitor)
**Eu quero** onboardar novos clientes via wizard de 4 etapas
**Para que** o processo seja rÃ¡pido e padronizado

**CritÃ©rios de AceitaÃ§Ã£o:**
- [ ] Wizard de 4 steps:
  1. **InformaÃ§Ãµes BÃ¡sicas:** Nome, CNPJ, Email, Telefone
  2. **ConfiguraÃ§Ã£o WhatsApp:** WhatsApp Business ID, NÃºmero
  3. **Upload de Documentos:** Arrastar PDFs para RAG
  4. **CatÃ¡logo Inicial:** Importar CSV de produtos
- [ ] BotÃµes: "Anterior", "PrÃ³ximo", "Finalizar"
- [ ] ValidaÃ§Ã£o em cada step
- [ ] Ao finalizar, cria cliente no DB + envia email de boas-vindas

**Prioridade:** P0 (CrÃ­tico - para V2)
**Sprint:** Sprint-8
**ResponsÃ¡vel:** Vitor (Vendas/EspecificaÃ§Ã£o) + Pedro (Frontend) + Luis (Backend)
**Status:** Backlog (V2)
**Estimativa:** 5 dias

---

## US-032: GestÃ£o de CatÃ¡logo do Cliente

**Como** Cliente do UzzApp (Umana, Colavoro)
**Eu quero** adicionar/editar/deletar produtos do meu catÃ¡logo
**Para que** o chatbot possa consultar e vender meus produtos

**CritÃ©rios de AceitaÃ§Ã£o:**
- [ ] Na pÃ¡gina do cliente (`/clients/:id/catalog`), tabela de produtos:
  - Code, Nome, DescriÃ§Ã£o, PreÃ§o, Imagem, Status
- [ ] CRUD completo de produtos
- [ ] Import CSV em massa (upload de arquivo)
- [ ] Export CSV
- [ ] Busca e filtros

**Prioridade:** P0 (CrÃ­tico - para V2)
**Sprint:** Sprint-9
**ResponsÃ¡vel:** Arthur (Marketing/Copy) + Pedro (Frontend) + Luis (Backend)
**Status:** Backlog (V2)
**Estimativa:** 4 dias

---

## US-033: Upload de Documentos para RAG

**Como** Cliente do UzzApp
**Eu quero** fazer upload de PDFs para a base de conhecimento
**Para que** o chatbot possa responder perguntas baseadas nesses docs

**CritÃ©rios de AceitaÃ§Ã£o:**
- [ ] PÃ¡gina `/clients/:id/knowledge-base` com Ã¡rea de upload
- [ ] Drag & drop de arquivos (PDF, TXT, MD)
- [ ] Lista de documentos uploadados:
  - Nome do arquivo, Data de upload, Status (Indexado / Processando)
- [ ] Deletar documento
- [ ] Indicador de progresso: "87 documentos indexados"

**Prioridade:** P0 (CrÃ­tico - para V2)
**Sprint:** Sprint-9
**ResponsÃ¡vel:** Luis (Backend/Infra) + Pedro (Frontend)
**Status:** Backlog (V2)
**Estimativa:** 5 dias

---

## US-034: Analytics por Cliente

**Como** Sales Manager (Vitor)
**Eu quero** ver mÃ©tricas de uso de cada cliente
**Para que** eu possa identificar clientes em risco de churn

**CritÃ©rios de AceitaÃ§Ã£o:**
- [ ] Na pÃ¡gina do cliente, aba "Analytics"
- [ ] Cards de KPIs:
  - Total de conversas (mÃªs atual)
  - Taxa de resoluÃ§Ã£o (%)
  - CSAT Score mÃ©dio (1-5)
  - RAG Hit Rate (% de queries resolvidas via docs)
- [ ] GrÃ¡fico de conversas por dia (Ãºltimos 30 dias)
- [ ] GrÃ¡fico de satisfaÃ§Ã£o ao longo do tempo

**Prioridade:** P1 (Alto - para V2)
**Sprint:** Sprint-10
**ResponsÃ¡vel:** Vitor (Vendas/AnÃ¡lise) + Pedro (Frontend) + Luis (Backend)
**Status:** Backlog (V2)
**Estimativa:** 4 dias

---

## US-035: ConfiguraÃ§Ã£o de Fluxos Conversacionais

**Como** Cliente do UzzApp (Admin)
**Eu quero** criar/editar fluxos conversacionais do chatbot
**Para que** eu possa customizar as respostas sem precisar de dev

**CritÃ©rios de AceitaÃ§Ã£o:**
- [ ] PÃ¡gina `/clients/:id/flows` com editor visual de fluxos
- [ ] Drag & drop de nÃ³s:
  - NÃ³ "Mensagem" (envia texto)
  - NÃ³ "Pergunta" (espera resposta do usuÃ¡rio)
  - NÃ³ "CondiÃ§Ã£o" (if/else)
  - NÃ³ "API Call" (chama API externa)
- [ ] Conectar nÃ³s com linhas
- [ ] Testar fluxo (preview)
- [ ] Publicar fluxo

**Prioridade:** P2 (MÃ©dio - para V2)
**Sprint:** Sprint-10
**ResponsÃ¡vel:** Arthur (Marketing/Copy) + Pedro (Frontend) + Luis (Backend)
**Status:** Backlog (V2)
**Estimativa:** 8 dias (complexo)

---

## 5. PRIORIZAÃ‡ÃƒO GUT

### 5.1 Ranking por GUT Score

| Rank | US ID | User Story | GUT | Prioridade | Sprint |
|------|-------|------------|-----|------------|--------|
| 1 | US-001 | Dashboard Overview | 125 | P0 | Sprint-1 |
| 1 | US-002 | GestÃ£o de Features | 125 | P0 | Sprint-1 |
| 1 | US-004 | GestÃ£o de Sprints | 125 | P0 | Sprint-2 |
| 1 | US-008 | AutenticaÃ§Ã£o | 125 | P0 | Sprint-1 |
| 5 | US-003 | Definition of Done Tracker | 100 | P0 | Sprint-1 |
| 5 | US-005 | AtribuiÃ§Ã£o de ResponsÃ¡veis | 100 | P0 | Sprint-2 |
| 7 | US-006 | Timeline Visual | 64 | P1 | Sprint-2 |
| 7 | US-010 | Burndown Chart | 64 | P1 | Sprint-4 |
| 9 | US-007 | GestÃ£o de Riscos | 48 | P1 | Sprint-3 |
| 9 | US-013 | Project Health Score | 48 | P1 | Sprint-5 |

### 5.2 MVP Final (8 User Stories)

**Sprint 1 (Semana 1-2):**
- US-008: AutenticaÃ§Ã£o (2 dias)
- US-001: Dashboard Overview (3 dias)
- US-002: GestÃ£o de Features (5 dias)

**Sprint 2 (Semana 3-4):**
- US-003: Definition of Done Tracker (3 dias)
- US-004: GestÃ£o de Sprints (4 dias)
- US-005: AtribuiÃ§Ã£o de ResponsÃ¡veis (3 dias)

**Sprint 3 (Semana 5-6):**
- US-006: Timeline Visual (4 dias)
- US-007: GestÃ£o de Riscos (3 dias)
- Testes E2E + Deploy MVP (3 dias)

---

## 6. BACKLOG BOARD

### 6.1 Status das User Stories

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                        BACKLOG BOARD                             â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                   â”‚
â”‚  ðŸ“‹ BACKLOG (24 stories)                                         â”‚
â”‚  â”œâ”€ MVP (8 stories)                                              â”‚
â”‚  â”‚  â”œâ”€ US-001: Dashboard Overview [GUT 125]                     â”‚
â”‚  â”‚  â”œâ”€ US-002: GestÃ£o de Features [GUT 125]                     â”‚
â”‚  â”‚  â”œâ”€ US-003: DoD Tracker [GUT 100]                            â”‚
â”‚  â”‚  â”œâ”€ US-004: GestÃ£o de Sprints [GUT 125]                      â”‚
â”‚  â”‚  â”œâ”€ US-005: ResponsÃ¡veis [GUT 100]                           â”‚
â”‚  â”‚  â”œâ”€ US-006: Timeline [GUT 64]                                â”‚
â”‚  â”‚  â”œâ”€ US-007: Riscos [GUT 48]                                  â”‚
â”‚  â”‚  â””â”€ US-008: AutenticaÃ§Ã£o [GUT 125]                           â”‚
â”‚  â”œâ”€ V1 (10 stories)                                              â”‚
â”‚  â”‚  â”œâ”€ US-010: Burndown [GUT 64]                                â”‚
â”‚  â”‚  â”œâ”€ US-011: Velocity Chart [GUT 36]                          â”‚
â”‚  â”‚  â”œâ”€ US-012: Lead/Cycle Time [GUT 27]                         â”‚
â”‚  â”‚  â”œâ”€ US-013: Health Score [GUT 48]                            â”‚
â”‚  â”‚  â”œâ”€ US-014: ComentÃ¡rios [GUT 18]                             â”‚
â”‚  â”‚  â”œâ”€ US-015: Export CSV [GUT 12]                              â”‚
â”‚  â”‚  â”œâ”€ US-016: Tags [GUT 12]                                    â”‚
â”‚  â”‚  â”œâ”€ US-017: Audit Log [GUT 12]                               â”‚
â”‚  â”‚  â”œâ”€ US-018: NotificaÃ§Ãµes [GUT 8]                             â”‚
â”‚  â”‚  â””â”€ US-019: Mobile Responsivo [GUT 36]                       â”‚
â”‚  â””â”€ V2 (6 stories)                                               â”‚
â”‚     â”œâ”€ US-030: DiretÃ³rio Clientes                               â”‚
â”‚     â”œâ”€ US-031: Onboarding Wizard                                â”‚
â”‚     â”œâ”€ US-032: CatÃ¡logo                                         â”‚
â”‚     â”œâ”€ US-033: Upload Docs                                      â”‚
â”‚     â”œâ”€ US-034: Analytics Cliente                                â”‚
â”‚     â””â”€ US-035: Fluxos Conversacionais                           â”‚
â”‚                                                                   â”‚
â”‚  ðŸ“ TODO (0 stories)                                             â”‚
â”‚                                                                   â”‚
â”‚  ðŸš§ IN PROGRESS (0 stories)                                      â”‚
â”‚                                                                   â”‚
â”‚  âœ… DONE (0 stories)                                             â”‚
â”‚                                                                   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 6.2 PrÃ³ximas AÃ§Ãµes

**Antes do Sprint 1:**
1. âœ… Aprovar este backlog
2. âœ… Criar projeto no GitHub
3. âœ… Setup Supabase
4. âœ… Sprint Planning do Sprint 1
5. âœ… Quebrar US-001, US-002, US-008 em subtasks

**Durante Sprint 1:**
- Daily standup 9h
- Mover stories de Backlog â†’ Todo â†’ In Progress â†’ Done
- Code review obrigatÃ³rio
- Testar cada feature antes de marcar como Done

---

## ðŸ“Š RESUMO DO BACKLOG

**Total de User Stories:** 24
- **MVP:** 8 stories (Sprint 1-3)
- **V1:** 10 stories (Sprint 4-7)
- **V2:** 6 stories (Sprint 8-10)

**EsforÃ§o Estimado:**
- **MVP:** 28 dias (6 semanas com 2 devs)
- **V1:** 26 dias (4 semanas)
- **V2:** 29 dias (6 semanas)
- **TOTAL:** 83 dias (~16 semanas)

**GUT Score MÃ©dio:** 65 (Alta prioridade geral)

**Business Value / Work Ratio MÃ©dio:** 2.1 (Bom ROI)

---

**Autor:** Pedro Vitor Pagliarin + Claude AI
**Data:** 2026-02-06
**VersÃ£o:** 1.0.0
**Status:** âœ… Pronto para Sprint Planning

---

*"Think Smart, Think Uzz.Ai"*

