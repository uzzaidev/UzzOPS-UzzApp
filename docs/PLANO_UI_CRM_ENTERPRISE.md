# Plano UI Enterprise — CRM Clients & Leads
## UzzOPS | Visão de Design e Arquitetura Frontend

> **Status:** Plano de Design — Não executado
> **Escopo:** Redesign completo das views de clientes para nível enterprise
> **Base de dados:** migrations 023 + 025, parser.ts, phase1-executor.ts
> **Estado atual:** `clients-page-content.tsx` (lista + formulário inline) e `client-details-content.tsx` (4 cards + histórico simples)

---

## 1. O Problema com o Estado Atual

O código existente trata clientes como um simples CRUD. O banco (pós-025) acumula dados
de alta densidade — BANT snapshots, FIT scores, stakeholders, insights estruturados,
histórico de interações com sentimento e deal_outcome. Mas o frontend não expõe nenhuma
dessas dimensões de forma visual e acionável.

**Lacunas críticas hoje:**
- `icp_classification` (hot/warm/cold/future) não tem badge visual
- `bant_snapshot` / `fit_snapshot` no cliente são dados invisíveis
- `stakeholders_json` nunca é renderizado
- `business_context` fica soterrado em texto simples
- `insights_json` dos contatos não tem seção própria
- `deal_outcome` não é usado para nenhuma visualização de pipeline
- Sem visão Kanban do funil — impossível ver gargalos de conversão
- Sem KPIs agregados de CRM (valor total em pipeline, taxa de conversão)
- Contatos (ATAs) aparecem como lista plana sem hierarquia visual

---

## 2. Visão Geral da Arquitetura de Views

```
/projects/[id]/clients              ← VIEW 1: Pipeline/Lista híbrida
/projects/[id]/clients/[cid]        ← VIEW 2: Perfil Enterprise
/projects/[id]/clients/[cid]/contacts/[ctId]  ← VIEW 3: ATA Detail (nova rota)
```

Um dashboard de CRM pode ser integrado na página principal do projeto ou como
view dedicada em `/projects/[id]/crm-dashboard`.

---

## 3. VIEW 1 — Pipeline de Clientes (redesign de clients-page-content.tsx)

### 3.1 Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  TOPBAR: "Clientes & Leads"  [Pipeline ▼] [Lista]  [+ Novo Cliente] │
│  Filtros: [ICP ▼] [Responsável ▼] [Produto ▼] [Stage ▼] [Busca 🔍] │
├─────────────────────────────────────────────────────────────────────┤
│  KPI STRIP                                                           │
│  [🔥 Hot: 3] [🌡 Warm: 7] [🧊 Cold: 4] [⏳ Future: 5] | Pipeline:  │
│  R$ 42k     | Fechados: 2 | Churn risk: 1 | Ação Vencida: 3         │
├─────────────────────────────────────────────────────────────────────┤
│  MODO PIPELINE (Kanban)                                              │
│  ┌──────┬──────────┬─────────┬────────────┬────────┬───────────┐   │
│  │Lead  │Qualific. │Proposta │Negociacao  │Fechado │Stand-by   │   │
│  │Novo  │          │         │            │        │           │   │
│  │ (2)  │   (5)    │  (3)    │    (4)     │  (2)   │   (3)     │   │
│  ├──────┼──────────┼─────────┼────────────┼────────┼───────────┤   │
│  │[card]│[card]    │[card]   │[card]      │[card]  │[card]     │   │
│  │[card]│[card]    │[card]   │[card]      │[card]  │[card]     │   │
│  │      │[card]    │         │[card]      │        │[card]     │   │
│  └──────┴──────────┴─────────┴────────────┴────────┴───────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Anatomia do Client Card (Kanban)

```
┌─────────────────────────────────────┐
│ 🔥 HOT    Perfeccto Imobi     65%  ●│  ← ICP badge | prob gauge
│ Cristian Grazziotion                │  ← main_contact_name
│ CHATBOT  •  📅 Último: 3d           │  ← produto | last_contact_date
│ R$ 15.000             ⚠ Ação vencida│  ← potential_value | alerta
│ [Pedro Vitor]                       │  ← responsavel_vendas avatar
└─────────────────────────────────────┘
```

**POR QUÊ Kanban:**
O funil de vendas é um processo sequencial. Visualizar como colunas permite
identificar gargalos instantaneamente (ex: 8 leads em "qualificado", 0 em
"proposta" = problema de conversão). Não é possível ver isso em tabela flat.
Padrão mental de SDRs e closers — Salesforce, HubSpot, Pipedrive usam Kanban
exatamente por isso.

**POR QUÊ KPI Strip:**
Métricas de topo são a razão #1 pelo qual um gestor abre a tela. Ele precisa
saber em 3 segundos: "quantos leads quentes tenho? Qual o pipeline total?
Tenho ações vencidas?". KPI Strip acima do Kanban responde tudo sem scroll.

**POR QUÊ ICP badge com cor:**
`icp_classification` (hot/warm/cold/future) é o qualificador mais rápido de
prioridade. Cor imediata: vermelho-laranja = hot, amarelo = warm, azul = cold,
roxo = future. O olho vai direto para o hot sem ler texto.

### 3.3 Modo Lista (toggle)

Mantém a tabela atual mas com colunas enriquecidas:

| Nome | Empresa | ICP | Stage | Prob% | Valor Pipe | Último Contato | Ação |
|------|---------|-----|-------|-------|-----------|----------------|------|

Colunas configuráveis (show/hide). Ordenação por qualquer coluna.
Linha expandível inline para ver bant_snapshot sem sair da lista.

---

## 4. VIEW 2 — Perfil Enterprise do Cliente (redesign client-details-content.tsx)

### 4.1 Layout Split-Panel 3 zonas

```
┌──────────────────────────────────────────────────────────────────────┐
│ HEADER STICKY                                                         │
│ Perfeccto Imobiliária  [🔥 FUTURE]  Stand-by  ══════════ 15%  ●     │
│ Cristian Grazziotion (Sócio)  •  CHATBOT  •  📅 02/02/2026           │
│ [Editar]  [Novo Contato]  [Marcar Reunião]  [⋮ Mais ações]           │
├──────────────────┬───────────────────────────────┬───────────────────┤
│ SIDEBAR ESQUERDA │ CONTEÚDO PRINCIPAL (tabs)      │ PAINEL DIREITO    │
│ 240px fixo       │ flex-1, scroll independente    │ 280px fixo        │
│                  │                                │                   │
│ 📋 Empresa       │ [Histórico][Análise][Empresa]  │ 🎯 Próximas Ações │
│ Segmento         │                                │ ──────────────    │
│ Cidade/Estado    │ ← Tab ativa: Histórico →       │ ⚠ Ação vencida   │
│ Website          │  [ATA card 1] [ATA card 2]     │ ✓ Check-in Q2    │
│ CNPJ             │                                │                   │
│                  │                                │ 💰 Financeiro     │
│ 👥 Stakeholders  │                                │ Pipeline: 15k     │
│ [Cristian]       │                                │ Mensalidade: 1,2k │
│ Alta autoridade  │                                │ Setup: 3k         │
│                  │                                │                   │
│ 🏢 Contexto      │                                │ 📊 BANT Snapshot  │
│ [texto colaps.]  │                                │ [radar mini 80px] │
│                  │                                │ 11/20 ⚠          │
│ 📈 Lead Volume   │                                │                   │
│ ~2 leads/dia     │                                │ 🎯 FIT Snapshot   │
│ [barra vermelha] │                                │ [radar mini 80px] │
│                  │                                │ 20/25 ✓           │
└──────────────────┴───────────────────────────────┴───────────────────┘
```

**POR QUÊ Split-Panel 3 colunas:**
- Sidebar esquerda: dados ESTÁTICOS da empresa. Não mudam por interação.
  Sempre visíveis independente da tab ativa. Evita o "onde está o CNPJ?" quando
  consultando um histórico de reunião.
- Centro com tabs: dados DINÂMICOS que crescem com cada interação. Precisam
  de scroll próprio sem mover os dados fixos.
- Painel direito: dados ACIONÁVEIS (próximas ações, financeiro, scores rápidos).
  O gestor precisa ver "o que fazer agora" sem sair do perfil.

### 4.2 Header Sticky com Probability Gauge

O header não scrollar é crítico. Quando você está lendo a 10ª interação de
um cliente, precisa lembrar quem é, qual o estágio e a probabilidade.
O gauge visual (arco/radial) comunica 15% vs 80% muito mais rápido que "15%".

**Probability Gauge:**
```
     ╭─────╮
   ╱  15%   ╲     verde > 60%
  │    ●     │    amarelo 30-60%
  ╰──────────╯    vermelho < 30%
```

### 4.3 Tab: Histórico de Interações (Timeline)

```
  2026-02-02  ●─────────────────────────────────────────┐
  FEEDBACK    │ 🔴 Negativo   Stand-by   15%             │
  Presencial  │ Cristian × Vitor                         │
              │ "Volume baixo não justifica automação"   │
              │ BANT: 11/20  FIT: 20/25                  │
              │ [3 objeções] [5 próx. passos] [4 insigh] │
              │ [Ver ATA completa →]                     │
              └──────────────────────────────────────────┘

  2025-11-25  ●─────────────────────────────────────────┐
  NEGOCIACAO  │ 🟡 Neutro    Em Andamento  40%           │
  WhatsApp    │ Cristian × Vitor, Luis, Pedro            │
              │ "Discovery call — apresentação IA"       │
              │ BANT: 15/20  FIT: 20/25                  │
              │ [1 objeção] [2 próx. passos] [2 insigh]  │
              │ [Ver ATA completa →]                     │
              └──────────────────────────────────────────┘
```

**POR QUÊ timeline vertical com cards colapsáveis:**
O histórico é lido cronologicamente (mais recente primeiro). O card collapsed
mostra o essencial (data, tipo, sentimento, BANT/FIT, contagem de objeções/
insights) sem forçar leitura completa. Click expande o ATA full. Padrão GitHub
PR timeline / Jira issue history.

**POR QUÊ sentimento com cor e ícone:**
`sentimento_geral` (Positivo/Neutro/Negativo) é o estado emocional da reunião.
Verde/amarelo/vermelho como ícone antes do resumo avisa antes mesmo de ler:
"essa reunião foi ruim, cuidado".

### 4.4 Tab: Análise BANT & FIT

```
┌──────────────────────────┬──────────────────────────┐
│   BANT — Última interação │   FIT — Última interação  │
│                           │                           │
│      Budget ■■■□□         │   Produto ■■■□□           │
│   Authority ■■■■■         │   Mercado ■■■■■           │
│        Need ■■□□□         │ Financeiro ■■■□□          │
│    Timeline ■□□□□         │   Cultural ■■■■■          │
│                           │   Técnico  ■■■■□          │
│   Total: 11/20  ⚠         │   Total: 20/25  ✓         │
│   [Radar Chart]           │   [Radar Chart]           │
└──────────────────────────┴──────────────────────────┘

Evolução BANT ao longo do tempo:
  16/20  ●────────────────────────────────────────
  12/20          ●
  11/20                   ●  ← atual
  Nov/25        Feb/26
```

**POR QUÊ radar chart para BANT/FIT:**
Um spider/radar chart mostra simultaneamente 4-5 dimensões e seus gaps.
Um olhar na "teia" revela: "Authority alta, Timeline fraca = comprador
comprometido mas sem urgência". 5 números separados não comunicam isso.
Padrão Salesforce Einstein, HubSpot Lead Score.

**POR QUÊ evolução temporal do score:**
BANT não é estático. De 15/20 para 11/20 entre novembro e fevereiro mostra
deterioração da necessidade e timeline. Esse trend é o sinal de alerta que
o SDR precisa para recalibrar estratégia. Linha de trend = ação preventiva.

### 4.5 Tab: Dores, Objeções & Insights

Layout em 3 colunas de cards:

```
┌──────────────────┬────────────────────┬───────────────────┐
│ 💔 DORES (3)     │ 🚧 OBJEÇÕES (3)    │ 💡 INSIGHTS (4)   │
├──────────────────┼────────────────────┼───────────────────┤
│ [urgencia: MEDIA]│ O-001 Não Resolvida│ [CRÍTICO]         │
│ Filtros bugados  │ Volume baixo não   │ Volume leads =     │
│ e limitados      │ justifica...       │ fator decisivo    │
│                  │                    │                    │
│ [urgencia: BAIXA]│ O-002 Parc. Resol. │ [CRÍTICO]         │
│ Sem atendimento  │ High Ticket exige  │ Locação 2027 =    │
│ 24/7             │ humano direto      │ oportunidade      │
│                  │                    │                    │
│ [urgencia: BAIXA]│ O-003 Não Resolvida│ [VENDAS]          │
│ Perguntas        │ Sem timing agora   │ Sem perguntar      │
│ repetitivas      │                    │ preço = valor     │
└──────────────────┴────────────────────┴───────────────────┘
```

**POR QUÊ 3 colunas lado a lado:**
Dores, objeções e insights têm uma relação direta:
- Dor X → gerou Objeção Y → originou Insight Z
Ver os 3 lado a lado cria o raciocínio "dor → resistência → aprendizado"
num único contexto visual. Tabelas separadas quebram essa narrativa.

**POR QUÊ badge de urgência nas dores:**
`urgencia` (alta/media/baixa) deve ter cor imediata. Vermelho = crítico,
precisa aparecer na proposta. Cinza = latente, não urgente. Sem cor o
vendedor lê tudo igualmente — perde foco no que importa.

**POR QUÊ badge de status nas objeções:**
"Não Resolvida" em vermelho vs "Resolvida" em verde vs "Parcialmente
Resolvida" em amarelo diz ao vendedor exatamente onde focar no próximo
contato. Sem status visual, todas as objeções parecem igualmente pendentes.

**POR QUÊ badge de tipo nos insights:**
`tipo: critico` em vermelho-escuro vs `tipo: vendas` em azul vs `tipo:
produto` em índigo. Insights críticos precisam ser lidos primeiro —
são os que mudam a abordagem de vendas. Badge de tipo cria essa hierarquia.

### 4.6 Tab: Stakeholders

```
┌──────────────────────────────────────────────────────┐
│  MAPA DE DECISÃO                                     │
│                                                       │
│  ┌──────────────────────────────────────────────┐    │
│  │  [Avatar] Cristian Grazziotion               │    │
│  │  Sócio/Corretor                              │    │
│  │  Autoridade: ████████ Alta                   │    │
│  │  Influência:  ████████ Alta                  │    │
│  │  "Decisor direto. Faz atendimento pessoal.   │    │
│  │   Valoriza humanização."                     │    │
│  └──────────────────────────────────────────────┘    │
│                                                       │
│  [+ Adicionar Stakeholder]                           │
└──────────────────────────────────────────────────────┘
```

---

## 5. VIEW 3 — ATA Detail (nova rota: /contacts/[id])

Rota nova: `src/app/projects/[projectId]/clients/[clientId]/contacts/[contactId]/page.tsx`
Componente novo: `src/components/clients/contact-detail-content.tsx`

### 5.1 Layout

```
┌────────────────────────────────────────────────────────────────────┐
│ ← Perfeccto Imobiliária                                            │
│                                                                    │
│ Feedback — 02/02/2026 — Presencial — 🔴 Negativo — Stand-by 15%   │
├────────────────────────┬───────────────────────────────────────────┤
│ COLUNA ESQUERDA        │ COLUNA DIREITA                            │
│                        │                                           │
│ 📊 SCORES              │ BANT Radar Chart (240px)                  │
│ BANT: 11/20 ⚠          │ FIT Radar Chart (240px)                   │
│ FIT: 20/25 ✓           │                                           │
│                        ├───────────────────────────────────────────┤
│ 👥 Participantes       │ 💡 Insights (cards compactos)             │
│ UzzAI: Vitor           │ [CRÍTICO] Volume leads...                 │
│ Cliente: Cristian      │ [CRÍTICO] Locação 2027...                 │
│                        │ [VENDAS] Sem perguntar preço...           │
│ 📋 Dashboard Exec      │ [VENDAS] Nutrição de relacionamento...    │
│ Desfecho: Stand-by     ├───────────────────────────────────────────┤
│ Competidor: Nenhum     │ 🚀 Próximos Passos (timeline)             │
│ Decisão: ...           │ ○ ongoing — Nutrição trimestral           │
│ Estratégia: ...        │ ○ 2026-04-01 — Check-in Q2               │
│ Justificativa: ...     │ ○ 2026-07-01 — Check-in Q3               │
│                        │ ○ 2027-01-01 — Retomar conversa          │
├────────────────────────┴───────────────────────────────────────────┤
│ 💔 DORES | 🚧 OBJEÇÕES | ✅ CHECKLIST — accordion por seção       │
├────────────────────────────────────────────────────────────────────┤
│ 📝 ATA COMPLETA (summary_md renderizado como markdown)             │
│ [texto formatado com headers, listas, blockquotes]                 │
└────────────────────────────────────────────────────────────────────┘
```

**POR QUÊ rota separada para ATA:**
Uma ATA completa com insights, objeções, scores, próximos passos, markdown
tem densidade suficiente para uma página inteira. Comprimir tudo no perfil
do cliente (já denso) criaria scroll interminável. A rota separada também
permite compartilhar a ATA como link direto (ex: "manda o link da reunião
do Cristian").

**POR QUÊ summary_md renderizado como markdown:**
O campo `summary_md` contém headers, listas, blockquotes, tabelas — markdown
rico. Renderizá-lo como texto plain é perder toda a estrutura. Use `react-markdown`
com `remark-gfm` para tabelas e callouts. O conteúdo passa a ter a mesma
qualidade visual do Notion/Obsidian onde foi escrito.

---

## 6. Componentes Novos a Criar

| Componente | Local | Propósito |
|---|---|---|
| `ClientKanbanBoard` | components/clients/ | Pipeline visual por funnel_stage |
| `ClientCard` | components/clients/ | Card do Kanban com ICP badge |
| `IcpBadge` | components/clients/ | Badge hot/warm/cold/future com cores |
| `ProbabilityGauge` | components/clients/ | Arco radial de 0-100% |
| `BANTRadarChart` | components/clients/ | Radar Recharts para BANT |
| `FITRadarChart` | components/clients/ | Radar Recharts para FIT |
| `BANTFITEvolution` | components/clients/ | Linha temporal de score |
| `ContactTimeline` | components/clients/ | Timeline vertical de interações |
| `StakeholderCard` | components/clients/ | Card de stakeholder com autoridade |
| `DoresColumn` | components/clients/ | Lista de dores com badge urgência |
| `ObjecoesColumn` | components/clients/ | Lista de objeções com badge status |
| `InsightsColumn` | components/clients/ | Lista de insights com badge tipo |
| `ProximosPassosList` | components/clients/ | Timeline de next steps |
| `QualityChecklist` | components/clients/ | Checklist com progresso |
| `ContactDetailContent` | components/clients/ | View completa da ATA |
| `CrmKpiStrip` | components/clients/ | Barra de KPIs do pipeline |
| `LeadVolumeMeter` | components/clients/ | Barra visual de lead_daily_volume |
| `MarkdownRenderer` | components/shared/ | react-markdown com gfm |

---

## 7. Dependências a Instalar

```bash
pnpm add recharts          # radar charts (Recharts tem RadarChart nativo)
pnpm add react-markdown remark-gfm  # renderizar summary_md
pnpm add @dnd-kit/core @dnd-kit/sortable  # drag-and-drop no Kanban (fase 2)
```

`recharts` já pode estar no projeto (checar package.json). `react-markdown`
é essencial para o summary_md e não tem alternativa razoável no ecossistema Next.js.

---

## 8. Modificações em Arquivos Existentes

| Arquivo | O que muda |
|---|---|
| `clients-page-content.tsx` | Adicionar toggle Pipeline/Lista, KPI Strip, passar dados de icp_classification e last_contact_date para cards |
| `client-details-content.tsx` | Refatorar layout para split-panel 3 colunas, adicionar tabs, integrar novos componentes |
| `useClients.ts` | Adicionar `useClientStats(projectId)` para KPIs agregados |
| `src/app/api/projects/[id]/clients/route.ts` | Garantir que retorna icp_classification, bant_snapshot, fit_snapshot, last_contact_date, lead_daily_volume |

---

## 9. Sistema de Cores Enterprise

```
ICP Classification:
  hot    → bg-red-500/10   text-red-600   border-red-200   ícone: 🔥
  warm   → bg-amber-500/10 text-amber-600 border-amber-200 ícone: 🌡
  cold   → bg-blue-500/10  text-blue-600  border-blue-200  ícone: 🧊
  future → bg-purple-500/10 text-purple-600 border-purple-200 ícone: ⏳

Deal Outcome:
  open     → blue-500
  won      → emerald-500
  lost     → red-500
  stand_by → amber-500

Sentimento:
  Positivo → emerald-500  ícone: 🟢
  Neutro   → amber-500    ícone: 🟡
  Negativo → red-500      ícone: 🔴

Urgência (dores):
  alta  → red-600
  media → amber-600
  baixa → slate-400

Tipo de Insight:
  critico  → rose-700
  vendas   → blue-600
  produto  → indigo-600
  processo → slate-600

Status de Objeção:
  Resolvida           → emerald-600
  Parcialmente Resolvida → amber-600
  Nao Resolvida       → red-600

BANT/FIT Score:
  >= 80%  → emerald (excelente)
  50-79%  → amber   (atenção)
  < 50%   → red     (crítico)
```

---

## 10. Hierarquia de Implementação (ordem recomendada)

**Fase 1 — Componentes Base (sem novas rotas)**
1. `IcpBadge` + `ProbabilityGauge` — visíveis imediatamente no perfil
2. `BANTRadarChart` + `FITRadarChart` — substitui os números brutos atuais
3. `StakeholderCard` — renderiza stakeholders_json que hoje é invisível
4. `InsightsColumn` + `DoresColumn` + `ObjecoesColumn` — dados existem, faltam views
5. `ContactTimeline` — redesign do histórico de contatos

**Fase 2 — Pipeline Kanban**
6. `IcpBadge` + `ClientCard` — componentes do Kanban
7. `CrmKpiStrip` — query de agregação + exibição
8. `ClientKanbanBoard` — orquestra colunas e cards

**Fase 3 — ATA Detail**
9. `MarkdownRenderer` — react-markdown
10. `ContactDetailContent` — nova rota `/contacts/[id]`

**Fase 4 — Interatividade**
11. Drag-and-drop no Kanban (atualiza funnel_stage via PATCH)
12. Inline edit de próximos passos e checklist
13. Filtros salvos por responsável/produto/ICP

---

## 11. Por Que Enterprise e Não Apenas "Bonito"

Enterprise UI não é apenas visual. É sobre **densidade informacional com
clareza de ação**:

1. **O usuário sabe o que fazer em < 5 segundos** — KPI strip, ação vencida
   em destaque, próximas ações no painel direito.

2. **Dados escondidos tornam-se visíveis** — `bant_snapshot`, `insights_json`,
   `stakeholders_json` existem no banco mas são invisíveis hoje. Cada campo
   novo do banco precisa ter um "endereço visual" correspondente.

3. **Progressão de contexto** — Pipeline (macro) → Perfil (meso) → ATA (micro).
   Cada nível revela mais detalhe sem sobrecarregar o anterior.

4. **Reduz carga cognitiva do vendedor** — Ele não precisa "montar o contexto"
   lendo parágrafos. A UI monta o contexto para ele: badges, gauges e charts
   comunicam em paralelo. Texto só para nuances.

5. **Signals de alerta proativos** — "3 ações vencidas", "último contato: 45 dias",
   "BANT caiu de 15 para 11" não precisam ser procurados — aparecem.
