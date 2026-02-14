import { NextResponse } from 'next/server';

const TEMPLATE_BY_NAME: Record<string, string> = {
  master: `---
template: uzzops-feeder
template_version: "1.0"
version: "1.0"
project: "UZZAPP"
sprint: "SPR-003"
date: "2026-02-13"
author: "Seu Nome"
source: "ata-reuniao"
---

## feature
name: Exemplo de feature
description: |
  Descricao da feature.
category: Backend
version: V1
priority: P1
status: backlog

## bug
name: Exemplo de bug
description: |
  Erro observado.
category: Backend
version: V1
priority: P1
status: backlog

## bug_resolution
code: F-010
status: done
solution_notes: |
  Correcao aplicada e validada.

## risk
public_id: RSK-010
title: Exemplo de risco
description: Risco tecnico
gut_g: 4
gut_u: 4
gut_t: 3
status: identified

## retrospective
category: needs_improvement
action_text: Melhorar cobertura de testes
status: pending
due_date: 2026-02-20
success_criteria: Cobertura minima de 80%

## planning_result
code: F-011
story_points: 8
business_value: 9
work_effort: 5

## baseline_metric
metric_name: Velocidade Media
metric_category: velocity
baseline_value: 18
target_value: 25
current_value: 20
unit: pts/sprint
baseline_date: 2026-02-13

## marketing_campaign
name: Campanha Onboarding Q1
description: Campanha para novos usuarios
objective: Educacao
status: active
start_date: 2026-02-13
end_date: 2026-03-15
color: "#0A66C2"

## marketing_post
title: Dica de uso do produto
content_type: feed
channel: instagram
scheduled_date: 2026-02-18
scheduled_time: 10:30
status: scheduled
campaign_name: Campanha Onboarding Q1
caption_base: Texto base da legenda
hashtags:
  - #uzzapp
  - #produtividade

## team_member
name: Joao Silva
email: joao@uzzai.com.br
role: developer
department: Engenharia
allocation_percent: 100
velocity_avg: 18
is_active: true

## uzzapp_client
name: Maria Oliveira
company: Boutique da Maria
phone: 5511999998888
email: maria@boutiquedamaria.com.br
plan: starter
status: trial
onboarded_at: 2026-02-13

## contato_cliente
subtipo: demo
status: agendado
cliente: Maria Oliveira
contato_principal: Maria Oliveira
empresa: Boutique da Maria
estagio_funil: qualificado
status_negociacao: Em Andamento
probabilidade_fechamento: 60
prioridade: alta
valor_potencial: 12000
valor_mensalidade: 890
valor_setup: 1500
data_contato: 2026-02-20
hora_inicio: 10:00
hora_fim: 11:00
duracao: 1h00m
data_proxima_interacao: 2026-02-23
prazo_proxima_acao: 2026-02-22
responsavel_vendas: Pedro Vitor
responsavel_followup: Pedro Vitor
responsavel_tecnico: Ana QA
produto: CHATBOT
projeto: UZZAPP
canal: videochamada
sentimento_geral: Positivo
deal_outcome_reason: Cliente validando internamente.
decision_summary: Interesse alto, aguardando validacao final.
next_strategy: Enviar caso real e agendar follow-up.
probability_justification: Bom fit, mas depende do timing interno.
competitor: Sem concorrente direto mapeado
bant_scores_json: '{"budget":3,"authority":4,"need":4,"timeline":3,"total":14}'
fit_scores_json: '{"produto":4,"mercado":4,"financeiro":3,"cultural":4,"tecnico":4,"total":19}'
objecoes_json: '["Preco em validacao","Integracao a confirmar"]'
proximos_passos_json: '["Enviar proposta","Agendar reuniao em 7 dias"]'
riscos_json: '["Atraso de decisao por prioridades internas"]'
quality_checklist: '[{"item":"Proxima acao definida","done":true}]'
tags:
  - cliente
  - vendas
summary_md: |
  Ata resumida da conversa com proxima acao definida.
`,
  feature: `## feature
name: Nome da feature
description: |
  Descreva a entrega.
category: Backend
version: V1
priority: P1
status: backlog
`,
  epic: `## epic
name: Epic de exemplo
description: |
  Epic para agrupar entregas.
category: Produto
version: V1
priority: P1
status: backlog
child_codes:
  - F-001
`,
  spike: `## spike
name: Spike de exemplo
description: |
  Pesquisa tecnica.
category: Backend
version: V1
priority: P2
status: backlog
spike_timebox_hours: 8
`,
  spike_result: `## spike_result
code: F-020
status: done
spike_outcome: Resultado da analise tecnica
convert_to_story: true
story_name: Implementar alternativa validada
`,
  bug: `## bug
name: Nome do bug
description: |
  Descreva o erro.
category: Backend
version: V1
priority: P1
status: backlog
`,
  sprint: `## sprint
code: SPR-010
name: Sprint 10
sprint_goal: Entregar melhorias de importacao com qualidade
start_date: 2026-02-15
end_date: 2026-02-28
status: planned
duration_weeks: 2
`,
  sprint_update: `## sprint_update
sprint_code: SPR-010
status: active
velocity_target: 30
`,
  task: `## task
feature_code: F-010
title: Ajustar validacao de parser
description: Cobrir cenarios de borda
status: todo
estimated_hours: 3
`,
  user_story: `## user_story
feature_code: F-010
as_a: Product Owner
i_want: importar md com validacao clara
so_that: o time tenha menos retrabalho
acceptance_criteria:
  - Retornar erro amigavel quando template invalido
  - Nao confirmar import com item invalido
`,
  daily: `## daily
log_date: 2026-02-13
what_did_yesterday: Conclui parser do md feeder
what_will_do_today: Finalizar testes de importacao
impediments:
  - Nenhum
`,
  daily_member: `## daily_member
member_name: Pedro Vitor
log_date: 2026-02-13
what_did_yesterday: Ajustei endpoint de upload
what_will_do_today: Completar fase 2 do plano
impediments:
  - Dependencia de validacao final
`,
  feature_dependency: `## feature_dependency
feature_code: F-020
depends_on_code: F-010
dependency_type: blocks
`,
  bug_resolution: `## bug_resolution
code: F-010
status: done
solution_notes: |
  Correcao aplicada.
`,
  risk: `## risk
title: Risco tecnico
description: Descricao
gut_g: 3
gut_u: 4
gut_t: 3
status: identified
`,
  retrospective: `## retrospective
category: needs_improvement
action_text: Melhorar comunicacao
status: pending
due_date: 2026-02-20
`,
  planning_result: `## planning_result
code: F-011
story_points: 8
business_value: 9
work_effort: 5
`,
  baseline_metric: `## baseline_metric
metric_name: Velocidade Media
metric_category: velocity
baseline_value: 18
target_value: 25
current_value: 20
unit: pts/sprint
baseline_date: 2026-02-13
`,
  marketing_campaign: `## marketing_campaign
name: Campanha Q1
description: Campanha de teste
objective: Awareness
status: draft
start_date: 2026-02-13
end_date: 2026-03-10
`,
  marketing_post: `## marketing_post
title: Post de teste
content_type: feed
channel: instagram
scheduled_date: 2026-02-18
status: scheduled
`,
  team_member: `## team_member
name: Joao Silva
email: joao@uzzai.com.br
role: developer
department: Engenharia
allocation_percent: 100
velocity_avg: 18
is_active: true
`,
  uzzapp_client: `## uzzapp_client
name: Maria Oliveira
company: Boutique da Maria
phone: 5511999998888
email: maria@boutiquedamaria.com.br
plan: starter
status: trial
onboarded_at: 2026-02-13
`,
  contato_cliente: `## contato_cliente
subtipo: demo
status: agendado
cliente: Maria Oliveira
contato_principal: Maria Oliveira
empresa: Boutique da Maria
estagio_funil: qualificado
status_negociacao: Em Andamento
probabilidade_fechamento: 60
prioridade: alta
valor_potencial: 12000
valor_mensalidade: 890
valor_setup: 1500
data_contato: 2026-02-20
hora_inicio: 10:00
hora_fim: 11:00
duracao: 1h00m
data_proxima_interacao: 2026-02-23
prazo_proxima_acao: 2026-02-22
responsavel_vendas: Pedro Vitor
responsavel_followup: Pedro Vitor
responsavel_tecnico: Ana QA
produto: CHATBOT
projeto: UZZAPP
canal: videochamada
sentimento_geral: Positivo
deal_outcome_reason: Cliente avaliando condicoes comerciais.
decision_summary: Nao fechou ainda por timing interno.
next_strategy: Follow-up em 7 dias com caso similar.
probability_justification: Need alto, timeline ainda indefinido.
competitor: Nao informado
bant_scores_json: '{"budget":3,"authority":4,"need":4,"timeline":3,"total":14}'
fit_scores_json: '{"produto":4,"mercado":4,"financeiro":3,"cultural":4,"tecnico":4,"total":19}'
objecoes_json: '["Validacao de budget"]'
proximos_passos_json: '["Enviar proposta revisada"]'
riscos_json: '["Postergar decisao para proximo trimestre"]'
quality_checklist: '[{"item":"Status atualizado","done":true}]'
tags:
  - cliente
  - vendas
summary_md: |
  Ata resumida da conversa com proxima acao definida.
`,
  template_cliente: `---
template: uzzops-feeder
template_version: "1.0"
version: "1.0"
project: "UZZAPP"
sprint: "SPR-003"
date: "2026-02-13"
author: "Seu Nome"
source: "template-cliente"
---

## uzzapp_client
name: Nome Completo Cliente
company: Nome da Empresa
phone: 5511999999999
email: contato@empresa.com
plan: pro
status: trial
onboarded_at: 2026-02-13
estagio_funil: qualificado
status_negociacao: Em Andamento
probabilidade_fechamento: 55
prioridade: alta
valor_potencial: 20000
valor_mensalidade: 1200
valor_setup: 3000
produto: CHATBOT
projeto: UZZAPP
canal: videochamada
sentimento_geral: Positivo
deal_outcome_reason: Cliente avaliando internamente.
decision_summary: Oportunidade qualificada, depende de aprovacao final.
next_strategy: Follow-up com proposta + case.
probability_justification: Need claro, budget parcial.
competitor: Nao mapeado
bant_scores_json: '{"budget":3,"authority":4,"need":4,"timeline":3,"total":14}'
fit_scores_json: '{"produto":4,"mercado":4,"financeiro":3,"cultural":4,"tecnico":4,"total":19}'
objecoes_json: '["Tempo de implantacao"]'
proximos_passos_json: '["Reuniao de alinhamento comercial"]'
riscos_json: '["Atraso por indisponibilidade de decisores"]'
quality_checklist: '[{"item":"Follow-up definido","done":true}]'
tags:
  - cliente
  - vendas

## contato_cliente
subtipo: demo
status: realizado
cliente: Nome Completo Cliente
contato_principal: Nome Contato
empresa: Nome da Empresa
estagio_funil: qualificado
status_negociacao: Em Andamento
probabilidade_fechamento: 65
prioridade: alta
valor_potencial: 20000
valor_mensalidade: 1200
valor_setup: 3000
data_contato: 2026-02-13
hora_inicio: 14:00
hora_fim: 15:00
duracao: 1h00m
data_proxima_interacao: 2026-02-17
prazo_proxima_acao: 2026-02-16
responsavel_vendas: Pedro Vitor
responsavel_followup: Pedro Vitor
responsavel_tecnico: Ana QA
produto: CHATBOT
projeto: UZZAPP
canal: videochamada
sentimento_geral: Positivo
tags:
  - cliente
  - vendas
summary_md: |
  Ata executiva da interacao com score e proximos passos.
`,
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const key = String(name || '').toLowerCase();
  const content = TEMPLATE_BY_NAME[key];

  if (!content) {
    return NextResponse.json({ error: 'Template nao encontrado.' }, { status: 404 });
  }

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${key}_template.md"`,
    },
  });
}
