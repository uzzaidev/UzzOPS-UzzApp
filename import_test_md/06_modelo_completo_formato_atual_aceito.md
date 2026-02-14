---
template: uzzops-feeder
version: "1.0"
project: "UZZAPP"
sprint: "SPR-003"
date: "2026-02-13"
author: "Pedro Vitor"
source: "modelo-completo-fase1"
---

## feature
code: F-020
name: Importação robusta de markdown
description: |
  Construir pipeline de importação resiliente para arquivos .md com
  validação, preview e confirmação.
category: Backend
version: V1
priority: P1
status: backlog
story_points: 8
business_value: 9
work_effort: 6
due_date: 2026-02-24
responsible:
  - Pedro Vitor
is_mvp: true
observation: |
  Modelo completo para criação de feature no formato atual.

## bug
code: F-021
name: Falha de parsing em conteúdo com BOM
description: |
  Corrigir parsing quando o arquivo inicia com BOM UTF-8.
category: Backend
version: V1
priority: P1
status: backlog
story_points: 3
due_date: 2026-02-21
responsible:
  - Pedro Vitor
solution_notes: |
  Tratamento de normalização no início do pipeline.
observation: |
  Modelo completo para criação de bug no formato atual.

## bug_resolution
code: F-010
status: done
solution_notes: |
  Aplicado update de status para done e persistido histórico de transição
  em work_item_status_history.
resolved_at: 2026-02-13
observation: |
  Modelo completo de update via bug_resolution.
