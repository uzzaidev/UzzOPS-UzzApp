# Plano de Deploy — UzzOPS na Vercel

> **Status do projeto:** ✅ Pronto para deploy — nenhuma alteração de código necessária.
> Todas as 71 rotas de API são serverless-compatíveis. Zero uso de `fs`, `path` ou `child_process`.

---

## Diagnóstico técnico

| Item | Status | Detalhe |
|---|---|---|
| Framework | ✅ | Next.js 16 — suportado nativamente na Vercel |
| Package manager | ✅ | pnpm — Vercel detecta automaticamente via `pnpm-lock.yaml` |
| Middleware | ✅ | Auth guard via `@supabase/ssr` — compatível com Edge Runtime |
| API Routes | ✅ | 71 rotas serverless — nenhuma usa APIs exclusivas do Node |
| Database | ✅ | Supabase externo — nenhum DB local |
| Exportações | ✅ | XLSX, ZIP, PDF — gerados em memória (sem `fs`) |
| Servidor customizado | ✅ | Não existe — usa defaults do Next.js |
| Build | ✅ | `next build` padrão — sem configuração especial |
| TypeScript strict | ✅ | `noEmit: true` — o build vai falhar se houver erros de tipo |

---

## Variáveis de ambiente obrigatórias

Estas são as variáveis que precisam ser cadastradas no painel da Vercel.
**Nunca commitar o `.env.local`** (já está no `.gitignore`).

| Variável | Escopo | Onde configurar |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Público (browser + server) | Vercel → Environment Variables |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Público (browser + server) | Vercel → Environment Variables |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secreto** (server only) | Vercel → Environment Variables (sensitive) |
| `SUPABASE_SECRET_TOKEN` | **Secreto** (server only) | Vercel → Environment Variables (sensitive) |
| `NEXT_PUBLIC_APP_URL` | Público | **⚠️ Deve ser atualizado** com a URL da Vercel |

> **Atenção:** `NEXT_PUBLIC_APP_URL` em `.env.local` está como `http://localhost:3000`.
> Na Vercel, precisa ser `https://seu-projeto.vercel.app` (ou domínio customizado).
> Sem isso, callbacks de autenticação e links internos vão quebrar em produção.

---

## Passos de deploy

### Passo 1 — Preparar o Supabase

Antes de fazer o deploy, o Supabase precisa aceitar requisições da URL da Vercel.

1. Acessar **Supabase Dashboard → Authentication → URL Configuration**
2. Adicionar em **Site URL:** `https://seu-projeto.vercel.app`
3. Adicionar em **Redirect URLs:**
   ```
   https://seu-projeto.vercel.app/**
   https://seu-projeto.vercel.app/login
   ```
4. Salvar.

> Se usar domínio customizado depois, repetir este passo com o domínio final.

---

### Passo 2 — Conectar o repositório à Vercel

1. Acessar [vercel.com/new](https://vercel.com/new)
2. Selecionar **Import Git Repository** e conectar ao GitHub/GitLab/Bitbucket
3. Selecionar o repositório `uzzops-uzzapp`
4. A Vercel vai detectar automaticamente:
   - **Framework Preset:** Next.js
   - **Build Command:** `pnpm build` (via `pnpm-lock.yaml`)
   - **Output Directory:** `.next`
   - **Install Command:** `pnpm install`
5. **Não alterar** nada nessa tela ainda — configurar env vars antes.

---

### Passo 3 — Configurar variáveis de ambiente

Ainda na tela de import (antes de clicar em Deploy):

1. Expandir **"Environment Variables"**
2. Adicionar cada variável listada na tabela acima
3. Para `SUPABASE_SERVICE_ROLE_KEY` e `SUPABASE_SECRET_TOKEN`, marcar como **Sensitive** (oculta no log)
4. Para `NEXT_PUBLIC_APP_URL`, usar **a URL que a Vercel vai gerar** — formato:
   ```
   https://[nome-do-projeto]-[hash].vercel.app
   ```
   > Dica: use `https://uzzops.vercel.app` se o nome do projeto estiver disponível.

---

### Passo 4 — Primeiro deploy

1. Clicar em **Deploy**
2. A Vercel vai rodar:
   ```
   pnpm install
   pnpm build  (= next build)
   ```
3. O build vai incluir verificação de tipos TypeScript (`tsc --noEmit`).
   Se houver erros de tipo, o build falha — isso é esperado e correto.

**Tempo estimado:** 3–5 minutos no primeiro deploy.

---

### Passo 5 — Verificar após deploy

Acessar a URL gerada e testar:

- [ ] Página de login carrega sem erro
- [ ] Login funciona (redirecionamento pós-auth)
- [ ] Dashboard com dados carregados via Supabase
- [ ] Navegação entre páginas (sidebar, links)
- [ ] Importação via MD-Feeder (upload de `.md`)
- [ ] Exportação Excel/ZIP (download funciona)

---

## Configuração opcional — `vercel.json`

O projeto funciona sem `vercel.json`. Mas se precisar ajustar timeouts para rotas pesadas
(exportação de Excel grande, import MD com muitos itens), criar o arquivo:

```json
{
  "functions": {
    "src/app/api/projects/[id]/export/route.ts": {
      "maxDuration": 30
    },
    "src/app/api/import/process/route.ts": {
      "maxDuration": 60
    }
  }
}
```

> **Plano gratuito (Hobby):** timeout máximo de 10s por função.
> **Plano Pro:** timeout máximo de 300s por função.
> Para exportações grandes ou imports densos, o plano Pro é recomendado.

---

## Ambientes: Preview vs Production

A Vercel cria **dois ambientes automaticamente**:

| Ambiente | Trigger | URL |
|---|---|---|
| **Production** | Push na branch `main`/`master` | `seu-projeto.vercel.app` |
| **Preview** | Push em qualquer outra branch ou PR | `seu-projeto-git-branch.vercel.app` |

**Recomendação para variáveis:**

No painel da Vercel em **Settings → Environment Variables**, cada variável pode ser
configurada por ambiente:

- `NEXT_PUBLIC_APP_URL` → **Production** = URL real; **Preview** = URL preview automática
- `SUPABASE_SERVICE_ROLE_KEY` → Pode usar o mesmo projeto Supabase ou um separado para staging
- Considerar usar um **projeto Supabase diferente para Preview** (opcional, mas seguro)

---

## CI/CD automático

Após conectar o repositório, cada push vai disparar um deploy automaticamente:

```
git push origin master  →  Deploy em Production (vercel.app)
git push origin feature/x  →  Deploy Preview (url única por branch)
```

Não é necessário nenhuma configuração adicional de CI/CD — a Vercel cuida disso.

---

## Domínio customizado (opcional)

Se quiser `uzzops.uzz.ai` ou similar:

1. Vercel → Project → **Settings → Domains**
2. Adicionar o domínio customizado
3. Copiar os registros DNS (CNAME ou A record) fornecidos pela Vercel
4. Configurar no provedor de DNS (Cloudflare, GoDaddy, etc.)
5. **Repetir o Passo 1** (Supabase URL Configuration) com o novo domínio

---

## Pontos de atenção pós-deploy

### Exportações de arquivo (XLSX/ZIP/PDF)

As rotas de exportação geram arquivos em memória — funcionam sem `fs`. Porém:

- **Limite de tamanho de resposta da Vercel:** 4.5 MB por resposta de API (plano Hobby)
- Se exportações de projetos grandes excederem isso, a solução é fazer upload do arquivo
  para o **Supabase Storage** e retornar uma URL assinada de download.
- Por ora, para o tamanho atual do projeto, não é um problema.

### Tempo de execução (Cold Start)

- Funções serverless têm "cold start" na primeira requisição após inatividade (~1–3s)
- Para dashboards e páginas críticas, considerar habilitar **Vercel Fluid Compute**
  (disponível no Pro) que mantém instâncias "warm"

### Middleware (Auth Guard)

O `middleware.ts` faz uma consulta ao Supabase (`company_members`) a cada requisição de página.
Isso funciona na Vercel, mas adiciona ~50–100ms de latência.

- Recomendação: garantir que o índice `idx_company_members_user_id` (ou similar)
  existe no Supabase para essa query ser O(log n).

---

## Resumo — ordem de execução

```
1. Supabase → adicionar URL da Vercel no Auth
2. Vercel → importar repositório
3. Vercel → configurar as 5 variáveis de ambiente
4. Vercel → deploy
5. Testar login, dashboard, import, export
6. (Opcional) Adicionar domínio customizado
7. (Opcional) Criar vercel.json com timeouts para rotas pesadas
```

**Estimativa total:** 15–30 minutos do zero ao online.

---

## Dependências que merecem atenção no bundle

| Biblioteca | Uso | Observação |
|---|---|---|
| `xlsx` | Export Excel | Pesada (~800KB). Usada apenas em API routes (server-side) → OK |
| `jspdf` + `html2canvas` | Export PDF | Client-side rendering. Pode aumentar bundle do browser |
| `recharts` | Gráficos BANT/FIT | Tree-shakeable, impacto baixo |
| `@xyflow/react` | Diagramas de fluxo | Pesado (~1MB). Lazy-load recomendado se não for usado em todas as páginas |
| `@dnd-kit/*` | Drag & drop Kanban | Leve, sem problema |

> Para analisar o bundle após o deploy: `pnpm build` gera `next build` com relatório de
> tamanho. A Vercel também mostra o bundle analysis no painel após o build.
