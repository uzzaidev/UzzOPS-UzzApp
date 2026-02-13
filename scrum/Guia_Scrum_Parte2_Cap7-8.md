---
created: 2026-01-06
updated: 2026-01-10T17:29
tags:
  - scrum
  - agile
  - guia
  - estimativas
  - smells
---

# 📘 Guia Scrum UzzAI - Parte 2: Manutenção e Estimativas (Cap. 7-8)

## 🗺️ Mapa Rápido (Navegação)

- **Cap. 7** — Scrum "envelhece" na prática: cheiros detectáveis, causas raiz e correções verificáveis
- **Cap. 8** — Estimativas realistas: Story Points → Velocidade → Prazo → Investimento
- **Porcos vs Galinhas** — regra operacional para proteger Daily/Sprint sem virar "polícia"
- **ScrumButt Test** — checklist para saber se é "Scrum de verdade" ou apenas pedaços
- **Planning Poker** — técnica completa com extremos explicando e âncora relativa
- **Velocidade** — métrica central que converte pontos em previsão de prazo realista
- **Previsão por faixas** — como apresentar prazo sem prometer o impossível
- **Smells destroem previsibilidade** — conexão direta entre deterioração e dados fake
- **Dinâmicas replicáveis** — roteiros completos com métricas de sucesso (ver Playbooks)
- **Templates prontos** — checklists, scripts, agendas copiáveis (ver Templates)

---

## 📖 Glossário Rápido

| Termo | Definição Operacional |
|-------|----------------------|
| **Porcos** | Comprometidos com o Sprint (entram com "bacon"). Falam no Daily, puxam tarefas, são accountable pela entrega. |
| **Galinhas** | Envolvidos, mas não comprometidos. Podem assistir Daily, dar feedback em Review, esclarecer em Refinement — MAS não interferem. |
| **Sprint** | Timebox fixo (1-4 semanas) que termina com incremento testado e funcional. Duração NÃO muda. |
| **Burndown** | Gráfico de trabalho restante ao longo do Sprint. "Serrilhado" indica planejamento ruim ou interrupções. |
| **Velocidade** | Story Points entregues por Sprint (média observada após 2-4 Sprints). Base para previsão de prazo. |
| **Story Points** | Medida relativa de esforço: volume + complexidade + risco + testes. NÃO são horas. |
| **Planning Poker** | Técnica de estimativa colaborativa com cartas Fibonacci. Extremos explicam, time converge. |
| **Épico** | História grande demais para caber em 1 Sprint (carta ∞). Precisa ser decomposta. |
| **Spike** | Tarefa de pesquisa/prova técnica quando incerteza é alta (carta ?). |
| **Definition of Done** | Checklist mínimo para considerar história "pronta" (testado, integrado, documentado se necessário). |
| **ScrumButt** | "Usamos Scrum, mas..." — implementação parcial que estaciona sem colher benefícios. |
| **Smell** | Sinal observável de deterioração do Scrum (ex.: Daily vira status report, Sprint muda de duração). |

---

# 📍 CAPÍTULO 7 — Cheiros do Scrum e ScrumButt

## 🧭 Por que isso importa

Scrum "envelhece mal" se não for cultivado:
- Ritos viram burocracia
- Foco sai de entrega e vai para aprovação/status
- Proteção do Sprint desaparece
- Burndown e velocidade viram "números de mentira"

**Mike Cohn** propôs "Scrum Smells" (cheiros) como **sinais precoces** de deterioração, cada um com causa raiz típica e intervenção verificável.

**Esta seção é operacional**: para cada smell você tem ✅ sinais, 🔎 causa raiz, 🛠 intervenção, 📏 métricas, 🧪 teste de melhoria, 🗣 script pronto.

---

## 🦨 Catálogo de Cheiros do Scrum

### 1️⃣ Perda de Ritmo (Sprint com duração variável)

#### ✅ Sinais Observáveis
- [ ] Sprint muda de 1 semana para 2, depois volta para 1
- [ ] "Vamos estender só dessa vez porque não deu"
- [ ] Sprint vira "até terminar" (sem data fixa)
- [ ] Releases atrasam porque "Sprints não batem"

#### 🔎 Causa Raiz Provável
- Time não tem dedicação real (porcos divididos em 3 projetos)
- Falta de proteção: demanda "urgente" entra no meio
- Sprint virou "prazo negociável" culturalmente
- Gerência/cliente não respeita timebox

#### 🛠 Intervenção

**Curto prazo (1 Sprint)**
1. Definir cadência sagrada: ex. 2 semanas fixas pelos próximos 3 meses, sem exceção
2. Medir % de interrupção: toda tarefa "fora do backlog do Sprint" conta
3. Sprint termina na data, com o que foi possível entregar (escopo flexível, prazo fixo)

**Estrutural (3 Sprints)**
1. Escalonar com patrocinador: "Ou protege Sprint ou assume que não é Scrum"
2. Criar buffer separado para urgências (10-20% capacidade) OU aceitar que não é Scrum
3. Acordo explícito: PO pode trocar item do Sprint, mas não pode adicionar sem tirar equivalente

#### 📏 Métricas e Thresholds

| Métrica | Como medir | Threshold saudável | Red flag |
|---------|-----------|-------------------|----------|
| Duração do Sprint | Contar dias/semanas | Exatamente igual por 3+ ciclos | Variação > 0 dias |
| % Interrupção | (tasks fora backlog / total tasks) × 100 | < 10% | > 25% |
| Carry-over | Stories arrastadas para próximo Sprint | < 15% | > 30% |
| Burndown estável | Visual: linha sem serrilhado extremo | Declínio suave | Flat até dia N-2, depois queda vertical |

#### 🧪 Teste de Melhoria (após 1-3 Sprints)
- [ ] Sprint durou exatamente o combinado por 3 ciclos consecutivos
- [ ] Burndown menos serrilhado (trabalho distribuído)
- [ ] Menos histórias arrastadas (carry-over < 15%)
- [ ] Time consegue dizer "não" para interrupções sem culpa

#### 🗣 Script do Facilitador

**Quando pressionarem para estender Sprint:**
> "Sprint termina na data combinada. Podemos re-priorizar o que entra, mas não estendemos o timebox. O que não couber, volta para o backlog e entra no próximo Sprint."

**Ao apresentar para patrocinador:**
> "Sprint fixo nos dá previsibilidade. Se toda vez mudarmos, perdemos capacidade de estimar prazo. Prefere previsibilidade ou preferimos entregar 'tudo' sem data confiável?"

---

### 2️⃣ Galinhas Falantes (não-comprometidos falando no Daily)

#### ✅ Sinais Observáveis
- [ ] Daily vira reunião para gestor "dar direcionamento"
- [ ] Cliente/QA externo manda prioridade no meio do Daily
- [ ] Time olha para "chefe" esperando aprovação
- [ ] Daily demora > 20 min porque "galinhas" debatem

#### 🔎 Causa Raiz
- Confusão entre **transparência** e **interferência**
- Cultura de comando-controle ainda forte
- Medo de desagradar stakeholder (então convidam para tudo)
- Falta de outros canais para feedback de stakeholder

#### 🛠 Intervenção

**Curto prazo (1 Sprint)**
1. Regra simples e pública: **No Daily, só porcos falam**
2. Galinhas podem assistir (transparência), anotar, e falar **depois** em canal apropriado
3. SM protege ativamente: corta interferência educadamente

**Estrutural (3 Sprints)**
1. Criar canais adequados:
   - Refinement: stakeholder esclarece valor/uso
   - Review: stakeholder dá feedback sobre entrega
   - Canal async: Slack/email para dúvidas não-urgentes
2. Se a "galinha" é realmente essencial para decisões diárias → **vire porco** (dedicação real + compromisso)
3. Treinar stakeholders: "Transparência sim, interferência não"

#### 📏 Métricas

| Métrica | Como medir | Threshold saudável |
|---------|-----------|-------------------|
| Duração Daily | Timer | 10-15 min |
| Falas de não-porcos | Contagem | 0 falas de direcionamento |
| Decisões revertidas | Quantas decisões do Daily foram revertidas por "chefe" | 0 |

#### 🧪 Teste de Melhoria
- [ ] Daily volta para 10-15 min
- [ ] Porcos falam para o time, não para observador
- [ ] Zero decisões revertidas por interferência externa
- [ ] Time se auto-organiza (escolhe tarefas, pede ajuda entre pares)

#### 🗣 Script do Facilitador

**Ao abrir Daily com observador presente:**
> "Daily é sincronização do time. Observadores são bem-vindos, mas perguntas e decisões ficam para depois. Vamos começar: quem quer começar?"

**Se galinha interromper:**
> "[Nome], ótima pergunta. Anota aí e a gente alinha logo depois do Daily, ok? Continuando, [Porco], você estava dizendo..."

---

### 3️⃣ Porcos que Faltam (ausência/horários flexíveis demais)

#### ✅ Sinais Observáveis
- [ ] Daily sem gente-chave (dev sênior, PO faltam regularmente)
- [ ] Decisões são tomadas e depois a pessoa tenta renegociar
- [ ] "Não sabia disso" vira frase comum
- [ ] Daily muda de horário toda semana para "acomodar todo mundo"

#### 🔎 Causa Raiz
- Falta de acordo explícito de horário fixo
- Remoto sem disciplina (reuniões "opcionais")
- Time distribuído em fusos muito diferentes (mal planejado)
- Porco não é realmente porco (comprometimento fake)

#### 🛠 Intervenção

**Curto prazo (1 Sprint)**
1. Definir janela fixa e inegociável: ex. 10:00-10:15 (timebox rígido)
2. Doc vivo com "horário de fechamento": decisões tomadas no Daily são finais
3. Regra: **Quem não participou aceita decisão** (salvo exceção crítica documentada)

**Estrutural (3 Sprints) — Remote-Friendly**
1. Gravar Daily curto (5 min resumo) para quem perdeu
2. Canal async para "impedimentos urgentes" entre Dailies
3. Se ausência > 20%, questionar se pessoa é realmente porco ou deveria ser galinha
4. Fusos inviáveis? Time precisa ser reestruturado ou aceitar async (não é Scrum clássico)

#### 📏 Métricas

| Métrica | Como medir | Threshold saudável | Red flag |
|---------|-----------|-------------------|----------|
| Presença no Daily | % participantes presentes | > 90% | < 75% |
| Redecisões | Quantas decisões precisaram ser reabertas | < 5% | > 20% |
| Retrabalho | Tasks refeitas por falta de alinhamento | < 10% | > 25% |

#### 🧪 Teste de Melhoria
- [ ] Presença média > 90% por 2-3 Sprints
- [ ] Menos "não sabia disso"
- [ ] Menos retrabalho
- [ ] Time confia que decisões "colam"

#### 🗣 Script do Facilitador

**Ao reforçar compromisso:**
> "Daily é 10:00-10:15, timebox fixo. Quem não pode vir precisa avisar no canal antes. Decisões tomadas aqui são finais — quem não estava, aceita e segue."

**Se alguém tentar rediscutir depois:**
> "Entendo teu ponto, mas isso foi decidido no Daily de ontem com [nomes presentes]. Se for crítico de verdade, traz para o time inteiro agora e reabrimos. Se não, segue e ajustamos no próximo Sprint."

---

### 4️⃣ Hábitos Persistentes (vícios do pré-Scrum sobrevivendo)

#### ✅ Sinais Observáveis
- [ ] Multitarefa: pessoa puxa 5 tarefas ao mesmo tempo, nenhuma avança
- [ ] Tarefas longas: "em progresso" há 5+ dias
- [ ] "Fazer tudo no final": burndown flat até dia N-2, depois tentam entregar tudo
- [ ] Pouca transparência: "tá indo", mas ninguém sabe detalhes

#### 🔎 Causa Raiz
- Time veio de waterfall/kanban sem WIP limit
- Cultura de "busy = produtivo" (muitas coisas abertas impressiona)
- Falta de definição de "pronto" clara
- Ninguém quebra histórias (tudo fica grande)

#### 🛠 Intervenção

**Curto prazo (1 Sprint)**
1. Micro-retro focada: "Por que nosso burndown está quebrando?"
2. Reduzir tamanho das histórias (voltar ao S.M.A.L.L. + T.E.S.T.A.B.L.E.)
3. WIP explícito no Kanban: máximo 1-2 tarefas por pessoa

**Estrutural (3 Sprints)**
1. Reforçar "Definition of Done": história só sai de "em progresso" quando testada e integrada
2. Daily pergunta: "O que está te impedindo de **fechar** essa tarefa hoje?"
3. Pair programming / swarming para tarefas travadas > 2 dias
4. Usar Mermaid/gráfico para visualizar WIP ao longo do Sprint

#### 📏 Métricas

| Métrica | Como medir | Threshold saudável | Red flag |
|---------|-----------|-------------------|----------|
| WIP médio | Tarefas "em progresso" / porcos | < 2 por pessoa | > 3 |
| Duração média tarefa | Tempo em "progresso" até "done" | < 3 dias | > 5 dias |
| Burndown smooth | Declínio diário constante | Linha suave | Flat → vertical no final |
| % "done" no meio | Stories fechadas até dia N/2 | > 40% | < 20% |

#### 🧪 Teste de Melhoria
- [ ] WIP por pessoa cai para 1-2
- [ ] Tarefas fecham em 1-3 dias
- [ ] Burndown declina suavemente (não serrilhado)
- [ ] Time entrega valor contínuo (não "tudo no final")

#### 🗣 Script do Facilitador

**No Daily, quando pessoa lista 5 tarefas "em progresso":**
> "Ok, estou vendo que você tem X, Y, Z, A, B abertas. Qual DELAS você vai fechar hoje? Vamos focar em terminar antes de abrir nova."

**Na Planning, ao ver história grande:**
> "Essa história cabe em 1-3 dias? Se não, vamos quebrar agora. Lembra: Small e Testable."

---

### 5️⃣ Scrummaster Delega Trabalhos (vira gerente)

#### ✅ Sinais Observáveis
- [ ] SM distribui tarefas: "Fulano faz isso, ciclano faz aquilo"
- [ ] Time espera SM dizer o que fazer
- [ ] SM "cobra" no Daily ("você disse que ia terminar, terminou?")
- [ ] Conflito de prioridade? SM decide sozinho

#### 🔎 Causa Raiz
- Time ainda espera "chefe" (cultura comando-controle)
- SM inseguro, tenta controlar para garantir entrega
- Confusão entre "facilitar" e "gerenciar"
- Empresa contratou SM mas quer gerente disfarçado

#### 🛠 Intervenção

**Curto prazo (1 Sprint)**
1. SM vira **facilitador + removedor de obstáculos**, não despachante
2. Time **puxa tarefa** (pull system), não recebe tarefa (push)
3. SM faz perguntas de desbloqueio, não de cobrança:
   - ❌ "Você terminou aquela tarefa?"
   - ✅ "O que está te impedindo de fechar essa tarefa? Posso ajudar?"

**Estrutural (3 Sprints)**
1. Rotatividade do SM: outra pessoa do time facilita Daily (quebra dependência)
2. Treinar time em auto-organização: "Quem puxa essa tarefa? Quem precisa parear?"
3. Se der conflito: SM **media discussão**, mas time decide (não decide "por cima")
4. SM reporta para fora do time (remoção de impedimentos, não status report)

#### 📏 Métricas

| Métrica | Como medir | Threshold saudável |
|---------|-----------|-------------------|
| Falas do SM no Daily | % do tempo | < 20% (só perguntas de desbloqueio) |
| Tarefas auto-atribuídas | Time puxa vs SM atribui | 100% time puxa |
| Decisões técnicas | Quem decide arquitetura/prioridade | Time decide (SM facilita) |

#### 🧪 Teste de Melhoria
- [ ] SM fala < 20% do tempo no Daily
- [ ] Time puxa tarefas sem esperar "ordem"
- [ ] Conflitos são mediados, não decididos de cima
- [ ] Time diz "somos auto-organizados" e age assim

#### 🗣 Script do Facilitador

**Quando time olha para SM esperando decisão:**
> "Não sou eu quem decide isso. Vocês são o time técnico. Qual é a melhor solução na opinião de vocês? Vamos discutir e decidir juntos."

**Ao ver tarefa livre no board:**
> "Temos a tarefa X livre. Quem se sente confortável para puxar? Alguém precisa parear para destravar?"

---

### 6️⃣ Daily é para o Scrummaster (relatório para chefe)

#### ✅ Sinais Observáveis
- [ ] Pessoas falam olhando para o SM, não para o time
- [ ] Frases começam com "Ontem EU fiz..." (individual) vs "A GENTE avançou..." (coletivo)
- [ ] SM anota tudo como status report
- [ ] Daily vira prestação de contas

#### 🔎 Causa Raiz
- Cultura de status report ainda viva
- SM assumindo postura de cobrança (mesmo sem querer)
- Time não entende que Daily é **compromisso entre pares**
- Gerência cobra SM, SM repassa cobrança

#### 🛠 Intervenção

**Curto prazo (1 Sprint)**
1. Reforçar: **Daily é para o time** (compromisso é com pares, não com chefe)
2. SM rotaciona: outra pessoa facilita (quebra "olhar para o chefe")
3. Mudar pergunta de "o que EU fiz" para "o que A GENTE precisa avançar hoje?"

**Estrutural (3 Sprints)**
1. SM para de anotar (ou anota só impedimentos, não "quem fez o quê")
2. Time olha para o board/burndown, não para o SM
3. SM sai da sala/call por 1 dia como experimento (time se vira)

#### 📏 Métricas

| Métrica | Como medir | Threshold saudável |
|---------|-----------|-------------------|
| Olhar para SM | Observação: % tempo olhando SM vs board/time | < 20% |
| Linguagem coletiva | Contagem "nós/a gente" vs "eu" | > 60% coletivo |
| Ownership | Time propõe soluções vs espera SM mandar | > 80% time propõe |

#### 🧪 Teste de Melhoria
- [ ] Time olha para board/burndown, não para SM
- [ ] Linguagem muda para coletivo ("a gente", "nosso bloqueio")
- [ ] Time resolve problemas entre pares antes de escalar para SM
- [ ] SM pode faltar 1 dia e Daily rola normal

#### 🗣 Script do Facilitador

**Ao abrir Daily (quebrar o padrão):**
> "Pessoal, Daily não é para mim. É para vocês. Olhem para o board, falem com os colegas. O que o time precisa avançar hoje? Quem quer começar?"

**Se virar status report individual:**
> "Legal, então você avançou X. Alguém do time está com alguma dependência disso? Alguém pode ajudar você a fechar Y?"

---

### 7️⃣ Cargos Especializados (silos e handoffs)

#### ✅ Sinais Observáveis
- [ ] "Teste é do QA" (devs não testam)
- [ ] "Arquitetura é do arquiteto" (time só codifica)
- [ ] Task travada esperando "o especialista"
- [ ] Handoff: "terminei minha parte, passa pro QA"

#### 🔎 Causa Raiz
- Silos funcionais (empresa organizada por função, não por produto)
- Falta de co-responsabilidade
- Falta de skill-sharing (ninguém ensina ninguém)
- "Especialista" vira gargalo e ponto único de falha

#### 🛠 Intervenção

**Curto prazo (1 Sprint)**
1. Remover títulos na prática: apresentações sem cargos (nome + o que faz hoje)
2. Incentivar colaboração cruzada: pair programming, swarming em bloqueios
3. Regra: história só "done" quando testada por quem desenvolveu (quebra handoff)

**Estrutural (3 Sprints)**
1. Observar padrão de escolha de tarefas: se sempre a mesma pessoa puxa "backend" e outra "frontend", puxar para cruzar
2. Time T-shaped: especialidade profunda em 1 área + conhecimento básico em todas
3. Skill-sharing: 30 min por semana de "ensina algo novo" (rotativo)
4. Se gargalo persistir: contratar para balancear (não para separar mais)

#### 📏 Métricas

| Métrica | Como medir | Threshold saudável | Red flag |
|---------|-----------|-------------------|----------|
| Gargalo | Tasks travadas esperando 1 pessoa | < 10% | > 30% |
| Cross-tasking | % do time que pegou tarefa "fora da especialidade" | > 30% | < 10% |
| Pairing | Sessões de pair/mob programming por semana | > 2 | 0 |
| Handoff time | Tempo entre "dev done" e "QA done" | < 1 dia | > 3 dias |

#### 🧪 Teste de Melhoria
- [ ] Menos tasks travadas esperando especialista
- [ ] Time cruza áreas (dev testa, QA codifica, etc.)
- [ ] Conhecimento distribuído (se 1 pessoa sai, time segue)
- [ ] Menos "não é minha área"

#### 🗣 Script do Facilitador

**Ao ver task travada esperando especialista:**
> "Essa tarefa tá travada esperando [Especialista]. Alguém pode parear com ele/ela para destravar E aprender? Assim na próxima não trava."

**Na Planning, ao ver silo se formando:**
> "Vejo que sempre as mesmas pessoas pegam backend. Que tal rotacionar? Quem nunca pegou backend quer tentar com pair?"

---

## 🐷 Porcos vs Galinhas — Regra Operacional

### 📖 Definição (adaptada para não virar "polícia")

| Papel | Definição | Compromisso |
|-------|-----------|-------------|
| **Porco** | Comprometido com resultado do Sprint (entram com "bacon") | Participa do Daily, puxa tarefas, é accountable pela entrega, trabalha full-time (ou dedicação alta) no produto |
| **Galinha** | Contribui com ideias/feedback, mas não está comprometida com entrega | Oferece suporte, opiniões, recursos — mas não decide durante execução |

### 🎯 Onde Porcos e Galinhas Atuam (por Cerimônia)

| Cerimônia | Porcos | Galinhas | Regra Operacional |
|-----------|--------|----------|------------------|
| **Daily** | ✅ Falam, decidem, se sincronizam | 👀 Podem assistir, mas NÃO falam | Transparência sim, interferência não. Perguntas/feedback ficam para depois. |
| **Planning** | ✅ Estimam, comprometem, planejam | 🚫 Não participam (decisão é do time) | PO (se for porco) participa. Galinhas não entram. |
| **Review** | ✅ Demonstram, recebem feedback | ✅ Assistem, dão feedback, testam | Galinhas bem-vindas! É hora de validar valor. |
| **Retrospectiva** | ✅ Participam, propõem experimentos | 🚫 Não participam (espaço seguro do time) | Apenas porcos. Retro é sobre como O TIME trabalha. |
| **Refinement** | ✅ Esclarecem, discutem, decompõem | ✅ Entram sob convite do PO para esclarecer valor/uso | Galinhas como "convidadas especiais" quando necessário. |

### 🌍 Protocolo para Times Remotos

**Problema**: remoto + async = decisões virando "eterno debate"

**Solução**: Doc Vivo + Cutoff de Decisões

#### Template de Decisão (copiar para doc do time)

```markdown
## Decisão: [Assunto]
**Data/hora:** 2026-01-06 10:00 (Daily Sprint 3)
**Presentes (porcos):** Maria, Paulo, João
**Ausentes:** Ana (avisou, aceita decisão)

### Contexto
[Por que precisamos decidir isso agora]

### Opções discutidas
1. [Opção A] — Prós: X / Contras: Y
2. [Opção B] — Prós: Z / Contras: W

### Decisão Final
[Opção escolhida + quem executa + prazo]

### Cutoff
Decisão é final. Reabertura só se:
- Bloqueio técnico crítico surgir
- PO mudar prioridade (com justificativa de negócio)

**Quem não estava presente:** aceita decisão e segue.
```

#### Regras do Cutoff
1. Decisões tomadas no Daily são **finais até o próximo Daily**
2. Quem não participou pode questionar **apenas se trouxer nova informação relevante** (não "eu teria feito diferente")
3. PO pode mudar prioridade, mas assume custo de retrabalho explicitamente
4. SM protege: decisões não ficam em "eterno draft"

---

## 🍑 ScrumButt — "Usamos Scrum, mas..."

### 🚨 O que é ScrumButt

**Definição**: implementação parcial de Scrum onde a empresa adota "pedaços" e chama de Scrum, mas não colhe benefícios (fica estagnada no "meio do caminho").

**Por que é armadilha**:
- Empresa ganha **um pouco** de previsibilidade/transparência
- Acha que "isso é Scrum" e estaciona
- Não corrige o resto → não colhe benefícios plenos
- Pior: culpa o Scrum ("tentamos e não funciona")

### 🗣️ Padrões Comuns (lista de exemplos reais)

Frases que indicam ScrumButt:

- ❌ "Usamos Scrum, **mas** não temos PO claro — gerente decide prioridade"
- ❌ "Usamos Scrum, **mas** Sprint muda quando o cliente pressiona"
- ❌ "Usamos Scrum, **mas** trabalho urgente entra no meio do Sprint"
- ❌ "Usamos Scrum, **mas** o QA fica fora do time e testa depois"
- ❌ "Usamos Scrum, **mas** estimamos em horas detalhadas antes de começar"
- ❌ "Usamos Scrum, **mas** gerente aprova cada tarefa antes de ir para produção"
- ❌ "Usamos Scrum, **mas** não fazemos Retrospectiva (perde tempo)"
- ❌ "Usamos Scrum, **mas** Dailies são opcionais"

**Risco principal**: time fica na "zona de conforto ruim" — tem cerimônias, mas não tem resultado.

---

## ✅ ScrumButt Test (Bas Vodde) — Checklist de Diagnóstico

Use esta checklist **publicamente** com o time (não esconda a avaliação). Ideal: rodar a cada 3-6 meses.

### 📋 Parte A — É Iterativo de Verdade?

- [ ] **A1.** Sprints têm duração fixa (1-4 semanas, sempre igual)
- [ ] **A2.** Ao final de cada Sprint, entregamos incremento **testado e potencialmente utilizável**
- [ ] **A3.** Sprint começa com itens do backlog **priorizados e claramente definidos**

**Se faltou algum**: você tem iterações, mas não são "saudáveis". Corrija antes de ir adiante.

---

### 📋 Parte B — É Scrum de Verdade?

- [ ] **B1.** Product Owner existe, é conhecido pelo time, e está acessível
- [ ] **B2.** Product Backlog é priorizado por **valor de negócio** (não por ordem alfabética, não por "quem gritou mais alto")
- [ ] **B3.** Estimativas são criadas **pela equipe de desenvolvimento** (não impostas de fora)
- [ ] **B4.** Time gera burndown (ou burnup) e conhece sua **velocidade média**
- [ ] **B5.** Ninguém de fora está "gerenciando por cima" e atrapalhando auto-organização do time

**Se faltou algum**: você tem ScrumButt. Escolha **1 item por Sprint** para corrigir.

---

### 🧪 Método de Uso (transformar diagnóstico em ação)

#### Passo a Passo

1. **Rodar checklist** em Planning ou Retro (15-20 min)
2. **Marcar SIM/NÃO** em cada item (votação anônima ou pública, depende da maturidade)
3. **Escolher 1 "NÃO" crítico** para o próximo Sprint (não tente corrigir tudo de uma vez)
4. **Escrever experimento**:
   - O que acontece hoje (estado atual observável)
   - O que faremos diferente no próximo Sprint (ação concreta)
   - Métrica de verificação (como saberemos que melhorou)
5. **Publicar compromisso** no board físico/Trello/Notion do time
6. **Revisar na próxima Retro**: melhorou? Se sim, manter e pegar outro "NÃO". Se não, ajustar experimento.

#### Template de Experimento (copiar)

```markdown
## Experimento Sprint N: [Nome curto]

**Item ScrumButt:** [Ex.: B2 — Backlog não priorizado por valor]

**Situação atual (NÃO):**
- Backlog ordenado por "ordem de pedido" (FIFO)
- PO não revisa prioridade há 2 meses
- Time não sabe o "porquê" de cada história

**O que faremos diferente este Sprint:**
1. PO vai revisar e re-priorizar backlog usando MoSCoW (Must/Should/Could/Won't)
2. Top 10 itens terão "valor de negócio" explícito (1 linha)
3. Planning começa com PO explicando "por que isso é prioridade"

**Métrica de verificação:**
- [ ] Backlog revisado até dia X
- [ ] Top 10 com valor explícito
- [ ] Time consegue explicar "por que fazemos isso" ao final do Sprint

**Responsável (observador):** [SM ou PO]

**Revisão:** Retro do Sprint N+1
```

---

## 🔗 Integração Cap. 7 + Cap. 8 — Smells Destroem Previsibilidade

**Insight crítico**: cheiros do Scrum não só "incomodam" — eles **destroem seus dados** e **fazem previsão virar mentira**.

### 🧩 Mapa de Impacto (Smell → Previsibilidade → Métrica)

| Smell (Cap. 7) | Impacto em Estimativas (Cap. 8) | Dado que fica fake | Métrica de Controle |
|----------------|----------------------------------|-------------------|---------------------|
| **Sprint variável** | Velocidade não estabiliza (base de dados muda sempre) | Velocidade inútil | Fixar Sprint por 3+ ciclos; medir % interrupção |
| **Galinhas interferindo** | Escopo muda no meio → burndown vira serrilhado | Burndown e commitment | Regra "só porcos falam"; medir redecisões |
| **Porcos faltando** | Estimativas feitas sem pessoa-chave → subestimação | Points e risco técnico | Presença > 90%; registro de ausências |
| **Hábitos persistentes (multitarefa)** | WIP alto → nada fecha → velocidade cai mas ninguém sabe por quê | Velocidade aparente | WIP < 2/pessoa; duração tarefa < 3 dias |
| **SM delega** | Time não se compromete de verdade → commitment é "número do chefe" | Commitment e ownership | Tarefas auto-atribuídas; SM fala < 20% Daily |
| **Daily para SM** | Status report não revela bloqueios → atrasos viram surpresa | Transparência real | Linguagem coletiva; impedimentos expostos cedo |
| **Cargos especializados** | Handoffs criam espera → estimativa não conta espera → estoura prazo | Tempo de ciclo | Medir handoff time; cross-tasking > 30% |
| **Done falso** (não testado) | Velocidade conta história "pronta" que volta para retrabalho | Velocidade é mentira | Definition of Done rigoroso; % retrabalho |

---

## 🩺 Radar de Saúde do Scrum (Checklist Integrado)

Use este checklist **semanalmente** (pode ser rápido, 5 min na Retro ou Planning).

### ✅ Proteção do Sprint
- [ ] Sprint tem duração fixa há 3+ ciclos
- [ ] % interrupção (demanda fora do backlog) < 10%
- [ ] PO protege time de "urgências" (ou negocia troca, não adição)

### ✅ Cerimônias Saudáveis
- [ ] Daily: só porcos falam, < 15 min, olham para board
- [ ] Planning: time estima (não imposição), histórias quebradas (S.M.A.L.L.)
- [ ] Review: incremento testado, stakeholder dá feedback
- [ ] Retro: espaço seguro, 1 experimento ativo por Sprint

### ✅ Transparência Real
- [ ] Burndown atualizado diariamente
- [ ] Velocidade registrada e conhecida por todos
- [ ] Impedimentos expostos no Daily (não escondidos)
- [ ] Board reflete estado real (não precisa "arrumar para reunião")

### ✅ Time Auto-Organizado
- [ ] Tarefas auto-atribuídas (pull system)
- [ ] SM facilita, não gerencia
- [ ] Time resolve problemas entre pares antes de escalar
- [ ] Conflitos mediados, não decididos "de cima"

### ✅ Estimativas Realistas
- [ ] Backlog estimado com Planning Poker (relativo, não horas)
- [ ] Velocidade estabilizada após 2-4 Sprints
- [ ] Previsão por faixa (pessimista/provável/otimista) atualizada em cada Review
- [ ] Definition of Done rigoroso (testado, integrado)

### 🚨 Red Flags (qualquer um = ação imediata)
- [ ] Sprint mudou de duração no último mês
- [ ] Burndown flat até dia N-2, depois vertical
- [ ] Velocidade variando > 30% entre Sprints (sem causa explicável)
- [ ] Daily > 20 min ou virou status report
- [ ] Histórias "prontas" voltam para retrabalho > 20%
- [ ] Time diz "não temos PO" ou "não sabemos prioridade"

---

# 📊 CAPÍTULO 8 — Estimativas de Tempo, Esforço e Investimento

## 🧭 Por que isso importa

**Problema universal**: Cliente/patrocinador quer saber:
1. **Quanto custa?**
2. **Quando entrega?**

**Realidade**: requisitos mudam, tecnologia muda, time muda, incerteza é alta no início.

**Solução Scrum**: não promete "contrato mentiroso" (escopo fixo + prazo fixo + custo fixo). Em vez disso:
- Estima **esforço relativo** (Story Points)
- Aprende **velocidade real** observando Sprints
- Converte velocidade em **previsão de prazo por faixas**
- Recalibra **a cada Sprint Review** (transparência total)

**O que você vende para patrocinador**:
✅ Previsão realista (com margem) em vez de número fake
✅ Transparência total do progresso
✅ Capacidade de re-priorizar (escopo flexível)
✅ Entrega incremental funcional a cada Sprint

---

## ⚖️ Triângulo de Ferro (Custo–Tempo–Qualidade)

### 🧩 O Triângulo Clássico

```
       Qualidade
          △
         / \
        /   \
       /     \
      /  PRODUTO \
     /___________\
  Custo          Tempo
```

**Lei física do gerenciamento de projetos**:
- Se você **força prazo ↓**, normalmente:
  - Qualidade cai, OU
  - Escopo reduz, OU
  - Custo sobe (mais gente / horas extras / risco)

**O que Scrum faz**:
- Tenta aumentar **produtividade** (time maduro, remoção de impedimentos, foco) para aliviar o triângulo
- MAS não elimina física: trade-offs continuam existindo
- Scrum escolhe **escopo flexível** para manter prazo e qualidade

### 🎯 Variáveis no Scrum

| Variável | Status no Scrum | Racional |
|----------|----------------|----------|
| **Tempo (Sprint)** | ⚙️ **Fixo** | Sprint não muda de duração. Previsibilidade vem daí. |
| **Qualidade (DoD)** | ⚙️ **Fixo** | Definition of Done não negocia. Dívida técnica mata no longo prazo. |
| **Custo (Time)** | 🔒 **Semi-fixo** | Time dedicado durante projeto. Pode ajustar entre releases, não no meio. |
| **Escopo** | 🔄 **Flexível** | Backlog re-priorizado a cada Sprint. Se não couber, sai do Sprint (não estoura prazo). |

**Mensagem para patrocinador**:
> "Vamos entregar o máximo de valor no prazo combinado, priorizando o que importa. Se algo não couber, a gente re-prioriza — mas você não fica sem entrega funcional."

---

## 🧮 Story Points — Medida Relativa de Esforço

### 📖 Por que pontos e não horas?

**Insight comportamental**: humanos são **ruins em valores absolutos**, **bons em comparação relativa**.

❌ **Ruim**: "Essa tarefa dá 18 horas" (precisão falsa, todo mundo erra)
✅ **Bom**: "Essa história é maior que aquela" (comparação é confiável)

### 🧩 O que Story Points Medem

Story Points = medida **relativa** considerando:

1. **Volume de trabalho** (linhas de código, telas, integrações)
2. **Complexidade técnica** (algoritmo novo, tech stack desconhecida)
3. **Incerteza / Risco** (nunca fizemos isso antes, API de terceiro instável)
4. **Dependências** (precisa integrar com 3 sistemas)
5. **Testes e validação** (cobertura, edge cases, dados de produção)

**O que NÃO é**:
❌ Story Points ≠ Horas
❌ Story Points ≠ Dias-pessoa
❌ Story Points ≠ "quanto custa"

**Story Points SÃO**: unidade de comparação interna do time. "Se história A é 5 pontos, história B que é um pouco maior é 8 pontos."

---

## 🃏 Planning Poker — Técnica de Estimativa Colaborativa

### 🎯 Objetivo

Estimar backlog de forma:
- **Rápida** (não gastar semanas em "análise perfeita")
- **Colaborativa** (todo mundo contribui, não só o "arquiteto")
- **Reveladora** (divergências expõem riscos e atalhos escondidos)

### 🃏 Materiais

**Baralho Planning Poker** (cada pessoa tem um):
- Cartas Fibonacci: `0, ½, 1, 2, 3, 5, 8, 13, 21, 40, 100`
- Cartas especiais:
  - `?` — Incerteza total (preciso pesquisar antes de estimar)
  - `∞` — Épico (grande demais, precisa quebrar)
  - `☕` — Pausa (estou cansado, vamos descansar)

**Por que Fibonacci?**
- Reduz falsa precisão (não existe "15 pontos" — força escolher entre 13 ou 21)
- Espaçamento cresce com incerteza (reflete realidade: quanto maior, mais incerto)

### 🧭 Passo a Passo Completo

#### **Preparação (antes da sessão)**

1. **Participantes**: Time de desenvolvimento (porcos) estima. PO esclarece. SM facilita.
2. **Backlog preparado**: PO traz histórias escritas (formato User Story ou equivalente)
3. **Sala/call + board**: físico ou digital (Trello, Jira, Miro)

---

#### **Etapa 1: Escolher História Âncora (10 min)**

**Problema**: sem referência, tudo é abstrato.

**Solução**: escolher 1 história "média" e fixar ela como **âncora de 5 pontos** (ou 3, tanto faz — mas 5 é padrão).

**Como escolher âncora:**
1. PO lê 5-10 histórias do backlog
2. Time escolhe uma que seja:
   - ✅ Nem trivial, nem épica
   - ✅ Tecnicamente conhecida (já fizemos algo parecido)
   - ✅ Completa (tem valor de negócio, dá para entregar e testar)
3. Time decide: "Essa vale **5 pontos**"

**Exemplo do livro:**
> História ID 7: "Como usuário, quero resetar minha senha via email"
> Time decide: 5 pontos (base de comparação)

---

#### **Etapa 2: Estimar Histórias (rodadas)**

Para cada história no backlog:

##### **2.1 PO Lê e Esclarece (2 min)**
- PO lê história
- PO explica valor de negócio: "Por que isso importa"
- Time faz perguntas técnicas (sem estimar ainda)

##### **2.2 Reflexão Silenciosa (1 min)**
- Cada pessoa pensa individualmente: "Isso é maior ou menor que a âncora (5)? Quanto?"
- Escolhe carta mentalmente (não mostra ainda)

##### **2.3 Revelar Cartas Simultaneamente**
- Facilitador conta: "3, 2, 1, mostre!"
- Todo mundo vira carta ao mesmo tempo (evita viés de ancoragem)

##### **2.4 Extremos Explicam (5 min) — O OURO DO POKER**

**Regra de ouro**: facilitador SEMPRE pergunta para quem deu **maior** e **menor** estimativa:

> "Por que ∞?" (ou 21, ou 13...)
> "Por que 3?" (ou 1, ou ½...)

**Por que isso funciona:**

| Extremo | O que revela |
|---------|-------------|
| **Maior** | Riscos escondidos, dependências, complexidade técnica que outros não viram |
| **Menor** | Atalhos reais, biblioteca pronta, experiência prévia, simplificação possível |

**Exemplo do livro (História ID 5):**

```
Rodada 1:
- Maria: ∞ (acha épico + nunca integrou com API X)
- Paulo: 3 (já fez integração similar, tem biblioteca pronta)
- Outros: 8, 13, 13

Facilitador: "Maria, por que infinito?"
Maria: "Nunca integramos com API X. Não sei nem se nossa stack suporta. Pode ser meses."

Facilitador: "Paulo, por que 3?"
Paulo: "A gente tem a lib Y que abstrai isso. Fiz algo parecido no projeto Z. Dá para reusar 70% do código."

Discussão (3 min):
- Paulo explica arquitetura
- Maria concorda que dá para separar: (1) PoC da integração (spike), (2) História menor usando resultado do spike
- Time converge: quebrar em 2 histórias
  - Spike (?) para validar integração — 2 dias, não estima em points
  - História de integração depois do spike — re-estimar quando PoC estiver pronto
```

##### **2.5 Re-votar (se necessário)**

Após extremos explicarem, time vota de novo:
- Convergência esperada: 8, 8, 8, 5, 5 (aceitável)
- Se ainda muito divergente: mais 1 rodada de conversa

##### **2.6 Fechar Número Final**

**3 opções** (livro apresenta as 3, recomenda opção 3):

1. **Consenso**: discutir até todo mundo concordar (risco: demora muito)
2. **Média**: somar e dividir (rápido, mas perde insight)
3. **Assumir o maior** ✅ (preferência do autor e boa prática)

**Por que "assumir o maior":**
- Projetos software tendem a estourar, não sobrar tempo
- Se alguém viu risco que outros não viram, prudente respeitar
- Margem de segurança evita surpresas

**Quando usar cada opção:**

| Cenário | Opção recomendada |
|---------|------------------|
| Risco técnico alto, dependência externa | 3 — Assumir maior |
| História bem conhecida, pequena divergência | 2 — Média (rápido) |
| Aprendizado (início de projeto) | 1 — Consenso (discutir para alinhar entendimento) |
| Prazo apertado | 3 — Assumir maior (buffer) |

##### **2.7 Registrar e Seguir**

- Anote pontos na história (Trello, Jira, post-it)
- Se caiu `∞`, `?`, ou `☕`: marcar para ação especial (próxima seção)
- Próxima história

---

### 🔍 Cartas Especiais — Como Tratar

#### `∞` — Épico (grande demais)

**O que fazer:**
1. **Não entra no Sprint** como está
2. **Decompor** em histórias menores (técnica: quebrar por funcionalidade, por camada, por persona)
3. **Re-estimar** as histórias menores

**Exemplo:**
```
Épico: "Sistema de relatórios completo" (∞)

Decomposição:
→ "Relatório de vendas (visualização básica)" — 8 pontos
→ "Filtros avançados no relatório" — 5 pontos
→ "Exportar relatório para Excel" — 3 pontos
→ "Agendar envio automático por email" — 8 pontos
```

#### `?` — Incerteza (não dá para estimar ainda)

**O que fazer:**
1. Criar **Spike** (tarefa de pesquisa/PoC)
2. Spike é **timeboxed** (ex.: 2 dias, 1 Sprint)
3. Spike gera **conhecimento** (documento, código de teste, decisão)
4. **Re-estimar** história depois do Spike

**Exemplo de Spike:**
```
Spike: "Investigar viabilidade de integração com API X"

Timebox: 3 dias
Output esperado:
- [ ] Documento com limitações da API
- [ ] PoC de autenticação OAuth funcionando
- [ ] Estimativa de esforço para integração completa

Depois do Spike:
→ Re-estimar história "Integrar com API X" com conhecimento real
```

#### `☕` — Pausa

**O que fazer:**
1. Parar
2. Descansar 10-15 min
3. Voltar focado

**Por que importa**: estimativas cansadas são ruins. Melhor pausar do que chutar números.

---

### 📊 Output Obrigatório da Sessão de Poker

Ao final da sessão, você deve ter:

✅ **Backlog estimado**: cada história com pontos (exceto épicos/spikes)
✅ **Lista de épicos**: histórias ∞ que precisam ser decompostas (próxima sessão)
✅ **Lista de Spikes**: histórias ? que precisam de pesquisa antes de estimar
✅ **Priorização clara**: PO ordena backlog por valor (Planning Poker não prioriza, só estima)

---

## 🏎️ Velocidade — A Métrica Central do Scrum

### 📖 Definição

> **Velocidade = Story Points entregues ("Done") por Sprint**

**Como calcular:**
1. Ao final do Sprint, conte **apenas** histórias "Done" (conforme Definition of Done)
2. Some os Story Points dessas histórias
3. Esse número é a velocidade do Sprint

**Exemplo numérico:**

```
Sprint 1:
- Planned: 25 pontos
- Done: 18 pontos
→ Velocidade Sprint 1: 18

Sprint 2:
- Planned: 22 pontos
- Done: 20 pontos
→ Velocidade Sprint 2: 20

Sprint 3:
- Planned: 23 pontos
- Done: 22 pontos
→ Velocidade Sprint 3: 22

Velocidade média (após 3 Sprints): (18+20+22)/3 = 20 pontos/sprint
```

### 📈 Quando Velocidade Estabiliza

**Início (Sprints 1-2)**: velocidade oscila (time aprendendo, ajustando estimativas, resolvendo setup)

**Maturidade (Sprints 3-6)**: velocidade começa a estabilizar (variação < 20%)

**Time maduro (Sprint 6+)**: velocidade estável, previsível

**Gráfico esperado:**

```
Velocidade
   ^
 25|                  ___22___22___23___
 20|         ___20___/
 15|  __18__/
 10| /
  5|/
  0+--------------------------------> Sprints
    1  2  3  4  5  6  7  8  9  10
```

### ⚖️ Variáveis que Afetam Velocidade

| Fator | Impacto | Como controlar |
|-------|---------|----------------|
| **Tamanho do time** | ↑ time → ↑ velocidade (não linear, comunicação cresce) | Manter time estável (5-9 pessoas ideal) |
| **Duração Sprint** | Sprint 2 sem ≈ 2× Sprint 1 sem (se time igual) | Fixar duração (não mudar) |
| **Dedicação** | Time 50% dedicado → metade da velocidade | Medir % dedicação real; proteger de interrupções |
| **Maturidade** | Time novo < time maduro (aprendizado, setup) | Esperar 3-4 Sprints para estabilizar |
| **Débito técnico** | ↑ débito → ↓ velocidade ao longo do tempo | Incluir refatoração no Sprint (15-20% capacidade) |
| **Definition of Done** | DoD fraco → velocidade fake alta | DoD rigoroso (testado, integrado) |
| **Interrupções** | Cada interrupção "come" capacidade | Medir % interrupção; bloquear urgências |

---

## ⏱️ Como Converter Pontos em PRAZO (a equação mágica)

### 🧮 Fórmula Base

```
Prazo (em Sprints) = Total de Story Points / Velocidade Média

Prazo (em semanas) = Prazo em Sprints × Duração do Sprint
```

### 📊 Exemplo Numérico Completo

**Contexto:**
- Sprint: 2 semanas
- Time: 4 pessoas
- Velocidade média (após 3 Sprints): 20 pontos/sprint
- Backlog do release: 180 pontos

**Cálculo:**

```
1. Sprints necessários:
   180 pontos ÷ 20 pontos/sprint = 9 Sprints

2. Prazo em semanas:
   9 Sprints × 2 semanas = 18 semanas

3. Prazo em meses (aprox.):
   18 semanas ÷ 4 semanas/mês ≈ 4,5 meses
```

**Previsão realista**: ~4,5 meses (ou 9 Sprints de 2 semanas)

---

### 📉 Previsão por Faixas (Pessimista / Provável / Otimista)

**Problema**: no início, velocidade não estabilizou. Prometer "180 pontos em 18 semanas exatas" é irresponsável.

**Solução**: trabalhar com **faixas de velocidade** e apresentar **cenários**.

#### Exemplo com Faixas

**Contexto:**
- Sprint: 2 semanas
- Velocidade observada: Sprint 1=18, Sprint 2=20, Sprint 3=22
- Backlog: 180 pontos

**Cálculo:**

```
Velocidade:
- Pessimista: 18 pontos/sprint (pior caso observado)
- Provável: 20 pontos/sprint (média)
- Otimista: 22 pontos/sprint (melhor caso)

Prazo (Sprints):
- Pessimista: 180÷18 = 10 Sprints → 20 semanas
- Provável: 180÷20 = 9 Sprints → 18 semanas
- Otimista: 180÷22 = 8,2 Sprints → ~16 semanas

Apresentação para patrocinador:
"Estimamos entre 16 e 20 semanas, com maior probabilidade de 18 semanas.
Vamos recalibrar a cada Sprint Review conforme velocidade se estabiliza."
```

---

### 🔄 Burndown de Release (acompanhar prazo ao longo do tempo)

**O que é**: gráfico que mostra **pontos restantes** no backlog ao longo dos Sprints.

**Como construir:**

```
Sprint | Backlog Restante | Velocidade Sprint | Previsão Atualizada
-------|------------------|-------------------|--------------------
  0    | 180 pontos       | —                 | ? Sprints
  1    | 162 pontos       | 18                | 162÷18 = 9 Sprints
  2    | 142 pontos       | 20                | 142÷20 = 7,1 Sprints
  3    | 120 pontos       | 22                | 120÷22 = 5,5 Sprints
  4    | 98 pontos        | 22                | 98÷22 = 4,5 Sprints
  ...
```

**Gráfico de Burndown de Release:**

```
Pontos
   ^
180|●
   |  \
150|    \
   |      ●
120|        \
   |          ●
 90|            \
   |              ●
 60|                \
   |                  ●
 30|                    \
   |                      ●
  0+--------------------------> Sprints
    0  1  2  3  4  5  6  7  8  9
```

**Linha ideal** (diagonal) vs **progresso real** (pontos). Se real está acima da ideal, atrasando. Se abaixo, adiantando.

---

### 📢 Como Apresentar Prazo para Patrocinador (sem prometer o impossível)

#### ✅ O que você GARANTE no Scrum

- ✅ **Entrega funcional** ao final de cada Sprint (incremento testado)
- ✅ **Transparência total** do progresso (burndown, velocidade, backlog)
- ✅ **Capacidade de re-priorizar** (escopo flexível: patrocinador escolhe o que importa)
- ✅ **Previsão realista** recalibrada a cada 2 semanas (não "chute inicial congelado")

#### ❌ O que você NÃO garante

- ❌ **Escopo fixo + prazo fixo + custo fixo** simultaneamente (triângulo de ferro: impossível)
- ❌ **Data cravada** no Sprint 0 (antes de ter velocidade real)
- ❌ **Zero mudanças** (Scrum assume que requisitos evoluem)

#### 🗣️ Script Pronto para Patrocinador

**Situação: Patrocinador quer "data de entrega" no início**

> "Baseado no backlog atual (180 pontos) e estimando uma velocidade de 18-22 pontos por Sprint de 2 semanas, prevemos entre **16 e 20 semanas** para este release, com maior probabilidade de **18 semanas**.
>
> Essa previsão vai ficar **mais precisa** após os primeiros 2-3 Sprints, quando tivermos velocidade real. Vamos recalibrar a cada Sprint Review e manter você informado.
>
> O que você ganha: **entrega funcional a cada 2 semanas**. Se em algum momento quisermos acelerar, podemos re-priorizar o backlog e entregar o essencial antes, deixando itens menos críticos para depois.
>
> Prefere previsão realista que ajustamos juntos, ou prefere data fixa que provavelmente vai estourar?"

---

## 💰 Como Mensurar INVESTIMENTO (converter prazo em custo)

### 🧮 Custo por Sprint

**Fórmula:**

```
Custo do Sprint = (Soma dos custos mensais do time / Sprints por mês) + Overhead
```

**Exemplo:**

```
Time: 4 pessoas
Custo mensal médio: R$ 15.000/pessoa
Custo mensal total: 4 × 15.000 = R$ 60.000/mês

Sprint: 2 semanas
Sprints por mês: ~2

Custo por Sprint (simplificado):
60.000 ÷ 2 = R$ 30.000/sprint
```

**Overhead** (infraestrutura, licenças, etc.):
```
Overhead: +15% (exemplo)
Custo Sprint com overhead: 30.000 × 1,15 = R$ 34.500/sprint
```

---

### 💸 Investimento Total do Release

**Fórmula:**

```
Investimento = Custo por Sprint × Número de Sprints
```

**Exemplo (continuando o anterior):**

```
Previsão: 9 Sprints
Custo por Sprint: R$ 34.500

Investimento total:
9 × 34.500 = R$ 310.500

Com margem (10%):
310.500 × 1,10 = R$ 341.550
```

**Apresentação para patrocinador:**

> "Baseado na previsão de 9 Sprints (18 semanas), estimamos investimento de **R$ 310k a R$ 340k** (com margem de 10%).
>
> Esse valor pressupõe time estável de 4 pessoas. Se quisermos acelerar (reduzir prazo), podemos avaliar adicionar pessoas — mas produtividade não cresce linearmente (Lei de Brooks: adicionar pessoas em projeto atrasado atrasa mais no curto prazo)."

---

### 💵 ROI e Break-Even (quando fizer sentido)

**Se o produto gera receita**, calcular:

```
Break-even = Investimento / Receita mensal estimada

Exemplo:
Investimento: R$ 310k
Receita estimada (após lançamento): R$ 50k/mês

Break-even: 310 ÷ 50 = 6,2 meses após lançamento
```

**Mensagem para patrocinador:**
> "Investimento de R$ 310k, com previsão de recuperar em ~6 meses após lançamento (baseado em receita estimada de R$ 50k/mês)."

---

## 📐 Pontos de Função (PF) e UST — Quando e Como Usar

### 🧩 Contexto (por que isso existe)

**Problema**: grandes empresas, governo, licitações públicas exigem **métrica padronizada** para contratação e comparação.

**Soluções tradicionais**:
- **PF (Function Points)**: mede funcionalidade do ponto de vista do usuário, independente de tecnologia. Tem norma ISO.
- **UST (Unidade de Serviço Técnico)**: unidade para mensurar esforço humano em contextos difíceis de prever.

### 🚨 Risco: PF/UST vs Scrum

**Armadilha**: se você deixar PF "mandar" no processo diário, volta para waterfall (especificação completa antes de começar).

**Solução pragmática**:
1. **Internamente**: time usa Scrum (Story Points, velocidade, Sprints)
2. **Externamente (contrato)**: mapear para PF/UST **apenas para precificação**
3. **Não deixar** PF influenciar Planning Poker (são escalas diferentes)

### 🔄 Como Fazer Mapeamento (se necessário)

**Passo a passo:**

1. Rodar Planning Poker normalmente (Story Points)
2. Após alguns Sprints, mapear correlação (exemplo):
   ```
   Análise empírica:
   - 1 PF ≈ 2-4 Story Points (varia por time/contexto)
   - Time entrega 20 Story Points/sprint
   - Logo: ~5-10 PF/sprint
   ```
3. Usar essa proporção **apenas para contrato** (não muda processo interno)

**Mensagem para contratante/governo:**
> "Seguimos Scrum internamente para agilidade. Traduzimos métricas para PF no relatório final conforme norma ISO, mas o acompanhamento será por Sprints e entregas funcionais."

---

## 🔄 Recalibração Contínua (transparência ao longo do projeto)

### 📊 A Cada Sprint Review

**Checklist de Recalibração:**

1. **Atualizar velocidade**: somar pontos "Done" deste Sprint, recalcular média
2. **Atualizar backlog**: remover pontos entregues, adicionar novos itens (se surgirem)
3. **Recalcular previsão**:
   ```
   Pontos restantes ÷ Velocidade média = Sprints restantes
   ```
4. **Apresentar para stakeholders**: burndown de release + previsão atualizada
5. **Re-priorizar se necessário**: PO ajusta ordem do backlog baseado em feedback

**Exemplo de comunicação (Sprint 3):**

> "Sprint 3 entregamos 22 pontos. Velocidade média agora é 20 pontos/sprint.
>
> Backlog restante: 120 pontos.
>
> Previsão atualizada: 120÷20 = **6 Sprints restantes** (12 semanas).
>
> Isso está alinhado com expectativa inicial (18 semanas total, já passaram 6, restam 12).
>
> Alguma prioridade mudou? Quer ajustar backlog?"

---

## 🧪 Dinâmicas Replicáveis (resumo — detalhes no Playbook)

### 1. Oficina de Planning Poker (60-90 min)

**Objetivo**: pontuar backlog, identificar épicos e spikes
**Output**: backlog estimado + lista de ações (decomposições, pesquisas)
👉 **Ver Playbook completo em:** `Playbooks_Dinamicas_Cap7-8.md`

### 2. Previsão por Faixa + Conversa com Patrocinador (30-45 min)

**Objetivo**: simular apresentação de prazo/custo realista
**Output**: script ajustado para contexto da empresa
👉 **Ver Playbook completo em:** `Playbooks_Dinamicas_Cap7-8.md`

---

## ✅ Checklist Final — O que Precisa Existir para Estimar Tempo de Verdade

### 📋 Antes de Prometer Prazo

- [ ] **Backlog estimado** em Story Points (Planning Poker rodado)
- [ ] **História âncora** definida (ex.: 5 pontos = história X)
- [ ] **Épicos decompostos** (nenhuma história ∞ no topo do backlog)
- [ ] **Spikes planejados** (incertezas ? viram tarefas de pesquisa)
- [ ] **Definition of Done** clara e rigorosa (testado, integrado)
- [ ] **Sprint fixo** definido (1-2 semanas, não muda)

### 📋 Durante Execução (a cada Sprint)

- [ ] **Sprint Review** com incremento testado e funcional
- [ ] **Velocidade registrada** (pontos "Done" deste Sprint)
- [ ] **Burndown atualizado** (diário no Sprint, release no Review)
- [ ] **Previsão recalibrada** (pontos restantes ÷ velocidade)
- [ ] **Transparência** com stakeholders (mostrar progresso real, não maquiar)

### 📋 Para Apresentar Prazo/Custo

- [ ] **Velocidade média** após 2-4 Sprints (dado real, não chute)
- [ ] **Previsão por faixa** (pessimista/provável/otimista)
- [ ] **Custo por Sprint** calculado (time + overhead)
- [ ] **Investimento total** = custo/sprint × sprints previstos
- [ ] **Margem explícita** (10-20% para imprevistos)
- [ ] **Compromisso realista**: escopo flexível, prazo previsível, transparência total

---

## ⚠️ Erros Comuns (Cap. 8) — Como Evitar

| Erro | Consequência | Correção |
|------|-------------|----------|
| ❌ **Converter points → horas logo de cara** | Mata essência do Scrum, volta para waterfall disfarçado | Manter Story Points como relativo; usar velocidade para prazo |
| ❌ **Aceitar épico no Sprint (∞ ignorado)** | Sprint explode, nada fecha, velocidade fake | Decompor épicos antes de entrar no Sprint |
| ❌ **Não medir velocidade** | Prazo vira achismo, patrocinador perde confiança | Registrar pontos "Done" a cada Sprint Review |
| ❌ **Done falso (sem teste/integração)** | Velocidade é mentira (retrabalho estoura depois) | Definition of Done rigoroso, não negociar |
| ❌ **Mexer no Sprint no meio (adicionar escopo)** | Dados ficam inúteis, burndown quebra | Sprint termina com o que couber; novo escopo vai para próximo Sprint |
| ❌ **Prometer data cravada no Sprint 0** | Pressão irreal, time entrega qualidade ruim | Usar faixas até velocidade estabilizar (3-4 Sprints) |
| ❌ **Não recalibrar previsão** | Surpresas no final ("achávamos que ia dar") | Recalibrar TODA Sprint Review, apresentar para stakeholders |
| ❌ **Ignorar overhead e margem** | Investimento estoura | Incluir overhead (15%) + margem (10-20%) no custo |

---

## 🔗 Links para Materiais Complementares

- **Dinâmicas completas (roteiros, scripts, métricas):** `Playbooks_Dinamicas_Cap7-8.md`
- **Templates copiáveis (checklists, agendas, scripts):** `Templates_Operacionais.md`
- **Diagramas Mermaid (fluxos, mapas):** `Mermaids_Scrum.md`

---

## 📚 Resumo Executivo (TL;DR)

### Cap. 7 — Cheiros do Scrum
- Scrum deteriora se não for cultivado → sinais observáveis (smells)
- Cada smell tem causa raiz + intervenção + métrica + teste de melhoria
- Porcos vs Galinhas: regra operacional para proteger Daily sem conflito
- ScrumButt Test: checklist para diagnosticar "Scrum parcial" e corrigir 1 item por Sprint
- **Smells destroem previsibilidade**: sprint variável → velocidade fake; done falso → retrabalho

### Cap. 8 — Estimativas
- **Story Points**: esforço relativo (não horas), mede volume + complexidade + risco
- **Planning Poker**: história âncora (5 pontos) + extremos explicam + convergência
- **Velocidade**: pontos "Done" por Sprint → estabiliza em 3-4 Sprints
- **Prazo**: pontos totais ÷ velocidade = nº de Sprints → previsão por faixa (pessimista/provável/otimista)
- **Investimento**: custo/sprint × nº sprints + overhead + margem
- **Recalibração**: a cada Sprint Review, atualizar previsão com dado real
- **Patrocinador**: prometer transparência + entrega incremental + re-priorização, NÃO escopo+prazo+custo fixos

---

**Próximos passos:**
1. Rodar dinâmicas com o time (ver Playbooks)
2. Usar templates para padronizar (ver Templates)
3. Visualizar com Mermaid (ver Mermaids)
4. Aplicar 1 experimento por Sprint (ScrumButt Test ou smell prioritário)

---

*Guia criado para UzzAI — Material didático profissional baseado em Scrum Guide e práticas de Mike Cohn, Ken Schwaber, Jeff Sutherland.*
