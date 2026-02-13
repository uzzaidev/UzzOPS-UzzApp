---
created: 2026-01-06
updated: 2026-01-06T21:40
tags:
  - scrum
  - backlog
  - user-stories
  - dod
  - sprint-zero
  - velocidade
---

# 📘 Guia Scrum UzzAI - Parte 3: Backlog, User Stories e Produtividade (Cap. 9-12)

## 🗺️ Mapa Rápido (Navegação)

- **Cap. 9** — Product Backlog Refinement: processo contínuo, protótipo prematuro, mapa mental vivo
- **Cap. 9.3** — User Stories: INVEST/SMART, formatos (Cohn/5W2H/campos), template padrão
- **Cap. 10** — Definition of Done: 3 níveis (Done/Accepted/Release), evolução contínua
- **Cap. 11** — Sprint Zero: quando usar, backlog por buckets, saída mínima para Sprint 1
- **Cap. 12** — Velocidade vs Produtividade: baseline, métricas antes/depois, shock therapy
- **Refinamento contínuo** — backlog nasce alto nível, ganha detalhe conforme se aproxima do Sprint
- **Protótipo sem código** — validar entendimento antes de programar (papel, wireframe, encenação)
- **MVP first** — priorizar mínimo produto viável, evitar "funcionalite" (feature creep)
- **Release Burndown** — acompanhar versão por Sprint, recalibrar quando real ≠ planejado
- **Checklist de implantação** — 14 dias para operacionalizar PBR + DoD + métricas

---

## 📖 Glossário Rápido

| Termo | Definição Operacional |
|-------|----------------------|
| **Product Backlog Refinement (PBR)** | Processo contínuo de clarear, reduzir e otimizar o backlog. Itens próximos ganham detalhe; distantes ficam alto nível. |
| **Protótipo Prematuro** | Protótipo "barato" (papel, wireframe, encenação) criado cedo para validar entendimento SEM código. |
| **Mapa Mental Vivo** | Visualização do produto completo (features, ramos) sincronizada com backlog. Facilita negociação de escopo. |
| **Snapshot** | Versão salva do backlog/mapa mental quando escopo muda significativamente. Registra razão da mudança. |
| **User Story** | Descrição de funcionalidade do ponto de vista do usuário. Formato: "Como [ator], quero [objetivo], para [valor]". |
| **INVEST** | Independent, Negotiable, Valuable, Estimable, Small, Testable — critérios de qualidade para histórias. |
| **SMART** | Specific, Measurable, Achievable, Relevant, Time-boxed — critérios complementares. |
| **Épico** | História grande demais para 1 Sprint (carta ∞ no Planning Poker). Precisa ser decomposta. |
| **Critérios de Aceitação** | Condições que PO usa para aceitar história (formato Given/When/Then recomendado). |
| **Definition of Done (DoD)** | Checklist que define quando história está "pronta" tecnicamente (time). Evolui com maturidade. |
| **Definition of Accepted** | Critérios de aceitação do PO. História Done pode não ser Accepted se PO rejeitar. |
| **Release Done** | Conjunto de histórias + estabilidade + critérios de corte para release/versão. |
| **Sprint Zero** | Sprint preparatório (1-2 semanas) para acordos iniciais, ferramentas, DoD v1, backlog inicial. |
| **Velocidade** | Story Points entregues por Sprint (medida de throughput). |
| **Produtividade Real** | Valor percebido + entrega funcional + satisfação/ROI (não só "ir rápido"). |
| **Baseline** | Medição inicial (antes de Scrum) usada para comparar ganhos depois. |
| **MVP (Minimum Viable Product)** | Primeira versão que permite usuários começarem a usar e contribuir com feedback. |
| **Funcionalite** | Feature creep após MVP (adicionar features sem valor, depois do "ápice" do produto). |

---

# 📍 CAPÍTULO 9 — Product Backlog Refinement (PBR)

## 🧭 O que é PBR na Prática

### 📖 Definição Operacional

**Product Backlog Refinement (PBR)** é o processo **contínuo** de:
1. **Clarear** histórias próximas do Sprint (adicionar critérios, exemplos, testes)
2. **Reduzir** épicos em histórias menores (decompor)
3. **Otimizar** backlog (priorizar, remover duplicatas, consolidar)

**Regra de ouro**: backlog **não tenta ser perfeito no início**. Itens distantes ficam alto nível; itens próximos ganham detalhe conforme se aproximam do Sprint.

---

### 🎯 Por que Importa

**Problema sem PBR:**
- Planning vira "descoberta de requisitos" (demora 4h+)
- Histórias entram no Sprint ambíguas → retrabalho mid-Sprint
- Backlog vira "papel morto" (Sprint Backlog evolui, Product Backlog fica desatualizado)
- Perde-se visão de escopo total + histórico de decisões + base para Release Planning

**Benefício com PBR:**
- Planning rápida (1-2h) — itens já estão claros
- Menos surpresas no Sprint
- Visão de longo prazo mantida (Release Burndown funciona)
- Histórico de decisões preservado (snapshots)

---

### 📏 Métricas de Saúde do PBR

| Métrica | Como Medir | Threshold Saudável | Red Flag |
|---------|-----------|-------------------|----------|
| **% Itens Claros (próximo Sprint)** | Histórias do topo do backlog com critérios de aceitação + exemplos | > 80% | < 50% |
| **Retrabalho de Entendimento** | Histórias que mudam significativamente durante o Sprint | < 10% | > 25% |
| **Duração da Planning** | Tempo gasto em Planning | < 2h (Sprint 2 sem) | > 3h |
| **"Descobertas Críticas" mid-Sprint** | Requisitos importantes descobertos depois do Planning | < 2 por Sprint | > 5 |
| **Carry-over de Épicos** | Histórias grandes arrastadas por 2+ Sprints | 0 | > 2 |

---

### 🧪 Teste de Melhoria (2 Sprints)

Após implementar PBR contínuo:
- [ ] Planning dura ≤ 2h (antes: 3-4h)
- [ ] Retrabalho de entendimento cai ≥ 50%
- [ ] Time consegue estimar com mais confiança (divergência no Planning Poker < 30%)
- [ ] PO consegue priorizar melhor (menos "tudo é urgente")

---

## 🦨 Cheiro: Backlog Vira "Papel Morto"

### ✅ Sinais Observáveis

- [ ] Sprint Backlog evolui (novas tasks, sub-histórias), mas Product Backlog não reflete mudanças
- [ ] PO não sabe o "estado real" do backlog (desatualizado)
- [ ] Release Planning impossível (backlog não representa escopo total)
- [ ] Histórico de decisões perdido ("Por que removemos feature X?" → ninguém lembra)
- [ ] Backlog tem 100+ itens "velhos" que ninguém toca

### 🔎 Causa Raiz

- Time foca só no Sprint atual (visão curta)
- Falta ritual de atualização (refinamento esporádico ou ausente)
- Backlog em ferramenta separada do work diário (Jira vs Trello vs Notion → dessincronia)
- PO sobrecarregado (não tem tempo para manter backlog)

### 🛠️ Intervenção

**Curto prazo (1 Sprint):**
1. Criar ritual: **10-15 min no final da Daily de sexta** = PO + 1-2 devs atualizam backlog com aprendizados da semana
2. Após Sprint Review: **15 min dedicados** a atualizar backlog com feedback
3. Marcar itens "velhos" (> 3 meses sem toque) para revisão: manter ou deletar

**Estrutural (3 Sprints):**
1. Refinamento semanal fixo: 60-90 min, pauta definida (2-5 itens)
2. Backlog e Sprint board na mesma ferramenta (sincronização automática)
3. PO dedica 2-3h/semana para manutenção de backlog (não é "perda de tempo", é essencial)

---

## 🗺️ Mapa Mental Vivo + Snapshots

### 📖 O que é e Por que Funciona

**Mapa Mental** = visualização hierárquica do produto:
- Raiz: produto/goal
- Ramos principais: features/epics
- Sub-ramos: histórias

**Backlog** = lista linear priorizada derivada do mapa.

**Por que usar os dois:**
- Mapa mostra **todo** (visão holística)
- Backlog mostra **próximo** (execução)
- Mudança no mapa → atualiza backlog
- Mudança no backlog → reflete no mapa

**Snapshots** = versões salvas do mapa/backlog quando escopo muda significativamente.

**Por que snapshots:**
- Rastreabilidade: "O que mudou e por quê?"
- Negociação: "Se adicionar X, precisamos tirar Y — veja no snapshot que caberia Z"
- Aprendizado: "Feature A foi removida em Sprint 5 porque hipótese B não validou"

---

### ✅ Procedimento Prático

#### **Passo 1: Criar Mapa Mental Inicial (Sprint Zero ou Sprint 1)**

**Ferramentas:** Miro, Mural, Obsidian Canvas, MindMeister, papel/post-its

**Estrutura:**
```
[Produto: Nome]
├─ [Epic 1: Feature Principal]
│  ├─ História 1.1
│  ├─ História 1.2
│  └─ História 1.3
├─ [Epic 2: Outra Feature]
│  ├─ História 2.1
│  └─ História 2.2
└─ [Epic 3: Integrações]
   └─ História 3.1
```

**Exemplo (Jogo Tronos do livro):**
```
[Jogo Tabuleiro Mobile/Web]
├─ [Gameplay Base]
│  ├─ Movimentação peças
│  ├─ Captura por peões
│  ├─ Captura por outras peças
│  └─ Fim de jogo (rei capturado)
├─ [Tutorial/Onboarding]
│  ├─ Marca d'água movimentos
│  └─ Tutorial primeira vez
├─ [Social]
│  ├─ Convites
│  └─ Placar amigos
└─ [Infraestrutura]
   ├─ Backend API
   └─ Deploy mobile/web
```

---

#### **Passo 2: Derivar Backlog do Mapa**

Percorrer mapa de cima para baixo (ou por prioridade de valor) e listar histórias:

```
Backlog (priorizado por valor):
1. Movimentação peças (Epic: Gameplay Base) — 8 pts
2. Captura por peões (Epic: Gameplay Base) — 5 pts
3. Marca d'água movimentos (Epic: Tutorial) — 3 pts
4. Tutorial primeira vez (Epic: Tutorial) — 5 pts
5. Captura outras peças (Epic: Gameplay Base) — 8 pts
6. Fim de jogo (Epic: Gameplay Base) — 5 pts
7. Backend API (Epic: Infraestrutura) — 13 pts
...
```

---

#### **Passo 3: Sincronizar Mapa + Backlog (Refinamento Contínuo)**

**Frequência:** toda mudança significativa (nova feature, épico removido, prioridade invertida)

**Checklist:**
- [ ] Mudança no backlog → atualizar mapa
- [ ] Mudança no mapa → atualizar backlog
- [ ] Marcar data da última sincronização

---

#### **Passo 4: Criar Snapshot Quando Escopo Mudar**

**Quando criar:**
- Épico grande adicionado
- Feature removida
- Prioridade de release mudou (ex.: "vamos antecipar Social para MVP")
- Patrocinador pediu mudança grande

**Formato do Snapshot (Markdown):**

```markdown
## Snapshot Sprint [N] — [Data]

### Razão da Mudança
[Ex.: Cliente pediu feature "Placar Amigos" para MVP. Decidimos antecipar Epic Social.]

### Impacto
- **Adicionado:** Epic Social (15 pts) → entra antes de Infraestrutura avançada
- **Removido:** nada
- **Re-priorizado:** Backend API reduzido ao mínimo (só o essencial para MVP)

### Trade-off
- **Ganhamos:** feature diferencial (social) no MVP
- **Perdemos:** deploy avançado fica para pós-MVP

### Backlog Total Antes/Depois
- Antes: 180 pts (MVP em ~9 Sprints)
- Depois: 195 pts (MVP em ~10 Sprints, mas com Social)

### Aprovado por
PO + Patrocinador (reunião 06/01/2026)
```

**Onde salvar:** pasta `Snapshots/` no repositório ou Confluence/Notion

---

### 📏 Métricas de Mapa Mental + Snapshots

| Métrica | Como Medir | Threshold Saudável |
|---------|-----------|-------------------|
| **Sincronização Mapa-Backlog** | Última data de atualização | < 1 semana |
| **Snapshots criados** | Quantidade por trimestre | 2-4 (mudanças controladas) |
| **Variação de escopo** | Δ Story Points totais entre Snapshots | ±20% (estável) |
| **Features removidas vs adicionadas** | Ratio por Sprint | ~1:1 (balanceado) |

---

## 🛠️ Protótipo Prematuro (Motor do Refinamento)

### 📖 Definição Operacional

**Protótipo Prematuro** = protótipo "barato" criado **cedo** (até no Sprint 1) para:
1. **Validar entendimento** (PO, time, stakeholder alinham visão)
2. **Criar linguagem comum** (menos abstração, mais "tocável")
3. **Refinar backlog** (identificar épicos, dependências, novas histórias)

**Regra de ouro do capítulo:**
> **Sem programação no Sprint do protótipo**, se o objetivo é alinhar entendimento. (Evitar "codar no escuro".)

---

### 🎯 Tipos de Protótipo (Sem Código)

| Tipo | Quando Usar | Exemplo | Custo (tempo) |
|------|-------------|---------|---------------|
| **Papel** | Validar fluxo/navegação | Wireframes desenhados, usuário "clica" com dedo | Horas |
| **Encenação/Role Play** | Validar interação/conversa | Pessoa faz papel de chatbot, outra de usuário | Horas |
| **Storyboard** | Validar jornada do usuário | Quadros tipo HQ mostrando passos | 1-2 dias |
| **Wireframe Digital** | Validar UI sem design final | Figma/Balsamiq clickável | 1-3 dias |
| **Mágica Humana** | Simular IA/automação | Pessoa executa manualmente o que IA faria | Horas |
| **Vídeo/GIF** | Validar animação/transição | Screen recording de flow simulado | 1 dia |

---

### 📊 Exemplo do Livro: Jogo dos Tronos (Protótipo de Papel)

**Contexto:**
- Backlog inicial: jogo tabuleiro mobile/web, peças com movimentos distintos, tutorial mínimo
- Referência: Candy Crush (padrões de UI/UX)

**Sprint 1 (protótipo):**
- **Output:** protótipo de papel + alguém faz papel da IA
- **Elementos testados:**
  - Marca d'Água (overlay mostrando movimentos possíveis da peça)
  - Tutorial (aparece só na primeira vez; depois sob demanda)
  - Regras de captura (cercar vs ocupação)

**O que isso gerou:**
- ✅ Requisitos "tocáveis" (time viu, não imaginou)
- ✅ Melhoraram User Stories (ex.: separar "captura por peões" vs "captura por outras peças")
- ✅ Identificaram épicos (ex.: "jogo social", "convidar amigos" virou novo Epic)
- ✅ Criaram novas histórias não previstas

**Insight:** Sprint entregou "incremento funcional" SEM código — funcionalidade do Sprint era **aprendizado validado**.

---

### ✅ Como Executar Protótipo Prematuro (Passo a Passo)

#### **Antes do Sprint do Protótipo**

1. **Definir objetivo claro** (ex.: "Validar fluxo de cadastro" ou "Entender regras de jogo")
2. **Escolher tipo de protótipo** (papel, wireframe, encenação — ver tabela acima)
3. **Preparar materiais** (papel, canetas, Figma, roteiro de encenação)
4. **Convidar participantes** (PO obrigatório, 1-2 usuários reais se possível, time dev)

---

#### **Durante o Sprint do Protótipo**

**Sprint Backlog (exemplo):**
- [ ] Criar protótipo de papel (2 dias)
- [ ] Rodar sessão de teste com PO + 2 usuários (1 dia)
- [ ] Coletar feedback estruturado (post-its: gostei/falta/confuso/risco) (meio dia)
- [ ] Atualizar mapa mental + backlog com aprendizados (meio dia)
- [ ] Preparar demo do protótipo para Sprint Review (meio dia)

**Daily foca em:** "O protótipo está validando o que precisamos?" não "Quanto código escrevemos?"

---

#### **Sprint Review do Protótipo**

**Demo:**
- Mostrar protótipo funcionando (papel, wireframe, encenação ao vivo)
- Explicar O QUE validamos (hipóteses confirmadas/rejeitadas)
- Mostrar MUDANÇAS no backlog resultantes do protótipo

**Feedback de stakeholders:**
- Coletar em post-its/formulário
- Classificar: "adicionar ao backlog" vs "nice to have" vs "não faz sentido"

**Saída obrigatória:**
- [ ] Backlog refinado (5-15 histórias com critérios claros)
- [ ] Épicos identificados (marcados para decomposição)
- [ ] Spikes identificados (incertezas técnicas)
- [ ] Snapshot do backlog ANTES vs DEPOIS do protótipo

---

### 📏 Métricas do Protótipo Prematuro

| Métrica | Como Medir | Sucesso |
|---------|-----------|---------|
| **Decisões de Escopo Tomadas** | Número de itens adicionados/removidos/alterados após protótipo | ≥ 10 |
| **Itens Refinados** | Histórias que ganharam critérios de aceitação após review do protótipo | ≥ 5 |
| **Redução de Incerteza** | Itens com "?" (spike) antes vs depois | Redução ≥ 50% |
| **Qualidade de Estimativa** | Divergência no Planning Poker no Sprint seguinte | < 30% (convergência maior) |
| **Satisfação do PO** | PO consegue priorizar melhor depois? (escala 1-5) | ≥ 4 |

---

### 🧪 Teste de Sucesso do Protótipo

Após Sprint Review do protótipo:
- [ ] PO prioriza backlog com mais confiança (menos "tudo é urgente")
- [ ] Time estima próximas histórias com menos divergência (Planning Poker converge mais rápido)
- [ ] Stakeholders entendem produto (menos "não era isso que eu imaginava")
- [ ] Backlog tem critérios de aceitação em ≥ 80% das histórias do próximo Sprint

---

### ⚠️ Erros Comuns com Protótipo Prematuro

| Erro | Consequência | Correção |
|------|-------------|----------|
| ❌ **"Protótipo" é código funcional** | Gastar Sprint codando, não validando | Sem código! Papel, wireframe, encenação. |
| ❌ **Protótipo vira entrega final** | Time se apega, não refatora depois | Deixar claro: "isso é descartável, valida entendimento". |
| ❌ **Não coletar feedback estruturado** | Feedback vago ("gostei") sem ação | Usar post-its: gostei/falta/confuso/risco + priorizar. |
| ❌ **Não atualizar backlog depois** | Protótipo não gera valor (backlog desatualizado) | Sprint Review OBRIGATÓRIO: mostrar backlog antes/depois. |
| ❌ **Stakeholder não participa** | Feedback vem tarde, retrabalho | Convidar 1-2 usuários reais + patrocinador para review. |

---

## 🎯 As "Atitudes" do Refinamento (Checklist Operacional)

### 1️⃣ Escrever/Melhorar User Stories

#### ✅ Como Executar

**Quando:** após cada Sprint Review + refinamento semanal

**Passos:**
1. Histórias tocadas pelo feedback da Review → atualizar
2. Adicionar **critérios de aceitação** (formato Given/When/Then)
3. Adicionar **exemplos** (pelo menos 1 positivo e 1 negativo)
4. Verificar INVEST (ver seção 9.3 abaixo)

#### Template Mínimo por História

```markdown
## História: [Nome Curto]

**Como** [persona]
**Quero** [ação]
**Para** [valor de negócio]

**Critérios de Aceitação:**
- Dado que [contexto]
- Quando [ação]
- Então [resultado esperado]

**Exemplos:**
✅ Positivo: [cenário que deve funcionar]
❌ Negativo: [cenário que deve rejeitar/avisar]

**Notas:** [riscos, dependências, assumptions]
```

#### 📏 Métrica

| Métrica | Threshold |
|---------|-----------|
| % histórias do próximo Sprint com critérios claros | > 80% |

---

### 2️⃣ Reduzir Histórias e Quebrar Épicos

#### ✅ Como Executar

**Regra:** Se não cabe em 1 Sprint → é épico → dividir em capítulos que entreguem valor por si.

**Heurística para dividir:**
- Se tem "**E**" ou "**OU**" de regras diferentes → quase sempre é épico
- Se muda **regra de negócio** → separa
- Se muda **condição de vitória/fim** → separa
- Se tem **mais de 3 critérios de aceitação complexos** → considerar dividir

**Exemplo (do livro):**

**Épico original:** "Captura de peças + fim de jogo"

**Decomposição:**
1. História: "Captura por peões (cercar)"
2. História: "Captura por outras peças (ocupação)"
3. História: "Fim de jogo (captura do rei)"

#### ⚠️ Anti-padrão

❌ Colocar **tasks técnicas** no Product Backlog (ex.: "Criar tabela no banco", "Configurar CI/CD")

**Por quê:** vira "grego" para PO/patrocinador. Backlog = **valor de negócio** (linguagem do usuário).

**Onde vão tasks técnicas:** Sprint Backlog (decomposição interna do time durante Planning).

#### 📏 Métrica

| Métrica | Threshold |
|---------|-----------|
| Carry-over (histórias arrastadas 2+ Sprints) | 0 |
| Épicos (∞) detectados cedo | ≥ 2 por refinamento (bom sinal) |

---

### 3️⃣ Definição Clara de Pronto/Aceito/Entregue

(Ver Cap. 10 completo abaixo — aqui só overview)

**Pronto (Done):** time considera tecnicamente pronto (testado, integrado, code review)

**Aceito (Accepted):** PO aprova (critérios de aceitação atendidos)

**Entregue (Release Done):** conjunto de histórias + estabilidade + deploy em produção

**Ação no Refinamento:**
- Revisar DoD quando PO rejeita história (faltou algo no Done?)
- Garantir que critérios de aceitação são **verificáveis** (não subjetivos)

---

### 4️⃣ "Olhar Nerd" sem Poluir Backlog

#### ✅ Como Executar

**O que é:** Time faz check técnico interno das histórias **sem mudar a linguagem de valor no backlog**.

**Check técnico (interno do time):**
- [ ] Dependências externas (APIs, serviços de terceiros)
- [ ] Riscos de integração (autenticação, tokens, CORS)
- [ ] Necessidade de biblioteca/tooling nova
- [ ] Complexidade algorítmica (performance crítica?)
- [ ] Segurança (dados sensíveis, OWASP top 10)

**Se houver incerteza alta → criar Spike** (tarefa de pesquisa/PoC timeboxed).

#### ⚠️ Regra de Reuniões de Refinamento

- Não podem **interferir no Sprint em andamento** (não tirar dev de task do Sprint)
- Objetivo específico (máximo 2-3 itens)
- Duração curta (≤ 2h)
- Poucas galinhas (só quem destrava entendimento)

#### 📌 Protocolo Recomendado

| Tipo | Duração | Quando | Participantes |
|------|---------|--------|---------------|
| **Refinamento leve na Review** | 10-15 min | Final de Sprint Review | Todos (porcos + galinhas) |
| **Refinamento específico** | 60-120 min | Meio da semana | PO + 2-3 devs + SM (galinhas sob convite) |

---

### 5️⃣ MVP + Planejamento de Versões

#### ✅ Como Executar

**Objetivo:** priorizar itens que levam ao **MVP** (mínimo produto viável) e aplicar "dizer não" para o resto.

**Heurística prática (do livro):**
- **MVP** = "bacana mas faltam coisas" (motiva feedback, usuários toleram gaps)
- **Cuidado com "funcionalite"** (feature creep pós-ápice) — adicionar features sem valor

**Perguntas para cada item do backlog:**
1. Isso é **essencial** para MVP? (sem isso, produto não funciona mínimo?)
2. Isso **reduz risco de adoção**? (ajuda usuário a entender/começar?)
3. Isso **aumenta complexidade sem aumentar valor**? (nice-to-have que atrasa MVP?)

**Decisão:**
- **Entra no MVP:** prioridade alta
- **Entra depois (v2):** backlog, baixa prioridade
- **Não entra:** remove do backlog (ou move para "ideias futuras")

#### 📏 Métrica

| Métrica | Como Medir | Threshold |
|---------|-----------|-----------|
| Features adicionadas vs removidas | Ratio por Sprint | ~1:1 (balanceado) |
| Inflação de escopo | Δ Story Points do MVP entre Sprints | < 10% (estável) |

#### 🧪 Teste

Após 3 Sprints focando em MVP:
- [ ] Backlog tem clara separação: "MVP" vs "Pós-MVP"
- [ ] PO rejeita features não-MVP sem culpa
- [ ] Escopo do MVP está estável (±10% variação)

---

### 6️⃣ Release Burndown

#### 📖 O que é

**Release Burndown** = gráfico de pontos restantes ao longo dos Sprints (para release/versão específica).

**Eixo X:** Sprints
**Eixo Y:** Story Points restantes

**Linha ideal:** diagonal do total de pontos até zero

**Linha real:** pontos restantes após cada Sprint

---

#### 📊 Exemplo Numérico

**Contexto:**
- Release MVP: 180 pontos
- Velocidade estimada: 20 pontos/Sprint
- Sprints planejados: 180 ÷ 20 = 9 Sprints

**Burndown:**

| Sprint | Committed | Done | Pontos Restantes | Linha Ideal |
|--------|-----------|------|------------------|-------------|
| 0 | - | - | 180 | 180 |
| 1 | 25 | 18 | 162 | 160 |
| 2 | 22 | 20 | 142 | 140 |
| 3 | 23 | 22 | 120 | 120 |
| 4 | 24 | 15 | 105 | 100 ⚠️ |
| 5 | 22 | 23 | 82 | 80 |
| 6 | 23 | 22 | 60 | 60 |
| 7 | 22 | 21 | 39 | 40 |
| 8 | 20 | 20 | 19 | 20 |
| 9 | 19 | 19 | 0 | 0 ✅ |

**Análise:**
- Sprint 4: atrasou (linha real > ideal) → **ação:** PO re-prioriza ou aceita atrasar 1 Sprint
- Sprint 5-9: recuperou (linha real converge para ideal)

---

#### 📏 Métrica Chave

| Métrica | Como Medir | Ação se Red Flag |
|---------|-----------|-----------------|
| **Planned vs Delivered** | Points comprometidos vs pontos Done por Sprint | Se diferença > 30% por 2 Sprints: recalibrar |
| **Tendência da linha real** | Real convergindo para ideal? | Se divergindo: re-priorizar ou estender prazo |
| **Velocidade média** | Média móvel (últimos 3 Sprints) | Recalcular Sprints restantes |

---

#### 🧪 Teste de Recalibração

Após recalibração (Sprint 4 no exemplo):
- [ ] Linha real converge para ideal nos próximos 2 Sprints
- [ ] PO renegociou escopo OU aceitou prazo estendido (decisão explícita)
- [ ] Patrocinador foi informado (transparência)

---

## 🎯 Dinâmicas Replicáveis do Cap. 9

### Dinâmica 1: "Refine com Protótipo" (60-90 min)

**Objetivo:** transformar feedback do protótipo em backlog refinado + prioridades.

**Ver Playbooks_Dinamicas_Cap9-12.md para roteiro completo.**

### Dinâmica 2: "Refinamento Cirúrgico (2-3 itens)" (45-75 min)

**Objetivo:** destravar histórias críticas sem estourar energia do time.

**Regras:**
- Máximo 3 itens
- Duração curta
- Poucas galinhas (só quem destrava)

### Dinâmica 3: "MVP ou Funcionalite?" (30-45 min)

**Objetivo:** evitar inflar release com features desnecessárias.

**Perguntas:**
- Isso é essencial para MVP?
- Isso reduz risco de adoção?
- Isso aumenta complexidade sem aumentar valor?

**Output:** decisão explícita "entra agora / entra depois / não entra".

---

# 📝 CAPÍTULO 9.3 — User Stories (Formatos e Qualidade)

## 🧭 Insight Central: Repertório + Energia = Criatividade

**Mensagem do capítulo (Zeus + Mnemosine):**

Em empresas "mistas" (metade ágil, metade tradicional), você ganha muito **reaproveitando formatos já usados** (ex.: 5W2H) ao invés de impor template novo "do nada".

**Diretriz prática:**
1. Aproveite repertório existente da empresa
2. Padronize o mínimo necessário
3. Refine com o tempo (especialmente via Sprint Zero)



 
## ✅ O que uma User Story Precisa Cumprir

### 📖 Objetivo

Comunicar **claramente** algo que:
1. **Cabe num Sprint** (Small + Time-boxed)
2. **É testável/aceitável** (Testable + Specific)
3. **Tem valor** (Valuable — PO entende sem "detalhe técnico")

---

### 🧩 INVEST — Critérios de Qualidade

| Critério | Significado | Teste Prático | Exemplo de Falha |
|----------|-------------|---------------|------------------|
| **I — Independent** | História pode ser desenvolvida independente de outras (ordem flexível) | Trocar ordem no backlog não quebra Sprint | "História A depende 100% de B estar pronta" |
| **N — Negotiable** | Detalhes podem ser negociados (não é contrato fixo) | PO e time discutem "como fazer" durante Planning | "História especifica tecnologia: DEVE usar MySQL" |
| **V — Valuable** | Entrega valor ao usuário/negócio | PO consegue explicar "por quê isso importa" | "Refatorar código legado" (valor técnico, não negócio) |
| **E — Estimable** | Time consegue estimar (mesmo que com incerteza) | Planning Poker converge (diferença < 2 cartas) | "Integrar com API desconhecida" → spike necessário |
| **S — Small** | Cabe em 1 Sprint | Story Points ≤ 13 (ou equivalente para o time) | História de 21+ pontos (épico) |
| **T — Testable** | Critérios de aceitação claros e verificáveis | PO consegue testar e dizer "aceito" ou "não aceito" | "Interface deve ser bonita" (subjetivo) |

---

### 🎯 SMART — Critérios Complementares

| Critério | Significado | Tradução Prática |
|----------|-------------|-----------------|
| **S — Specific** | Específico (não vago) | Critérios de aceitação claros |
| **M — Measurable** | Mensurável (dá para verificar) | Testável (INVEST.T) |
| **A — Achievable** | Alcançável (cabe no Sprint) | Small (INVEST.S) |
| **R — Relevant** | Relevante (tem valor) | Valuable (INVEST.V) |
| **T — Time-boxed** | Tem prazo (cabe no Sprint) | Small (INVEST.S) |

**Conclusão:** SMART reforça INVEST. Use **INVEST como primário** (mais específico para Scrum).

---

## 🔎 Exemplo do Capítulo: "Captura de Peças" (Como Refinar de Verdade)

### 📖 Story Original (Épico Disfarçado)

```
Como jogador, quero capturar peças do oponente
para ganhar o jogo.
```

**Problema:**
- Mistura 2 regras diferentes (captura por peões ≠ captura por outras peças)
- Mistura gameplay e fim de jogo
- Falha no **S (Specific)** → vago demais

---

### ✅ Técnica: Separar por Comportamento/Regra

**História 1:**
```
Como jogador, quero capturar peões do oponente cercando-os
para reduzir peças dele no tabuleiro.

Critérios de Aceitação:
- Dado que peão inimigo está cercado por meus peões
- Quando não há casas livres adjacentes para ele mover
- Então peão inimigo é capturado e removido do tabuleiro

Exemplo:
✅ Peão branco em D4, cercado por peões pretos em C4, D3, D5, E4 → capturado
❌ Peão branco em D4, cercado mas tem casa livre em C3 → NÃO capturado
```

**História 2:**
```
Como jogador, quero capturar peças do oponente ocupando a casa dele
para reduzir peças dele no tabuleiro.

Critérios de Aceitação:
- Dado que movo minha peça para casa ocupada por peça inimiga
- Quando movimento é válido para minha peça
- Então peça inimiga é capturada e removida

Exemplo:
✅ Torre branca move para D4 (ocupado por bispo preto) → bispo capturado
❌ Peão branco tenta mover para D5 (diagonal ocupada, movimento inválido) → NÃO captura
```

**História 3:**
```
Como jogador, quero capturar o rei do oponente
para vencer o jogo.

Critérios de Aceitação:
- Dado que rei inimigo foi capturado
- Quando última peça capturada é o rei
- Então jogo termina e eu sou declarado vencedor

Exemplo:
✅ Capturo rei preto → "Jogador Branco venceu!"
```

---

### 📌 Heurística para Dividir Épicos

Use estas perguntas:

| Pergunta | Se SIM → Dividir |
|----------|------------------|
| História tem "**E**" ou "**OU**" de regras diferentes? | ✅ Épico |
| Muda **regra de negócio**? | ✅ Separa |
| Muda **condição de vitória/fim**? | ✅ Separa |
| Tem **mais de 3 critérios de aceitação complexos**? | ✅ Considerar dividir |
| Estimativa > 13 pontos? | ✅ Épico |
| Time tem **divergência alta** no Planning Poker (∞ vs 3)? | ✅ Provavelmente épico ou spike |

---

## 🧩 Formatos Possíveis de User Story

### 📋 Quando Usar Cada Formato

| Formato | Contexto | Prós | Contras | Risco |
|---------|----------|------|---------|-------|
| **Cohn Minimalista** | Time maduro, Scrum fluindo | Rápido, foco em valor | Pode ser vago para iniciantes | Time imaturo não sabe detalhar |
| **Campos (Story/Descrição/Teste/Aceite)** | Time iniciante ou muito ruído | Clareza explícita | Burocrático para time maduro | Virar waterfall (especificação excessiva) |
| **5W2H Adaptado** | Empresa já usa 5W2H (reduzir fricção cultural) | Aproveita repertório | Pode poluir com "Como?" (decisão do time) | Micro-gestão (PO especificar solução técnica) |

---

### 1️⃣ Formato Cohn (Padrão Scrum)

**Estrutura:**
```
Como [ator/persona],
quero [objetivo/ação],
para [valor de negócio].
```

**Exemplo:**
```
Como usuário final,
quero resetar minha senha via email,
para recuperar acesso à conta sem contatar suporte.
```

**✅ Use quando:** time já está "fluindo" em Scrum (maduro, confia no formato).

---

### 2️⃣ Formato "Descritivo" com Campos

**Estrutura:**
```
User Story: [Nome curto]
Descrição: [Detalhamento]
Testes: [Como validar]
Aceitação: [Critérios]
```

**Exemplo:**
```
User Story: Resetar senha via email

Descrição:
Usuário que esqueceu senha pode solicitar reset. Sistema envia email com link temporário (válido 1h). Usuário clica, define nova senha.

Testes:
- Teste 1: Email chega em < 2 min
- Teste 2: Link expira após 1h
- Teste 3: Senha antiga não funciona mais

Aceitação:
- Email enviado com sucesso
- Link funciona e abre tela de nova senha
- Senha alterada e usuário consegue logar
```

**✅ Use quando:** equipe precisa de **clareza explícita** (iniciante, muitos mal-entendidos).

---

### 3️⃣ Formato 5W2H Adaptado

**5W2H completo:**
- What (O quê)
- Why (Por quê)
- Who (Quem)
- When (Quando)
- Where (Onde)
- How (Como)
- How much (Quanto)

**Adaptação para Scrum (tirando os Hs):**
```
Como <Who: quem> <When: quando> <Where: onde>,
quero <What: o quê>,
<Why: por quê>.
```

**Por que tirar os Hs:**
- **How (Como)?** → decisão da equipe (Sprint Backlog), não do PO
- **How much (Quanto)?** → negociação de custo/prazo (Cap. 8), não da história

**Exemplo:**
```
Como usuário logado no app mobile às 22h (fora do horário comercial),
quero resetar minha senha,
para recuperar acesso sem esperar atendimento.
```

**✅ Use quando:** empresa já usa 5W2H e você quer **reduzir fricção cultural**.

**⚠️ Risco:** PO especificar "Como" (solução técnica) e virar waterfall.

---

### 📌 Decisão Rápida

| Situação | Formato Recomendado |
|----------|---------------------|
| Time iniciante + muito ruído | Campos (Story/Descrição/Teste/Aceite) |
| Empresa usa 5W2H tradicionalmente | 5W2H adaptado (sem Hs) |
| Time maduro + Scrum fluindo | Cohn minimalista |
| Time misto (juniores + seniors) | Cohn + critérios de aceitação explícitos |

---

## 📌 Template Padrão Recomendado (Pronto para Obsidian)

```markdown
## História: [Nome Curto e Descritivo]

**Como** [ator/persona]
**Quero** [objetivo/ação]
**Para** [valor de negócio]

---

### Critérios de Aceitação

- **Dado que** [contexto/pré-condição]
- **Quando** [ação do usuário]
- **Então** [resultado esperado]

*(Repetir para cada cenário)*

---

### Exemplos

✅ **Caso Positivo:**
[Cenário que deve funcionar — dados concretos]

❌ **Caso Negativo:**
[Cenário que deve rejeitar/avisar — dados concretos]

---

### Notas de Refinamento

**Riscos:**
[Ex.: Dependência de API de terceiro — SLA 99%]

**Assumptions:**
[Ex.: Assumimos que usuário tem email válido cadastrado]

**Dependências:**
[Ex.: História "Cadastro de usuário" precisa estar Done]

---

### Teste/Validação

**Tipo:** [ ] Automatizado | [ ] Manual | [ ] Role Play

**Como validar:**
[Ex.: Rodar suite de testes de integração + teste manual em staging]

---

**Story Points:** [X]
**Prioridade:** [Alta/Média/Baixa]
**Sprint:** [Número ou "Backlog"]
```

---

# ✅ CAPÍTULO 10 — Definition of Done (DoD)

## 🧭 Mapa Rápido

- **Requisitos mudam, mas "pronto" precisa ser acordo estável**
- **"Pronto" existe em camadas:** Done (time), Accepted (PO), Release Done (versão)
- **PO rejeita história → sinal de DoD fraco** (faltou acordo no "pronto")
- **DoD evolui com o time:** automação substitui itens manuais (ex.: lint, CI)

---

## 📖 O que "Pronto" Significa no Scrum

### 🎯 Por que Precisa ser Definido

**Problema sem DoD:**
- "Pronto" vira subjetivo ("90% pronto", "quase pronto", "só falta ajuste fino")
- História parece Done mas quebra em integração
- Velocidade vira mentira (conta Done falso)
- Retrabalho explode (bugs voltam)

**Benefício com DoD:**
- Acordo explícito (time sabe quando parar)
- PO sabe o que esperar (reduz rejeição)
- Velocidade confiável (Done é Done mesmo)
- Menos débito técnico (qualidade embutida)

---

### 📌 Três Níveis de "Pronto"

| Nível | Quem Valida | Evidência | Momento | Armadilha |
|-------|-------------|-----------|---------|-----------|
| **1. Done (Time)** | Time dev | Passou no DoD técnico (testes, code review, integrado) | Durante Sprint (daily) | "Done" mas não testou integração → quebra |
| **2. Accepted (PO)** | Product Owner | Atende critérios de aceitação + demo funcional | Sprint Review | PO aceita sem testar → bug em produção |
| **3. Release Done (Versão)** | PO + Stakeholders | Conjunto de histórias + estabilidade + deploy produção | Fim de Release | Deploy com bugs conhecidos → usuários insatisfeitos |

---

### 📊 Fluxo: Done → Accepted → Release Done

```
[História em Progresso]
    ↓
[Passou no DoD?] → NÃO → Volta para Dev
    ↓ SIM
[Done (Time)]
    ↓
[PO testou e aceitou?] → NÃO → Ajustar ou voltar
    ↓ SIM
[Accepted (PO)]
    ↓ (acumula histórias Accepted)
[Todas histórias do Release Accepted + Estável?] → NÃO → Continua Sprints
    ↓ SIM
[Release Done (Deploy Produção)]
```

---

## 📋 Definition of Done v1 (Checklist Mínimo)

### ✅ Done (Time) — Checklist Técnico

Use isto como **ponto de partida** e evolua:

- [ ] **Código segue padrão acordado** (lint, style guide)
- [ ] **Code review** por pelo menos 1 pessoa (pair programming ou pull request)
- [ ] **Código no ambiente de homologação/staging** (não só "na minha máquina")
- [ ] **Cobertura de testes acordada:**
  - [ ] Unit tests (cobertura mínima: 70%)
  - [ ] Integration tests (cenários críticos)
  - [ ] Acceptance tests (critérios de aceitação automatizados se possível)
  - [ ] UI tests (se aplicável — smoke tests mínimo)
- [ ] **Funcionalidade testada pela equipe** (manual smoke test)
- [ ] **Validada por usuário "de fora"** (quando aplicável — stakeholder, beta tester)
- [ ] **Suíte completa roda e não quebrou nada** (regression tests passam)
- [ ] **Sem bugs de alta severidade conhecidos** (bugs menores → backlog)

---

### ✅ Accepted (PO) — Checklist de Aceitação

- [ ] **Critérios de aceitação atendidos** (Given/When/Then validados)
- [ ] **Demonstração funcional na Review** (PO viu funcionando, não só "acredita")
- [ ] **Sem pendências escondidas** ("só falta ajuste fino" = NÃO aceito)
- [ ] **Funciona no ambiente esperado** (não só dev, mas staging/produção-like)

---

### ✅ Release Done — Checklist de Versão

- [ ] **Todas histórias do Release Accepted** (DoD + Accepted de cada uma)
- [ ] **Testes de integração completos** (end-to-end, smoke tests produção)
- [ ] **Performance validada** (se há SLA — ex.: API < 200ms)
- [ ] **Segurança verificada** (OWASP top 10 se aplicável)
- [ ] **Deploy em produção** (ou ambiente final do cliente)
- [ ] **Documentação atualizada** (user guide, API docs, release notes)
- [ ] **Rollback plan** (como voltar se der problema)

---

## 🔄 Como DoD Evolui (Gatilho: PO Rejeita)

### 📌 Regra de Evolução

**Sempre que PO rejeita história na Review:**
1. **Investigar:** O que faltou? (critério de aceitação ambíguo? teste não cobriu? integração quebrou?)
2. **Atualizar DoD:** Adicionar item que teria prevenido a rejeição
3. **Comunicar:** Time revisa DoD atualizado (não pode ser "surpresa")

---

### 📊 Exemplo de Evolução

**Sprint 1 — DoD v1.0:**
```
- [ ] Código escrito
- [ ] Testado manualmente
- [ ] PO aprovou
```

**Sprint 2 — PO rejeita:** "Quebrou integração com API de pagamento"

**DoD v1.1 (adicionado):**
```
+ [ ] Testes de integração com APIs externas passam
```

---

**Sprint 4 — PO rejeita:** "Performance ruim, demora 5s para carregar"

**DoD v1.2 (adicionado):**
```
+ [ ] Performance validada (carregamento < 2s)
```

---

**Sprint 8 — Time maduro — DoD v2.0 (automatizado):**
```
- [ ] Pipeline CI/CD passou (inclui lint, testes, build)
- [ ] Code review aprovado (via GitHub PR)
- [ ] Deploy automático em staging
- [ ] Smoke tests automatizados passaram
- [ ] Performance < 2s (monitorado automaticamente)
- [ ] Cobertura de testes ≥ 80% (verificado por ferramenta)
```

**Itens removidos (automatizados):**
- ~~Código segue padrão~~ → lint automático bloqueia PR
- ~~Testes manuais~~ → smoke tests automatizados

---

### 📏 Métrica de Evolução do DoD

| Métrica | Como Medir | Sucesso |
|---------|-----------|---------|
| **Taxa de Rejeição do PO** | Histórias rejeitadas / total Done | < 5% |
| **Itens no DoD** | Quantidade de checkboxes | Cresce nos primeiros 3-6 meses, depois estabiliza |
| **Automação do DoD** | % itens automatizados | > 60% após 6 meses |
| **Retrabalho** | Histórias que voltam para Dev após Review | < 10% |

---

## 🔗 Integração: DoD + User Stories

### 📌 Critérios de Aceitação vs DoD

| Aspecto | Critérios de Aceitação | Definition of Done |
|---------|------------------------|-------------------|
| **Quem define** | PO (com time) | Time (com PO validando) |
| **O quê cobre** | Funcionalidade específica (valor de negócio) | Qualidade técnica (segurança do time) |
| **Quando** | Por história (varia) | Todas histórias (padrão) |
| **Exemplo** | "Dado que usuário esqueceu senha, quando clica 'Resetar', então recebe email em < 2 min" | "Código passou em code review + testes automatizados + integrado em staging" |
| **Falha** | PO rejeita (não atende funcionalidade) | Time não marca Done (não passou DoD) |

---

### 📊 Exemplo Integrado (História "Resetar Senha")

**User Story:**
```
Como usuário que esqueceu senha,
quero receber link de reset via email,
para recuperar acesso sem contatar suporte.
```

**Critérios de Aceitação (PO):**
```
- Dado que usuário clica "Esqueci minha senha"
- Quando informa email cadastrado
- Então recebe email com link de reset em < 2 min
- E link expira em 1h
- E após reset, senha antiga não funciona mais
```

**Definition of Done (Time):**
```
- [ ] Código passou em lint
- [ ] Code review aprovado
- [ ] Testes unitários (cobertura ≥ 80%):
  - Email enviado corretamente
  - Link gerado com token único
  - Link expira após 1h
  - Senha antiga invalidada
- [ ] Testes de integração:
  - API de email (SendGrid) funcionando
  - Fluxo completo (request → email → reset → login)
- [ ] Testado manualmente em staging
- [ ] PO testou e aprovou
- [ ] Deploy em staging sem quebrar nada
```

**Se Time marca Done mas PO rejeita:**
- **Cenário:** "Email demora 5 min para chegar (critério era < 2 min)"
- **Ação:** Atualizar DoD → adicionar "Performance de envio de email < 2 min (monitorado)"

---

## ⚠️ DoD Anti-Fraude: Evitar "Done Falso"

### 🚨 Sinais de "Done Falso"

- [ ] Velocidade sobe mas bugs também sobem
- [ ] Histórias "Done" voltam para retrabalho > 20%
- [ ] PO rejeita > 15% das histórias na Review
- [ ] Deploy em produção quebra frequentemente
- [ ] "Done" mas "só falta ajuste fino" (não é Done)

---

### ✅ Como Prevenir

| Anti-Padrão | Prevenção |
|-------------|-----------|
| ❌ **"90% pronto"** | Não existe 90%. Ou Done ou não. |
| ❌ **"Done mas não testei integração"** | DoD obriga integração em staging ANTES de Done. |
| ❌ **"Done mas tem bug pequeno"** | Bug = não Done. Corrige ou cria história separada. |
| ❌ **"PO vai testar depois"** | PO testa NA Review, história só Accepted se passar. |
| ❌ **"Vou fazer doc depois"** | Doc (se no DoD) é ANTES de Done. |

---

### 📏 Métrica de "Done Real"

| Métrica | Fórmula | Threshold Saudável |
|---------|---------|-------------------|
| **Taxa de Done Real** | (Histórias Accepted / Histórias Done) × 100 | > 95% |
| **Velocidade Limpa** | Pontos Accepted (não só Done) | Usar para previsão de prazo |
| **Débito Técnico** | Bugs descobertos pós-Review / total Done | < 5% |

---

# 🚀 CAPÍTULO 11 — Sprint Zero

## 🧭 Mapa Rápido

- **Sprint Zero** = "projeto antes do projeto", mas com **tempo definido** (1-2 semanas)
- **Não pode virar aberração** que vira waterfall (se estender demais)
- **Serve quando equipe não está capacitada** e precisa de acordos iniciais
- **Sprint Zero Backlog** inclui: treinamento, ferramentas, papéis, DoD, backlog inicial, protótipos
- **Não é aceitável acomodar "ScrumButt"** — Sprint Zero também prepara disciplina

---

## 📖 Quando Usar Sprint Zero

### ✅ Use Sprint Zero Quando

- [ ] **Time novo em Scrum** (nunca trabalhou assim antes)
- [ ] **Projeto greenfield** (sem código, sem ambiente, sem nada)
- [ ] **Ferramentas precisam ser configuradas** (CI/CD, repo, board, ambientes)
- [ ] **Papéis não definidos** (quem é PO? Quem é SM? Time tem skill gap?)
- [ ] **Backlog inicial vazio** (precisa workshop de discovery)
- [ ] **Stakeholders não alinhados** (precisa workshop de expectativas)

---

### ❌ NÃO Use Sprint Zero Quando

- [ ] Time já rodou Scrum antes (pode começar Sprint 1 direto)
- [ ] Projeto já tem código/ambiente (refatoração ou manutenção)
- [ ] É desculpa para "fase de análise infinita" (waterfall disfarçado)
- [ ] Time quer evitar disciplina de Sprint curto
- [ ] Stakeholder quer "planejar tudo antes de executar"

---

### ⚠️ Risco: Sprint Zero Virar Waterfall

**Sinais de que Sprint Zero está virando waterfall:**
- [ ] Duração > 2 semanas
- [ ] "Vamos estender Sprint Zero mais 1 semana" (slippery slope)
- [ ] Nenhum incremento entregue (só documentos)
- [ ] Time não capacitado ao final (ainda tem dúvidas básicas)
- [ ] Backlog inicial > 50% do produto (tentando "planejar tudo")

**Correção:**
- **Timebox rígido:** 1-2 semanas, não negocie
- **Incremento obrigatório:** protótipo, ambiente funcionando, backlog inicial priorizado
- **Sprint 1 começa imediatamente** após Sprint Zero (sem gap)

---

## 📋 Regras para Sprint Zero Não Estragar Scrum

### ✅ Sprint Zero Precisa

1. **Ter duração definida** (1-2 semanas ideal, máximo 3 em projetos muito grandes)
2. **Ter "incremento"** (mesmo que interno — ex.: ambiente pronto, DoD v1 escrito, backlog inicial estimado)
3. **Preparar Sprint 1** (backlog inicial + acordos + ambiente → time pode começar a codar)
4. **Ter Sprint Review** (demo do que foi preparado + feedback)
5. **Ter Retrospectiva** (time aprende Scrum fazendo Scrum, mesmo em Sprint Zero)

---

### ❌ Sprint Zero NÃO Pode

1. **Virar "fase de análise" infinita** (sem timebox)
2. **"Definir tudo antes"** (backlog completo, arquitetura completa → isso é waterfall)
3. **Ser desculpa para não fazer Sprint curto** ("vamos fazer Sprint Zero de 1 mês")
4. **Pular cerimônias** ("não precisa Review/Retro em Sprint Zero" → ERRADO, precisa sim)
5. **Entregar só documentos** (precisa algo "tocável" — protótipo, ambiente, código de setup)

---

## 📦 Sprint Zero Backlog (6 Buckets Operacionais)

### Bucket A — Objetivo de Negócio e Governança

**User Stories (perspectiva empresário/patrocinador):**

```
Como empresário,
quero meta de 300% produtividade (agressiva mas alcançável com Scrum),
para competir com empresas maiores.
```

```
Como empresário,
quero entregas incrementais (pequenas vitórias a cada 2 semanas),
para reduzir risco e validar hipóteses cedo.
```

```
Como empresário,
quero comunicação periódica com patrocinadores (Sprint Review),
para transparência e ajuste de prioridades.
```

**Saída mínima:**
- [ ] Meta de produtividade definida (ex.: reduzir lead time em 50% em 3 meses)
- [ ] Acordo de entrega incremental (não "tudo ou nada")
- [ ] Cadência de comunicação (Sprint Review com stakeholders a cada 2 semanas)

---

### Bucket B — Linguagem Comum

**User Stories:**

```
Como PO,
quero protótipos prematuros (papel, wireframe) para validar requisitos,
para evitar "codar no escuro" e ter conversa concreta com stakeholders.
```

```
Como time,
quero formato padrão de User Stories (Cohn + critérios Given/When/Then),
para clareza e testabilidade.
```

**Saída mínima:**
- [ ] Template de User Story definido (ver seção 9.3)
- [ ] Protótipo prematuro planejado (se aplicável — pode ser no Sprint 1)
- [ ] Glossário de termos do domínio (se complexo — ex.: fintech, saúde)

---

### Bucket C — Papéis Capacitados

**User Stories:**

```
Como empresário,
quero Scrum Master capacitado (guardião do processo + removedor de impedimentos),
para proteger time de interferências e garantir disciplina.
```

```
Como empresário,
quero Product Owner capacitado (garante valor/prioridade),
para não gastar tempo em features de baixo valor.
```

**Saída mínima:**
- [ ] SM definido e treinado (mínimo: leu Scrum Guide + este guia)
- [ ] PO definido e treinado (mínimo: sabe priorizar por valor, escrever histórias)
- [ ] Time dev conhece papéis (não espera "chefe", puxa tarefas)

---

### Bucket D — Ferramentas e Ambiente

**User Stories:**

```
Como time dev,
quero quadro Kanban (físico ou digital) + sistema de versionamento (Git),
para visibilidade do trabalho e colaboração.
```

```
Como time dev,
quero ambiente de homologação/CI configurado,
para integração contínua e deploy sem fricção.
```

**Saída mínima:**
- [ ] Board configurado (Trello/Jira/Notion/Físico) com colunas: Backlog, To Do, In Progress, Review, Done
- [ ] Repositório Git criado (GitHub/GitLab/Bitbucket)
- [ ] Ambiente de staging/homologação funcionando (ou plano para criar no Sprint 1)
- [ ] CI/CD básico (ou plano — ex.: GitHub Actions rodando testes automaticamente)

---

### Bucket E — Acordos Essenciais

**User Stories:**

```
Como time,
quero Definition of Done v1 (checklist mínimo),
para acordo explícito de "pronto" e evitar retrabalho.
```

```
Como time,
quero cadência de Sprint e ritos definidos (quando Daily, Planning, Review, Retro),
para disciplina e previsibilidade.
```

**Saída mínima:**
- [ ] DoD v1 escrito e acordado (ver Cap. 10)
- [ ] Duração do Sprint definida (1-2 semanas recomendado)
- [ ] Horários dos ritos definidos (ex.: Daily 10h, Review sexta 15h, Retro sexta 16h)
- [ ] Protocolo Porcos vs Galinhas acordado (ver Cap. 7)

---

### Bucket F — Necessidades Específicas do Projeto

**User Stories (exemplos):**

```
Como time dev,
quero treinamento em React (tecnologia nova para nós),
para não travar no Sprint 1.
```

```
Como time,
quero acesso ao ambiente do cliente (VPN, credenciais),
para não perder 1 semana esperando acesso.
```

**Saída mínima:**
- [ ] Skill gaps identificados e plano de training (pode ser durante Sprints, não precisa resolver tudo no Sprint Zero)
- [ ] Acessos/credenciais solicitados e recebidos
- [ ] Dependências externas mapeadas (APIs de terceiros, integrações)

---

## 📤 Saída do Sprint Zero (Mínimo Viável para Sprint 1)

### ✅ Checklist: Sprint Zero "Done"

- [ ] **Backlog inicial priorizado** (top 10-20 histórias estimadas)
- [ ] **DoD v1** escrito e acordado
- [ ] **Formato de User Story** definido (template pronto)
- [ ] **Cadência de Sprint** definida (ex.: 2 semanas, Daily 10h)
- [ ] **Ferramentas prontas** (board, Git, ambiente staging se possível)
- [ ] **Papéis claros** (quem é PO, SM, time dev)
- [ ] **Time "habilitado"** (sabe o básico de Scrum — leu Scrum Guide ou este guia)
- [ ] **Ambiente técnico** minimamente funcional (ou plano claro para Sprint 1)
- [ ] **Sprint 1 planejado** (top 3-5 histórias já selecionadas)

---

### 📊 Sprint Zero Review (Exemplo de Demo)

**Apresentação:**

> "Sprint Zero: Preparação para desenvolvimento.
>
> **O que entregamos:**
> 1. Backlog inicial: 15 histórias estimadas (87 pontos)
> 2. DoD v1: checklist de 8 itens (código + testes + review + staging)
> 3. Template User Story: formato Cohn + Given/When/Then
> 4. Ferramentas: Trello configurado, GitHub repo criado, staging deploy funcionando
> 5. Papéis: Maria (PO), João (SM), 4 devs
> 6. Cadência: Sprints de 2 semanas, Daily 10h, Review sexta 15h
>
> **Próximo Sprint (Sprint 1):**
> - Histórias selecionadas: #1 (Login), #2 (Cadastro), #3 (Dashboard básico) — 18 pontos
> - Objetivo: MVP navegável (sem features complexas, mas funcional)
>
> **Dúvidas?"**

---

### 📏 Métrica de Sucesso do Sprint Zero

| Métrica | Como Medir | Sucesso |
|---------|-----------|---------|
| **Sprint 1 começa no prazo** | Sem delay após Sprint Zero | ✅ Começa imediatamente |
| **Time confia no processo** | Survey: "Sentimos preparados?" (1-5) | ≥ 4 |
| **Ferramentas funcionam** | Board, Git, staging usados no Sprint 1 | 100% uso |
| **DoD é seguido** | % histórias que passam DoD no Sprint 1 | > 80% |
| **Backlog está claro** | Planning do Sprint 1 demora < 2h | ✅ |

---

## ⚠️ Erros Comuns em Sprint Zero

| Erro | Consequência | Correção |
|------|-------------|----------|
| ❌ **Sprint Zero de 1 mês** | Vira waterfall | Máximo 2 semanas |
| ❌ **Backlog 100% detalhado** | Perda de tempo (muda muito) | Só top 10-20 histórias detalhadas |
| ❌ **Nenhum protótipo/código** | Time não testa ferramentas | Criar "Hello World" deployado em staging |
| ❌ **Não fazer Review/Retro** | Time não aprende Scrum | Sprint Zero TEM Review e Retro |
| ❌ **PO/SM não capacitados** | Sprint 1 vira caos | Training obrigatório (mínimo: Scrum Guide) |

---

# 📈 CAPÍTULO 12 — Velocidade e Produtividade

## 🧭 Mapa Rápido

- **Velocidade** só importa se ligada a **valor entregue** (não "chegar rápido no brejo")
- **Fato:** time tende a melhorar com convivência + ferramentas + sem medir, você não prova nada
- **Referência Sutherland:** 300-400% possível (hiperprodutividade), mas exige disciplina
- **Métrica recomendada:** Story Points entregues por Sprint desde o Sprint 1
- **Story Points são subjetivos, mas time se auto-regula** para não inflar
- **Shock therapy (Downey):** Sprint 1 semana, reuniões 5-10% do Sprint, Daily com fala curta

---

## 📖 Velocidade vs Produtividade Real

### 🎯 Definições Operacionais

**Velocidade (throughput):**
- Story Points entregues (Done) por Sprint
- Medida de **quantidade** de trabalho
- Usa para **previsão de prazo** (Cap. 8)

**Produtividade Real:**
- Valor percebido + entrega funcional + satisfação/ROI
- Medida de **impacto** do trabalho
- Usa para **justificar Scrum** e medir sucesso do negócio

**Exemplo:**

```
Time A: Velocidade 50 pontos/Sprint, mas features não usadas → Produtividade Real BAIXA
Time B: Velocidade 20 pontos/Sprint, mas features críticas com alta adoção → Produtividade Real ALTA
```

**Conclusão:** Velocidade alta SEM valor = "ir rápido pro brejo" (cavar buraco errado muito rápido).

---

### ⚠️ Anti-Padrões

| Anti-Padrão | Consequência | Como Detectar |
|-------------|-------------|---------------|
| ❌ **Aumentar pontos com "Done frouxo"** | Velocidade fake (retrabalho escondido) | Taxa de rejeição do PO > 15% |
| ❌ **Aumentar output sem alinhamento com mercado** | Features não usadas (waste) | Uso real < 30% das features |
| ❌ **Medir só velocidade, ignorar valor** | Time otimiza métrica errada | ROI não cresce, NPS cai |
| ❌ **Comparar velocidade entre times** | Competição tóxica, infla Story Points | Times "inflam" pontos para "ganhar" |

---

### 📏 Prática Recomendada: Medir Velocidade + 1 Qualidade + 1 Valor

| Categoria | Métrica | Exemplo | Como Medir |
|-----------|---------|---------|------------|
| **Velocidade** | Story Points Done/Sprint | 20 pts/Sprint | Somar pontos Done em cada Review |
| **Qualidade** | Bugs, Retrabalho, Rejeição PO | < 5% retrabalho | (Histórias refeitas / total Done) × 100 |
| **Valor** | Uso real, NPS, Conversão, ROI | NPS ≥ 40 | Survey mensal ou analytics |

**Mínimo universal (todo projeto):**
- ✅ **Velocidade (SP/Sprint)** desde Sprint 1
- ✅ **1 métrica de qualidade** (bugs, retrabalho, rejeição PO)
- ✅ **1 métrica de valor** (uso real, conversão, satisfação)

---

## 📊 Baseline: O que Medir "Antes e Depois"

### 🎯 Por que Baseline Importa

**Problema sem baseline:**
- Scrum "funciona" mas você não prova ganho
- Stakeholder questiona: "Como sei que vale a pena?"
- Time não vê evolução (desmotiva)

**Benefício com baseline:**
- Prova quantitativa ("éramos X, agora somos Y")
- Justifica investimento em Scrum
- Motiva time (vê progresso)

---

### 📋 O que Medir ANTES de Scrum (Baseline)

**Escolha 3-5 métricas (não mais):**

| Domínio | Métricas Sugeridas | Exemplo |
|---------|-------------------|---------|
| **Software** | Lead Time, Deploy Frequency, Bugs/Release, PF ou UST | Lead time: 3 meses por feature |
| **Atendimento** | Satisfação (NPS), Conversão, Retenção, Tempo Resposta | NPS: 20 |
| **Marketing/Vendas** | CAC, Conversão, Receita/Ciclo, MRR | Conversão: 2% |
| **Produto** | Time to Market, Features/Mês, Uso Real | Features/Mês: 1 |

**Exemplo (software):**

**Baseline (antes de Scrum):**
```
- Lead Time (ideia → produção): 12 semanas
- Deploy Frequency: 1× por trimestre
- Bugs encontrados em produção: 15 por release
- Velocidade: não medido (sem pontos)
- Satisfação do time: 3/5
```

**Meta (após 6 meses de Scrum):**
```
- Lead Time: < 4 semanas (redução 66%)
- Deploy Frequency: 1× por Sprint (2 semanas) — aumento 6×
- Bugs em produção: < 5 por release (redução 66%)
- Velocidade: 20 pontos/Sprint (estável)
- Satisfação do time: ≥ 4/5
```

---

### 📏 Como Coletar Baseline (Passo a Passo)

#### **Antes de Sprint Zero**

1. **Escolher 3-5 métricas** (ver tabela acima)
2. **Coletar dados dos últimos 3-6 meses** (média, não ponto único)
3. **Registrar** (spreadsheet, dashboard, documento)
4. **Comunicar** (time e stakeholders sabem baseline)

#### **Exemplo de Coleta (Lead Time)**

```
Feature A: ideia em 01/07 → produção em 15/10 = 15 semanas
Feature B: ideia em 10/08 → produção em 20/11 = 14 semanas
Feature C: ideia em 05/09 → produção em 30/12 = 16 semanas

Baseline Lead Time: (15+14+16)/3 = 15 semanas
```

---

### 📊 Scoreboard de Métricas (Template)

```markdown
## Scoreboard — Métricas de Produtividade

**Projeto:** [Nome]
**Baseline:** [Data — ex.: Out/2025]
**Última atualização:** [Data — ex.: Jan/2026 após Sprint 6]

---

| Métrica | Baseline (Antes Scrum) | Meta (6 meses) | Atual | Δ % | Status |
|---------|------------------------|----------------|-------|-----|--------|
| **Lead Time** | 15 semanas | < 4 semanas | 6 semanas | -60% | 🟡 Melhorando |
| **Deploy Frequency** | 1× trimestre | 1× Sprint | 1× Sprint | +600% | 🟢 Meta Atingida |
| **Bugs/Release** | 15 | < 5 | 8 | -47% | 🟡 Melhorando |
| **Velocidade** | N/A | 20 pts/Sprint | 18 pts/Sprint | N/A | 🟢 Estabilizando |
| **NPS** | 20 | ≥ 40 | 35 | +75% | 🟡 Melhorando |
| **Satisfação Time** | 3/5 | ≥ 4/5 | 4.2/5 | +40% | 🟢 Meta Atingida |

---

**Legenda:**
- 🟢 Meta atingida ou superada
- 🟡 Melhorando, mas não atingiu meta ainda
- 🔴 Estagnado ou piorando

**Próxima revisão:** [Data]
```

---

### 🧪 Teste de Baseline (após 3-6 meses)

- [ ] Pelo menos 2 métricas melhoraram ≥ 30%
- [ ] Velocidade estabilizou (variação < 20% entre Sprints)
- [ ] Time confia no processo (satisfação ≥ 4/5)
- [ ] Stakeholder vê valor (NPS ou ROI melhorou)

---

## ⚡ "Shock Therapy" — Buscar Evidência Rápida

### 📖 O que é (Abordagem de Scott Downey)

**Conceito:** Sprint muito curto (1 semana) + disciplina rigorosa → provar ganhos rápido.

**Por quê funciona:**
- Feedback loop ultra-curto (1 semana vs 1 mês)
- Força time a focar (sem tempo para procrastinar)
- Prova Scrum rápido (stakeholder vê resultado em semanas, não meses)

**Quando usar:**
- Stakeholder cético ("Scrum não vai funcionar aqui")
- Time resistente ("preferimos waterfall")
- Urgência (precisa mostrar valor rápido)

---

### ✅ Regras do Shock Therapy

#### 1️⃣ Sprint de 1 Semana (fixo)

**Não negocie:** 5 dias úteis, sempre.

**Benefício:**
- Feedback toda semana
- Ajustes rápidos
- Menos risco (se errar, perde só 1 semana)

---

#### 2️⃣ Reuniões = 5-10% do Sprint

**Para Sprint de 1 semana (40h):**
- Total reuniões: 2-4 horas

**Distribuição sugerida:**

| Cerimônia | Duração | Dia |
|-----------|---------|-----|
| **Sprint Planning** | 1h | Segunda 9h |
| **Daily** | 10 min × 5 = 50 min | Segunda-Sexta 10h |
| **Sprint Review** | 30-45 min | Sexta 15h |
| **Retrospectiva** | 30 min | Sexta 16h |
| **TOTAL** | ~3h | 7,5% do Sprint ✅ |

---

#### 3️⃣ Daily com Fala Curta (90s por pessoa)

**Regra:** cada pessoa tem **90 segundos** para responder:
1. O que fiz ontem?
2. O que farei hoje?
3. O que está me bloqueando?

**Timer visível:** SM/facilitador corta educadamente se passar de 90s.

**Script:**
> "Vamos focar. 90 segundos por pessoa. Se precisar de discussão longa, marcamos depois do Daily. Quem começa?"

---

#### 4️⃣ Respeitar Papéis/Ritos/Artefatos (Senão Vira ScrumButt)

**Não pode pular:**
- PO definido e presente
- SM facilitando (removendo impedimentos)
- Backlog priorizado por valor
- DoD rigoroso
- Review com incremento funcional
- Retro com experimento

**Se pular:** não é Scrum, é "processo ad-hoc" → não vai provar ganhos.

---

### 📊 Exemplo de Shock Therapy (4 Semanas)

**Contexto:**
- Stakeholder cético: "Scrum não funciona para desenvolvimento mobile"
- Time resistente: "Preferimos entregar app completo em 3 meses"
- Proposta: 4 Sprints de 1 semana para provar valor

**Sprint 1 (Semana 1):**
- **Meta:** Login funcional (sem features complexas)
- **Committed:** 12 pontos
- **Done:** 10 pontos (2 pontos carry-over)
- **Incremento:** App com tela de login funcionando (OAuth Google)

**Sprint 2 (Semana 2):**
- **Meta:** Dashboard básico (navegação + 1 widget)
- **Committed:** 11 pontos (incluindo 2 carry-over)
- **Done:** 12 pontos
- **Incremento:** Dashboard navegável com widget de "tarefas do dia"

**Sprint 3 (Semana 3):**
- **Meta:** Notificações push
- **Committed:** 13 pontos
- **Done:** 13 pontos
- **Incremento:** Usuário recebe notificação quando tarefa nova chega

**Sprint 4 (Semana 4):**
- **Meta:** MVP completo (polimento + deploy beta)
- **Committed:** 14 pontos
- **Done:** 14 pontos
- **Incremento:** App em beta testing com 10 usuários reais

**Resultado após 4 semanas:**
- ✅ MVP funcional em produção (beta)
- ✅ Velocidade estável: ~12 pontos/Sprint
- ✅ Stakeholder vê valor: "Vocês entregaram em 1 mês o que levaria 3 em waterfall"
- ✅ Time convencido: "Scrum funciona, vamos continuar"

---

### 📏 Métricas de Shock Therapy

| Métrica | Threshold | Se Red Flag |
|---------|-----------|-------------|
| **Sprint sempre 1 semana** | 100% | Se mudar, não é shock therapy |
| **Reuniões < 10% do Sprint** | < 4h por Sprint | Se > 4h, otimizar cerimônias |
| **Daily < 15 min** | 100% dos Dailies | Se > 15 min, cortar tangentes |
| **Incremento funcional toda semana** | 100% dos Sprints | Se não tem, DoD está fraco |
| **Velocidade crescente** | +10% por Sprint (primeiros 4 Sprints) | Se cai, investigar impedimentos |

---

### 🧪 Teste de Sucesso do Shock Therapy (Após 4 Semanas)

- [ ] 4 Sprints de 1 semana completados sem estender
- [ ] 4 incrementos funcionais entregues
- [ ] Velocidade estabilizou (variação < 20%)
- [ ] Stakeholder convencido (aprova continuar Scrum)
- [ ] Time satisfeito (survey ≥ 4/5: "gostamos do processo")

---

## ✅ Checklist de Implantação em 14 Dias

### 📅 Semana 1: Sprint Zero

**Dia 1-2 (Segunda/Terça):**
- [ ] Definir papéis (PO, SM, time dev)
- [ ] Training básico (Scrum Guide + este guia — 2h)
- [ ] Criar board (Trello/Jira/Físico)
- [ ] Configurar repositório Git

**Dia 3-4 (Quarta/Quinta):**
- [ ] Workshop: Backlog inicial (top 15 histórias)
- [ ] Planning Poker (estimar backlog)
- [ ] Escrever DoD v1 (checklist mínimo)
- [ ] Definir cadência (Sprint 1-2 semanas, horários dos ritos)

**Dia 5 (Sexta):**
- [ ] Sprint Zero Review (demo de preparação)
- [ ] Retrospectiva (o que aprendemos?)
- [ ] Preparar Sprint 1 (selecionar top 3-5 histórias)

---

### 📅 Semana 2: Sprint 1

**Dia 6 (Segunda):**
- [ ] Sprint Planning (1-2h — histórias já estimadas)
- [ ] Daily (10-15 min)

**Dia 7-9 (Terça-Quinta):**
- [ ] Daily (10-15 min cada dia)
- [ ] Trabalho (desenvolvimento)
- [ ] Atualizar board (mover cards)

**Dia 10 (Sexta):**
- [ ] Daily (10-15 min)
- [ ] Sprint Review (demo incremento + coletar feedback)
- [ ] Retrospectiva (1 experimento para Sprint 2)
- [ ] Atualizar scoreboard (velocidade, qualidade, valor)

---

### 📊 Checklist Final: Sistema Funcionando

Após 2-3 Sprints, você deve ter:

#### ✅ Processo
- [ ] Sprints de duração fixa (sem variação)
- [ ] Cerimônias acontecendo (Planning, Daily, Review, Retro)
- [ ] Backlog priorizado por valor (PO mantém atualizado)
- [ ] DoD v1 sendo seguido (histórias só Done se passar checklist)

#### ✅ Artefatos
- [ ] Backlog estimado (top 10-20 histórias com pontos)
- [ ] Sprint Backlog visível (board atualizado diariamente)
- [ ] Burndown (Sprint e/ou Release)
- [ ] Velocidade registrada (planilha ou dashboard)

#### ✅ Papéis
- [ ] PO acessível (participa de cerimônias, prioriza backlog)
- [ ] SM facilita (remove impedimentos, protege time)
- [ ] Time se auto-organiza (puxa tarefas, não espera "chefe")

#### ✅ Métricas
- [ ] Velocidade estável (variação < 20% após 3 Sprints)
- [ ] Qualidade alta (retrabalho < 10%, rejeição PO < 5%)
- [ ] Valor entregue (pelo menos 1 métrica de negócio melhorando)

#### ✅ Cultura
- [ ] Time confia no processo (satisfação ≥ 4/5)
- [ ] Stakeholder vê valor (participa de Reviews, dá feedback)
- [ ] Transparência total (board/burndown/backlog visível para todos)
- [ ] Melhoria contínua (1 experimento ativo por Sprint vindo da Retro)

---

**Próximos passos:**
1. Ver `Playbooks_Dinamicas_Cap9-12.md` para roteiros completos das 4 oficinas
2. Ver `Templates_Operacionais_Cap9-12.md` para templates copiáveis
3. Ver `Mermaids_Scrum_Cap9-12.md` para diagramas visuais

---

*Guia criado para UzzAI — Material didático profissional baseado em Scrum (Mike Cohn, Ken Schwaber, Jeff Sutherland) + práticas brasileiras.*
