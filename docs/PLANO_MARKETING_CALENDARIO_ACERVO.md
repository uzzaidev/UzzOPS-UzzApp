# Plano de Implementação — Marketing: Calendário Editorial + Acervo de Conteúdo

**Versão:** 1.0
**Data:** 2026-02-13
**Status:** Draft para aprovação
**Contexto:** UzzOPS / UzzApp — seção nova de Marketing dentro do workspace do projeto

---

## 1. Visão Geral

### O que é

Uma seção dedicada de Marketing dentro do UzzOPS com dois pilares integrados:

**Pilar 1 — Calendário Editorial**
Visualização de todos os posts planejados/publicados em formato de calendário mensal (inspirado no HTML de referência `CALENDARIO-EDITORIAL-VISUAL.html`), com filtros por canal, tipo, projeto e status.

**Pilar 2 — Acervo de Conteúdo**
Repositório centralizado de assets de marketing: imagens, carrosséis, vídeos/reels, legendas e copies por canal. Funciona como um mini-DAM (Digital Asset Manager) interno, onde o time consegue fazer upload e organizar todo o material criativo.

### Como os dois pilares se conectam

```
CONTEÚDO (a ideia)
├── Ex: "Quem somos - Conheça Pedro Vitor"
├── Tipo: Feed
├── Caption base, hashtags, objetivo
├── Assets: [imagem_pedro.jpg, legenda_instagram.txt, legenda_linkedin.txt]
└── Publicações (scheduled by channel):
    ├── Instagram  → 01/02/2026 → status: agendado
    └── LinkedIn   → 01/02/2026 → status: publicado
```

O **Conteúdo** é a unidade criativa. As **Publicações** são as instâncias por canal e data. Os **Assets** são os arquivos físicos.

---

## 2. Análise da Referência Visual (HTML)

Do calendário HTML de referência, extraímos:

**Entidades:**
- Post tem: tipo (Reels/Feed/Carrossel/Stories), título, canal (Instagram/LinkedIn/Site), data, status
- O mesmo título aparece em múltiplos canais → confirma separação conteúdo × publicação

**Filtros necessários:**
- Por canal, tipo de conteúdo, mês, projeto, texto livre

**KPIs do header:**
- Total de posts, filtrados, agendados, publicados

**Charts:**
- Distribuição por canal, por tipo, por projeto

**Calendar view:**
- Grid 7 colunas (dia da semana)
- Cada célula = dia do mês com N posts
- Cores por tipo de post
- Badge por canal (In, Li, Si)
- Click → modal de detalhes

**O que o HTML NÃO tem e vamos adicionar:**
- Upload de arquivos (imagens, vídeos, legendas)
- Visualização do acervo (galeria)
- Edição e criação de conteúdo via formulário
- Histórico de publicação (link externo ao post publicado)
- Copies diferentes por canal (Instagram vs LinkedIn)
- Vista de lista além do calendário

---

## 3. Arquitetura de Dados — Esquema Completo

### 3.1 Visão macro das tabelas

```
marketing_campaigns          (agrupador opcional de conteúdos)
    ↓ (1:N)
marketing_content_pieces     (a ideia criativa — unidade central)
    ↓ (1:N)            ↓ (1:N)
marketing_publications     marketing_assets
(por canal + data)         (arquivos: imagens, vídeos, copies)
```

Tabela auxiliar:
```
marketing_channels           (canais configuráveis por tenant: Instagram, LinkedIn, etc.)
```

---

### 3.2 `marketing_campaigns`

Agrupa conjuntos de conteúdos em uma campanha ou período editorial.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID PK | |
| tenant_id | UUID NOT NULL FK tenants | |
| project_id | UUID FK projects | Nullable — campanha pode ser cross-project |
| name | TEXT NOT NULL | Ex: "Lançamento Fevereiro 2026" |
| description | TEXT | |
| objective | TEXT | Ex: "awareness", "conversion", "retention" |
| start_date | DATE | |
| end_date | DATE | |
| status | TEXT | 'active' \| 'draft' \| 'completed' \| 'archived' |
| color | TEXT | Hex color para identificação visual no calendário |
| created_by | UUID FK auth.users | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

---

### 3.3 `marketing_content_pieces`

A unidade criativa central. Representa "um conteúdo" antes de ser dividido por canal.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID PK | |
| tenant_id | UUID NOT NULL FK tenants | |
| project_id | UUID FK projects | A qual projeto do UzzOPS este conteúdo pertence |
| campaign_id | UUID FK marketing_campaigns | Nullable |
| code | TEXT UNIQUE | Auto-gerado: MKT-001, MKT-002, ... |
| title | TEXT NOT NULL | Título do conteúdo ("Quem somos - Conheça Pedro") |
| topic | TEXT | Tema/pilar editorial ("Quem Somos", "Serviços", "IA") |
| content_type | TEXT NOT NULL | 'reels' \| 'feed' \| 'carrossel' \| 'stories' \| 'artigo' \| 'video' |
| objective | TEXT | 'awareness' \| 'consideration' \| 'conversion' \| 'engagement' |
| brief | TEXT | Briefing completo do conteúdo |
| caption_base | TEXT | Legenda base (antes de adaptar por canal) |
| hashtags | TEXT[] | Lista de hashtags |
| cta | TEXT | Call to action do conteúdo |
| status | TEXT NOT NULL DEFAULT 'idea' | 'idea' \| 'briefing' \| 'production' \| 'review' \| 'approved' \| 'done' \| 'archived' |
| responsible_id | UUID FK team_members | Quem é responsável por criar |
| due_date | DATE | Prazo para ter o conteúdo pronto |
| notes | TEXT | Observações internas |
| created_by | UUID FK auth.users | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**Index:** `(tenant_id, project_id, content_type, status)`

---

### 3.4 `marketing_publications`

Cada linha = uma publicação em um canal em uma data. É o que aparece no calendário.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID PK | |
| tenant_id | UUID NOT NULL FK tenants | |
| content_piece_id | UUID NOT NULL FK marketing_content_pieces | |
| channel | TEXT NOT NULL | 'instagram' \| 'linkedin' \| 'site' \| 'tiktok' \| 'youtube' \| 'whatsapp' |
| channel_config_id | UUID FK marketing_channels | Config do canal (cor, nome exibido, etc.) |
| scheduled_date | DATE NOT NULL | Data planejada de publicação |
| scheduled_time | TIME | Horário de publicação (opcional) |
| status | TEXT NOT NULL DEFAULT 'idea' | 'idea' \| 'draft' \| 'scheduled' \| 'published' \| 'cancelled' |
| published_at | TIMESTAMPTZ | Quando foi efetivamente publicado |
| external_url | TEXT | Link do post publicado (Instagram.com/p/..., etc.) |
| caption_override | TEXT | Legenda específica deste canal (sobrescreve caption_base) |
| metrics_reach | INTEGER | Alcance (preenchido após publicação) |
| metrics_engagement | INTEGER | Engajamento (curtidas + comentários) |
| metrics_clicks | INTEGER | Cliques no link |
| notes | TEXT | |
| created_by | UUID FK auth.users | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**Index:** `(tenant_id, scheduled_date)` — usado pelo calendário
**Index:** `(tenant_id, content_piece_id)` — usado no detalhe do conteúdo
**Index:** `(tenant_id, status, scheduled_date)` — usado nos filtros

---

### 3.5 `marketing_assets` (o Acervo)

Cada linha = um arquivo ou texto vinculado a um conteúdo.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID PK | |
| tenant_id | UUID NOT NULL FK tenants | |
| content_piece_id | UUID FK marketing_content_pieces | Nullable — asset pode existir sem conteúdo (ex.: marca, logo) |
| asset_type | TEXT NOT NULL | 'image' \| 'video' \| 'carousel_slide' \| 'caption' \| 'copy' \| 'audio' \| 'reference' \| 'document' |
| file_name | TEXT NOT NULL | Nome original do arquivo |
| storage_path | TEXT | Caminho no Supabase Storage (bucket: marketing-assets) |
| public_url | TEXT | URL pública do arquivo |
| mime_type | TEXT | image/jpeg, video/mp4, text/plain, etc. |
| file_size_bytes | BIGINT | |
| width_px | INTEGER | Para imagens e vídeos |
| height_px | INTEGER | Para imagens e vídeos |
| duration_seconds | INTEGER | Para vídeos e áudios |
| sort_order | INTEGER DEFAULT 0 | Para ordenar slides de carrossel |
| caption_channel | TEXT | Se asset_type='copy': qual canal essa copy é para |
| caption_text | TEXT | Se asset_type='copy' ou 'caption': o texto da legenda |
| tags | TEXT[] | Tags livres: 'aprovado', 'rascunho', 'v2', etc. |
| is_approved | BOOLEAN DEFAULT false | Aprovação pelo responsável |
| notes | TEXT | Anotação sobre o asset |
| uploaded_by | UUID FK auth.users | |
| created_at | TIMESTAMPTZ | |

**Storage bucket Supabase:** `marketing-assets`
**Path pattern:** `{tenant_id}/{content_piece_id}/{asset_id}_{file_name}`
**Para assets globais (sem content_piece):** `{tenant_id}/global/{asset_id}_{file_name}`

---

### 3.6 `marketing_channels`

Canais configuráveis por tenant.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID PK | |
| tenant_id | UUID NOT NULL FK tenants | |
| name | TEXT NOT NULL | "Instagram", "LinkedIn", "Site UzzAI" |
| platform | TEXT NOT NULL | 'instagram' \| 'linkedin' \| 'tiktok' \| 'youtube' \| 'site' \| 'whatsapp' \| 'other' |
| color | TEXT DEFAULT '#3b82f6' | Hex — cor no calendário |
| icon_key | TEXT | chave do ícone (mapeia para Lucide icon) |
| profile_url | TEXT | URL do perfil neste canal |
| is_active | BOOLEAN DEFAULT true | |
| created_at | TIMESTAMPTZ | |

---

## 4. Supabase Storage — Estrutura do Acervo

```
Bucket: marketing-assets
├── [tenant_id]/
│   ├── global/                         # Assets sem vínculo com conteúdo (logos, marcas)
│   │   ├── [asset_id]_logo.png
│   │   └── [asset_id]_brand_kit.pdf
│   └── [content_piece_id]/             # Assets de um conteúdo específico
│       ├── [asset_id]_capa.jpg         # Imagem principal (feed/stories)
│       ├── [asset_id]_slide_01.png     # Slide 1 do carrossel
│       ├── [asset_id]_slide_02.png     # Slide 2 do carrossel
│       ├── [asset_id]_reel.mp4         # Vídeo do reel
│       └── [asset_id]_legenda_insta.txt # Copy para Instagram
```

**Políticas de acesso Storage:**
- Leitura pública: apenas se `public_url` estiver setada e `is_approved=true`
- Escrita: apenas usuários autenticados no tenant
- Deleção: apenas `admin` ou `uploaded_by`

---

## 5. API — Endpoints Necessários

### 5.1 Calendário e Publicações

```
GET  /api/marketing/publications
     ?from=2026-02-01&to=2026-02-28
     &channel=instagram&status=scheduled
     &project_id=xxx
     → lista de publicações para o calendário

GET  /api/marketing/publications/[id]
POST /api/marketing/publications
PATCH /api/marketing/publications/[id]
DELETE /api/marketing/publications/[id]

GET  /api/marketing/publications/stats
     ?month=2026-02
     → { total, scheduled, published, cancelled, by_channel, by_type }
```

### 5.2 Conteúdos

```
GET  /api/marketing/content
     ?status=production&content_type=carrossel&project_id=xxx
GET  /api/marketing/content/[id]
POST /api/marketing/content
PATCH /api/marketing/content/[id]
DELETE /api/marketing/content/[id]

POST /api/marketing/content/[id]/publications
     → cria publicações em múltiplos canais de uma vez
     body: { channels: ['instagram','linkedin'], scheduled_date: '2026-03-01' }
```

### 5.3 Acervo (Assets)

```
GET  /api/marketing/assets
     ?content_piece_id=xxx&asset_type=image&tags[]=aprovado
GET  /api/marketing/assets/[id]

POST /api/marketing/assets/upload
     Content-Type: multipart/form-data
     body: { file, content_piece_id?, asset_type, caption_channel?, tags[] }
     → faz upload para Supabase Storage + cria registro em marketing_assets

PATCH /api/marketing/assets/[id]   → atualizar metadados (tags, notas, aprovação)
DELETE /api/marketing/assets/[id]  → remove do Storage + registro

POST /api/marketing/assets/[id]/approve
     → marca is_approved=true (admin only)
```

### 5.4 Campanhas e Canais

```
GET  /api/marketing/campaigns
POST /api/marketing/campaigns
PATCH /api/marketing/campaigns/[id]

GET  /api/marketing/channels          → lista canais do tenant
POST /api/marketing/channels
PATCH /api/marketing/channels/[id]
```

**Segurança:** Todos os endpoints passam por `requireTenant()`. Upload de assets exige autenticação. Aprovação de assets exige `requireAdmin()`.

---

## 6. Estrutura de Rotas UI

```
/projects/[projectId]/marketing/
├── page.tsx                    → Calendário Editorial (view padrão)
├── conteudos/
│   ├── page.tsx                → Lista de conteúdos (tabela/kanban por status)
│   └── [id]/
│       └── page.tsx            → Detalhe do conteúdo + assets + publicações
├── acervo/
│   └── page.tsx                → Galeria de assets (com upload + filtros)
└── campanhas/
    └── page.tsx                → Lista de campanhas
```

**Item no sidebar:** "Marketing" com ícone `Megaphone` (Lucide)

---

## 7. UI — Detalhamento das Views

### 7.1 Calendário Editorial (`/marketing`)

```
┌───────────────────────────────────────────────────────────────┐
│ MARKETING — Calendário Editorial              [+ Nova Pub]    │
├───────────────────────────────────────────────────────────────┤
│ KPIs: [67 posts] [65 agendados] [2 publicados] [0 produção]  │
├───────────────────────────────────────────────────────────────┤
│ Filtros: Canal | Tipo | Projeto | Mês | [Busca...]            │
├───────────────────────────────────────────────────────────────┤
│ ← Fevereiro 2026 →                [Vista: Calendário | Lista] │
│                                                               │
│  Dom   Seg   Ter   Qua   Qui   Sex   Sáb                     │
│ ┌────┐ ┌────┐ ┌────┐ ...                                     │
│ │    │ │ 2  │ │ 3  │                                         │
│ │    │ │🤖Ca│ │    │                                         │
│ │    │ │In  │ │    │                                         │
│ └────┘ └────┘ └────┘                                         │
└───────────────────────────────────────────────────────────────┘
```

**Cores por tipo** (igual ao HTML de referência):
- Reels → azul
- Feed → roxo
- Carrossel → verde
- Stories → amarelo

**Badge por canal:** In (Instagram), Li (LinkedIn), Si (Site), Tk (TikTok)

**Click em post no calendário →** abre drawer lateral (não modal) com:
- Título + tipo + canal + status
- Caption do conteúdo
- Thumbnail do asset principal (se houver)
- Botões: Editar | Ver conteúdo completo | Marcar como publicado

### 7.2 Vista Lista (alternativa ao calendário)

Tabela com colunas: Data, Título, Tipo, Canal, Projeto, Status, Ações

### 7.3 Detalhe do Conteúdo (`/marketing/conteudos/[id]`)

```
┌─────────────────────────────────────────────────────────────┐
│ MKT-023 · Feed · Quem Somos                [Editar] [Pub+]  │
│ Status: ● Em Produção                                       │
├───────────────┬─────────────────────────────────────────────┤
│ INFORMAÇÕES   │ PUBLICAÇÕES                                 │
│               │ Canal        Data         Status            │
│ Projeto: -    │ Instagram    01/02/2026   ✅ Publicado      │
│ Topic:        │ LinkedIn     01/02/2026   ⏳ Agendado       │
│ Objetivo:     │                  [+ Adicionar publicação]   │
│ Brief:        ├─────────────────────────────────────────────┤
│               │ ASSETS (ACERVO)                             │
│ Caption base: │ ┌──────┐ ┌──────┐ ┌──────┐ [+ Upload]     │
│               │ │img   │ │leg.in│ │leg.li│                 │
│ CTA:          │ │      │ │ .txt │ │ .txt │                 │
│ Hashtags:     │ └──────┘ └──────┘ └──────┘                 │
└───────────────┴─────────────────────────────────────────────┘
```

**Seção de Assets no detalhe:**
- Thumbnails de imagens/vídeos em grid
- Ícone de documento para copies/legendas
- Preview inline ao clicar
- Botão de download
- Badge de aprovação
- Drag para reordenar slides de carrossel

### 7.4 Acervo (`/marketing/acervo`)

```
┌───────────────────────────────────────────────────────┐
│ ACERVO DE CONTEÚDO                   [+ Upload]       │
├───────────────────────────────────────────────────────┤
│ Filtros: Tipo | Conteúdo | Status | Tags | Busca      │
├───────────────────────────────────────────────────────┤
│ [Imagens] [Vídeos] [Legendas] [Carrosséis] [Todos]   │
├───────────────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│ │ img  │ │ img  │ │ vid  │ │ txt  │ │ img  │       │
│ │      │ │  ✓   │ │      │ │Legda │ │      │       │
│ │MKT023│ │MKT024│ │MKT025│ │Insta │ │MKT026│       │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘       │
└───────────────────────────────────────────────────────┘
```

**Funcionalidades do Acervo:**
- Grid de miniaturas (com lazy loading)
- Preview lightbox ao clicar
- Upload por drag-and-drop ou clique (múltiplos arquivos)
- Associar asset a um conteúdo existente
- Aprovar/reprovar asset
- Download individual ou em lote
- Filtrar por: tipo, conteúdo associado, aprovado/não, tags

### 7.5 Modal de Upload de Asset

```
┌─────────────────────────────────────────────────────┐
│ Upload de Asset                               [×]   │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │                                                 │ │
│ │     Arraste arquivos aqui ou clique para        │ │
│ │     selecionar                                  │ │
│ │     PNG, JPG, MP4, MOV, TXT, PDF — max 50MB    │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Tipo de Asset:  [Imagem ▼]                          │
│ Conteúdo:       [MKT-023 - Conheça Pedro ▼]         │
│ Canal:          [Instagram ▼]  (para copies)        │
│ Tags:           [aprovado] [v2] [+ adicionar]       │
│ Notas:          [______________________________]    │
│                                                     │
│                          [Cancelar] [Fazer Upload]  │
└─────────────────────────────────────────────────────┘
```

### 7.6 Drawer lateral do post no calendário

Ao clicar em um post no calendário, abre drawer à direita (não interrompe a visão do calendário):

```
┌────────────────────────────────┐
│ MKT-007 · Carrossel · In       │
│ Nossos serviços Peladeiros -   │
│ Cansado de jogar sozinho?      │
├────────────────────────────────┤
│ Status: ⏳ Agendado            │
│ Data: 11/02/2026               │
│ Canal: Instagram               │
├────────────────────────────────┤
│ [thumbnail do asset principal] │
├────────────────────────────────┤
│ Caption:                       │
│ "Você ainda organiza pelada    │
│ no zap? ..."                  │
├────────────────────────────────┤
│ Assets: [img1][img2][+3]       │
├────────────────────────────────┤
│ [Editar] [Ver Conteúdo]        │
│ [✓ Marcar Publicado]           │
└────────────────────────────────┘
```

---

## 8. Lógica de Criação de Conteúdo → Publicações

O fluxo natural é:

```
1. Criar Conteúdo (content_piece) com título, tipo, briefing, caption base
       ↓
2. Fazer upload dos assets (imagens, vídeo, legendas)
       ↓
3. Agendar publicações: selecionar canais + datas
   → cria N registros em marketing_publications (um por canal)
       ↓
4. No dia da publicação, usuário abre o detalhe e faz o download/copy do material
       ↓
5. Após publicar externamente, volta ao sistema e marca como "publicado" + cola URL externa
```

**Atalho: publicação em lote**
No formulário de conteúdo, um campo "Publicar em:" permite selecionar múltiplos canais e uma data → cria todas as publicações de uma vez.

---

## 9. Relação com o Resto do UzzOPS

| Módulo UzzOPS | Integração com Marketing |
|---|---|
| **Projetos** | `content_pieces.project_id` → conteúdo associado a um projeto |
| **Features** | Opcional: feature de tipo "Marketing" pode gerar automaticamente um content_piece |
| **Team Members** | `content_pieces.responsible_id` → responsável pelo conteúdo |
| **Dashboard** | KPI: "Posts agendados esta semana", "Posts publicados no mês" |
| **Export** | Exportar calendário editorial em CSV/PDF |

---

## 10. Plano de Implementação em Fases

### Fase 1 — Fundação + Calendário (MVP)

1. Migration `018_marketing.sql`:
   - Criar tabelas: `marketing_channels`, `marketing_campaigns`, `marketing_content_pieces`, `marketing_publications`
   - RLS policies tenant-scoped para todas as tabelas
   - Seed de canais padrão por tenant (Instagram, LinkedIn, Site)
   - Index em `marketing_publications(tenant_id, scheduled_date)`

2. API mínima:
   - `GET /api/marketing/publications` com filtros de data + channel
   - `POST /api/marketing/publications` (criação individual)
   - `PATCH /api/marketing/publications/[id]` (status, data)
   - `GET /api/marketing/publications/stats`

3. UI — Calendário:
   - Página `/marketing` com grid mensal (componente `MarketingCalendar`)
   - Filtros: canal, tipo, mês
   - Drawer lateral ao clicar num post
   - KPI cards no topo
   - Botão "Nova Publicação" abre formulário simples

### Fase 2 — Conteúdos + Publicação em Lote

4. API:
   - CRUD de `marketing_content_pieces`
   - `POST /api/marketing/content/[id]/publications` (publicação em múltiplos canais)
   - `GET /api/marketing/content` com filtros

5. UI:
   - Página `/marketing/conteudos` (lista com kanban por status)
   - Detalhe de conteúdo com seção de publicações vinculadas
   - Formulário de criação de conteúdo com agendamento em lote

### Fase 3 — Acervo de Assets

6. Supabase Storage:
   - Criar bucket `marketing-assets`
   - Configurar policies de acesso (autenticado por tenant)

7. API:
   - `POST /api/marketing/assets/upload` (multipart, upload para Storage)
   - `GET /api/marketing/assets` com filtros
   - `PATCH /api/marketing/assets/[id]` (metadados, aprovação)
   - `DELETE /api/marketing/assets/[id]`

8. UI:
   - Página `/marketing/acervo` (galeria com grid + filtros)
   - Componente de upload (drag-and-drop)
   - Preview lightbox
   - Asset section no detalhe do conteúdo

### Fase 4 — Métricas e Refinamentos

9. Campos de performance pós-publicação:
   - `metrics_reach`, `metrics_engagement`, `metrics_clicks` em `marketing_publications`

10. Dashboard de marketing:
    - Posts por canal (mês corrente vs mês anterior)
    - Taxa de publicação no prazo (agendado → publicado on time)
    - Volume de assets por tipo no acervo

11. Exportação:
    - CSV do calendário (integração com módulo de export existente)
    - ZIP dos assets de um conteúdo

---

## 11. Tipos e Enumerações

```typescript
// src/types/index.ts — adições

type MarketingContentType =
  | 'reels' | 'feed' | 'carrossel' | 'stories' | 'artigo' | 'video'

type MarketingContentStatus =
  | 'idea' | 'briefing' | 'production' | 'review' | 'approved' | 'done' | 'archived'

type MarketingPublicationStatus =
  | 'idea' | 'draft' | 'scheduled' | 'published' | 'cancelled'

type MarketingAssetType =
  | 'image' | 'video' | 'carousel_slide' | 'caption' | 'copy' | 'audio' | 'reference' | 'document'

type MarketingChannelPlatform =
  | 'instagram' | 'linkedin' | 'tiktok' | 'youtube' | 'site' | 'whatsapp' | 'other'
```

---

## 12. Critérios de Aceite

**Calendário:**
- [ ] Grid mensal mostrando publicações por dia, com cores por tipo e badge por canal
- [ ] Navegação mês anterior / próximo
- [ ] Filtros funcionando: canal, tipo, projeto/campanha, busca texto
- [ ] KPI cards atualizando com os filtros
- [ ] Drawer lateral ao clicar numa publicação
- [ ] Criar/editar/cancelar publicação via formulário

**Conteúdos:**
- [ ] CRUD completo de content_pieces
- [ ] Associar conteúdo a um projeto
- [ ] Criar publicações em múltiplos canais com uma ação
- [ ] Ver todas as publicações de um conteúdo no detalhe

**Acervo:**
- [ ] Upload de arquivos (imagem, vídeo, texto) via drag-and-drop
- [ ] Associar asset a um conteúdo
- [ ] Galeria visual com filtros por tipo e conteúdo
- [ ] Preview inline de imagens
- [ ] Download de asset
- [ ] Aprovar/reprovar asset (admin)
- [ ] Copies separadas por canal

**Segurança:**
- [ ] Multi-tenant: RLS em todas as tabelas marketing_*
- [ ] Storage: usuário só acessa assets do seu tenant
- [ ] Aprovação de asset requer role admin

---

## 13. Decisões em Aberto

| Decisão | Opção A | Opção B | Recomendação |
|---|---|---|---|
| Escopo da seção | Vinculado a projeto | Tenant-level (cross-project) | **B** — marketing é da empresa, não de um projeto específico. `project_id` opcional para vincular quando quiser |
| Vista padrão | Calendário | Lista | **Calendário** (como no HTML de referência) |
| Upload de vídeo | Supabase Storage direto | Link externo (YouTube/Drive) | **Híbrido** — ambos suportados (campo `storage_path` OU `external_url` no asset) |
| Copies por canal | Campo livre `caption_override` | Tabela separada `publication_copies` | **Campo livre** no MVP — tabela separada se volume crescer |
| Notificação de prazo | Sem notificação | Badge visual "vence hoje/amanhã" | **Badge visual** sem email no MVP |

---

*Documento criado para orientar a implementação da seção de Marketing no UzzOPS.*
*Revisar decisões em aberto (§13) antes de iniciar a codificação.*
