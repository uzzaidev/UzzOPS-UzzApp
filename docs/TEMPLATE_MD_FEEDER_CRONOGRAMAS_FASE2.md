---
template: uzzops-feeder
version: "1.0"
project: SEU_PROJECT_ID_REAL
date: 2026-02-14
author: Time UzzOPS
source: cronogramas-governanca-fase2
---

## outcome_opportunity
outcome_tree_code: OST-001
title: Falta de interface intuitiva para inserção de elementos elétricos
problem_statement: |
  Usuários precisam navegar por menus complexos do Revit para inserir tomadas,
  circuitos e outros elementos elétricos. Processo é lento e propenso a erros.
evidence_json: |
  [
    {
      "type": "user_interview",
      "source": "Entrevista com 5 arquitetos",
      "quote": "Gasto 30 minutos só para inserir tomadas em um apartamento"
    }
  ]
risk_type: usability
priority: 5
status: selected

## opportunity_solution
opportunity_id: [ID_DA_OPPORTUNITY_CRIADA_ACIMA_NA_FASE2]
title: Sistema de comando em PT-BR com RAG
description: |
  Sistema multi-agente que interpreta comandos em português e gera scripts
  Python compatíveis com IronPython 2.7, usando RAG para recuperar exemplos relevantes.
maturity: mvp_test
expected_impact_score: 9
expected_effort_score: 7
confidence_score: 75

## solution_test
solution_id: [ID_DA_SOLUTION_CRIADA_ACIMA_NA_FASE2]
sprint_id: null
test_type: mvp_test
hypothesis: |
  Se usuários usarem comando "Inserir tomada 220V a 0,30m do piso",
  então o sistema gerará script válido com taxa de sucesso ≥ 90%.
method: |
  1. Coletar 20 comandos reais de arquitetos
  2. Executar pipeline completo
  3. Medir taxa de sucesso e tempo médio
success_criteria_json: |
  {
    "taxa_sucesso": "≥ 90%",
    "tempo_medio": "≤ 15s",
    "precision_at_k": "≥ 80%"
  }
result: pending
started_at: 2026-02-14
completed_at: 2026-03-01

## hypothesis_experiment
hypothesis_id: [ID_DA_HYPOTHESIS_CRIADA_NA_FASE1]
sprint_id: null
experiment_type: mvp_test
question: |
  Usuários conseguem inserir tomadas usando comando em PT-BR
  com taxa de sucesso ≥ 90% e tempo médio ≤ 2.5 minutos?
timebox_hours: 40
protocol_json: |
  {
    "participants": 3,
    "commands_per_participant": 10,
    "metrics": ["tempo_medio", "taxa_sucesso", "satisfacao"]
  }
collected_data_json: |
  {
    "tempo_medio": "2.3 minutos",
    "taxa_sucesso": "92%",
    "satisfacao_media": "4.5/5"
  }
result_summary: |
  Experimento validou hipótese. Taxa de sucesso de 92% e tempo médio de 2.3min
  confirmam redução de 50% no tempo.
outcome: go
started_at: 2026-02-14
completed_at: 2026-02-28

## pilot_office
pilot_program_id: [ID_DO_PILOT_PROGRAM_CRIADO_NA_FASE1]
office_name: Escritório A — Arquitetura Moderna
company_name: Arquitetura Moderna Ltda
contact_name: João Silva
contact_email: joao@arquiteturamoderna.com.br
status: guided_use
setup_completed_at: 2026-03-20
notes: |
  Escritório de médio porte (10 arquitetos).
  Foco em projetos residenciais de alto padrão.

## pilot_validation_event
pilot_program_id: [ID_DO_PILOT_PROGRAM_CRIADO_NA_FASE1]
pilot_office_id: [ID_DO_PILOT_OFFICE_CRIADO_ACIMA_NA_FASE2]
sprint_id: null
phase: guided_use
event_date: 2026-03-25
event_type: usage_review
metrics_json: |
  {
    "comandos_executados": 45,
    "taxa_sucesso": "93%",
    "tempo_medio": "2.2 minutos",
    "satisfacao_media": "4.3/5"
  }
incidents_json: |
  [
    {
      "date": "2026-03-23",
      "type": "error",
      "description": "Script falhou ao inserir tomada em parede curva",
      "resolution": "Corrigido no mesmo dia"
    }
  ]
qualitative_feedback: |
  Sistema funciona muito bem para casos simples. Para casos complexos
  (paredes curvas, elementos especiais), ainda precisa de ajustes.
decision: continue
