---
created: 2026-01-06
updated: 2026-02-07T14:02
tags:
  - scrum
  - diagramas
  - mermaid
  - visual
---

# 🎨 Diagramas Mermaid — Scrum Cap. 7-8

## 📖 Como Usar Este Documento

Este arquivo contém **diagramas Mermaid prontos** para colar no Obsidian, Notion, ou qualquer ferramenta que suporte Mermaid.

**Formato**: todos os diagramas estão em **blocos de código mermaid**.

**Como usar no Obsidian:**
1. Copie o bloco de código
2. Cole em uma nota Obsidian
3. O diagrama renderiza automaticamente

**Como usar em outras ferramentas:**
- Notion: suporta Mermaid nativamente
- GitHub/GitLab: renderiza em Markdown
- Mermaid Live Editor: https://mermaid.live/ (editar e exportar PNG/SVG)

---

# 📍 DIAGRAMAS CAPÍTULO 7 — Cheiros do Scrum

## 📊 Diagrama 1: ScrumButt → Diagnóstico → Experimento → Melhoria

**Quando usar:** apresentar fluxo de correção contínua do Scrum.

```mermaid
flowchart TD
    A[🍑 ScrumButt Detectado] --> B{Rodar ScrumButt Test}
    B --> C[Checklist 8 itens SIM/NÃO]
    C --> D{Score < 6/8?}
    D -->|Sim| E[❌ ScrumButt confirmado]
    D -->|Não| F[✅ Scrum saudável - Manter]
    E --> G[Escolher 1 item NÃO crítico]
    G --> H[Criar Experimento do Sprint]
    H --> I[Definir Ações + Métricas]
    I --> J[Executar por 1 Sprint]
    J --> K{Métrica melhorou ≥30%?}
    K -->|Sim| L[✅ Manter mudança permanente]
    K -->|Não| M[⚠️ Ajustar ações]
    L --> N[Escolher próximo NÃO]
    M --> H
    N --> G
    F --> O[Revisar a cada 3-6 meses]
    O --> B

    style A fill:#ffcccc
    style E fill:#ffcccc
    style F fill:#ccffcc
    style L fill:#ccffcc
```

---

## 🦨 Diagrama 2: Fluxo de Detecção e Correção de Smells

**Quando usar:** Workshop "Nariz do Scrum" — mostrar fluxo da dinâmica.

```mermaid
flowchart TD
    A[🔍 Observar Sinais] --> B[Listar Cheiros Possíveis]
    B --> C[Votação Silenciosa - 2 votos/pessoa]
    C --> D[Identificar 2 Cheiros Mais Votados]
    D --> E[5 Porquês - Causa Raiz]
    E --> F{Causa Raiz Clara?}
    F -->|Sim| G[Definir Experimento]
    F -->|Não| E
    G --> H[Ações Concretas + Métricas]
    H --> I[Registrar Publicamente]
    I --> J[Executar por 1 Sprint]
    J --> K[Medir Métricas]
    K --> L{Melhorou?}
    L -->|Sim ≥30%| M[✅ Manter - Próximo Cheiro]
    L -->|Não < 30%| N[⚠️ Ajustar Experimento]
    L -->|Piorou| O[❌ Interromper - Analisar]
    M --> A
    N --> H
    O --> E

    style A fill:#e6f3ff
    style M fill:#ccffcc
    style O fill:#ffcccc
```

---

## 🐷🐔 Diagrama 3: Porcos vs Galinhas — Regras por Cerimônia

**Quando usar:** apresentar protocolo de participação.

```mermaid
flowchart LR
    subgraph Daily
        D1[🐷 Porcos FALAM]
        D2[🐔 Galinhas ASSISTEM]
        D3[❌ Galinhas NÃO falam]
    end

    subgraph Planning
        P1[🐷 Porcos ESTIMAM]
        P2[🐷 PO participa]
        P3[❌ Galinhas NÃO entram]
    end

    subgraph Review
        R1[🐷 Porcos DEMONSTRAM]
        R2[✅ Galinhas TESTAM]
        R3[✅ Galinhas DÃO FEEDBACK]
    end

    subgraph Retro
        RT1[🐷 Porcos PARTICIPAM]
        RT2[❌ Galinhas NÃO entram]
        RT3[Espaço seguro do time]
    end

    subgraph Refinement
        RF1[🐷 Porcos DISCUTEM]
        RF2[✅ Galinhas sob CONVITE]
        RF3[Esclarecer valor/uso]
    end

    style D1 fill:#ccffcc
    style D2 fill:#fff9cc
    style D3 fill:#ffcccc
    style P1 fill:#ccffcc
    style P3 fill:#ffcccc
    style R2 fill:#ccffcc
    style R3 fill:#ccffcc
    style RT2 fill:#ffcccc
    style RF2 fill:#ccffcc
```

---

## 🔗 Diagrama 4: Mapa Smells → Impacto em Previsibilidade

**Quando usar:** mostrar conexão entre cheiros e dados fake.

```mermaid
flowchart TD
    subgraph Smells
        S1[Sprint Variável]
        S2[Galinhas Interferindo]
        S3[Porcos Faltando]
        S4[Hábitos Persistentes]
        S5[Done Falso]
    end

    subgraph Impactos
        I1[Velocidade Não Estabiliza]
        I2[Burndown Serrilhado]
        I3[Estimativas Subestimadas]
        I4[WIP Alto - Nada Fecha]
        I5[Velocidade = Mentira]
    end

    subgraph Dados_Fake
        D1[📉 Velocidade Inútil]
        D2[📉 Burndown Fake]
        D3[📉 Commitment Irreal]
        D4[📉 Previsão Impossível]
    end

    S1 --> I1 --> D1
    S2 --> I2 --> D2
    S3 --> I3 --> D3
    S4 --> I4 --> D4
    S5 --> I5 --> D1

    D1 --> F[❌ Prazo Estoura]
    D2 --> F
    D3 --> F
    D4 --> F

    style S1 fill:#ffcccc
    style S2 fill:#ffcccc
    style S3 fill:#ffcccc
    style S4 fill:#ffcccc
    style S5 fill:#ffcccc
    style F fill:#ff6666
```

---

# 📊 DIAGRAMAS CAPÍTULO 8 — Estimativas e Velocidade

## 🃏 Diagrama 5: Fluxo Planning Poker Completo

**Quando usar:** treinar time em Planning Poker pela primeira vez.

```mermaid
flowchart TD
    A[📋 Preparação] --> A1[PO: Backlog priorizado]
    A1 --> A2[Time: Baralho Poker]
    A2 --> A3[SM: Facilita]

    A3 --> B[🎯 Escolher História Âncora]
    B --> B1[PO lê 5-8 histórias]
    B1 --> B2[Time escolhe 1 média]
    B2 --> B3[Fixar em 5 pontos]

    B3 --> C[📖 Estimar Histórias - Loop]

    C --> C1[PO lê história + valor]
    C1 --> C2[Time faz perguntas 1-2 min]
    C2 --> C3[Reflexão silenciosa 30s]
    C3 --> C4[Virar cartas SIMULTÂNEO]

    C4 --> D{Convergência?}
    D -->|Sim - diferença < 1 carta| E[Usar maioria ou média]
    D -->|Não - divergência grande| F[Extremos EXPLICAM]

    F --> F1[Maior: Por que? - Riscos]
    F1 --> F2[Menor: Por que? - Atalhos]
    F2 --> G[Discussão 2-3 min]
    G --> H[Re-votar]
    H --> D

    E --> I{Carta especial?}
    I -->|∞ Épico| J[Marcar para DECOMPOR]
    I -->|? Incerteza| K[Criar SPIKE]
    I -->|Número| L[Registrar Pontos]
    I -->|☕ Pausa| M[Descansar 10 min]

    J --> N[Próxima História]
    K --> N
    L --> N
    M --> N

    N --> O{Backlog Acabou?}
    O -->|Não| C1
    O -->|Sim| P[✅ Backlog Pontuado]

    P --> Q[Lista Épicos]
    P --> R[Lista Spikes]
    P --> S[Calcular Velocidade Estimada]

    style A fill:#e6f3ff
    style B3 fill:#ffeb99
    style E fill:#ccffcc
    style J fill:#ffcccc
    style K fill:#ffcc99
    style P fill:#ccffcc
```

---

## 🏎️ Diagrama 6: Pontos → Velocidade → Prazo → Investimento

**Quando usar:** explicar fluxo de estimativa para patrocinador.

```mermaid
flowchart LR
    A[📝 Backlog] --> A1[Planning Poker]
    A1 --> B[Story Points]

    B --> C[Sprint 1, 2, 3...]
    C --> D[Medir Done/Sprint]
    D --> E[Velocidade Média]

    E --> F[Pontos Totais ÷ Velocidade]
    F --> G[Nº de Sprints]

    G --> H[Sprints × Duração]
    H --> I[⏱️ Prazo em Semanas]

    I --> J{Previsão}
    J --> J1[Pessimista]
    J --> J2[Provável]
    J --> J3[Otimista]

    G --> K[Sprints × Custo/Sprint]
    K --> L[💰 Investimento]

    L --> M[+ Overhead 15%]
    M --> N[+ Margem 10%]
    N --> O[💵 Custo Total]

    I --> P[Recalibrar a cada Review]
    O --> P
    P --> Q[Previsão Atualizada]

    style B fill:#ffeb99
    style E fill:#99ccff
    style I fill:#ccffcc
    style O fill:#ffcc99
    style Q fill:#ccffcc
```

---

## 📈 Diagrama 7: Estabilização de Velocidade ao Longo dos Sprints

**Quando usar:** mostrar curva de aprendizado esperada.

```mermaid
%%{init: {'theme':'base'}}%%
graph TD
    subgraph Fase1[Fase 1: Instabilidade - Sprints 1-2]
        S1[Sprint 1: 18 pts]
        S2[Sprint 2: 15 pts]
        F1_DESC[Setup inicial<br/>Bloqueios<br/>Ajustes de processo]
    end

    subgraph Fase2[Fase 2: Estabilização - Sprints 3-5]
        S3[Sprint 3: 20 pts]
        S4[Sprint 4: 21 pts]
        S5[Sprint 5: 19 pts]
        F2_DESC[Velocidade começa a convergir<br/>Média: ~20 pts]
    end

    subgraph Fase3[Fase 3: Maturidade - Sprint 6+]
        S6[Sprint 6: 22 pts]
        S7[Sprint 7: 21 pts]
        S8[Sprint 8: 23 pts]
        F3_DESC[Velocidade estável<br/>Variação < 15%<br/>Previsão confiável]
    end

    S1 --> S2 --> S3 --> S4 --> S5 --> S6 --> S7 --> S8

    style S1 fill:#ffcccc
    style S2 fill:#ffcccc
    style S3 fill:#ffeb99
    style S4 fill:#ffeb99
    style S5 fill:#ffeb99
    style S6 fill:#ccffcc
    style S7 fill:#ccffcc
    style S8 fill:#ccffcc
```

---

## 🔄 Diagrama 8: Ciclo de Recalibração de Previsão

**Quando usar:** Sprint Review — mostrar fluxo de atualização.

```mermaid
flowchart TD
    A[Sprint Review] --> B[Medir Velocidade Real]
    B --> C[Atualizar Backlog Restante]
    C --> D[Recalcular Previsão]

    D --> E[Pontos Restantes ÷ Velocidade]
    E --> F[Nº Sprints Restantes]
    F --> G[Prazo Atualizado]
    G --> H[Investimento Atualizado]

    H --> I{Comparar com Previsão Anterior}
    I -->|Adiantando| J[✅ Dentro do Esperado]
    I -->|No Prazo| K[✅ Mantém Rota]
    I -->|Atrasando| L[⚠️ Ação Necessária]

    L --> M{Opções}
    M --> M1[Re-priorizar Backlog]
    M --> M2[Reduzir Escopo]
    M --> M3[Adicionar Recursos]
    M --> M4[Aceitar Atraso]

    M1 --> N[Apresentar para Patrocinador]
    M2 --> N
    M3 --> N
    M4 --> N

    J --> N
    K --> N

    N --> O[Decisão Tomada]
    O --> P[Próximo Sprint]
    P --> A

    style A fill:#e6f3ff
    style J fill:#ccffcc
    style K fill:#ccffcc
    style L fill:#ffcc99
    style N fill:#ffeb99
```

---

## 💰 Diagrama 9: Triângulo de Ferro — Trade-offs

**Quando usar:** negociar escopo/prazo/custo com patrocinador.

```mermaid
graph TD
    subgraph Triângulo[Triângulo de Ferro]
        A[⚖️ Qualidade]
        B[💰 Custo]
        C[⏱️ Tempo]
        D[📦 Escopo]

        A --- B
        B --- C
        C --- A

        A -.-> D
        B -.-> D
        C -.-> D
    end

    subgraph Scrum[Scrum: O que Fixamos]
        F1[✅ Tempo - Sprint Fixo]
        F2[✅ Qualidade - DoD Rigoroso]
        F3[🔒 Custo - Time Estável]
        F4[🔄 Escopo - FLEXÍVEL]
    end

    subgraph Waterfall[Waterfall Tradicional - Problema]
        W1[❌ Tenta fixar TUDO]
        W2[→ Qualidade cai]
        W3[→ Prazo estoura]
        W4[→ Custo cresce]
    end

    Triângulo --> Scrum
    Triângulo -.-> Waterfall

    style F1 fill:#ccffcc
    style F2 fill:#ccffcc
    style F3 fill:#ffeb99
    style F4 fill:#99ccff
    style W1 fill:#ffcccc
    style W2 fill:#ffcccc
    style W3 fill:#ffcccc
    style W4 fill:#ffcccc
```

---

## 🎯 Diagrama 10: Decisão de Fechamento de Pontuação no Poker

**Quando usar:** treinar time em como fechar estimativa após divergência.

```mermaid
flowchart TD
    A[Cartas Reveladas] --> B{Divergência?}

    B -->|Sim - Grande|C[Extremos Explicam]
    B -->|Não - Convergiu|D[Usar Maioria/Média]

    C --> E[Re-votar]
    E --> F{Convergiu?}

    F -->|Sim|D
    F -->|Não|G{Contexto?}

    G -->|Risco Alto|H[✅ Assumir MAIOR]
    G -->|História Conhecida|I[✅ Usar MÉDIA]
    G -->|Aprendizado|J[✅ Discutir até CONSENSO]

    H --> K[Número Final]
    I --> K
    J --> K
    D --> K

    K --> L{Carta Especial?}
    L -->|∞|M[Épico - DECOMPOR]
    L -->|?|N[Incerteza - SPIKE]
    L -->|Número|O[✅ Registrar]

    style H fill:#ffcc99
    style I fill:#ccffcc
    style J fill:#e6f3ff
    style M fill:#ffcccc
    style N fill:#ffeb99
    style O fill:#ccffcc
```

---

## 📊 Diagrama 11: Radar de Saúde do Scrum (Checklist Visual)

**Quando usar:** Retro ou Planning — avaliar saúde geral do Scrum.

```mermaid
flowchart TD
    subgraph Proteção_Sprint[✅ Proteção do Sprint]
        PS1[Sprint Fixo ≥ 3 ciclos?]
        PS2[% Interrupção < 10%?]
        PS3[PO Protege Time?]
    end

    subgraph Cerimônias[✅ Cerimônias Saudáveis]
        C1[Daily < 15 min?]
        C2[Planning: Time Estima?]
        C3[Review: Incremento Done?]
        C4[Retro: 1 Experimento?]
    end

    subgraph Transparência[✅ Transparência Real]
        T1[Burndown Atualizado?]
        T2[Velocidade Conhecida?]
        T3[Impedimentos Expostos?]
        T4[Board = Realidade?]
    end

    subgraph Auto_Org[✅ Time Auto-Organizado]
        AO1[Tarefas Pull System?]
        AO2[SM Facilita < 20% falas?]
        AO3[Time Resolve Problemas?]
        AO4[Zero Micro-gestão?]
    end

    subgraph Estimativas[✅ Estimativas Realistas]
        E1[Backlog Pontuado?]
        E2[Velocidade Estável?]
        E3[Previsão por Faixa?]
        E4[DoD Rigoroso?]
    end

    PS1 & PS2 & PS3 --> S1[Score Sprint]
    C1 & C2 & C3 & C4 --> S2[Score Cerimônias]
    T1 & T2 & T3 & T4 --> S3[Score Transparência]
    AO1 & AO2 & AO3 & AO4 --> S4[Score Auto-Org]
    E1 & E2 & E3 & E4 --> S5[Score Estimativas]

    S1 & S2 & S3 & S4 & S5 --> FINAL{Score Total}

    FINAL -->|> 80%|OK[✅ Scrum Saudável]
    FINAL -->|60-80%|MED[⚠️ Precisa Atenção]
    FINAL -->|< 60%|BAD[❌ Intervenção Urgente]

    style OK fill:#ccffcc
    style MED fill:#ffeb99
    style BAD fill:#ffcccc
```

---

## 🔄 Diagrama 12: Fluxo Completo Sprint (Cerimônias)

**Quando usar:** onboarding de novo membro do time.

```mermaid
flowchart LR
    subgraph Refinement[Refinement - Contínuo]
        R1[PO + Time]
        R2[Esclarecer Histórias]
        R3[Decompor Épicos]
        R4[Estimar Poker]
    end

    subgraph Planning[Sprint Planning - Início]
        P1[Definir Meta Sprint]
        P2[Selecionar Histórias]
        P3[Decompor em Tarefas]
        P4[Commitment]
    end

    subgraph Execução[Execução - Diária]
        D1[Daily 10-15 min]
        D2[Trabalho]
        D3[Update Board]
        D4[Colaboração]
    end

    subgraph Review[Sprint Review - Fim]
        RV1[Demonstrar Incremento]
        RV2[Feedback Stakeholders]
        RV3[Medir Velocidade]
        RV4[Recalibrar Previsão]
    end

    subgraph Retro[Sprint Retrospectiva - Fim]
        RT1[Inspecionar Processo]
        RT2[Adaptar]
        RT3[1 Experimento]
    end

    R1 --> R2 --> R3 --> R4
    R4 --> P1
    P1 --> P2 --> P3 --> P4
    P4 --> D1
    D1 --> D2 --> D3 --> D4
    D4 -.Sprint N dias.-> D1
    D4 --> RV1
    RV1 --> RV2 --> RV3 --> RV4
    RV4 --> RT1
    RT1 --> RT2 --> RT3
    RT3 --> R1

    style P4 fill:#ccffcc
    style D1 fill:#e6f3ff
    style RV1 fill:#ffeb99
    style RT3 fill:#ffcc99
```

---

## 🎓 Diagrama 13: Curva de Aprendizado — Scrum Smell → Melhoria

**Quando usar:** motivar time a persistir em experimentos.

```mermaid
flowchart TD
    A[Sprint 1-2: Caos Inicial] --> A1[Muitos Smells Detectados]
    A1 --> A2[Score ScrumButt: 3/8]

    A2 --> B[Sprint 3-4: Primeiros Experimentos]
    B --> B1[Corrigir 1 Smell por Sprint]
    B1 --> B2[Score: 5/8]

    B2 --> C[Sprint 5-8: Melhoria Contínua]
    C --> C1[Experimentos Funcionando]
    C1 --> C2[Score: 7/8]

    C2 --> D[Sprint 9+: Scrum Maduro]
    D --> D1[Score: 8/8]
    D1 --> D2[Manutenção + Ajustes Finos]

    subgraph Resultados[Benefícios Observados]
        R1[Velocidade Estável]
        R2[Previsibilidade Alta]
        R3[Time Confiante]
        R4[Stakeholders Satisfeitos]
    end

    D2 --> Resultados

    style A2 fill:#ffcccc
    style B2 fill:#ffeb99
    style C2 fill:#ccffcc
    style D1 fill:#66ff66
    style Resultados fill:#e6f3ff
```

---

## 📋 Diagrama 14: Definition of Done — Fluxo de Validação

**Quando usar:** explicar DoD para novo membro ou quando retrabalho > 15%.

```mermaid
flowchart TD
    A[História em Progresso] --> B{Código Escrito?}
    B -->|Não|A
    B -->|Sim|C{Testes Automatizados?}
    C -->|Não|B1[Escrever Testes]
    C -->|Sim|D{Code Review OK?}
    B1 --> C
    D -->|Não|D1[Ajustar Código]
    D -->|Sim|E{Integrado em Dev/Staging?}
    D1 --> C
    E -->|Não|E1[Integrar]
    E -->|Sim|F{Testado Manualmente?}
    E1 --> E
    F -->|Não|F1[Testar]
    F -->|Sim|G{Aceito pelo PO?}
    F1 --> F
    G -->|Não|G1[Ajustar]
    G -->|Sim|H{Sem Bugs Alta Severidade?}
    G1 --> F
    H -->|Não|H1[Corrigir Bugs]
    H -->|Sim|I{Doc Atualizada se necessário?}
    H1 --> H
    I -->|Não|I1[Atualizar Doc]
    I -->|Sim|J[✅ DONE]
    I1 --> I

    J --> K[Move para Coluna Done]
    K --> L[Conta para Velocidade]

    style A fill:#e6f3ff
    style J fill:#ccffcc
    style L fill:#66ff66
```

---

## 💡 Diagrama 15: Tipos de Intervenção por Smell (Mapa de Ação)

**Quando usar:** escolher intervenção adequada após detectar smell.

```mermaid
flowchart TD
    subgraph Smells_Graves[Smells Graves - Intervenção Imediata]
        SG1[Sprint Variável]
        SG2[Done Falso]
        SG3[Sem PO]
    end

    subgraph Smells_Médios[Smells Médios - Experimento 1 Sprint]
        SM1[Daily Longo]
        SM2[Galinhas Interferindo]
        SM3[WIP Alto]
    end

    subgraph Smells_Leves[Smells Leves - Ajuste Incremental]
        SL1[Burndown Serrilhado]
        SL2[Linguagem Individual]
        SL3[SM Fala Muito]
    end

    SG1 --> I1[Fixar Sprint por 3 ciclos]
    SG2 --> I2[DoD Rigoroso AGORA]
    SG3 --> I3[Escalar para Gestão]

    SM1 --> E1[Experimento: Timer + Parking Lot]
    SM2 --> E2[Experimento: Protocolo Porcos/Galinhas]
    SM3 --> E3[Experimento: WIP Limit]

    SL1 --> A1[Quebrar Histórias Menores]
    SL2 --> A2[Reforçar Daily = Time]
    SL3 --> A3[Rotacionar Facilitador]

    I1 & I2 & I3 --> R1[Revisar em 1 Sprint]
    E1 & E2 & E3 --> R2[Medir Métrica em 1 Sprint]
    A1 & A2 & A3 --> R3[Observar em 2-3 Sprints]

    style SG1 fill:#ff6666
    style SG2 fill:#ff6666
    style SG3 fill:#ff6666
    style SM1 fill:#ffcc99
    style SM2 fill:#ffcc99
    style SM3 fill:#ffcc99
    style SL1 fill:#ffeb99
    style SL2 fill:#ffeb99
    style SL3 fill:#ffeb99
```

---

## 📦 Como Usar Estes Diagramas

### Workflow Recomendado

1. **Apresentações:**
   - Copiar diagrama desejado
   - Colar em Obsidian (renderiza automaticamente)
   - Exportar para slides (via plugin ou screenshot)

2. **Documentação:**
   - Incluir diagramas em wiki do time
   - Referenciar em guias e playbooks

3. **Workshops:**
   - Projetar diagrama durante dinâmica
   - Explicar fluxo passo a passo
   - Usar como referência visual

4. **Editar/Customizar:**
   - Copiar código Mermaid
   - Editar em https://mermaid.live/
   - Exportar PNG/SVG para usar em ferramentas que não suportam Mermaid

---

## 🎨 Legenda de Cores (padrão usado)

- 🟢 **Verde (#ccffcc, #66ff66)**: Status positivo, sucesso, "Done", ação recomendada
- 🟡 **Amarelo (#ffeb99)**: Atenção, decisão necessária, estado intermediário
- 🟠 **Laranja (#ffcc99)**: Alerta moderado, precisa intervenção
- 🔴 **Vermelho (#ffcccc, #ff6666)**: Problema grave, red flag, falha
- 🔵 **Azul (#e6f3ff, #99ccff)**: Informação, contexto, processo normal

---

## 📚 Diagramas por Contexto de Uso

### Para Onboarding (novo membro)
- Diagrama 12: Fluxo Completo Sprint
- Diagrama 14: Definition of Done
- Diagrama 3: Porcos vs Galinhas

### Para Apresentação a Patrocinador
- Diagrama 6: Pontos → Velocidade → Prazo
- Diagrama 9: Triângulo de Ferro
- Diagrama 8: Ciclo de Recalibração

### Para Retro/Melhoria de Processo
- Diagrama 1: ScrumButt → Experimento
- Diagrama 2: Detecção de Smells
- Diagrama 11: Radar de Saúde
- Diagrama 13: Curva de Aprendizado

### Para Training de Planning Poker
- Diagrama 5: Fluxo Planning Poker
- Diagrama 10: Decisão de Fechamento
- Diagrama 7: Estabilização de Velocidade

---

*Diagramas Mermaid criados para UzzAI — Material visual para facilitar compreensão e alinhamento em Scrum.*
