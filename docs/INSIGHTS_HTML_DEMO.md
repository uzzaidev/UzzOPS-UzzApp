# 🎯 INSIGHTS DO HTML DEMO - FEATURES NÃO MAPEADAS
## Análise Completa do ERP-UzzAI-Complete-Demo.html

**Data:** 2026-02-07
**Fonte:** `scrum/ERP-UzzAI-Complete-Demo.html`
**Status:** 30+ features identificadas para implementação futura

---

## 📋 SUMÁRIO EXECUTIVO

Após análise completa do HTML demo (2000+ linhas), identifiquei **30+ features e conceitos** ainda não mapeados nos Sprints 3-6, organizados em **7 categorias**:

1. **Priorização Avançada** (2 features)
2. **Gestão de Pessoas & Capacidade** (5 features)
3. **Feedback & Aprendizado** (3 features)
4. **Gestão de Projeto Completa** (8 features)
5. **Cerimônias Scrum** (4 views específicas)
6. **UX & Navegação** (5 melhorias)
7. **Analytics & Visualização** (3 features)

---

## 🚨 FEATURES CRÍTICAS (ALTA PRIORIDADE)

### 1. ⚠️ Feedback de Execução Obrigatório

**O que é:**
Modal obrigatório que aparece quando uma task estoura **>20% do tempo previsto**. Não permite concluir a task sem preencher feedback de aprendizado.

**Campos obrigatórios (mínimo 50 caracteres cada):**
1. "O que aconteceu?" - Descrever problemas, bloqueios, dificuldades
2. "Como evitar?" - Ações preventivas e melhorias de processo

**Por que é crítico:**
- **Cria cultura de melhoria contínua**
- **Captura conhecimento** antes que seja perdido
- **Previne recorrência** de problemas
- **Melhora estimativas** futuras

**Exemplo real (do HTML):**
```
PROJETO DEMO: "Construir Deck de Madeira"

Task: "Comprar material (madeira, parafusos, verniz)"
Previsto: 16h | Realizado: 32h (+100% 🔴)

Feedback obrigatório:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
O QUE ACONTECEU?
Fornecedor principal estava sem estoque de madeira tratada.
Tivemos que procurar 3 outros fornecedores, o que atrasou a
entrega. Além disso, preço estava 40% acima do orçado.

COMO EVITAR?
1) Manter lista de 3 fornecedores homologados
2) Fazer cotação com 15 dias de antecedência
3) Adicionar buffer de 30% no orçamento de materiais
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Implementação:**
- Tabela: `task_execution_feedback`
- Trigger: Auto-abrir modal quando `time_actual > time_estimate * 1.2`
- Validação: Mínimo 50 caracteres por campo
- Integração: Retrospectives (agregar feedbacks do sprint)

**BV/W:** 21/3 = 7.0 (ALTÍSSIMO!)
**Sprint recomendado:** Sprint 7 (Qualidade Avançada)

---

### 2. 📊 Matriz GUT (Gravidade × Urgência × Tendência)

**O que é:**
Sistema de priorização **complementar ao BV/W**, usado para avaliar a criticidade de uma task/bug/risco.

**Fórmula:**
```
Score GUT = G × U × T

Onde:
- G (Gravidade): 1-5 (impacto se não resolver)
- U (Urgência): 1-5 (tempo disponível para resolver)
- T (Tendência): 1-5 (velocidade de piora)

Score máximo: 125
Score mínimo: 1
```

**Escalas detalhadas:**

**Gravidade (G):**
- 1 = Sem gravidade
- 2 = Pouco grave
- 3 = Grave
- 4 = Muito grave
- 5 = Extremamente grave

**Urgência (U):**
- 1 = Pode esperar
- 2 = Pouco urgente
- 3 = Urgente
- 4 = Muito urgente
- 5 = Precisa ação imediata

**Tendência (T):**
- 1 = Não vai piorar
- 2 = Vai piorar longo prazo
- 3 = Vai piorar médio prazo
- 4 = Vai piorar curto prazo
- 5 = Vai piorar rapidamente

**Quando usar:**
- **Bugs críticos** (alta gravidade + urgência)
- **Riscos** (alta tendência de piora)
- **Technical Debt** (baixa urgência mas alta tendência)
- **Priorização em crises** (quando tudo é "P0")

**Diferença de BV/W:**
- **BV/W:** Prioriza valor de negócio (features)
- **GUT:** Prioriza risco e urgência (bugs, débitos, bloqueios)

**Implementação:**
- Campos: `gut_gravidade`, `gut_urgencia`, `gut_tendencia`, `gut_score`
- Computed: `gut_score = G * U * T`
- Index: Por `gut_score DESC` (ordenação)
- View: Combinar com `priority` e `bv_w_ratio`

**BV/W:** 13/3 = 4.33 (ALTO)
**Sprint recomendado:** Sprint 4 (junto com Planning Poker)

---

### 3. 🎯 Capacity Planning (Gestão de Alocação)

**O que é:**
Sistema de **gestão de capacidade da equipe**, mostrando alocação por pessoa e por projeto.

**Conceitos-chave:**

**1. Allocation Tracking:**
```javascript
{
  member: "Pedro Vitor",
  allocations: [
    { project: "CHATBOT", percentage: 50, hours: 20 },
    { project: "SITE-BUILDER", percentage: 40, hours: 16 },
    { project: "NUTRITRAIN", percentage: 20, hours: 8 }
  ],
  totalAllocation: 110% // 🔴 OVERALLOCATED!
}
```

**2. Status automático:**
- **Available** (<75%): Verde - Pode pegar mais tasks
- **Full** (75-100%): Amarelo - Capacidade OK
- **Overallocated** (>100%): Vermelho - Sobrecarregado ⚠️

**3. Alertas automáticos:**
```
🔴 ALERTA: 1 pessoa sobrecarregada
@PedroV com 110% alocação
```

**4. Dashboard de Capacidade:**
- Overallocated: 1 pessoa
- Full Capacity: 1 pessoa
- Available: 2 pessoas

**Por que é crítico:**
- **Previne burnout** (detecta sobrecarga)
- **Balanceia carga** de trabalho
- **Planejamento realista** de sprints
- **Visibilidade** para PO/SM

**Implementação:**
- Tabela: `team_member_allocations`
- Campos: `member_id`, `project_id`, `allocation_percentage`, `hours_per_week`
- View: `team_capacity_summary`
- Function: `calculate_member_allocation(member_id)`
- Alerta: Quando `total_allocation > 100%`

**Diferencial:**
- Integra com **velocity individual**
- Sugere **redistribuição** de tasks
- Prevê **sprint capacity** (soma velocity de membros alocados)

**BV/W:** 13/5 = 2.60 (ALTO)
**Sprint recomendado:** Sprint 7

---

## 📊 CATEGORIA 1: PRIORIZAÇÃO AVANÇADA

### US-7.1: Matriz GUT (já detalhada acima)

**Story Points:** 3 pts
**BV/W:** 4.33

---

### US-7.2: Priorização Multicritério

**O que é:**
Combinar **GUT + BV/W + Priority** em uma **matriz de decisão unificada**.

**Dashboard de Priorização:**
```
┌────────────────────────────────────────────────────────────┐
│ TASK #123: Implementar Burndown Chart                     │
├────────────────────────────────────────────────────────────┤
│ Priority: P0 (Crítico)                                     │
│ BV/W: 8/3 = 2.67 (Alto valor, baixo esforço)             │
│ GUT: 5×5×5 = 125 (Máxima urgência)                       │
│                                                            │
│ ┌──────────────┐                                          │
│ │ SCORE FINAL  │                                          │
│ │     9.8      │ ← Algoritmo ponderado                    │
│ │   /10        │                                          │
│ └──────────────┘                                          │
│                                                            │
│ 📌 RECOMENDAÇÃO: FAZER AGORA (Top 1% das tasks)          │
└────────────────────────────────────────────────────────────┘
```

**Algoritmo sugerido:**
```typescript
function calculateFinalScore(task) {
  const priorityWeight = {
    P0: 4,
    P1: 3,
    P2: 2,
    P3: 1
  };

  const bvwScore = (task.business_value / task.work_effort) * 2; // 0-16
  const gutScore = (task.gut_score / 125) * 5; // 0-5 (normalizado)
  const priorityScore = priorityWeight[task.priority]; // 1-4

  // Média ponderada
  return (bvwScore * 0.4 + gutScore * 0.3 + priorityScore * 0.3).toFixed(1);
}
```

**Visualização:**
- Scatter plot: BV/W (eixo X) vs GUT (eixo Y)
- Quadrantes:
  - **Top-Right:** Quick Wins + Crítico (FAZER PRIMEIRO)
  - **Top-Left:** Baixo valor mas urgente (DELEGAR)
  - **Bottom-Right:** Alto valor mas pode esperar (PLANEJAR)
  - **Bottom-Left:** Baixo valor e não urgente (DELETAR?)

**BV/W:** 8/2 = 4.0 (ALTO)
**Sprint recomendado:** Sprint 7

---

## 👥 CATEGORIA 2: GESTÃO DE PESSOAS & CAPACIDADE

### US-7.3: Capacity Planning (já detalhada acima)

**Story Points:** 5 pts
**BV/W:** 2.60

---

### US-7.4: Skills Matrix

**O que é:**
Matriz de **skills por membro da equipe** + **skill gap analysis**.

**Estrutura:**
```javascript
{
  member: "Pedro Vitor",
  skills: [
    { name: "React", level: "expert", yearsExperience: 5 },
    { name: "TypeScript", level: "advanced", yearsExperience: 4 },
    { name: "Python", level: "intermediate", yearsExperience: 2 },
    { name: "AWS", level: "basic", yearsExperience: 1 }
  ],
  wantsToLearn: ["Rust", "GraphQL"],
  canMentor: ["React", "TypeScript"]
}
```

**Níveis:**
- **Basic** (0-1 ano)
- **Intermediate** (1-3 anos)
- **Advanced** (3-5 anos)
- **Expert** (5+ anos)

**Features:**
1. **Skill Gap Detection:**
   - "Projeto X precisa de Rust, mas ninguém sabe"
   - "Contratar ou treinar?"

2. **Mentorship Matching:**
   - "Pedro pode mentorar Maria em React"

3. **Task Assignment Inteligente:**
   - "Esta task precisa de TypeScript expert → Sugerir @Pedro"

4. **Career Path:**
   - "Maria quer aprender Figma → Alocar em tasks de UI/UX"

**Implementação:**
- Tabela: `team_member_skills`
- View: `skill_matrix_summary`
- Function: `find_experts_for_skill(skill_name)`
- Function: `detect_skill_gaps(project_id)`

**BV/W:** 8/3 = 2.67 (ALTO)
**Sprint recomendado:** Sprint 8

---

### US-7.5: Velocity Individual

**O que é:**
Tracking de **velocity por pessoa** (não só por time).

**Métricas:**
```
Pedro Vitor: 16 pts/sprint (Senior)
Luis Boff: 14 pts/sprint (Senior)
Vitinho: 8 pts/sprint (Junior)
Maria Silva: 0 pts/sprint (Designer, não estima em pontos)
```

**Uso:**
1. **Sprint Planning:**
   - "Temos Pedro (16) + Luis (14) = 30 pts de capacidade"

2. **Performance Review:**
   - "Vitinho evoluiu de 5 para 8 pts/sprint (+60%)"

3. **Hiring:**
   - "Precisamos contratar 1 Senior (16 pts) ou 2 Juniors (8+8 pts)?"

4. **Redistribuição:**
   - "Pedro está overallocated, passar 5 pts para Luis"

**Cuidados:**
- ⚠️ **NÃO usar para ranking** (gamification ruim)
- ⚠️ **NÃO comparar Junior com Senior** (contextos diferentes)
- ✅ **Usar para planejamento** de capacidade
- ✅ **Usar para crescimento** pessoal (progressão)

**Implementação:**
- Computed field em `team_members`
- Function: `calculate_member_velocity(member_id, last_n_sprints)`
- View: `team_velocity_breakdown`

**BV/W:** 5/2 = 2.50 (MÉDIO)
**Sprint recomendado:** Sprint 7

---

### US-7.6: Seniority & Roles

**O que é:**
Sistema de **seniority levels** e **roles granulares**.

**Seniority Levels:**
- **Trainee** (0-6 meses)
- **Junior** (6 meses - 2 anos)
- **Pleno** (2-5 anos)
- **Senior** (5-8 anos)
- **Staff** (8-12 anos)
- **Principal** (12+ anos)

**Roles (Tech):**
- **Frontend Developer**
- **Backend Developer**
- **Full-Stack Developer**
- **DevOps Engineer**
- **QA Engineer**
- **UI/UX Designer**
- **Product Manager**
- **Tech Lead**
- **Architect**

**Tenant Roles (Permissões):**
- **Member:** Read-only (pode ver tudo, editar apenas suas tasks)
- **Admin:** CRUD completo (pode editar tudo)
- **Manager:** CRUD + Analytics + Reports (pode ver métricas sensíveis)
- **Owner:** God mode (pode deletar projeto, remover membros)

**Uso:**
1. **Filtros:**
   - "Ver apenas Seniors disponíveis"

2. **Hiring:**
   - "Precisamos de 1 Pleno Frontend"

3. **Permissões:**
   - "Apenas Managers podem ver Budget"

4. **Salary Bands:**
   - Junior: R$ 4k-6k
   - Pleno: R$ 6k-10k
   - Senior: R$ 10k-16k

**Implementação:**
- Enum: `seniority_level` (trainee, junior, pleno, senior, staff, principal)
- Enum: `role` (frontend, backend, fullstack, devops, qa, designer, pm, techlead, architect)
- Enum: `tenant_role` (member, admin, manager, owner)
- RLS: Baseado em `tenant_role`

**BV/W:** 3/1 = 3.0 (ALTO para compliance)
**Sprint recomendado:** Sprint 8

---

### US-7.7: Team Allocations Management

**O que é:**
Interface para **alocar/desalocar membros em projetos**.

**Funcionalidades:**
1. **Drag & Drop:**
   - Arrastar membro para projeto
   - Definir % de alocação

2. **Visual de Alocação:**
   ```
   Pedro Vitor (110% - OVERALLOCATED ⚠️)
   ┌────────────────────────────────────────────────────────┐
   │ CHATBOT        [████████████] 50% (20h/sem)           │
   │ SITE-BUILDER   [████████] 40% (16h/sem)               │
   │ NUTRITRAIN     [████] 20% (8h/sem)                     │
   └────────────────────────────────────────────────────────┘
   ```

3. **Sugestões:**
   - "⚠️ Pedro está sobrecarregado. Sugestão: Passar SITE-BUILDER para Luis?"

4. **Timeline:**
   - "Pedro estará disponível 40h/sem após 15/02 (fim do CHATBOT)"

**Implementação:**
- Modal: `AllocateMemberModal`
- Componente: `AllocationBar` (visual)
- Drag & Drop: `react-beautiful-dnd`
- Validação: `total_allocation <= 100%` (warning se > 100%)

**BV/W:** 8/3 = 2.67 (ALTO)
**Sprint recomendado:** Sprint 7

---

## 📝 CATEGORIA 3: FEEDBACK & APRENDIZADO

### US-7.8: Feedback de Execução Obrigatório (já detalhada acima)

**Story Points:** 3 pts
**BV/W:** 7.0 (ALTÍSSIMO!)

---

### US-7.9: Lessons Learned Database

**O que é:**
**Base de conhecimento** de lições aprendidas, indexável e pesquisável.

**Estrutura:**
```javascript
{
  id: "LESSON-001",
  task: "Comprar material (madeira)",
  project: "Construir Deck",
  problem: "Fornecedor sem estoque",
  solution: "Manter 3 fornecedores homologados",
  category: "Supply Chain",
  tags: ["fornecedor", "material", "estoque"],
  impactHours: 16, // Quanto tempo perdeu
  preventedRecurrence: 2, // Quantas vezes evitou o mesmo problema
  createdAt: "2025-09-15"
}
```

**Features:**
1. **Search:**
   - "Buscar lições sobre 'API timeout'"
   - Resultados: 3 lições anteriores com soluções

2. **Autocomplete em Feedback:**
   - Ao digitar "fornecedor", sugere lições similares
   - "Este problema já aconteceu antes. Ver solução?"

3. **Dashboard de Impacto:**
   - "Lessons Learned evitaram 120h de retrabalho este ano"
   - ROI do processo de feedback

4. **Categorias:**
   - Technical (bugs, arquitetura, performance)
   - Process (estimativas, comunicação, dependências)
   - External (fornecedores, clientes, regulamentação)

**Implementação:**
- Tabela: `lessons_learned`
- Full-text search: `to_tsvector` em PostgreSQL
- View: `lessons_by_category`
- Function: `find_similar_lessons(description TEXT)`

**BV/W:** 13/3 = 4.33 (ALTO)
**Sprint recomendado:** Sprint 8

---

### US-7.10: Retrospective Actions Tracker (já em Sprint 4)

**Adição:**
Integrar com **Feedback de Execução**.

**Nova feature:**
- Auto-criar ação de retro baseada em feedbacks recorrentes
- Exemplo: 3 tasks estouraram por "API timeout" → Criar ação "Implementar retry logic em todas as APIs"

---

## 📁 CATEGORIA 4: GESTÃO DE PROJETO COMPLETA

### US-8.1: Budget Tracking

**O que é:**
Tracking de **budget planejado vs gasto** por projeto.

**Estrutura:**
```javascript
{
  project: "CHATBOT",
  budgetPlanned: 50000, // R$ 50k
  budgetSpent: 38500,   // R$ 38.5k
  budgetRemaining: 11500,
  budgetStatus: "healthy" // healthy, warning, critical
}
```

**Status:**
- **Healthy** (<80% gasto): Verde
- **Warning** (80-95% gasto): Amarelo
- **Critical** (>95% gasto): Vermelho

**Alertas:**
```
⚠️ Projeto CHATBOT
Budget: R$ 38.5k / R$ 50k (77%)
Progresso: 85%

🔴 ATENÇÃO: Progresso > Budget %
Risco de estouro de orçamento!
```

**Integração com Time Tracking:**
```typescript
// Calcular budget gasto baseado em horas trabalhadas
budgetSpent = sum(
  task.time_actual * member.hourly_rate
)
```

**Implementação:**
- Campos: `budget_planned`, `budget_spent` (computed)
- Field: `hourly_rate` em `team_members`
- Function: `calculate_budget_spent(project_id)`
- Alert: Quando `budget_spent > budget_planned * 0.95`

**BV/W:** 8/3 = 2.67 (ALTO)
**Sprint recomendado:** Sprint 8

---

### US-8.2: Project Code (Identificador)

**O que é:**
**Código único** para cada projeto (ex: CHATBOT, SITE-BUILDER).

**Requisitos:**
- Uppercase
- Sem espaços
- Max 20 caracteres
- Único (constraint)

**Uso:**
- URLs: `/projects/CHATBOT`
- IDs de tasks: `CHATBOT-123`
- Exports: `CHATBOT-report-2026-01.pdf`

**Implementação:**
- Campo: `project_code` (VARCHAR(20), UNIQUE, NOT NULL)
- Constraint: `CHECK (project_code = UPPER(project_code))`
- Index: `CREATE UNIQUE INDEX idx_project_code ON projects(project_code)`

**BV/W:** 2/1 = 2.0 (MÉDIO)
**Sprint recomendado:** Sprint 8

---

### US-8.3: Project Status (Lifecycle)

**O que é:**
**Estados do ciclo de vida** do projeto.

**Estados:**
1. **Planning:** Planejamento inicial, não iniciado
2. **Active:** Em execução ativa
3. **Paused:** Pausado temporariamente
4. **On Hold:** Aguardando decisão/budget/recurso
5. **Completed:** Finalizado com sucesso
6. **Cancelled:** Cancelado
7. **Archived:** Arquivado (read-only)

**Transições:**
```
Planning → Active → Completed
         ↓       ↓
      Paused → On Hold → Cancelled
                       ↓
                   Archived
```

**Regras:**
- Apenas `Active` e `Paused` podem ter sprints ativos
- `Completed` e `Cancelled` não podem criar novas tasks
- `Archived` é read-only

**Implementação:**
- Enum: `project_status`
- Function: `can_create_task(project_id)` (validar status)
- View: `active_projects` (filtro)

**BV/W:** 3/1 = 3.0 (ALTO)
**Sprint recomendado:** Sprint 8

---

### US-8.4: Project Details Modal com Tabs

**O que é:**
Modal full-screen com **7 tabs** de informações do projeto.

**Tabs:**
1. **Overview:**
   - Resumo (nome, descrição, status, datas)
   - KPIs (progresso, budget, velocity)
   - Team members

2. **Backlog:**
   - Lista de features do projeto
   - Filtros por status/prioridade
   - Quick add

3. **Sprints:**
   - Lista de sprints do projeto
   - Timeline visual
   - Velocity chart

4. **Equipe:**
   - Membros alocados
   - Allocation %
   - Skills matrix

5. **Timeline:**
   - Gantt chart
   - Milestones
   - Dependencies

6. **Analytics:**
   - Burndown
   - Velocity
   - Health metrics

7. **Riscos:**
   - Lista de riscos
   - Matriz de probabilidade × impacto
   - Planos de mitigação

**Navegação:**
- Tabs horizontais
- URL: `/projects/CHATBOT?tab=analytics`
- Deep linking

**Implementação:**
- Componente: `ProjectDetailsModal`
- Tabs: Shadcn Tabs component
- Lazy loading: Carregar tab apenas quando clicada

**BV/W:** 13/5 = 2.60 (ALTO)
**Sprint recomendado:** Sprint 9

---

### US-8.5: Time Tracking Detalhado

**O que é:**
Tracking de **Estimado vs Trabalhado vs Restante**.

**Estrutura:**
```javascript
{
  task: "Implementar Burndown Chart",
  timeEstimate: 8, // horas
  timeActual: 5.5, // horas
  timeRemaining: 2.5, // horas
  timeStatus: "on-track" // on-track, warning, over
}
```

**Visual:**
```
┌────────────────────────────────────────────────────────┐
│ TIME TRACKING                                          │
├────────────────────────────────────────────────────────┤
│ Estimado    ████████ 8h                                │
│ Trabalhado  █████▒▒▒ 5.5h (69%)                       │
│ Restante    ██▒▒▒▒▒▒ 2.5h                             │
│                                                        │
│ Status: ✅ Dentro do previsto                         │
└────────────────────────────────────────────────────────┘
```

**Status:**
- **On track** (<90% usado): Verde
- **Warning** (90-100% usado): Amarelo
- **Over** (>100% usado): Vermelho → Trigger Feedback Obrigatório

**Implementação:**
- Campos: `time_estimate`, `time_actual`, `time_remaining` (computed)
- Function: `get_time_status(task_id)`
- Component: `TimeTrackingBar`

**BV/W:** 8/3 = 2.67 (ALTO)
**Sprint recomendado:** Sprint 6 (integrar com Spike Tracking)

---

### US-8.6: Comments & Attachments

**O que é:**
Sistema de **comentários** e **anexos** em tasks.

**Features:**
1. **Comments:**
   - Markdown support
   - @mentions
   - Replies (threads)
   - Reactions (👍, 🎉, ❤️)

2. **Attachments:**
   - Drag & drop upload
   - Preview (imagens, PDFs)
   - Max 10MB por arquivo
   - Storage: Supabase Storage

**Estrutura:**
```javascript
{
  id: "CMT-001",
  task_id: "US-123",
  author: "Pedro V.",
  content: "@Luis pode revisar esse código? Acho que tem bug na linha 45.",
  mentions: ["luis"],
  created_at: "2026-01-20 14:30",
  replies: 2
}
```

**Implementação:**
- Tabela: `task_comments`
- Tabela: `task_attachments`
- Storage: Supabase Storage bucket `task-attachments`
- Real-time: Supabase Realtime (comments atualizados ao vivo)

**BV/W:** 8/5 = 1.60 (MÉDIO)
**Sprint recomendado:** Sprint 9

---

### US-8.7: Activity Log

**O que é:**
**Histórico de atividades** em cada task (audit trail).

**Eventos rastreados:**
- Status change: "Pedro moveu de TODO para IN PROGRESS"
- Assignment: "Luis foi atribuído à task"
- Priority change: "Prioridade mudou de P2 para P0"
- Comment added: "Maria comentou na task"
- Attachment added: "Pedro anexou screenshot.png"
- Time logged: "Luis registrou 2h de trabalho"

**Estrutura:**
```javascript
{
  id: "ACT-001",
  task_id: "US-123",
  actor: "Pedro V.",
  action: "status_changed",
  old_value: "todo",
  new_value: "in-progress",
  timestamp: "2 horas atrás"
}
```

**Implementação:**
- Tabela: `task_activity_log`
- Trigger: Auto-criar log em UPDATE de `features`
- Component: `ActivityTimeline`

**BV/W:** 5/2 = 2.50 (MÉDIO)
**Sprint recomendado:** Sprint 9

---

### US-8.8: Projeto DEMO (Educational)

**O que é:**
Projeto **exemplo completo** incluído por padrão, com dados reais de problemas e feedbacks.

**Exemplo:** "🏗️ Construir Deck de Madeira"
- 9 tasks sequenciais
- Dependências entre tasks
- Tasks paralelas (DECK-07 e DECK-08)
- 5 feedbacks de problemas reais:
  1. Fornecedor sem estoque (+100% tempo)
  2. Chuva atrasou obra (+25% tempo)
  3. Material com defeito (+50% tempo)
  4. Outros imprevistos

**Por que é importante:**
- **Onboarding:** Novos usuários veem sistema em ação
- **Demo:** Mostrar para prospects
- **Aprendizado:** Casos reais de problemas e soluções
- **Testing:** Dados para testar features

**Implementação:**
- Seed: `seed_demo_project()`
- Flag: `is_demo = true`
- Deletable: Usuário pode remover se quiser

**BV/W:** 5/2 = 2.50 (MÉDIO para UX)
**Sprint recomendado:** Sprint 10 (Polish)

---

## 🎭 CATEGORIA 5: CERIMÔNIAS SCRUM (VIEWS ESPECÍFICAS)

### US-9.1: Sprint Planning View

**O que é:**
View dedicada para **cerimônia de Sprint Planning**.

**Seções:**
1. **Planning A (com PO):**
   - Product Backlog ordenado por prioridade
   - BV/W visible
   - Quick add to sprint
   - Capacity do time visível

2. **Planning B (com Dev Team):**
   - Sprint Backlog (features selecionadas)
   - Decomposição em subtasks
   - Estimativas (Planning Poker)
   - Acceptance Criteria review

**Layout:**
```
┌──────────────────────────┬──────────────────────────┐
│ PRODUCT BACKLOG          │ SPRINT BACKLOG           │
│ (ordenado por BV/W)      │ (capacity: 30 pts)       │
├──────────────────────────┼──────────────────────────┤
│ US-001 (BV/W: 8/3) →    │ ← US-001 [8 pts]        │
│ US-002 (BV/W: 5/5)      │    - Subtask 1 [3 pts]  │
│ US-003 (BV/W: 3/8)      │    - Subtask 2 [5 pts]  │
│                          │                          │
│ Arraste para adicionar → │ ← US-005 [13 pts]       │
│                          │                          │
│                          │ TOTAL: 21/30 pts (70%)  │
└──────────────────────────┴──────────────────────────┘
```

**Features:**
- Drag & Drop entre backlogs
- Counter de capacity
- Warning se ultrapassar capacity
- Timer (Planning time-boxed: 2h para 1 semana de sprint)

**BV/W:** 8/3 = 2.67 (ALTO)
**Sprint recomendado:** Sprint 9

---

### US-9.2: Daily Standup View

**O que é:**
View dedicada para **cerimônia de Daily Scrum**.

**Layout:**
```
┌────────────────────────────────────────────────────────┐
│ DAILY STANDUP - Sprint W02 - Dia 5/10                 │
├────────────────────────────────────────────────────────┤
│ ⏱️ Timer: 12:34 / 15:00 (time-box)                    │
├────────────────────────────────────────────────────────┤
│                                                        │
│ 👤 PEDRO VITOR                                         │
│ ├─ Ontem: Implementei burndown chart                  │
│ ├─ Hoje: Code review + deploy                         │
│ └─ Impedimentos: Nenhum                                │
│                                                        │
│ 👤 LUIS BOFF                                           │
│ ├─ Ontem: Testes unitários da API                     │
│ ├─ Hoje: Integração com frontend                      │
│ └─ Impedimentos: ⚠️ API mock está lenta (BLOQ-01)     │
│                                                        │
│ 👤 VITINHO                                             │
│ ├─ Ontem: Estudei documentação React Query            │
│ ├─ Hoje: Implementar hook useFeatures                 │
│ └─ Impedimentos: Nenhum                                │
└────────────────────────────────────────────────────────┘

⚠️ 1 BLOQUEADOR ATIVO → Resolver após Daily
```

**Features:**
- **Timer:** 15 min time-box (alarme visual/sonoro)
- **Round-robin:** Próximo membro automaticamente
- **Capture notes:** Salvar Daily log automaticamente
- **Blocker highlight:** Vermelho se impedimento
- **Quick actions:** Criar task de bloqueio removal

**Integração:**
- US-6.1 (Daily Scrum Logger) - Preencher automaticamente

**BV/W:** 5/2 = 2.50 (MÉDIO)
**Sprint recomendado:** Sprint 9

---

### US-9.3: Sprint Review View

**O que é:**
View dedicada para **cerimônia de Sprint Review**.

**Seções:**
1. **Sprint Summary:**
   - Goal alcançado? Sim/Não
   - Velocity: 21 pts (vs 20 planejado)
   - Completion rate: 95%

2. **Features Demo:**
   - Lista de features DONE
   - Checkbox: "PO aceitou"
   - Notes: Feedback do PO

3. **Não Completados:**
   - Features que não ficaram DONE
   - Razão (carry-over para próximo sprint)

4. **Stakeholder Feedback:**
   - Input de stakeholders
   - Novos itens para backlog

**Layout:**
```
┌────────────────────────────────────────────────────────┐
│ SPRINT REVIEW - Sprint W02                             │
├────────────────────────────────────────────────────────┤
│ Sprint Goal: "Implementar métricas de velocity"       │
│ Status: ✅ ALCANÇADO                                  │
├────────────────────────────────────────────────────────┤
│                                                        │
│ FEATURES DEMONSTRADAS (3):                            │
│                                                        │
│ ☑️ US-001: Velocity Chart                             │
│    └─ PO Feedback: "Aprovado. Adicionar tooltip."    │
│                                                        │
│ ☑️ US-002: Burndown Chart                             │
│    └─ PO Feedback: "Aprovado!"                        │
│                                                        │
│ ☑️ US-003: Forecast                                   │
│    └─ PO Feedback: "Melhorar UX, mas OK para release"│
│                                                        │
│ NÃO COMPLETADOS (1):                                  │
│ ☐ US-004: Health Dashboard (80% done)                │
│    └─ Carry-over: Sim (para próximo sprint)          │
└────────────────────────────────────────────────────────┘
```

**BV/W:** 8/3 = 2.67 (ALTO)
**Sprint recomendado:** Sprint 9

---

### US-9.4: Retrospective View

**O que é:**
View dedicada para **cerimônia de Retrospective**.

**Formato:** Start-Stop-Continue

**Seções:**
1. **What went well?** (Continue)
   - Post-its verdes
   - Voting (dot voting)

2. **What didn't go well?** (Stop)
   - Post-its vermelhos
   - Voting

3. **What can we improve?** (Start)
   - Post-its amarelos
   - Voting

4. **Action Items:**
   - Top 3 voted items → Convert to actions
   - Assign owner
   - Set deadline

**Layout:**
```
┌──────────────┬──────────────┬──────────────┐
│ 🟢 CONTINUE  │ 🔴 STOP      │ 🟡 START     │
├──────────────┼──────────────┼──────────────┤
│ Daily eficaz │ Reuniões    │ Code review  │
│ ❤️❤️❤️ (3)    │ longas      │ obrigatório  │
│              │ ❤️❤️❤️❤️❤️ (5) │ ❤️❤️❤️❤️ (4)  │
│              │              │              │
│ Pair prog    │ Interrupções│ DoD checklist│
│ ❤️❤️ (2)      │ ❤️❤️❤️ (3)    │ ❤️❤️ (2)      │
└──────────────┴──────────────┴──────────────┘

ACTION ITEMS (Top 3):
1. Limitar reuniões a 30 min → Owner: SM → Deadline: Próximo sprint
2. Implementar code review obrigatório → Owner: Tech Lead → Deadline: Esta semana
3. Criar DoD checklist template → Owner: PO → Deadline: Amanhã
```

**Features:**
- **Anonymous voting:** Votos anônimos (mais honesto)
- **Real-time:** Supabase Realtime (todos veem ao vivo)
- **Auto-create actions:** Top 3 viram Retrospective Actions (US-4.3)

**Integração:**
- US-4.3 (Retrospective Actions Tracker)
- US-7.8 (Feedback de Execução) - Agregar feedbacks do sprint

**BV/W:** 8/3 = 2.67 (ALTO)
**Sprint recomendado:** Sprint 9

---

## 🎨 CATEGORIA 6: UX & NAVEGAÇÃO

### US-10.1: Search Global (Ctrl+K)

**O que é:**
**Busca global** com atalho de teclado.

**Atalho:**
- **Mac:** ⌘K (Command+K)
- **Windows/Linux:** Ctrl+K

**Busca em:**
- Tasks (título, descrição, ID)
- Projetos (nome, código)
- Pessoas (nome, email)
- Sprints (nome)
- Comments
- Lessons Learned

**Features:**
- **Fuzzy search:** Tolera typos
- **Highlights:** Match em amarelo
- **Recent:** Últimas buscas
- **Keyboard navigation:** ↑↓ para navegar, Enter para abrir

**Implementação:**
- Componente: `CommandPalette` (Shadcn Command)
- Full-text search: PostgreSQL `to_tsvector`
- Atalho: `useHotkeys('cmd+k, ctrl+k')`

**BV/W:** 8/3 = 2.67 (ALTO para UX)
**Sprint recomendado:** Sprint 10

---

### US-10.2: Sidebar Collapsible

**O que é:**
**Sidebar retrátil** para ganhar espaço de tela.

**Estados:**
- **Expanded:** 240px (padrão)
- **Collapsed:** 60px (apenas ícones)

**Comportamento:**
- Botão de toggle
- Esconde textos
- Mantém ícones
- Salva preferência em localStorage

**Implementação:**
- State: `sidebarCollapsed` (zustand)
- CSS: Transition smooth (300ms)
- Persistence: localStorage

**BV/W:** 3/1 = 3.0 (MÉDIO para UX)
**Sprint recomendado:** Sprint 10

---

### US-10.3: Breadcrumbs

**O que é:**
**Navegação breadcrumb** no topo.

**Exemplo:**
```
Dashboard / Projetos / CHATBOT / Sprint W02 / Kanban
```

**Clicável:**
- Cada nível é um link
- Volta para nível anterior

**Implementação:**
- Component: `Breadcrumb` (Shadcn)
- Hook: `useBreadcrumbs()` (auto-detect from route)

**BV/W:** 2/1 = 2.0 (MÉDIO para UX)
**Sprint recomendado:** Sprint 10

---

### US-10.4: Team Filters (Avatar Chips)

**O que é:**
**Filtros visuais** com avatares clicáveis.

**Uso:**
- Kanban: Ver apenas tasks do @Pedro
- Backlog: Ver apenas features de projeto X
- Calendar: Ver apenas eventos de pessoa Y

**Visual:**
```
┌──────────────────────────────────────┐
│ 👤 👤 👤 +2                          │ ← Avatares
│ [Todos selecionados]                 │
│                                      │
│ Click para filtrar por pessoa        │
└──────────────────────────────────────┘
```

**Implementação:**
- Component: `AvatarFilter`
- Multi-select: Shift+Click
- Visual: Grayscale quando não selecionado

**BV/W:** 5/2 = 2.50 (MÉDIO para UX)
**Sprint recomendado:** Sprint 10

---

### US-10.5: Notifications Center

**O que é:**
**Centro de notificações** com badge de contagem.

**Tipos de notificação:**
- Task assigned to you
- Comment mention (@pedro)
- Sprint starting tomorrow
- Deadline approaching
- Blocker created
- Review requested

**Features:**
- Badge: Número de não lidas
- Mark as read
- Mark all as read
- Filter by type
- Real-time (Supabase Realtime)

**Implementação:**
- Tabela: `notifications`
- Component: `NotificationCenter`
- Real-time: Supabase Realtime channel

**BV/W:** 8/3 = 2.67 (ALTO para engagement)
**Sprint recomendado:** Sprint 10

---

## 📊 CATEGORIA 7: ANALYTICS & VISUALIZAÇÃO

### US-11.1: Gantt Chart

**O que é:**
**Visualização de timeline** estilo Gantt.

**Mostra:**
- Projetos em timeline
- Tasks em timeline
- Dependencies (linhas conectando)
- Milestones (diamantes)
- Today marker (linha vermelha)

**Features:**
- Zoom: Dia/Semana/Mês
- Drag to reschedule
- Resize to extend duration
- Collapse/expand projects

**Bibliotecas:**
- **Option 1:** `react-gantt-chart`
- **Option 2:** `frappe-gantt` (mais leve)
- **Option 3:** DIY com SVG

**BV/W:** 8/8 = 1.0 (MÉDIO - esforço alto)
**Sprint recomendado:** Sprint 11

---

### US-11.2: Burndown Chart SVG Interativo

**O que é:**
**Burndown SVG** com tooltips e animação (upgrade do atual).

**Features atuais (do HTML demo):**
- Linha ideal (azul tracejada)
- Linha real (vermelho sólida)
- Current point (círculo pulsante)
- Tooltip on hover
- Grid lines
- Axis labels

**Melhorias:**
- **Zoom:** Click to zoom
- **Forecast line:** Projeção de término
- **Area fill:** Área abaixo da curva
- **Legend:** Explicação das linhas

**BV/W:** 5/3 = 1.67 (MÉDIO)
**Sprint recomendado:** Sprint 3 (já está)

---

### US-11.3: Velocity Chart Mini (Sparkline)

**O que é:**
**Mini chart de velocity** no dashboard (sparkline).

**Visual:**
```
┌─────────────────────────────────┐
│ VELOCITY                        │
│ █▅▃█▇█ 16 pts/sprint ↑         │
│ W48 W49 W50 W51 W52 W01         │
└─────────────────────────────────┘
```

**Features:**
- Barra mais alta = sprint atual
- Hover: Show exact value
- Color: Verde se tendência positiva

**Implementação:**
- Component: `VelocitySparkline`
- Library: Recharts `<AreaChart>` simplificado

**BV/W:** 3/1 = 3.0 (MÉDIO para dashboard)
**Sprint recomendado:** Sprint 3 (já está no roadmap)

---

## 📊 TABELA RESUMO - PRIORIZAÇÃO

| ID | Feature | BV/W | Sprint | Story Points |
|----|---------|------|--------|--------------|
| **US-7.8** | **Feedback Execução Obrigatório** | **7.0** | 7 | 3 |
| US-7.1 | Matriz GUT | 4.33 | 4 | 3 |
| US-7.9 | Lessons Learned Database | 4.33 | 8 | 3 |
| US-7.2 | Priorização Multicritério | 4.0 | 7 | 2 |
| US-10.1 | Search Global (Ctrl+K) | 2.67 | 10 | 3 |
| US-7.3 | Capacity Planning | 2.60 | 7 | 5 |
| US-7.4 | Skills Matrix | 2.67 | 8 | 3 |
| US-8.1 | Budget Tracking | 2.67 | 8 | 3 |
| US-8.4 | Project Details Modal (Tabs) | 2.60 | 9 | 5 |
| US-8.5 | Time Tracking Detalhado | 2.67 | 6 | 3 |
| US-9.1 | Sprint Planning View | 2.67 | 9 | 3 |
| US-9.3 | Sprint Review View | 2.67 | 9 | 3 |
| US-9.4 | Retrospective View | 2.67 | 9 | 3 |
| US-10.5 | Notifications Center | 2.67 | 10 | 3 |
| US-7.5 | Velocity Individual | 2.50 | 7 | 2 |
| US-8.7 | Activity Log | 2.50 | 9 | 2 |
| US-9.2 | Daily Standup View | 2.50 | 9 | 2 |
| US-10.4 | Team Filters (Avatar Chips) | 2.50 | 10 | 2 |
| US-8.3 | Project Status (Lifecycle) | 3.0 | 8 | 1 |
| US-7.6 | Seniority & Roles | 3.0 | 8 | 1 |
| US-10.2 | Sidebar Collapsible | 3.0 | 10 | 1 |
| US-11.3 | Velocity Chart Mini | 3.0 | 3 | 1 |
| US-8.2 | Project Code | 2.0 | 8 | 1 |
| US-10.3 | Breadcrumbs | 2.0 | 10 | 1 |
| US-11.2 | Burndown SVG Interativo | 1.67 | 3 | 3 |
| US-8.6 | Comments & Attachments | 1.60 | 9 | 5 |
| US-11.1 | Gantt Chart | 1.0 | 11 | 8 |

**Total:** 27 User Stories | ~75 Story Points | ~8-10 semanas adicionais

---

## 🎯 ROADMAP EXPANDIDO (SPRINTS 7-11)

### Sprint 7 - Priorização Avançada & Capacidade (15 pts)
- US-7.1: Matriz GUT (3 pts)
- US-7.2: Priorização Multicritério (2 pts)
- US-7.3: Capacity Planning (5 pts)
- US-7.5: Velocity Individual (2 pts)
- **US-7.8: Feedback Execução Obrigatório (3 pts)** 🔥 CRÍTICO

**Resultado:** Sistema de priorização completo + gestão de capacidade

---

### Sprint 8 - Gestão de Projeto & Pessoas (13 pts)
- US-7.4: Skills Matrix (3 pts)
- US-7.6: Seniority & Roles (1 pt)
- US-7.9: Lessons Learned Database (3 pts)
- US-8.1: Budget Tracking (3 pts)
- US-8.2: Project Code (1 pt)
- US-8.3: Project Status (1 pt)
- US-7.7: Team Allocations Management (3 pts) ← Movi do 7

**Resultado:** Gestão completa de projetos + base de conhecimento

---

### Sprint 9 - Cerimônias Scrum (18 pts)
- US-9.1: Sprint Planning View (3 pts)
- US-9.2: Daily Standup View (2 pts)
- US-9.3: Sprint Review View (3 pts)
- US-9.4: Retrospective View (3 pts)
- US-8.4: Project Details Modal (5 pts)
- US-8.7: Activity Log (2 pts)

**Resultado:** Views específicas para todas as cerimônias Scrum

---

### Sprint 10 - UX & Navegação (13 pts)
- US-10.1: Search Global (3 pts)
- US-10.2: Sidebar Collapsible (1 pt)
- US-10.3: Breadcrumbs (1 pt)
- US-10.4: Team Filters (2 pts)
- US-10.5: Notifications Center (3 pts)
- US-8.8: Projeto DEMO (2 pts)
- Polish & refinements (1 pt)

**Resultado:** UX profissional + onboarding melhorado

---

### Sprint 11 - Analytics Avançados (13 pts)
- US-11.1: Gantt Chart (8 pts)
- US-8.6: Comments & Attachments (5 pts)

**Resultado:** Visualizações avançadas + colaboração

---

## 🎉 SISTEMA COMPLETO (11 SPRINTS)

```
┌────────────────────────────────────────────────────────────┐
│                 UZZOPS - ROADMAP COMPLETO                  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ ✅ Sprint 1-2: Fundação (COMPLETO)                        │
│ 📋 Sprint 3-6: Métricas + Priorização + Backlog (80 pts) │
│ 🆕 Sprint 7-11: Features Avançadas (72 pts)               │
│                                                            │
│ TOTAL: 152 Story Points em ~5-6 meses                     │
│                                                            │
│ 🎯 RESULTADO FINAL:                                       │
│ Sistema profissional end-to-end de gestão Scrum com:      │
│ • Métricas preditivas (Velocity, Burndown, Forecast)     │
│ • Priorização objetiva (BV/W, GUT, Planning Poker)       │
│ • Gestão de capacidade (Allocation, Skills, Overload)    │
│ • Feedback loop (Lessons Learned, Retros, Improvements)  │
│ • Cerimônias completas (Planning, Daily, Review, Retro)  │
│ • UX profissional (Search, Notifs, Gantt, Mobile)        │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 💡 RECOMENDAÇÕES FINAIS

### 1. Prioridades IMEDIATAS (Sprint 7)
1. **US-7.8: Feedback de Execução Obrigatório** (BV/W: 7.0)
   - ROI altíssimo
   - Cria cultura de melhoria
   - Previne retrabalho

2. **US-7.1: Matriz GUT** (BV/W: 4.33)
   - Complementa BV/W
   - Essencial para bugs e riscos

3. **US-7.3: Capacity Planning** (BV/W: 2.60)
   - Previne burnout
   - Planejamento realista

### 2. Quick Wins (1-2 pts cada)
- US-8.2: Project Code
- US-8.3: Project Status
- US-10.2: Sidebar Collapsible
- US-10.3: Breadcrumbs

### 3. Features "Nice to Have" (baixa prioridade)
- US-11.1: Gantt Chart (esforço alto, BV/W baixo)
- US-8.6: Comments & Attachments (não crítico para Scrum)

### 4. Evitar Scope Creep
- **NÃO implementar tudo de uma vez**
- Seguir ordem de Sprints 7→11
- Validar com usuários a cada sprint
- Medir ROI de cada feature

---

## 📚 CONCLUSÃO

O HTML demo revelou **30+ features valiosas** ainda não mapeadas, com destaque para:

🔥 **Top 3 CRÍTICAS:**
1. Feedback de Execução Obrigatório (cultura de aprendizado)
2. Matriz GUT (priorização de riscos/bugs)
3. Capacity Planning (previne burnout)

📊 **Roadmap expandido:**
- Sprints 3-6: **80 pts** (já documentados)
- Sprints 7-11: **72 pts** (este documento)
- **Total: 152 pts em 5-6 meses**

🎯 **Resultado final:**
Sistema **end-to-end** de gestão Scrum profissional, cobrindo:
- Métricas ✅
- Priorização ✅
- Capacidade ✅
- Feedback ✅
- Cerimônias ✅
- UX ✅

**Próximo passo:** Revisar este documento com PO e decidir quais features incluir no backlog.

---

**Versão:** 1.0
**Data:** 2026-02-07
**Autor:** Análise do ERP-UzzAI-Complete-Demo.html
**Próxima revisão:** Após Sprint 6 Review
