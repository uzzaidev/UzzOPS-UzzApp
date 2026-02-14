# Plano: Dashboard Enterprise — UzzOPS Command Center

> **Objetivo:** Substituir o dashboard atual (5 stat cards simples) por um painel de
> "sala de guerra" que agrega em tempo real o estado de TODOS os 21 módulos do sistema
> em uma única tela, organizada em 3 domínios estratégicos.

---

## Diagnóstico do dashboard atual

O `dashboard-content.tsx` atual mostra:
- 6 stat cards estáticos (total features, done, in-progress, risks críticos, team size, DoD)
- 1 stacked bar de status de features
- 1 card de sprint ativo

**Problema:** Com 21 módulos, Marketing completo, CRM com pipeline, métricas de velocity,
retrospectivas, spikes, DoD evolutivo, daily scrum e planning poker — o dashboard atual
ignora ~90% do que o sistema produz. É uma vitrine com 1 produto numa loja com 100.

---

## Filosofia de design

**Lei do menor esforço cognitivo:** O usuário abre o dashboard e em < 10 segundos sabe:

1. O projeto está saudável ou em risco?
2. O sprint atual está no ritmo?
3. O marketing está fluindo?
4. O pipeline de vendas está avançando?
5. Tem algum bloqueio ou ação urgente?

Tudo isso **sem clicar em nada**. Cada seção é uma "lente" sobre um domínio — não
um relatório completo. Para detalhes, o usuário clica em "Ver tudo" e vai ao módulo.

---

## Layout visual — visão geral

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ TOPBAR: UzzOPS | [Projeto] | [Trocar] · · · · · · · · · [Importar MD] [Feedback]│
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │ SAÚDE    │ │ SPRINT   │ │ FEATURES │ │ RISKS    │ │MARKETING │ │  CRM    │ │
│  │  87/100  │ │ 68% pts  │ │ 142 tot  │ │ 2 crític │ │ 12 publi │ │ 8 leads │ │
│  │ 🟢 Healthy│ │ ●●●●○○○  │ │ 43 done  │ │ GUT≥100  │ │ do mês   │ │ quentes │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └─────────┘ │
│                                                                                 │
│  ┌────────────────────────────┐ ┌──────────────────┐ ┌──────────────────────┐  │
│  │ 🚀 DESENVOLVIMENTO         │ │ 📣 MARKETING      │ │ 💼 CRM & PIPELINE    │  │
│  │                            │ │                  │ │                      │  │
│  │  Sprint: SPRINT-04         │ │  Posts este mês  │ │  Funil de vendas     │  │
│  │  ████████████░░░░  68%     │ │  [Gauge 12/18]   │ │  ████░ Qualificado 6 │  │
│  │  Burndown mini-chart       │ │                  │ │  ██░░ Proposta    3  │  │
│  │  atual vs ideal            │ │  Pipeline:       │ │  █░░░ Negociação  2  │  │
│  │                            │ │  idea   ●●●● 8   │ │  ●●   Fechado     1  │  │
│  │  Feature Pipeline          │ │  prod   ●●   4   │ │                      │  │
│  │  ●●●●●░░░░░░░░░░  (mini)  │ │  review ●●●  6   │ │  Hot Leads           │  │
│  │  backlog→done stacked bar  │ │  done   ●●●●●12  │ │  ┌──────────────┐   │  │
│  │                            │ │                  │ │  │ Imob. X  85% │   │  │
│  │  MVP Progress              │ │  Próximas pubs:  │ │  │ SaaS Y   72% │   │  │
│  │  [████████░░] 78%  🎯      │ │  ▸ Post LinkedIn │ │  │ Varejo Z 60% │   │  │
│  │                            │ │    amanhã 10h    │ │  └──────────────┘   │  │
│  │  DoD Level 2 ✓  [72% avg] │ │  ▸ Reels IG      │ │                      │  │
│  │                            │ │    27/02 18h     │ │  Revenue potencial   │  │
│  │  Retro Actions             │ │  ▸ Newsletter     │ │  R$ 284k total       │  │
│  │  ✅ 3  🔄 2  ❌ 5 pendentes│ │    28/02 09h     │ │  R$ 12k MRR          │  │
│  │                            │ │                  │ │                      │  │
│  │  Spikes: 2 ativos          │ │  On-time rate    │ │  ⚠️ 4 ações vencidas  │  │
│  │  8h timeboxed              │ │  [████████░░]84% │ │                      │  │
│  └────────────────────────────┘ └──────────────────┘ └──────────────────────┘  │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ 📋 ATIVIDADE RECENTE                                              [Feed]│   │
│  │                                                                         │   │
│  │  🟡 [Daily] Luis — Impedimento: "Aguardando retorno da API do cliente"  │   │
│  │  🟢 [CRM]   Cristian Grazziotin movido para Negociação (hoje 14:32)     │   │
│  │  🔵 [Import] 3 features importadas via MD Feeder (hoje 11:00)           │   │
│  │  🟣 [Retro]  Ação "Melhorar PR review" marcada como concluída           │   │
│  │  🟠 [Risk]   Novo risco crítico criado: "Integração API falhou" GUT=125 │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Seção 1 — KPI Strip (6 stat cards no topo)

Estes cards estão **sempre visíveis**, mesmo ao rolar. Funcionam como a barra de status
de uma sala de controle — você não precisa procurar para saber se algo está fora do normal.

### Card 1 — Saúde do Projeto
```
┌──────────────────┐
│  SAÚDE           │
│  87 / 100        │
│  🟢 Healthy      │
│  ↑ +3 vs sprint  │
└──────────────────┘
```
- Dado: `GET /api/projects/[id]/health` → `health_score`, `health_status`
- Cor do card: verde (>=75) / amarelo (>=50) / vermelho (<50)
- Delta: comparação com sprint anterior

### Card 2 — Sprint Atual
```
┌──────────────────┐
│  SPRINT-04       │
│  68% dos pontos  │
│  ●●●●●●●○○○      │
│  D-5 para fim    │
└──────────────────┘
```
- Dado: `GET /api/projects/[id]/overview` → `currentSprint`
- Progress bar de pontos: `velocity_actual / velocity_target`
- Countdown de dias

### Card 3 — Features
```
┌──────────────────┐
│  FEATURES        │
│  43 done / 142   │
│  ████░░░░  30%   │
│  12 blocked ⚠️   │
└──────────────────┘
```
- Dado: `GET /api/projects/[id]/overview` → `totalFeatures`, `featuresDone`, `featuresInProgress`
- Alert vermelho se `blocked > 0`

### Card 4 — Riscos Críticos
```
┌──────────────────┐
│  RISKS           │
│  2 críticos      │
│  GUT ≥ 100       │
│  5 em análise    │
└──────────────────┘
```
- Dado: `GET /api/projects/[id]/overview` → `criticalRisks`
- Card fica vermelho se `criticalRisks > 0`

### Card 5 — Marketing
```
┌──────────────────┐
│  MARKETING       │
│  12 publicações  │
│  ██████████░░    │
│  meta: 18/mês    │
└──────────────────┘
```
- Dado: `GET /api/marketing/dashboard?month=YYYY-MM` → `posts_current_month`, target
- Cor: verde se >= 80% da meta, amarelo se >= 60%, vermelho se < 60%

### Card 6 — CRM
```
┌──────────────────┐
│  CRM             │
│  8 leads ativos  │
│  3 🔥 hot        │
│  R$ 284k potenc. │
└──────────────────┘
```
- Dado: `GET /api/projects/[id]/clients` com contagem por ICP
- `potential_value` sum de todos os leads

---

## Seção 2 — Desenvolvimento (coluna esquerda, 38% da largura)

### Widget 2.1 — Sprint Burndown Mini

```
SPRINT-04 · ativo · D-5
━━━━━━━━━━━━━━━━━━━━━━
     Pontos restantes
  80 │╲
  60 │ ╲·····      ← ideal line
  40 │  ╲   ·
  20 │   actual   ·
   0 └────────────── dias
     1  3  5  7  9 11
[Ver sprint →]
```

- Dado: `GET /api/sprints/[id]/burndown` → snapshots diários
- Mini LineChart Recharts (150px alto)
- 2 linhas: actual (azul) + ideal (cinza tracejada)
- Se actual > ideal: linha fica amarela/vermelha

### Widget 2.2 — Feature Pipeline (stacked bar horizontal)

```
backlog  ███░░░░░░░░  24
todo     ███████░░░░  38
in_prog  ████████░░░  44
review   ████░░░░░░░  18
testing  ██░░░░░░░░░  12
done     ███████████  43
blocked  ●●          4  ⚠️
```

- Dado: `GET /api/features` → contagem por status
- BarChart horizontal (Recharts) — pequeno, 200px de altura
- `blocked` sempre em vermelho + badge de alerta

### Widget 2.3 — MVP Progress Gauge

```
 MVP — Versão MVP
 ┌────────────────────┐
 │  ██████████░░░░  78% │
 │  35 feitos / 45 total│
 │  🎯 7 restantes       │
 └────────────────────┘
```

- Dado: `GET /api/metrics/mvp-progress` → `mvp_done`, `mvp_total`, `mvp_progress_percentage`
- RadialBarChart Recharts (compacto)
- Badge: quantas MVP features ainda faltam

### Widget 2.4 — DoD & Qualidade

```
 DoD Nível 2 — ativo
 Compliance médio do projeto
 ┌─────────────────────────┐
 │  ████████░░  72%        │
 │  Nível 1 ✅  Nível 2 🔄  │
 │  Nível 3 🔒 (bloqueado) │
 └─────────────────────────┘
```

- Dado: `GET /api/projects/[id]/dod` → `current_level`, `avg_dod_progress`
- ProgressBar + level badges

### Widget 2.5 — Retro Actions + Spikes

```
 Retrospectivas (último sprint)
 ┌──────────────────────────┐
 │ ✅ Concluídas    3       │
 │ 🔄 Em andamento  2       │
 │ ❌ Pendentes     5  ⚠️   │
 └──────────────────────────┘

 Spikes ativos
 ┌──────────────────────────┐
 │ 2 spikes · 8h timeboxed  │
 │ 1 com outcome registrado │
 └──────────────────────────┘
```

- Dado: `GET /api/retrospectives` + `GET /api/sprints/[id]/spikes`
- Alert se pendentes > 3

---

## Seção 3 — Marketing (coluna central, 28% da largura)

### Widget 3.1 — Posts do Mês (Gauge circular)

```
    ╭──────────────╮
   ╱                ╲
  │    12 / 18       │
  │  ████████░░      │  ← RadialBarChart
  │   66% da meta    │
   ╲                ╱
    ╰──────────────╯
  Mês: Fevereiro 2026
```

- Dado: `GET /api/marketing/dashboard?month=YYYY-MM`
- Verde ≥ 80% / Amarelo ≥ 60% / Vermelho < 60%

### Widget 3.2 — Pipeline de Conteúdo

```
 STATUS          QTDE  BARRA
 ─────────────────────────────
 💡 idea          8   ████████
 📝 briefing      3   ███
 🎬 production    4   ████
 👁  review        6   ██████
 ✅ approved      5   █████
 🌐 publicado    12   ████████████
```

- Dado: `GET /api/marketing/content?projectId=` agrupado por status
- Horizontal mini BarChart

### Widget 3.3 — Próximas Publicações (3 itens)

```
 PRÓXIMAS PUBLICAÇÕES
 ─────────────────────────────
 ▸ LinkedIn · Post técnico
   27/02 (amanhã) · 10:00

 ▸ Instagram Reels · Demo
   27/02 · 18:00

 ▸ Newsletter · Mensal
   28/02 · 09:00

 [Ver calendário →]
```

- Dado: `GET /api/marketing/publications?status=scheduled&limit=3`
- Ordenado por `scheduled_date ASC`
- Canal com ícone (LinkedIn=azul, IG=gradiente, etc.)

### Widget 3.4 — On-Time Rate

```
 Taxa de publicação no prazo
 ████████████████░░░░  84%
 21 de 25 publicações
 ↑ +6% vs mês anterior
```

- Dado: `GET /api/marketing/publications/stats`
- ProgressBar + delta mês anterior

---

## Seção 4 — CRM & Pipeline (coluna direita, 34% da largura)

### Widget 4.1 — Funil de Vendas (horizontal)

```
 ESTÁGIO              CLIENTES  BAR
 ──────────────────────────────────
 Lead Novo       ███          6
 Qualificado     ██████       12
 Proposta        ████         8
 Negociação      ███          5
 Fechado         ██           4
 ──────────────────────────────────
 Conversão geral: 57%  (11 de 19)
```

- Dado: `GET /api/projects/[id]/clients` → agrupar por `funnel_stage`
- BarChart horizontal Recharts
- Calcular taxa de conversão (fechado / total)

### Widget 4.2 — Hot Leads (Top 3)

```
 🔥 HOT LEADS
 ──────────────────────────────────
 ┌─────────────────────────────┐
 │ Perfeccto Imobiliária        │
 │ 🔥 hot · Negociação · 72%   │
 │ Próx: 21/02 · Pedro Vitor   │
 └─────────────────────────────┘
 ┌─────────────────────────────┐
 │ TechStartup ABC              │
 │ 🔥 hot · Proposta · 85%     │
 │ Próx: 19/02 · Luis F.       │
 └─────────────────────────────┘
 [Ver pipeline →]
```

- Dado: `GET /api/projects/[id]/clients?icp_classification=hot&limit=3`
- Ordenado por `closing_probability DESC`
- Badge de sentimento: Positivo/Neutro/Negativo

### Widget 4.3 — Revenue Summary

```
 RECEITA POTENCIAL
 ──────────────────────────────────
 Total potencial   R$ 284.000
 MRR potencial     R$ 12.600 / mês
 Setup potencial   R$ 38.000
 ──────────────────────────────────
 Pipeline ativo: 12 deals
```

- Dado: `GET /api/projects/[id]/clients` → sum de `potential_value`, `monthly_fee_value`, `setup_fee_value`
- Calcular apenas clientes com status ≠ churned

### Widget 4.4 — Ações Vencidas (alerta)

```
 ⚠️ PRÓXIMAS AÇÕES VENCIDAS
 ──────────────────────────────────
 4 ações com prazo hoje ou passado

 ▸ Imob. X — Enviar proposta
   Venceu há 2 dias (Pedro V.)

 ▸ SaaS Y — Follow-up pós-demo
   Vence hoje (Luis F.)

 [Ver ações →]
```

- Dado: `GET /api/projects/[id]/clients` → filtrar `next_action_deadline <= hoje`
- Card em vermelho se qualquer ação vencida

---

## Seção 5 — Feed de Atividade Recente (rodapé)

Uma linha do tempo horizontal/vertical unificada que agrega eventos de TODOS os módulos.

```
 ATIVIDADE RECENTE                                    (atualiza a cada 60s)
 ──────────────────────────────────────────────────────────────────────────
 🟡 Daily   │ Luis F. · Impedimento: "Aguardando API do cliente" · 14min
 🟢 CRM     │ Perfeccto movido para Negociação · hoje 14:32
 🔵 Import  │ 3 features criadas via MD Feeder · hoje 11:00
 🟣 Retro   │ Ação "Melhorar PR review" concluída · ontem 16:45
 🟠 Risk    │ Novo risco crítico GUT=125: "Integração API falhou" · ontem
 ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
 [Ver mais atividade]
```

**Fontes de eventos do feed:**
| Cor | Módulo | Evento |
|---|---|---|
| 🟡 Amarelo | Daily Scrum | Impedimentos do dia |
| 🟢 Verde | CRM | Mudança de estágio no funil |
| 🔵 Azul | Import | MD Feeder executado |
| 🟣 Roxo | Retro | Ação atualizada |
| 🟠 Laranja | Risk | Risco crítico criado/atualizado |
| 🔴 Vermelho | Features | Feature marcada como blocked |
| ⚪ Cinza | Sprint | Snapshot de burndown |

**Implementação:** `GET /api/projects/[id]/activity-feed?limit=10` — novo endpoint
BFF que agrega eventos de múltiplas tabelas em ordem cronológica.

---

## Arquitetura de dados — estratégia de fetching

### Padrão BFF para o dashboard

Em vez de 8+ chamadas paralelas (que fragmentam o carregamento), criar um endpoint
agregador dedicado para o dashboard:

```
GET /api/projects/[id]/dashboard
```

**Retorna (tudo em uma chamada):**

```typescript
type DashboardData = {
  // KPI Strip
  health: { score: number; status: 'healthy' | 'warning' | 'critical' };
  sprint: {
    code: string; goal: string; status: string;
    points_done: number; points_total: number; days_remaining: number;
  };
  features: {
    total: number; done: number; blocked: number;
    by_status: Record<FeatureStatus, number>;
  };
  risks: { critical_count: number; analyzing_count: number };
  marketing: { posts_month: number; posts_target: number; on_time_rate: number };
  crm: { active_leads: number; hot_count: number; potential_revenue: number };

  // Seções
  burndown: BurndownSnapshot[];         // mini chart data
  mvp: { done: number; total: number; percentage: number };
  dod: { level: number; avg_compliance: number };
  retro_summary: { done: number; in_progress: number; pending: number };
  spikes: { active: number; timebox_hours: number };

  content_pipeline: Record<string, number>;  // por status
  next_publications: Publication[];          // próximas 3
  funnel_stages: Record<string, number>;     // por estágio
  hot_leads: UzzappClient[];                 // top 3
  revenue: { potential: number; mrr: number; setup: number };
  overdue_actions: number;

  // Feed
  activity_feed: ActivityEvent[];
};
```

**Refresh strategy:**
- `staleTime: 30_000` (30s) — dados do dashboard envelhecem em 30s
- `refetchInterval: 60_000` (60s) — re-fetch automático a cada minuto
- Invalidação manual após: imports MD, mudança de sprint status, novo cliente

---

## Componentes a criar

```
src/components/dashboard/enterprise/
├── enterprise-dashboard.tsx          ← componente raiz (substitui dashboard-content.tsx)
├── kpi-strip/
│   ├── kpi-card.tsx                  ← card genérico com valor, label, delta, cor
│   ├── health-kpi.tsx               ← saúde do projeto
│   ├── sprint-kpi.tsx               ← sprint atual
│   ├── features-kpi.tsx             ← features summary
│   ├── risks-kpi.tsx                ← risks críticos
│   ├── marketing-kpi.tsx            ← posts do mês
│   └── crm-kpi.tsx                  ← leads ativos
├── desenvolvimento/
│   ├── dev-column.tsx               ← coluna esquerda
│   ├── sprint-burndown-mini.tsx     ← mini burndown chart
│   ├── feature-pipeline-bar.tsx     ← stacked bar horizontal
│   ├── mvp-progress-gauge.tsx       ← radial gauge MVP
│   ├── dod-summary.tsx              ← DoD level + compliance
│   └── retro-spikes-summary.tsx     ← retro actions + spikes
├── marketing/
│   ├── marketing-column.tsx         ← coluna central
│   ├── posts-gauge.tsx              ← gauge posts/meta
│   ├── content-pipeline-bars.tsx    ← pipeline por status
│   ├── next-publications-list.tsx   ← próximas 3 pubs
│   └── ontime-rate-bar.tsx          ← taxa pontualidade
├── crm/
│   ├── crm-column.tsx               ← coluna direita
│   ├── funnel-bars.tsx              ← funil horizontal
│   ├── hot-leads-cards.tsx          ← top 3 hot leads
│   ├── revenue-summary.tsx          ← números de receita
│   └── overdue-actions-alert.tsx    ← ações vencidas
└── activity-feed/
    ├── activity-feed.tsx             ← feed unificado
    └── activity-event-item.tsx      ← linha do feed
```

**Total: 23 novos componentes**

---

## Fases de implementação

### Fase 1 — KPI Strip + Shell (fundação)

**O que entrega:** O layout do dashboard com a estrutura de 3 colunas e os 6 KPI cards no topo, mesmo que as seções de conteúdo ainda mostrem placeholders.

- [ ] `enterprise-dashboard.tsx` — layout grid (1 linha KPI + 3 colunas + rodapé)
- [ ] `kpi-card.tsx` — componente genérico
- [ ] Os 6 KPI cards individuais
- [ ] `POST /api/projects/[id]/dashboard` — endpoint BFF básico (retorna apenas KPI data)
- [ ] Substituir `dashboard-content.tsx` pelo novo

**Resultado:** Dashboard com visual enterprise desde o primeiro sprint. KPIs reais.

---

### Fase 2 — Coluna Desenvolvimento

**O que entrega:** A coluna de maior valor — o coração do projeto (sprints, features, MVP).

- [ ] `sprint-burndown-mini.tsx` — mini LineChart com Recharts
- [ ] `feature-pipeline-bar.tsx` — BarChart horizontal por status
- [ ] `mvp-progress-gauge.tsx` — RadialBarChart MVP
- [ ] `dod-summary.tsx` — DoD level + progress
- [ ] `retro-spikes-summary.tsx` — contadores de retro e spikes
- [ ] Expandir endpoint BFF com dados de desenvolvimento

**Resultado:** Coluna esquerda completa — dá a leitura completa do estado do produto.

---

### Fase 3 — Coluna Marketing

**O que entrega:** Visibilidade do fluxo de conteúdo sem abrir a seção de marketing.

- [ ] `posts-gauge.tsx` — RadialBarChart posts/meta
- [ ] `content-pipeline-bars.tsx` — BarChart pipeline de conteúdo
- [ ] `next-publications-list.tsx` — próximas 3 publicações
- [ ] `ontime-rate-bar.tsx` — on-time rate
- [ ] Expandir endpoint BFF com dados de marketing

**Resultado:** Coluna central completa — marketing visível na dashboard.

---

### Fase 4 — Coluna CRM

**O que entrega:** Pipeline de vendas sempre visível.

- [ ] `funnel-bars.tsx` — funil horizontal
- [ ] `hot-leads-cards.tsx` — top 3 hot leads com indicadores
- [ ] `revenue-summary.tsx` — números agregados
- [ ] `overdue-actions-alert.tsx` — alerta de ações vencidas
- [ ] Expandir endpoint BFF com dados CRM

**Resultado:** Coluna direita completa — CRM integrado ao dashboard.

---

### Fase 5 — Activity Feed

**O que entrega:** Linha do tempo unificada de todos os módulos.

- [ ] `activity-feed.tsx` + `activity-event-item.tsx`
- [ ] `GET /api/projects/[id]/activity-feed` — novo endpoint que faz UNION de queries
- [ ] Auto-refresh a cada 60s

**Resultado:** Dashboard totalmente vivo — mostra que a equipe está trabalhando.

---

## Sistema de cores semânticas (CSS variables)

```css
/* KPI Status */
--kpi-healthy:   #22c55e;  /* green-500 */
--kpi-warning:   #f59e0b;  /* amber-500 */
--kpi-critical:  #ef4444;  /* red-500 */
--kpi-neutral:   #6b7280;  /* gray-500 */

/* Feature Status (stacked bar) */
--status-backlog:    #e5e7eb; /* gray-200 */
--status-todo:       #93c5fd; /* blue-300 */
--status-in-progress:#3b82f6; /* blue-500 */
--status-review:     #a78bfa; /* violet-400 */
--status-testing:    #fb923c; /* orange-400 */
--status-done:       #22c55e; /* green-500 */
--status-blocked:    #ef4444; /* red-500 */

/* ICP Classification */
--icp-hot:    #ef4444; /* red */
--icp-warm:   #f59e0b; /* amber */
--icp-cold:   #60a5fa; /* blue */
--icp-future: #a78bfa; /* violet */

/* Activity Feed */
--feed-daily:   #f59e0b;
--feed-crm:     #22c55e;
--feed-import:  #3b82f6;
--feed-retro:   #a78bfa;
--feed-risk:    #f97316;
--feed-blocked: #ef4444;
```

---

## Decisões de design — por quê cada escolha

| Decisão | Alternativa descartada | Por quê |
|---|---|---|
| 3 colunas (Dev / Marketing / CRM) | 1 coluna scrollável | O sistema tem 3 domínios estratégicos distintos. Colocar em 1 coluna força o usuário a scrollar para entender o estado de cada domínio — perde o "overview". 3 colunas mostram os 3 domínios em paralelo. |
| KPI strip sempre visível (sticky) | Cards dentro de cada seção | Os 6 números mais críticos precisam ser consultados com frequência. Se ficarem no meio do conteúdo, o usuário faz scroll para cima toda vez. Strip sticky elimina esse atrito. |
| Endpoint BFF `/dashboard` em vez de 8 calls paralelos | React Query parallel queries | Com 8 calls paralelas, o dashboard "pisca" seção por seção durante o carregamento. 1 BFF call carrega tudo junto. Se a latência do BFF for > 1s, adicionar Suspense com skeleton. |
| Mini charts (150–200px) em vez de charts completos | Links para páginas individuais | O objetivo não é analisar no dashboard — é detectar anomalias. Um mini burndown que está subindo em vez de descer é o alerta perfeito para clicar em "Ver sprint". Chartezinhos = alerta visual. |
| Activity feed unificado no rodapé | Feed separado por módulo | Um feed por módulo repete a estrutura de navegação já existente no sidebar. O feed UNIFICADO é o diferencial — você vê que o Luis postou um impedimento, Pedro fechou um lead e foi feito um import, tudo em 5 segundos. Isso é inteligência operacional. |
| "Ver tudo →" em cada widget | Dados completos no dashboard | O dashboard é a entrada, não a sala de estar. Dados completos pertencem às páginas específicas que já existem. Colocar tudo no dashboard transforma ele em um scrollão de dados. |
| Recharts para mini charts | Canvas 2D puro | Recharts já está instalado, é responsivo, tem animação suave, e tem tipos TypeScript. Canvas 2D seria reescrever o que o Recharts já faz. |

---

## Dependências

**Zero novas dependências.** Tudo já está no projeto:

| Recurso | Biblioteca | Status |
|---|---|---|
| Mini charts (burndown, barras, gauge) | `recharts` | ✅ já instalado |
| UI cards / dialogs | `shadcn/ui` | ✅ já instalado |
| Ícones | `lucide-react` | ✅ já instalado |
| Data fetching | `@tanstack/react-query` | ✅ já instalado |
| Date formatting | `date-fns` | ✅ já instalado |
| Style utilities | `clsx`, `tailwind-merge` | ✅ já instalado |
