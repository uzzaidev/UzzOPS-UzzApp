# 🗺️ UZZOPS - IMPLEMENTATION ROADMAP
## Documentação Completa de Implementação

**Versão:** 1.0
**Data:** 2026-02-07
**Baseado em:** Guias Scrum (Cap. 5-12) + Análise do Projeto Atual
**Status Atual:** Sprint 2 Completo (100%)

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Priorização e Roadmap](#priorização-e-roadmap)
3. [Sprint 3 - Métricas e Visualização](#sprint-3---métricas-e-visualização)
4. [Sprint 4 - Priorização e Qualidade](#sprint-4---priorização-e-qualidade)
5. [Sprint 5 - Backlog Avançado](#sprint-5---backlog-avançado)
6. [Sprint 6 - Operacional](#sprint-6---operacional)
7. [Backlog Futuro](#backlog-futuro)
8. [Arquitetura Técnica](#arquitetura-técnica)
9. [Padrões e Convenções](#padrões-e-convenções)
10. [Checklists de Qualidade](#checklists-de-qualidade)

---

## 🎯 VISÃO GERAL

### Objetivo Geral
Evoluir o UzzOPS de um sistema funcional de gestão Scrum para uma plataforma completa com:
- Métricas preditivas (Velocity, Burndown, Forecast)
- Priorização objetiva (Planning Poker, BV/W)
- Qualidade garantida (Smells Detection, DoD Evolutivo)
- Backlog inteligente (Mapas Mentais, Decomposição de Épicos)
- Processo otimizado (Retrospectives, Baselines, Health Dashboard)

### Princípios Norteadores
1. **Valor Primeiro:** Cada feature deve resolver uma dor real do time Scrum
2. **Incremental:** Entregas demonstráveis a cada Sprint
3. **Data-Driven:** Decisões baseadas em métricas, não em opinião
4. **User-Centric:** Interface intuitiva, mesmo para não-técnicos
5. **Scrum by the Book:** Implementar conceitos dos guias de forma fiel

---

## 📊 PRIORIZAÇÃO E ROADMAP

### Critérios de Priorização

Usando **BV/W** (Business Value / Work Effort) dos guias:

| Feature | BV | W | BV/W | Prioridade |
|---------|----|----|------|------------|
| Burndown Charts | 21 | 8 | 2.63 | P0 (Crítico) |
| Velocity Tracking | 21 | 5 | 4.20 | P0 (Crítico) |
| Planning Poker | 13 | 13 | 1.00 | P1 (Alto) |
| Scrum Health Dashboard | 13 | 8 | 1.63 | P1 (Alto) |
| MVP Flag | 8 | 2 | 4.00 | P0 (Quick Win) |
| Retrospective Actions | 8 | 3 | 2.67 | P1 (Alto) |
| Mapas Mentais | 13 | 21 | 0.62 | P2 (Médio) |
| Forecast por Faixas | 8 | 5 | 1.60 | P1 (Alto) |
| INVEST Validation | 5 | 3 | 1.67 | P1 (Alto) |
| DoD Evolutivo | 8 | 5 | 1.60 | P2 (Médio) |

### Roadmap Visual

```
Sprint 3 (Atual)          Sprint 4              Sprint 5              Sprint 6+
┌─────────────────┐      ┌─────────────────┐   ┌─────────────────┐   ┌──────────────┐
│ • Burndown      │      │ • Planning Poker│   │ • Mapas Mentais │   │ • Daily Log  │
│ • Velocity      │      │ • MVP Flag      │   │ • Decomposição  │   │ • Workshops  │
│ • Forecast      │      │ • Retrospectives│   │ • DoD Evolutivo │   │ • Export     │
│ • Scrum Health  │      │ • INVEST Check  │   │ • Spike Track   │   │ • Stealth    │
└─────────────────┘      └─────────────────┘   └─────────────────┘   └──────────────┘
   P0 - Crítico           P0/P1 - Alto           P2 - Médio           P3 - Baixo
   22 Story Points        18 Story Points        24 Story Points      16 Story Points
```

### Velocidade Estimada
- **Histórico:** Sprint 1 (18 pts), Sprint 2 (20 pts)
- **Média:** 19 pontos/sprint
- **Capacidade:** 20 pontos/sprint (considerando 4 devs)

---

## 🎯 SPRINT 3 - MÉTRICAS E VISUALIZAÇÃO

**Sprint Goal:** "Ao final deste Sprint, o time consegue visualizar velocidade, prever prazo com burndown e detectar problemas do processo automaticamente."

**Duração:** 2 semanas
**Story Points:** 22 pontos
**Prioridade:** P0 - Crítico

---

### 📌 US-3.1: Velocity Tracking

**Como** Product Owner,
**Quero** visualizar a velocidade do time (story points entregues por sprint),
**Para** prever prazos com dados reais e não com achismo.

**Referência:** Cap. 8 e 12 dos Guias Scrum

#### Critérios de Aceitação

**Dado que** tenho sprints com features "Done"
**Quando** acesso a página de métricas
**Então** vejo:
- Gráfico de linha com velocidade por sprint (últimos 6 sprints)
- Velocidade média calculada (média móvel dos últimos 3 sprints)
- Tendência (crescente/estável/decrescente)
- Capacidade do time vs velocidade real

**Dado que** estou visualizando um Sprint específico
**Quando** acesso a página de detalhes
**Então** vejo:
- Story Points comprometidos (committed)
- Story Points entregues (done)
- Taxa de conclusão (done/committed × 100)

#### Tarefas Técnicas

**3.1.1 Backend - Queries de Velocity** (3 pts)
```sql
-- Criar view materializada para performance
CREATE MATERIALIZED VIEW sprint_velocity AS
SELECT
  s.id as sprint_id,
  s.name,
  s.start_date,
  s.end_date,
  COUNT(DISTINCT f.id) FILTER (WHERE f.status = 'done') as features_done,
  SUM(f.story_points) FILTER (WHERE f.status = 'done') as velocity,
  SUM(f.story_points) as committed,
  ROUND(
    (SUM(f.story_points) FILTER (WHERE f.status = 'done')::float /
     NULLIF(SUM(f.story_points), 0) * 100)::numeric,
    2
  ) as completion_rate
FROM sprints s
LEFT JOIN sprint_features sf ON s.id = sf.sprint_id
LEFT JOIN features f ON sf.feature_id = f.id
WHERE s.status IN ('active', 'completed')
GROUP BY s.id, s.name, s.start_date, s.end_date
ORDER BY s.start_date DESC;

-- Refresh automático a cada mudança em features
CREATE OR REPLACE FUNCTION refresh_sprint_velocity()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY sprint_velocity;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_refresh_velocity
AFTER INSERT OR UPDATE OR DELETE ON sprint_features
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_sprint_velocity();
```

**3.1.2 API - Endpoint de Velocity** (2 pts)
```typescript
// src/app/api/metrics/velocity/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  const limit = parseInt(searchParams.get('limit') || '6')

  const supabase = createRouteHandlerClient({ cookies })

  // Buscar velocity dos últimos N sprints
  const { data: velocityData, error } = await supabase
    .from('sprint_velocity')
    .select('*')
    .eq('project_id', projectId)
    .order('start_date', { ascending: false })
    .limit(limit)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Calcular métricas agregadas
  const metrics = {
    sprints: velocityData.reverse(), // Ordem cronológica para gráfico
    averageVelocity: calculateAverage(velocityData, 'velocity'),
    movingAverage: calculateMovingAverage(velocityData, 'velocity', 3),
    trend: calculateTrend(velocityData),
    totalPointsDone: velocityData.reduce((sum, s) => sum + (s.velocity || 0), 0),
    averageCompletionRate: calculateAverage(velocityData, 'completion_rate'),
  }

  return NextResponse.json({ data: metrics })
}

function calculateAverage(data: any[], field: string): number {
  const values = data.map(d => d[field] || 0)
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function calculateMovingAverage(data: any[], field: string, window: number): number[] {
  const values = data.map(d => d[field] || 0)
  const result = []
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1)
    const subset = values.slice(start, i + 1)
    result.push(subset.reduce((sum, v) => sum + v, 0) / subset.length)
  }
  return result
}

function calculateTrend(data: any[]): 'increasing' | 'stable' | 'decreasing' {
  if (data.length < 2) return 'stable'
  const recent = data.slice(-3).map(d => d.velocity || 0)
  const avgRecent = recent.reduce((sum, v) => sum + v, 0) / recent.length
  const older = data.slice(0, -3).map(d => d.velocity || 0)
  const avgOlder = older.reduce((sum, v) => sum + v, 0) / older.length

  if (avgRecent > avgOlder * 1.1) return 'increasing'
  if (avgRecent < avgOlder * 0.9) return 'decreasing'
  return 'stable'
}
```

**3.1.3 Hook - useVelocity** (1 pt)
```typescript
// src/hooks/useVelocity.ts
import { useQuery } from '@tanstack/react-query'

interface VelocityMetrics {
  sprints: SprintVelocity[]
  averageVelocity: number
  movingAverage: number[]
  trend: 'increasing' | 'stable' | 'decreasing'
  totalPointsDone: number
  averageCompletionRate: number
}

export function useVelocity(projectId: string, limit = 6) {
  return useQuery({
    queryKey: ['velocity', projectId, limit],
    queryFn: async () => {
      const res = await fetch(`/api/metrics/velocity?projectId=${projectId}&limit=${limit}`)
      if (!res.ok) throw new Error('Failed to fetch velocity')
      const { data } = await res.json()
      return data as VelocityMetrics
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}
```

**3.1.4 Componente - VelocityChart** (3 pts)
```typescript
// src/components/metrics/velocity-chart.tsx
'use client'

import { useVelocity } from '@/hooks/useVelocity'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export function VelocityChart({ projectId }: { projectId: string }) {
  const { data: metrics, isLoading } = useVelocity(projectId)

  if (isLoading) return <div>Carregando velocidade...</div>

  const trendIcon = {
    increasing: <TrendingUp className="text-green-600" />,
    decreasing: <TrendingDown className="text-red-600" />,
    stable: <Minus className="text-gray-600" />,
  }[metrics?.trend || 'stable']

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg">
          <div className="text-sm text-muted-foreground">Velocidade Média</div>
          <div className="text-2xl font-bold">{metrics?.averageVelocity.toFixed(1)} pts</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-sm text-muted-foreground">Taxa de Conclusão</div>
          <div className="text-2xl font-bold">{metrics?.averageCompletionRate.toFixed(0)}%</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-sm text-muted-foreground">Total Entregue</div>
          <div className="text-2xl font-bold">{metrics?.totalPointsDone} pts</div>
        </div>
        <div className="p-4 border rounded-lg flex items-center gap-2">
          <div className="text-sm text-muted-foreground">Tendência</div>
          {trendIcon}
        </div>
      </div>

      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={metrics?.sprints}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis label={{ value: 'Story Points', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="committed"
            stroke="#94a3b8"
            strokeDasharray="5 5"
            name="Comprometido"
          />
          <Line
            type="monotone"
            dataKey="velocity"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Entregue (Velocity)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

**3.1.5 Página - Métricas** (2 pts)
```typescript
// src/app/(dashboard)/metrics/page.tsx
import { VelocityChart } from '@/components/metrics/velocity-chart'

export default function MetricsPage() {
  // TODO: pegar projectId do contexto/params
  const projectId = 'uuid-do-projeto'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Métricas do Projeto</h1>
        <p className="text-muted-foreground">Velocity, Burndown e Forecast</p>
      </div>

      <VelocityChart projectId={projectId} />
    </div>
  )
}
```

#### Definition of Done
- [ ] Código passa em lint/build
- [ ] Queries SQL otimizadas (materialized view)
- [ ] API endpoint com testes unitários
- [ ] Componente renderiza corretamente
- [ ] Gráfico funciona com dados reais
- [ ] Responsivo (mobile-friendly)
- [ ] Documentação atualizada
- [ ] PO aprovou na demo

---

### 📌 US-3.2: Burndown Charts

**Como** Scrum Master,
**Quero** visualizar burndown do sprint e do release,
**Para** detectar atrasos cedo e ajustar o plano.

**Referência:** Cap. 6.7 e 8 dos Guias Scrum

#### Critérios de Aceitação

**Dado que** estou em um sprint ativo
**Quando** acesso a página de detalhes do sprint
**Então** vejo:
- Gráfico de burndown diário (linha ideal vs real)
- Story points restantes por dia
- Projeção: "No ritmo atual, termina em X dias"

**Dado que** estou planejando um release
**Quando** acesso a página de release
**Então** vejo:
- Gráfico de burndown do release (pontos restantes por sprint)
- Previsão de conclusão (pessimista/provável/otimista)

#### Tarefas Técnicas

**3.2.1 Backend - Burndown Data Model** (2 pts)
```sql
-- Tabela para registro diário de burndown
CREATE TABLE sprint_burndown_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id UUID REFERENCES sprints(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  points_remaining INT NOT NULL,
  points_done INT NOT NULL,
  points_total INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sprint_id, snapshot_date)
);

-- Índice para queries rápidas
CREATE INDEX idx_burndown_sprint_date ON sprint_burndown_snapshots(sprint_id, snapshot_date DESC);

-- Função para gerar snapshot diário (rodar via cron ou trigger)
CREATE OR REPLACE FUNCTION generate_daily_burndown_snapshot(p_sprint_id UUID)
RETURNS VOID AS $$
DECLARE
  v_points_done INT;
  v_points_total INT;
BEGIN
  -- Calcular pontos done e total
  SELECT
    COALESCE(SUM(f.story_points) FILTER (WHERE f.status = 'done'), 0),
    COALESCE(SUM(f.story_points), 0)
  INTO v_points_done, v_points_total
  FROM sprint_features sf
  JOIN features f ON sf.feature_id = f.id
  WHERE sf.sprint_id = p_sprint_id;

  -- Inserir ou atualizar snapshot do dia
  INSERT INTO sprint_burndown_snapshots (sprint_id, snapshot_date, points_remaining, points_done, points_total)
  VALUES (
    p_sprint_id,
    CURRENT_DATE,
    v_points_total - v_points_done,
    v_points_done,
    v_points_total
  )
  ON CONFLICT (sprint_id, snapshot_date)
  DO UPDATE SET
    points_remaining = EXCLUDED.points_remaining,
    points_done = EXCLUDED.points_done,
    points_total = EXCLUDED.points_total;
END;
$$ LANGUAGE plpgsql;
```

**3.2.2 API - Burndown Endpoint** (2 pts)
```typescript
// src/app/api/sprints/[id]/burndown/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })

  // Buscar sprint
  const { data: sprint } = await supabase
    .from('sprints')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!sprint) {
    return NextResponse.json({ error: 'Sprint not found' }, { status: 404 })
  }

  // Buscar snapshots
  const { data: snapshots } = await supabase
    .from('sprint_burndown_snapshots')
    .select('*')
    .eq('sprint_id', params.id)
    .order('snapshot_date', { ascending: true })

  // Calcular linha ideal
  const startDate = new Date(sprint.start_date)
  const endDate = new Date(sprint.end_date)
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const totalPoints = snapshots[0]?.points_total || 0

  const idealLine = Array.from({ length: totalDays + 1 }, (_, i) => ({
    day: i,
    date: new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    ideal: totalPoints - (totalPoints / totalDays) * i,
  }))

  // Projeção
  const lastSnapshot = snapshots[snapshots.length - 1]
  const daysElapsed = snapshots.length
  const pointsDone = lastSnapshot?.points_done || 0
  const velocityPerDay = pointsDone / daysElapsed
  const daysRemaining = Math.ceil((totalPoints - pointsDone) / velocityPerDay)

  return NextResponse.json({
    data: {
      sprint,
      snapshots,
      idealLine,
      projection: {
        daysRemaining,
        expectedEndDate: new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000),
        velocityPerDay: velocityPerDay.toFixed(2),
      }
    }
  })
}
```

**3.2.3 Componente - BurndownChart** (3 pts)
```typescript
// src/components/sprints/burndown-chart.tsx
'use client'

import { useBurndown } from '@/hooks/useBurndown'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { AlertTriangle, CheckCircle } from 'lucide-react'

export function BurndownChart({ sprintId }: { sprintId: string }) {
  const { data, isLoading } = useBurndown(sprintId)

  if (isLoading) return <div>Carregando burndown...</div>

  const chartData = data.idealLine.map((ideal, index) => {
    const snapshot = data.snapshots.find(s => s.snapshot_date === ideal.date)
    return {
      date: ideal.date,
      ideal: ideal.ideal,
      actual: snapshot?.points_remaining ?? null,
    }
  })

  const isOnTrack = data.projection.daysRemaining <= data.sprint.duration_weeks * 5

  return (
    <div className="space-y-4">
      {/* Alerta */}
      <div className={`p-4 rounded-lg border ${isOnTrack ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
        {isOnTrack ? (
          <div className="flex items-center gap-2">
            <CheckCircle className="text-green-600" />
            <span>Sprint está no ritmo! Previsão: termina em {data.projection.daysRemaining} dias.</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-yellow-600" />
            <span>⚠️ Sprint atrasado. Previsão: termina em {data.projection.daysRemaining} dias (esperado: {data.sprint.duration_weeks * 5} dias).</span>
          </div>
        )}
      </div>

      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis label={{ value: 'Story Points Restantes', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Line
            type="linear"
            dataKey="ideal"
            stroke="#94a3b8"
            strokeDasharray="5 5"
            name="Linha Ideal"
          />
          <Line
            type="linear"
            dataKey="actual"
            stroke="#ef4444"
            strokeWidth={2}
            name="Progresso Real"
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

**3.2.4 Hook - useBurndown** (1 pt)
**3.2.5 Integração na Sprint Details Page** (1 pt)
**3.2.6 Cron Job - Daily Snapshot** (2 pts)

#### Definition of Done
- [ ] Snapshots gerados automaticamente (diário)
- [ ] Gráfico renderiza linha ideal vs real
- [ ] Projeção de término calculada
- [ ] Alertas visuais (no prazo / atrasado)
- [ ] Testado com sprints reais
- [ ] PO aprovou na demo

---

### 📌 US-3.3: Forecast por Faixas

**Como** Product Owner,
**Quero** ver previsão de prazo em 3 cenários (pessimista/provável/otimista),
**Para** apresentar expectativa realista ao stakeholder.

**Referência:** Cap. 8 dos Guias Scrum

#### Critérios de Aceitação

**Dado que** tenho backlog estimado e velocity histórica
**Quando** acesso a página de forecast
**Então** vejo:
- Cenário pessimista (velocidade mínima observada)
- Cenário provável (velocidade média)
- Cenário otimista (velocidade máxima)
- Para cada cenário: número de sprints e data prevista

**Exemplo:**
```
Backlog MVP: 180 pontos
Velocity: min=18, avg=20, max=22

Pessimista: 10 sprints (20 semanas) → 27/06/2026
Provável: 9 sprints (18 semanas) → 13/06/2026
Otimista: 8 sprints (16 semanas) → 30/05/2026
```

#### Tarefas Técnicas

**3.3.1 Backend - Forecast Calculation** (2 pts)
**3.3.2 API - Forecast Endpoint** (2 pts)
**3.3.3 Componente - ForecastTable** (2 pts)
**3.3.4 Página - Release Planning** (1 pt)

#### Definition of Done
- [ ] Cálculo preciso dos 3 cenários
- [ ] Datas calculadas considerando weekends
- [ ] Visualização clara (tabela + gráfico)
- [ ] Atualiza automaticamente ao mudar backlog
- [ ] PO aprovou na demo

---

### 📌 US-3.4: Scrum Health Dashboard

**Como** Scrum Master,
**Quero** detectar "cheiros" do Scrum automaticamente,
**Para** corrigir problemas antes que virem crises.

**Referência:** Cap. 7 dos Guias Scrum (Smells)

#### Critérios de Aceitação

**Dado que** estou usando Scrum há 2+ sprints
**Quando** acesso o Health Dashboard
**Então** vejo score (0-100) e detecção de:
- ⚠️ Sprint duração variável
- ⚠️ Carry-over alto (> 30%)
- ⚠️ WIP alto (> 3 por pessoa)
- ⚠️ Done falso (taxa rejeição PO > 15%)
- ⚠️ Interrupções (tasks fora do backlog > 25%)

#### Tarefas Técnicas

**3.4.1 Backend - Health Metrics** (3 pts)
```sql
-- View com métricas de saúde
CREATE VIEW scrum_health_metrics AS
WITH sprint_consistency AS (
  SELECT
    project_id,
    COUNT(DISTINCT duration_weeks) > 1 as has_variable_duration
  FROM sprints
  WHERE status IN ('completed', 'active')
  GROUP BY project_id
),
carry_over AS (
  SELECT
    s.project_id,
    COUNT(DISTINCT f.id) FILTER (WHERE f.carry_over_count > 0) as carried_features,
    COUNT(DISTINCT f.id) as total_features,
    ROUND((COUNT(DISTINCT f.id) FILTER (WHERE f.carry_over_count > 0)::float /
           NULLIF(COUNT(DISTINCT f.id), 0) * 100)::numeric, 2) as carry_over_rate
  FROM sprints s
  JOIN sprint_features sf ON s.id = sf.sprint_id
  JOIN features f ON sf.feature_id = f.id
  WHERE s.status = 'completed'
  GROUP BY s.project_id
)
-- ... outros smells
SELECT
  p.id as project_id,
  CASE WHEN sc.has_variable_duration THEN 'critical' ELSE 'healthy' END as sprint_consistency,
  CASE
    WHEN co.carry_over_rate > 30 THEN 'critical'
    WHEN co.carry_over_rate > 15 THEN 'warning'
    ELSE 'healthy'
  END as carry_over_health
  -- ... outros smells
FROM projects p
LEFT JOIN sprint_consistency sc ON p.id = sc.project_id
LEFT JOIN carry_over co ON p.id = co.project_id;
```

**3.4.2 Componente - HealthDashboard** (3 pts)
**3.4.3 API - Health Endpoint** (2 pts)
**3.4.4 Alertas e Recomendações** (2 pts)

#### Definition of Done
- [ ] 5 smells detectados automaticamente
- [ ] Score geral calculado (0-100)
- [ ] Recomendações de ação por smell
- [ ] Histórico de health ao longo do tempo
- [ ] PO aprovou na demo

---

## 📋 CHECKLIST DO SPRINT 3

### Antes do Planning
- [ ] Backlog do Sprint 3 priorizado
- [ ] User Stories passam em INVEST
- [ ] DoD está atualizado
- [ ] Ambiente de dev funcionando

### Durante o Sprint
- [ ] Daily < 15min (todos os dias)
- [ ] Impedimentos removidos em < 1 dia
- [ ] Burndown atualizado diariamente
- [ ] Code review em todas PRs

### Sprint Review
- [ ] Demo de todas as 4 features
- [ ] PO aceita ou rejeita cada história
- [ ] Feedback registrado no backlog
- [ ] Velocity registrada

### Retrospectiva
- [ ] O que funcionou?
- [ ] O que melhorar?
- [ ] 1-3 ações mensuráveis para Sprint 4

---

## 🎯 SPRINT 4 - PRIORIZAÇÃO E QUALIDADE

**Sprint Goal:** "Ao final deste Sprint, o time prioriza backlog com Planning Poker, garante qualidade com INVEST e rastreia melhorias contínuas com Retrospectives."

**Story Points:** 18 pontos

### User Stories

- **US-4.1:** Planning Poker (BV/W) - 8 pts
- **US-4.2:** MVP Flag + Board - 3 pts
- **US-4.3:** Retrospective Actions Tracker - 4 pts
- **US-4.4:** INVEST Validation - 3 pts

*Detalhamento completo em arquivo separado: `SPRINT_4_DETAILED.md`*

---

## 🎯 SPRINT 5 - BACKLOG AVANÇADO

**Sprint Goal:** "Ao final deste Sprint, o backlog é visualizável em mapas mentais, épicos são decompostos guiados e DoD evolui com o time."

**Story Points:** 24 pontos

### User Stories

- **US-5.1:** Mapas Mentais + Snapshots - 13 pts
- **US-5.2:** Decomposição de Épicos (Wizard) - 8 pts
- **US-5.3:** DoD Evolutivo - 3 pts

*Detalhamento completo em arquivo separado: `SPRINT_5_DETAILED.md`*

---

## 🎯 SPRINT 6+ - OPERACIONAL

**Sprint Goal:** Features operacionais para facilitar o dia-a-dia do time.

### User Stories

- **US-6.1:** Daily Scrum Logger - 5 pts
- **US-6.2:** Spike Tracking - 3 pts
- **US-6.3:** Export Relatórios (PDF/CSV) - 5 pts
- **US-6.4:** Stealth Scrum Mode - 3 pts

*Detalhamento completo em arquivo separado: `SPRINT_6_DETAILED.md`*

---

## 🏗️ ARQUITETURA TÉCNICA

### Stack Decisions

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| **Charts** | Recharts | Já usado, API simples, responsivo |
| **State** | React Query + Zustand | Já implementado, performático |
| **Database** | PostgreSQL (Supabase) | Mantém stack atual |
| **Real-time** | Supabase Realtime | Para Planning Poker colaborativo |
| **Cron Jobs** | Vercel Cron | Para snapshots diários de burndown |

### Performance

- **Materialized Views:** Para queries pesadas (velocity, health)
- **Indexes:** Em todas as foreign keys e campos de filtro
- **Cache:** React Query com staleTime de 5 minutos
- **Lazy Loading:** Componentes de gráficos carregam sob demanda

### Segurança

- **RLS:** Todas as novas tabelas com Row Level Security
- **Validation:** Zod schemas no frontend e backend
- **Auth:** Supabase Auth mantém consistência

---

## 📐 PADRÕES E CONVENÇÕES

### Nomenclatura

**Tabelas:**
```sql
-- Singular, snake_case
sprint_burndown_snapshots
retrospective_actions
planning_poker_votes
```

**Componentes:**
```
PascalCase
VelocityChart
BurndownChart
PlanningPokerModal
```

**Hooks:**
```
camelCase com prefixo "use"
useVelocity
useBurndown
usePlanningPoker
```

**APIs:**
```
RESTful
GET /api/metrics/velocity
GET /api/sprints/[id]/burndown
POST /api/planning-poker/vote
```

### Estrutura de Arquivos

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── metrics/
│   │   │   └── page.tsx
│   │   ├── planning-poker/
│   │   │   └── page.tsx
│   │   └── health/
│   │       └── page.tsx
│   └── api/
│       ├── metrics/
│       │   └── velocity/
│       │       └── route.ts
│       └── sprints/
│           └── [id]/
│               └── burndown/
│                   └── route.ts
├── components/
│   ├── metrics/
│   │   ├── velocity-chart.tsx
│   │   ├── burndown-chart.tsx
│   │   └── forecast-table.tsx
│   └── planning-poker/
│       ├── poker-card.tsx
│       └── poker-session.tsx
└── hooks/
    ├── useVelocity.ts
    ├── useBurndown.ts
    └── usePlanningPoker.ts
```

### Git Workflow

```bash
# Feature branch naming
feature/US-3.1-velocity-tracking
feature/US-3.2-burndown-charts

# Commit messages
feat(velocity): add velocity tracking API endpoint
fix(burndown): correct ideal line calculation
docs(sprint3): add implementation guide

# Pull Requests
Título: [US-3.1] Velocity Tracking
Descrição:
- Implementa queries de velocity
- Adiciona gráfico de linha
- Testes unitários incluídos

Closes #42
```

---

## ✅ CHECKLISTS DE QUALIDADE

### Checklist por Feature

**Antes de começar:**
- [ ] User Story passa em INVEST
- [ ] Critérios de aceitação claros
- [ ] Estimativa validada pelo time
- [ ] Dependências identificadas

**Durante desenvolvimento:**
- [ ] TDD (testes primeiro, se aplicável)
- [ ] Code segue style guide (lint passa)
- [ ] Commits atômicos e descritivos
- [ ] Não quebra nada existente

**Antes do PR:**
- [ ] Código passa em todos os testes
- [ ] Build local sem erros
- [ ] Responsivo (testado mobile)
- [ ] Acessibilidade (ARIA labels)
- [ ] Performance (< 2s carregamento)

**Code Review:**
- [ ] Pelo menos 1 aprovação
- [ ] Comentários resolvidos
- [ ] Merge sem conflitos

**Antes da Review:**
- [ ] Feature funciona em staging
- [ ] Dados de teste preparados
- [ ] Demo script pronto
- [ ] PO avisado

### Checklist de Definition of Done

Para cada User Story marcar "Done":

- [ ] Funcionalidade implementada conforme critérios
- [ ] Testes automatizados (unitários + integração)
- [ ] Code review aprovado
- [ ] Documentação atualizada (README, comentários)
- [ ] Deploy em staging sem erros
- [ ] PO testou e aceitou
- [ ] Performance validada (< 2s)
- [ ] Sem bugs conhecidos

---

## 📊 MÉTRICAS DE SUCESSO

### Por Sprint

| Métrica | Target | Como Medir |
|---------|--------|------------|
| **Velocity** | 18-22 pts | Pontos Done ao fim do Sprint |
| **Completion Rate** | > 85% | Done / Committed × 100 |
| **Carry-over** | < 15% | Features arrastadas / total |
| **Rejeição PO** | < 5% | Features rejeitadas / Done |
| **Lead Time** | < 3 dias | Tempo de To Do → Done |

### Por Release

| Métrica | Target | Como Medir |
|---------|--------|------------|
| **Forecast Accuracy** | ±10% | Real vs Previsto |
| **Health Score** | > 80 | Scrum Health Dashboard |
| **DoD Compliance** | 100% | Todas features passam DoD |
| **Velocity Stability** | CV < 20% | Coef. Variação da velocity |

---

## 🚀 COMO COMEÇAR AMANHÃ

### Dia 1 - Setup
1. Criar branch `feature/sprint-3`
2. Revisar este documento com o time
3. Fazer Planning A (PO + Time)
4. Fazer Planning B (Time técnico)
5. Atualizar board com tarefas

### Dia 2-3 - US-3.1 (Velocity)
1. Criar materialized view
2. Implementar API endpoint
3. Criar hook useVelocity
4. Componente VelocityChart
5. Integrar na página /metrics

### Dia 4-6 - US-3.2 (Burndown)
1. Criar tabela snapshots
2. Implementar cron job
3. API burndown
4. Componente BurndownChart
5. Integrar em Sprint Details

### Dia 7-8 - US-3.3 (Forecast)
1. Lógica de cálculo
2. API forecast
3. Componente ForecastTable
4. Página Release Planning

### Dia 9-10 - US-3.4 (Health)
1. View scrum_health_metrics
2. API health
3. Componente HealthDashboard
4. Alertas e recomendações

### Sprint Review (Dia 10)
- Demo das 4 features
- Colher feedback
- Calcular velocity
- Retrospectiva

---

## 📞 SUPORTE E RECURSOS

### Documentação de Referência
- Guias Scrum (Cap. 5-12) - em `scrum/`
- Architecture Guide - `docs/ARCHITECTURE.md`
- Database Schema - `docs/DATABASE_SCHEMA.md`
- API Documentation - `docs/API_DOCUMENTATION.md`

### Ferramentas
- **Design:** Figma (wireframes)
- **DB Admin:** Supabase Dashboard
- **API Testing:** Postman/Bruno
- **Charts:** Recharts Docs

### Contatos
- **PO:** Pedro Vitor
- **SM:** Luis
- **Dev Team:** Arthur, Vitor, Lucas

---

**Próximos Documentos:**
- `SPRINT_4_DETAILED.md` - Detalhamento completo do Sprint 4
- `SPRINT_5_DETAILED.md` - Detalhamento completo do Sprint 5
- `SPRINT_6_DETAILED.md` - Detalhamento completo do Sprint 6
- `SQL_MIGRATIONS.md` - Todas as migrações SQL necessárias
- `API_REFERENCE.md` - Documentação completa das novas APIs
- `COMPONENT_SPECS.md` - Especificações dos componentes React

---

**Versão:** 1.0
**Última Atualização:** 2026-02-07
**Próxima Revisão:** Após Sprint 3 Review
