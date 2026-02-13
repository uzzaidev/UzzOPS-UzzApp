---
created: 2026-01-05
updated: 2026-02-07T14:02
tags:
  - scrum
  - agile
  - uzzai
  - mermaid
  - diagramas
version: 2
---

# DIAGRAMAS MERMAID — Capítulos 5 e 6

> **Diagramas prontos para colar no Obsidian**
> Use estes diagramas para visualizar processos, fluxos e estruturas dos Capítulos 5 e 6

---

## Índice

1. [Fluxo do Sprint (Planning A/B → Daily → Review → Retro)](#1-fluxo-do-sprint)
2. [Kanban/Scrum Board (Estrutura)](#2-kanbanscrum-board)
3. [Mindmap: Assistente de Atendimento UzzAI](#3-mindmap-assistente-de-atendimento-uzzai)
4. [Sequência do Planning Poker (Flowchart)](#4-sequência-do-planning-poker)
5. [Workshops: Descoberta → Priorização → Estimativa](#5-workshops-descoberta--priorização--estimativa)
6. [Sprint Zero → Sprint 1 (Roadmap)](#6-sprint-zero--sprint-1-roadmap)

---

## 1. Fluxo do Sprint

```mermaid
graph TB
    subgraph "Planning A (com PO)"
        PA1[PO apresenta histórias<br/>priorizadas]
        PA2[Time escolhe histórias<br/>do Sprint]
        PA3[Define Sprint Goal]
        PA4[PO define critérios<br/>de aceite]
        PA5[Sprint Backlog<br/>nível história]
    end

    subgraph "Planning B (só Time)"
        PB1[Time quebra histórias<br/>em tarefas]
        PB2[Time estima tarefas]
        PB3[Monta quadro Kanban]
        PB4[Define WIP]
        PB5[Sprint Backlog<br/>nível tarefa]
    end

    subgraph "Execução (Sprint)"
        EX1[Sprint Backlog<br/>To Do / Doing / Done]
        EX2[Daily Scrum<br/>Status + Impedimentos]
        EX3[Burndown Chart<br/>atualizado diariamente]
    end

    subgraph "Fechamento"
        REV[Sprint Review<br/>Demo + Aceite PO]
        RET[Sprint Retrospective<br/>1-3 Melhorias]
        INC[Incremento Funcional<br/>Potencialmente Deployável]
    end

    PA1 --> PA2
    PA2 --> PA3
    PA3 --> PA4
    PA4 --> PA5
    PA5 --> PB1
    PB1 --> PB2
    PB2 --> PB3
    PB3 --> PB4
    PB4 --> PB5
    PB5 --> EX1
    EX1 --> EX2
    EX2 --> EX3
    EX3 --> EX1
    EX1 --> REV
    REV --> RET
    RET --> INC
    INC --> PA1

    style PA3 fill:#e1f5ff,stroke:#0288d1
    style PB5 fill:#fff4e1,stroke:#f57c00
    style EX1 fill:#fff4e1,stroke:#f57c00
    style REV fill:#e8f5e9,stroke:#388e3c
    style RET fill:#f3e5f5,stroke:#7b1fa2
```

---

## 2. Kanban/Scrum Board

```mermaid
graph LR
    subgraph "Product Backlog (visível ao lado)"
        PB[Product Backlog<br/>Priorizado pelo PO]
    end

    subgraph "Sprint Backlog (Quadro Kanban)"
        TD[To Do<br/>Tarefas selecionadas]
        DO[Doing<br/>WIP: 2-4 tarefas]
        DN[Done<br/>Testado + DoD]
        AC[Aceito<br/>PO validou]
    end

    PB -->|Planning| TD
    TD -->|Time pega tarefa| DO
    DO -->|DoD completo| DN
    DN -->|Review| AC

    style TD fill:#e3f2fd,stroke:#1976d2
    style DO fill:#fff3e0,stroke:#f57c00
    style DN fill:#e8f5e9,stroke:#388e3c
    style AC fill:#f1f8e9,stroke:#689f38
```

---

## 3. Mindmap: Assistente de Atendimento UzzAI

```mermaid
mindmap
  root((Assistente de Atendimento UzzAI))
    Canais
      WhatsApp
      Webchat
      Email
      SMS
    Fluxo
      Abertura de chamado
      Triagem automática
      Resolução IA
      Escalonamento humano
      Fechamento + feedback
    IA
      Base de conhecimento RAG
      Classificação de intenção
      Resumo de conversa
      Políticas o que pode/não pode
      Detecção de sentimento
    Operação
      Painel do suporte
      Auditoria de conversas
      Logs e rastreamento
      Configurações
    Métricas
      Taxa de resolução
      Tempo médio resposta
      CSAT satisfação
      Motivos escalonamento
      Volume por canal
    Compliance
      LGPD
      Anonimização dados
      Retenção logs
      Consentimento
```

---

## 4. Sequência do Planning Poker

```mermaid
flowchart TD
    START([Inicia Planning Poker])
    MODE{Modo:<br/>BV ou W?}
    
    BV[Poker BV<br/>Valor de Negócio]
    W[Poker W<br/>Esforço]
    
    SHOW[Mostra história<br/>para time]
    VOTE[Time escolhe carta<br/>em silêncio]
    REVEAL[Revela cartas<br/>ao mesmo tempo]
    
    CHECK{Extremos?<br/>0/∞/13/21}
    DEFEND[Defende extremos<br/>30s cada]
    REVOTE{Re-vota?<br/>máx 1 vez}
    
    CALC[Calcula mediana<br/>+ ∞ como desempate]
    ORDER[Ordena backlog]
    NEXT{Próxima<br/>história?}
    END([Fim Poker])
    
    START --> MODE
    MODE -->|Priorização| BV
    MODE -->|Estimativa| W
    BV --> SHOW
    W --> SHOW
    SHOW --> VOTE
    VOTE --> REVEAL
    REVEAL --> CHECK
    CHECK -->|Sim| DEFEND
    CHECK -->|Não| CALC
    DEFEND --> REVOTE
    REVOTE -->|Sim| VOTE
    REVOTE -->|Não| CALC
    CALC --> ORDER
    ORDER --> NEXT
    NEXT -->|Sim| SHOW
    NEXT -->|Não| END
    
    style BV fill:#e1f5ff,stroke:#0288d1
    style W fill:#fff4e1,stroke:#f57c00
    style CHECK fill:#ffebee,stroke:#c62828
    style ORDER fill:#e8f5e9,stroke:#388e3c
```

---

## 5. Workshops: Descoberta → Priorização → Estimativa

```mermaid
graph TB
    subgraph "Workshop 1: Descoberta"
        W1A[Coleta de ideias<br/>post-its individuais]
        W1B[Agrupamento<br/>por similaridade]
        W1C[Mapa mental<br/>com ramos]
        W1D[Transforma clusters<br/>em User Stories]
        W1E[10-20 histórias<br/>candidatas]
    end

    subgraph "Workshop 2: Priorização"
        W2A[Choque de foco<br/>história pela qual daria a vida]
        W2B[Poker BV<br/>Valor de Negócio]
        W2C[Backlog ordenado<br/>por valor]
        W2D[MVP definido]
    end

    subgraph "Workshop 3: Estimativa"
        W3A[Definition of Ready<br/>DoR check]
        W3B[Poker W<br/>Esforço]
        W3C[Quebra de épicos<br/>se necessário]
        W3D[Backlog pronto<br/>para Sprint]
    end

    W1A --> W1B
    W1B --> W1C
    W1C --> W1D
    W1D --> W1E
    W1E --> W2A
    W2A --> W2B
    W2B --> W2C
    W2C --> W2D
    W2D --> W3A
    W3A --> W3B
    W3B --> W3C
    W3C --> W3D

    style W1E fill:#e3f2fd,stroke:#1976d2
    style W2D fill:#fff3e0,stroke:#f57c00
    style W3D fill:#e8f5e9,stroke:#388e3c
```

---

## 6. Sprint Zero → Sprint 1 (Roadmap)

```mermaid
gantt
    title Sprint Zero → Sprint 1 (Roadmap)
    dateFormat YYYY-MM-DD
    
    section Sprint Zero
    Workshop 1: Descoberta           :w1, 2026-01-06, 2h
    Workshop 2: Priorização          :w2, after w1, 90min
    Workshop 3: Estimativa           :w3, after w2, 2h
    Setup ferramentas + DoR/DoD      :setup, after w3, 1d
    Product Backlog priorizado       :milestone, after setup, 0d
    
    section Sprint 1
    Planning A (com PO)              :planA, after setup, 90min
    Planning B (só Time)             :planB, after planA, 2h
    Execução Sprint 1                :exec1, after planB, 5d
    Daily Scrum (diário)             :daily, after planB, 5d
    Sprint Review                    :review, after exec1, 1h
    Sprint Retrospective             :retro, after review, 45min
    Incremento Funcional             :milestone, after retro, 0d
```

---

## 7. INVEST: Checklist de Qualidade da História

```mermaid
graph LR
    START([User Story])
    
    I{Independent?<br/>Não depende de 5 outras}
    N{Negotiable?<br/>Não é contrato rígido}
    V{Valuable?<br/>Valor pro cliente}
    E{Estimable?<br/>Dá pra estimar}
    S{Small?<br/>Cabe no Sprint}
    T{Testable?<br/>Critérios claros}
    
    PASS[✅ Pronto para<br/>Product Backlog]
    FAIL[❌ Refinar ou<br/>quebrar história]
    
    START --> I
    I -->|Não| FAIL
    I -->|Sim| N
    N -->|Não| FAIL
    N -->|Sim| V
    V -->|Não| FAIL
    V -->|Sim| E
    E -->|Não| FAIL
    E -->|Sim| S
    S -->|Não| FAIL
    S -->|Sim| T
    T -->|Não| FAIL
    T -->|Sim| PASS
    
    style PASS fill:#e8f5e9,stroke:#388e3c
    style FAIL fill:#ffebee,stroke:#c62828
```

---

## 8. Fluxo: História → Tarefas → Done → Aceito

```mermaid
flowchart TD
    PB[Product Backlog<br/>User Story]
    SP[Planning A<br/>História selecionada]
    TB[Planning B<br/>Quebra em tarefas]
    
    TD[To Do<br/>Tarefas]
    DO[Doing<br/>WIP limitado]
    DN[Done<br/>DoD técnico]
    
    REV[Review<br/>Demo funcional]
    AC[Aceito<br/>PO validou]
    
    PB -->|Planning A| SP
    SP -->|Planning B| TB
    TB -->|Tarefas criadas| TD
    TD -->|Time pega| DO
    DO -->|DoD completo| DN
    DN -->|Review| REV
    REV -->|PO aceita| AC
    REV -->|PO rejeita| TD
    
    style PB fill:#e1f5ff,stroke:#0288d1
    style SP fill:#fff4e1,stroke:#f57c00
    style AC fill:#e8f5e9,stroke:#388e3c
```

---

## 9. Proteção do Sprint (Papel do SM)

```mermaid
graph TB
    SPRINT[Sprint em Execução]
    
    REQ{Nova requisição<br/>chega?}
    PO_REQ[PO pede<br/>mudança?]
    DEV_IDEA[Dev tem<br/>ideia genial?]
    
    SM_BLOCK[SM bloqueia:<br/>Vai pro backlog]
    BACKLOG[Product Backlog<br/>Próximo Planning]
    
    SPRINT --> REQ
    REQ -->|História nova| SM_BLOCK
    REQ -->|PO pede| PO_REQ
    PO_REQ --> SM_BLOCK
    REQ -->|Dev ideia| DEV_IDEA
    DEV_IDEA --> SM_BLOCK
    SM_BLOCK --> BACKLOG
    
    style SPRINT fill:#fff4e1,stroke:#f57c00
    style SM_BLOCK fill:#ffebee,stroke:#c62828
    style BACKLOG fill:#e1f5ff,stroke:#0288d1
```

---

## 10. Burndown Chart (Visualização)

```mermaid
graph LR
    subgraph "Burndown Chart"
        DAY0[Dia 0<br/>20 pontos]
        DAY1[Dia 1<br/>18 pontos]
        DAY2[Dia 2<br/>18 pontos<br/>⚠️ Flat]
        DAY3[Dia 3<br/>15 pontos]
        DAY4[Dia 4<br/>10 pontos]
        DAY5[Dia 5<br/>5 pontos]
        DAY6[Dia 6<br/>0 pontos<br/>✅ Complete]
    end
    
    DAY0 --> DAY1
    DAY1 --> DAY2
    DAY2 -->|Impedimento<br/>resolvido| DAY3
    DAY3 --> DAY4
    DAY4 --> DAY5
    DAY5 --> DAY6
    
    style DAY2 fill:#fff3e0,stroke:#f57c00
    style DAY6 fill:#e8f5e9,stroke:#388e3c
```

---

**📊 Última Atualização:** 2026-01-05  
**👤 Autor:** UzzAI  
**📈 Versão:** 2.0  
**🔄 Uso:** Cole diretamente no Obsidian (suporte Mermaid nativo)

---

*Sistema: Diagramas Mermaid — Capítulos 5 e 6*  
*Framework: Visualizações Prontas para Uso*  
*Compatível com: Obsidian, GitHub, GitLab, Notion*
