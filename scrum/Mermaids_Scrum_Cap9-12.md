---
created: 2026-01-06
updated: 2026-02-07T14:02
tags:
  - scrum
  - diagramas
  - mermaid
  - visual
---

# 🎨 Diagramas Visuais Scrum — Cap. 9-12

## 📖 Como Usar Este Documento

Este arquivo contém **diagramas Mermaid** prontos para visualizar:
- Fluxo de Product Backlog Refinement (PBR)
- Ciclo de User Stories
- Evolução da Definition of Done
- Sprint Zero estruturado
- Métricas e Velocidade

**Instruções:**
- Copie os blocos de código Mermaid
- Cole em ferramentas compatíveis: Obsidian, Notion, GitHub, Miro, ou [Mermaid Live Editor](https://mermaid.live)
- Personalize cores, textos, e estrutura conforme seu projeto

---

# 📊 Diagrama 1 — Fluxo de Product Backlog Refinement (PBR)

## Visão Geral do Processo

```mermaid
graph TB
    A[📋 Product Backlog<br/>Raw/Não Refinado] --> B{PBR Session<br/>60-90 min}

    B --> C[🎯 Demo Protótipo<br/>10-15 min]
    C --> D[💬 Feedback Estruturado<br/>Gostei/Falta/Confuso/Risco]
    D --> E[🗺️ Atualizar Mapa Mental<br/>Adicionar/Remover Épicos]
    E --> F[✍️ Escrever User Stories<br/>+ Critérios de Aceitação]
    F --> G[📸 Snapshot do Backlog<br/>Registro de Mudanças]

    G --> H[📦 Product Backlog<br/>Refinado e Priorizado]

    H --> I{Sprint Planning}
    I --> J[🚀 Sprint Backlog]

    style A fill:#ffcccc
    style H fill:#ccffcc
    style B fill:#fff4cc
    style G fill:#cce5ff
```

---

## Fluxo Detalhado com Decisões

```mermaid
flowchart TD
    Start([🎬 Início PBR Session]) --> Prep{Preparação<br/>OK?}

    Prep -->|❌ Não| PrepFail[❗ Adiar Sessão<br/>PO prepara protótipo<br/>ou contexto MVP]
    Prep -->|✅ Sim| Demo[🎯 Demo Protótipo<br/>10-15 min]

    Demo --> Feedback[💬 Coletar Feedback<br/>4 Categorias<br/>15 min silencioso]

    Feedback --> Analyze{Temas<br/>Recorrentes?}

    Analyze -->|✅ Sim| UpdateMap[🗺️ Atualizar Mapa Mental<br/>Adicionar/Remover Ramos]
    Analyze -->|❌ Não| Clarify[❓ Esclarecer com PO<br/>Feedback vago]

    Clarify --> UpdateMap

    UpdateMap --> CreateStories[✍️ Criar User Stories<br/>Formato padrão<br/>+ Critérios de Aceitação]

    CreateStories --> Estimate{Histórias<br/>Estimadas?}

    Estimate -->|❌ Não| PlanPoker[🃏 Planning Poker<br/>Próxima sessão]
    Estimate -->|✅ Sim| Snapshot[📸 Registrar Snapshot<br/>Antes/Depois]

    Snapshot --> Prioritize[🎯 PO Prioriza<br/>Top 10 itens]

    Prioritize --> End([✅ PBR Completo<br/>Backlog Refinado])

    style Start fill:#e1f5e1
    style End fill:#e1f5e1
    style PrepFail fill:#ffe1e1
    style Snapshot fill:#e1e5ff
```

---

# 📝 Diagrama 2 — Ciclo de Vida de uma User Story

## Da Ideia ao Done

```mermaid
stateDiagram-v2
    [*] --> Ideia: Stakeholder/PO propõe

    Ideia --> Backlog: Criar história bruta

    Backlog --> Refinement: PBR Session
    note right of Refinement
        Escrever critérios de aceitação
        Quebrar épicos grandes
        Estimar (Planning Poker)
    end note

    Refinement --> Ready: História refinada

    Ready --> Planning: Sprint Planning
    note right of Planning
        Time puxa história
        Compromete em Sprint
    end note

    Planning --> InProgress: Dev começa trabalho

    InProgress --> CodeReview: PR aberto

    CodeReview --> InProgress: Ajustes necessários
    CodeReview --> Testing: Aprovado

    Testing --> InProgress: Bug encontrado
    Testing --> Done: Passa no DoD

    Done --> Review: Sprint Review

    Review --> Accepted: PO aprova
    Review --> InProgress: PO rejeita
    note left of Accepted
        História entregue
        Valor gerado
    end note

    Accepted --> [*]

    state Done {
        [*] --> CheckDoD
        CheckDoD --> Lint: Código padronizado?
        Lint --> Tests: Testes passam?
        Tests --> CodeRev: Code review OK?
        CodeRev --> Staging: Deploy staging OK?
        Staging --> [*]: Todos ✅
    }
```

---

## Estados Simplificados (Kanban Style)

```mermaid
flowchart LR
    A[📋 Backlog] --> B[🔍 Refinement]
    B --> C[✅ Ready]
    C --> D[🚧 In Progress]
    D --> E[👀 Code Review]
    E --> F[🧪 Testing]
    F --> G[✔️ Done]
    G --> H[🎉 Accepted]

    E -.->|Ajustes| D
    F -.->|Bug| D
    H -.->|Rejeita| D

    style A fill:#ffcccc
    style C fill:#ffffcc
    style D fill:#cce5ff
    style G fill:#ccffcc
    style H fill:#ccffcc,stroke:#00aa00,stroke-width:3px
```

---

# 📐 Diagrama 3 — Evolução da Definition of Done (DoD)

## Três Níveis de Maturidade

```mermaid
graph TD
    subgraph DoD_v1["DoD v1.0 — Mínimo Viável<br/>(Sprint 0-3)"]
        v1_1[✅ Código padronizado]
        v1_2[✅ Code review 1 pessoa]
        v1_3[✅ Testes unitários ≥70%]
        v1_4[✅ Integrado em staging]
        v1_5[✅ PO aprovou]
    end

    subgraph DoD_v2["DoD v2.0 — Intermediário<br/>(Sprint 4-10)"]
        v2_1[✅ Código padronizado]
        v2_2[✅ Code review 1 pessoa]
        v2_3[✅ Testes unitários ≥80%]
        v2_4[✅ Testes E2E fluxo principal]
        v2_5[✅ Performance aceitável]
        v2_6[✅ Doc técnica atualizada]
        v2_7[✅ Integrado em staging]
        v2_8[✅ PO + Stakeholder aprovaram]
    end

    subgraph DoD_v3["DoD v3.0 — Maduro<br/>(Sprint 10+)"]
        v3_1[✅ Código padronizado]
        v3_2[✅ Code review 2 pessoas]
        v3_3[✅ Testes unitários ≥85%]
        v3_4[✅ Testes E2E completos]
        v3_5[✅ Performance + Stress test]
        v3_6[✅ Segurança validada OWASP]
        v3_7[✅ CI/CD pipeline passa]
        v3_8[✅ Doc técnica + usuário]
        v3_9[✅ Métricas de uso configuradas]
        v3_10[✅ PO + Stakeholder + Analytics]
    end

    DoD_v1 -->|PO rejeita história<br/>+3-5 Sprints| DoD_v2
    DoD_v2 -->|Time maduro<br/>+10 Sprints| DoD_v3

    style DoD_v1 fill:#ffffcc
    style DoD_v2 fill:#cce5ff
    style DoD_v3 fill:#ccffcc
```

---

## Gatilho de Evolução

```mermaid
flowchart TD
    A[📦 História Done] --> B{Sprint Review}

    B -->|✅ PO Aceita| C[🎉 História Accepted<br/>DoD funcionou]
    B -->|❌ PO Rejeita| D[❗ Investigar Causa]

    D --> E{O que faltou?}

    E -->|Ex: Teste integração| F[➕ Adicionar ao DoD<br/>Testes integração obrigatórios]
    E -->|Ex: Performance| G[➕ Adicionar ao DoD<br/>Load test obrigatório]
    E -->|Ex: Segurança| H[➕ Adicionar ao DoD<br/>Security checklist]

    F --> I[📝 DoD Evoluído]
    G --> I
    H --> I

    I --> J[📢 Comunicar Time<br/>Próxima Daily/Retro]

    J --> K[🔄 Usar DoD Atualizado<br/>Próximo Sprint]

    style D fill:#ffe1e1
    style I fill:#e1f5e1
    style K fill:#e1e5ff
```

---

# 🚀 Diagrama 4 — Sprint Zero: 6 Buckets

## Estrutura do Sprint Zero

```mermaid
mindmap
  root((Sprint Zero<br/>1-2 semanas))
    A[Objetivo Negócio<br/>Governança]
      A1[Meta produtividade]
      A2[Cadência Reviews]
      A3[Canal comunicação]
    B[Linguagem Comum]
      B1[Scrum Guide lido]
      B2[Visão produto]
      B3[Formato User Story]
    C[Papéis Capacitados]
      C1[PO, SM, Time definidos]
      C2[PO treina priorização]
      C3[SM prepara facilitação]
    D[Ferramentas<br/>Ambiente]
      D1[Board configurado]
      D2[Git + CI/CD]
      D3[Staging funcional]
    E[Acordos Essenciais]
      E1[DoD v1.0]
      E2[Cadência Sprint]
      E3[Horário Daily]
    F[Necessidades<br/>Específicas]
      F1[Tecnologia estudada]
      F2[Integrações mapeadas]
      F3[Spike técnico]
```

---

## Checklist de Saída do Sprint Zero

```mermaid
flowchart TD
    Start([🎬 Sprint Zero Inicia]) --> CheckA{Bucket A<br/>Completo?}

    CheckA -->|❌| FixA[❗ Completar Bucket A]
    FixA --> CheckA
    CheckA -->|✅| CheckB{Bucket B<br/>Completo?}

    CheckB -->|❌| FixB[❗ Completar Bucket B]
    FixB --> CheckB
    CheckB -->|✅| CheckC{Bucket C<br/>Completo?}

    CheckC -->|❌| FixC[❗ Completar Bucket C]
    FixC --> CheckC
    CheckC -->|✅| CheckD{Bucket D<br/>Completo?}

    CheckD -->|❌| FixD[❗ Completar Bucket D]
    FixD --> CheckD
    CheckD -->|✅| CheckE{Bucket E<br/>Completo?}

    CheckE -->|❌| FixE[❗ Completar Bucket E]
    FixE --> CheckE
    CheckE -->|✅| CheckF{Bucket F<br/>Completo?}

    CheckF -->|❌| FixF[❗ Completar Bucket F]
    FixF --> CheckF
    CheckF -->|✅| Review[📊 Review Sprint Zero<br/>Demo de Preparação]

    Review --> Validate{Stakeholder<br/>Validou?}

    Validate -->|❌| Adjust[🔧 Ajustar Gaps]
    Adjust --> Review
    Validate -->|✅| Sprint1[🚀 Sprint 1 Ready<br/>Começar Desenvolvimento]

    Sprint1 --> End([✅ Sprint Zero Completo])

    style Start fill:#e1f5e1
    style End fill:#e1f5e1
    style Sprint1 fill:#ccffcc,stroke:#00aa00,stroke-width:3px
    style FixA fill:#ffe1e1
    style FixB fill:#ffe1e1
    style FixC fill:#ffe1e1
    style FixD fill:#ffe1e1
    style FixE fill:#ffe1e1
    style FixF fill:#ffe1e1
```

---

# 📈 Diagrama 5 — Velocidade e Previsão de Prazo

## Cálculo de Velocidade ao Longo dos Sprints

```mermaid
graph LR
    subgraph Sprint1["Sprint 1"]
        S1_C[Committed: 25 pts]
        S1_D[Done: 18 pts]
        S1_V[Velocidade: 18]
    end

    subgraph Sprint2["Sprint 2"]
        S2_C[Committed: 22 pts]
        S2_D[Done: 20 pts]
        S2_V[Velocidade: 20]
    end

    subgraph Sprint3["Sprint 3"]
        S3_C[Committed: 23 pts]
        S3_D[Done: 22 pts]
        S3_V[Velocidade: 22]
    end

    subgraph Sprint4["Sprint 4"]
        S4_C[Committed: 24 pts]
        S4_D[Done: 21 pts]
        S4_V[Velocidade: 21]
    end

    Sprint1 --> Sprint2
    Sprint2 --> Sprint3
    Sprint3 --> Sprint4

    Sprint4 --> Calc[📊 Velocidade Média<br/>últimos 3 Sprints:<br/>(22+21+20)/3 = 21 pts]

    Calc --> Forecast{Previsão de Prazo}

    Forecast --> Backlog[📦 Backlog Restante:<br/>126 pontos]
    Forecast --> VelMed[⚡ Velocidade Média:<br/>21 pts/Sprint]

    Backlog --> Sprints[🔢 Sprints Restantes:<br/>126 ÷ 21 = 6 Sprints]
    VelMed --> Sprints

    Sprints --> Weeks[📅 Prazo:<br/>6 Sprints × 2 sem = 12 semanas]

    style Calc fill:#e1e5ff
    style Weeks fill:#ccffcc,stroke:#00aa00,stroke-width:3px
```

---

## Previsão por Faixa (Pessimista/Provável/Otimista)

```mermaid
flowchart TD
    Backlog[📦 Backlog: 180 pontos] --> VelRange{Velocidade<br/>Estimada}

    VelRange --> Pess[🐢 Pessimista<br/>15 pts/Sprint]
    VelRange --> Prov[⚖️ Provável<br/>21 pts/Sprint]
    VelRange --> Opt[🚀 Otimista<br/>27 pts/Sprint]

    Pess --> CalcPess[180 ÷ 15 = 12 Sprints<br/>24 semanas<br/>6 meses]
    Prov --> CalcProv[180 ÷ 21 = 8.6 Sprints<br/>~17 semanas<br/>4.3 meses]
    Opt --> CalcOpt[180 ÷ 27 = 6.7 Sprints<br/>~13 semanas<br/>3.3 meses]

    CalcPess --> Range[📊 Faixa de Prazo:<br/>13-24 semanas<br/>Maior probabilidade: 17 sem]
    CalcProv --> Range
    CalcOpt --> Range

    Range --> Decision{Decisão<br/>Patrocinador}

    Decision -->|Data Fixa| FixDate[🔒 Escopo Flexível<br/>Priorizar essencial]
    Decision -->|Escopo Fixo| FixScope[⏳ Prazo Flexível<br/>17±3 semanas]

    style CalcProv fill:#ccffcc,stroke:#00aa00,stroke-width:3px
    style Range fill:#e1e5ff
```

---

# 📊 Diagrama 6 — Scoreboard de Métricas (4 Categorias)

## Métricas ao Longo do Tempo

```mermaid
graph TB
    subgraph Baseline["📍 Baseline (antes Scrum)"]
        B1[Velocidade: 17 pts]
        B2[Rejeição PO: 50%]
        B3[NPS: 20]
        B4[Features Usadas: 40%]
    end

    subgraph Sprint1["Sprint 1"]
        S1_V[Velocidade: 19 pts]
        S1_R[Rejeição: 30%]
        S1_N[NPS: 25]
        S1_F[Uso: 45%]
    end

    subgraph Sprint2["Sprint 2"]
        S2_V[Velocidade: 22 pts]
        S2_R[Rejeição: 20%]
        S2_N[NPS: 28]
        S2_F[Uso: 50%]
    end

    subgraph Sprint3["Sprint 3"]
        S3_V[Velocidade: 24 pts]
        S3_R[Rejeição: 10%]
        S3_N[NPS: 32]
        S3_F[Uso: 55%]
    end

    subgraph Meta6m["🎯 Meta 6 meses"]
        M1[Velocidade: 25 pts]
        M2[Rejeição: <10%]
        M3[NPS: ≥40]
        M4[Uso: ≥60%]
    end

    Baseline --> Sprint1
    Sprint1 --> Sprint2
    Sprint2 --> Sprint3
    Sprint3 -.->|Tendência| Meta6m

    style Baseline fill:#ffcccc
    style Sprint3 fill:#cce5ff
    style Meta6m fill:#ccffcc,stroke:#00aa00,stroke-width:3px
```

---

## Dashboard Simplificado (Status Visual)

```mermaid
flowchart LR
    subgraph Metrics["📊 Métricas — Sprint 3"]
        M1[⚡ Velocidade: 24 pts<br/>Δ +41% vs baseline<br/>🟡 Melhorando]
        M2[✅ Rejeição PO: 10%<br/>Δ -80% vs baseline<br/>🟢 Meta atingida]
        M3[💚 NPS: 32<br/>Δ +60% vs baseline<br/>🟡 Melhorando]
        M4[📱 Uso Features: 55%<br/>Δ +38% vs baseline<br/>🟡 Melhorando]
    end

    M1 --> Action1[🎯 Ação: Manter ritmo<br/>Capacity OK]
    M2 --> Action2[🎉 Celebrar: DoD funcionando]
    M3 --> Action3[📈 Ação: Pesquisar por que<br/>ainda não chegou em 40]
    M4 --> Action4[🔍 Ação: Entrevistar usuários<br/>Features pouco usadas]

    style M2 fill:#ccffcc,stroke:#00aa00,stroke-width:3px
    style M1 fill:#ffffcc
    style M3 fill:#ffffcc
    style M4 fill:#ffffcc
```

---

# 🔄 Diagrama 7 — Snapshot do Backlog (Antes/Depois)

## Transformação do Backlog após PBR

```mermaid
flowchart TD
    subgraph Before["📦 Backlog ANTES PBR<br/>87 pontos / 15 histórias"]
        B1[Epic: Login Social<br/>13 pts]
        B2[Epic: Gerenciar Tarefas<br/>8 pts ⚠️ Vago]
        B3[História: Dashboard Analytics<br/>18 pts]
        B4[História: Notificações Push<br/>12 pts ⚠️ Risco técnico]
        B5[Outros: 36 pts]
    end

    PBR[🔍 PBR Session<br/>Feedback Protótipo]

    subgraph After["📦 Backlog DEPOIS PBR<br/>105 pontos / 18 histórias"]
        A1[Epic: Login Social<br/>13 pts ✅ Mantido]
        A2[Epic: Gerenciar Tarefas<br/>18 pts ⬆️ Expandido<br/>editar/deletar/filtros]
        A3[História: Dashboard Analytics<br/>0 pts ❌ Removido MVP]
        A4[Spike: Notificações Push<br/>1 dia 🔬 Investigar]
        A5[Outros: 36 pts]
        A6[Novas: 18 pts ➕]
    end

    Before --> PBR
    PBR --> After

    PBR --> Changes[📝 Mudanças:<br/>+18 pts adicionados<br/>-18 pts removidos<br/>+3 histórias criadas]

    Changes --> Snapshot[📸 Snapshot Registrado<br/>Decisões documentadas]

    style Before fill:#ffe1e1
    style After fill:#e1f5e1
    style PBR fill:#e1e5ff
    style Snapshot fill:#ffffcc
```

---

# 🧪 Diagrama 8 — Spike (Investigação Técnica)

## Fluxo de um Spike

```mermaid
flowchart TD
    Start([🔬 Spike Identificado]) --> Why{Por que<br/>Spike?}

    Why -->|Risco técnico| Risk[⚠️ Ex: API externa<br/>pode não funcionar]
    Why -->|Nova tecnologia| Tech[🆕 Ex: Framework<br/>nunca usado]
    Why -->|Performance| Perf[🚀 Ex: Escalabilidade<br/>desconhecida]

    Risk --> Define[📋 Definir Perguntas<br/>a Responder]
    Tech --> Define
    Perf --> Define

    Define --> Timebox[⏱️ Timebox<br/>1 dia / 4h / 1 Sprint]

    Timebox --> Investigate[🔍 Investigar<br/>PoC/Testes/Research]

    Investigate --> Report{Perguntas<br/>Respondidas?}

    Report -->|❌ Não| Extend[⏰ Estender Timebox?]
    Extend -->|Sim| Investigate
    Extend -->|Não| NoGo[🛑 NO-GO<br/>Bloquear feature<br/>ou mudar abordagem]

    Report -->|✅ Sim| Decision{Recomendação}

    Decision -->|✅ GO| CreateStories[📝 Criar User Stories<br/>Detalhadas]
    Decision -->|❌ NO-GO| NoGo

    CreateStories --> Backlog[📦 Adicionar ao Backlog<br/>Priorizar]

    NoGo --> Communicate[📢 Comunicar Stakeholders<br/>Alternativas]

    Backlog --> End([✅ Spike Completo])
    Communicate --> End

    style Start fill:#e1f5e1
    style End fill:#e1f5e1
    style NoGo fill:#ffe1e1
    style CreateStories fill:#ccffcc
```

---

## Exemplo: Spike Notificações Push

```mermaid
graph TD
    A[🔬 Spike: Notificações Push] --> B[❓ Perguntas]

    B --> Q1[1. Permissões iOS/Android?]
    B --> Q2[2. Tempo implementação?]
    B --> Q3[3. Bibliotecas recomendadas?]
    B --> Q4[4. Riscos técnicos?]

    Q1 --> R1[✅ iOS: explícita 60%<br/>Android: implícita 80%]
    Q2 --> R2[✅ 8 dias total<br/>iOS 5d + Android 3d]
    Q3 --> R3[✅ Firebase FCM<br/>Gratuito até 10M msg]
    Q4 --> R4[⚠️ Taxa entrega 95%<br/>Fallback: email]

    R1 --> Decision{Decisão}
    R2 --> Decision
    R3 --> Decision
    R4 --> Decision

    Decision --> GO[✅ GO<br/>Tecnicamente viável]

    GO --> S1[📝 US: Push iOS - 5 pts]
    GO --> S2[📝 US: Push Android - 3 pts]

    S1 --> Backlog[📦 Backlog Sprint 4]
    S2 --> Backlog

    style GO fill:#ccffcc,stroke:#00aa00,stroke-width:3px
    style Backlog fill:#e1e5ff
```

---

# 🎯 Diagrama 9 — Priorização de Backlog (MoSCoW)

## Método MoSCoW Aplicado

```mermaid
flowchart TD
    Backlog[📦 Product Backlog<br/>30 histórias não priorizadas] --> PO{PO Classifica}

    PO --> Must[🔴 Must Have<br/>MVP bloqueado sem isso<br/>8 histórias]
    PO --> Should[🟡 Should Have<br/>Importante, mas não crítico<br/>10 histórias]
    PO --> Could[🟢 Could Have<br/>Desejável, adiciona valor<br/>7 histórias]
    PO --> Wont[⚪ Won't Have<br/>Fora de escopo atual<br/>5 histórias]

    Must --> Sprint1[🚀 Sprint 1-2<br/>Implementar MUST]
    Should --> Sprint3[🚀 Sprint 3-4<br/>Implementar SHOULD]
    Could --> Sprint5[🚀 Sprint 5+<br/>Implementar COULD se capacidade]
    Wont --> Future[🔮 Backlog Futuro<br/>Não fazer agora]

    Sprint1 --> MVP[🎉 MVP Released<br/>MUST completo]
    Sprint3 --> Enhanced[✨ Produto Aprimorado<br/>SHOULD completo]
    Sprint5 --> Full[🌟 Produto Completo<br/>COULD completo]

    style Must fill:#ffcccc,stroke:#cc0000,stroke-width:3px
    style Should fill:#ffffcc,stroke:#cccc00,stroke-width:2px
    style Could fill:#ccffcc,stroke:#00cc00,stroke-width:2px
    style Wont fill:#eeeeee,stroke:#999999,stroke-width:1px
    style MVP fill:#ccffcc,stroke:#00aa00,stroke-width:3px
```

---

## Value vs Effort Matrix

```mermaid
quadrantChart
    title Priorização: Valor vs Esforço
    x-axis Baixo Esforço --> Alto Esforço
    y-axis Baixo Valor --> Alto Valor
    quadrant-1 Avaliar: Alto valor, alto esforço
    quadrant-2 Fazer Agora: Alto valor, baixo esforço
    quadrant-3 Evitar: Baixo valor, baixo esforço
    quadrant-4 Eliminar: Baixo valor, alto esforço
    Login Social: [0.3, 0.8]
    Notificações Push: [0.7, 0.7]
    Editar Tarefa: [0.2, 0.9]
    Dashboard Analytics: [0.8, 0.4]
    Filtros Avançados: [0.6, 0.5]
    Dark Mode: [0.4, 0.3]
    Exportar PDF: [0.7, 0.2]
```

---

# 🔁 Diagrama 10 — Retrospectiva Actions (Ciclo Kaizen)

## Ciclo de Melhoria Contínua

```mermaid
graph TB
    subgraph Sprint["🏃 Sprint N"]
        Work[💼 Time Trabalha]
        Observe[👀 Observar Processo]
    end

    Work --> Observe

    Observe --> Retro[🔄 Retrospectiva<br/>Última sexta do Sprint]

    Retro --> Discuss[💬 Discussão<br/>Start/Stop/Continue]

    Discuss --> Vote[🗳️ Votar<br/>1 tema prioritário]

    Vote --> Experiment[🧪 Criar Experimento<br/>Hipótese + Métrica]

    Experiment --> SprintN1[🏃 Sprint N+1<br/>Implementar Experimento]

    SprintN1 --> Measure[📊 Medir Resultado]

    Measure --> RetroN1[🔄 Retrospectiva N+1<br/>Avaliar Experimento]

    RetroN1 --> Success{Funcionou?}

    Success -->|✅ Sim| Adopt[✅ Adotar Permanentemente<br/>Processo melhorado]
    Success -->|⚠️ Parcial| Adjust[🔧 Ajustar e Tentar +1 Sprint]
    Success -->|❌ Não| Stop[🛑 Interromper<br/>Aprender e tentar outro]

    Adopt --> Next[🔁 Próximo Experimento]
    Adjust --> SprintN2[Sprint N+2]
    Stop --> Next

    Next --> Retro

    style Retro fill:#e1e5ff
    style Adopt fill:#ccffcc,stroke:#00aa00,stroke-width:3px
    style Stop fill:#ffe1e1
```

---

# 📚 Como Usar Estes Diagramas

## Workflow Recomendado

1. **Apresentações para Stakeholders:**
   - Usar Diagrama 1 (Fluxo PBR) para explicar processo
   - Usar Diagrama 5 (Velocidade) para mostrar previsões
   - Usar Diagrama 6 (Scoreboard) para reportar progresso

2. **Onboarding de Novos Membros:**
   - Usar Diagrama 2 (Ciclo User Story) para ensinar fluxo
   - Usar Diagrama 3 (Evolução DoD) para explicar qualidade
   - Usar Diagrama 4 (Sprint Zero) para preparação inicial

3. **Planejamento Técnico:**
   - Usar Diagrama 8 (Spike) para investigações
   - Usar Diagrama 9 (Priorização) para facilitar PO
   - Usar Diagrama 7 (Snapshot) para registrar mudanças

4. **Retrospectivas:**
   - Usar Diagrama 10 (Retro Actions) para ciclo Kaizen
   - Visualizar melhoria contínua para o time

---

## Ferramentas Compatíveis

### Renderização de Mermaid:

- **Obsidian:** Nativo (colar blocos `mermaid`)
- **GitHub/GitLab:** Nativo em Markdown files
- **Notion:** Via plugin ou [Mermaid Live](https://mermaid.live) → exportar imagem
- **Confluence:** Via plugin "Mermaid Diagrams"
- **VS Code:** Extension "Markdown Preview Mermaid"
- **Miro/Mural:** Exportar PNG/SVG e colar como imagem

### Editar e Personalizar:

1. Copiar bloco Mermaid
2. Colar em [Mermaid Live Editor](https://mermaid.live)
3. Editar cores, textos, estrutura
4. Exportar PNG/SVG ou copiar código atualizado

---

**Próximos passos:**
1. Ver `Guia_Scrum_Parte3_Cap9-12.md` para conceitos detalhados
2. Ver `Playbooks_Dinamicas_Cap9-12.md` para oficinas práticas
3. Ver `Templates_Operacionais_Cap9-12.md` para templates copiáveis

---

*Diagramas visuais criados para UzzAI — Facilitando compreensão de processos Scrum com visualização clara.*
