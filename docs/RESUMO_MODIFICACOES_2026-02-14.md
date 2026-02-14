# RESUMO DE MODIFICACOES - 2026-02-14

## Contexto do dia
Evolucao forte no dashboard e padronizacao de UI/UX do CRM, com foco em visao executiva enterprise, feed de atividade unificado, qualidade visual e preparacao para deploy.

## Entregas principais

### 1) Dashboard Enterprise (frontend + backend)
- Substituicao do dashboard antigo por uma estrutura enterprise.
- Nova faixa de KPIs (sticky), 3 colunas de leitura executiva e feed de atividade.
- Dados agregados em endpoint BFF dedicado para reduzir fragmentacao de chamadas.

### 2) Novos endpoints API
- `GET /api/projects/[id]/dashboard`
  - Agregacao de KPIs de desenvolvimento, marketing e CRM.
- `GET /api/projects/[id]/activity-feed`
  - Feed cronologico unificado com eventos de multiplos modulos.

### 3) Nova camada de dados no frontend
- Hook dedicado para dashboard enterprise com refresh automatico:
  - `staleTime: 30s`
  - `refetchInterval: 60s`

### 4) Padronizacao visual CRM Dashboard
- KPI strip do CRM alinhado ao mesmo padrao visual do dashboard enterprise.
- Estrutura com `Card/CardHeader/CardContent` para consistencia.
- Acoes "Ver tudo" e melhor hierarquia tipografica/espacamento.

### 5) UX e navegacao
- Scrollbar visivel e estavel na sidebar para navegacao em telas menores.
- Melhor leitura do feed com ponto de cor por modulo.

### 6) Next.js 16 - migracao middleware -> proxy
- Remocao de warning deprecado.
- Logica de auth/redirect mantida, agora no arquivo `proxy.ts`.

### 7) Validacao tecnica
- Build de producao executado com sucesso apos as alteracoes:
  - `pnpm run build` -> OK

---

## Arquivos criados (novos)
- `src/app/api/projects/[id]/dashboard/route.ts`
- `src/app/api/projects/[id]/activity-feed/route.ts`
- `src/hooks/useDashboard.ts`
- `src/components/dashboard/enterprise-dashboard.tsx`
- `src/components/dashboard/kpi-card.tsx`
- `src/components/dashboard/activity-feed.tsx`
- `src/proxy.ts`

## Arquivos alterados
- `src/components/dashboard/dashboard-content.tsx`
- `src/components/clients/crm-dashboard-content.tsx`
- `src/components/clients/crm-kpi-strip.tsx`
- `src/app/projects/[projectId]/crm-dashboard/page.tsx`
- `src/components/shared/sidebar.tsx`
- `src/app/globals.css`

## Arquivo removido
- `src/middleware.ts`

---

## Observacoes
- O documento registra o estado atual do workspace no dia 14/02/2026.
- Caso deseje, o proximo passo natural e transformar este resumo em changelog oficial com seccoes de "Impacto", "Risco" e "Rollback" para release.
