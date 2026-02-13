# 🚀 QUICK START GUIDE - UZZOPS
## Como Começar o Sprint 3 HOJE

**Versão:** 1.0
**Data:** 2026-02-07
**Tempo estimado:** 30 minutos de setup

---

## 📋 PRÉ-REQUISITOS

### Verificar se tem tudo instalado

```bash
# Node.js 18+
node --version  # deve ser v18.x ou superior

# pnpm 10+
pnpm --version  # deve ser v10.x ou superior

# Git
git --version

# Supabase CLI (opcional, mas recomendado)
supabase --version
```

Se faltar algo:
```bash
# Instalar pnpm
npm install -g pnpm

# Instalar Supabase CLI
npm install -g supabase
```

---

## 🎯 PASSO 1: SETUP DO AMBIENTE (5 min)

### 1.1 Atualizar repositório

```bash
# Ir para a pasta do projeto
cd "C:\Projetos Uzz.Ai\UzzOPS - UzzApp"

# Puxar últimas mudanças
git pull origin master

# Criar branch para Sprint 3
git checkout -b feature/sprint-3-metrics

# Instalar dependências (se houver novas)
pnpm install
```

### 1.2 Verificar se o projeto roda

```bash
# Rodar em desenvolvimento
pnpm dev

# Abrir navegador em http://localhost:3000
# Login deve funcionar
# Dashboard deve carregar
```

✅ **Checkpoint:** Se carregar o dashboard, está tudo OK!

---

## 🗄️ PASSO 2: APLICAR MIGRATION (10 min)

### 2.1 Conectar ao Supabase

```bash
# Ir para dashboard do Supabase
# https://supabase.com/dashboard

# Ou usar CLI
supabase login
```

### 2.2 Rodar migration

**Opção A - Via Supabase Dashboard (mais fácil):**

1. Abrir Supabase Dashboard
2. Ir em **SQL Editor**
3. Copiar todo conteúdo de `database/migrations/008_sprint_3_metrics.sql`
4. Colar no editor
5. Clicar em **Run**
6. Verificar mensagem: "✅ Migration 008 completa!"

**Opção B - Via CLI:**

```bash
# Conectar ao projeto
supabase link --project-ref seu-projeto-ref

# Rodar migration
supabase db push

# Verificar
supabase db diff
```

### 2.3 Verificar se funcionou

```sql
-- Rodar no SQL Editor do Supabase
SELECT * FROM sprint_velocity LIMIT 5;
SELECT * FROM information_schema.tables WHERE table_name = 'sprint_burndown_snapshots';
SELECT * FROM scrum_health_metrics LIMIT 1;
```

✅ **Checkpoint:** Se todas as queries funcionarem, migration OK!

---

## 📦 PASSO 3: INSTALAR DEPENDÊNCIAS NOVAS (5 min)

### 3.1 Charts Library

```bash
# Recharts para gráficos
pnpm add recharts

# Types
pnpm add -D @types/recharts
```

### 3.2 Verificar package.json

Seu `package.json` deve ter agora:

```json
{
  "dependencies": {
    "recharts": "^2.12.7",
    // ... outras deps existentes
  }
}
```

---

## 🎨 PASSO 4: CRIAR ESTRUTURA DE PASTAS (2 min)

```bash
# Criar pastas para Sprint 3
mkdir -p src/components/metrics
mkdir -p src/app/\(dashboard\)/metrics
mkdir -p src/hooks/metrics
mkdir -p src/lib/calculations
```

Estrutura final:
```
src/
├── app/(dashboard)/
│   └── metrics/
│       └── page.tsx          # ← criar este
├── components/
│   └── metrics/
│       ├── velocity-chart.tsx     # ← criar este
│       ├── burndown-chart.tsx     # ← criar este
│       ├── forecast-table.tsx     # ← criar este
│       └── health-dashboard.tsx   # ← criar este
├── hooks/
│   └── metrics/
│       ├── useVelocity.ts    # ← criar este
│       └── useBurndown.ts    # ← criar este
└── lib/
    └── calculations/
        └── metrics.ts        # ← criar este
```

---

## 💻 PASSO 5: PRIMEIRO CÓDIGO - VELOCITY (10 min)

Vou te dar o código completo pronto para copiar e colar:

### 5.1 Criar Hook - useVelocity

**Arquivo:** `src/hooks/metrics/useVelocity.ts`

```typescript
import { useQuery } from '@tanstack/react-query'

export interface SprintVelocity {
  sprint_id: string
  sprint_name: string
  start_date: string
  end_date: string
  status: string
  total_features: number
  features_done: number
  committed_points: number
  velocity: number
  completion_rate: number
  avg_dod_compliance: number
}

export interface VelocityMetrics {
  sprints: SprintVelocity[]
  averageVelocity: number
  totalPointsDone: number
  averageCompletionRate: number
  trend: 'increasing' | 'stable' | 'decreasing'
}

export function useVelocity(projectId: string, limit = 6) {
  return useQuery({
    queryKey: ['velocity', projectId, limit],
    queryFn: async () => {
      const res = await fetch(`/api/metrics/velocity?projectId=${projectId}&limit=${limit}`)
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to fetch velocity')
      }
      const { data } = await res.json()
      return data as VelocityMetrics
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!projectId,
  })
}
```

### 5.2 Criar API Endpoint - Velocity

**Arquivo:** `src/app/api/metrics/velocity/route.ts`

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const limit = parseInt(searchParams.get('limit') || '6')

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Buscar velocity dos últimos N sprints
    const { data: velocityData, error } = await supabase
      .from('sprint_velocity')
      .select('*')
      .eq('project_id', projectId)
      .order('start_date', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Velocity fetch error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Reverter para ordem cronológica (para gráficos)
    const sprints = velocityData.reverse()

    // Calcular métricas agregadas
    const velocities = sprints.map(s => s.velocity || 0)
    const averageVelocity = velocities.length > 0
      ? velocities.reduce((sum, v) => sum + v, 0) / velocities.length
      : 0

    const totalPointsDone = velocities.reduce((sum, v) => sum + v, 0)

    const completionRates = sprints.map(s => s.completion_rate || 0)
    const averageCompletionRate = completionRates.length > 0
      ? completionRates.reduce((sum, r) => sum + r, 0) / completionRates.length
      : 0

    // Calcular tendência (últimos 3 vs anteriores)
    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable'
    if (velocities.length >= 4) {
      const recent = velocities.slice(-3)
      const older = velocities.slice(0, -3)
      const avgRecent = recent.reduce((sum, v) => sum + v, 0) / recent.length
      const avgOlder = older.reduce((sum, v) => sum + v, 0) / older.length

      if (avgRecent > avgOlder * 1.1) trend = 'increasing'
      else if (avgRecent < avgOlder * 0.9) trend = 'decreasing'
    }

    const metrics = {
      sprints,
      averageVelocity: Math.round(averageVelocity * 10) / 10,
      totalPointsDone,
      averageCompletionRate: Math.round(averageCompletionRate * 10) / 10,
      trend,
    }

    return NextResponse.json({ data: metrics })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### 5.3 Criar Componente - VelocityChart

**Arquivo:** `src/components/metrics/velocity-chart.tsx`

```typescript
'use client'

import { useVelocity } from '@/hooks/metrics/useVelocity'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface VelocityChartProps {
  projectId: string
}

export function VelocityChart({ projectId }: VelocityChartProps) {
  const { data: metrics, isLoading, error } = useVelocity(projectId)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <p className="text-destructive">Erro ao carregar velocity: {error.message}</p>
        </CardContent>
      </Card>
    )
  }

  if (!metrics || metrics.sprints.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Nenhum sprint completo ainda.</p>
        </CardContent>
      </Card>
    )
  }

  const trendConfig = {
    increasing: {
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      label: 'Crescente',
    },
    decreasing: {
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      label: 'Decrescente',
    },
    stable: {
      icon: Minus,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      label: 'Estável',
    },
  }

  const currentTrend = trendConfig[metrics.trend]
  const TrendIcon = currentTrend.icon

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Velocidade Média</CardDescription>
            <CardTitle className="text-3xl">{metrics.averageVelocity}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">pts/sprint</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Taxa de Conclusão</CardDescription>
            <CardTitle className="text-3xl">{metrics.averageCompletionRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">média geral</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Entregue</CardDescription>
            <CardTitle className="text-3xl">{metrics.totalPointsDone}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">story points</p>
          </CardContent>
        </Card>

        <Card className={currentTrend.bgColor}>
          <CardHeader className="pb-2">
            <CardDescription>Tendência</CardDescription>
            <CardTitle className="flex items-center gap-2">
              <TrendIcon className={`h-6 w-6 ${currentTrend.color}`} />
              <span className="text-2xl">{currentTrend.label}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">últimos 3 sprints</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico */}
      <Card>
        <CardHeader>
          <CardTitle>Velocity por Sprint</CardTitle>
          <CardDescription>
            Story points comprometidos vs entregues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={metrics.sprints}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="sprint_name"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                label={{
                  value: 'Story Points',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="committed_points"
                stroke="#94a3b8"
                strokeDasharray="5 5"
                name="Comprometido"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="velocity"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Entregue (Velocity)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela de detalhes */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes por Sprint</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Sprint</th>
                  <th className="text-right p-2">Comprometido</th>
                  <th className="text-right p-2">Entregue</th>
                  <th className="text-right p-2">% Conclusão</th>
                  <th className="text-right p-2">DoD Médio</th>
                </tr>
              </thead>
              <tbody>
                {metrics.sprints.map((sprint) => (
                  <tr key={sprint.sprint_id} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{sprint.sprint_name}</td>
                    <td className="text-right p-2">{sprint.committed_points}</td>
                    <td className="text-right p-2 font-bold text-blue-600">
                      {sprint.velocity}
                    </td>
                    <td className="text-right p-2">
                      <span
                        className={
                          sprint.completion_rate >= 90
                            ? 'text-green-600'
                            : sprint.completion_rate >= 70
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }
                      >
                        {sprint.completion_rate}%
                      </span>
                    </td>
                    <td className="text-right p-2">
                      {sprint.avg_dod_compliance?.toFixed(0) || 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 5.4 Criar Página - Métricas

**Arquivo:** `src/app/(dashboard)/metrics/page.tsx`

```typescript
import { VelocityChart } from '@/components/metrics/velocity-chart'

export default function MetricsPage() {
  // TODO: pegar projectId do contexto ou params
  // Por enquanto, hardcoded (ajustar depois)
  const projectId = process.env.NEXT_PUBLIC_DEFAULT_PROJECT_ID || 'seu-project-id-aqui'

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Métricas do Projeto</h1>
        <p className="text-muted-foreground">
          Velocity, Burndown, Forecast e Health do Scrum
        </p>
      </div>

      <VelocityChart projectId={projectId} />
    </div>
  )
}
```

### 5.5 Adicionar Link no Sidebar

**Arquivo:** `src/components/shared/sidebar.tsx`

Adicionar no array de navigation items:

```typescript
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Features', href: '/features', icon: ListTodo },
  { name: 'Sprints', href: '/sprints', icon: CalendarDays },
  { name: 'Risks', href: '/risks', icon: AlertTriangle },
  { name: 'Métricas', href: '/metrics', icon: BarChart3 }, // ← ADICIONAR ESTA LINHA
]
```

Importar o ícone no topo:

```typescript
import { BarChart3 } from 'lucide-react'
```

---

## ✅ PASSO 6: TESTAR (3 min)

### 6.1 Rodar o projeto

```bash
pnpm dev
```

### 6.2 Navegar para Métricas

1. Abrir http://localhost:3000
2. Fazer login
3. Clicar em **"Métricas"** no sidebar
4. Deve carregar a página de velocity

### 6.3 O que você deve ver

✅ **Se tiver sprints completos:**
- 4 cards de KPIs (Velocity média, Taxa conclusão, Total entregue, Tendência)
- Gráfico de linha (comprometido vs entregue)
- Tabela com detalhes por sprint

✅ **Se NÃO tiver sprints completos ainda:**
- Mensagem: "Nenhum sprint completo ainda."
- Isso é normal! Complete alguns sprints e volte aqui.

---

## 🐛 TROUBLESHOOTING

### Erro: "projectId is required"

**Solução:** Editar `src/app/(dashboard)/metrics/page.tsx` e colocar o ID real do seu projeto:

```typescript
// Pegar o ID real do Supabase
const projectId = 'uuid-do-seu-projeto-aqui'
```

Para encontrar o ID:
```sql
-- Rodar no Supabase SQL Editor
SELECT id, name FROM projects;
```

### Erro: "Failed to fetch velocity"

**Checklist:**
1. Migration rodou? → Verificar `sprint_velocity` existe
2. Tem sprints completados? → Verificar status='completed'
3. Features têm story_points? → Verificar dados

```sql
-- Verificar se tem dados
SELECT * FROM sprint_velocity LIMIT 1;
```

### Erro: "Module not found: recharts"

```bash
# Instalar novamente
pnpm add recharts
```

### Gráfico não aparece

1. Abrir DevTools (F12)
2. Ver console
3. Verificar se tem erro de CORS ou 401

---

## 📝 PRÓXIMOS PASSOS

Agora que Velocity está funcionando, você pode:

1. **Commit do código:**
```bash
git add .
git commit -m "feat(metrics): add velocity tracking (US-3.1)"
git push origin feature/sprint-3-metrics
```

2. **Continuar com US-3.2 (Burndown):**
   - Ver `IMPLEMENTATION_ROADMAP.md` para código completo
   - Seguir mesmo padrão: hook → API → component → page

3. **Demo para o PO:**
   - Mostrar velocity funcionando
   - Explicar métricas
   - Colher feedback

---

## 🎓 CONCEITOS-CHAVE

### Velocity
- **O que é:** Story points entregues ("Done") por Sprint
- **Para que serve:** Prever prazo de releases futuras
- **Como usa:** Média dos últimos 3-6 sprints

### Materialized View
- **O que é:** Query pré-calculada e armazenada
- **Para que serve:** Performance (não recalcula toda hora)
- **Como atualiza:** Trigger automático ao mudar features

### React Query (TanStack Query)
- **O que é:** Gerenciador de estado servidor
- **Para que serve:** Cache, refetch, loading states
- **Como usa:** Hook `useQuery`

---

## 📚 REFERÊNCIAS

- **Guia Scrum Cap. 8:** Estimativas e Velocity
- **Guia Scrum Cap. 12:** Velocity vs Produtividade
- **IMPLEMENTATION_ROADMAP.md:** Visão completa do Sprint 3
- **Recharts Docs:** https://recharts.org

---

## ✅ CHECKLIST FINAL

Antes de considerar "pronto":

- [ ] Migration 008 aplicada no Supabase
- [ ] `pnpm dev` roda sem erros
- [ ] Página /metrics carrega
- [ ] Gráfico de velocity aparece (ou mensagem apropriada)
- [ ] Dados fazem sentido (não são zeros ou nulls)
- [ ] Código commitado no git
- [ ] PO avisado que está pronto para demo

---

**🎉 Parabéns!** Você completou a primeira feature do Sprint 3.

**Próximo:** Implementar US-3.2 (Burndown Charts) seguindo o mesmo padrão.

**Dúvidas?** Consultar `IMPLEMENTATION_ROADMAP.md` ou documentação dos guias Scrum.

---

**Tempo total:** ~30 minutos
**Dificuldade:** ⭐⭐⭐ (Médio)
**Status:** ✅ Pronto para começar
