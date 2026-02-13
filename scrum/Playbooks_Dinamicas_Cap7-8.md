---
created: 2026-01-06
updated: 2026-01-06T20:53
tags:
  - scrum
  - playbooks
  - dinamicas
  - facilitacao
---

# 🎯 Playbooks e Dinâmicas Práticas — Cap. 7-8

## 📖 Como Usar Este Documento

Este playbook contém **roteiros completos** para facilitar dinâmicas de Scrum com seu time. Cada dinâmica inclui:

- 🎯 **Objetivo** — o que você quer alcançar
- ⏱️ **Duração** — tempo estimado
- 👥 **Participantes** — quem deve estar presente (porcos/galinhas)
- 📦 **Materiais** — o que preparar antes
- 📋 **Agenda detalhada** — passo a passo com minutagem
- 🗣️ **Scripts do facilitador** — falas prontas (copie e cole)
- 📏 **Critérios de sucesso** — métricas objetivas
- ⚠️ **Riscos comuns** — o que pode dar errado e como corrigir
- 📤 **Outputs obrigatórios** — entregáveis da sessão

**Facilitadores**: você pode rodar estas dinâmicas sem experiência prévia. Siga os scripts. Não improvise no início.

---

# 📍 DINÂMICAS CAPÍTULO 7 — Cheiros do Scrum

## 🦨 Dinâmica 1: "Nariz do Scrum" (Smell Detection Workshop)

### 🎯 Objetivo
Identificar cheiros do Scrum que estão afetando o time e escolher **1 intervenção simples** para experimentar no próximo Sprint.

### ⏱️ Duração
30-45 minutos

### 👥 Participantes
- **Porcos**: obrigatório (time dev + PO + SM)
- **Galinhas**: NÃO (espaço seguro do time)

### 📦 Materiais
- [ ] Quadro branco ou Miro/Mural virtual
- [ ] Post-its (físico) ou cards virtuais (digital)
- [ ] Lista de cheiros impressa/visível (ver seção Preparação)
- [ ] Votação: dots/adesivos ou emoji reactions (digital)
- [ ] Timer visível

### 📋 Preparação (antes da sessão)

**Facilitador prepara:**
1. Quadro com 3 colunas: `Cheiros` | `Causas Raiz` | `Experimento`
2. Lista de cheiros visível para todos (copiar da lista abaixo)

**Lista de Cheiros (Cole no Quadro)**:
```
1. Sprint com duração variável
2. Galinhas falando no Daily
3. Porcos faltando (ausência/horários flexíveis)
4. Hábitos persistentes (multitarefa, tarefas longas)
5. Scrummaster delega trabalhos
6. Daily é para o SM (status report)
7. Cargos especializados (silos, handoffs)
8. Burndown serrilhado / flat até o final
9. Histórias "prontas" voltam para retrabalho
10. "Urgências" entram no Sprint no meio
```

---

### 🕐 Agenda Detalhada (45 min)

#### **00:00-05:00 — Contexto e Regras (5 min)**

**Script do Facilitador:**

> "Pessoal, vamos fazer um checkup rápido do nosso Scrum. O objetivo é identificar 'cheiros' — sinais de que algo está deteriorando — e escolher UMA intervenção simples para experimentar no próximo Sprint.
>
> **Regras:**
> 1. Sem culpa: estamos diagnosticando o PROCESSO, não pessoas.
> 2. Observações objetivas: 'Daily demora 30 min' (✅ fato) vs 'fulano fala demais' (❌ ataque).
> 3. Escolhemos 1 ação: foco em resolver, não em fazer lista gigante.
>
> Vamos começar!"

---

#### **05:00-15:00 — Votação Silenciosa (10 min)**

**Instrução do Facilitador:**

> "Aqui está a lista de cheiros comuns. Cada pessoa marca **2 cheiros** que mais vê no nosso time. Pode ser com post-it, dot, emoji — o que tiver.
>
> **Silencioso**: não discutam ainda. Só marquem. Vocês têm 5 minutos."

**[Timer: 5 min — Votação silenciosa]**

> "Ok, tempo! Vamos contar os votos."

**[Facilitador conta e anota no quadro os 2-3 cheiros mais votados]**

---

#### **15:00-25:00 — Causa Raiz (10 min)**

**Instrução do Facilitador:**

> "Os cheiros mais votados foram:
> 1. [Cheiro A] — X votos
> 2. [Cheiro B] — Y votos
>
> Vamos pegar o mais votado e fazer '5 Porquês' rápido. Por que isso acontece?"

**Exemplo prático (Daily é para o SM):**

```
Facilitador: "Por que o Daily virou status report para o SM?"

Time: "Porque o SM anota tudo e depois repassa para o gerente."

Facilitador: "Por que o SM repassa para o gerente?"

Time: "Porque o gerente cobra ele."

Facilitador: "Por que o gerente cobra o SM?"

Time: "Porque ele não confia que o time vai entregar sem supervisão."

Facilitador: "Ok, causa raiz parece ser: cultura de comando-controle + falta de transparência para o gerente. Concordam?"

[Time concorda]
```

**[Repetir para o 2º cheiro se der tempo — caso contrário, focar em 1]**

---

#### **25:00-40:00 — Definir Experimento (15 min)**

**Instrução do Facilitador:**

> "Agora vamos definir UM experimento para o próximo Sprint. Experimento = mudança pequena + métrica para saber se funcionou.
>
> Vamos usar este template:"

**Template no Quadro:**

```markdown
## Experimento Sprint N: [Nome curto]

**Cheiro:** [ex.: Daily é status report]

**Causa raiz:** [ex.: SM repassa para gerente, time não fala para os pares]

**O que faremos diferente:**
1. [Ação 1 — ex.: Daily: time olha para o board, não para o SM]
2. [Ação 2 — ex.: SM para de anotar "quem fez o quê"]
3. [Ação 3 — ex.: Criar report automático do Jira para gerente (menos micro-gestão)]

**Métrica de verificação:**
- [ ] Daily volta para 10-15 min (hoje está em 25-30 min)
- [ ] Linguagem muda para coletivo: > 60% "a gente/nós" vs "eu"
- [ ] SM fala < 20% do tempo (hoje fala ~50%)

**Responsável (observador):** [Nome — quem vai medir, não mandar]

**Revisão:** Retro do Sprint N+1
```

**Facilitador conduz discussão:**

> "Qual ação concreta a gente consegue fazer NO PRÓXIMO SPRINT para melhorar esse cheiro? Não precisa resolver 100%, mas precisa ser verificável."

**[Time discute e preenche o template — facilitador anota no quadro]**

---

#### **40:00-45:00 — Registro e Compromisso (5 min)**

**Instrução do Facilitador:**

> "Perfeito! Vou tirar foto desse quadro [ou copiar para Notion/Confluence/Trello].
>
> Compromisso: vamos TESTAR isso no próximo Sprint. Na Retro, revisamos: funcionou? Métrica melhorou?
>
> Se sim, mantemos e pegamos outro cheiro. Se não, ajustamos.
>
> Alguém tem dúvida ou quer ajustar algo?"

**[Ajustes finais]**

> "Fechado! Experimento ativo. Próximo Daily já começa diferente. Valeu, pessoal!"

---

### 📤 Outputs Obrigatórios

✅ **Cheiros identificados** (lista priorizada por votação)
✅ **Causa raiz** documentada (1-2 cheiros principais)
✅ **Experimento definido** (ações concretas + métrica + responsável)
✅ **Registro público** (quadro do time, Trello, Notion, Confluence)

---

### 📏 Critérios de Sucesso

**Durante a sessão:**
- [ ] Todos participaram da votação (sem 1-2 pessoas dominando)
- [ ] Causa raiz não virou "culpa de pessoa X" (foco em processo)
- [ ] Experimento é específico e verificável (não vago tipo "melhorar comunicação")

**Após 1 Sprint:**
- [ ] Métrica do experimento foi medida (sim ou não, mas foi medida)
- [ ] Time revisou na Retro (não esqueceu)
- [ ] Se métrica melhorou ≥ 30%, considerar experimento bem-sucedido

---

### ⚠️ Riscos Comuns e Como Corrigir

| Risco | Sintoma | Correção na Hora |
|-------|---------|-----------------|
| **Virar sessão de desabafo** | Pessoas começam a reclamar de tudo | Facilitador corta: "Entendo, mas vamos focar. Qual DOS CHEIROS da lista isso representa?" |
| **Culpar pessoas** | "Fulano sempre atrasa Daily" | Facilitador: "Vamos reformular: 'Presença no Daily está < 80%' (fato observável)" |
| **Experimento vago** | "Vamos melhorar o Daily" | Facilitador: "Como vamos saber que melhorou? Qual número/comportamento muda?" |
| **Querer resolver tudo** | Time escolhe 5 experimentos | Facilitador: "Só 1. Foco. Se resolver rápido, pegamos outro na próxima Retro." |
| **Ninguém se voluntaria para observar** | "Alguém mede isso?" [silêncio] | Facilitador: "Não é mandar, é só observar. [Nome], você consegue contar falas no Daily e avisar se passar de 15 min?" |

---

### 🗣️ Scripts Prontos do Facilitador

**Se alguém atacar pessoa:**
> "Entendo a frustração, mas vamos reformular sem nomes. O que você observa no PROCESSO que está quebrando?"

**Se discussão estender demais:**
> "Ótima discussão, mas vamos focar. Temos 10 minutos. Causa raiz parece ser [resumo]. Concordam ou discordam?"

**Se time desanimar ("isso nunca muda"):**
> "Scrum é melhoria contínua. Um experimento por Sprint. Em 6 meses são 12 experimentos. Imagina quantos cheiros a gente resolve?"

**Ao fechar sessão:**
> "Recapitulando: identificamos [Cheiro X], causa raiz é [Y], vamos experimentar [Z] e medir [métrica]. Revisamos na Retro. Quem topa?"

---

## ✅ Dinâmica 2: ScrumButt Test Público (Checklist Workshop)

### 🎯 Objetivo
Parar de "achar" e **medir objetivamente** o quanto o time está praticando Scrum de verdade. Escolher **1 item "NÃO"** para corrigir no próximo Sprint.

### ⏱️ Duração
20-30 minutos

### 👥 Participantes
- **Porcos**: obrigatório (time dev + PO + SM)
- **Galinhas**: NÃO (avaliação interna do time)

### 📦 Materiais
- [ ] Checklist ScrumButt Test impresso ou visível (copiar template abaixo)
- [ ] Quadro para anotar resultados
- [ ] Votação anônima (opcional): Mentimeter, Google Forms, ou levantar mão
- [ ] Template de Experimento (ver seção Output)

---

### 📋 Checklist ScrumButt Test (Bas Vodde)

**Facilitador apresenta este checklist e time vota SIM/NÃO para cada item.**

#### **Parte A — É Iterativo de Verdade?**

| Item | Pergunta | SIM | NÃO |
|------|----------|-----|-----|
| A1 | Sprints têm duração fixa (1-4 semanas, sempre igual)? | | |
| A2 | Ao final de cada Sprint, entregamos incremento **testado e potencialmente utilizável**? | | |
| A3 | Sprint começa com itens do backlog **priorizados e claramente definidos**? | | |

#### **Parte B — É Scrum de Verdade?**

| Item | Pergunta | SIM | NÃO |
|------|----------|-----|-----|
| B1 | Product Owner existe, é conhecido pelo time, e está acessível? | | |
| B2 | Product Backlog é priorizado por **valor de negócio** (não FIFO, não política)? | | |
| B3 | Estimativas são criadas **pela equipe de desenvolvimento** (não impostas de fora)? | | |
| B4 | Time gera burndown/burnup e conhece sua **velocidade média**? | | |
| B5 | Ninguém de fora está "gerenciando por cima" e atrapalhando auto-organização do time? | | |

---

### 🕐 Agenda Detalhada (30 min)

#### **00:00-05:00 — Contexto e Regras (5 min)**

**Script do Facilitador:**

> "Pessoal, vamos fazer o **ScrumButt Test** — um checklist honesto para saber se estamos fazendo Scrum de verdade ou 'Scrum, mas...'.
>
> **Regras:**
> 1. Honestidade radical: não vamos maquiar para 'parecer bom'. Resultado ruim é bom, porque sabemos o que corrigir.
> 2. Votação por consenso: se o time discordar (ex.: 3 SIM, 2 NÃO), discutimos 2 minutos e decidimos.
> 3. Foco em 1 item: vamos escolher UM 'NÃO' crítico para experimentar no próximo Sprint.
>
> Vamos começar?"

---

#### **05:00-15:00 — Responder Checklist (10 min)**

**Facilitador lê cada item e time vota:**

**Exemplo (Item A1):**

> "Item A1: Sprints têm duração fixa — sempre igual? Nossos Sprints são sempre 2 semanas, sem exceção?"

**[Time vota: levantar mão, emoji, ou Mentimeter]**

**Se houver divergência:**

> "Vejo que temos 4 SIM e 1 NÃO. [Nome que votou NÃO], por que NÃO?"

**Exemplo:**
```
Dev: "Porque no Sprint 3 a gente estendeu 3 dias para terminar a release."

Facilitador: "Ok, então tecnicamente é NÃO. Concordam?"

[Time concorda]

Facilitador: "Marcando NÃO no A1."
```

**[Repetir para todos os 8 itens — anotar SIM/NÃO no quadro]**

---

#### **15:00-25:00 — Escolher 1 "NÃO" Crítico (10 min)**

**Script do Facilitador:**

> "Ok, nossos NÃOs foram:
> - A1 (Sprint variável)
> - B2 (Backlog não priorizado por valor)
> - B4 (Não sabemos velocidade)
>
> Vamos escolher **1 desses** para corrigir no próximo Sprint. Qual tem mais impacto? Qual é mais fácil de corrigir? Vamos votar."

**[Votação rápida: cada pessoa vota em 1 item]**

**Facilitador:**

> "Venceu: **B2 — Backlog não priorizado por valor**. Vamos criar um experimento para isso."

**[Facilitador cola template no quadro e time preenche junto]**

**Template de Experimento:**

```markdown
## Experimento Sprint N: Backlog por Valor

**Item ScrumButt:** B2 — Backlog priorizado por valor de negócio

**Situação atual (NÃO):**
- Backlog ordenado por "ordem de pedido" (FIFO)
- PO não revisou prioridade há 2 meses
- Time não sabe o "porquê" de cada história (só "o gerente pediu")

**O que faremos diferente este Sprint:**
1. PO vai revisar e re-priorizar backlog usando MoSCoW (Must/Should/Could/Won't) até [data]
2. Top 10 itens terão "valor de negócio" explícito (1 frase: "Isso desbloqueia X", "Isso reduz custo Y")
3. Planning começa com PO explicando "por que isso é prioridade #1"

**Métrica de verificação:**
- [ ] Backlog revisado e re-ordenado até [data antes da Planning]
- [ ] Top 10 histórias com valor de negócio documentado
- [ ] Na Planning, time consegue explicar "por que fazemos isso" (teste oral)

**Responsável (observador):** PO (executar) + SM (verificar métrica)

**Revisão:** Retro do Sprint N+1
```

---

#### **25:00-30:00 — Registro e Compromisso (5 min)**

**Script do Facilitador:**

> "Perfeito! Vou registrar isso no [Trello/Notion/board do time].
>
> **Compromisso público**: no próximo Sprint, vamos corrigir o item B2. Se funcionar, voltamos aqui e pegamos outro 'NÃO'.
>
> Meta: em 3 meses, ter TODOS os itens em SIM. Isso é Scrum de verdade.
>
> Dúvidas?"

**[Ajustes finais]**

> "Fechado! Até a próxima Planning com backlog priorizado por valor. Valeu, time!"

---

### 📤 Outputs Obrigatórios

✅ **Checklist respondido** (8 itens com SIM/NÃO)
✅ **Score ScrumButt** (ex.: 5/8 = 62,5% Scrum)
✅ **1 experimento definido** (item NÃO → ações concretas)
✅ **Registro público** (compromisso visível no board do time)

---

### 📏 Critérios de Sucesso

**Durante a sessão:**
- [ ] Time respondeu honestamente (sem maquiar para "parecer bom")
- [ ] Divergências foram discutidas e resolvidas (não votação às cegas)
- [ ] Experimento é específico (não vago tipo "melhorar PO")

**Após 1 Sprint:**
- [ ] Ações do experimento foram executadas (sim ou não, mas tentaram)
- [ ] Métrica foi verificada (checklist foi marcado)
- [ ] Item virou SIM ou time entendeu por que ainda é difícil

**Meta de longo prazo (3-6 meses):**
- [ ] Score ScrumButt ≥ 7/8 (87,5%)
- [ ] Time confia no processo (não diz mais "Scrum não funciona aqui")

---

### ⚠️ Riscos Comuns e Como Corrigir

| Risco | Sintoma | Correção na Hora |
|-------|---------|-----------------|
| **Time maquiar resultados** | "Ah, a gente meio que faz..." → marcar SIM | Facilitador: "Meio que fazer é NÃO. SIM só se 100%. Vamos ser honestos." |
| **Desanimar com score baixo** | "Só 3/8? Não fazemos nada certo!" | Facilitador: "Ótimo! Agora sabemos EXATAMENTE o que melhorar. Scrum é melhoria contínua." |
| **Querer corrigir todos NÃOs** | "Vamos fazer 5 experimentos" | Facilitador: "Só 1. Foco. Scrum não é sprint de correção, é melhoria incremental." |
| **Culpar PO/SM** | "B1 é NÃO porque o PO não aparece" | Facilitador: "Ok, então vamos criar ação: 'PO participa de X cerimônias por semana'. Sem culpa, só ação." |
| **Experimento sem métrica** | "Vamos fazer o PO priorizar melhor" | Facilitador: "Como vamos saber que priorizou melhor? Qual evidência concreta?" |

---

### 🗣️ Scripts Prontos do Facilitador

**Se time maquiar:**
> "Pessoal, resultado 'bonito' não ajuda. Resultado real sim. Vamos ser radicalmente honestos. Ninguém vai ser punido por NÃO."

**Se desanimarem:**
> "Score baixo não é fracasso. É diagnóstico. Agora sabemos O QUÊ melhorar. Isso é poder."

**Ao escolher experimento:**
> "Vamos pegar o NÃO que mais dói ou o mais fácil de corrigir? Depende: se querem vitória rápida, vão no fácil. Se querem impacto, vão no que dói."

**Ao fechar sessão:**
> "Em 3 meses voltamos aqui e fazemos de novo. Meta: virar todos em SIM. Quem topa?"

---

## 🐷 Dinâmica 3: Porcos & Galinhas na Prática (Protocolo Workshop)

### 🎯 Objetivo
Definir protocolo claro de **quem fala onde** (Daily, Planning, Review, Refinement) para proteger Sprint sem gerar conflito político.

### ⏱️ Duração
15-25 minutos

### 👥 Participantes
- **Porcos**: obrigatório
- **Galinhas**: SIM (precisam entender e aceitar protocolo)

### 📦 Materiais
- [ ] Quadro com colunas: `Cerimônia | Porcos | Galinhas | Regra`
- [ ] Lista de participantes atuais (nomes)
- [ ] Post-its ou cards para classificar pessoas
- [ ] Template de Protocolo (ver Output)

---

### 🕐 Agenda Detalhada (25 min)

#### **00:00-05:00 — Contexto e Definições (5 min)**

**Script do Facilitador:**

> "Pessoal, vamos definir um protocolo simples: **Porcos** são quem está comprometido com entrega; **Galinhas** contribuem mas não decidem durante execução.
>
> **Não é exclusão**, é clareza. Galinhas são bem-vindas, mas em momentos certos.
>
> **Por que fazemos isso?** Para proteger o time de interferência e manter Daily/Sprint focados.
>
> Vamos começar classificando quem é quem."

---

#### **05:00-10:00 — Classificar Participantes (5 min)**

**Facilitador lista nomes no quadro:**

> "Vou listar todo mundo que participa de alguma cerimônia. Vamos classificar: Porco ou Galinha?"

**Exemplo:**

| Nome | Papel Formal | Classificação | Critério |
|------|-------------|---------------|----------|
| Maria | Dev Full-Stack | 🐷 Porco | Trabalha full-time no produto, committa no Sprint |
| Paulo | Dev Backend | 🐷 Porco | Idem |
| João | PO | 🐷 Porco | Define prioridade, participa de Planning/Review |
| Ana | QA | 🐷 Porco | Testa dentro do Sprint, comprometida com Done |
| Carlos | Gerente | 🐔 Galinha | Não executa, mas quer acompanhar (stakeholder) |
| Lívia | Cliente | 🐔 Galinha | Dá feedback, mas não decide implementação |
| Pedro | Infra | 🐷/🐔 ? | **Decisão necessária** (ver abaixo) |

**Caso ambíguo (Pedro Infra):**

> "Pedro, você trabalha no produto regularmente ou só quando chamamos?"

**Pedro:** "Eu entro quando precisa configurar servidor, mas não todo dia."

**Facilitador:** "Ok. Sugestão: Pedro é **Galinha na maior parte do tempo**, mas vira **Porco temporário** quando tiver tarefa de infra no Sprint (participa de Daily nos dias relevantes). Concordam?"

**[Time concorda]**

---

#### **10:00-20:00 — Definir Protocolo por Cerimônia (10 min)**

**Facilitador preenche tabela no quadro:**

| Cerimônia | Porcos | Galinhas | Regra Operacional |
|-----------|--------|----------|------------------|
| **Daily** | ✅ Falam, decidem | 👀 Assistem, NÃO falam | Perguntas/feedback ficam para depois do Daily (canal async ou 1:1) |
| **Planning** | ✅ Estimam, comprometem | 🚫 Não participam | Decisão é do time. PO (se porco) participa. |
| **Review** | ✅ Demonstram | ✅ Assistem, testam, dão feedback | Galinhas bem-vindas! Hora de validar valor. |
| **Retrospectiva** | ✅ Participam | 🚫 Não participam | Espaço seguro do time (só porcos). |
| **Refinement** | ✅ Discutem, decompõem | ✅ Entram sob convite para esclarecer valor/uso | Galinhas como "especialistas convidados" quando necessário. |

**Facilitador explica cada linha:**

> "**Daily**: Porcos falam. Galinhas podem assistir (transparência), mas não interferem. Se o Carlos [gerente] tiver dúvida, ele anota e pergunta DEPOIS do Daily. Combinado, Carlos?"

**Carlos [gerente]:** "Combinado."

> "**Review**: Aqui sim, Lívia [cliente] e Carlos [gerente] são super bem-vindos. É hora de validar se entregamos valor. Testem, critiquem, deem feedback."

---

#### **20:00-25:00 — Protocolo para Times Remotos (5 min)**

**Script do Facilitador:**

> "Como somos remotos, vamos adicionar uma regra: **Doc de Decisões + Cutoff**.
>
> **Regra**: Decisões tomadas no Daily são finais até o próximo Daily. Quem não participou, aceita decisão. Reabertura só se bloqueio crítico surgir.
>
> Exemplo: se discutimos arquitetura no Daily e decidimos usar API X, quem não estava aceita. Se depois alguém disser 'eu teria feito diferente', resposta é: 'Ok, mas decisão foi tomada. Vamos seguir e avaliar na Retro se funcionou'."

**[Facilitador cola template de Decisão no Notion/Confluence]**

**Template:**

```markdown
## Decisão: [Assunto]
**Data/hora:** 2026-01-06 10:00 (Daily Sprint 3)
**Presentes (porcos):** Maria, Paulo, João
**Ausentes:** Ana (avisou, aceita decisão)

### Decisão Final
[Opção escolhida + quem executa + prazo]

### Cutoff
Decisão é final. Reabertura só se bloqueio técnico crítico surgir.
**Quem não estava:** aceita decisão e segue.
```

---

### 📤 Outputs Obrigatórios

✅ **Tabela Porcos vs Galinhas** (nomes classificados)
✅ **Protocolo por Cerimônia** (tabela com regras claras)
✅ **Doc de Decisões** (template copiável para time usar)
✅ **Compromisso público** (galinhas aceitam regra, porcos se comprometem a proteger)

---

### 📏 Critérios de Sucesso

**Durante a sessão:**
- [ ] Classificação sem conflito (galinhas não se sentiram "excluídas")
- [ ] Regras aceitas por todos (incluindo galinhas)
- [ ] Casos ambíguos resolvidos (ex.: especialista que entra às vezes)

**Após 1-2 Sprints:**
- [ ] Daily volta para 10-15 min (sem interferência)
- [ ] Zero "decisões revertidas" por galinha
- [ ] Galinhas respeitam protocolo (feedback vem em Review/Refinement, não no Daily)
- [ ] Porcos se sentem protegidos (podem trabalhar sem micro-gestão)

---

### ⚠️ Riscos Comuns e Como Corrigir

| Risco | Sintoma | Correção na Hora |
|-------|---------|-----------------|
| **Galinha se ofender** | "Então eu não posso falar mais?" | Facilitador: "Você pode e DEVE falar — mas no momento certo. Daily é sincronização do time. Review/Refinement é onde seu feedback é ouro." |
| **Porco não proteger Daily** | Galinha interrompe e ninguém corta | SM (facilitador) corta educadamente: "[Nome], ótima pergunta. Anota aí, a gente alinha depois do Daily." |
| **Classificação confusa** | "Mas eu sou meio porco, meio galinha..." | Facilitador: "Pergunta: você committa no Sprint e é accountable pela entrega? SIM = porco. NÃO = galinha (mesmo que contribua)." |
| **Time não usar Doc de Decisão** | Decisões ficam "no ar" | SM cobra: "Pessoal, decisão importante. Vou registrar no Doc de Decisões agora. Alguém discorda?" |

---

### 🗣️ Scripts Prontos do Facilitador

**Se galinha se ofender:**
> "Não é sobre importância. Você é essencial. É sobre QUANDO sua contribuição é mais útil. No Daily, time se sincroniza. Na Review, você valida valor. Seu feedback na Review vale ouro."

**Se porco não proteger:**
> "[Porco], você que vai executar isso. Concorda com a interferência ou prefere decidir com o time?"

**Ao fechar sessão:**
> "Recapitulando: Daily só porcos falam. Review todo mundo contribui. Refinement galinhas entram sob convite. Doc de Decisões para remoto. Quem topa testar isso por 2 Sprints?"

---

# 📊 DINÂMICAS CAPÍTULO 8 — Estimativas e Velocidade

## 🃏 Dinâmica 4: Oficina Planning Poker + Velocidade (Estimation Workshop)

### 🎯 Objetivo
Estimar backlog usando Planning Poker, identificar épicos/spikes, e calcular previsão de prazo baseada em velocidade.

### ⏱️ Duração
60-90 minutos (depende do tamanho do backlog)

### 👥 Participantes
- **Porcos (obrigatório)**: time dev (quem estima) + PO (esclarece) + SM (facilita)
- **Galinhas**: NÃO (estimativa é do time)

### 📦 Materiais
- [ ] Baralho Planning Poker (físico ou app: PlanningPoker.com, Scrum Poker Online)
- [ ] Backlog preparado pelo PO (histórias escritas, visíveis para todos)
- [ ] Quadro/board para anotar pontos
- [ ] Timer visível
- [ ] Planilha/doc para registrar: `História | Pontos | Observações`

---

### 📋 Preparação (PO faz ANTES da sessão)

**PO prepara backlog:**
1. Histórias no formato User Story (ou equivalente claro)
2. Valor de negócio explícito (1 frase: "Isso permite X", "Isso reduz Y")
3. Top 20-30 histórias priorizadas (não precisa 100% do backlog, só o suficiente para 2-3 Sprints à frente)

**Facilitador (SM) prepara:**
1. Sala/call configurada
2. Baralhos distribuídos ou app aberto
3. Quadro visível para anotar
4. Agenda no chat/tela

---

### 🕐 Agenda Detalhada (90 min)

#### **00:00-10:00 — Alinhamento e Regras (10 min)**

**Script do Facilitador:**

> "Pessoal, vamos estimar o backlog usando **Planning Poker**. Objetivo: sair daqui com backlog pontuado e previsão de prazo realista.
>
> **Regras:**
> 1. **Story Points ≠ Horas**. Medimos esforço relativo: volume + complexidade + risco + testes.
> 2. **Cartas Fibonacci**: 0, ½, 1, 2, 3, 5, 8, 13, 21, 40, 100 + ?, ∞, ☕.
> 3. **História âncora**: vamos escolher 1 história 'média' e fixar ela em **5 pontos**. Tudo é comparado a ela.
> 4. **Extremos explicam**: quem deu maior e menor estimativa sempre explica por quê.
> 5. **Épicos (∞)** e **Incertezas (?)** não entram no Sprint — vamos marcar para decompor/pesquisar.
>
> Vamos começar escolhendo a âncora."

---

#### **10:00-20:00 — Escolher História Âncora (10 min)**

**Script do Facilitador:**

> "PO, leia 5-8 histórias do backlog. Time, vamos escolher UMA que seja:
> - Nem trivial, nem épica (tamanho médio)
> - Tecnicamente conhecida (já fizemos algo parecido)
> - Completa (dá para entregar e testar)
>
> Essa será nossa **âncora de 5 pontos**."

**[PO lê 5-8 histórias]**

**Facilitador:**

> "Qual dessas vocês acham que é 'média'? Vamos votar."

**[Time vota — exemplo: História #7 vence]**

**Facilitador:**

> "Ok, **História #7: 'Resetar senha via email' = 5 pontos**. Isso é nossa base. Tudo que for parecido com isso é 5. Maior é 8 ou 13. Menor é 3 ou 2. Combinado?"

**[Time confirma]**

**[Facilitador anota no quadro: ⚓ ÂNCORA: História #7 = 5 pontos]**

---

#### **20:00-70:00 — Estimar Histórias (50 min = ~10-15 histórias)**

**Para cada história, seguir este loop (3-5 min por história):**

##### **Loop de Estimativa:**

**1. PO Lê História (1 min)**

> "História #12: 'Como usuário, quero filtrar relatórios por data, para ver apenas período relevante.'
>
> **Valor de negócio**: Usuários reclamam que relatório trava porque carrega 10 anos de dados. Filtro reduz carga e melhora UX.
>
> Perguntas técnicas?"

**[Time faz perguntas — PO esclarece]**

---

**2. Reflexão Silenciosa (30 seg)**

**Facilitador:**

> "30 segundos: pensem individualmente. Isso é maior ou menor que a âncora (5)? Escolham carta, mas não mostrem ainda."

**[Timer: 30 seg]**

---

**3. Revelar Cartas Simultaneamente**

**Facilitador:**

> "3, 2, 1, mostre!"

**[Todos viram carta ao mesmo tempo]**

**Exemplo de resultado:**
```
Maria: 13
Paulo: 3
João: 8
Ana: 8
```

---

**4. Extremos Explicam (2-3 min) — O OURO DO POKER**

**Facilitador:**

> "Maria, por que 13?"

**Maria:** "Nunca integramos com esse relatório. API é legada, documentação ruim. Risco alto."

**Facilitador:**

> "Paulo, por que 3?"

**Paulo:** "A gente tem biblioteca de filtros pronta. É só adicionar campo 'data' no form e passar para API. Backend já suporta."

**Facilitador:**

> "Ok, vamos discutir. Paulo, a API legada que Maria falou é problema?"

**Paulo:** "Ah, sim. Esqueci disso. Se for API antiga, complica. Mas dá para testar rápido."

**João:** "Sugiro: fazer **Spike** de 1 dia para validar API. Depois estimamos de novo."

**[Time concorda]**

---

**5. Re-votar (se necessário)**

**Facilitador:**

> "Vamos votar de novo com base na discussão. Se ainda for muito incerto, marcamos como **?** (spike)."

**[Time vota novamente]**

**Resultado:**
```
Maria: ?
Paulo: ?
João: ?
Ana: ?
```

**Facilitador:**

> "Ok, consenso: **Spike necessário**. Vou anotar:
>
> **História #12: ?** → **Spike (1 dia): Validar API de relatórios**
>
> Após Spike, re-estimamos. Próxima história."

---

**6. Fechar Número Final (quando convergir)**

**Exemplo com convergência:**

**História #15:**
```
Rodada 1: 8, 8, 5, 8
Facilitador: "Maioria 8. Quem deu 5, concorda com 8?"
Dev: "Sim, faz sentido. Vou de 8."

DECISÃO: História #15 = 8 pontos
```

**Regra para fechar:**
- **Convergência (diferença < 1 carta)**: usar maioria ou média
- **Divergência grande**: extremos explicam + re-votar
- **Persistência**: assumir o **maior** (margem de segurança)

---

**[Repetir loop para 10-15 histórias — facilitador anota pontos]**

---

#### **70:00-80:00 — Identificar Épicos e Spikes (10 min)**

**Facilitador revisa quadro:**

> "Ok, estimamos 15 histórias. Vejo que temos:
>
> **Épicos (∞)**:
> - História #20: 'Sistema de relatórios completo' → DECOMPOR
>
> **Spikes (?)**:
> - História #12: Validar API legada (1 dia)
> - História #18: Pesquisar lib de pagamento (2 dias)
>
> **Próximo passo**:
> - Épicos: PO vai quebrar em histórias menores (próxima sessão)
> - Spikes: entram no próximo Sprint como tarefas de pesquisa (timeboxed)
>
> Histórias pontuadas: **12 histórias = 87 pontos**"

---

#### **80:00-90:00 — Calcular Velocidade e Prazo (10 min)**

**Facilitador:**

> "Agora vamos calcular **velocidade estimada** para prever prazo.
>
> **Método:**
> 1. Quantas pessoas no time? → 4 pessoas
> 2. Sprint de quantas semanas? → 2 semanas
> 3. Velocidade típica para time novo: ~5-7 pontos por pessoa por Sprint
>
> **Velocidade estimada (conservadora)**:
> 4 pessoas × 5 pontos = **20 pontos/Sprint**
>
> **Backlog pontuado**: 87 pontos (das 12 histórias)
>
> **Previsão de Sprints**:
> 87 ÷ 20 = **4,3 Sprints** ≈ 5 Sprints
>
> **Previsão de Prazo**:
> 5 Sprints × 2 semanas = **10 semanas**
>
> **Mas atenção**: isso é estimativa inicial. Após 2-3 Sprints, vamos recalcular com velocidade REAL."

---

### 📤 Outputs Obrigatórios

✅ **Backlog pontuado** (ex.: 12 histórias = 87 pontos)
✅ **História âncora** documentada (ex.: História #7 = 5 pontos)
✅ **Lista de épicos** para decompor
✅ **Lista de Spikes** para próximo Sprint (com timebox)
✅ **Previsão de prazo inicial** (com ressalva de recalibração)
✅ **Registro** (planilha/Jira/Trello com pontos)

---

### 📏 Critérios de Sucesso

**Durante a sessão:**
- [ ] Time estimou sem "chute de horas" (usou comparação relativa)
- [ ] Extremos explicaram em TODAS as divergências grandes (revelou riscos/atalhos)
- [ ] Épicos e spikes foram marcados (não entraram como "pontos normais")
- [ ] Sessão foi colaborativa (não 1 pessoa dominando)

**Após 2-3 Sprints:**
- [ ] Velocidade real ficou próxima da estimada (±30%)
- [ ] Estimativas estão melhorando (menos re-estimativas)
- [ ] Time confia nos pontos (não reclama "isso não é X pontos")

---

### ⚠️ Riscos Comuns e Como Corrigir

| Risco | Sintoma | Correção na Hora |
|-------|---------|-----------------|
| **Converter pontos em horas** | "8 pontos = 2 dias" | Facilitador: "Não! 8 pontos = um pouco maior que âncora (5). Sem horas." |
| **PO interferir na estimativa** | "Mas isso TEM QUE ser 3, não 8!" | Facilitador: "PO esclarece valor, time estima esforço. Se time diz 8, é 8." |
| **Discussão virar debate eterno** | 15 min discutindo 1 história | Facilitador: "Vamos fechar. Assumimos o maior (13) e seguimos. Se estivermos errados, ajustamos na próxima." |
| **Time não quebrar épico** | Aceitar ∞ no Sprint | Facilitador: "Épico NÃO entra. Ou decompõe agora ou sai do Sprint." |
| **Spike virar "projeto de pesquisa"** | "Vamos pesquisar 2 semanas" | Facilitador: "Spike tem timebox: máximo 3 dias. Output é documento/decisão, não código perfeito." |

---

### 🗣️ Scripts Prontos do Facilitador

**Se alguém converter em horas:**
> "Sem horas! Story Points são relativos. 8 significa 'um pouco maior que 5'. Não significa '16 horas'."

**Se PO pressionar estimativa:**
> "[PO], entendo que você quer que seja rápido. Mas time técnico estima esforço. Se eles dizem 13, vamos confiar. Se estivermos errados, ajustamos depois."

**Se discussão estender:**
> "Ótima discussão, mas vamos fechar. Temos mais 10 histórias. Assumimos [número maior] e seguimos."

**Ao calcular velocidade:**
> "Isso é **previsão inicial**. Pode estar errado. Mas em 3 Sprints vamos ter dado REAL e recalcular. Melhor previsão imperfeita do que nenhuma previsão."

---

## 💰 Dinâmica 5: Previsão por Faixa + Conversa com Patrocinador (Stakeholder Simulation)

### 🎯 Objetivo
Simular apresentação de prazo/custo para patrocinador usando **faixas realistas** (pessimista/provável/otimista) e script preparado para negociar expectativas.

### ⏱️ Duração
30-45 minutos

### 👥 Participantes
- **Porcos**: PO + SM (quem vai apresentar para stakeholders)
- **Galinhas (opcional)**: stakeholder real ou alguém fazendo papel de patrocinador

### 📦 Materiais
- [ ] Dados da Dinâmica 4 (backlog pontuado, velocidade estimada)
- [ ] Planilha de Previsão (template abaixo)
- [ ] Script de Apresentação (ver seção)
- [ ] Calculadora / Excel para simular cenários

---

### 📋 Template de Previsão por Faixa

**Facilitador prepara planilha (copiar estrutura):**

```
=== PREVISÃO DE PRAZO E INVESTIMENTO ===

DADOS INICIAIS:
- Backlog pontuado: 87 pontos
- Sprint: 2 semanas
- Time: 4 pessoas
- Custo/pessoa/mês: R$ 15.000

VELOCIDADE ESTIMADA (pontos/Sprint):
- Pessimista: 15 (time novo, muitos bloqueios)
- Provável: 20 (cenário esperado)
- Otimista: 25 (tudo fluindo, sem impedimentos)

PRAZO (Sprints):
- Pessimista: 87 ÷ 15 = 5,8 ≈ 6 Sprints
- Provável: 87 ÷ 20 = 4,3 ≈ 5 Sprints
- Otimista: 87 ÷ 25 = 3,5 ≈ 4 Sprints

PRAZO (Semanas):
- Pessimista: 6 × 2 = 12 semanas
- Provável: 5 × 2 = 10 semanas
- Otimista: 4 × 2 = 8 semanas

INVESTIMENTO (Custo por Sprint = R$ 30k):
- Pessimista: 6 × R$ 30k = R$ 180k
- Provável: 5 × R$ 30k = R$ 150k
- Otimista: 4 × R$ 30k = R$ 120k

COM MARGEM (+15% overhead + 10% risco):
- Provável: R$ 150k × 1,25 = R$ 187k
```

---

### 🕐 Agenda Detalhada (45 min)

#### **00:00-10:00 — Preparação da Apresentação (10 min)**

**Facilitador:**

> "Vamos simular apresentação para patrocinador. PO e SM, vocês vão apresentar prazo e custo usando faixas realistas.
>
> **Objetivo**: patrocinador entende que:
> 1. Previsão é por faixa (não número cravado)
> 2. Recalibramos a cada Sprint Review
> 3. Escopo é flexível (priorização contínua)
>
> Vamos montar a apresentação."

**[PO e SM preenchem planilha com dados reais do backlog]**

---

#### **10:00-25:00 — Simulação de Apresentação (15 min)**

**PO/SM apresentam para "patrocinador" (pode ser alguém do time fazendo o papel):**

---

**Script de Apresentação (PO/SM):**

> "**[Contexto]**
> Estimamos o backlog inicial usando Planning Poker. Temos 87 Story Points mapeados, cobrindo as funcionalidades prioritárias para este release.
>
> **[Método]**
> Story Points medem esforço relativo (não horas diretas). Após 2-3 Sprints, vamos observar nossa velocidade real — quantos pontos entregamos por Sprint — e isso vira a base da previsão de prazo.
>
> **[Previsão por Faixa]**
> Baseado em times similares, estimamos velocidade entre 15-25 pontos por Sprint de 2 semanas. Isso nos dá:
>
> - **Cenário pessimista**: 12 semanas (3 meses)
> - **Cenário provável**: 10 semanas (2,5 meses)
> - **Cenário otimista**: 8 semanas (2 meses)
>
> **Maior probabilidade: 10 semanas.**
>
> **[Investimento]**
> Time de 4 pessoas custa ~R$ 30k por Sprint. Com margem de segurança (overhead + risco):
>
> - **Investimento estimado: R$ 150k a R$ 190k**
> - **Maior probabilidade: R$ 187k**
>
> **[Recalibração]**
> Essa previsão vai ficar **mais precisa** após os primeiros 2-3 Sprints, quando tivermos velocidade REAL (não estimada).
>
> A cada Sprint Review (a cada 2 semanas), vamos recalcular e atualizar você. Se estivermos adiantando, você pode adicionar escopo. Se atrasando, re-priorizamos para entregar o essencial no prazo.
>
> **[O que garantimos]**
> ✅ Entrega funcional a cada 2 semanas (incremento testado)
> ✅ Transparência total (burndown, velocidade, backlog visível)
> ✅ Re-priorização contínua (você escolhe o que importa mais)
>
> **[O que NÃO garantimos]**
> ❌ Escopo fixo + prazo fixo + custo fixo simultaneamente (triângulo de ferro: impossível)
> ❌ Data cravada hoje (antes de velocidade real)
>
> **[Pergunta para você]**
> Prefere:
> A) Previsão realista que ajustamos juntos a cada 2 semanas, OU
> B) Data fixa que provavelmente vai estourar?
>
> O que prefere?"

---

**Patrocinador (papel simulado) pode fazer perguntas difíceis:**

**Exemplo 1:**

**Patrocinador:** "Mas eu preciso de data CRAVADA. Reunião de diretoria é dia X."

**PO/SM (script de resposta):**

> "Entendo. Aqui está o que podemos fazer:
>
> 1. **Data fixa, escopo flexível**: Garantimos entrega funcional no dia X, mas priorizamos o mais crítico. Se não couber tudo, itens menos prioritários saem.
>
> 2. **Escopo fixo, data flexível**: Entregamos os 87 pontos completos, mas prazo é faixa (8-12 semanas, ajustando conforme velocidade).
>
> Qual prefere?"

---

**Exemplo 2:**

**Patrocinador:** "Concorrente lançou feature X. Preciso disso URGENTE, mesmo que não esteja no backlog."

**PO/SM (script de resposta):**

> "Sem problema. Podemos adicionar feature X ao backlog, estimá-la, e **trocar por outra história de pontos equivalentes** no Sprint atual.
>
> Qual história você prefere tirar para entrar feature X?
>
> Assim mantemos velocidade e previsibilidade."

---

**Exemplo 3:**

**Patrocinador:** "Não posso apresentar 'faixa' para diretoria. Eles vão achar vago."

**PO/SM (script de resposta):**

> "Faixa é **mais honesto** que número fake. Qual você prefere apresentar para diretoria:
>
> A) '10 semanas, com 90% de confiança' (honesto, defensável)
> B) '8 semanas CRAVADO' (fake, vai estourar, você vai ter que explicar depois)
>
> Nós defendemos A. Mas se você precisar de B, a gente faz — desde que fique claro que é meta agressiva, não garantia."

---

#### **25:00-40:00 — Debrief e Ajuste de Scripts (15 min)**

**Facilitador conduz debrief:**

> "Como foi apresentar com faixas? Patrocinador aceitou?"

**[PO/SM compartilham dificuldades]**

**Facilitador:**

> "Vamos ajustar scripts para nosso contexto. Quais perguntas esperamos do nosso patrocinador real?"

**[Time discute e ajusta scripts — anota respostas preparadas]**

---

#### **40:00-45:00 — Registro e Compromisso (5 min)**

**Facilitador:**

> "Vou registrar scripts ajustados no [Confluence/Notion]. Na próxima Sprint Review de verdade, PO/SM usam esse script.
>
> Dúvidas?"

---

### 📤 Outputs Obrigatórios

✅ **Planilha de Previsão** (faixas de prazo e custo)
✅ **Script de Apresentação** ajustado para contexto da empresa
✅ **Respostas preparadas** para objeções comuns do patrocinador
✅ **Compromisso**: usar isso na próxima Sprint Review real

---

### 📏 Critérios de Sucesso

**Durante simulação:**
- [ ] PO/SM apresentaram com confiança (não inseguros)
- [ ] Usaram faixas (não número cravado fake)
- [ ] Responderam objeções sem prometer o impossível

**Na Sprint Review real (próxima):**
- [ ] Patrocinador aceitou faixas (ou negociou escopo flexível)
- [ ] Zero promessas impossíveis (escopo+prazo+custo fixos)
- [ ] Patrocinador entende que recalibração é contínua

---

### ⚠️ Riscos Comuns e Como Corrigir

| Risco | Sintoma | Correção na Hora |
|-------|---------|-----------------|
| **PO ceder e prometer data fixa** | "Ok, 8 semanas cravado" | Facilitador: "Recua. Seja honesto. Faixa ou escopo flexível." |
| **Patrocinador não aceitar faixa** | "Isso é vago demais" | Script: "Faixa é honesta. Número cravado agora é mentira. Em 3 Sprints temos certeza maior." |
| **Time inseguro para defender** | "Acho que o patrocinador vai brigar" | Facilitador: "Simulamos exatamente para isso. Você tem script pronto. Vai dar certo." |
| **Esquecer de recalibrar** | Apresentaram faixa, mas nunca atualizaram | SM coloca na agenda: "Recalibrar previsão" em TODA Sprint Review |

---

### 🗣️ Scripts Prontos do Facilitador

**Se PO ceder:**
> "PO, você não pode prometer o impossível. Se você cravar 8 semanas e estourar, quem vai explicar? Melhor faixa honesta do que promessa fake."

**Ao treinar resposta para objeção:**
> "Patrocinador vai pressionar. É normal. Script funciona assim: reconheça a pressão, explique trade-off, ofereça opção. Não ceda, negocie."

**Ao fechar sessão:**
> "Na próxima Sprint Review de verdade, vocês usam esse script. Vai funcionar. Confiem no processo. Perguntas?"

---

## ✅ Checklist Geral de Facilitação (para SM usar em qualquer dinâmica)

### Antes da Sessão
- [ ] Objetivo claro escrito (cole no início da call/sala)
- [ ] Materiais preparados (quadro, post-its, timer, templates)
- [ ] Participantes confirmados (porcos obrigatórios)
- [ ] Agenda enviada com antecedência (pelo menos 1 dia)

### Durante a Sessão
- [ ] Começar no horário (não esperar atrasados > 5 min)
- [ ] Apresentar objetivo + regras (5 min máximo)
- [ ] Usar timer visível (respeitar timebox)
- [ ] Cortar tangentes educadamente (script: "Ótimo ponto, mas vamos focar. Voltamos a isso depois se necessário.")
- [ ] Garantir participação equilibrada (se 1 pessoa domina, perguntar para os outros: "Alguém mais quer contribuir?")
- [ ] Anotar outputs visualmente (quadro, doc compartilhado)

### Ao Fechar Sessão
- [ ] Recapitular outputs (lista rápida do que foi decidido)
- [ ] Definir responsáveis (quem faz o quê)
- [ ] Registrar decisões (foto do quadro, doc, Trello)
- [ ] Agendar revisão (quando vamos avaliar se funcionou)
- [ ] Agradecer time (reconhecer esforço)

---

## 📚 Recursos Adicionais

### Templates Copiáveis
👉 Ver `Templates_Operacionais.md` para versões copiáveis de:
- Experimento do Sprint
- Checklist ScrumButt Test
- Protocolo Porcos vs Galinhas
- Doc de Decisões Remotas
- Planilha de Previsão

### Diagramas Visuais
👉 Ver `Mermaids_Scrum.md` para diagramas Mermaid de:
- Fluxo Planning Poker
- Fluxo ScrumButt → Diagnóstico → Experimento
- Mapa Smells → Previsibilidade

---

*Playbooks criados para UzzAI — Material facilitação baseado em práticas de Scrum, adaptado para contexto brasileiro e times remotos.*
