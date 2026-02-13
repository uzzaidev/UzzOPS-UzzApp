# 🔧 SPRINT 6 - OPERACIONAL
## Documentação Completa e Executável

**Versão:** 1.0
**Data:** 2026-02-07
**Duração:** 2 semanas
**Story Points:** 16 pts
**Dependências:** Sprints 3, 4, 5 completos

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [User Stories](#user-stories)
   - [US-6.1: Daily Scrum Logger](#us-61-daily-scrum-logger-5-pts)
   - [US-6.2: Spike Tracking](#us-62-spike-tracking-4-pts)
   - [US-6.3: Export de Relatórios](#us-63-export-de-relatórios-4-pts)
   - [US-6.4: Stealth Mode](#us-64-stealth-mode-3-pts)
3. [Arquitetura Técnica](#arquitetura-técnica)
4. [Database Schema](#database-schema)
5. [Implementation Guide](#implementation-guide)
6. [Testing Strategy](#testing-strategy)
7. [Checklist de Qualidade](#checklist-de-qualidade)

---

## 🎯 VISÃO GERAL

### Objetivo do Sprint 6

Completar funcionalidades **operacionais do dia-a-dia** que fazem o sistema ser usado diariamente com fluência:
- Registro rápido de Daily Scrums
- Tracking de Spikes (trabalho exploratório)
- Export profissional de relatórios
- Stealth Mode para apresentações

### Problema Atual

**Operação trabalhosa:**
```
❌ Dailies não registradas (conhecimento perdido)
❌ Spikes misturados com histórias normais
❌ Relatórios manuais no PowerPoint/Excel
❌ Dados sensíveis aparecem em demos
```

### Solução Sprint 6

**Operação fluida:**
```
✅ Daily em < 1 minuto (template rápido)
✅ Spikes rastreados separadamente com outcomes
✅ Export automático (PDF, Excel, apresentação)
✅ Stealth Mode esconde dados sensíveis
```

---

## 📊 USER STORIES

### US-6.1: Daily Scrum Logger (5 pts)

**Como** Team Member
**Quero** registrar meu Daily Scrum em < 1 minuto
**Para** manter histórico e compartilhar com time assíncrono

#### Métricas

- **Business Value:** 8 (Média - facilita comunicação)
- **Work Effort:** 3 (Baixa - formulário simples)
- **BV/W Ratio:** 2.67 (Alta prioridade)
- **Story Points:** 5 pts

#### Critérios de Aceitação

1. ✅ Consigo abrir modal "Log Daily" com 1 clique
2. ✅ Formulário tem 3 campos:
   - Ontem: O que fiz ontem (textarea com autocomplete de features)
   - Hoje: O que farei hoje (textarea com autocomplete)
   - Impedimentos: Lista (opcional)
3. ✅ Posso salvar em < 30 segundos
4. ✅ Consigo ver histórico de Dailies (timeline)
5. ✅ Consigo ver Dailies de outros membros (transparência)
6. ✅ Daily aparece no dashboard do projeto
7. ✅ Notificação lembra de registrar Daily (9h da manhã)
8. ✅ Posso editar Daily do mesmo dia

#### Database Schema

```sql
-- Daily Scrum Logs
CREATE TABLE daily_scrum_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
  team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- As 3 perguntas do Daily
  what_did_yesterday TEXT NOT NULL,
  what_will_do_today TEXT NOT NULL,
  impediments TEXT[], -- Array de impedimentos

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(team_member_id, log_date) -- 1 log por pessoa por dia
);

-- Linking dailies com features (opcional mas útil)
CREATE TABLE daily_feature_mentions (
  daily_log_id UUID NOT NULL REFERENCES daily_scrum_logs(id) ON DELETE CASCADE,
  feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  mention_type TEXT NOT NULL CHECK (mention_type IN ('yesterday', 'today')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (daily_log_id, feature_id, mention_type)
);

-- Índices
CREATE INDEX idx_daily_scrum_logs_project ON daily_scrum_logs(project_id);
CREATE INDEX idx_daily_scrum_logs_sprint ON daily_scrum_logs(sprint_id);
CREATE INDEX idx_daily_scrum_logs_member ON daily_scrum_logs(team_member_id);
CREATE INDEX idx_daily_scrum_logs_date ON daily_scrum_logs(log_date DESC);

-- RLS Policies
ALTER TABLE daily_scrum_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_feature_mentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view dailies of their projects" ON daily_scrum_logs
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE organization_id IN (
      SELECT organization_id FROM team_members WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can manage their own dailies" ON daily_scrum_logs
  FOR ALL USING (
    team_member_id IN (SELECT id FROM team_members WHERE user_id = auth.uid())
  );

-- View: Daily summary por sprint
CREATE OR REPLACE VIEW daily_scrum_summary AS
SELECT
  dsl.sprint_id,
  dsl.log_date,
  COUNT(DISTINCT dsl.team_member_id) as members_logged,
  COUNT(DISTINCT tm.id) as total_members,
  ROUND((COUNT(DISTINCT dsl.team_member_id)::float / NULLIF(COUNT(DISTINCT tm.id), 0) * 100)::numeric, 2) as participation_rate,
  COUNT(dsl.id) FILTER (WHERE cardinality(dsl.impediments) > 0) as members_with_blockers
FROM daily_scrum_logs dsl
JOIN sprints s ON dsl.sprint_id = s.id
CROSS JOIN team_members tm
WHERE tm.organization_id = (SELECT organization_id FROM projects WHERE id = s.project_id)
GROUP BY dsl.sprint_id, dsl.log_date;
```

#### API Endpoints

**1. POST /api/daily-logs**

```typescript
// src/app/api/daily-logs/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const body = await request.json()

  // Get current user's team member ID
  const { data: user } = await supabase.auth.getUser()
  const { data: member } = await supabase
    .from('team_members')
    .select('id')
    .eq('user_id', user?.user?.id)
    .single()

  if (!member) {
    return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
  }

  // Upsert (create or update if already exists for today)
  const { data, error } = await supabase
    .from('daily_scrum_logs')
    .upsert({
      project_id: body.projectId,
      sprint_id: body.sprintId,
      team_member_id: member.id,
      log_date: body.logDate || new Date().toISOString().split('T')[0],
      what_did_yesterday: body.whatDidYesterday,
      what_will_do_today: body.whatWillDoToday,
      impediments: body.impediments || [],
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'team_member_id,log_date'
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // If features were mentioned, link them
  if (body.mentionedFeatures?.length > 0) {
    const mentions = body.mentionedFeatures.map((m: any) => ({
      daily_log_id: data.id,
      feature_id: m.featureId,
      mention_type: m.type
    }))

    await supabase.from('daily_feature_mentions').insert(mentions)
  }

  return NextResponse.json({ data })
}
```

**2. GET /api/projects/[id]/daily-logs**

```typescript
// Get daily logs for project
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const sprintId = searchParams.get('sprintId')
  const limit = parseInt(searchParams.get('limit') || '30')

  let query = supabase
    .from('daily_scrum_logs')
    .select(`
      *,
      team_member:team_members(id, name, avatar_url),
      sprint:sprints(id, name)
    `)
    .eq('project_id', params.id)
    .order('log_date', { ascending: false })
    .limit(limit)

  if (sprintId) {
    query = query.eq('sprint_id', sprintId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ data })
}
```

**3. GET /api/daily-logs/my-latest**

```typescript
// Get my latest daily (for pre-filling form)
export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')

  const { data: user } = await supabase.auth.getUser()
  const { data: member } = await supabase
    .from('team_members')
    .select('id')
    .eq('user_id', user?.user?.id)
    .single()

  const { data } = await supabase
    .from('daily_scrum_logs')
    .select('*')
    .eq('team_member_id', member?.id)
    .eq('project_id', projectId)
    .order('log_date', { ascending: false })
    .limit(1)
    .single()

  return NextResponse.json({ data })
}
```

#### Hooks

```typescript
// src/hooks/daily/useDailyLogs.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface DailyLog {
  id: string
  project_id: string
  sprint_id: string
  log_date: string
  what_did_yesterday: string
  what_will_do_today: string
  impediments: string[]
  team_member: {
    id: string
    name: string
    avatar_url: string
  }
}

export function useDailyLogs(projectId: string, sprintId?: string) {
  return useQuery({
    queryKey: ['daily-logs', projectId, sprintId],
    queryFn: async () => {
      const params = new URLSearchParams({ sprintId: sprintId || '' })
      const res = await fetch(`/api/projects/${projectId}/daily-logs?${params}`)
      if (!res.ok) throw new Error('Failed to fetch daily logs')
      const { data } = await res.json()
      return data as DailyLog[]
    },
    enabled: !!projectId
  })
}

export function useMyLatestDaily(projectId: string) {
  return useQuery({
    queryKey: ['my-latest-daily', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/daily-logs/my-latest?projectId=${projectId}`)
      if (!res.ok) return null
      const { data } = await res.json()
      return data
    },
    enabled: !!projectId
  })
}

export function useCreateDailyLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (log: Partial<DailyLog>) => {
      const res = await fetch('/api/daily-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log)
      })
      if (!res.ok) throw new Error('Failed to create daily log')
      const { data } = await res.json()
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-logs'] })
      queryClient.invalidateQueries({ queryKey: ['my-latest-daily'] })
    }
  })
}
```

#### Componente - Daily Log Modal

```typescript
// src/components/daily/daily-log-modal.tsx
'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useCreateDailyLog, useMyLatestDaily } from '@/hooks/daily/useDailyLogs'
import { Loader2, Plus, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface Props {
  projectId: string
  sprintId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DailyLogModal({ projectId, sprintId, open, onOpenChange }: Props) {
  const [yesterday, setYesterday] = useState('')
  const [today, setToday] = useState('')
  const [impediments, setImpediments] = useState<string[]>([])
  const [newImpediment, setNewImpediment] = useState('')

  const { data: latestDaily } = useMyLatestDaily(projectId)
  const createDaily = useCreateDailyLog()

  // Pre-fill with yesterday's "today" → becomes today's "yesterday"
  useEffect(() => {
    if (latestDaily && !yesterday) {
      setYesterday(latestDaily.what_will_do_today || '')
    }
  }, [latestDaily])

  const handleAddImpediment = () => {
    if (newImpediment.trim()) {
      setImpediments([...impediments, newImpediment.trim()])
      setNewImpediment('')
    }
  }

  const handleRemoveImpediment = (idx: number) => {
    setImpediments(impediments.filter((_, i) => i !== idx))
  }

  const handleSubmit = () => {
    createDaily.mutate(
      {
        projectId,
        sprintId,
        what_did_yesterday: yesterday,
        what_will_do_today: today,
        impediments
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          setYesterday('')
          setToday('')
          setImpediments([])
        }
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Daily Scrum Log</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Yesterday */}
          <div>
            <Label htmlFor="yesterday">1. What did I do yesterday?</Label>
            <Textarea
              id="yesterday"
              value={yesterday}
              onChange={(e) => setYesterday(e.target.value)}
              placeholder="Completed feature X, reviewed PR #123, fixed bug..."
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Today */}
          <div>
            <Label htmlFor="today">2. What will I do today?</Label>
            <Textarea
              id="today"
              value={today}
              onChange={(e) => setToday(e.target.value)}
              placeholder="Will implement feature Y, attend planning meeting..."
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Impediments */}
          <div>
            <Label>3. Any impediments? (Optional)</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={newImpediment}
                onChange={(e) => setNewImpediment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddImpediment()}
                placeholder="Blocked by API issue..."
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddImpediment}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {impediments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {impediments.map((imp, idx) => (
                  <Badge key={idx} variant="destructive" className="gap-1">
                    {imp}
                    <button onClick={() => handleRemoveImpediment(idx)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!yesterday || !today || createDaily.isPending}
            >
              {createDaily.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                'Save Daily Log'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

#### DoD Checklist

- [ ] Modal de Daily funciona
- [ ] Autocomplete de ontem → hoje
- [ ] Impedimentos com tags
- [ ] Timeline de dailies visível
- [ ] Notificação às 9h (opcional)
- [ ] Code review aprovado
- [ ] PO aceitou

---

### US-6.2: Spike Tracking (4 pts)

**Como** Scrum Master
**Quero** rastrear Spikes separadamente de User Stories
**Para** medir tempo de pesquisa e aprendizado sem inflar velocity

#### Métricas

- **Business Value:** 5 (Média-Baixa - importante mas não crítico)
- **Work Effort:** 2 (Baixa - flag + campos)
- **BV/W Ratio:** 2.50 (Alta prioridade)
- **Story Points:** 4 pts

#### Critérios de Aceitação

1. ✅ Posso marcar feature como "Spike" (checkbox)
2. ✅ Spikes têm time-box (max horas, ex: 8h)
3. ✅ Spikes têm campo "Learning Outcome" (o que descobrimos)
4. ✅ Spikes **não contam** para velocity
5. ✅ Dashboard mostra Spikes separadamente
6. ✅ Posso converter Spike → User Story após pesquisa
7. ✅ Relatório de Spikes (quantos, outcomes, tempo gasto)

#### Database Schema

```sql
-- Adicionar campos ao features
ALTER TABLE features ADD COLUMN IF NOT EXISTS is_spike BOOLEAN DEFAULT false;
ALTER TABLE features ADD COLUMN IF NOT EXISTS spike_timebox_hours INT; -- Max horas
ALTER TABLE features ADD COLUMN IF NOT EXISTS spike_outcome TEXT; -- O que descobrimos
ALTER TABLE features ADD COLUMN IF NOT EXISTS spike_converted_to_story_id UUID REFERENCES features(id); -- Se virou história

-- View: Spike summary
CREATE OR REPLACE VIEW spike_summary AS
SELECT
  s.id as sprint_id,
  s.project_id,
  COUNT(DISTINCT f.id) FILTER (WHERE f.is_spike) as total_spikes,
  COUNT(DISTINCT f.id) FILTER (WHERE f.is_spike AND f.status = 'done') as spikes_done,
  SUM(f.spike_timebox_hours) FILTER (WHERE f.is_spike) as total_timebox_hours,
  COUNT(DISTINCT f.id) FILTER (WHERE f.is_spike AND f.spike_outcome IS NOT NULL) as spikes_with_outcomes,
  COUNT(DISTINCT f.spike_converted_to_story_id) FILTER (WHERE f.is_spike) as spikes_converted
FROM sprints s
LEFT JOIN sprint_features sf ON s.id = sf.sprint_id
LEFT JOIN features f ON sf.feature_id = f.id
GROUP BY s.id, s.project_id;

-- Atualizar sprint_velocity para EXCLUIR spikes
DROP MATERIALIZED VIEW IF EXISTS sprint_velocity CASCADE;

CREATE MATERIALIZED VIEW sprint_velocity AS
SELECT
  s.id as sprint_id,
  s.project_id,
  s.name as sprint_name,
  s.start_date,
  s.end_date,
  s.goal,

  -- Contar features (EXCLUINDO SPIKES)
  COUNT(DISTINCT f.id) FILTER (WHERE f.status = 'done' AND NOT f.is_spike) as features_done,
  COUNT(DISTINCT f.id) FILTER (WHERE NOT f.is_spike) as total_features,

  -- Velocity (EXCLUINDO SPIKES)
  COALESCE(SUM(f.story_points) FILTER (WHERE f.status = 'done' AND NOT f.is_spike), 0) as velocity,
  COALESCE(SUM(f.story_points) FILTER (WHERE NOT f.is_spike), 0) as total_committed_points,

  -- Completion rate (EXCLUINDO SPIKES)
  ROUND((COALESCE(SUM(f.story_points) FILTER (WHERE f.status = 'done' AND NOT f.is_spike), 0)::float /
         NULLIF(SUM(f.story_points) FILTER (WHERE NOT f.is_spike), 0) * 100)::numeric, 2) as completion_rate
FROM sprints s
LEFT JOIN sprint_features sf ON s.id = sf.sprint_id
LEFT JOIN features f ON sf.feature_id = f.id
GROUP BY s.id, s.project_id, s.name, s.start_date, s.end_date, s.goal;

-- Refresh materialized view
REFRESH MATERIALIZED VIEW sprint_velocity;
```

#### API Endpoints

**PATCH /api/features/[id] - Update to mark as Spike**

```typescript
// Already exists, just allow spike fields
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  const body = await request.json()

  const updates: any = {}

  if (body.is_spike !== undefined) updates.is_spike = body.is_spike
  if (body.spike_timebox_hours !== undefined) updates.spike_timebox_hours = body.spike_timebox_hours
  if (body.spike_outcome !== undefined) updates.spike_outcome = body.spike_outcome
  if (body.spike_converted_to_story_id !== undefined) updates.spike_converted_to_story_id = body.spike_converted_to_story_id

  const { data, error } = await supabase
    .from('features')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ data })
}
```

**GET /api/sprints/[id]/spikes**

```typescript
// Get spike summary for sprint
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })

  const { data: summary } = await supabase
    .from('spike_summary')
    .select('*')
    .eq('sprint_id', params.id)
    .single()

  const { data: spikes } = await supabase
    .from('features')
    .select('*')
    .eq('sprint_id', params.id)
    .eq('is_spike', true)

  return NextResponse.json({
    data: {
      summary,
      spikes
    }
  })
}
```

#### Hook

```typescript
// src/hooks/spikes/useSpikes.ts
import { useQuery } from '@tanstack/react-query'

export function useSpikes(sprintId: string) {
  return useQuery({
    queryKey: ['spikes', sprintId],
    queryFn: async () => {
      const res = await fetch(`/api/sprints/${sprintId}/spikes`)
      if (!res.ok) throw new Error('Failed to fetch spikes')
      const { data } = await res.json()
      return data
    },
    enabled: !!sprintId
  })
}
```

#### Componente - Spike Badge & Card

```typescript
// src/components/features/spike-badge.tsx
import { Badge } from '@/components/ui/badge'
import { Lightbulb } from 'lucide-react'

interface Props {
  spike: {
    spike_timebox_hours?: number
    spike_outcome?: string
  }
}

export function SpikeBadge({ spike }: Props) {
  return (
    <Badge variant="outline" className="gap-1">
      <Lightbulb className="h-3 w-3" />
      Spike
      {spike.spike_timebox_hours && (
        <span className="ml-1 text-xs">({spike.spike_timebox_hours}h)</span>
      )}
    </Badge>
  )
}

// src/components/spikes/spike-outcome-card.tsx
export function SpikeOutcomeCard({ spike }: { spike: Feature }) {
  if (!spike.is_spike) return null

  return (
    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="h-4 w-4" />
        <span className="font-medium text-sm">Spike Outcome</span>
      </div>
      {spike.spike_outcome ? (
        <p className="text-sm">{spike.spike_outcome}</p>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          No outcome recorded yet
        </p>
      )}
    </div>
  )
}
```

#### DoD Checklist

- [ ] Posso marcar feature como Spike
- [ ] Time-box visível
- [ ] Outcome pode ser registrado
- [ ] Spikes NÃO contam na velocity
- [ ] Dashboard mostra spikes separadamente
- [ ] Posso converter Spike → Story
- [ ] Code review aprovado
- [ ] PO aceitou

---

### US-6.3: Export de Relatórios (4 pts)

**Como** Product Owner
**Quero** exportar relatórios profissionais (PDF, Excel, PowerPoint)
**Para** apresentar progresso para stakeholders

#### Métricas

- **Business Value:** 8 (Média - importante para stakeholders)
- **Work Effort:** 5 (Média - integração com libs de export)
- **BV/W Ratio:** 1.60 (Prioridade média)
- **Story Points:** 4 pts

#### Critérios de Aceitação

1. ✅ Botão "Export" em Dashboard, Sprints, Metrics
2. ✅ Posso escolher formato:
   - PDF (relatório executivo com gráficos)
   - Excel (dados tabulares)
   - JSON (para integração)
3. ✅ PDF inclui:
   - Logo do projeto
   - Velocity chart
   - Burndown chart
   - Lista de features Done
   - Scrum Health score
4. ✅ Excel inclui sheets:
   - Velocity (por sprint)
   - Features (todas)
   - Spikes (se houver)
5. ✅ Export gera arquivo em < 5 segundos
6. ✅ Posso customizar quais seções incluir

#### Bibliotecas Necessárias

```bash
pnpm add jspdf jspdf-autotable
pnpm add xlsx
pnpm add html2canvas # Para capturar gráficos
```

#### API Endpoint

**GET /api/projects/[id]/export**

```typescript
// src/app/api/projects/[id]/export/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'json'
  const projectId = params.id

  // Fetch all data
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  const { data: velocity } = await supabase
    .from('sprint_velocity')
    .select('*')
    .eq('project_id', projectId)

  const { data: features } = await supabase
    .from('features')
    .select('*')
    .eq('project_id', projectId)

  const { data: health } = await supabase
    .from('scrum_health_metrics')
    .select('*')
    .eq('project_id', projectId)
    .single()

  const exportData = {
    project,
    velocity,
    features,
    health,
    generated_at: new Date().toISOString()
  }

  // Excel export
  if (format === 'excel') {
    const wb = XLSX.utils.book_new()

    // Sheet 1: Velocity
    const velocitySheet = XLSX.utils.json_to_sheet(velocity || [])
    XLSX.utils.book_append_sheet(wb, velocitySheet, 'Velocity')

    // Sheet 2: Features
    const featuresSheet = XLSX.utils.json_to_sheet(features || [])
    XLSX.utils.book_append_sheet(wb, featuresSheet, 'Features')

    // Sheet 3: Health
    const healthSheet = XLSX.utils.json_to_sheet([health] || [])
    XLSX.utils.book_append_sheet(wb, healthSheet, 'Health')

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${project.name}-report.xlsx"`
      }
    })
  }

  // JSON export (default)
  return NextResponse.json(exportData)
}
```

#### Componente - Export Button

```typescript
// src/components/export/export-button.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Download, FileSpreadsheet, FileJson, Loader2 } from 'lucide-react'
import { generatePDFReport } from '@/lib/export/pdf-generator'

interface Props {
  projectId: string
  projectName: string
}

export function ExportButton({ projectId, projectName }: Props) {
  const [loading, setLoading] = useState(false)

  const handleExport = async (format: 'excel' | 'pdf' | 'json') => {
    setLoading(true)

    try {
      if (format === 'pdf') {
        // Generate PDF client-side (to capture charts)
        await generatePDFReport(projectId, projectName)
      } else {
        // Download from API
        const res = await fetch(`/api/projects/${projectId}/export?format=${format}`)
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${projectName}-report.${format === 'excel' ? 'xlsx' : 'json'}`
        a.click()
      }
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={loading}>
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Exporting...</>
          ) : (
            <><Download className="mr-2 h-4 w-4" /> Export</>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <Download className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('excel')}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')}>
          <FileJson className="mr-2 h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

#### PDF Generator (Client-side)

```typescript
// src/lib/export/pdf-generator.ts
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import html2canvas from 'html2canvas'

export async function generatePDFReport(projectId: string, projectName: string) {
  const pdf = new jsPDF()

  // Fetch data
  const res = await fetch(`/api/projects/${projectId}/export?format=json`)
  const data = await res.json()

  // Title
  pdf.setFontSize(20)
  pdf.text(`${projectName} - Scrum Report`, 14, 22)

  // Subtitle
  pdf.setFontSize(10)
  pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30)

  // Velocity Table
  pdf.setFontSize(14)
  pdf.text('Velocity by Sprint', 14, 45)

  autoTable(pdf, {
    startY: 50,
    head: [['Sprint', 'Velocity', 'Completion Rate']],
    body: data.velocity.map((v: any) => [
      v.sprint_name,
      v.velocity,
      `${v.completion_rate}%`
    ])
  })

  // Health Score
  const finalY = (pdf as any).lastAutoTable.finalY || 50
  pdf.text('Scrum Health', 14, finalY + 15)
  pdf.text(`Score: ${data.health.health_score}/100`, 14, finalY + 22)

  // Capture chart (if visible on page)
  const chartElement = document.querySelector('#velocity-chart')
  if (chartElement) {
    const canvas = await html2canvas(chartElement as HTMLElement)
    const imgData = canvas.toDataURL('image/png')
    pdf.addPage()
    pdf.text('Velocity Chart', 14, 22)
    pdf.addImage(imgData, 'PNG', 14, 30, 180, 100)
  }

  // Save
  pdf.save(`${projectName}-report.pdf`)
}
```

#### DoD Checklist

- [ ] Export Excel funciona
- [ ] Export PDF funciona (com gráficos)
- [ ] Export JSON funciona
- [ ] Formato customizável
- [ ] Gera em < 5 segundos
- [ ] Code review aprovado
- [ ] PO aceitou

---

### US-6.4: Stealth Mode (3 pts)

**Como** Product Owner
**Quero** ativar "Stealth Mode" em demos
**Para** esconder dados sensíveis (clientes, valores, nomes reais)

#### Métricas

- **Business Value:** 5 (Média-Baixa - nice to have)
- **Work Effort:** 2 (Baixa - substituição de strings)
- **BV/W Ratio:** 2.50 (Alta prioridade)
- **Story Points:** 3 pts

#### Critérios de Aceitação

1. ✅ Toggle "Stealth Mode" no header (visível apenas para admin/PO)
2. ✅ Quando ativado:
   - Nomes de features → "Feature A", "Feature B", etc.
   - Nomes de clientes → "Client 1", "Client 2", etc.
   - Valores monetários → "$ XXX"
   - Avatares → placeholder genérico
3. ✅ Gráficos continuam funcionando (apenas labels mudam)
4. ✅ Modo persiste durante sessão (sessionStorage)
5. ✅ Indicador visual claro de que está em Stealth Mode
6. ✅ Posso desativar com 1 clique

#### Implementation (Client-side only - No DB changes)

```typescript
// src/lib/stealth-mode.ts
export function useStealthMode() {
  const [isEnabled, setIsEnabled] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('stealth-mode')
    setIsEnabled(stored === 'true')
  }, [])

  const toggle = () => {
    const newValue = !isEnabled
    setIsEnabled(newValue)
    sessionStorage.setItem('stealth-mode', String(newValue))
  }

  return { isEnabled, toggle }
}

export function obfuscateText(text: string, type: 'feature' | 'client' | 'money', index: number = 0): string {
  if (type === 'feature') return `Feature ${String.fromCharCode(65 + index)}` // A, B, C...
  if (type === 'client') return `Client ${index + 1}`
  if (type === 'money') return '$ XXX'
  return text
}
```

#### Componente - Stealth Toggle

```typescript
// src/components/ui/stealth-mode-toggle.tsx
'use client'

import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { EyeOff } from 'lucide-react'
import { useStealthMode } from '@/lib/stealth-mode'
import { Badge } from '@/components/ui/badge'

export function StealthModeToggle() {
  const { isEnabled, toggle } = useStealthMode()

  return (
    <div className="flex items-center gap-2">
      {isEnabled && (
        <Badge variant="secondary" className="gap-1">
          <EyeOff className="h-3 w-3" />
          Stealth Mode ON
        </Badge>
      )}
      <div className="flex items-center gap-2">
        <Switch
          id="stealth-mode"
          checked={isEnabled}
          onCheckedChange={toggle}
        />
        <Label htmlFor="stealth-mode" className="cursor-pointer text-sm">
          Stealth Mode
        </Label>
      </div>
    </div>
  )
}
```

#### Usage in Components

```typescript
// Example: In features table
import { useStealthMode, obfuscateText } from '@/lib/stealth-mode'

export function FeaturesTable({ features }: Props) {
  const { isEnabled } = useStealthMode()

  return (
    <Table>
      {features.map((feature, idx) => (
        <TableRow key={feature.id}>
          <TableCell>
            {isEnabled ? obfuscateText(feature.title, 'feature', idx) : feature.title}
          </TableCell>
        </TableRow>
      ))}
    </Table>
  )
}
```

#### DoD Checklist

- [ ] Toggle funciona
- [ ] Nomes obfuscados corretamente
- [ ] Gráficos ainda renderizam
- [ ] Indicador visual de modo ativo
- [ ] Persiste durante sessão
- [ ] Code review aprovado
- [ ] PO aceitou

---

## 🏗️ ARQUITETURA TÉCNICA

### Tech Stack Sprint 6

- **Frontend:** React, Shadcn/ui
- **Export:** jsPDF, xlsx, html2canvas
- **Backend:** Next.js API Routes
- **Storage:** sessionStorage (Stealth Mode)

### Novas Dependências

```json
{
  "dependencies": {
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.8.0",
    "html2canvas": "^1.4.1",
    "xlsx": "^0.18.5"
  }
}
```

---

## 📊 DATABASE SCHEMA COMPLETO

Migration: `database/migrations/010_sprint_6_operational.sql`

---

## 🧪 TESTING STRATEGY

### Unit Tests

```bash
# Daily Logs
- useDailyLogs.test.ts
- daily-log-modal.test.tsx

# Spikes
- spike-badge.test.tsx
- velocity calculation excludes spikes

# Export
- pdf-generator.test.ts
- excel export format

# Stealth Mode
- obfuscateText.test.ts
```

---

## ✅ CHECKLIST DE QUALIDADE (DoD)

### Para cada US:

- [ ] Implementado conforme critérios de aceitação
- [ ] Sem erros de lint
- [ ] Build sem erros
- [ ] Smoke test manual
- [ ] Code review aprovado
- [ ] PO testou e aceitou
- [ ] Performance OK

### Sprint 6 completo quando:

- [ ] ≥ 3 das 4 US aceitas
- [ ] Daily Scrum pode ser logado em < 1 min
- [ ] Spikes não contam na velocity
- [ ] Posso exportar relatório profissional
- [ ] Stealth Mode esconde dados sensíveis

---

## 📅 CRONOGRAMA SUGERIDO

### Semana 1

**Dia 1-3:** US-6.1 (Daily Logger)
- Database schema
- API endpoints
- Modal de Daily
- Timeline view

**Dia 4-5:** US-6.2 (Spike Tracking)
- Adicionar campos spike
- Atualizar velocity view
- UI badges

### Semana 2

**Dia 6-7:** US-6.3 (Export)
- Excel export
- PDF generation
- JSON export

**Dia 8:** US-6.4 (Stealth Mode)
- Toggle component
- Obfuscation logic
- Apply to all pages

**Dia 9-10:** Polish + Review
- Bug fixes
- Sprint Review
- Retrospectiva

---

## 🎯 CRITÉRIOS DE SUCESSO

Sprint 6 é **sucesso** se:
- Daily Scrum pode ser registrado facilmente
- Spikes rastreados separadamente
- Relatórios exportáveis para stakeholders

Sprint 6 é **excelente** se:
- 4 das 4 US aceitas
- Time usa Daily logger diariamente
- PO apresenta relatório PDF em reunião

---

## 🎉 CONCLUSÃO DO ROADMAP

**Após Sprint 6, você terá:**

✅ **Métricas preditivas** (Sprint 3)
- Velocity tracking
- Burndown charts
- Forecast por faixas
- Scrum health dashboard

✅ **Priorização objetiva** (Sprint 4)
- Planning Poker com BV/W
- MVP Flag
- Retrospectives tracker
- INVEST validation

✅ **Backlog avançado** (Sprint 5)
- Mapas mentais visuais
- Decomposição guiada de épicos
- DoD evolutivo

✅ **Operação fluida** (Sprint 6)
- Daily Scrum logger
- Spike tracking
- Export profissional
- Stealth Mode

---

**🚀 Sistema COMPLETO e PROFISSIONAL para gestão Scrum!**

---

**Versão:** 1.0
**Data:** 2026-02-07
**Próxima Revisão:** Após Sprint 6 Review
