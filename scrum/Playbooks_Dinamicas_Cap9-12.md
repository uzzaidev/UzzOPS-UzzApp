---
created: 2026-01-06
updated: 2026-01-07T21:46
tags:
  - scrum
  - playbooks
  - oficinas
  - pbr
  - sprint-zero
---

# 🎯 Playbooks e Dinâmicas — Cap. 9-12

## 📖 Como Usar Este Documento

Este playbook contém **4 oficinas completas** para operacionalizar:
- Product Backlog Refinement (PBR)
- Definition of Done (DoD)
- Sprint Zero
- Baseline de Métricas

Cada oficina inclui roteiro detalhado para rodar **amanhã mesmo** sem experiência prévia.

---

# 📍 OFICINA 1 — Refine com Protótipo (60-90 min)

## 🎯 Objetivo

Transformar feedback do protótipo prematuro em backlog refinado + prioridades claras.

**Quando rodar:** Após Sprint Review de protótipo (Sprint 1 ou quando validar hipótese grande).

---

## ⏱️ Duração

60-90 minutos (depende do tamanho do backlog a refinar)

---

## 👥 Participantes

- **Porcos (obrigatório):** PO + time dev (3-8 pessoas)
- **Galinhas (recomendado):** 1-2 stakeholders ou usuários reais que testaram o protótipo

---

## 📦 Materiais

- [ ] Protótipo pronto (papel, wireframe, encenação gravada, etc.)
- [ ] Post-its ou cards virtuais (Miro/Mural)
- [ ] Quadro com 4 colunas: `Gostei | Falta | Confuso | Risco`
- [ ] Mapa Mental do produto (físico ou digital)
- [ ] Backlog atual (Trello/Jira/Notion/planilha)
- [ ] Timer visível

---

## 📋 Preparação (Antes da Sessão)

**Facilitador (SM ou PO):**
1. Preparar demo do protótipo (5-10 min de apresentação)
2. Imprimir/colar mapa mental do produto em quadro grande
3. Ter backlog atual visível para todos
4. Preparar post-its coloridos (4 cores para 4 categorias)

**Participantes:**
- Ter testado protótipo antes (se possível — pelo menos 10 min de uso)

---

## 🕐 Agenda Detalhada (90 min)

### **00:00-10:00 — Contexto e Objetivo do MVP (10 min)**

**Script do Facilitador:**

> "Pessoal, vamos refinar nosso backlog com base no protótipo que validamos.
>
> **Objetivo desta sessão:**
> 1. Coletar feedback estruturado do protótipo
> 2. Atualizar mapa mental com aprendizados
> 3. Criar/atualizar histórias no backlog
> 4. Priorizar próximos 5-10 itens para os próximos 2 Sprints
>
> **Lembrando nosso objetivo de MVP:**
> [PO relembra em 2-3 frases o que é o MVP — ex.: 'App que permite usuário cadastrar tarefas, marcar como feito, e receber notificação diária']
>
> Vamos começar!"

---

### **10:00-25:00 — Demo/Encenação do Protótipo (15 min)**

**Facilitador ou PO demonstra protótipo:**

**Roteiro da Demo:**
1. **Contexto** (1 min): "Este protótipo valida [hipótese X]"
2. **Walkthrough** (8-10 min): Navegar pelo protótipo mostrando fluxos principais
3. **Perguntas rápidas** (3-5 min): Participantes fazem perguntas de esclarecimento

**Exemplo de Demo (App de Tarefas):**

> "Protótipo de papel — 5 telas principais:
>
> Tela 1: Login (Google OAuth)
> Tela 2: Dashboard com lista de tarefas
> Tela 3: Adicionar tarefa (nome + descrição + data)
> Tela 4: Marcar como feito (checkbox + animação)
> Tela 5: Notificação push (mockup)
>
> [Facilitador 'navega' mostrando cada tela de papel]
>
> Perguntas?"

---

### **25:00-40:00 — Coletar Feedback Estruturado (15 min)**

**Instrução do Facilitador:**

> "Agora vamos coletar feedback em 4 categorias. Cada pessoa escreve post-its silenciosamente (10 min):
>
> 🟢 **Gostei:** O que funcionou bem no protótipo?
> 🟡 **Falta:** O que está faltando para ser MVP?
> 🔴 **Confuso:** O que não ficou claro? Onde usuário pode se perder?
> ⚠️ **Risco:** O que pode dar errado tecnicamente ou de negócio?
>
> Podem escrever quantos post-its quiserem. Sejam específicos.
>
> Vocês têm 10 minutos. Timer começando... AGORA!"

**[Timer: 10 min — escrita silenciosa]**

**Facilitador:**

> "Ok, tempo! Agora cada pessoa cola seus post-its nas colunas correspondentes e lê rapidamente (sem explicar ainda)."

**[5 min — todos colam e lêem]**

**Facilitador agrupa post-its similares:**

> "Vejo temas recorrentes:
> - Gostei: Login simples (5 menções)
> - Falta: Editar tarefa (4 menções), Filtros (3 menções)
> - Confuso: Como deletar tarefa? (3 menções)
> - Risco: Notificação push — permissão iOS/Android (2 menções)"

---

### **40:00-60:00 — Converter em Mudanças no Mapa Mental + Novas Histórias (20 min)**

**Facilitador conduz atualização do mapa mental:**

**Passo 1: Adicionar ramos ausentes (5 min)**

> "Com base no 'Falta', vejo que precisamos adicionar:
>
> - Epic: Gerenciamento de Tarefas
>   - História: Editar tarefa
>   - História: Deletar tarefa
>   - História: Filtros (data, status)
>
> Alguém discorda ou quer adicionar?"

**[Facilitador desenha/adiciona no mapa mental — físico ou digital]**

**Passo 2: Marcar riscos (3 min)**

> "Riscos identificados:
> - Notificação push: dependência de permissão nativa
> - Performance: lista grande pode demorar (> 100 tarefas)
>
> Vou marcar esses como 'spike' ou história técnica."

**Passo 3: Criar novas histórias no backlog (10 min)**

**Facilitador + PO criam histórias:**

```
História nova #1:
Como usuário, quero editar tarefa já criada
para corrigir erros sem deletar e recriar.

Pontos: [a estimar]
Prioridade: Alta (faltou no MVP)

---

História nova #2 (Spike):
Como time dev, quero investigar permissões de notificação iOS/Android
para entender complexidade antes de estimar feature completa.

Timebox: 1 dia
Prioridade: Alta (risco técnico)
```

**[Facilitador anota no Trello/Jira/planilha]**

---

### **60:00-80:00 — Quebrar Épicos e Escrever Critérios de Aceitação (20 min)**

**Facilitador foca nos próximos 5 itens do backlog:**

> "Vamos pegar os top 5 itens do backlog (após atualização) e garantir que estão prontos para próximo Sprint."

**Para cada história (4 min cada):**

**História #1: "Editar tarefa"**

**Facilitador:**

> "Essa história cabe em 1 Sprint? Ou é épico?"

**Time:** "Cabe. É só adicionar botão de editar e form pré-preenchido."

**Facilitador:**

> "Ok. Vamos escrever critérios de aceitação. PO, o que precisa funcionar?"

**PO:**

> "Dado que usuário tem tarefa criada, quando clica em 'Editar', então abre form com dados atuais pré-preenchidos. Quando salva, atualiza tarefa na lista."

**Facilitador anota:**

```
Critérios de Aceitação:
- Dado que tarefa existe
- Quando clica botão "Editar"
- Então abre form com nome, descrição, data pré-preenchidos
- Quando salva, atualiza tarefa na lista sem duplicar
- Quando cancela, não muda nada

Exemplos:
✅ Editar tarefa "Comprar leite" → muda nome para "Comprar leite desnatado" → salva → aparece atualizado
❌ Editar e cancelar → tarefa não muda
```

**[Repetir para 4-5 histórias principais — 4 min cada]**

---

### **80:00-85:00 — Registrar Snapshot e Decisões (5 min)**

**Facilitador:**

> "Vou tirar foto do mapa mental atualizado e registrar snapshot."

**[Facilitador tira foto ou exporta versão digital]**

**Facilitador escreve snapshot:**

```markdown
## Snapshot Sprint 2 — 06/01/2026

### Razão
Feedback do protótipo revelou gaps no MVP (editar/deletar tarefas).

### Mudanças
- **Adicionado:** Epic "Gerenciamento Tarefas" (editar, deletar, filtros) — 18 pts
- **Spike:** Notificação push (permissões iOS/Android) — 1 dia
- **Removido:** nada
- **Re-priorizado:** Editar/deletar antes de notificações (bloqueio técnico)

### Backlog Total
- Antes: 87 pts
- Depois: 105 pts (+18 pts)

### Decisão
MVP inclui editar/deletar. Notificações só após spike validar viabilidade.
```

**Facilitador:**

> "Snapshot registrado. Vou compartilhar no Notion/Confluence."

---

### **85:00-90:00 — Fechamento e Próximos Passos (5 min)**

**Facilitador:**

> "Recapitulando:
>
> **Outputs desta sessão:**
> 1. ✅ Mapa mental atualizado (adicionado Epic Gerenciamento)
> 2. ✅ 5 novas histórias criadas (editar, deletar, 2 filtros, spike notificação)
> 3. ✅ Top 5 itens com critérios de aceitação claros
> 4. ✅ Snapshot registrado (backlog 87→105 pts)
>
> **Próximos passos:**
> - PO: priorizar backlog final até amanhã
> - Time: estimar novas histórias no próximo refinamento (quarta-feira)
> - SM: agendar spike de notificação (1 dev, 1 dia)
>
> Dúvidas?"

**[Ajustes finais]**

> "Valeu, pessoal! Sessão fechada."

---

## 📤 Outputs Obrigatórios

- [ ] **Snapshot do mapa mental** (antes/depois — foto ou arquivo)
- [ ] **Backlog atualizado** (5-15 histórias refinadas)
- [ ] **Novas histórias criadas** (com critérios de aceitação)
- [ ] **Lista de spikes/riscos** identificados
- [ ] **Decisões registradas** (snapshot em Markdown)

---

## 📏 Critérios de Sucesso

**Durante a sessão:**
- [ ] Todos participaram (nenhuma pessoa muda durante 90 min)
- [ ] Feedback estruturado (não virou "reclamação genérica")
- [ ] Mapa mental atualizado (visível para todos)
- [ ] Histórias com critérios de aceitação (não vagas)

**Após 1 Sprint:**
- [ ] Histórias refinadas estimadas facilmente (Planning Poker converge rápido)
- [ ] Menos "descobertas críticas" mid-Sprint (< 2 surpresas)
- [ ] PO prioriza com mais confiança (menos "tudo é urgente")

---

## ⚠️ Riscos Comuns e Correções

| Risco | Sintoma | Correção na Hora |
|-------|---------|-----------------|
| **Feedback vago** | "O protótipo é legal" | Facilitador: "Específico: qual tela? Qual ação funcionou?" |
| **Discussão técnica** | Time debate solução no meio | Facilitador: "Ótima discussão, mas vamos focar em O QUÊ fazer, não COMO. Deixamos COMO para Planning." |
| **Tempo estoura** | 90 min vira 2h | Facilitador: timebox rígido — "Vamos fechar os top 3 itens só, resto no próximo refinamento." |
| **PO não presente** | Time não sabe priorizar | SM: "Reagendar. Refinamento SEM PO não funciona." |
| **Mapa mental não atualizado** | Esqueceram de atualizar | Facilitador: mostrar antes/depois — "Veja a diferença, por isso fazemos isso." |

---

## 🗣️ Scripts Prontos

**Se alguém propor feature fora de escopo:**
> "Boa ideia! Vou anotar no backlog como 'Ideias Futuras' (baixa prioridade). Hoje focamos no MVP. Ok?"

**Se discussão virar waterfall (especificação excessiva):**
> "Detalhes técnicos vão para Planning e Sprint Backlog. Aqui definimos O QUÊ e POR QUÊ, não COMO."

**Ao fechar sessão:**
> "Próximo refinamento: [data]. Pauta: estimar novas histórias + revisar top 10. Alguém não pode?"

---

# 🏗️ OFICINA 2 — Construir DoD v1 (45-60 min)

## 🎯 Objetivo

Criar Definition of Done (DoD) versão 1 — checklist mínimo acordado entre time e PO para definir "pronto".

**Quando rodar:** Sprint Zero ou início do Sprint 1 (antes de começar a codar de verdade).

---

## ⏱️ Duração

45-60 minutos

---

## 👥 Participantes

- **Porcos (obrigatório):** Time dev completo + PO + SM
- **Galinhas:** NÃO (decisão interna do time)

---

## 📦 Materiais

- [ ] Quadro com 3 colunas: `Done (Time) | Accepted (PO) | Release Done`
- [ ] Post-its ou Miro/Mural
- [ ] Exemplos de DoD (ver Templates_Operacionais_Cap9-12.md)
- [ ] Timer

---

## 🕐 Agenda Detalhada (60 min)

### **00:00-10:00 — Contexto: Por que DoD Importa (10 min)**

**Script do Facilitador:**

> "Pessoal, vamos criar nossa **Definition of Done** — o acordo de 'quando algo está pronto'.
>
> **Por que isso importa:**
> - Sem DoD: 'pronto' vira subjetivo ('90% pronto', 'quase pronto')
> - Com DoD: acordo explícito → menos retrabalho, menos bugs, velocidade confiável
>
> **3 níveis de 'pronto':**
> 1. **Done (Time):** passou no checklist técnico (testes, review, integrado)
> 2. **Accepted (PO):** atende critérios de aceitação (PO aprovou)
> 3. **Release Done:** conjunto de histórias + estável + deploy produção
>
> Hoje vamos focar em **Done (Time)** e **Accepted (PO)**. Release Done vem depois.
>
> Vamos começar!"

---

### **10:00-25:00 — Brainstorm: O que Precisa Estar Done? (15 min)**

**Facilitador:**

> "Vou fazer uma pergunta: **O que precisa acontecer para você confiar que uma história está 'pronta'?**
>
> Pensem técnico: código, testes, review, ambiente, doc, etc.
>
> Escrevam post-its (5 min — silencioso)."

**[Timer: 5 min — escrita]**

**Facilitador:**

> "Agora cada pessoa cola e lê (sem explicar muito)."

**[5 min — colar e ler]**

**Facilitador agrupa temas:**

> "Vejo temas:
> - Código: lint, padrão, review
> - Testes: unit, integration, manual
> - Ambiente: staging, CI/CD
> - Doc: README atualizado, API doc
> - PO: aprovação, demo funcional"

---

### **25:00-45:00 — Criar Checklist Done v1 (20 min)**

**Facilitador:**

> "Vamos transformar isso em checklist. Eu vou propor itens e vocês dizem SIM (entra no DoD v1) ou NÃO (muito cedo, deixa para depois)."

**Facilitador propõe item por item (vote rápido):**

**Item 1:**

> "Código segue padrão acordado (lint, style guide) — SIM ou NÃO?"

**[Time vota — maioria SIM]**

**Facilitador:** "✅ Entra no DoD v1."

**Item 2:**

> "Code review por pelo menos 1 pessoa — SIM ou NÃO?"

**[Time vota — maioria SIM]**

**Facilitador:** "✅ Entra."

**Item 3:**

> "Cobertura de testes ≥ 80% — SIM ou NÃO?"

**[Time debate: "80% é muito no início"]**

**Facilitador:** "Ok, vamos começar com 70% e evoluir depois? SIM?"

**[Maioria SIM]**

**Facilitador:** "✅ Entra: Cobertura ≥ 70%."

**[Repetir para 8-12 itens — 15 min]**

**Checklist final exemplo:**

```markdown
## Definition of Done v1.0

### Done (Time):
- [ ] Código segue lint/padrão
- [ ] Code review por ≥ 1 pessoa
- [ ] Testes unitários (cobertura ≥ 70%)
- [ ] Testes de integração (cenários críticos)
- [ ] Código em staging (não só dev local)
- [ ] Smoke test manual passou
- [ ] Sem bugs de alta severidade conhecidos

### Accepted (PO):
- [ ] Critérios de aceitação atendidos
- [ ] PO viu demo funcional na Review
- [ ] Sem "pendências escondidas"
```

---

### **45:00-55:00 — Definir Gatilho de Evolução (10 min)**

**Facilitador:**

> "DoD evolui. **Regra de evolução:**
>
> Sempre que PO **rejeita** história na Review:
> 1. Investigar: o que faltou?
> 2. Atualizar DoD: adicionar item que teria prevenido
> 3. Comunicar: time revisa DoD atualizado
>
> Exemplo:
> - Sprint 3: PO rejeita porque 'quebrou integração com API de pagamento'
> - Ação: adicionar ao DoD → 'Testes de integração com APIs externas passam'
>
> Combinado?"

**[Time concorda]**

**Facilitador:**

> "Vou registrar DoD v1.0 no Confluence/Notion. Revisamos a cada 3 Sprints ou quando PO rejeitar."

---

### **55:00-60:00 — Fechamento (5 min)**

**Facilitador:**

> "DoD v1.0 criado!
>
> **Outputs:**
> - Checklist com 7 itens (Done) + 3 itens (Accepted)
> - Gatilho de evolução definido (PO rejeita → atualiza DoD)
>
> **Próximos passos:**
> - SM: colar DoD no board físico / criar checklist no Trello
> - Time: usar DoD a partir do próximo Sprint
> - PO: validar se Accepted está claro
>
> Dúvidas?"

**[Ajustes]**

> "Fechado! DoD ativo a partir de agora."

---

## 📤 Outputs Obrigatórios

- [ ] **DoD v1.0** escrito (checklist Done + Accepted)
- [ ] **Gatilho de evolução** acordado
- [ ] **DoD publicado** (wiki, board, ferramenta)
- [ ] **Time comprometido** (vai usar a partir do próximo Sprint)

---

## 📏 Critérios de Sucesso

**Durante sessão:**
- [ ] Todos participaram (não foi SM sozinho ditando)
- [ ] DoD tem 5-10 itens (não muito curto, não muito longo)
- [ ] Itens são verificáveis (não subjetivos tipo "código bonito")

**Após 2 Sprints:**
- [ ] Time usa DoD (histórias só Done se passar checklist)
- [ ] Taxa de rejeição PO < 10% (DoD está funcionando)
- [ ] DoD evoluiu (pelo menos 1 item adicionado se PO rejeitou)

---

## ⚠️ Riscos e Correções

| Risco | Correção |
|-------|----------|
| ❌ **DoD muito longo (20+ itens)** | "Vamos começar com 7-10. Evoluímos depois." |
| ❌ **DoD vago ("código bom")** | "Como medimos? Precisa ser verificável: lint passa = bom." |
| ❌ **Time não segue DoD** | SM cobra: "História X está Done? Passou no DoD? Mostra checklist." |
| ❌ **PO não entende DoD** | Facilitador explica: "Done = técnico. Accepted = você testa e aprova." |

---

# 🚀 OFICINA 3 — Sprint Zero Backlog (60-90 min)

## 🎯 Objetivo

Criar backlog do Sprint Zero: preparar time, ferramentas, acordos para começar Sprint 1.

**Quando rodar:** Antes do projeto começar (greenfield) ou quando time nunca fez Scrum.

---

## ⏱️ Duração

60-90 minutos

---

## 👥 Participantes

- **Porcos:** PO + SM + time dev + stakeholder chave (empresário/patrocinador)
- **Galinhas:** Outros stakeholders podem assistir

---

## 📦 Materiais

- [ ] Quadro com 6 colunas (Buckets A-F)
- [ ] Post-its
- [ ] Lista de "User Stories por Bucket" (ver Guia Cap. 11)
- [ ] Checklist "Saída do Sprint Zero"

---

## 🕐 Agenda Detalhada (90 min)

### **00:00-15:00 — Contexto e 6 Buckets (15 min)**

**Facilitador:**

> "Sprint Zero = preparação para Sprint 1. Duração: 1-2 semanas (não mais!).
>
> **Objetivo:** sair com backlog inicial + ferramentas + acordos para começar a desenvolver.
>
> **6 Buckets (áreas de preparação):**
> A — Objetivo de Negócio e Governança
> B — Linguagem Comum
> C — Papéis Capacitados
> D — Ferramentas e Ambiente
> E — Acordos Essenciais
> F — Necessidades Específicas do Projeto
>
> Vamos preencher cada bucket com 'User Stories de preparação'."

---

### **15:00-75:00 — Preencher Buckets (60 min = 10 min/bucket)**

**Para cada bucket:**

**Bucket A — Objetivo de Negócio (10 min)**

**Facilitador:**

> "Bucket A: o que o empresário/patrocinador quer?
>
> Exemplos:
> - Meta de produtividade (ex.: 300% em 6 meses)
> - Entregas incrementais (pequenas vitórias)
> - Comunicação periódica (Sprint Reviews)
>
> Alguém adiciona algo específico do nosso projeto?"

**[Time discute e adiciona — facilitador anota]**

**Exemplo:**

```
Sprint Zero Backlog — Bucket A:
- [ ] Meta: reduzir lead time de 12 para 4 semanas em 3 meses
- [ ] Entregas: incremento funcional a cada 2 semanas
- [ ] Reviews: stakeholders participam de Review (sexta 15h)
```

**[Repetir para Buckets B-F — 10 min cada]**

---

### **75:00-85:00 — Checklist de Saída (10 min)**

**Facilitador:**

> "Ao final do Sprint Zero, precisamos ter TUDO isso pronto. Vou ler checklist — vocês dizem se está realista ou falta algo."

**Checklist:**

```markdown
- [ ] Backlog inicial priorizado (top 10-20 histórias estimadas)
- [ ] DoD v1 escrito e acordado
- [ ] Formato de User Story definido
- [ ] Cadência de Sprint definida (ex.: 2 semanas, Daily 10h)
- [ ] Ferramentas prontas (board, Git, staging)
- [ ] Papéis claros (PO, SM, time dev)
- [ ] Time "habilitado" (leu Scrum Guide)
- [ ] Ambiente técnico minimamente funcional
- [ ] Sprint 1 planejado (top 3-5 histórias selecionadas)
```

**Facilitador:**

> "Alguém acha que falta algo? Ou algo é impossível em 1-2 semanas?"

**[Ajustes]**

---

### **85:00-90:00 — Compromisso e Fechamento (5 min)**

**Facilitador:**

> "Sprint Zero: 1 semana (próxima segunda a sexta).
>
> **Saída:** tudo no checklist pronto para começar Sprint 1 na segunda seguinte.
>
> **Review do Sprint Zero:** sexta 15h (demo de preparação)
>
> Quem topa?"

**[Time confirma]**

> "Fechado! Sprint Zero começa segunda."

---

## 📤 Outputs

- [ ] **Sprint Zero Backlog** (6 buckets preenchidos)
- [ ] **Checklist de Saída** acordado
- [ ] **Duração definida** (1-2 semanas)
- [ ] **Review agendada** (demo de preparação)

---

## 📏 Critérios de Sucesso

- [ ] Sprint Zero dura exatamente o combinado (não estende)
- [ ] Checklist de Saída 100% completo
- [ ] Sprint 1 começa imediatamente após Sprint Zero
- [ ] Time sente-se preparado (survey ≥ 4/5)

---

# 📊 OFICINA 4 — Baseline + Scoreboard de Métricas (45-60 min)

## 🎯 Objetivo

Definir baseline (antes de Scrum) + escolher 3-5 métricas + criar scoreboard para acompanhar evolução.

**Quando rodar:** Sprint Zero ou Sprint 1 (antes de começar a medir sério).

---

## ⏱️ Duração

45-60 minutos

---

## 👥 Participantes

- **Porcos:** PO + SM + 1-2 devs seniores
- **Galinhas:** Stakeholder/empresário (para validar métricas escolhidas)

---

## 📦 Materiais

- [ ] Dados históricos (últimos 3-6 meses se possível)
- [ ] Planilha ou Notion para scoreboard
- [ ] Quadro com 3 categorias: `Velocidade | Qualidade | Valor`

---

## 🕐 Agenda Detalhada (60 min)

### **00:00-10:00 — Por que Baseline Importa (10 min)**

**Facilitador:**

> "Vamos definir baseline — como estamos HOJE (antes de Scrum maduro).
>
> **Por que:** sem baseline, não provamos ganho. Stakeholder pergunta: 'Como sei que Scrum vale a pena?'
>
> **O que faremos:**
> 1. Escolher 3-5 métricas (1 velocidade + 1 qualidade + 1-3 valor)
> 2. Coletar dados históricos (baseline)
> 3. Definir meta (onde queremos chegar em 6 meses)
> 4. Criar scoreboard (atualizar a cada Sprint Review)"

---

### **10:00-30:00 — Escolher Métricas (20 min)**

**Facilitador:**

> "Vou sugerir métricas por categoria. Vocês escolhem 1 de cada (ou propõem outra)."

**Categoria 1: Velocidade (throughput)**

| Opção | Como Medir | Quando Usar |
|-------|-----------|-------------|
| **Story Points/Sprint** | Somar pontos Done em cada Review | Sempre (universal) |
| **Lead Time** | Tempo de ideia → produção | Software/produto |
| **Deploy Frequency** | Quantos deploys/mês | DevOps |

**[Time escolhe — maioria: Story Points/Sprint]**

---

**Categoria 2: Qualidade**

| Opção | Como Medir | Quando Usar |
|-------|-----------|-------------|
| **Taxa de Retrabalho** | Histórias refeitas / total Done | Sempre |
| **Bugs/Release** | Bugs encontrados pós-deploy | Software |
| **Taxa de Rejeição PO** | Histórias rejeitadas / Done | Sempre |

**[Time escolhe — maioria: Taxa de Rejeição PO]**

---

**Categoria 3: Valor (negócio)**

| Opção | Como Medir | Quando Usar |
|-------|-----------|-------------|
| **NPS** | Net Promoter Score (survey) | Produto com usuários |
| **Conversão** | % visitantes → clientes | Marketing/vendas |
| **Uso Real** | % features usadas | Produto |
| **ROI** | Receita / Investimento | Negócio |

**[Time escolhe — maioria: NPS + Uso Real]**

---

**Métricas Finais:**
1. Story Points/Sprint
2. Taxa de Rejeição PO
3. NPS
4. % Features Usadas

---

### **30:00-45:00 — Coletar Baseline (15 min)**

**Facilitador:**

> "Agora vamos coletar dados históricos (últimos 3-6 meses) para cada métrica."

**Métrica 1: Story Points/Sprint**

**Facilitador:** "Como não medíamos antes, vamos estimar retrospectivamente. Quantas features entregamos nos últimos 3 meses?"

**Time:** "2 features grandes."

**Facilitador:** "Se estimássemos hoje, quantos pontos dariam?"

**Time:** "~50 pontos cada = 100 pontos em 3 meses."

**Baseline:** 100 pts / 3 meses ≈ **33 pontos/mês** (ou ~17 pontos/Sprint de 2 semanas)

---

**Métrica 2: Taxa de Rejeição PO**

**Facilitador:** "Das 2 features entregues, quantas o PO rejeitou na primeira tentativa?"

**PO:** "1 voltou para ajustes."

**Baseline:** 1/2 = **50% rejeição** (muito alto!)

---

**Métrica 3: NPS**

**Facilitador:** "Temos survey de usuários?"

**PO:** "Não formal, mas feedback indica insatisfação."

**Facilitador:** "Vamos assumir baseline: **NPS 20** (baixo). Faremos survey formal no Sprint 2."

---

**Métrica 4: % Features Usadas**

**PO:** "Temos analytics. Das 10 features do app, usuários usam regularmente só 4."

**Baseline:** 4/10 = **40% uso**

---

### **45:00-55:00 — Definir Metas (10 min)**

**Facilitador:**

> "Baseline coletado. Agora: onde queremos chegar em 6 meses?"

| Métrica | Baseline | Meta (6 meses) | Δ Esperado |
|---------|----------|----------------|------------|
| Story Points/Sprint | 17 | 25 | +47% |
| Taxa Rejeição PO | 50% | < 10% | -80% |
| NPS | 20 | ≥ 40 | +100% |
| % Features Usadas | 40% | ≥ 60% | +50% |

**[Time valida metas — ajusta se necessário]**

---

### **55:00-60:00 — Criar Scoreboard (5 min)**

**Facilitador:**

> "Vou criar scoreboard no Notion/Google Sheets. Atualizamos a cada Sprint Review (5 min)."

**Template:**

```markdown
## Scoreboard — Produtividade UzzAI

| Métrica | Baseline | Meta 6m | Sprint 1 | Sprint 2 | Sprint 3 | ... | Status |
|---------|----------|---------|----------|----------|----------|-----|--------|
| Story Points/Sprint | 17 | 25 | - | - | - | - | 🟡 |
| Taxa Rejeição PO | 50% | <10% | - | - | - | - | 🔴 |
| NPS | 20 | ≥40 | - | - | - | - | 🟡 |
| % Features Usadas | 40% | ≥60% | - | - | - | - | 🟡 |

**Legenda:** 🟢 Meta atingida | 🟡 Melhorando | 🔴 Estagnado/Piorando
```

---

## 📤 Outputs

- [ ] **3-5 métricas escolhidas**
- [ ] **Baseline coletado** (dados históricos)
- [ ] **Metas definidas** (6 meses)
- [ ] **Scoreboard criado** (planilha/Notion)
- [ ] **Processo de atualização** (quem atualiza, quando)

---

## 📏 Critérios de Sucesso

- [ ] Baseline baseado em dados reais (não "achismo")
- [ ] Metas realistas (não impossíveis, não fáceis demais)
- [ ] Scoreboard atualizado a cada Sprint Review
- [ ] Time e stakeholder entendem métricas (não jargão técnico)

---

**Próximos passos:**
1. Ver `Templates_Operacionais_Cap9-12.md` para templates copiáveis
2. Ver `Mermaids_Scrum_Cap9-12.md` para diagramas visuais

---

*Playbooks criados para UzzAI — Oficinas operacionais baseadas em práticas de Scrum.*
