---
created: 2026-01-05
updated: 2026-01-05T20:00
tags:
  - scrum
  - agile
  - uzzai
  - framework
  - metodologia
  - user-stories
  - product-backlog
  - planning-poker
  - sprints
version: 2
---

# GUIA SCRUM UzzAI — Parte 2: Capítulos 5 e 6

> **Guia prático: User Stories, Product Backlog, Planning Poker e Execução de Sprints**
> Baseado em: Cesar Brod + Extreme Programming + Manifesto Ágil + práticas de mercado

---

## Resumo Executivo

Esta segunda parte do Guia Scrum UzzAI aborda a transformação de ideias em entregas executáveis. **Capítulo 5** cobre como escrever User Stories, construir Product Backlog e priorizar com Planning Poker. **Capítulo 6** detalha a execução de Sprints, desde Planning até Review/Retro.

**Por que esta parte é crítica?** Porque sem histórias bem escritas e backlog priorizado, o Scrum vira burocracia. Sem execução disciplinada de Sprints, nada é entregue.

**Principais conceitos:**
- User Stories: tradução negócio → valor (INVEST + SMART)
- Product Backlog: nascido de mapas mentais e workshops estruturados
- Planning Poker: priorização por valor (BV) e estimativa por esforço (W)
- Sprint Planning: 2 partes (PO + Time separados)
- Proteção do Sprint: regra de ouro (nada entra no meio)
- Burndown como radar (não como chicote)

**Benefícios esperados:** Backlog priorizado por valor real, histórias executáveis em 1 dia, Sprints que entregam incrementos funcionais, e processo que evolui continuamente.

---

## Índice

1. [Capítulo 5: User Stories e Product Backlog](#capítulo-5-user-stories-e-product-backlog)
   - 5.1 User Stories (INVEST + SMART)
   - 5.2 Product Backlog + Mapas Mentais
   - 5.3 Workshop do Product Backlog
   - 5.4 Planning Poker (BV/W)
2. [Capítulo 6: Execução de Sprints](#capítulo-6-execução-de-sprints)
   - 6.1 Sprint Zero → Sprint 1
   - 6.2 Negociação: Valor vs Dependência Técnica
   - 6.3 Sprint Planning (2 partes)
   - 6.4 Kanban/Scrum Board + WIP
   - 6.5 Daily Scrum
   - 6.6 Proteção do Sprint
   - 6.7 Burndown como Radar
   - 6.8 Review + Retrospective
3. [Exemplos Práticos Completos](#exemplos-práticos-completos)
4. [Checklists Operacionais](#checklists-operacionais)
5. [Erros Comuns e Anti-padrões](#erros-comuns-e-anti-padrões)

---

# Capítulo 5: User Stories e Product Backlog

## 5.1 User Stories (Como Escrever de Forma "Executável")

### 5.1.1 Ideia Central

✅ **Tecnologia ≠ Negócio.** Quem domina LLM/RAG/integrações não domina o dia-a-dia do cliente.

**User Story é o meio-termo humano:** cliente descreve na linguagem dele; time traduz em entrega.

---

### 5.1.2 Regras Fundamentais

#### **Regra 1: User Story fala "do usuário", não "da tecnologia"**

**✅ BOM:**
- "Como analista financeiro, quero gerar o relatório em 10s para fechar o dia sem atrasos."
- "Como operador, quero que o bot resolva 70% dos chamados sem humano para reduzir fila."

**❌ RUIM:**
- "Melhorar indexação da tabela de pedidos."
- "Trocar embedding model / otimizar vector store."

> [!tip] Tradução UzzAI
> Se a história menciona tecnologia específica (banco, framework, API), ela provavelmente está mal escrita. Reescreva focando no resultado que o usuário precisa.

---

#### **Regra 2: História boa cabe num "elevador" (30s)**

Se não dá pra explicar em 30 segundos → é grande demais, confusa, ou precisa de detalhes/partições.

**Teste do elevador:**
- Você consegue explicar em 30s para alguém leigo?
- A pessoa entende o valor sem conhecer tecnologia?
- Se falhar → quebrar a história ou refinar.

---

#### **Regra 3: História precisa ser testável (vira Aceite)**

A User Story é, na prática, o roteiro do teste de aceitação na Review.

**Critérios de Aceite devem ser:**
- Observáveis (dá pra ver/testar)
- Mensuráveis (número/conceito claro)
- Executáveis (dá pra validar na demo)

---

### 5.1.3 INVEST: Checklist de Qualidade da História

Use como validação antes de colocar no Sprint:

| Letra | Significado | O que verificar | Sinal de quebra |
|-------|-------------|-----------------|-----------------|
| **I** | **Independent** | História não depende de 5 outras pra existir valor | "Preciso da US-042, 043, 044..." |
| **N** | **Negotiable** | Não é contrato rígido; é convite pra conversa | "Exatamente 47 campos, sem exceção" |
| **V** | **Valuable** | Valor percebido pelo cliente/usuário | "Melhorar código interno" (sem impacto usuário) |
| **E** | **Estimable** | Dá pra estimar (se não dá, falta info) | Time vira "?" no Poker |
| **S** | **Small** | Pequena o suficiente pro Sprint (ideal: 0,5–1 dia) | Estimativa > 13 pontos |
| **T** | **Testable** | Critérios claros de aceite | "Funciona bem" (subjetivo) |

📌 **Regra UzzAI prática:** Se falhar em **S** (Small) ou **T** (Testable), você não põe no Sprint — você quebra a história.

---

### 5.1.4 SMART: Qualidade das Tarefas Técnicas

As histórias viram tarefas no Planning B. Tarefa boa é **SMART**:

| Letra | Significado | Exemplo |
|-------|-------------|---------|
| **S** | **Specific** | "Criar endpoint /api/checkout" (não "fazer checkout") |
| **M** | **Measurable** | "Testes passam" ou "latência < 2s" |
| **A** | **Achievable** | Executável com recursos atuais (sem depender de X que não existe) |
| **R** | **Relevant** | Ligada diretamente à história (não "refatorar módulo Y") |
| **T** | **Time-boxed** | Tem limite de tempo (0,5–1 dia ideal) |

📌 **Sinal de alarme:** "Tarefa acessória não prevista" aparecendo? → ou a história está mal definida, ou falta uma história nova.

---

### 5.1.5 Por Que Escrever Histórias Antes do Product Backlog?

Três motivos aplicáveis direto na UzzAI:

1. **✅ Humildade + Descoberta:** Entrevistas revelam coisas que nem o PO sabia
2. **✅ Pequenas Vitórias:** Histórias certas geram protótipos prematuros que "vendem" a confiança
3. **✅ Prioridade Real:** Histórias expõem dores, e dores priorizam melhor que opinião

> [!warning] Anti-padrão
> Pular direto pro backlog sem escrever histórias → backlog vira "lista técnica" sem valor de negócio.

---

### 5.1.6 Épicos: Como Detectar e Quebrar

#### **Sinais de que é Épico:**

- ✅ Estimativas "altas demais" (não cabe no Sprint)
- ✅ Não passa em INVEST/SMART
- ✅ "Parece um projeto inteiro" disfarçado
- ✅ Time não consegue explicar em 30s

---

#### **Como Quebrar Épico sem Perder Valor (Padrões)**

| Padrão | Como funciona | Exemplo |
|--------|---------------|---------|
| **Fluxo (Workflow Steps)** | Passo 1 → Passo 2 → Passo 3 (entregas úteis) | Login → Seleção → Pagamento |
| **Persona** | Usuário X primeiro, depois usuário Y | Admin → Usuário final → Auditor |
| **Happy Path** | Primeiro o caminho principal, depois exceções | Fluxo normal → Validações → Erros |
| **Risco** | Primeiro o que valida a hipótese e reduz incerteza | Spike teste → MVP → Features |

✅ **Exemplo UzzAI (épico → histórias):**

**Épico:** "Implementar suporte automático com IA"

**História 1:** "Como usuário, quero abrir chamado via WhatsApp e receber confirmação imediata para saber que fui atendido."

**História 2:** "Como suporte, quero painel com triagem e confiança do modelo para auditar respostas antes de escalar."

**História 3:** "Como gestor, quero relatório semanal de taxa de resolução e motivos de escalonamento para melhorar processo."

---

## 5.2 Product Backlog + Mapas Mentais

### 5.2.1 Por Que Mapa Mental Funciona?

✅ **Benefícios:**
- Deixa o escopo visível (pessoas enxergam o projeto)
- Facilita priorização por ramos
- Quando entra história nova, mostra impacto no todo (tempo/custo/escopo)

> [!tip] Visualização = Compreensão
> Mapa mental ajuda pessoas não-técnicas entenderem o escopo completo sem precisar ler 50 páginas de documento.

---

### 5.2.2 Stealth Scrum (Introdução sem Jargão)

Para começar cultura sem resistência:

**Você NÃO fala:**
- "Scrum / artefatos / cerimônias"
- "Sprint / Product Backlog / Planning Poker"

**Você FALA:**
- "Lista priorizada"
- "Semanas de entrega"
- "Demo semanal"
- "Ajuste contínuo"

📌 **Regra UzzAI:** No primeiro workshop com cliente interno/externo, use "linguagem de resultado" e só depois nomeie como Scrum.

---

### 5.2.3 Como Criar Product Backlog a Partir de Mapa Mental

**Passo a passo:**

1. **Workshop 1 (Descoberta):**
   - Coleta de ideias (post-its individuais)
   - Agrupamento por ramos
   - Criação do mapa mental
   - Transformação de clusters em User Stories

2. **Workshop 2 (Priorização):**
   - Choque de foco ("história pela qual daria a vida")
   - Planning Poker BV (valor)
   - Definição de MVP

3. **Workshop 3 (Estimativa):**
   - Planning Poker W (esforço)
   - Quebra de épicos
   - Backlog "pronto para Sprint"

📌 **Regra crítica:** Se um post-it não encaixa em ramo → cria ramo novo (não descarta).

---

### 5.2.4 Anti-armadilha: Backlog Técnico vs Backlog de Valor

**❌ NÃO é Product Backlog:**
- "Modelar banco de dados"
- "Definir stack tecnológica"
- "Setup CI/CD"
- "Criar arquitetura base"

**✅ Isso entra como:**
- Tarefas no Sprint Backlog (se necessário para história)
- Histórias de "habilitação" (se essenciais e justificadas pelo PO)

> [!warning] Critério de Validação
> Se não tem persona/valor de negócio claro, não é User Story — é tarefa técnica.

---

## 5.3 Exercício do Product Backlog (Sprint Zero na Prática)

### 5.3.1 Sprint Zero: Por Que É Útil?

Mesmo não entregando incremento do produto, Sprint Zero:

- ✅ Cria cultura antes do Scrum "valendo"
- ✅ Dá forma ao Product Backlog
- ✅ Define MVP, versões e ferramentas-base
- ✅ Evita "projeto Frankenstein"

📌 **Para a UzzAI, Sprint Zero é onde você evita "projeto Frankenstein".**

---

### 5.3.2 Workshop do Backlog (Script Pronto — 90 a 120 min)

**Objetivo:** Sair com um Product Backlog priorizado + choque de foco.

**Setup:**
- 12 pessoas é ótimo (mínimo 8)
- Dividir em 3 grupos (máx. 4 por grupo)
- Misturar marketing + operação + técnico + usuário

**Passos:**

1. **Apresente a ideia central (1 slide / 2 min)**
2. **Cada pessoa escreve notas adesivas: 1 ideia por nota (10–15 min)**
3. **Cada grupo escolhe 4–6 ideias para priorizar**
4. **Você impõe o choque:**
   - 📌 "Agora escolham 1: a história pela qual vocês dariam a vida."
5. **Junta tudo: isso é o Product Backlog inicial**

**Variação (boa pra UzzAI):**
- Cada um escreve sozinho → você agrupa por similaridade → redistribui notas misturadas → grupos repriorizam

> [!example] Workshop Completo
> Veja script detalhado em `Templates_Oficinas_Cap5-6.md` (Workshop 1, 2, 3).

---

### 5.3.3 Entregas do Sprint Zero

Mesmo que não seja incremento do produto, tem entregáveis:

- ✅ Product Backlog priorizado e limpo (sem épicos gigantes)
- ✅ MVP definido
- ✅ DoR (Definition of Ready) e DoD (mínimos)
- ✅ Ferramentas e rituais operando (board, daily, review agendada)
- ✅ Padrões técnicos base (repo, CI, branching, logging)
- ✅ Lista de Spikes necessários (com timebox)

📌 **Duração: 1 Sprint (1–2 semanas). Não mais.**

---

## 5.4 Planning Poker (Prioridade + Esforço sem Brigar com Horas)

### 5.4.1 Conceito Central: BV / W

Cada história tem:

- **BV (Business Value):** Valor pro negócio (cliente/PO)
- **W (Workload):** Carga de trabalho (time)

**Prioridade sugerida:** BV / W
→ alto valor e baixo esforço sobe; baixo valor e alto esforço desce.

---

### 5.4.2 Por Que Fibonacci (1, 2, 3, 5, 8, 13, 21)?

Porque estimativa exata em horas é ilusória cedo. É mais fácil dizer: "A é maior que B" e calibrar por comparação.

📌 **Regra UzzAI:** Use Fibonacci para estimar complexidade relativa; horas só depois, com histórico/velocity.

---

### 5.4.3 Significado das Cartas "Especiais"

| Carta | Significado | Quando usar |
|-------|-------------|-------------|
| **0** | Não faz sentido / remove do backlog | História sem valor ou duplicada |
| **∞** | Vital / prioridade máxima | Bloqueador crítico (sem isso, nada funciona) |
| **?** | Não tenho informação suficiente | Ação: esclarecer (não chutar!) |
| **☕** | Pausa pra pensar (respeitar; evita chute) | Time precisa respirar antes de estimar |
| **½** | Muito pequeno (quase trivial) | Tarefa de 1–2 horas |

> [!warning] Carta "?" não é chute
> Se aparece "?", registra como ação: "Precisa Spike de 4h para testar integração X".

---

### 5.4.4 Mecânica Prática (Script de Facilitação)

**Passos:**

1. **Escolha 1 história "quase unânime" pra aquecer**
2. **Todos escolhem carta em silêncio**
3. **Revela ao mesmo tempo**
4. **Se houver extremos (0/∞/13/21), peça:**
   - "Quem deu alto, defenda em 30s."
   - "Quem deu baixo, defenda em 30s."
5. **Re-vota se necessário (1 ou 2 rodadas máximo)**

✅ **Saída:** backlog ordenado + clareza de divergências + dúvidas registradas

---

### 5.4.5 Como Usar Poker em 2 Modos (Bem Separado)

| Modo | Quem vota | Objetivo | Quando fazer |
|------|-----------|----------|--------------|
| **Prioridade (BV)** | PO + stakeholders + time (todos têm voz) | Ordenar por valor percebido | Workshop 2 (priorização) |
| **Esforço (W)** | Time (principal). PO participa só pra esclarecer contexto | Estimar complexidade relativa | Workshop 3 (estimativa) |

📌 **Dica:** Se você mistura BV e W na mesma rodada vira confusão. Separe.

---

### 5.4.6 Variação "R$" (Lasse Ziegler)

Multiplica os números por mil e pergunta:

**"Quanto vocês pagariam por isso?"**

Ajuda patrocinador a priorizar melhor.

⚠️ **Se usar isso, evite o ∞ (infinito bagunça orçamento).**

---

### 5.4.7 Como Calcular Rápido (sem Virar Ciência)

✅ **Use mediana (melhor que média)**
- Exemplo: [3, 5, 5, 8, 13] → mediana = 5

✅ **Conte "∞" como desempate**
- Se 2 pessoas dão ∞ e 3 dão 8 → considera prioridade alta

✅ **Evite média aritmética**
- Extremos distorcem (ex: [1, 2, 21] → média = 8, mas mediana = 2)

---

# Capítulo 6: Execução de Sprints

## 6.1 Sprint Zero → Sprint 1

### 6.1.1 O Que É um Sprint "do Jeito Certo"

Sprint não é "período de trabalho". É um **contrato de foco**:

- ✅ Tempo fixo (timebox)
- ✅ Escopo negociado e congelado
- ✅ Objetivo claro ("Sprint Goal")
- ✅ Entrega demonstrável no final

📌 **Pequena vitória = algo que o PO consegue olhar e dizer:**
> "Isso existe, funciona, e eu consigo validar."

✅ **Exemplo de pequena vitória (GiftWizz):**
> Fim do Sprint: "usuário autentica na rede social e escolhe um amigo para presentear → sistema retorna 1 sugestão (mesmo simples)."

---

## 6.2 Negociação: Valor vs Dependência Técnica

### 6.2.1 Caso GiftWizz

**Situação:**
- História 1 é a "razão de existir" (prioridade de negócio)
- Mas sem a história 5 (captura de dados), a 1 não funciona

**Solução:**
- Time negocia: move a 5 pra cima sem apagar o histórico

---

### 6.2.2 Regra de Rastreabilidade

📌 **ID não muda** (mantém rastreabilidade do valor original)
📌 **Ordem pode mudar** (por dependência, risco, infraestrutura mínima)

---

### 6.2.3 Como Explicar Isso para Patrocinador (Script Pronto)

> "A prioridade do negócio continua sendo a 1. Só que, tecnicamente, precisamos construir o 'chão' primeiro (história 5). É como querer dirigir antes de ter chave e combustível. Vamos entregar a 5 agora para destravar a 1 no próximo passo."

✅ Isso evita a leitura errada: "a equipe ignorou o cliente".

---

## 6.3 Sprint Planning em 2 Reuniões (O Jeito que Funciona)

### 6.3.1 Planning A (com Product Owner) — "O Quê" e "Pra Quê"

**Participantes:** PO + time + SM

**Objetivo:** Escolher histórias do Sprint, alinhar entendimento e compromisso.

**Timebox:** 45–90 min (Sprint 1 semana) / 90–120 min (Sprint 2 semanas)

**Roteiro prático:**

1. **Sprint Goal (1 frase)**
   - "Ao final deste Sprint, o usuário consegue X."

2. **Selecionar histórias do topo do backlog** (considerando capacidade)

3. **Esclarecer dúvidas de negócio** (sem entrar em implementação)

4. **Definir critérios de aceite** (mínimos) para cada história

5. **Confirmar:** PO entende o que vai ver na Review?

---

**📌 PO NÃO decide:**
- "Como fazer"
- "Quem faz"
- "Arquitetura"
- "Divisão interna"

---

**✅ Saída obrigatória:**
- Sprint Goal
- Lista de histórias do Sprint (Sprint Backlog – nível "história")
- Critérios de aceite em linguagem do PO

---

### 6.3.2 Planning B (só Time + Scrum Master) — "Como" e "Tarefas"

**Participantes:** Equipe + SM (PO fora)

**Objetivo:** Quebrar histórias em tarefas técnicas e montar o quadro.

**Timebox:** 60–120 min

**Roteiro prático:**

1. **Para cada história: decompor em tarefas (post-its)**
2. **Estimar/validar esforço (rápido)**
3. **Distribuir tarefas no Kanban (To Do)**
4. **Definir WIP (limite de "Doing")**
5. **Confirmar compromisso do time com o Sprint Goal**

---

**✅ Exemplo (história 5 do GiftWizz → tarefas):**

- 5.1 login via API da rede social
- 5.2 autorização de acesso (permissões)
- 5.3 buscar dados públicos dos amigos
- 5.4 armazenar dados localmente
- 5.5 cadastrar base inicial de presentes

---

**📌 Regras boas:**
- Tarefa deve caber em 0.5 a 1 dia
- Se não cabe: quebra de novo
- "?" vira Spike timeboxed

---

## 6.4 Kanban/Scrum Board dentro do Sprint

### 6.4.1 Estrutura Mínima

```
To Do | Doing | Done | Aceito
```

- **Done =** pronto tecnicamente (testado conforme DoD)
- **Aceito =** PO move após Review (ou aceite contínuo, se combinado)

📌 **Dica do livro:**
- Manter Product Backlog "do lado" (visível)
- Usar post-its (físico) funciona melhor no começo

---

### 6.4.2 WIP (Work in Progress) — O Limitador de Caos

O quadro só funciona se "Doing" não virar cemitério.

**✅ Regras práticas:**

| Tipo | Limite | Quando estoura |
|------|--------|----------------|
| **WIP por pessoa** | 1 tarefa ativa por vez | Alguém para de começar coisa nova |
| **WIP do time** | 2–4 tarefas ativas no total (depende do tamanho) | Time ajuda a terminar algo bloqueado |

> [!tip] WIP protege foco
> Se WIP estoura, alguém para de começar coisa nova e ajuda a terminar algo bloqueado.

---

### 6.4.3 Sprint Backlog: Histórias Viram Tarefas, mas o Sprint Não Cresce

**O que PODE mudar dentro do Sprint:**

✅ Pode:
- Quebrar tarefas melhor
- Trocar quem faz
- Refinar subtarefas
- Melhorar qualidade sem aumentar escopo

**❌ NÃO pode:**
- Entrar história nova
- "Só mais isso" do PO
- "Insight genial" do dev que muda o objetivo

📌 **No texto:** "Lampejos de criatividade" são risco real. O SM precisa proteger o Sprint disso.

---

**"Frase-padrão do SM" (pra manter cultura):**

> "Boa ideia. Vamos colocar no backlog e avaliar no próximo Planning. Agora, nosso compromisso é entregar o Sprint Goal."

---

## 6.5 Daily Scrum (Como Usar o Quadro de Verdade)

### 6.5.1 Objetivo

Sincronizar e remover impedimentos, **não resolver problemas ali**.

---

### 6.5.2 Formato Clássico (Ainda Didático)

1. **O que fiz ontem?**
2. **O que farei hoje?**
3. **Quais obstáculos?**

📌 **Regra operacional:**
- Cada fala atualiza post-its
- O quadro é "a verdade" pública do Sprint

**✅ Duração:**
- Até 15 min total
- ~90s por pessoa (como o texto sugere)

---

### 6.5.3 Anti-pattern (Muito Comum)

| Erro | Sintoma | Correção |
|------|---------|----------|
| Daily vira "status pro chefe" | Pessoas reportam para gerente | SM reforça: é para o time, não para chefe |
| Daily vira "reunião técnica" | Debate de solução técnica detalhada | Debate técnico vai para "after daily" só com envolvidos |
| Daily vira "debate de arquitetura" | Discussão de design longo | SM registra impedimento e trata fora da daily |

---

## 6.6 Proteção do Sprint: O Que o Scrum Master Realmente Faz

No Cap. 6 isso é central: **o Sprint tem que ser protegido**.

### 6.6.1 Responsabilidades "Visíveis"

- ✅ Impedir entrada de novas histórias
- ✅ Garantir recursos (acesso, infra, permissões, ambiente)
- ✅ Remover bloqueios
- ✅ Garantir ritos (daily/review/retro)
- ✅ Manter o foco no Sprint Goal

---

### 6.6.2 Obstáculos Invisíveis (Os Piores)

- Estranheza com ausência de hierarquia
- Medo de "autogestão"
- Gente esperando ordens
- Conflitos de prioridade internos

📌 **O texto sugere "acessórios motivadores" (quebrar gelo):**
- Títulos criativos
- Cultura leve
- Reforçar que todos são iguais no Sprint

---

## 6.7 Burndown como Radar (e Não como Chicote)

### 6.7.1 O Burndown Serve Para:

- Visualizar se o Sprint está "atrás"
- Permitir correção rápida (ajuste de plano interno)

---

### 6.7.2 Como Usar Direito

✅ **Atualiza diariamente**
✅ **Se desvia muito:** investigar causa (bloqueio? subestimativa? tarefa grande?)

**❌ Como NÃO usar:**
- Punir pessoas
- "Cobrar" individualmente pontos

> [!warning] Burndown é ferramenta de transparência
> Serve para o time se auto-organizar, não para gerente cobrar.

---

## 6.8 Final do Sprint: Review e Retrospective

### 6.8.1 Sprint Review (com PO)

**Objetivo:** Validar incremento e colher feedback real.

**Timebox:** 30–60 min (Sprint 1 semana) / 60–120 min (Sprint 2 semanas)

**Roteiro prático:**

1. **Relembrar Sprint Goal**
2. **Demo do que funciona** (sem slide, com produto)
3. **Para cada história:** mostrar critério de aceite
4. **PO aceita ou não aceita**
5. **Itens novos viram backlog** (não viram "corrigir agora")

**✅ Saída:**
- Lista de aceites
- Lista de ajustes (backlog)
- Aprendizado do produto

---

### 6.8.2 Sprint Retrospective (Time + SM; PO Opcional)

**Objetivo:** Melhorar o processo.

**Timebox:** 30–60 min

**Roteiro simples:**

1. **O que funcionou?**
2. **O que deu ruim?**
3. **O que vamos tentar melhorar no próximo Sprint?** (1–3 ações)

📌 **Dica forte:**
- Se tiver muita maturidade, convidar PO pode melhorar alinhamento
- Mas só se for ambiente seguro (sem caça às bruxas)

**✅ Saída:**
- 1–3 ações mensuráveis pro próximo Sprint (ex.: "limitar WIP a 3")

---

# Exemplos Práticos Completos

## Exemplo 1: Oficina do Cap 5 (Mapa Mental → Backlog → Poker)

**Cenário:** Produto UzzAI "Assistente de Atendimento"

### Workshop 1: Descoberta (120 min)

**Saída:**
- Mapa mental com 5 ramos (Canais, Fluxo, IA, Operação, Métricas)
- 40 post-its coletados
- 12 histórias candidatas

### Workshop 2: Priorização (90 min)

**Saída:**
- 8 histórias ordenadas por BV (Planning Poker)
- MVP definido: "Usuário abre chamado no WhatsApp e recebe triagem + 1 solução com fonte"

### Workshop 3: Estimativa (120 min)

**Saída:**
- 8 histórias com W estimado (Fibonacci)
- 2 épicos quebrados (RAG completo → RAG básico + RAG avançado)
- Backlog "pronto para Sprint"

> [!example] Detalhes completos
> Veja `Templates_Oficinas_Cap5-6.md` para scripts completos.

---

## Exemplo 2: Sprint 1 do GiftWizz (Planning → Kanban → Daily → Review/Retro)

**Sprint Goal:**
> "Usuário autoriza acesso à rede social e recebe 1 sugestão de presente para 1 amigo."

**Histórias no Sprint:**
- ID 5 (autorização e dados)
- ID 1 (sugestão)

**Tarefas (quadro):**

| To Do | Doing (WIP 3) | Done | Aceito |
|-------|---------------|------|--------|
| 5.1 login API | 5.1 | ... | PO move na review |
| 5.2 permissões | 5.2 | | |
| 5.3 buscar amigos | 5.5 | | |
| 5.4 armazenar local | | | |
| 5.5 base de presentes | | | |
| 1.1 selecionar amigo | | | |
| 1.2 sugerir presente | | | |

**✅ No meio do Sprint surge:** "cupom de desconto" (ID 2)
**SM:** "Vai pro backlog, entra no próximo Sprint se couber."

> [!example] Detalhes completos
> Veja seção 6.9 do guia completo para simulação completa.

---

# Checklists Operacionais

## Checklist: Pronto para Primeiro Sprint

### Antes do Planning:

- [ ] Product Backlog priorizado (mínimo 10–15 itens no topo)
- [ ] Histórias passam INVEST (principalmente S + T)
- [ ] Épicos foram quebrados
- [ ] PO tem poder real de decisão
- [ ] Time completo (5–9 pessoas, multidisciplinar)
- [ ] DoR (Definition of Ready) definido
- [ ] DoD (Definition of Done) definido
- [ ] Ferramentas escolhidas (quadro, burndown)
- [ ] Cerimônias agendadas (daily, review, retro)

---

## Checklist: Durante o Sprint

### Segunda (Planning):

- [ ] Sprint Goal definido e claro para todos
- [ ] Histórias selecionadas do topo do backlog
- [ ] Histórias quebradas em tarefas ≤ 1 dia
- [ ] Quadro montado (To Do / Doing / Done / Aceito)
- [ ] WIP definido e comunicado
- [ ] Time se comprometeu com Sprint Goal

### Terça–Sexta (Execução):

- [ ] Daily aconteceu e durou <15min
- [ ] Impedimentos identificados e sendo removidos
- [ ] Burndown atualizado diariamente
- [ ] Tarefas sendo finalizadas (não "tudo in progress")

### Sexta (Review + Retro):

- [ ] Review teve demo funcional (sem slides)
- [ ] PO deu aceite (ou rejeitou com clareza)
- [ ] Stakeholders participaram e deram feedback
- [ ] Retro gerou 1–3 ações mensuráveis
- [ ] Time está motivado (não desmotivado ou sobrecarregado)

⚠️ **Se qualquer item está "Não" por 2 Sprints consecutivos → problema sistêmico, agir na Retro.**

---

# Erros Comuns e Anti-padrões

## Erros de User Stories e Backlog

| Erro | Sintoma | Correção |
|------|---------|----------|
| **História vira tarefa técnica** | "Modelar banco de dados" | Reescreve em linguagem de valor: "Como usuário, quero salvar dados para não perder informação" |
| **Tudo é épico** | Estimativa sempre > 13 pontos | Quebrar por fluxo/happy path/persona |
| **Backlog vira lista técnica** | "Setup CI/CD", "Definir stack" | Isso é tarefa/habilitação, não User Story |

---

## Erros de Planning Poker

| Erro | Sintoma | Correção |
|------|---------|----------|
| **Poker vira briga** | Discussão infinita sobre estimativa | Exigir defesa de extremos + 2 rodadas no máximo |
| **"?" vira chute** | Time estima sem informação | Registrar como ação: "Spike de 4h para testar X" |
| **BV e W misturados** | Confusão entre valor e esforço | Separar em 2 workshops (BV primeiro, W depois) |

---

## Erros de Sprint

| Erro | Sintoma | Correção |
|------|---------|----------|
| **"Sprint vira backlog aberto"** | Histórias entrando no meio do Sprint | SM bloqueia entrada e joga pro próximo Planning |
| **Tarefas grandes (3–5 dias)** | Tarefa não sai de "Doing" | Quebrar em sub-tarefas |
| **Done = "terminei no meu PC"** | Código não testado/revisado | Definir DoD (testes, review, deploy) |
| **Review vira reunião de status** | Sem demo funcional | Obrigar demo funcional (mesmo que em staging) |
| **Retro sem ação** | Reclamação sem melhoria | Escolher 1 melhoria e medir |

---

## Erros de Processo

| Erro | Sintoma | Correção |
|------|---------|----------|
| **PO sem poder real** | Backlog vira teatro | PO precisa ter autoridade de decisão |
| **Stakeholder demais** | Ruído e politicagem | Limitar participantes (só quem decide/executa/usa) |
| **Sprint Zero vira "pré-projeto eterno"** | Planejamento infinito | Timebox: 1–2 semanas no máximo |

---

# Glossário

**BV (Business Value):** Valor pro negócio (cliente/PO)

**W (Workload):** Carga de trabalho (time)

**WIP (Work in Progress):** Limite de tarefas ativas simultaneamente

**DoR (Definition of Ready):** Critérios para história entrar no Sprint

**Stealth Scrum:** Introduzir Scrum sem usar jargão (linguagem de resultado)

**Pequena vitória:** Incremento funcional demonstrável (PO consegue validar)

---

# Referências

- **GUIA-SCRUM-UZZAI.md** (Parte 1): Fundamentos, Scrum Base, XP
- **Templates_Oficinas_Cap5-6.md**: Scripts de facilitação completos
- **Mermaid_Cap5-6.md**: Diagramas prontos para uso
- **Resumo_Executivo_Cap5-6.md**: "O que fazer amanhã" (1–2 páginas)

---

**📊 Última Atualização:** 2026-01-05  
**👤 Autor:** UzzAI  
**📈 Versão:** 2.0 (Parte 2: Capítulos 5 e 6)  
**🔄 Próxima Revisão:** Trimestral (ou quando houver mudança significativa)

---

*Sistema: Guia Scrum UzzAI — Parte 2*  
*Framework: User Stories + Product Backlog + Planning Poker + Execução de Sprints*  
*Baseado em: Cesar Brod + Extreme Programming + Manifesto Ágil + práticas de mercado*

