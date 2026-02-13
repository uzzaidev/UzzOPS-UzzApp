# 🗺️ SPRINT 5 - BACKLOG AVANÇADO
## Documentação Completa e Executável

**Versão:** 1.0
**Data:** 2026-02-07
**Duração:** 2 semanas
**Story Points:** 24 pts
**Dependências:** Sprint 3 e 4 completos

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [User Stories](#user-stories)
   - [US-5.1: Mapas Mentais de Backlog](#us-51-mapas-mentais-de-backlog-13-pts)
   - [US-5.2: Wizard de Decomposição de Épicos](#us-52-wizard-de-decomposição-de-épicos-8-pts)
   - [US-5.3: DoD Evolutivo](#us-53-dod-evolutivo-3-pts)
3. [Arquitetura Técnica](#arquitetura-técnica)
4. [Database Schema](#database-schema)
5. [Implementation Guide](#implementation-guide)
6. [Testing Strategy](#testing-strategy)
7. [Checklist de Qualidade](#checklist-de-qualidade)

---

## 🎯 VISÃO GERAL

### Objetivo do Sprint 5

Transformar o Product Backlog de **lista plana** em **estrutura visual e hierárquica**, permitindo:
- Visualização de dependências e agrupamentos
- Decomposição guiada de épicos em histórias menores
- Evolução gradual da Definition of Done conforme maturidade do time

### Problema Atual

**Backlog plano:**
```
❌ 50+ histórias sem hierarquia
❌ Épicos misturados com tarefas pequenas
❌ Difícil ver o "big picture"
❌ Decomposição manual e trabalhosa
❌ DoD estático (não evolui com o time)
```

### Solução Sprint 5

**Backlog hierárquico e visual:**
```
✅ Mapa mental interativo (drag & drop)
✅ Wizard que guia decomposição de épicos
✅ DoD que amadurece junto com o time
✅ Visão de dependências e clusters
✅ Export em múltiplos formatos
```

---

## 📊 USER STORIES

### US-5.1: Mapas Mentais de Backlog (13 pts)

**Como** Product Owner
**Quero** visualizar o backlog como mapa mental
**Para** entender hierarquia, dependências e clusters de features relacionadas

#### Métricas

- **Business Value:** 21 (Alta - visualização melhora planejamento)
- **Work Effort:** 8 (Média-Alta - requer biblioteca de diagramas)
- **BV/W Ratio:** 2.63 (Alta prioridade)
- **Story Points:** 13 pts

#### Critérios de Aceitação

1. ✅ Consigo ver backlog como mapa mental interativo
2. ✅ Posso criar "clusters" (agrupamentos de features relacionadas)
3. ✅ Posso arrastar features entre clusters (drag & drop)
4. ✅ Vejo linhas de dependência entre features
5. ✅ Posso criar/editar/deletar clusters
6. ✅ Posso expandir/colapsar clusters
7. ✅ Posso exportar mapa (PNG, SVG, JSON)
8. ✅ Mapa sincroniza automaticamente com backlog
9. ✅ Performance OK com 100+ features

#### Database Schema

```sql
-- Clusters (agrupamentos de features)
CREATE TABLE feature_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#3b82f6', -- Hex color for visual distinction
  position_x FLOAT NOT NULL DEFAULT 0, -- X coordinate in canvas
  position_y FLOAT NOT NULL DEFAULT 0, -- Y coordinate in canvas
  is_collapsed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Relacionamento features com clusters
CREATE TABLE feature_cluster_members (
  feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  cluster_id UUID NOT NULL REFERENCES feature_clusters(id) ON DELETE CASCADE,
  position_x FLOAT NOT NULL DEFAULT 0, -- Position within cluster
  position_y FLOAT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (feature_id, cluster_id)
);

-- Dependências entre features
CREATE TABLE feature_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE, -- Feature que depende
  depends_on_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE, -- Feature da qual depende
  dependency_type TEXT NOT NULL CHECK (dependency_type IN ('blocks', 'relates_to', 'duplicates')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(feature_id, depends_on_id)
);

-- Índices
CREATE INDEX idx_feature_clusters_project ON feature_clusters(project_id);
CREATE INDEX idx_feature_cluster_members_cluster ON feature_cluster_members(cluster_id);
CREATE INDEX idx_feature_dependencies_feature ON feature_dependencies(feature_id);
CREATE INDEX idx_feature_dependencies_depends_on ON feature_dependencies(depends_on_id);

-- RLS Policies
ALTER TABLE feature_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_cluster_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_dependencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view clusters of their projects" ON feature_clusters
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE organization_id IN (
      SELECT organization_id FROM team_members WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can manage clusters of their projects" ON feature_clusters
  FOR ALL USING (
    project_id IN (SELECT id FROM projects WHERE organization_id IN (
      SELECT organization_id FROM team_members WHERE user_id = auth.uid()
    ))
  );

-- Similar policies for other tables...

-- Computed field: cluster com contagem de features
CREATE OR REPLACE VIEW cluster_summary AS
SELECT
  c.id,
  c.project_id,
  c.name,
  c.color,
  c.position_x,
  c.position_y,
  c.is_collapsed,
  COUNT(fcm.feature_id) as feature_count,
  COALESCE(SUM(f.story_points), 0) as total_story_points,
  COUNT(DISTINCT f.id) FILTER (WHERE f.status = 'done') as features_done
FROM feature_clusters c
LEFT JOIN feature_cluster_members fcm ON c.id = fcm.cluster_id
LEFT JOIN features f ON fcm.feature_id = f.id
GROUP BY c.id, c.project_id, c.name, c.color, c.position_x, c.position_y, c.is_collapsed;
```

#### API Endpoints

**1. GET /api/projects/[id]/backlog-map**
```typescript
// src/app/api/projects/[id]/backlog-map/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  const projectId = params.id

  // Fetch clusters
  const { data: clusters } = await supabase
    .from('cluster_summary')
    .select('*')
    .eq('project_id', projectId)

  // Fetch features with cluster membership
  const { data: features } = await supabase
    .from('features')
    .select(`
      *,
      feature_cluster_members(cluster_id, position_x, position_y)
    `)
    .eq('project_id', projectId)

  // Fetch dependencies
  const { data: dependencies } = await supabase
    .from('feature_dependencies')
    .select('*')
    .eq('project_id', projectId)

  return NextResponse.json({
    data: {
      clusters,
      features,
      dependencies
    }
  })
}
```

**2. POST /api/projects/[id]/clusters**
```typescript
// Create new cluster
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  const body = await request.json()

  const { data, error } = await supabase
    .from('feature_clusters')
    .insert({
      project_id: params.id,
      name: body.name,
      description: body.description,
      color: body.color || '#3b82f6',
      position_x: body.position_x || 0,
      position_y: body.position_y || 0
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ data })
}
```

**3. PATCH /api/clusters/[id]**
```typescript
// Update cluster (position, name, etc)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  const body = await request.json()

  const { data, error } = await supabase
    .from('feature_clusters')
    .update({
      name: body.name,
      description: body.description,
      color: body.color,
      position_x: body.position_x,
      position_y: body.position_y,
      is_collapsed: body.is_collapsed,
      updated_at: new Date().toISOString()
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ data })
}
```

**4. POST /api/features/[id]/move-to-cluster**
```typescript
// Move feature to cluster
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  const { clusterId, position } = await request.json()

  // Remove from old cluster (if any)
  await supabase
    .from('feature_cluster_members')
    .delete()
    .eq('feature_id', params.id)

  // Add to new cluster
  const { data, error } = await supabase
    .from('feature_cluster_members')
    .insert({
      feature_id: params.id,
      cluster_id: clusterId,
      position_x: position?.x || 0,
      position_y: position?.y || 0
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ data })
}
```

**5. POST /api/features/[id]/dependencies**
```typescript
// Create dependency
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  const { dependsOnId, dependencyType, projectId } = await request.json()

  // Prevent circular dependencies (basic check)
  const { data: existing } = await supabase
    .from('feature_dependencies')
    .select('*')
    .eq('feature_id', dependsOnId)
    .eq('depends_on_id', params.id)

  if (existing && existing.length > 0) {
    return NextResponse.json(
      { error: 'Circular dependency detected' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('feature_dependencies')
    .insert({
      project_id: projectId,
      feature_id: params.id,
      depends_on_id: dependsOnId,
      dependency_type: dependencyType || 'blocks'
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ data })
}
```

#### Hooks

```typescript
// src/hooks/backlog/useBacklogMap.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface BacklogMapData {
  clusters: Cluster[]
  features: FeatureWithCluster[]
  dependencies: Dependency[]
}

interface Cluster {
  id: string
  name: string
  color: string
  position_x: number
  position_y: number
  is_collapsed: boolean
  feature_count: number
  total_story_points: number
}

interface FeatureWithCluster extends Feature {
  feature_cluster_members: {
    cluster_id: string
    position_x: number
    position_y: number
  }[]
}

interface Dependency {
  id: string
  feature_id: string
  depends_on_id: string
  dependency_type: 'blocks' | 'relates_to' | 'duplicates'
}

export function useBacklogMap(projectId: string) {
  return useQuery({
    queryKey: ['backlog-map', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/backlog-map`)
      if (!res.ok) throw new Error('Failed to fetch backlog map')
      const { data } = await res.json()
      return data as BacklogMapData
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5 // 5 minutes
  })
}

export function useCreateCluster(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (cluster: Partial<Cluster>) => {
      const res = await fetch(`/api/projects/${projectId}/clusters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cluster)
      })
      if (!res.ok) throw new Error('Failed to create cluster')
      const { data } = await res.json()
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlog-map', projectId] })
    }
  })
}

export function useUpdateCluster() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      clusterId,
      updates
    }: {
      clusterId: string
      updates: Partial<Cluster>
    }) => {
      const res = await fetch(`/api/clusters/${clusterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (!res.ok) throw new Error('Failed to update cluster')
      const { data } = await res.json()
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlog-map'] })
    }
  })
}

export function useMoveFeatureToCluster() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      featureId,
      clusterId,
      position
    }: {
      featureId: string
      clusterId: string
      position: { x: number; y: number }
    }) => {
      const res = await fetch(`/api/features/${featureId}/move-to-cluster`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clusterId, position })
      })
      if (!res.ok) throw new Error('Failed to move feature')
      const { data } = await res.json()
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlog-map'] })
      queryClient.invalidateQueries({ queryKey: ['features'] })
    }
  })
}

export function useCreateDependency() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      featureId,
      dependsOnId,
      dependencyType,
      projectId
    }: {
      featureId: string
      dependsOnId: string
      dependencyType: 'blocks' | 'relates_to' | 'duplicates'
      projectId: string
    }) => {
      const res = await fetch(`/api/features/${featureId}/dependencies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dependsOnId, dependencyType, projectId })
      })
      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error || 'Failed to create dependency')
      }
      const { data } = await res.json()
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlog-map'] })
    }
  })
}
```

#### Componentes React

**1. BacklogMapPage (Main Component)**

```typescript
// src/app/(dashboard)/projects/[id]/backlog-map/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { useBacklogMap } from '@/hooks/backlog/useBacklogMap'
import { BacklogMapCanvas } from '@/components/backlog/backlog-map-canvas'
import { BacklogMapToolbar } from '@/components/backlog/backlog-map-toolbar'
import { BacklogMapSidebar } from '@/components/backlog/backlog-map-sidebar'
import { Loader2 } from 'lucide-react'

export default function BacklogMapPage() {
  const params = useParams()
  const projectId = params.id as string

  const { data, isLoading, error } = useBacklogMap(projectId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">Error loading backlog map</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <BacklogMapToolbar projectId={projectId} />

      <div className="flex flex-1 overflow-hidden">
        <BacklogMapCanvas
          clusters={data.clusters}
          features={data.features}
          dependencies={data.dependencies}
          projectId={projectId}
        />

        <BacklogMapSidebar
          clusters={data.clusters}
          features={data.features}
        />
      </div>
    </div>
  )
}
```

**2. BacklogMapCanvas (Interactive Canvas)**

```typescript
// src/components/backlog/backlog-map-canvas.tsx
'use client'

import { useRef, useEffect, useState } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  addEdge
} from 'reactflow'
import 'reactflow/dist/style.css'
import { ClusterNode } from './cluster-node'
import { FeatureNode } from './feature-node'
import { useUpdateCluster, useMoveFeatureToCluster, useCreateDependency } from '@/hooks/backlog/useBacklogMap'

const nodeTypes = {
  cluster: ClusterNode,
  feature: FeatureNode
}

interface Props {
  clusters: Cluster[]
  features: FeatureWithCluster[]
  dependencies: Dependency[]
  projectId: string
}

export function BacklogMapCanvas({ clusters, features, dependencies, projectId }: Props) {
  const updateCluster = useUpdateCluster()
  const moveFeature = useMoveFeatureToCluster()
  const createDependency = useCreateDependency()

  // Convert clusters and features to ReactFlow nodes
  const initialNodes: Node[] = [
    ...clusters.map(cluster => ({
      id: `cluster-${cluster.id}`,
      type: 'cluster',
      position: { x: cluster.position_x, y: cluster.position_y },
      data: cluster
    })),
    ...features.map(feature => {
      const clusterMember = feature.feature_cluster_members[0]
      return {
        id: `feature-${feature.id}`,
        type: 'feature',
        position: clusterMember
          ? { x: clusterMember.position_x, y: clusterMember.position_y }
          : { x: 0, y: 0 },
        parentNode: clusterMember ? `cluster-${clusterMember.cluster_id}` : undefined,
        data: feature
      }
    })
  ]

  // Convert dependencies to edges
  const initialEdges: Edge[] = dependencies.map(dep => ({
    id: dep.id,
    source: `feature-${dep.feature_id}`,
    target: `feature-${dep.depends_on_id}`,
    label: dep.dependency_type,
    type: dep.dependency_type === 'blocks' ? 'step' : 'default',
    animated: dep.dependency_type === 'blocks'
  }))

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Update on data change
  useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [clusters, features, dependencies])

  // Handle node drag end
  const onNodeDragStop = (event: React.MouseEvent, node: Node) => {
    if (node.type === 'cluster') {
      const clusterId = node.id.replace('cluster-', '')
      updateCluster.mutate({
        clusterId,
        updates: {
          position_x: node.position.x,
          position_y: node.position.y
        }
      })
    } else if (node.type === 'feature') {
      const featureId = node.id.replace('feature-', '')
      const clusterId = node.parentNode?.replace('cluster-', '')

      if (clusterId) {
        moveFeature.mutate({
          featureId,
          clusterId,
          position: node.position
        })
      }
    }
  }

  // Handle connection (create dependency)
  const onConnect = (connection: Connection) => {
    if (!connection.source || !connection.target) return

    const featureId = connection.source.replace('feature-', '')
    const dependsOnId = connection.target.replace('feature-', '')

    createDependency.mutate({
      featureId,
      dependsOnId,
      dependencyType: 'blocks',
      projectId
    })

    setEdges((eds) => addEdge(connection, eds))
  }

  return (
    <div className="flex-1 bg-muted/20">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}
```

**3. ClusterNode (Custom Node)**

```typescript
// src/components/backlog/cluster-node.tsx
'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const ClusterNode = memo(({ data }: NodeProps) => {
  const cluster = data as Cluster

  return (
    <>
      <Card
        className="min-w-[300px] min-h-[200px] shadow-lg"
        style={{ borderColor: cluster.color, borderWidth: 3 }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{cluster.name}</CardTitle>
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: cluster.color }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Features:</span>
              <Badge variant="secondary">{cluster.feature_count}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Story Points:</span>
              <Badge variant="secondary">{cluster.total_story_points}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Done:</span>
              <Badge variant="secondary">{cluster.features_done}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </>
  )
})

ClusterNode.displayName = 'ClusterNode'
```

#### Bibliotecas Necessárias

```bash
pnpm add reactflow
pnpm add @types/reactflow -D
```

#### Fluxo de Uso

1. **PO acessa `/projects/[id]/backlog-map`**
2. **Sistema carrega clusters, features e dependências**
3. **PO pode:**
   - Criar novo cluster (botão "New Cluster")
   - Arrastar features entre clusters
   - Criar dependências conectando features
   - Expandir/colapsar clusters
   - Exportar mapa (PNG/SVG)
4. **Mudanças sincronizam automaticamente com backlog**

#### Testing

```typescript
// src/__tests__/backlog-map.test.tsx
import { render, screen } from '@testing-library/react'
import { BacklogMapCanvas } from '@/components/backlog/backlog-map-canvas'

describe('BacklogMapCanvas', () => {
  it('renders clusters', () => {
    const clusters = [
      { id: '1', name: 'Auth', color: '#3b82f6', position_x: 0, position_y: 0 }
    ]

    render(
      <BacklogMapCanvas
        clusters={clusters}
        features={[]}
        dependencies={[]}
        projectId="test-project"
      />
    )

    expect(screen.getByText('Auth')).toBeInTheDocument()
  })
})
```

#### DoD Checklist

- [ ] Mapa renderiza corretamente
- [ ] Drag & drop funciona (clusters e features)
- [ ] Dependências aparecem como linhas
- [ ] Export PNG/SVG funciona
- [ ] Performance OK com 100+ features (< 2s render)
- [ ] Sincroniza com backlog automaticamente
- [ ] Mobile responsivo (ou mensagem de "desktop only")
- [ ] Code review aprovado
- [ ] PO aceitou

---

### US-5.2: Wizard de Decomposição de Épicos (8 pts)

**Como** Product Owner
**Quero** wizard guiado para decompor épicos em histórias
**Para** garantir que histórias sejam pequenas e executáveis em 1 sprint

#### Métricas

- **Business Value:** 13 (Média-Alta - reduz épicos grandes)
- **Work Effort:** 5 (Média - wizard com steps)
- **BV/W Ratio:** 2.60 (Alta prioridade)
- **Story Points:** 8 pts

#### Critérios de Aceitação

1. ✅ Consigo iniciar wizard ao clicar "Decompose" em um épico
2. ✅ Wizard guia com 5 steps:
   - Step 1: Confirmar que é épico (> 13 pts ou > 1 sprint)
   - Step 2: Identificar "personas" ou "cenários" do épico
   - Step 3: Quebrar por persona/cenário (sugestões automáticas)
   - Step 4: Validar INVEST em cada história criada
   - Step 5: Review final e criar histórias
3. ✅ Sistema sugere decomposição baseado em padrões
4. ✅ Consigo editar sugestões antes de criar
5. ✅ Histórias criadas herdam tags e prioridade do épico
6. ✅ Épico original é marcado como "decomposed" (não deletado)
7. ✅ Histórias linkam de volta ao épico pai

#### Database Schema

```sql
-- Relacionamento épico → histórias
CREATE TABLE epic_decomposition (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  epic_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE, -- O épico original
  child_story_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE, -- História criada
  decomposition_strategy TEXT, -- Ex: "by_persona", "by_scenario", "by_layer"
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(epic_id, child_story_id)
);

-- Adicionar campo ao features para marcar como épico decomposto
ALTER TABLE features ADD COLUMN IF NOT EXISTS is_epic BOOLEAN DEFAULT false;
ALTER TABLE features ADD COLUMN IF NOT EXISTS decomposed_at TIMESTAMPTZ;

-- Índice
CREATE INDEX idx_epic_decomposition_epic ON epic_decomposition(epic_id);
CREATE INDEX idx_epic_decomposition_child ON epic_decomposition(child_story_id);

-- RLS
ALTER TABLE epic_decomposition ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view decompositions of their projects" ON epic_decomposition
  FOR SELECT USING (
    epic_id IN (SELECT id FROM features WHERE project_id IN (
      SELECT id FROM projects WHERE organization_id IN (
        SELECT organization_id FROM team_members WHERE user_id = auth.uid()
      )
    ))
  );
```

#### API Endpoints

**POST /api/features/[id]/decompose**

```typescript
// src/app/api/features/[id]/decompose/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

interface DecomposeRequest {
  stories: {
    title: string
    description: string
    story_points: number
    acceptance_criteria: string[]
  }[]
  strategy: string
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  const epicId = params.id
  const body: DecomposeRequest = await request.json()

  // Get epic details
  const { data: epic } = await supabase
    .from('features')
    .select('*')
    .eq('id', epicId)
    .single()

  if (!epic) {
    return NextResponse.json({ error: 'Epic not found' }, { status: 404 })
  }

  // Create child stories
  const createdStories = []

  for (const story of body.stories) {
    const { data: newStory } = await supabase
      .from('features')
      .insert({
        project_id: epic.project_id,
        title: story.title,
        description: story.description,
        story_points: story.story_points,
        acceptance_criteria: story.acceptance_criteria,
        priority: epic.priority, // Inherit priority
        tags: epic.tags, // Inherit tags
        status: 'backlog'
      })
      .select()
      .single()

    if (newStory) {
      // Create decomposition link
      await supabase
        .from('epic_decomposition')
        .insert({
          epic_id: epicId,
          child_story_id: newStory.id,
          decomposition_strategy: body.strategy
        })

      createdStories.push(newStory)
    }
  }

  // Mark epic as decomposed
  await supabase
    .from('features')
    .update({
      is_epic: true,
      decomposed_at: new Date().toISOString(),
      status: 'archived' // Optional: move to archived
    })
    .eq('id', epicId)

  return NextResponse.json({
    data: {
      epic,
      stories: createdStories
    }
  })
}
```

**GET /api/features/[id]/suggest-decomposition**

```typescript
// Suggest decomposition using AI or patterns
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  const epicId = params.id

  const { data: epic } = await supabase
    .from('features')
    .select('*')
    .eq('id', epicId)
    .single()

  if (!epic) {
    return NextResponse.json({ error: 'Epic not found' }, { status: 404 })
  }

  // Simple pattern-based suggestions
  const suggestions = []

  // Strategy 1: By persona (detect keywords like "user", "admin", "guest")
  if (epic.description?.match(/user|admin|guest|customer/i)) {
    suggestions.push({
      strategy: 'by_persona',
      label: 'Decompose by User Type',
      stories: [
        {
          title: `${epic.title} - As User`,
          description: `User perspective of ${epic.description}`,
          story_points: Math.ceil(epic.story_points / 3)
        },
        {
          title: `${epic.title} - As Admin`,
          description: `Admin perspective of ${epic.description}`,
          story_points: Math.ceil(epic.story_points / 3)
        }
      ]
    })
  }

  // Strategy 2: By layer (Frontend, Backend, Database)
  if (epic.story_points > 13) {
    suggestions.push({
      strategy: 'by_layer',
      label: 'Decompose by Technical Layer',
      stories: [
        {
          title: `${epic.title} - Backend API`,
          description: 'Backend implementation',
          story_points: 5
        },
        {
          title: `${epic.title} - Frontend UI`,
          description: 'Frontend implementation',
          story_points: 5
        },
        {
          title: `${epic.title} - Integration`,
          description: 'Integration and testing',
          story_points: 3
        }
      ]
    })
  }

  // Strategy 3: By acceptance criteria
  if (epic.acceptance_criteria && epic.acceptance_criteria.length > 3) {
    suggestions.push({
      strategy: 'by_criteria',
      label: 'Decompose by Acceptance Criteria',
      stories: epic.acceptance_criteria.slice(0, 3).map((criteria, idx) => ({
        title: `${epic.title} - Part ${idx + 1}`,
        description: criteria,
        story_points: Math.ceil(epic.story_points / epic.acceptance_criteria.length)
      }))
    })
  }

  return NextResponse.json({ data: suggestions })
}
```

#### Hook

```typescript
// src/hooks/backlog/useEpicDecomposition.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useSuggestDecomposition(epicId: string) {
  return useQuery({
    queryKey: ['decompose-suggestions', epicId],
    queryFn: async () => {
      const res = await fetch(`/api/features/${epicId}/suggest-decomposition`)
      if (!res.ok) throw new Error('Failed to fetch suggestions')
      const { data } = await res.json()
      return data
    },
    enabled: !!epicId
  })
}

export function useDecomposeEpic() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      epicId,
      stories,
      strategy
    }: {
      epicId: string
      stories: any[]
      strategy: string
    }) => {
      const res = await fetch(`/api/features/${epicId}/decompose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stories, strategy })
      })
      if (!res.ok) throw new Error('Failed to decompose epic')
      const { data } = await res.json()
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] })
      queryClient.invalidateQueries({ queryKey: ['backlog'] })
    }
  })
}
```

#### Componente - Wizard

```typescript
// src/components/backlog/epic-decomposition-wizard.tsx
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useSuggestDecomposition, useDecomposeEpic } from '@/hooks/backlog/useEpicDecomposition'
import { Loader2, ArrowRight, ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Props {
  epic: Feature
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EpicDecompositionWizard({ epic, open, onOpenChange }: Props) {
  const [step, setStep] = useState(1)
  const [selectedStrategy, setSelectedStrategy] = useState<any>(null)
  const [editedStories, setEditedStories] = useState<any[]>([])

  const { data: suggestions, isLoading } = useSuggestDecomposition(epic.id)
  const decompose = useDecomposeEpic()

  const handleNext = () => {
    if (step === 2 && selectedStrategy) {
      setEditedStories(selectedStrategy.stories)
    }
    setStep(s => s + 1)
  }

  const handleFinish = () => {
    decompose.mutate(
      {
        epicId: epic.id,
        stories: editedStories,
        strategy: selectedStrategy.strategy
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          setStep(1)
        }
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Decompose Epic: {epic.title}</DialogTitle>
          <div className="flex gap-2 mt-2">
            {[1, 2, 3, 4, 5].map(s => (
              <div
                key={s}
                className={`h-2 flex-1 rounded ${
                  s <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        {/* Step 1: Confirm Epic */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Step 1: Confirm this is an Epic</h3>
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p><strong>Title:</strong> {epic.title}</p>
              <p><strong>Story Points:</strong> <Badge>{epic.story_points}</Badge></p>
              <p><strong>Description:</strong> {epic.description}</p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm">
                ⚠️ An Epic typically has <strong>&gt;13 story points</strong> or cannot be completed in 1 sprint.
              </p>
            </div>
            <Button onClick={handleNext} className="w-full">
              Yes, this is an Epic <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 2: Choose Strategy */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Step 2: Choose Decomposition Strategy</h3>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions?.map((suggestion: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-4 border rounded-lg cursor-pointer transition ${
                      selectedStrategy === suggestion
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedStrategy(suggestion)}
                  >
                    <h4 className="font-medium">{suggestion.label}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Will create {suggestion.stories.length} stories
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!selectedStrategy}
                className="flex-1"
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Edit Stories */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Step 3: Review & Edit Stories</h3>
            <div className="space-y-3">
              {editedStories.map((story, idx) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <input
                    type="text"
                    value={story.title}
                    onChange={(e) => {
                      const updated = [...editedStories]
                      updated[idx].title = e.target.value
                      setEditedStories(updated)
                    }}
                    className="w-full font-medium bg-transparent border-b pb-1 mb-2"
                  />
                  <textarea
                    value={story.description}
                    onChange={(e) => {
                      const updated = [...editedStories]
                      updated[idx].description = e.target.value
                      setEditedStories(updated)
                    }}
                    className="w-full text-sm bg-transparent resize-none"
                    rows={2}
                  />
                  <div className="mt-2">
                    <Badge variant="secondary">{story.story_points} pts</Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: INVEST Validation */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Step 4: INVEST Validation</h3>
            <p className="text-sm text-muted-foreground">
              Check if stories follow INVEST criteria:
            </p>
            <div className="space-y-2">
              {['Independent', 'Negotiable', 'Valuable', 'Estimable', 'Small', 'Testable'].map(criteria => (
                <div key={criteria} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">{criteria}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Final Review */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Step 5: Final Review</h3>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm mb-2">You are about to create:</p>
              <ul className="list-disc list-inside space-y-1">
                {editedStories.map((story, idx) => (
                  <li key={idx} className="text-sm">{story.title}</li>
                ))}
              </ul>
              <p className="text-sm mt-4">
                The original epic will be marked as <Badge>decomposed</Badge>
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(4)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button
                onClick={handleFinish}
                className="flex-1"
                disabled={decompose.isPending}
              >
                {decompose.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                ) : (
                  'Create Stories'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
```

#### DoD Checklist

- [ ] Wizard com 5 steps funciona
- [ ] Sugestões automáticas aparecem
- [ ] Posso editar histórias antes de criar
- [ ] Histórias criadas aparecem no backlog
- [ ] Épico marcado como "decomposed"
- [ ] Link épico → histórias funciona
- [ ] Code review aprovado
- [ ] PO aceitou

---

### US-5.3: DoD Evolutivo (3 pts)

**Como** Scrum Master
**Quero** que Definition of Done evolua conforme maturidade do time
**Para** não sobrecarregar times novos e elevar qualidade gradualmente

#### Métricas

- **Business Value:** 8 (Média - melhora qualidade gradual)
- **Work Effort:** 3 (Baixa - níveis de DoD)
- **BV/W Ratio:** 2.67 (Alta prioridade)
- **Story Points:** 3 pts

#### Critérios de Aceitação

1. ✅ Consigo definir 3 níveis de DoD:
   - Nível 1 (Iniciante): Código funciona + testes manuais
   - Nível 2 (Intermediário): + Testes automatizados + code review
   - Nível 3 (Avançado): + Performance + Security + Docs
2. ✅ Time começa no Nível 1 automaticamente
3. ✅ Sistema sugere upgrade de nível após:
   - 3 sprints com velocity estável
   - Completion rate > 85%
   - Zero bugs críticos em produção
4. ✅ Posso customizar critérios de cada nível
5. ✅ DoD atual aparece no quadro de sprint
6. ✅ Histórico de evoluções do DoD é guardado

#### Database Schema

```sql
-- Níveis de DoD
CREATE TABLE dod_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  level INT NOT NULL CHECK (level IN (1, 2, 3)),
  name TEXT NOT NULL, -- Ex: "Iniciante", "Intermediário", "Avançado"
  criteria JSONB NOT NULL, -- Array de critérios
  is_active BOOLEAN NOT NULL DEFAULT false,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, level)
);

-- Histórico de mudanças de DoD
CREATE TABLE dod_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  from_level INT,
  to_level INT NOT NULL,
  reason TEXT,
  changed_by UUID REFERENCES team_members(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_dod_levels_project ON dod_levels(project_id);
CREATE INDEX idx_dod_history_project ON dod_history(project_id);

-- RLS
ALTER TABLE dod_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE dod_history ENABLE ROW LEVEL SECURITY;

-- Seed DoD padrão para novos projetos (trigger)
CREATE OR REPLACE FUNCTION seed_default_dod()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO dod_levels (project_id, level, name, criteria, is_active) VALUES
  (NEW.id, 1, 'Iniciante', '["Código funciona", "Testes manuais OK", "Sem erros de lint"]'::jsonb, true),
  (NEW.id, 2, 'Intermediário', '["Código funciona", "Testes automatizados", "Code review aprovado", "Sem erros de lint"]'::jsonb, false),
  (NEW.id, 3, 'Avançado', '["Código funciona", "Testes automatizados (>80% coverage)", "Code review aprovado", "Performance OK (<2s)", "Security scan passou", "Documentação atualizada"]'::jsonb, false);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_seed_dod
AFTER INSERT ON projects
FOR EACH ROW
EXECUTE FUNCTION seed_default_dod();
```

#### API Endpoints

**GET /api/projects/[id]/dod**

```typescript
// Get current DoD level
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })

  const { data: levels } = await supabase
    .from('dod_levels')
    .select('*')
    .eq('project_id', params.id)
    .order('level', { ascending: true })

  const activeLevel = levels?.find(l => l.is_active)

  return NextResponse.json({
    data: {
      levels,
      activeLevel,
      canUpgrade: await checkUpgradeEligibility(params.id, supabase)
    }
  })
}

async function checkUpgradeEligibility(projectId: string, supabase: any) {
  // Check if team is ready for next level
  const { data: velocityData } = await supabase
    .from('sprint_velocity')
    .select('velocity, completion_rate')
    .eq('project_id', projectId)
    .order('sprint_number', { ascending: false })
    .limit(3)

  if (!velocityData || velocityData.length < 3) {
    return false
  }

  // Check stability (velocity variance < 20%)
  const velocities = velocityData.map(v => v.velocity)
  const avg = velocities.reduce((a, b) => a + b, 0) / velocities.length
  const variance = velocities.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / velocities.length
  const stdDev = Math.sqrt(variance)
  const coefficientOfVariation = (stdDev / avg) * 100

  // Check completion rate
  const avgCompletion = velocityData.reduce((sum, v) => sum + v.completion_rate, 0) / velocityData.length

  return coefficientOfVariation < 20 && avgCompletion > 85
}
```

**POST /api/projects/[id]/dod/upgrade**

```typescript
// Upgrade DoD level
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  const { toLevel, reason } = await request.json()

  // Get current level
  const { data: currentLevel } = await supabase
    .from('dod_levels')
    .select('level')
    .eq('project_id', params.id)
    .eq('is_active', true)
    .single()

  // Deactivate current
  await supabase
    .from('dod_levels')
    .update({ is_active: false })
    .eq('project_id', params.id)
    .eq('is_active', true)

  // Activate new level
  await supabase
    .from('dod_levels')
    .update({
      is_active: true,
      activated_at: new Date().toISOString()
    })
    .eq('project_id', params.id)
    .eq('level', toLevel)

  // Record history
  const { data: user } = await supabase.auth.getUser()
  const { data: member } = await supabase
    .from('team_members')
    .select('id')
    .eq('user_id', user?.user?.id)
    .single()

  await supabase
    .from('dod_history')
    .insert({
      project_id: params.id,
      from_level: currentLevel?.level,
      to_level: toLevel,
      reason,
      changed_by: member?.id
    })

  return NextResponse.json({ success: true })
}
```

#### Hook

```typescript
// src/hooks/quality/useDod.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useDod(projectId: string) {
  return useQuery({
    queryKey: ['dod', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/dod`)
      if (!res.ok) throw new Error('Failed to fetch DoD')
      const { data } = await res.json()
      return data
    },
    enabled: !!projectId
  })
}

export function useUpgradeDod(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ toLevel, reason }: { toLevel: number; reason: string }) => {
      const res = await fetch(`/api/projects/${projectId}/dod/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toLevel, reason })
      })
      if (!res.ok) throw new Error('Failed to upgrade DoD')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dod', projectId] })
    }
  })
}
```

#### Componente

```typescript
// src/components/quality/dod-card.tsx
'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDod, useUpgradeDod } from '@/hooks/quality/useDod'
import { TrendingUp } from 'lucide-react'

interface Props {
  projectId: string
}

export function DodCard({ projectId }: Props) {
  const { data, isLoading } = useDod(projectId)
  const upgrade = useUpgradeDod(projectId)

  if (isLoading) return <div>Loading DoD...</div>

  const { activeLevel, levels, canUpgrade } = data

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Definition of Done</CardTitle>
          <Badge variant={activeLevel?.level === 3 ? 'default' : 'secondary'}>
            Level {activeLevel?.level} - {activeLevel?.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Current Criteria:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {activeLevel?.criteria?.map((criteria: string, idx: number) => (
              <li key={idx}>{criteria}</li>
            ))}
          </ul>
        </div>

        {canUpgrade && activeLevel?.level < 3 && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
              🎉 Your team is ready for the next level!
            </p>
            <Button
              size="sm"
              onClick={() =>
                upgrade.mutate({
                  toLevel: activeLevel.level + 1,
                  reason: 'Team showed consistent performance and quality'
                })
              }
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Upgrade to Level {activeLevel.level + 1}
            </Button>
          </div>
        )}

        <div className="pt-4 border-t">
          <h4 className="font-medium text-sm mb-2">All Levels:</h4>
          <div className="space-y-2">
            {levels?.map((level: any) => (
              <div
                key={level.id}
                className={`p-2 rounded text-sm ${
                  level.is_active ? 'bg-primary/10' : 'bg-muted/50'
                }`}
              >
                <div className="font-medium">
                  Level {level.level}: {level.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {level.criteria.length} criteria
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

#### DoD Checklist

- [ ] 3 níveis de DoD criados por padrão
- [ ] Sistema detecta elegibilidade para upgrade
- [ ] Posso fazer upgrade manual
- [ ] Histórico de mudanças guardado
- [ ] DoD atual visível no sprint
- [ ] Code review aprovado
- [ ] PO aceitou

---

## 🏗️ ARQUITETURA TÉCNICA

### Tech Stack Sprint 5

- **Frontend:** React Flow (mapas mentais), Shadcn/ui (wizard)
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (Supabase) - Novas tabelas
- **State:** React Query (caching)

### Novas Dependências

```json
{
  "dependencies": {
    "reactflow": "^11.10.4"
  }
}
```

### Performance Considerations

- React Flow otimizado para 100+ nodes
- Debounce em drag & drop (300ms)
- Materialized view para cluster_summary
- Índices em foreign keys

---

## 📊 DATABASE SCHEMA COMPLETO

Migration completa em arquivo separado: `database/migrations/009_sprint_5_backlog.sql`

---

## 🧪 TESTING STRATEGY

### Unit Tests

```bash
# Hooks
- useBacklogMap.test.ts
- useEpicDecomposition.test.ts
- useDod.test.ts

# Components
- backlog-map-canvas.test.tsx
- epic-decomposition-wizard.test.tsx
- dod-card.test.tsx
```

### Integration Tests

```bash
# E2E flows
- Create cluster → Add features → Export map
- Decompose epic → Create 3 stories → Validate INVEST
- Upgrade DoD → Check history → Verify criteria
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
- [ ] Deploy em staging OK
- [ ] Performance OK (< 2s carregamento)

### Sprint 5 completo quando:

- [ ] ≥ 2 das 3 US aceitas
- [ ] Backlog visualizável como mapa mental
- [ ] Pelo menos 1 épico decomposto com sucesso
- [ ] DoD evolutivo funcionando
- [ ] Nenhum bug crítico

---

## 📅 CRONOGRAMA SUGERIDO

### Semana 1

**Dia 1-2:** US-5.1 (Mapas Mentais) - Setup
- Database schema
- API endpoints básicos
- ReactFlow integração

**Dia 3-5:** US-5.1 - Implementação
- Componentes drag & drop
- Clusters e dependências
- Export

### Semana 2

**Dia 6-8:** US-5.2 (Wizard Decomposição)
- Database schema
- API sugestões
- Wizard 5 steps

**Dia 9:** US-5.3 (DoD Evolutivo)
- Database schema
- Lógica de upgrade
- UI do DoD card

**Dia 10:** Review + Retro
- Demo das 3 features
- Retrospectiva
- Planejamento Sprint 6

---

## 🎯 CRITÉRIOS DE SUCESSO

Sprint 5 é **sucesso** se:
- Backlog pode ser visualizado como mapa mental
- Pelo menos 1 épico foi decomposto com sucesso
- DoD evolutivo sugere upgrades corretamente

Sprint 5 é **excelente** se:
- 3 das 3 US aceitas
- PO usa mapa mental regularmente
- Time evoluiu de nível no DoD

---

## 📞 PRÓXIMOS PASSOS

Após Sprint 5:
1. Retrospectiva
2. Registrar velocity
3. Ler `SPRINT_6_DETAILED.md`
4. Planejar Sprint 6 (Operacional)

---

**Versão:** 1.0
**Data:** 2026-02-07
**Próxima Revisão:** Após Sprint 5 Review
