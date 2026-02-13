# ❓ FAQ & TROUBLESHOOTING
## Perguntas Frequentes e Solução de Problemas

**Versão:** 1.0
**Data:** 2026-02-07
**Última Atualização:** Sprint 3 Prep

---

## 📋 ÍNDICE

1. [Perguntas Gerais](#perguntas-gerais)
2. [Problemas Técnicos Comuns](#problemas-técnicos-comuns)
3. [Erros de Migration](#erros-de-migration)
4. [Problemas de API](#problemas-de-api)
5. [Problemas de UI/UX](#problemas-de-uiux)
6. [Conceitos Scrum](#conceitos-scrum)
7. [Performance](#performance)

---

## 🤔 PERGUNTAS GERAIS

### P1: Por que implementar métricas se já temos features funcionando?

**R:** Porque **"funcionar" ≠ previsível**.

Sem velocity:
- ❌ Não sabe quando vai terminar
- ❌ Promete prazo no chute
- ❌ Surpreende stakeholder com atraso
- ❌ Não detecta problemas cedo

Com velocity:
- ✅ Prazo baseado em dados reais
- ✅ Detecta atraso 5-7 dias antes
- ✅ Forecast honesto (pessimista/provável/otimista)
- ✅ Credibilidade com stakeholder

**Referência:** Guia Scrum Cap. 8 e 12

---

### P2: Tenho que fazer TUDO do roadmap?

**R:** NÃO. Priorize por valor.

**Mínimo viável (Sprint 3 only):**
- ✅ Velocity Tracking
- ✅ Burndown Charts
- ⚠️ Resto é opcional

**Se tiver mais tempo:**
- ✅ Planning Poker (Sprint 4)
- ✅ Scrum Health (Sprint 3)

**Se quiser luxo:**
- ⚠️ Mapas Mentais (Sprint 5)
- ⚠️ Daily Logger (Sprint 6+)

**Regra de ouro:** Prefira 1 feature COMPLETA do que 4 pela metade.

---

### P3: Quanto tempo leva pra implementar Sprint 3 completo?

**R:** Depende do time.

**1 dev full-time:**
- US-3.1 (Velocity): 1-2 dias
- US-3.2 (Burndown): 2-3 dias
- US-3.3 (Forecast): 1-2 dias
- US-3.4 (Health): 2-3 dias
- **Total:** 6-10 dias úteis (2 semanas)

**2 devs em paralelo:**
- Dev A: Velocity + Forecast
- Dev B: Burndown + Health
- **Total:** 5-7 dias úteis (1 semana)

**Variáveis que afetam:**
- Familiaridade com stack (React Query, Recharts, Supabase)
- Qualidade do código (TDD vs cowboy coding)
- Interrupções

---

### P4: E se eu não tiver sprints completos ainda?

**R:** **Normal!** Você está no Sprint 2.

**O que fazer:**

1. **Complete Sprint 2 primeiro**
   - Não começe Sprint 3 sem terminar Sprint 2
   - Scrum é incremental, não paralelo

2. **Implemente a infraestrutura agora**
   - Migration 008 cria tabelas vazias (OK)
   - Componentes mostram "Nenhum dado ainda" (OK)
   - Quando completar próximos sprints, dados aparecem

3. **Popule com dados históricos (opcional)**
   ```sql
   -- Se tiver sprints antigos sem dados, inserir manualmente
   INSERT INTO sprint_velocity (sprint_id, velocity, ...)
   VALUES (...);
   ```

**Bottom line:** Sistema funciona com 0 ou com 100 sprints. Comece agora.

---

### P5: Preciso ser expert em Scrum pra usar isso?

**R:** NÃO.

**Níveis de maturidade:**

**Iniciante (Sprint 0-2):**
- Use DoD básico (6 checkboxes)
- Use velocity simples (pontos done)
- Ignore smells por enquanto

**Intermediário (Sprint 3-10):**
- Adicione burndown
- Comece rastreando velocity
- Detecte smells óbvios (carry-over alto)

**Avançado (Sprint 10+):**
- Planning Poker com BV/W
- DoD evolutivo
- Mapas mentais
- Forecast por faixas

**Regra:** Sistema cresce com você. Não precisa usar tudo de cara.

---

## 🐛 PROBLEMAS TÉCNICOS COMUNS

### Erro: "pnpm: command not found"

**Causa:** pnpm não instalado globalmente

**Solução:**
```bash
npm install -g pnpm

# Verificar
pnpm --version
```

---

### Erro: "Module not found: recharts"

**Causa:** Dependência não instalada

**Solução:**
```bash
# Na pasta do projeto
pnpm add recharts

# Verificar
pnpm list recharts
```

---

### Erro: "Cannot read properties of undefined (reading 'map')"

**Causa:** Dados da API são undefined/null

**Solução 1: Defensive programming**
```typescript
// ❌ Ruim
metrics.sprints.map(...)

// ✅ Bom
metrics?.sprints?.map(...) || []

// ✅ Melhor
if (!metrics || !metrics.sprints) return <EmptyState />
return <Chart data={metrics.sprints} />
```

**Solução 2: Loading state**
```typescript
if (isLoading) return <Skeleton />
if (error) return <ErrorMessage error={error} />
if (!data) return <EmptyState />
return <Chart data={data} />
```

---

### Erro: "RLS policy violation" ou "permission denied for table"

**Causa:** Row Level Security bloqueando query

**Debug:**
```sql
-- Ver políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'sprint_velocity';

-- Ver tenant_id da sessão
SELECT current_setting('app.current_tenant_id', true);
```

**Solução:**
```sql
-- Garantir que RLS permite SELECT
CREATE POLICY "Users can view own tenant velocity" ON sprint_velocity
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
```

---

### Erro: "Hydration failed" ou "Text content does not match"

**Causa:** Server-side rendering diverge de client-side

**Solução:**
```typescript
// ❌ Ruim - usa Date.now() que muda entre server e client
<span>{Date.now()}</span>

// ✅ Bom - marca como client-only
'use client'

// ✅ Melhor - useEffect para conteúdo dinâmico
const [timestamp, setTimestamp] = useState('')
useEffect(() => {
  setTimestamp(new Date().toISOString())
}, [])
```

---

## 🗄️ ERROS DE MIGRATION

### Erro: "relation 'sprint_velocity' already exists"

**Causa:** Migration já rodou antes

**Solução 1: Drop e recriar (DEV ONLY)**
```sql
DROP MATERIALIZED VIEW IF EXISTS sprint_velocity CASCADE;
-- Rodar migration novamente
```

**Solução 2: Skip migration (PROD)**
```sql
-- Já existe, pular esta parte
-- Continuar resto da migration
```

---

### Erro: "column 'is_mvp' already exists"

**Causa:** Coluna já adicionada

**Solução:**
```sql
-- Usar ALTER ... IF NOT EXISTS (Postgres 9.6+)
ALTER TABLE features ADD COLUMN IF NOT EXISTS is_mvp BOOLEAN DEFAULT FALSE;
```

---

### Erro: "function refresh_sprint_velocity() does not exist"

**Causa:** Função não criada ou schema errado

**Debug:**
```sql
-- Listar funções
SELECT proname FROM pg_proc WHERE proname LIKE '%velocity%';
```

**Solução:**
```sql
-- Recriar função com OR REPLACE
CREATE OR REPLACE FUNCTION refresh_sprint_velocity()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY sprint_velocity;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

---

### Erro: "CONCURRENTLY cannot be used without unique index"

**Causa:** Materialized view precisa de unique index para refresh concurrente

**Solução:**
```sql
-- Criar índice único ANTES de refresh concurrente
CREATE UNIQUE INDEX idx_sprint_velocity_pk ON sprint_velocity(sprint_id);

-- Agora pode usar CONCURRENTLY
REFRESH MATERIALIZED VIEW CONCURRENTLY sprint_velocity;
```

---

## 🌐 PROBLEMAS DE API

### Erro: "projectId is required"

**Causa:** Query param faltando

**Solução:**
```typescript
// ❌ Ruim
fetch('/api/metrics/velocity')

// ✅ Bom
fetch(`/api/metrics/velocity?projectId=${projectId}`)

// ✅ Melhor - validar antes
if (!projectId) {
  throw new Error('projectId is required')
}
fetch(`/api/metrics/velocity?projectId=${projectId}`)
```

---

### Erro: "Failed to fetch" ou "Network error"

**Causa:** API route não existe ou erro 500

**Debug:**
1. Abrir DevTools → Network
2. Verificar status code (404 = rota errada, 500 = erro servidor)
3. Ver response body (mensagem de erro)

**Soluções comuns:**

**404 - Rota não existe:**
```bash
# Verificar estrutura de pastas
src/app/api/metrics/velocity/route.ts
# ✅ Correto

src/app/api/metrics-velocity/route.ts
# ❌ Errado - deveria ser /metrics/velocity/
```

**500 - Erro no servidor:**
```typescript
// Ver logs do servidor (terminal onde rodou pnpm dev)
// Adicionar try/catch
export async function GET(request: Request) {
  try {
    // ... código
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
```

---

### Erro: "CORS policy" ao chamar API

**Causa:** Chamando API de domínio diferente (não deveria acontecer em Next.js)

**Solução:**
```typescript
// ❌ Ruim - URL absoluta
fetch('https://outro-dominio.com/api/...')

// ✅ Bom - URL relativa (mesmo domínio)
fetch('/api/metrics/velocity')
```

---

## 🎨 PROBLEMAS DE UI/UX

### Gráfico não aparece (espaço em branco)

**Causa:** Recharts precisa de altura explícita

**Solução:**
```typescript
// ❌ Ruim - sem altura
<ResponsiveContainer width="100%">
  <LineChart data={data}>...</LineChart>
</ResponsiveContainer>

// ✅ Bom - com altura
<ResponsiveContainer width="100%" height={400}>
  <LineChart data={data}>...</LineChart>
</ResponsiveContainer>
```

---

### Gráfico corta labels do eixo X

**Causa:** Labels longas sem rotação

**Solução:**
```typescript
<XAxis
  dataKey="sprint_name"
  angle={-45}           // ← Adicionar rotação
  textAnchor="end"      // ← Ajustar alinhamento
  height={80}           // ← Aumentar altura do eixo
/>
```

---

### Cores não aparecem (gráfico todo cinza)

**Causa:** Stroke/fill não definidos

**Solução:**
```typescript
// ❌ Ruim
<Line dataKey="velocity" />

// ✅ Bom
<Line
  dataKey="velocity"
  stroke="#3b82f6"      // ← Azul
  strokeWidth={2}
/>
```

---

### Loading infinito (spinner nunca para)

**Causa:** Query nunca resolve ou `enabled: false`

**Debug:**
```typescript
const { data, isLoading, error } = useVelocity(projectId)

console.log('Debug:', { data, isLoading, error })
// Ver o que está undefined
```

**Soluções comuns:**

**projectId vazio:**
```typescript
// ❌ Ruim
const projectId = undefined
useVelocity(projectId) // query não roda

// ✅ Bom
const projectId = 'uuid-valido'
useVelocity(projectId)

// ✅ Melhor - validar
if (!projectId) return <ErrorMessage />
```

**API retorna erro:**
```typescript
if (error) {
  console.error('Query error:', error)
  return <ErrorDisplay error={error} />
}
```

---

## 📚 CONCEITOS SCRUM

### P: Velocity vs Story Points - qual a diferença?

**R:**

**Story Points:**
- Medida **relativa** de esforço
- Usa Fibonacci (1, 2, 3, 5, 8, 13, 21)
- Estimado **antes** do sprint (Planning Poker)
- Exemplo: Feature A = 5 pontos, Feature B = 8 pontos

**Velocity:**
- Story Points **entregues** ("Done") por Sprint
- Medida **observada** (não estimada)
- Calculado **após** o sprint (Review)
- Exemplo: Sprint 1 entregou 18 pontos = velocity 18

**Relação:**
```
Prazo = Total Story Points / Velocity Média
```

---

### P: BV/W - como calcular na prática?

**R:**

**BV (Business Value):**
- Votação de 1-21 (Planning Poker)
- PO + Stakeholders votam
- Quanto maior, mais valor pro negócio

**W (Work Effort):**
- Votação de 1-21 (Planning Poker)
- Time técnico vota
- Quanto maior, mais trabalhoso

**BV/W Ratio:**
```
BV/W = Business Value / Work Effort

Exemplo:
Feature A: BV=21, W=5 → ratio=4.2 (ALTA prioridade)
Feature B: BV=8, W=13 → ratio=0.6 (BAIXA prioridade)
```

**Ordenação:**
```sql
SELECT * FROM features
ORDER BY (business_value::float / NULLIF(work_effort, 0)) DESC;
```

---

### P: Burndown vs Velocity - são a mesma coisa?

**R:** NÃO.

**Burndown:**
- Gráfico de **trabalho restante** ao longo do tempo
- **Durante** o sprint (dia a dia)
- Mostra se vai terminar no prazo
- Unidade: Story Points **restantes**

**Velocity:**
- Gráfico de **trabalho entregue** por sprint
- **Após** cada sprint
- Mostra capacidade do time
- Unidade: Story Points **done** por sprint

**Exemplo:**
```
Sprint de 20 pontos:

Burndown (diário):
Dia 1: 20 pontos restantes
Dia 5: 12 pontos restantes
Dia 10: 0 pontos restantes ← terminou

Velocity (após sprint):
Sprint 1: 18 pontos done
Sprint 2: 20 pontos done
Sprint 3: 22 pontos done
Média: 20 pontos/sprint ← capacidade
```

---

### P: O que é "Smell" do Scrum?

**R:** Sinal observável de deterioração do processo.

**Exemplos (Cap. 7 dos Guias):**

| Smell | Sintoma | Consequência |
|-------|---------|-------------|
| **Sprint variável** | Muda de 1sem → 2sem → 1sem | Velocity inútil (base muda) |
| **Carry-over alto** | > 30% features arrastadas | Planejamento ruim |
| **WIP alto** | > 3 tarefas/pessoa em progresso | Nada fecha |
| **Done falso** | "Pronto" mas sem teste | Retrabalho estoura depois |

**Como detectar:** Scrum Health Dashboard (US-3.4)

---

## ⚡ PERFORMANCE

### P: Materialized View demora pra atualizar

**R:** Por design. Refresh é assíncrono.

**Opções:**

**1. Refresh manual (imediato):**
```sql
REFRESH MATERIALIZED VIEW sprint_velocity;
```

**2. Refresh concorrente (não bloqueia leituras):**
```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY sprint_velocity;
```

**3. Refresh automático via trigger (já implementado):**
```sql
-- Trigger já criado na migration 008
-- Refresh quando features mudam
```

**Trade-off:**
- Refresh frequente = dados sempre atualizados, mas mais carga no DB
- Refresh esporádico = menos carga, mas dados levemente desatualizados

**Recomendação:** Refresh automático via trigger (já tem) + cache de 5min no frontend (React Query)

---

### P: Gráfico demora pra carregar (> 3 segundos)

**Causas e soluções:**

**1. Query pesada:**
```sql
-- Ver explain plan
EXPLAIN ANALYZE SELECT * FROM sprint_velocity;

-- Adicionar índice se necessário
CREATE INDEX IF NOT EXISTS idx_velocity_project_date
ON sprint_velocity(project_id, start_date DESC);
```

**2. Muitos dados:**
```typescript
// Limitar quantidade
const { data } = useVelocity(projectId, 6) // ← últimos 6 sprints only
```

**3. Re-renders desnecessários:**
```typescript
// ❌ Ruim - recalcula toda hora
const chartData = metrics.sprints.map(...)

// ✅ Bom - só recalcula se metrics mudar
const chartData = useMemo(
  () => metrics.sprints.map(...),
  [metrics.sprints]
)
```

---

### P: Página /metrics trava o navegador

**Causa:** Renderizando gráficos pesados demais

**Soluções:**

**1. Lazy loading:**
```typescript
const VelocityChart = lazy(() => import('@/components/metrics/velocity-chart'))

<Suspense fallback={<Skeleton />}>
  <VelocityChart projectId={projectId} />
</Suspense>
```

**2. Virtualização (se lista muito grande):**
```bash
pnpm add react-window
```

**3. Pagination:**
```typescript
// Carregar 6 sprints por vez, paginado
const [page, setPage] = useState(1)
const { data } = useVelocity(projectId, { limit: 6, offset: (page-1)*6 })
```

---

## 🆘 AINDA NÃO RESOLVEU?

### Checklist de debug geral:

1. **Ver console do browser (F12)**
   - Erros JavaScript?
   - Network requests falhando?

2. **Ver terminal do servidor (pnpm dev)**
   - Erros de API?
   - SQL errors?

3. **Ver Supabase logs**
   - Dashboard → Logs
   - Erros de RLS?
   - Queries lentas?

4. **Verificar dados**
   ```sql
   -- Tem sprints?
   SELECT COUNT(*) FROM sprints;

   -- Tem features?
   SELECT COUNT(*) FROM features;

   -- Tem dados na materialized view?
   SELECT COUNT(*) FROM sprint_velocity;
   ```

5. **Testar API isoladamente**
   ```bash
   # Usar curl ou Postman
   curl http://localhost:3000/api/metrics/velocity?projectId=uuid
   ```

### Onde pedir ajuda:

1. **Documentação oficial:**
   - Next.js: https://nextjs.org/docs
   - Recharts: https://recharts.org
   - Supabase: https://supabase.com/docs

2. **GitHub Issues:**
   - Criar issue no repo do projeto
   - Incluir: erro completo, código relevante, steps to reproduce

3. **Claude Code (este assistente):**
   - Descrever problema detalhadamente
   - Incluir mensagens de erro completas
   - Mostrar código relevante

---

## 📝 TEMPLATE DE ISSUE

Se for criar issue no GitHub:

```markdown
## Descrição do Problema
[Descreva o que está acontecendo]

## Comportamento Esperado
[O que deveria acontecer]

## Comportamento Atual
[O que está acontecendo]

## Passos para Reproduzir
1. [Passo 1]
2. [Passo 2]
3. [Ver erro]

## Mensagem de Erro
```
[Cole erro completo aqui]
```

## Ambiente
- OS: [Windows/Mac/Linux]
- Node: [versão]
- pnpm: [versão]
- Branch: [nome da branch]

## Código Relevante
```typescript
[Cole código onde erro acontece]
```

## Screenshots
[Se aplicável]

## Tentativas de Solução
- [ ] Já tentei X
- [ ] Já tentei Y
```

---

**Última Atualização:** 2026-02-07
**Próxima Revisão:** Após Sprint 3 (quando surgirem novos FAQs)
