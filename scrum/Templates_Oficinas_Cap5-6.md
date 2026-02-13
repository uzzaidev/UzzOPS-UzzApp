---
created: 2026-01-05
updated: 2026-01-05T20:00
tags:
  - scrum
  - agile
  - uzzai
  - templates
  - workshops
  - facilitação
version: 2
---

# TEMPLATES DE OFICINAS — Capítulos 5 e 6

> **Scripts de facilitação replicáveis para User Stories, Product Backlog e Sprints**
> Use estes templates como guia para facilitar workshops e cerimônias Scrum

---

## Índice

1. [Workshop 1: Descoberta + Mapa Mental](#workshop-1-descoberta--mapa-mental)
2. [Workshop 2: Priorização + Poker BV](#workshop-2-priorização--poker-bv)
3. [Workshop 3: Estimativa + Poker W](#workshop-3-estimativa--poker-w)
4. [Template: User Story UzzAI](#template-user-story-uzzai)
5. [Sprint Planning A (com PO)](#sprint-planning-a-com-po)
6. [Sprint Planning B (só Time)](#sprint-planning-b-só-time)
7. [Daily Scrum (Script)](#daily-scrum-script)
8. [Sprint Review (Script)](#sprint-review-script)
9. [Sprint Retrospective (Script)](#sprint-retrospective-script)

---

# Workshop 1: Descoberta + Mapa Mental

## 🎯 Objetivo

Sair com:
- Um mapa mental do produto/processo
- 20–60 "ideias/necessidades" em post-its
- 10–20 histórias candidatas

**Timebox:** 90–120 min

---

## 📋 Preparação (Antes da Oficina)

### Quem Participa

| Papel | Quantidade | Função |
|-------|------------|--------|
| **PO (obrigatório)** | 1 | Tem poder de decisão e orçamento/escopo |
| **Usuários reais** | 2–4 | Gente que "vai sofrer/ganhar" com o sistema |
| **Operação/Processo** | 1–2 | Quem entende fluxo, gargalo, regra |
| **Time técnico** | 2–6 | Dev, dados, produto, integrações |
| **Stakeholder (opcional)** | 0–2 | Vendas, jurídico, compliance (só se agregarem) |

📌 **Regra UzzAI:** Ninguém entra só pra "opinar". Ou traz contexto real, ou decide, ou executa.

---

### Materiais Necessários

- ✅ Quadro (Miro/Whimsical/Obsidian Canvas) ou físico
- ✅ Post-its digitais (ou físicos: amarelo padrão)
- ✅ Timer visível
- ✅ Canetas/marcadores
- ✅ Template de User Story (impresso/colado)

---

### Pré-brief (Enviar Antes, 5 Linhas)

```
Assunto: Workshop de Descoberta — [Nome do Produto]

Olá,

No dia [DATA], vamos fazer um workshop de descoberta para [PRODUTO].

Objetivo: priorizar 1 objetivo e sair com uma lista ordenada.
Formato: não é reunião de solução técnica.
Regras: sem jargão; falaremos na linguagem do usuário.
Duração: 90–120 minutos.

Mudanças e ideias são bem-vindas, mas com timebox.

Até lá!
```

---

## 📅 Roteiro Minuto a Minuto

### 0–10 min — Abertura e Regras

**Facilitador fala:**

> "Bem-vindos ao workshop de descoberta do [PRODUTO]. Nosso objetivo é sair daqui com um mapa mental do que precisamos construir e 10–20 histórias candidatas priorizadas."

**Perguntas de contexto:**

> "Qual é o resultado que queremos em 3 meses?"
> "O que é sucesso mensurável?"

**Regras (fixar no quadro):**

1. ✅ 1 ideia por post-it
2. ✅ Sem solução técnica
3. ✅ Sem debate longo
4. ✅ Timebox rigoroso

---

### 10–25 min — "Dor + Meta + Restrição"

**Facilitador conduz (escreve no quadro):**

**🔎 Qual é a dor hoje?**
- Tempo
- Custo
- Erro
- Retrabalho

**🔎 Qual métrica melhora?**
- Ex.: tempo de resposta, taxa de conversão

**🔎 Qual restrição existe?**
- LGPD
- Canal obrigatório
- Integrações

**Saída:** Um bloco "Contexto do problema" fixo no topo do quadro.

---

### 25–45 min — Post-its Individuais (Silêncio)

**Facilitador fala:**

> "Agora vamos para escrita individual. Cada pessoa escreve post-its com ideias/necessidades. Regras: 1 ideia por post-it, sem solução técnica, pensem no resultado que precisam ver."

**Perguntas orientadoras (projetar no quadro):**

- "O que eu preciso que exista pra isso funcionar?"
- "O que mais me atrapalha hoje?"
- "Que resultado eu preciso ver em 1 semana?"

**✅ Dica:** 15–20 post-its por pessoa é comum.

**Timer:** 20 minutos de silêncio (facilitador monitora, não interfere).

---

### 45–70 min — Agrupamento e Mapa Mental

**Facilitador conduz:**

1. **Cada pessoa cola seus post-its no quadro**
2. **Facilitador agrupa por similaridade** (perguntando: "Isso parece com quê?")
3. **Cria ramos do mapa mental:**
   - Canais
   - Fluxo do usuário
   - Dados/IA
   - Operação
   - Métricas
   - Riscos/Compliance

📌 **Regra:** Se um post-it não encaixa em ramo → cria ramo novo (não descarta).

**Saída:** Mapa mental visual com post-its agrupados.

---

### 70–95 min — Transformar Clusters em Histórias

**Facilitador conduz (escreve ao vivo):**

Para cada cluster, converte 1–3 itens em User Stories.

**Formato curto:**
> "Como [persona], quero [ação] para [objetivo]."

✅ **Aqui você já aplica o "elevador":** se não dá pra falar em 30s, é épico.

**Exemplo (cluster "Canais"):**
- Post-it: "WhatsApp"
- História: "Como usuário, quero abrir chamado via WhatsApp para ser atendido no canal que uso mais."

**Timer:** 2–3 min por cluster (ajustar conforme número de clusters).

---

### 95–120 min — Fechamento e Próximos Passos

**Facilitador consolida:**

1. **Lista "top 10 candidatas"** (histórias que apareceram mais)
2. **Lista "dúvidas/assunções"** (coisas que precisam ser esclarecidas)
3. **Agenda do Workshop 2** (priorização)

**Facilitador pergunta:**

> "Alguém tem algo a adicionar antes de finalizarmos?"

**Saída do workshop:**
- Mapa mental completo
- 10–20 histórias candidatas (formato User Story)
- Lista de dúvidas/assunções
- Data do Workshop 2 agendada

---

## ✅ Como Testar se Funcionou

- [ ] Mapa mental tem pelo menos 3 ramos
- [ ] Histórias falam de usuário (não de tecnologia)
- [ ] Pelo menos 10 histórias candidatas escritas
- [ ] Participantes entendem o que vai ser construído
- [ ] Dúvidas/assunções registradas

---

## 🐛 Debug Rápido

| Problema | Causa Provável | Solução |
|----------|----------------|---------|
| Post-its muito técnicos | Time técnico dominou | Facilitador intervém: "Isso é tarefa, reescreva como resultado" |
| Poucos post-its | Participantes tímidos | Facilitador dá exemplos: "Como X, quero Y para Z" |
| Histórias muito grandes | Não aplicou "elevador" | Facilitador quebra: "Isso parece épico, vamos dividir" |

---

# Workshop 2: Priorização + Poker BV

## 🎯 Objetivo

Sair com:
- Backlog ordenado por valor (BV)
- 1 MVP explícito
- 3–5 "não entra agora"

**Timebox:** 60–90 min

---

## 📋 Preparação

**Participantes:** Mesmos do Workshop 1 (pode incluir mais stakeholders se necessário)

**Materiais:**
- ✅ Histórias do Workshop 1 (em post-its ou lista)
- ✅ Baralho Planning Poker (físico ou app)
- ✅ Quadro/Tela para ordenar histórias
- ✅ Timer

---

## 📅 Roteiro Prático

### 0–10 min — Relembrar Objetivo e Métricas

**Facilitador fala:**

> "No Workshop 1, coletamos [X] histórias. Hoje vamos priorizar por valor. A pergunta chave: se só pudéssemos entregar 1 coisa em 2 semanas, o que seria?"

**Relembrar métricas de sucesso:**
- "O que é sucesso para este produto?"
- "Qual métrica importa mais?"

---

### 10–20 min — Choque de Foco (A Dinâmica do Livro)

**Facilitador divide em 3 grupos** (máx. 4 por grupo, misturados)

**Instruções:**

> "Cada grupo recebe todas as histórias. Escolham 5 histórias prioritárias."

**Timer:** 5 minutos

**Depois:**

> "Agora escolham 1: a história pela qual vocês dariam a vida."

📌 **Essa frase funciona porque força trade-off real.**

**Timer:** 2 minutos

**Cada grupo apresenta:** 1 história escolhida + justificativa (30s por grupo).

---

### 20–60 min — Poker BV (Prioridade)

**Facilitador explica:**

> "Vamos estimar VALOR de cada história. Cada pessoa vota com carta do Planning Poker. Lembrem-se: BV = Business Value (valor pro negócio)."

**Mecânica (por história):**

1. **Mostra 1 história por vez** (lê em voz alta)
2. **Todos escolhem carta em silêncio**
3. **Revela ao mesmo tempo** ("3, 2, 1, mostrem!")
4. **Se houver extremos (0/∞/13/21), peça:**
   - "Quem deu alto, defenda em 30s."
   - "Quem deu baixo, defenda em 30s."
5. **Re-vota se necessário (1 rodada máximo)**

✅ **Como calcular rápido:**
- Use mediana (melhor que média)
- Conte "∞" como desempate (prioridade alta)

**Timer:** 3–5 min por história (ajustar conforme número de histórias)

**Saída:** Histórias ordenadas por BV (valor alto no topo).

---

### 60–90 min — Definir MVP (Em Linguagem do Cliente)

**Facilitador pergunta:**

> "Se tivéssemos que lançar algo em 2 semanas que PROVA valor, o que seria?"

**Formato MVP:**
- Usuário consegue fazer X
- Sem travar operação
- Com 1 métrica mínima

**Exemplo:**

> "Usuário abre chamado no WhatsApp e recebe triagem + 1 solução com fonte; se confiança < X, escala com resumo."

**Facilitador escreve MVP no quadro e pergunta:**

> "Todos concordam que isso é o MVP?"

**Saída:**
- MVP definido (1 frase clara)
- Histórias que compõem o MVP identificadas
- Histórias "não entra agora" separadas (podem voltar depois)

---

## ✅ Como Testar se Funcionou

- [ ] Histórias ordenadas por BV (valor alto no topo)
- [ ] MVP definido em linguagem do cliente
- [ ] Participantes concordam com priorização
- [ ] Histórias "não entra agora" separadas

---

## 🐛 Debug Rápido

| Problema | Causa Provável | Solução |
|----------|----------------|---------|
| Poker vira briga | Discussão infinita | Facilitador corta: "Defesa 30s, depois re-vota 1 vez" |
| Todos dão "∞" | Sem trade-off | Facilitador força: "Se tudo é vital, nada é vital" |
| MVP muito grande | Não aplicou "mínimo" | Facilitador questiona: "O que é o MÍNIMO que prova valor?" |

---

# Workshop 3: Estimativa + Poker W

## 🎯 Objetivo

Sair com:
- W estimado em Fibonacci
- Épicos quebrados
- Histórias prontas para Sprint (INVEST ok)

**Timebox:** 90–120 min

---

## 📋 Preparação

**Participantes:** Time técnico (obrigatório) + PO (só esclarece, não pressiona)

**Materiais:**
- ✅ Histórias priorizadas do Workshop 2
- ✅ Baralho Planning Poker
- ✅ Quadro/Tela
- ✅ Timer

---

## 📅 Roteiro

### 0–15 min — "Definition of Ready" (DoR) Simples

**Facilitador explica:**

> "Uma história só entra em Sprint se tiver:"

- ✅ Persona clara
- ✅ Objetivo claro
- ✅ Critério de aceite
- ✅ Dados/integração identificados (se houver)
- ✅ Dúvida crítica resolvida ou Spike planejado

**Facilitador pergunta:**

> "Alguma história não está pronta? O que falta?"

**Registra:** Lista de histórias que precisam ser refinadas.

---

### 15–60 min — Poker W (Time Vota)

**Facilitador explica:**

> "Agora vamos estimar ESFORÇO (W = Workload). Time técnico vota. PO participa só pra esclarecer contexto, não pressiona."

**Mecânica (igual Poker BV, mas foco em ESFORÇO):**

1. **Mostra 1 história por vez**
2. **Time escolhe carta em silêncio** (PO só observa)
3. **Revela ao mesmo tempo**
4. **Se houver extremos, peça defesa (30s)**
5. **Re-vota 1 vez se necessário**

**⚠️ Carta "?" vira ação:**

- "Qual dúvida falta?"
- "Precisa de Spike?"

**Facilitador registra:** Histórias com "?" viram Spikes (com timebox).

**Timer:** 3–5 min por história

**Saída:** Histórias com W estimado (Fibonacci).

---

### 60–90 min — Quebra de Épicos (Técnica de Fatiamento)

**Facilitador identifica:**

> "Quais histórias receberam 13 ou 21? Essas são épicos. Vamos quebrar."

**Para cada épico, aplicar padrão:**

**✅ Fatiamento "Happy path primeiro":**
- História 1: fluxo principal funcionando
- História 2: exceções comuns
- História 3: exceções raras

**✅ Fatiamento "Risco primeiro":**
- Spike: testar integração/latência/custo LLM
- Depois: implementar o mínimo baseado no resultado

**Facilitador escreve:** Histórias quebradas (mantém rastreabilidade do épico original).

**Timer:** 10–15 min por épico

---

### 90–120 min — Montar "Sprint 1 Candidato"

**Facilitador pergunta:**

> "Quantos pontos conseguimos fazer em 1 Sprint? (Começamos conservador, sem histórico de velocity)"

**Time escolhe histórias até "caber"** (considerando capacidade estimada).

**Facilitador pergunta:**

> "Qual é o Sprint Goal? (1 frase)"

**Escreve:** Sprint Goal no quadro.

**Facilitador pergunta:**

> "Critérios de aceite estão claros para cada história?"

**Ajusta se necessário.**

**Saída:**
- Sprint Goal (1 frase)
- Histórias do Sprint 1 (com W estimado)
- Critérios de aceite definidos
- Backlog restante ordenado

---

## ✅ Como Testar se Funcionou

- [ ] Histórias têm W estimado (Fibonacci)
- [ ] Épicos foram quebrados
- [ ] Histórias passam INVEST (principalmente S + T)
- [ ] Sprint Goal definido
- [ ] Time se compromete com Sprint 1

---

## 🐛 Debug Rápido

| Problema | Causa Provável | Solução |
|----------|----------------|---------|
| Time sempre dá "?" | Falta informação | Facilitador registra como Spike (não chutar) |
| Épicos não quebrados | Time aceita histórico grande | Facilitador força: "13 pontos não cabe, quebra" |
| Sprint 1 muito ambicioso | Time superestima capacidade | Facilitador lembra: "Começamos conservador" |

---

# Template: User Story UzzAI

## Formato Básico

```markdown
## US-XXX: [Título curto da história]

**Como** [persona]
**Quero** [ação]
**Para** [objetivo de negócio]

### Critério de Aceite
- [ ] Critério 1: [descrição observável]
- [ ] Critério 2: [descrição observável]
- [ ] Critério 3: [descrição observável]

### Métrica Mínima
[Número/limite verificável]

### Notas / Restrições
- LGPD / canais / integrações

### Dependências (se houver)
- Depende de US-YYY
- Depende de integração com sistema Z

### Dúvidas
- ?
```

---

## Exemplo Preenchido

```markdown
## US-042: Resposta inicial em até 10s

**Como** usuário final
**Quero** receber resposta inicial em até 10s
**Para** não abandonar o chat

### Critério de Aceite
- [ ] Usuário envia mensagem no WhatsApp
- [ ] Sistema responde em < 10s (mesmo que seja mensagem padrão)
- [ ] Resposta é visível na interface do chat

### Métrica Mínima
- 95% das mensagens respondidas em < 10s
- Latência média < 8s (medido em ambiente de teste)

### Notas / Restrições
- Canal: WhatsApp Business API
- LGPD: dados de conversa armazenados criptografados
- Fallback: se LLM não responde em 10s, retorna mensagem padrão

### Dependências
- Depende de US-041 (Widget chat funcional)

### Dúvidas
- Qual é a latência atual do LLM? (Spike de 4h planejado)
```

---

# Sprint Planning A (com PO)

## 🎯 Objetivo

Escolher histórias do Sprint, alinhar entendimento e compromisso.

**Timebox:** 45–90 min (Sprint 1 semana) / 90–120 min (Sprint 2 semanas)

**Participantes:** PO + time + SM

---

## 📅 Roteiro Prático

### 1. Sprint Goal (10 min)

**SM pergunta:**

> "Qual é o objetivo deste Sprint? (1 frase)"

**PO responde** (SM escreve no quadro):

> "Ao final deste Sprint, o usuário consegue X."

**SM pergunta:**

> "Todos entendem o Sprint Goal?"

---

### 2. Selecionar Histórias (20–40 min)

**SM pergunta:**

> "Quais histórias do topo do backlog compõem o Sprint Goal?"

**Time escolhe** (considerando capacidade estimada).

**PO esclarece dúvidas de negócio** (sem entrar em implementação).

**SM registra:** Lista de histórias do Sprint.

---

### 3. Critérios de Aceite (15–30 min)

**Para cada história, PO define critérios de aceite mínimos:**

**SM pergunta:**

> "PO, o que precisa acontecer para você aceitar esta história?"

**PO responde** (SM escreve).

**SM pergunta:**

> "Time, esses critérios estão claros?"

---

### 4. Confirmação (5–10 min)

**SM pergunta:**

> "PO, você entende o que vai ver na Review?"

**PO confirma.**

**SM pergunta:**

> "Time, vocês se comprometem com o Sprint Goal e essas histórias?"

**Time confirma.**

---

## ✅ Saída Obrigatória

- ✅ Sprint Goal (1 frase)
- ✅ Lista de histórias do Sprint (Sprint Backlog – nível "história")
- ✅ Critérios de aceite em linguagem do PO

---

# Sprint Planning B (só Time)

## 🎯 Objetivo

Quebrar histórias em tarefas técnicas e montar o quadro.

**Timebox:** 60–120 min

**Participantes:** Equipe + SM (PO fora)

---

## 📅 Roteiro Prático

### 1. Quebrar em Tarefas (30–60 min)

**Para cada história, time decompõe em tarefas:**

**SM pergunta:**

> "O que precisa ser feito para entregar esta história?"

**Time escreve tarefas** (post-its ou quadro).

**SM valida:**

> "Cada tarefa cabe em 0,5–1 dia? Se não, quebra mais."

---

### 2. Estimar/Validar Esforço (10–20 min)

**Time valida rapidamente** (sem Poker formal, só alinhamento rápido).

**SM pergunta:**

> "Essas tarefas cabem no Sprint?"

---

### 3. Montar Quadro (10–20 min)

**SM configura quadro:**

```
To Do | Doing (WIP: 3) | Done | Aceito
```

**Time distribui tarefas no "To Do".**

**SM pergunta:**

> "WIP de quantas tarefas? (recomendado: 2–4)"

**Time define WIP.**

---

### 4. Compromisso (5–10 min)

**SM pergunta:**

> "Time, vocês se comprometem com o Sprint Goal e essas tarefas?"

**Time confirma.**

---

## ✅ Saída Obrigatória

- ✅ Histórias quebradas em tarefas (≤ 1 dia cada)
- ✅ Quadro montado (To Do / Doing / Done / Aceito)
- ✅ WIP definido
- ✅ Time comprometido com Sprint Goal

---

# Daily Scrum (Script)

## 🎯 Objetivo

Sincronizar time e identificar impedimentos (não resolver problemas ali).

**Timebox:** 10–15 min

**Participantes:** Time (obrigatório), SM (facilita), PO (opcional)

---

## 📅 Roteiro (Formato Clássico)

**SM inicia:**

> "Bom dia, pessoal. Vamos ao Daily. Lembrem-se: status + impedimentos. Não vamos resolver problemas aqui."

**Para cada pessoa (90s):**

1. **O que fiz ontem?** (que moveu a entrega)
2. **O que farei hoje?**
3. **Quais obstáculos?**

**SM registra impedimentos** (não resolve ali).

**SM atualiza quadro** (move post-its conforme fala).

**No final (2 min):**

**SM pergunta:**

> "Algum impedimento precisa ser resolvido agora? (marca encontro pós-Daily)"

**SM fecha:**

> "Ok, Daily encerrado. Próximo Daily: [horário]."

---

## ✅ Como Testar se Funcionou

- [ ] Daily durou <15min
- [ ] Impedimentos identificados e registrados
- [ ] Quadro atualizado
- [ ] Nenhum problema resolvido durante Daily (só registrado)

---

## 🐛 Debug Rápido

| Problema | Solução |
|----------|---------|
| Daily > 15min | SM corta: "Debate técnico vai para after Daily" |
| Ninguém fala | SM pergunta diretamente: "João, o que você fez ontem?" |
| Daily vira reunião técnica | SM interrompe: "Isso é assunto para depois, vamos continuar" |

---

# Sprint Review (Script)

## 🎯 Objetivo

Validar incremento e colher feedback real.

**Timebox:** 30–60 min (Sprint 1 semana) / 60–120 min (Sprint 2 semanas)

**Participantes:** PO, SM, Time, Stakeholders

---

## 📅 Roteiro Prático

### 1. Relembrar Sprint Goal (2 min)

**SM fala:**

> "Bem-vindos ao Sprint Review. O Sprint Goal era: [objetivo]. Vamos ver o que foi entregue."

---

### 2. Demo do Que Funciona (20–40 min)

**Time mostra** (sem slides, com produto funcionando):

**Para cada história:**
- Time demonstra funcionalidade
- Mostra critério de aceite atendido
- PO valida (aceita ou não aceita)

**SM registra:** Lista de aceites.

---

### 3. Feedback (10–20 min)

**SM pergunta:**

> "Stakeholders, o que vocês acham? O que mudou no entendimento dos requisitos?"

**PO/stakeholders respondem.**

**SM registra:** Feedback e novos requisitos (viram backlog, não "corrigir agora").

---

### 4. Fechamento (5–10 min)

**SM consolida:**

- Histórias aceitas
- Histórias não aceitas (voltam pro backlog)
- Novos itens pro backlog (feedback)

**SM pergunta:**

> "Alguma dúvida antes de encerrarmos?"

---

## ✅ Como Testar se Funcionou

- [ ] Demo funcional (sem slides)
- [ ] PO deu aceite (ou rejeitou com clareza)
- [ ] Stakeholders participaram e deram feedback
- [ ] Novos itens viraram backlog (não "corrigir agora")

---

# Sprint Retrospective (Script)

## 🎯 Objetivo

Melhorar o processo.

**Timebox:** 30–60 min

**Participantes:** Time, SM (PO opcional, mas muitos recomendam excluir para time falar livremente)

---

## 📅 Roteiro Simples (Formato Start/Stop/Continue)

### 1. O Que Funcionou? (10–15 min)

**SM pergunta:**

> "O que funcionou bem neste Sprint?"

**Time responde** (SM escreve no quadro).

---

### 2. O Que Deu Ruim? (10–15 min)

**SM pergunta:**

> "O que não funcionou? O que atrapalhou?"

**Time responde** (SM escreve, sem julgamento).

---

### 3. O Que Vamos Melhorar? (10–20 min)

**SM pergunta:**

> "O que vamos tentar melhorar no próximo Sprint? Escolham 1–3 ações mensuráveis."

**Time escolhe** (SM escreve: ação + responsável + prazo).

---

### 4. Follow-up da Melhoria Anterior (5 min)

**SM pergunta:**

> "A melhoria do Sprint anterior foi implementada? Funcionou?"

**Time responde.**

---

## ✅ Como Testar se Funcionou

- [ ] Retro gerou 1–3 ações mensuráveis
- [ ] Ações têm responsável e prazo
- [ ] Time está motivado (não desmotivado)
- [ ] Follow-up da melhoria anterior feito

---

## 🐛 Debug Rápido

| Problema | Solução |
|----------|---------|
| Retro vira reclamação | SM pergunta: "E o que vamos fazer diferente?" |
| Sem ações | SM força: "Escolham pelo menos 1 ação" |
| PO presente e time não fala | SM pode sugerir: "PO, pode sair por 10 min?" (se ambiente inseguro) |

---

**📊 Última Atualização:** 2026-01-05  
**👤 Autor:** UzzAI  
**📈 Versão:** 2.0  
**🔄 Próxima Revisão:** Trimestral

---

*Sistema: Templates de Oficinas — Capítulos 5 e 6*  
*Framework: Scripts de Facilitação Replicáveis*  
*Baseado em: Cesar Brod + Extreme Programming + Manifesto Ágil*
