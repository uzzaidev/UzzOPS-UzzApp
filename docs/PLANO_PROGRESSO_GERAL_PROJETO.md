# Plano de Implementacao - Progresso Geral do Projeto (R1.1 Critico)

Versao: 1.1  
Data: 2026-02-13  
Status: Revisado criticamente (pronto para implementacao em fases)  
Contexto: UzzOPS / UzzApp (multi-tenant, Next.js + Supabase, hardening ate migration 017)

---

## 1) Diagnostico Critico

O plano original estava bom na direcao, mas tinha lacunas importantes:

1. Inconsistencia de schema:
- O campo correto e `features.work_item_type` (`feature` | `bug`), nao `type`.

2. Campos ja existentes:
- `sprints.started_at` e `sprints.completed_at` ja aparecem nas migrations antigas.
- Evitar duplicar alteracoes sem auditoria de schema atual.

3. Risco de score artificialmente alto:
- Regras como `schedule_pct = 100` quando sem sprints inflacionam o score.
- Falta separar "sem dados" de "bom desempenho".

4. Trigger incompleto:
- Recalcular so em `features.status` e `sprints.status` perde eventos de risco, DoD, due_date, dependencias.

5. Reopen rate sem fonte confiavel:
- `reopened_count` nao existe hoje de forma historica.
- Sem historico de transicao de status, taxa de reabertura pode ser errada.

6. Custo/performance:
- Snapshot a cada mudanca pode gerar write storm em projetos ativos.

7. Seguranca operacional:
- Endpoint de recalc precisa ser admin-only e auditavel.

---

## 2) Objetivo Correto

Definir progresso de forma confiavel e auditavel, em duas camadas:

1. Camada A (MVP confiavel):
- metricas factuais por dimensao, sem "peso magico" exagerado.

2. Camada B (score composto):
- score ponderado configuravel por tenant/projeto, com historico.

Regra: primeiro confiabilidade de dados, depois score.

---

## 3) Definicao de Progresso (R1.1)

Progresso geral = combinacao de 5 dimensoes:
- Entrega
- Qualidade
- Cronograma
- Risco
- Capacidade

Mas cada dimensao deve ter:
- formula explicita,
- cobertura de dados minima,
- estado `insufficient_data` quando faltarem entradas.

Nunca transformar falta de dado em 100%.

---

## 4) Modelo de Dados Recomendado

## 4.1 Nova tabela de snapshots

Criar `project_progress_snapshots` com:
- `tenant_id`, `project_id`, `snapshot_at`, `trigger_event`
- metricas brutas (contagens)
- metricas calculadas (pct)
- `progress_score` opcional
- `score_confidence` (0-100)
- `insufficient_data_flags` (jsonb)

Observacao:
- manter formulas principais em funcao SQL (nao depender excessivamente de colunas GENERATED para tudo).

## 4.2 Historico de mudancas de status (essencial)

Criar tabela `work_item_status_history`:
- `tenant_id`, `project_id`, `feature_id`, `from_status`, `to_status`, `changed_at`, `changed_by`

Sem isso:
- reopen rate,
- aging confiavel,
- lead/cycle time
ficam inconsistentes.

## 4.3 Configuracao de pesos

Criar `project_progress_settings` (tenant/project-scoped):
- pesos por dimensao
- thresholds de labels (`healthy`, `attention`, `critical`)
- versao de formula (`formula_version`)

---

## 5) Formulas (primeira versao recomendada)

## 5.1 Entrega

- `delivery_feature_pct = features_done / features_total`
- `delivery_bug_pct = bugs_resolved / bugs_total`
- `delivery_pct = weighted average` (ex.: 70% features, 30% bugs)

## 5.2 Qualidade

- `dod_avg_pct` em itens `done`
- `bug_reopen_rate` baseado em `work_item_status_history`
- `quality_pct` com penalidade por reopen alto

## 5.3 Cronograma

- usar apenas itens/sprints com baseline de prazo valida
- `on_time_pct` sobre sprints concluidos
- `overdue_open_items` como penalidade

## 5.4 Risco

- `risks_mitigated_pct`
- penalidade para `risks_critical_open`
- threshold de critico deve ser parametrico (nao hardcode >80 fixo para todos)

## 5.5 Capacidade

- `velocity_avg_last3` vs `velocity_target`
- `velocity_trend` por variacao relativa
- se nao houver sprints suficientes: marcar `insufficient_data`

---

## 6) Regras de Qualidade de Dado (obrigatorio)

1. Se denominador for zero:
- retornar `null` + flag `insufficient_data`, nao 100.

2. Score final so e calculado quando:
- pelo menos 3 dimensoes tiverem dados validos.

3. Expor no payload:
- `data_quality_summary`
- `missing_inputs`

---

## 7) API (contrato recomendado)

## 7.1 Refatorar

`GET /api/projects/[id]/overview`:
- manter compatibilidade,
- adicionar bloco `progress`.

## 7.2 Novos endpoints

- `GET /api/projects/[id]/progress/history`
- `POST /api/projects/[id]/progress/recalculate` (admin only)
- `GET /api/projects/[id]/progress/details`

## 7.3 Seguranca

- todos tenant-scoped por `requireTenant()`
- recalc: `requireAdmin()`
- log de auditoria para recalc manual

---

## 8) UI (ordem de entrega)

1. Dashboard:
- `ProgressScoreCard`
- 5 `DimensionCard`
- alerta de `insufficient_data`

2. Pagina dedicada:
- `/projects/[projectId]/progress`
- trend chart
- tabela de drivers negativos (overdue, bugs reabertos, risco critico)

3. Sidebar:
- item "Progresso"

---

## 9) Plano de Implementacao em Fases

## Fase 1 - Fundacao confiavel

1. Migration `018`:
- `project_progress_snapshots`
- `work_item_status_history`
- `project_progress_settings`

2. Funcao SQL:
- `calculate_project_progress(project_id, tenant_id, trigger_event)`

3. Trigger inicial:
- `features.status`
- `features.due_date`
- `features.dod_*`
- `risks.status`, `risks.gut_*`
- `sprints.status`, `sprints.completed_at`

4. Recalc manual admin endpoint.

## Fase 2 - API e UI basica

5. Refatorar `overview` com bloco `progress`.
6. Criar `/progress/history` e `/progress/details`.
7. Atualizar hooks e dashboard.

## Fase 3 - Score avancado

8. Habilitar pesos configuraveis em `project_progress_settings`.
9. Versao de formula + comparacao historica.
10. Ajustes de peso para bugs e qualidade.

---

## 10) Criterios de Aceite (fortes)

- `projects.progress` passa a ser derivado de snapshot/funcoes.
- Nao existe dimensao com 100 por ausencia de dados.
- Reopen rate e calculado via historico de status.
- Recalc manual e admin-only + auditado.
- Multi-tenant preservado em tabelas, funcoes, policies e endpoints.
- Dashboard exibe score + qualidade de dado.
- Historico de 30 dias disponivel em endpoint e UI.

---

## 11) Decisoes em Aberto (R1.1)

1. Snapshot por evento vs diario:
- recomendacao: hibrido.
  - evento para mudancas criticas,
  - compactacao diaria para leitura de grafico.

2. Peso de bugs:
- recomendacao: maior que feature, mas limitado por faixa para nao distorcer score.

3. Fonte de velocity:
- usar view/materialized view com refresh controlado.

4. Persistencia de score no `projects.progress`:
- recomendacao: manter por compatibilidade, mas considerar `progress_source = 'snapshot'`.

---

## 12) Ajustes necessarios no plano original

1. Trocar `type='bug'` por `work_item_type='bug'`.
2. Nao assumir `sprints.completed_at` como ausente sem verificar schema vigente.
3. Nao usar defaults 100 para falta de dados.
4. Incluir tabela de historico de status antes de calcular reabertura.
5. Definir data quality/confidence no contrato de API.

---

Documento revisado para evitar progresso ilusorio e permitir implementacao com governanca de dados.

---

## 13) Revisao Critica da Implementacao 018 (R1.2)

Status da migration `018_project_progress_tracking.sql`:
- Fundacao criada corretamente (settings, historico, snapshots, funcao e triggers).
- Formula ja evita 100% por ausencia de dados em dimensoes principais.

Gaps criticos encontrados:

1. Write storm em projetos ativos:
- Recalculo roda `FOR EACH ROW` em features, risks e sprints.
- Em operacoes em lote isso pode gerar muitas escritas em `project_progress_snapshots`.

2. Falta de compactacao/dedupe de snapshots:
- Nao existe guarda para evitar snapshots repetidos em janela curta.
- Custo de armazenamento e ruido para leitura historica.

3. Threshold de risco hardcoded:
- Penalidade de risco critico usa corte fixo `>= 80`.
- Plano R1.1 recomenda limiar parametrico por projeto/tenant.

4. Configuracao sem governanca completa:
- Nao ha trigger para manter `project_progress_settings.updated_at`.
- Nao ha validacao de consistencia de pesos de dimensao (ex.: soma nula).

5. Recalc manual admin-only ainda nao fechado no contrato:
- Fase 1 previa endpoint manual auditavel.
- Precisamos endpoint dedicado com `requireAdmin()` + trilha de auditoria.

6. Fonte historica de reabertura inicia vazia:
- `work_item_status_history` nasce na migration.
- Bugs antigos sem historico vao cair em `insufficient_data` no inicio (comportamento correto, mas deve estar documentado).

## 14) Plano de Ajuste Imediato (R1.2)

1. Criar migration `019_progress_hardening.sql`:
- Adicionar `risk_critical_threshold` em `project_progress_settings` (default 80).
- Adicionar trigger de `updated_at` para `project_progress_settings`.
- Ajustar `calculate_project_progress` para usar threshold parametrico.
- Adicionar dedupe de snapshot por janela curta (ex.: 30-60s por projeto/trigger).

2. Fechar API operacional:
- `POST /api/projects/[id]/progress/recalculate` com `requireAdmin()`.
- Registrar `trigger_event='manual_admin'` e `created_by`.

3. Exposicao segura para UI:
- `GET /api/projects/[id]/progress/details` (ultimo snapshot + qualidade de dado).
- `GET /api/projects/[id]/progress/history` (serie temporal com limite/paginacao).

4. Criterio de pronto da Fase 1:
- Sem inflacao por ausencia de dados.
- Sem explosao de snapshots em edicao de massa.
- Recalc manual auditavel e restrito a admin.
- Historico e detalhes consumiveis pela UI.
