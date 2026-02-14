# Deploy Runbook - Vercel (UzzOPS)

## 1) Pre-flight local
```bash
pnpm install
pnpm lint
pnpm build
```

## 2) Supabase Auth URLs
No Supabase Dashboard -> Authentication -> URL Configuration:
- `Site URL`: `https://SEU_PROJETO.vercel.app`
- `Redirect URLs`:
  - `https://SEU_PROJETO.vercel.app/**`
  - `https://SEU_PROJETO.vercel.app/login`

## 3) Environment variables (Vercel)
Configurar em Project -> Settings -> Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (secret)
- `SUPABASE_SECRET_TOKEN` (secret)
- `NEXT_PUBLIC_APP_URL` = URL do deploy (`https://...vercel.app`)

Use `.env.example` como referencia.

## 4) Deploy
1. Importar repo em `vercel.com/new`
2. Framework detectado: `Next.js`
3. Confirmar:
   - Install: `pnpm install`
   - Build: `pnpm build`
4. Deploy

## 5) Pos-deploy checklist
- Login funciona
- Dashboard carrega dados
- Pagina de clientes/CRM abre
- MD Feeder importa arquivo
- Exportacoes funcionam
- Feedback nativo envia e aparece em `/projects/[id]/feedback`

## 6) Arquivos de suporte criados no repo
- `vercel.json`: maxDuration para rotas pesadas
- `.env.example`: template de variaveis

