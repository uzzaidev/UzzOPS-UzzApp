---
template: uzzops-feeder
version: "1.0"
project: SEU_PROJECT_ID_REAL
date: 2026-02-14
author: Time UzzOPS
source: cronogramas-governanca-fase1
---

## product_charter
version: 1
status: active
vision_outcome: |
  Automação de elétrica predial no Revit para escritórios piloto,
  reduzindo tempo de tarefas repetitivas em 50% mantendo taxa de sucesso ≥ 90%.
target_users_json: |
  [
    {
      "profile": "Arquiteto/Engenheiro AEC",
      "context": "Projeto de edificação comercial/residencial",
      "job_to_be_done": "Inserir elementos elétricos (tomadas, circuitos) no modelo BIM"
    }
  ]
critical_hypotheses_json: |
  [
    {
      "type": "value",
      "statement": "Se arquitetos usarem comando em PT-BR para inserir tomadas, então reduzirão tempo em 50%",
      "metric": "Tempo médio de inserção",
      "baseline": "5 minutos",
      "target": "2.5 minutos"
    },
    {
      "type": "usability",
      "statement": "Usuário consegue usar sem treinamento extensivo",
      "metric": "Taxa de sucesso na primeira tentativa",
      "baseline": "0%",
      "target": "≥ 80%"
    },
    {
      "type": "feasibility",
      "statement": "É tecnicamente viável com tecnologia atual",
      "metric": "Taxa de sucesso de geração",
      "baseline": "0%",
      "target": "≥ 85%"
    }
  ]
mvp_anchor_cases_json: |
  [
    {
      "name": "Inserir tomada 220V a 0,30m do piso",
      "description": "Usuário digita comando em PT-BR e sistema insere tomada no modelo",
      "acceptance_criteria": [
        "Tomada inserida na posição correta",
        "Parâmetros configurados (tensão, altura)",
        "Script executado sem erros"
      ],
      "success_metric": "Taxa de sucesso ≥ 90%"
    },
    {
      "name": "Criar circuito elétrico",
      "description": "Usuário solicita criação de circuito conectando tomadas",
      "acceptance_criteria": [
        "Circuito criado corretamente",
        "Tomadas vinculadas ao circuito",
        "Parâmetros elétricos configurados"
      ],
      "success_metric": "Taxa de sucesso ≥ 85%"
    },
    {
      "name": "Validar script antes de executar",
      "description": "Sistema valida sintaxe e estrutura antes de executar no Revit",
      "acceptance_criteria": [
        "Validação AST passa",
        "Rollback disponível em caso de erro",
        "Feedback claro ao usuário"
      ],
      "success_metric": "100% de scripts validados antes de execução"
    }
  ]
success_metrics_json: |
  [
    {
      "dimension": "Confiabilidade",
      "metric": "Taxa de sucesso",
      "measure": "Logs de execução",
      "mvp_ok_threshold": "≥ 90%"
    },
    {
      "dimension": "Latência",
      "metric": "Tempo total",
      "measure": "Timestamps por etapa",
      "mvp_ok_threshold": "p95 ≤ 15s"
    },
    {
      "dimension": "Qualidade",
      "metric": "Precision@k",
      "measure": "Avaliação offline/online",
      "mvp_ok_threshold": "≥ 80%"
    }
  ]
non_negotiables_json: |
  [
    "Segurança: Rollback automático em caso de erro",
    "Compatibilidade: IronPython 2.7 + Revit 2022+",
    "Governança: Evidências de autoria documentadas (versionamento + ADRs)"
  ]
top_risks_json: |
  [
    {
      "risk": "Complexidade do RAG pode atrasar entrega",
      "type": "feasibility",
      "mitigation": "Criar spike de 16h para validar abordagem de embedding",
      "spike_code": "SPIKE-001"
    },
    {
      "risk": "Usuários não adotam comando em PT-BR",
      "type": "usability",
      "mitigation": "MVP test com 3 escritórios piloto",
      "pilot_code": "PILOT-001"
    }
  ]
ip_rules_json: |
  [
    "Não divulgar antes do depósito de patente",
    "Todo material público passa por gate 'IP OK?'",
    "Evidências de autoria documentadas (versionamento + ADRs)"
  ]
valid_from: 2026-02-14
valid_to: 2026-12-31

## outcome_tree
code: OST-001
title: Reduzir tempo de automação elétrica
outcome_statement: |
  Arquitetos e engenheiros conseguem inserir elementos elétricos no Revit
  usando comandos em português, reduzindo tempo de tarefas repetitivas em 50%.
status: active
horizon_label: Q1-Q2 2026

## roadmap
code: ROADMAP-001
name: Roadmap UzzBIM Q1-Q2 2026
status: active
planning_model: scrum
horizon_start: 2026-02-01
horizon_end: 2026-06-30
release_reference_sprints: 6
notes: |
  Roadmap adaptativo baseado em outcomes.
  Releases agrupadas por trimestre.

## roadmap_item
roadmap_id: null
code: RMI-001
item_type: outcome
title: MVP — Casos Âncora Funcionando
description: |
  Entregar os 3 casos âncora do charter funcionando end-to-end:
  1. Inserir tomada 220V
  2. Criar circuito elétrico
  3. Validação AST + rollback
status: in_progress
confidence_pct: 75
planned_start: 2026-02-01
planned_end: 2026-03-15
dependencies_json: |
  []
success_metrics_json: |
  [
    {
      "metric": "Taxa de sucesso",
      "target": "≥ 90%"
    },
    {
      "metric": "Tempo médio",
      "target": "≤ 15s"
    }
  ]

## roadmap_item
roadmap_id: null
code: RMI-002
item_type: milestone
title: Release 1 — MVP Validado
description: |
  MVP validado com 3 escritórios piloto.
  Taxa de sucesso ≥ 90% confirmada.
status: planned
confidence_pct: 60
planned_start: 2026-03-15
planned_end: 2026-04-30
dependencies_json: |
  [
    {
      "type": "blocks",
      "item_code": "RMI-001"
    }
  ]

## project_hypothesis
roadmap_item_id: null
title: Valor — Redução de 50% no tempo
statement: |
  Se arquitetos usarem comando em PT-BR para inserir tomadas,
  então reduzirão tempo de inserção em 50% (de 5min para 2.5min).
risk_type: value
metric_name: Tempo médio de inserção
threshold_expression: tempo_medio <= 2.5
baseline_value: 5 minutos
target_value: 2.5 minutos
evidence_required: |
  Logs de execução de 20 comandos reais.
  Comparação antes/depois.
status: in_test
confidence_before: 50
confidence_after: null

## decision_log
decision_date: 2026-02-14
category: technical
title: Usar Supabase Storage para assets de marketing
decision_text: |
  Decisão de usar Supabase Storage (bucket marketing-assets) para armazenar
  imagens e vídeos de marketing, em vez de AWS S3 ou storage local.
evidence_text: |
  Benchmark de custo: Supabase Storage é mais barato para volumes < 100GB.
  Integração nativa com stack atual (Next.js + Supabase).
impact_summary: |
  Upload via API route /api/marketing/assets/upload.
  RLS policies para isolamento multi-tenant.
  Limite de tamanho por arquivo: 50MB.
impact_json: |
  {
    "affected_areas": ["marketing", "storage"],
    "effort": "baixo",
    "risk": "baixo"
  }
status: active

## adr
adr_code: ADR-001
title: Usar Supabase Storage para assets de marketing
status: accepted
context: |
  Precisamos armazenar imagens/vídeos de marketing de forma escalável e segura.
  Opções: AWS S3, Supabase Storage, storage local.
decision: |
  Usar Supabase Storage com bucket marketing-assets.
alternatives_json: |
  [
    {
      "option": "AWS S3",
      "pros": ["Escalável", "Maturidade"],
      "cons": ["Custo adicional", "Setup complexo"],
      "why_not": "Custo e complexidade desnecessários para volume atual"
    },
    {
      "option": "Storage local",
      "pros": ["Simples"],
      "cons": ["Não escala", "Backup manual"],
      "why_not": "Não escala para múltiplos tenants"
    }
  ]
tradeoffs_json: |
  {
    "pros": [
      "Integração nativa com stack atual",
      "RLS policies para multi-tenant",
      "Custo baixo para volumes < 100GB"
    ],
    "cons": [
      "Limite de tamanho por arquivo (50MB)",
      "Dependência do Supabase"
    ]
  }
consequences: |
  - Upload via API route /api/marketing/assets/upload
  - RLS policies para isolamento multi-tenant
  - Path pattern: {tenant_id}/{content_piece_id}/{asset_id}_{file_name}
reevaluation_triggers_json: |
  [
    "Limite de tamanho se tornar problema",
    "Custo de storage exceder orçamento"
  ]
decided_at: 2026-02-14

## release_forecast
roadmap_id: null
label: Forecast Release 1 — MVP Validado
forecast_model: monte_carlo
unit: story_points
history_window_sprints: 3
sample_size: 10000
confidence_levels_json: |
  [0.5, 0.8, 0.9]
backlog_scope_json: |
  [
    {
      "epic": "Execução confiável",
      "remaining_points": 45
    },
    {
      "epic": "Inserir tomadas + circuitos",
      "remaining_points": 30
    },
    {
      "epic": "RAG/DB",
      "remaining_points": 25
    }
  ]
assumptions_json: |
  {
    "sprint_length_days": 14,
    "definition_of_done_stable": true,
    "velocity_trend": "stable"
  }
output_json: |
  {
    "confidence_50": {
      "sprints": 3,
      "days": 42,
      "range": "3-4 sprints"
    },
    "confidence_80": {
      "sprints": 4,
      "days": 56,
      "range": "4-5 sprints"
    },
    "confidence_90": {
      "sprints": 5,
      "days": 70,
      "range": "5-6 sprints"
    }
  }
notes: |
  Forecast baseado em velocity histórica dos últimos 3 sprints.
  Considerando DoD estável e tendência de velocity estável.

## pilot_program
roadmap_item_id: null
name: Piloto MVP — 3 Escritórios
status: running
pilot_goal: |
  Validar MVP com 3 escritórios piloto.
  Confirmar taxa de sucesso ≥ 90% e satisfação ≥ 4.0/5.
phases_json: |
  [
    {
      "phase": "onboarding",
      "duration_days": 7,
      "activities": ["Setup", "Treinamento básico"]
    },
    {
      "phase": "guided_use",
      "duration_days": 14,
      "activities": ["Uso guiado", "Coleta de feedback"]
    },
    {
      "phase": "expansion",
      "duration_days": 7,
      "activities": ["Uso livre", "Validação final"]
    }
  ]
success_criteria_json: |
  [
    {
      "metric": "Taxa de sucesso",
      "threshold": "≥ 90%"
    },
    {
      "metric": "Satisfação média",
      "threshold": "≥ 4.0/5"
    },
    {
      "metric": "Adoção",
      "threshold": "≥ 80% dos usuários usam semanalmente"
    }
  ]
start_date: 2026-03-15
end_date: 2026-04-15

## product_changelog
sprint_id: null
roadmap_item_id: null
release_label: MVP v0.1.0
change_date: 2026-03-15
change_type: feature
title: Inserção de tomadas via comando em PT-BR
summary: |
  Sistema agora permite inserir tomadas elétricas no Revit usando comandos
  em português. Exemplo: "Inserir tomada 220V a 0,30m do piso".
impact_area: Automação BIM
evidence_links_json: |
  [
    {
      "type": "test_results",
      "url": "/reports/mvp-test-results-2026-03-15.pdf"
    },
    {
      "type": "demo_video",
      "url": "https://youtube.com/watch?v=..."
    }
  ]
visibility: customer_facing

