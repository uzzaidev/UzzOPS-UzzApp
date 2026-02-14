---
template: uzzops-feeder
version: "1.0"
project: "UZZAPP"
sprint: "SPR-003"
date: "2026-02-13"
author: "Pedro Vitor"
source: "teste-01-happy-path"
---

## feature
name: Validação de metadados no MD Feeder
description: |
  Garantir validação de template, version, project e sprint
  antes de processar os blocos.
category: Backend
version: V1
priority: P1
status: backlog
story_points: 5
due_date: 2026-02-20
responsible:
  - Pedro Vitor
observation: |
  Cenário de criação de feature via import.

## bug
name: Erro de parse quando markdown vem com cercas
description: |
  Parser deve aceitar conteúdo com ```md e ``` sem quebrar blocos.
category: Backend
version: V1
priority: P1
status: backlog
story_points: 3
due_date: 2026-02-19
responsible:
  - Pedro Vitor
observation: |
  Cenário de criação de bug via import.

## bug_resolution
code: F-010
status: done
solution_notes: |
  Ajustado fluxo de update para registrar histórico e solução.
resolved_at: 2026-02-13
observation: |
  Cenário de update de bug existente via code.
