# 🎯 SPRINT 4 - PRIORIZAÇÃO E QUALIDADE
## Detalhamento Completo

**Sprint Goal:** "Ao final deste Sprint, o time prioriza backlog com Planning Poker, garante qualidade com INVEST e rastreia melhorias contínuas com Retrospectives."

**Duração:** 2 semanas
**Story Points:** 18 pontos
**Prioridade:** P0/P1 - Alto
**Referência:** Guias Scrum Cap. 5.4, 5.1.3, 6.8.2

---

## 📋 ÍNDICE

1. [US-4.1: Planning Poker (BV/W)](#us-41-planning-poker-bvw)
2. [US-4.2: MVP Flag + Board](#us-42-mvp-flag--board)
3. [US-4.3: Retrospective Actions Tracker](#us-43-retrospective-actions-tracker)
4. [US-4.4: INVEST Validation](#us-44-invest-validation)
5. [Definition of Done](#definition-of-done)
6. [SQL Migrations](#sql-migrations)

---

## 📌 US-4.1: Planning Poker (BV/W)

**Story Points:** 8
**Prioridade:** P1 - Alto
**Referência:** Cap. 5.4 dos Guias Scrum

### Descrição

**Como** Product Owner e Time,
**Queremos** estimar Business Value (BV) e Work Effort (W) usando Planning Poker,
**Para** priorizar backlog objetivamente usando BV/W ratio.

### Contexto do Guia Scrum

Do Cap. 5.4:
> **BV/W Ratio:** Alto valor e baixo esforço sobe; baixo valor e alto esforço desce.
>
> **Cartas especiais:**
> - `0` = sem valor, remover
> - `∞` = prioridade máxima (bloqueador)
> - `?` = precisa Spike (timebox)
> - `☕` = pausa para pensar

### Critérios de Aceitação

**Dado que** tenho features no backlog sem estimativa
**Quando** inicio sessão de Planning Poker
**Então** posso:
- Criar sessão de poker para múltiplas features
- Votar usando cartas Fibonacci (0, ½, 1, 2, 3, 5, 8, 13, 21, ∞, ?, ☕)
- Ver votos de todos simultaneamente
- Discutir extremos (maior e menor)
- Convergir para valor final
- Fazer isso tanto para BV quanto para W

**Dado que** estimei BV e W de uma feature
**Quando** salvo as estimativas
**Então**:
- BV/W ratio é calculado automaticamente
- Feature é re-ordenada no backlog por BV/W descendente
- Histórico de votação é preservado

### Componentes Principais

#### 1. Database Schema

```sql
-- Tabela de sessões de Planning Poker
CREATE TABLE planning_poker_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  project_id UUID NOT NULL REFERENCES projects(id),

  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('business_value', 'work_effort')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),

  feature_ids UUID[] NOT NULL, -- Array de features sendo estimadas
  facilitator_id UUID REFERENCES team_members(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  UNIQUE(project_id, name)
);

-- Votos individuais
CREATE TABLE planning_poker_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES planning_poker_sessions(id) ON DELETE CASCADE,
  feature_id UUID NOT NULL REFERENCES features(id),
  voter_id UUID NOT NULL REFERENCES team_members(id),

  vote_value TEXT NOT NULL, -- '0', '1', '2', '3', '5', '8', '13', '21', '∞', '?', '☕'
  vote_numeric INT, -- NULL para cartas especiais

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(session_id, feature_id, voter_id)
);

-- Resultados finais
CREATE TABLE planning_poker_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES planning_poker_sessions(id),
  feature_id UUID NOT NULL REFERENCES features(id),

  final_value INT NOT NULL,
  consensus_level TEXT CHECK (consensus_level IN ('unanimous', 'majority', 'forced')),

  votes_summary JSONB, -- {min, max, avg, median, votes: [{voter, value}]}
  discussion_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(session_id, feature_id)
);
```

#### 2. API Endpoints

**POST /api/planning-poker/sessions**
```typescript
// Criar nova sessão
{
  "projectId": "uuid",
  "name": "Sprint 5 Planning - BV",
  "type": "business_value",
  "featureIds": ["uuid1", "uuid2", ...],
  "facilitatorId": "uuid"
}
```

**POST /api/planning-poker/sessions/:id/vote**
```typescript
// Votar em uma feature
{
  "featureId": "uuid",
  "vote": "5" // ou '∞', '?', etc
}
```

**GET /api/planning-poker/sessions/:id/results**
```typescript
// Ver resultados em tempo real
{
  "session": {...},
  "features": [
    {
      "featureId": "uuid",
      "votes": [
        {"voter": "Maria", "value": "5"},
        {"voter": "João", "value": "8"}
      ],
      "revealed": false // ou true quando facilitador revelar
    }
  ]
}
```

**POST /api/planning-poker/sessions/:id/finalize**
```typescript
// Finalizar feature e salvar resultado
{
  "featureId": "uuid",
  "finalValue": 5,
  "consensusLevel": "majority",
  "notes": "Equipe convergiu após discussão sobre riscos"
}
```

#### 3. Componentes React

**PlanningPokerSession.tsx**
```typescript
'use client'

import { useState } from 'react'
import { usePlanningPoker } from '@/hooks/usePlanningPoker'
import { PokerCard } from './poker-card'
import { VotingResults } from './voting-results'

const FIBONACCI_CARDS = ['0', '½', '1', '2', '3', '5', '8', '13', '21', '∞', '?', '☕']

export function PlanningPokerSession({ sessionId }: { sessionId: string }) {
  const { session, vote, reveal, finalize } = usePlanningPoker(sessionId)
  const [selectedCard, setSelectedCard] = useState<string | null>(null)

  const currentFeature = session.features[session.currentFeatureIndex]

  const handleVote = async (card: string) => {
    setSelectedCard(card)
    await vote(currentFeature.id, card)
  }

  return (
    <div className="space-y-6">
      {/* Feature atual */}
      <div className="p-6 border rounded-lg bg-card">
        <h2 className="text-2xl font-bold">{currentFeature.name}</h2>
        <p className="text-muted-foreground">{currentFeature.description}</p>
      </div>

      {/* Cartas de votação */}
      {!session.revealed && (
        <div className="grid grid-cols-6 md:grid-cols-12 gap-4">
          {FIBONACCI_CARDS.map((card) => (
            <PokerCard
              key={card}
              value={card}
              selected={selectedCard === card}
              onClick={() => handleVote(card)}
            />
          ))}
        </div>
      )}

      {/* Resultados (após reveal) */}
      {session.revealed && (
        <VotingResults
          votes={currentFeature.votes}
          onFinalize={(finalValue) => finalize(currentFeature.id, finalValue)}
        />
      )}

      {/* Facilitador controls */}
      {session.isFacilitator && (
        <div className="flex gap-4">
          <button onClick={reveal}>Revelar Votos</button>
          <button onClick={nextFeature}>Próxima Feature</button>
        </div>
      )}
    </div>
  )
}
```

**PokerCard.tsx**
```typescript
interface PokerCardProps {
  value: string
  selected: boolean
  onClick: () => void
}

export function PokerCard({ value, selected, onClick }: PokerCardProps) {
  const isSpecial = ['∞', '?', '☕'].includes(value)

  return (
    <button
      onClick={onClick}
      className={cn(
        "aspect-[2/3] rounded-lg border-2 flex items-center justify-center text-2xl font-bold transition-all",
        selected
          ? "border-blue-600 bg-blue-50 scale-105"
          : "border-gray-300 bg-white hover:border-blue-400",
        isSpecial && "bg-yellow-50"
      )}
    >
      {value}
    </button>
  )
}
```

#### 4. Real-time com Supabase

```typescript
// Hook usePlanningPoker com real-time
export function usePlanningPoker(sessionId: string) {
  const supabase = createClient()
  const [session, setSession] = useState<PokerSession | null>(null)

  useEffect(() => {
    // Inscrever em mudanças da sessão
    const channel = supabase
      .channel(`poker-${sessionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'planning_poker_votes',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        // Atualizar votos em tempo real
        refetchSession()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId])

  // ... resto do hook
}
```

### Fluxo de Uso

1. **PO cria sessão** de Planning Poker
   - Seleciona features a estimar
   - Define tipo (BV ou W)
   - Convida time

2. **Time vota simultaneamente**
   - Cada um escolhe carta em segredo
   - Facilitador revela quando todos votaram

3. **Extremos explicam**
   - Quem deu valor mais alto: por quê?
   - Quem deu valor mais baixo: por quê?

4. **Re-votação** (se necessário)
   - Após discussão, nova rodada
   - Objetivo: convergência (diferença < 2 cartas)

5. **Finalização**
   - Facilitador escolhe valor final
   - Sistema atualiza feature (BV ou W)
   - Recalcula BV/W ratio
   - Backlog re-ordena automaticamente

### Casos Especiais

#### Carta `∞` (Infinito)
- **Significado:** Prioridade máxima, bloqueador crítico
- **Ação:** Vai pro topo do backlog imediatamente
- **Uso:** Apenas para dependências críticas (sem isso, nada funciona)

#### Carta `?` (Interrogação)
- **Significado:** Incerteza muito alta, impossível estimar
- **Ação:** Criar Spike timeboxed (2-4 horas de pesquisa)
- **Uso:** Quando precisa validar viabilidade técnica antes

#### Carta `☕` (Café)
- **Significado:** Time precisa de pausa
- **Ação:** Break de 10-15 minutos
- **Uso:** Evita estimativas ruins por cansaço

### Métricas de Sucesso

- [ ] Sessões de poker completadas: > 2 por sprint
- [ ] Features estimadas: > 80% do backlog
- [ ] Convergência: diferença de votos < 3 cartas
- [ ] Tempo médio por feature: < 5 minutos
- [ ] Backlog re-ordenado automaticamente por BV/W

---

## 📌 US-4.2: MVP Flag + Board

**Story Points:** 3
**Prioridade:** P0 - Quick Win

### Descrição

**Como** Product Owner,
**Quero** marcar features como "MVP" e visualizar board separado,
**Para** ter clareza total sobre o que é essencial.

### Referência do Guia

Cap. 5.3:
> "Agora escolham 1: a história pela qual vocês dariam a vida."
>
> MVP = "bacana mas faltam coisas" (motiva feedback, usuários toleram gaps)

### Implementação

#### 1. Database

```sql
-- Adicionar coluna em features
ALTER TABLE features ADD COLUMN is_mvp BOOLEAN DEFAULT FALSE;

-- Índice para filtros rápidos
CREATE INDEX idx_features_mvp ON features(is_mvp) WHERE is_mvp = TRUE;

-- View de MVP status
CREATE VIEW mvp_progress AS
SELECT
  project_id,
  COUNT(*) FILTER (WHERE is_mvp = TRUE) as mvp_features_total,
  COUNT(*) FILTER (WHERE is_mvp = TRUE AND status = 'done') as mvp_features_done,
  ROUND(
    COUNT(*) FILTER (WHERE is_mvp = TRUE AND status = 'done')::float /
    NULLIF(COUNT(*) FILTER (WHERE is_mvp = TRUE), 0) * 100,
    2
  ) as mvp_progress_percentage
FROM features
GROUP BY project_id;
```

#### 2. UI Components

**MVP Badge:**
```typescript
{feature.is_mvp && (
  <Badge variant="default" className="bg-yellow-500">
    <Star className="h-3 w-3 mr-1" />
    MVP
  </Badge>
)}
```

**MVP Board Page:**
```typescript
// src/app/(dashboard)/mvp-board/page.tsx
export default function MVPBoardPage() {
  const { data: mvpFeatures } = useFeatures({ isMvp: true })

  return (
    <div>
      <h1>MVP Board</h1>
      <p>Features essenciais para o lançamento</p>

      <MVPProgressBar />
      <KanbanBoard features={mvpFeatures} />
    </div>
  )
}
```

#### 3. Filtro no Dashboard

```typescript
// Adicionar métrica no dashboard
const { data: mvpProgress } = useQuery(['mvp-progress'], async () => {
  const res = await fetch('/api/metrics/mvp-progress')
  return res.json()
})

// Card no dashboard
<Card>
  <CardHeader>
    <CardTitle>Progresso MVP</CardTitle>
  </CardHeader>
  <CardContent>
    <Progress value={mvpProgress.percentage} />
    <p>{mvpProgress.done} / {mvpProgress.total} features</p>
  </CardContent>
</Card>
```

---

## 📌 US-4.3: Retrospective Actions Tracker

**Story Points:** 4
**Prioridade:** P1 - Alto
**Referência:** Cap. 6.8.2

### Descrição

**Como** Scrum Master,
**Quero** registrar ações da Retrospective e rastrear progresso,
**Para** garantir melhoria contínua real (não só conversa).

### Referência do Guia

Cap. 6.8.2:
> "1–3 ações mensuráveis pro próximo Sprint (ex.: 'limitar WIP a 3')"

### Database Schema

```sql
CREATE TABLE retrospective_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,

  category TEXT NOT NULL CHECK (category IN ('worked_well', 'needs_improvement', 'experiment')),
  action_text TEXT NOT NULL,

  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'done', 'abandoned')),

  owner_id UUID REFERENCES team_members(id),
  due_date DATE,

  success_criteria TEXT, -- Como medir sucesso
  outcome TEXT, -- O que aconteceu de fato

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_retro_sprint ON retrospective_actions(sprint_id);
CREATE INDEX idx_retro_status ON retrospective_actions(status);
```

### UI - Retrospective Page

```typescript
// src/app/(dashboard)/sprints/[id]/retrospective/page.tsx
export default function RetrospectivePage({ params }: { params: { id: string } }) {
  const { data: sprint } = useSprint(params.id)
  const { data: actions, refetch } = useRetrospectiveActions(params.id)

  return (
    <div className="space-y-6">
      <h1>Retrospectiva - {sprint.name}</h1>

      {/* 3 Colunas */}
      <div className="grid grid-cols-3 gap-6">
        {/* O que funcionou */}
        <RetroColumn
          title="✅ O que funcionou"
          category="worked_well"
          actions={actions.filter(a => a.category === 'worked_well')}
        />

        {/* O que melhorar */}
        <RetroColumn
          title="⚠️ O que melhorar"
          category="needs_improvement"
          actions={actions.filter(a => a.category === 'needs_improvement')}
        />

        {/* Experimentos */}
        <RetroColumn
          title="🧪 Experimentos"
          category="experiment"
          actions={actions.filter(a => a.category === 'experiment')}
        />
      </div>

      {/* Actions Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Ações para o Próximo Sprint</CardTitle>
        </CardHeader>
        <CardContent>
          <ActionsList
            actions={actions.filter(a => a.category === 'experiment' && a.status !== 'done')}
          />
        </CardContent>
      </Card>
    </div>
  )
}
```

### Template de Ação

Quando criar ação na retro:

```typescript
interface RetrospectiveAction {
  category: 'experiment'
  action_text: 'Limitar WIP a 3 tarefas por pessoa'
  success_criteria: 'WIP médio < 3 medido em 3+ Dailies consecutivos'
  owner_id: 'uuid-do-time-member'
  due_date: 'data-do-proximo-sprint-review'
}
```

### Integração no Sprint Dashboard

No header do sprint:

```typescript
<div className="flex items-center gap-2">
  <h1>{sprint.name}</h1>

  {/* Badge com ações pendentes */}
  {pendingActions > 0 && (
    <Badge variant="outline">
      {pendingActions} ações da retro
    </Badge>
  )}
</div>
```

---

## 📌 US-4.4: INVEST Validation

**Story Points:** 3
**Prioridade:** P1 - Alto
**Referência:** Cap. 5.1.3

### Descrição

**Como** Product Owner,
**Quero** validar se feature passa em INVEST antes de colocar no Sprint,
**Para** garantir qualidade das histórias.

### Referência do Guia

Cap. 5.1.3:
> "Se falhar em S (Small) ou T (Testable), você não põe no Sprint — você quebra a história."

### Checklist INVEST

```typescript
interface INVESTChecklist {
  independent: boolean // Não depende de 5 outras
  negotiable: boolean // Não é contrato rígido
  valuable: boolean // Valor pro usuário/negócio
  estimable: boolean // Dá pra estimar
  small: boolean // ≤ 13 pontos
  testable: boolean // Critérios claros
}
```

### UI Component

```typescript
// src/components/features/invest-validator.tsx
export function INVESTValidator({ feature }: { feature: Feature }) {
  const [checklist, setChecklist] = useState<INVESTChecklist>({
    independent: true,
    negotiable: true,
    valuable: true,
    estimable: true,
    small: (feature.story_points || 0) <= 13,
    testable: !!feature.acceptance_criteria
  })

  const score = Object.values(checklist).filter(Boolean).length
  const passed = score >= 5 && checklist.small && checklist.testable

  return (
    <Card>
      <CardHeader>
        <CardTitle>INVEST Score: {score}/6</CardTitle>
        {!passed && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Feature não passa em INVEST. Revise antes de adicionar ao Sprint.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Checkbox
            checked={checklist.independent}
            onCheckedChange={(val) => setChecklist({...checklist, independent: !!val})}
          >
            <strong>I</strong>ndependent - Não depende de múltiplas outras
          </Checkbox>

          <Checkbox
            checked={checklist.negotiable}
            onCheckedChange={(val) => setChecklist({...checklist, negotiable: !!val})}
          >
            <strong>N</strong>egotiable - Flexível na implementação
          </Checkbox>

          <Checkbox
            checked={checklist.valuable}
            onCheckedChange={(val) => setChecklist({...checklist, valuable: !!val})}
          >
            <strong>V</strong>aluable - Tem valor pro usuário
          </Checkbox>

          <Checkbox
            checked={checklist.estimable}
            onCheckedChange={(val) => setChecklist({...checklist, estimable: !!val})}
          >
            <strong>E</strong>stimable - Dá pra estimar
          </Checkbox>

          <Checkbox
            checked={checklist.small}
            disabled
          >
            <strong>S</strong>mall - ≤ 13 pontos {!checklist.small && `(atual: ${feature.story_points})`}
          </Checkbox>

          <Checkbox
            checked={checklist.testable}
            disabled
          >
            <strong>T</strong>estable - Tem critérios de aceitação
          </Checkbox>
        </div>
      </CardContent>
    </Card>
  )
}
```

### Validação ao Adicionar no Sprint

```typescript
// src/components/sprints/add-features-modal.tsx
function AddFeaturesModal() {
  const handleAddToSprint = (featureId: string) => {
    const feature = features.find(f => f.id === featureId)

    // Validar INVEST
    const investPassed = validateINVEST(feature)

    if (!investPassed) {
      toast.error('Feature não passa em INVEST. Revise antes de adicionar.')
      return
    }

    // Continuar com adição...
  }
}
```

---

## ✅ DEFINITION OF DONE - SPRINT 4

Para cada User Story:

- [ ] Funcionalidade implementada e testada
- [ ] API endpoints com validação
- [ ] Componentes React responsivos
- [ ] Testes unitários (mínimo smoke tests)
- [ ] Integrado com Supabase (RLS ativo)
- [ ] Documentação inline (comentários)
- [ ] Code review aprovado
- [ ] Deploy em staging sem erros
- [ ] PO testou e aceitou
- [ ] Sem bugs conhecidos

---

## 🗄️ SQL MIGRATIONS

**Arquivo:** `database/migrations/009_sprint_4_quality.sql`

(Ver arquivo separado com SQL completo)

---

**Próximo:** Sprint 5 - Backlog Avançado
