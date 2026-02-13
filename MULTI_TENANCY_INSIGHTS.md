# INSIGHTS — Multi-Tenancy UzzOPS
### Reunião com Luis | 11/02/2026

> Este documento captura os insights técnicos críticos do Luis sobre arquitetura multi-tenant,
> faz um diagnóstico honesto do estado atual do UzzOPS, e define o roadmap das mudanças necessárias
> para transformá-lo num SaaS seguro e escalável.

---

## 1. INSIGHTS DO LUIS — O QUE FOI DITO

### A Hierarquia Correta para um SaaS Multi-Tenant

Luis definiu a estrutura que qualquer produto SaaS deve ter:

```
Nível 1: auth.users  (Supabase — NUNCA criar tabelas aqui)
    └── user_id: UUID único por pessoa

Nível 2: public.tenants / companies
    └── tenant_id: UUID único por empresa/cliente

Nível 3: public.company_members  (TABELA M2M — a chave de tudo)
    ├── user_id → auth.users
    ├── tenant_id → tenants
    └── role: 'admin' | 'member' | 'viewer'

Nível 4: Recursos do negócio (projects, features, sprints, risks...)
    └── SEMPRE com tenant_id como FK obrigatória
```

**Luis:** *"Se der um bug de autenticação, tu tem que saber onde achar as políticas RLS. Tu não vai saber de cabeça, mas tem que saber aonde achar."*

---

### RLS — Como Deve Funcionar de Verdade

O padrão correto de Row Level Security num sistema multi-tenant:

```sql
-- Usuário vê APENAS dados da empresa à qual pertence
CREATE POLICY "users_see_own_company_data"
ON public.projects
FOR SELECT
USING (
  tenant_id IN (
    SELECT tenant_id
    FROM public.company_members
    WHERE user_id = auth.uid()
  )
);
```

**Por quê isso importa:**
- Se um bug expõe dados, o banco garante isolamento — o código não precisa
- Agentes SQL nunca podem consultar dados de outra empresa (*"isso é extremamente proibido"* — Luis)
- Um usuário pode ser **admin** na Empresa A e **membro** na Empresa B simultaneamente

---

### Schemas do Supabase — Distinção Fundamental

| Schema | Propósito | Criar tabelas? |
|--------|-----------|----------------|
| `auth` | Usuários, sessões, tokens — gerenciado pelo Supabase | ❌ Nunca |
| `public` | Tabelas do negócio — owners do projeto | ✅ Sempre aqui |

**Luis:** *"Nesse esquema [auth], a gente não cria tabela. A gente cria tabela no public."*

---

### Outras Boas Práticas Mencionadas

1. **Menos tabelas é melhor** — Luis observou que `planning_poker_sessions`, `planning_poker_results` e `planning_poker_votes` poderiam ser pensadas de forma mais compacta. Normalizar não significa criar uma tabela pra tudo.

2. **Migrações são ouro** — Luis elogiou explicitamente ter todas as migrações salvas: *"Isso que tu fez já é ótimo. Isso já é ótimo."*

3. **Pensar no banco ao criar campos** — Toda vez que um campo aparece no front-end, perguntar: *"Em qual tabela isso é armazenado? Qual o tipo? Tem FK?"*

4. **Sessões de auditoria** — `auth.sessions` guarda IP, timestamp, device. Útil para saber quem acessou quando.

5. **Primeiro Sprint de qualquer SaaS:** Auth + Multi-tenant + RLS — antes de qualquer feature visual.

---

### A Regra de Ouro

> **"Muito difícil mudar depois — fazer correto agora é imperativo."**
>
> Adicionar multi-tenancy depois de ter dados e código em produção cria débito técnico massivo.
> O custo de fazer certo agora é 10% do custo de refatorar depois.

---

## 2. DIAGNÓSTICO DO UZZOPS — ESTADO ATUAL

> Análise feita diretamente no código em 11/02/2026. Achados concretos, não suposições.

### O Que Está Correto ✅

- Tabela `tenants` existe — boa fundação
- `tenant_id` está presente como FK em projetos, features, sprints, risks, team_members
- Sistema de aprovação via `team_members.status` (pending → active) está funcionando
- Migrações documentadas e versionadas (M001 → M012)
- Auth via Supabase SSR implementado corretamente

### O Que Está Errado ❌

#### Problema 1 — RLS é Decoração (Crítico)

**Todas** as tabelas do sistema usam este padrão:

```sql
-- ATUAL (inseguro para multi-tenant):
CREATE POLICY "..." ON features
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

Isso significa: **qualquer usuário autenticado vê e edita TUDO**. A RLS está habilitada formalmente, mas não isola nada. Se amanhã houver 2 empresas no sistema, empresa A lê os dados da empresa B.

#### Problema 2 — tenant_id Vem do Front-End (Crítico)

Em `src/app/api/risks/route.ts`:

```typescript
// ATUAL (vulnerabilidade):
const { data: risk } = await supabase.from('risks').insert({
  tenant_id: body.tenant_id,  // ← aceita do request body
  project_id: body.project_id,
  // ...
});
```

Um usuário mal-intencionado pode enviar o `tenant_id` de outra empresa e inserir dados nela. O `tenant_id` deve **sempre** ser derivado da sessão autenticada, nunca do cliente.

#### Problema 3 — Sem Tabela M2M de Membros (Arquitetural)

Hoje: `team_members` tem um `tenant_id` direto.

```
team_members
  ├── id
  ├── tenant_id  ← vinculado a 1 empresa para sempre
  ├── user_id    ← vinculado a 1 usuário para sempre
  └── permission_level  ← admin/member GLOBALMENTE
```

**Problema:** Um usuário não pode pertencer a múltiplas empresas. Um admin é admin de tudo, não apenas de um projeto/empresa. Impossível escalar para SaaS real.

#### Problema 4 — RLS Quebrada na Tabela `risks` (Migration 007)

```sql
-- Em 007_add_risks.sql — NUNCA FUNCIONOU:
CREATE POLICY "Users can view risks from their tenant"
  ON risks FOR SELECT TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    --                          ↑ essa tabela NÃO EXISTE no projeto
  ));
```

A tabela `profiles` nunca foi criada. Essa policy foi corrigida pela migration 010 (mudou para `USING (true)`), mas a migration 010 apenas trocou uma política errada por outra que não isola nada.

#### Problema 5 — permission_level Não É Checado nas APIs (Médio)

A coluna `permission_level` ('admin' | 'member') existe em `team_members`, mas **nenhuma API route verifica isso**. Qualquer membro autenticado pode:
- Deletar features
- Alterar status de sprints
- Modificar riscos
- Desativar outros membros

Não há controle de permissão por operação.

#### Problema 6 — Middleware Não Verifica Tenant (Médio)

`src/middleware.ts` verifica se o usuário está `pending` ou `active`, mas não verifica a qual tenant ele pertence. Num cenário multi-cliente, o middleware precisaria garantir que o usuário está operando dentro do seu contexto de empresa correto.

---

## 3. TABELA DE DIAGNÓSTICO

| Aspecto | Estado Atual | Estado Necessário para SaaS | Prioridade |
|---------|-------------|----------------------------|------------|
| RLS policies | `USING (true)` — sem isolamento | `USING (tenant_id IN (SELECT FROM company_members WHERE user_id = auth.uid()))` | 🔴 P0 |
| tenant_id em request body | Aceito do cliente | Derivado sempre da sessão | 🔴 P0 |
| M2M user ↔ company | Não existe (direto em team_members) | Tabela `company_members` com role por empresa | 🔴 P1 |
| Separação perfil/vínculo | Confundidos em team_members | `profiles` (1 por usuário) + `company_members` (M2M) | 🟡 P1 |
| Permission checks nas APIs | Não existe | Verificar admin/member antes de mutations críticas | 🟡 P1 |
| Múltiplas empresas por usuário | Impossível | Via `company_members` M2M | 🔴 P1 |
| Roles por empresa | Global (admin = admin de tudo) | Por empresa: admin na A, member na B | 🟡 P1 |
| Migration 007 RLS | Referencia `profiles` inexistente | Corrigir para usar `company_members` | 🔴 P0 |
| Middleware tenant context | Só verifica status | Verificar tenant context do usuário | 🟡 P2 |

---

## 4. ARQUITETURA ALVO — O QUE DEVE SER CONSTRUÍDO

### Novas Tabelas Necessárias

```sql
-- profiles: dados pessoais do usuário (1 por pessoa)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- company_members: relacionamento M2M user ↔ empresa (a chave de tudo)
CREATE TABLE public.company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive')),
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tenant_id)  -- um usuário tem 1 role por empresa
);
```

### RLS Correta para Recursos do Negócio

```sql
-- Função helper para pegar o tenant_id do usuário autenticado
-- (assume empresa atual via contexto da sessão — ver nota abaixo)
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id
  FROM company_members
  WHERE user_id = auth.uid()
    AND status = 'active'
  LIMIT 1;  -- Para múltiplos tenants, precisaria de seleção de contexto
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Padrão de RLS para TODAS as tabelas de recursos:
CREATE POLICY "tenant_isolation" ON features
  FOR ALL TO authenticated
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());
```

### API Routes — Como Derivar tenant_id Corretamente

```typescript
// PADRÃO CORRETO — nunca aceitar tenant_id do body
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Buscar tenant_id da sessão, nunca do body
  const { data: membership } = await supabase
    .from('company_members')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (!membership) return NextResponse.json({ error: 'No company membership' }, { status: 403 });

  const body = await req.json();

  // Inserir sempre com tenant_id da sessão
  await supabase.from('risks').insert({
    tenant_id: membership.tenant_id,  // ← SEMPRE da sessão
    // ... resto dos campos do body
  });
}
```

### Verificação de Permissão nas APIs

```typescript
// Operações destrutivas devem verificar role
if (membership.role !== 'admin') {
  return NextResponse.json({ error: 'Admin required' }, { status: 403 });
}
```

---

## 5. ROADMAP DE IMPLEMENTAÇÃO

### 🔴 P0 — Antes de qualquer novo cliente (Crítico)

1. **Criar tabela `profiles`** — perfil pessoal de cada usuário (1:1 com auth.users)
2. **Criar tabela `company_members`** — M2M user ↔ tenant com role por empresa
3. **Migrar dados de `team_members`** — copiar vínculos existentes para `company_members`
4. **Reescrever TODAS as RLS policies** — substituir `USING (true)` por verificação real de membership
5. **Remover `tenant_id` de todos os request bodies** — derivar da sessão nos routes

### 🟡 P1 — Antes do lançamento para novos clientes

6. **Atualizar middleware** — verificar contexto de tenant (para quando um usuário tiver múltiplas empresas)
7. **Adicionar permission checks nas API routes** — admin para: deletar features, alterar sprint status, desativar membros, modificar DoD
8. **Refatorar `team_members`** — decidir se vira apenas tabela de perfil de equipe (sem auth) ou se consolida com `profiles`
9. **Trigger de signup atualizado** — `handle_new_auth_user()` deve criar em `profiles` + `company_members`, não em `team_members`

### 🟢 P2 — Melhoria contínua

10. **Seleção de empresa no login** — quando um usuário pertencer a múltiplas empresas, oferecer seleção de contexto
11. **Audit log por tenant** — quem fez o quê, quando, em qual empresa
12. **Rate limiting por tenant** — prevenir abuso em ambiente SaaS

---

## 6. IMPACTO NO CÓDIGO EXISTENTE

> Estas mudanças afetam arquivos críticos. Mapear antes de implementar.

| Arquivo | Impacto | Mudança Necessária |
|---------|---------|-------------------|
| `src/middleware.ts` | Alto | Verificar `company_members` além de `team_members.status` |
| `src/app/api/risks/route.ts` | Crítico | Remover `tenant_id` do body — derivar da sessão |
| Todos `src/app/api/**/*.ts` | Alto | Padronizar resolveTenant() helper |
| `src/app/(auth)/register/page.tsx` | Médio | Criar em `profiles` + `company_members` |
| `src/hooks/useTeam.ts` | Médio | Adaptar para `company_members` |
| `database/migrations/` | Crítico | Nova migration (013_proper_multi_tenant.sql) |
| `src/types/index.ts` | Médio | Adicionar `Profile`, `CompanyMember` types |
| `src/types/database.ts` | Alto | Adicionar profiles, company_members às tabelas tipadas |

---

## 7. APRENDIZADOS PARA PRÓXIMOS PROJETOS SAAS

Baseados na conversa com Luis:

```
Sprint 1 de qualquer SaaS novo:
  ✅ auth.users (Supabase cuida)
  ✅ profiles (1:1 com auth.users)
  ✅ tenants/companies
  ✅ company_members (M2M com role)
  ✅ RLS em TODAS as tabelas usando company_members
  ❌ Nenhuma feature de negócio antes disso estar pronto
```

**A regra do Luis:**
> O custo de mudar a estrutura multi-tenant depois de ter dados reais em produção é
> proporcional ao número de linhas nas tabelas multiplicado pelo número de tabelas.
> Fazer certo agora custa 1 sprint. Refatorar depois custa vários meses.

---

*Documento criado com base na reunião de 11/02/2026 e análise direta do código do UzzOPS.*
*Para referência do esquema de banco atual, ver: DATABASE_SCHEMA.md*
*Para mapa de arquivos do projeto, ver: CODEBASE_MAP.md*
