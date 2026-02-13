# QA Checklist Progressivo - Migration 015

## Objetivo
Validar de forma progressiva que:
- isolamento multi-tenant está correto;
- permissões por papel estão corretas;
- validações de payload e fluxos críticos continuam funcionando.

## Como usar
- Marque cada item com `[x]` ao concluir.
- Em cada item, preencha evidência mínima: data/hora + usuário + resultado.
- Se um item falhar, registre bloqueio e pare a fase atual.

## Papéis
- `Humano`: execução em ambiente, testes manuais, decisão go/no-go.
- `Agente`: preparação técnica, queries/checklists, consolidação de relatório.

---

## Fase 0 - Preparação
- [ X] Ambiente de teste/staging definido e separado de produção.  
Responsável: `Humano`
- [ X] Migration `015_harden_permissions_and_tenant_context.sql` aplicada com sucesso.  
Responsável: `Humano`
- [ ] `pnpm test` passando.  
Responsável: `Humano`
- [X ] `pnpm lint` passando.  
Responsável: `Humano`
- [X ] Commit/hash da versão testada registrado.  
Responsável: `Humano`

## Fase 1 - Smoke funcional
- [X ] Login com usuário ativo redireciona para `/projects` (não `/dashboard` sem projectId).  
Responsável: `Humano`
- [ X] Seleção de projeto abre `/projects/{projectId}/dashboard`.  
Responsável: `Humano`
- [ X] CRUD básico de feature funciona.  
Responsável: `Humano`
- [X ] CRUD básico de sprint funciona.  
Responsável: `Humano`
- [ X] CRUD básico de risco funciona.  
Responsável: `Humano`
- [ x] Daily log criar/consultar funciona.  
Responsável: `Humano`

## Fase 2 - Segurança multi-tenant
- [x ] Usuário tenant A não consegue ver dados tenant B.  
Responsável: `Humano`
- [ x] Usuário tenant B não consegue ver dados tenant A.  
Responsável: `Humano`
- [x ] Acesso por ID cruzado retorna bloqueio (403/404).  
Responsável: `Humano`
- [x ] Rotas de overview/metrics não vazam dados entre tenants.  
Responsável: `Humano`

## Fase 3 - Contexto de tenant
- [ ] Usuário com múltiplas memberships sem contexto recebe `409 TENANT_CONTEXT_REQUIRED`.  
Responsável: `Humano`
- [ ] Com `x-tenant-id` válido, requisição funciona.  
Responsável: `Humano`
- [ ] Com `x-tenant-id` inválido, retorna `403`.  
Responsável: `Humano`
- [ ] Com cookie `active_tenant_id` válido, funciona.  
Responsável: `Humano`

## Fase 4 - Permissões por papel
- [ ] `admin` consegue ações administrativas em `team-members`.  
Responsável: `Humano`
- [ ] `member` não-admin é bloqueado em ações administrativas.  
Responsável: `Humano`
- [ ] Usuário sem membership ativa é bloqueado em rotas protegidas.  
Responsável: `Humano`

## Fase 5 - Validação de payload
- [ ] Payload inválido em `features` retorna `400` com `details`.  
Responsável: `Humano`
- [ ] Payload inválido em `sprints` retorna `400` com `details`.  
Responsável: `Humano`
- [ ] Payload inválido em `risks` retorna `400` com `details`.  
Responsável: `Humano`
- [ ] Payload inválido em `retrospectives` retorna `400` com `details`.  
Responsável: `Humano`
- [ ] Payload inválido em `planning-poker` retorna `400` com `details`.  
Responsável: `Humano`

## Fase 6 - Auditoria SQL/RLS
- [ ] Policy antiga permissiva de `company_members` removida.  
Responsável: `Humano`
- [ ] Policy `Admins can insert memberships in own tenant` ativa.  
Responsável: `Humano`
- [ ] Grants em tabelas críticas conferidos após `015`.  
Responsável: `Humano`
- [ ] Se tabelas `ai_*` existirem, policies `tenant_isolation_ai_*` conferidas.  
Responsável: `Humano`

## Fase 7 - Go / No-Go
- [ ] Nenhuma falha crítica de segurança aberta.  
Responsável: `Humano`
- [ ] Nenhuma falha bloqueante de negócio aberta.  
Responsável: `Humano`
- [ ] Decisão final registrada (`GO`/`NO-GO`) com evidências.  
Responsável: `Humano`
- [x] Relatório consolidado em documentação final do projeto.  
Responsável: `Agente`

---

## Evidências (preencher durante execução)
- Data/Hora:
- Ambiente:
- Usuário:
- Endpoint/Tela:
- Resultado esperado:
- Resultado obtido:
- Status:
- Observações:

