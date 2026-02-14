---
template: uzzops-feeder
template_version: "1.1"
project: "UZZAPP"
date: "2026-02-14"
author: "Seu Nome"
source: "template-master-clientes"
---

# =============================================================
# TEMPLATE MASTER — INGESTION DE CLIENTES / LEADS
# =============================================================
# INSTRUCOES:
#  - Preencha os campos marcados com [OBRIGATORIO]
#  - Campos opcionais: apague a linha se nao tiver o dado
#  - Comentarios (linhas com #) sao ignorados pelo feeder
#  - Valores de listas (arrays) usam recuo com "  - valor"
#  - JSON: use aspas simples envolvendo o JSON entre apostrofos
#  - Blocos de texto livre: use "|" apos o campo e recuo de 2 espacos
#  - Use um arquivo por conjunto cliente+contato OU so o cliente
#    OU so o contato (se cliente ja existe no banco)
# =============================================================


## uzzapp_client
# =============================================================
# BLOCO: CADASTRO DO CLIENTE / LEAD
# Execute este bloco para criar ou atualizar o card do cliente.
# Se o cliente ja existe (por email ou phone), o feeder atualiza
# os dados (action: add_observation / upsert).
# =============================================================

# -------------------------------------------------------------
# 1. IDENTIFICACAO DA EMPRESA [OBRIGATORIO: name]
# -------------------------------------------------------------
name: Nome Completo do Cliente ou Empresa
# Razao social (CNPJ / contratos)
legal_name: Razao Social Ltda
cnpj: 00.000.000/0001-00
# Nome fantasia / apelido
company: Nome Fantasia
# Segmento de mercado (texto livre: Imobiliario, SaaS, Varejo, etc.)
segment: Imobiliario
# Tamanho: micro | pequena | media | grande
company_size: media
city: Caxias do Sul
state: RS
# Endereco completo (opcional, para visitas/propostas formais)
address_full: Rua das Imobiliarias, 123, Caxias do Sul - RS
website: empresa.com.br

# -------------------------------------------------------------
# 2. CONTATOS DA EMPRESA
# -------------------------------------------------------------
phone: 5554999000001
email: contato@empresa.com.br
whatsapp_business: 5554999000001
# Contato principal (nome da pessoa que voce fala)
main_contact_name: Fulano de Tal
# Cargo do contato principal
main_contact_role: Socio/Diretor

# -------------------------------------------------------------
# 3. QUALIFICACAO DO LEAD
# -------------------------------------------------------------
# Origem: indicacao | linkedin | evento | cold-outreach | inbound | parceiro | outro
lead_source: indicacao
# Classificacao ICP: hot | warm | cold | future
icp_classification: warm
# Status do cadastro: active | trial | paused | churned
status: trial
# Estagio no funil:
#   lead-novo | qualificado | proposta | negociacao |
#   fechado | onboarding | cliente-ativo | stand-by | perdido
estagio_funil: qualificado
# Status da negociacao: Em Andamento | Stand-by | Fechado | Perdido | Cancelado
status_negociacao: Em Andamento
# Probabilidade de fechamento (0 a 100, sem %)
probabilidade_fechamento: 60
# Prioridade: critica | alta | media | baixa
prioridade: alta
# Volume aproximado de leads por dia (qualificador de ROI)
lead_daily_volume: 15

# -------------------------------------------------------------
# 4. OPORTUNIDADE COMERCIAL
# -------------------------------------------------------------
# Plano de interesse: starter | pro | enterprise | custom
plan: pro
# Produto: CHATBOT | SITE-BUILDER | UzzBIM | NutriTrain | OUTRO
produto: CHATBOT
projeto: UZZAPP
# Valores (aceita formato R$ 1.200,00 ou numerico 1200)
valor_potencial: 15000
valor_mensalidade: 1200
valor_setup: 3000

# -------------------------------------------------------------
# 5. TIMING E RESPONSAVEIS
# -------------------------------------------------------------
# Data de onboarding (se ja cliente): YYYY-MM-DD
onboarded_at: 2026-02-14
# Proximo contato planejado: YYYY-MM-DD
data_proxima_interacao: 2026-02-21
# Prazo para proxima acao interna: YYYY-MM-DD
prazo_proxima_acao: 2026-02-18
# Canal preferido: presencial | videochamada | telefone | whatsapp | email
canal: videochamada
# Sentimento geral atual: Positivo | Neutro | Negativo
sentimento_geral: Positivo

# -------------------------------------------------------------
# 6. INTELIGENCIA DE NEGOCIO
# -------------------------------------------------------------
# Contexto narrativo do negocio (bloco de texto livre com |)
business_context: |
  Descreva aqui a situacao atual do cliente: modelo de negocio,
  desafios principais, sistemas que usam hoje, como funciona
  o atendimento deles, qual o volume operacional, etc.
  Exemplo: "Imobiliaria de medio porte com foco em alto padrao.
  Volume baixo de leads (2/dia). Usa WhatsApp Business + site
  proprio com chatbot legado. Planeja expandir para Locacao em 2027."

# Mapa de stakeholders (JSON array)
# Campos: name, role, decision_power (alta|media|baixa),
#         influence (alta|media|baixa), notes
stakeholders_json: '[{"name":"Fulano de Tal","role":"Socio/Diretor","decision_power":"alta","influence":"alta","notes":"Decisor direto. Faz atendimento pessoal."},{"name":"Ciclana","role":"Gerente Comercial","decision_power":"media","influence":"alta","notes":"Influencia a decisao. Usa o sistema no dia a dia."}]'

# -------------------------------------------------------------
# 7. TAGS E NOTAS
# -------------------------------------------------------------
tags:
  - lead
  - imobiliaria
  - alto-padrao
# Notas livres sobre o cliente (nao estruturadas)
observation: Indicado por Pedro Vitor. Tem urgencia para Q1/2026.


## contato_cliente
# =============================================================
# BLOCO: REGISTRO DE CONTATO / ATA DE INTERACAO
# Execute este bloco para registrar uma interacao com o cliente.
# O feeder cria o registro em client_contacts e atualiza
# automaticamente o card do cliente (funnel, probability, scores).
# =============================================================

# -------------------------------------------------------------
# 1. CABECALHO [OBRIGATORIO: cliente, subtipo, data_contato]
# -------------------------------------------------------------
# Nome do cliente (deve corresponder ao cadastro)
cliente: Nome Completo do Cliente ou Empresa
# Subtipo: demo | setup | negociacao | follow-up | suporte | feedback
subtipo: demo
# Status: rascunho | realizado | agendado | cancelado
status: realizado
# Data do contato: YYYY-MM-DD
data_contato: 2026-02-14
# Titulo descritivo (aparece nos listagens)
title: Demo inicial — apresentacao do produto

# -------------------------------------------------------------
# 2. PARTICIPANTES
# -------------------------------------------------------------
# Contato principal do cliente nesta reuniao
contato_principal: Fulano de Tal
empresa: Nome Fantasia
# Equipe UzzAI presente (lista)
participants_uzzai:
  - Pedro Vitor Pagliarin
  - Luis Fernando Boff
# Equipe do cliente presente (lista)
participants_client:
  - Fulano de Tal
  - Ciclana (Gerente)

# -------------------------------------------------------------
# 3. TIMING DA REUNIAO
# -------------------------------------------------------------
hora_inicio: 14:00
hora_fim: 15:30
# Duracao: use "1h30m" ou "90m" ou numero de minutos (90)
duracao: 1h30m
# Proximo contato planejado a partir desta interacao
data_proxima_interacao: 2026-02-21
prazo_proxima_acao: 2026-02-18

# -------------------------------------------------------------
# 4. RESPONSAVEIS (nome do membro da equipe)
# -------------------------------------------------------------
responsavel_vendas: Pedro Vitor Pagliarin
responsavel_followup: Pedro Vitor Pagliarin
responsavel_tecnico: Luis Fernando Boff

# -------------------------------------------------------------
# 5. CONTEXTO COMERCIAL
# -------------------------------------------------------------
produto: CHATBOT
projeto: UZZAPP
# Canal: presencial | videochamada | telefone | whatsapp | email
canal: videochamada
# Estagio no funil apos este contato
estagio_funil: qualificado
# Status da negociacao apos este contato
status_negociacao: Em Andamento
# Probabilidade de fechamento apos este contato (0-100)
probabilidade_fechamento: 65
# Prioridade: critica | alta | media | baixa
prioridade: alta
# Sentimento captado nesta interacao: Positivo | Neutro | Negativo
sentimento_geral: Positivo

# -------------------------------------------------------------
# 6. VALORES COMERCIAIS
# -------------------------------------------------------------
# (preencha os valores discutidos ou confirmados nesta interacao)
valor_potencial: 15000
valor_mensalidade: 1200
valor_setup: 3000

# -------------------------------------------------------------
# 7. DASHBOARD EXECUTIVO
# -------------------------------------------------------------
# Motivo do desfecho (won/lost/stand-by): texto livre
deal_outcome_reason: Cliente demonstrou interesse imediato. Aguarda proposta formal.
# Resumo da decisao tomada nesta reuniao
decision_summary: Cliente validou o produto. Proximo passo e enviar proposta customizada.
# Estrategia para proximo contato
next_strategy: Enviar proposta com caso real do segmento. Agendar follow-up em 7 dias.
# Justificativa para a probabilidade informada
probability_justification: Budget confirmado, autoridade validada, necessidade clara. Timing positivo.
# Concorrente mapeado (se houver)
competitor: Nenhum mapeado

# -------------------------------------------------------------
# 8. SCORES BANT (Budget / Authority / Need / Timeline)
# Escala 1-5 para cada criterio. Total maximo: 20.
# -------------------------------------------------------------
# Opcao A: JSON completo (recomendado — mais preciso)
bant_scores_json: '{"budget":4,"authority":5,"need":4,"timeline":3,"total":16}'
# Opcao B: campos individuais (use se nao quiser JSON)
# budget_score: 4
# authority_score: 5
# need_score: 4
# timeline_score: 3

# -------------------------------------------------------------
# 9. SCORES FIT DO CLIENTE
# Escala 1-5 para cada dimensao. Total maximo: 25.
# -------------------------------------------------------------
# Opcao A: JSON completo (recomendado)
fit_scores_json: '{"produto":4,"mercado":5,"financeiro":4,"cultural":4,"tecnico":3,"total":20}'
# Opcao B: campos individuais
# fit_produto_score: 4
# fit_mercado_score: 5
# fit_financeiro_score: 4
# fit_cultural_score: 4
# fit_tecnico_score: 3

# -------------------------------------------------------------
# 10. INSIGHTS E APRENDIZADOS (novos em v1.1)
# JSON array de objetos:
# tipo: critico | vendas | produto | processo
# titulo: resumo em 1 frase
# descricao: o que aconteceu / o que aprendemos
# aplicabilidade: como aplicar em outros deals
# -------------------------------------------------------------
insights_json: '[{"tipo":"vendas","titulo":"Cliente nao perguntou preco = avaliando valor","descricao":"Foco total em entender se o produto resolve as dores. Preco nao foi mencionado em 90 minutos.","aplicabilidade":"Nao iniciar conversa de preco. Deixar cliente puxar o tema apos ver valor."},{"tipo":"produto","titulo":"Integracao com CRM existente e bloqueio critico","descricao":"Cliente usa sistema X e precisa que o chatbot leia o historico. Sem integracao, deal nao fecha.","aplicabilidade":"Sempre perguntar sobre CRM na discovery. Preparar roteiro de integracao."}]'

# -------------------------------------------------------------
# 11. DORES IDENTIFICADAS
# JSON array — use texto simples OU objeto estruturado
# Opcao A: array simples de strings (mais rapido)
# Opcao B: objetos estruturados (recomendado — mais completo)
# Campos do objeto: dor, urgencia (alta|media|baixa), descricao, citacao (opcional)
# -------------------------------------------------------------
# Exemplo simples:
# dores_json: '["Atendimento fora do horario comercial sem resposta","Corretores perdem tempo com perguntas repetitivas"]'
# Exemplo estruturado (recomendado):
dores_json: '[{"dor":"Filtros do site limitados e bugados","urgencia":"media","descricao":"Clientes nao conseguem busca por criterios especificos (ex: frente norte, salao de festa). Sistema atual nao atende.","citacao":"Porque eu sei que tem os filtros nos sites, mas as vezes o filtro nao... ou o filtro fica bugado — Cliente"},{"dor":"Leads chegam fora do horario comercial sem atendimento","urgencia":"baixa","descricao":"Volume baixo (1-2/dia) torna impacto pequeno. Mas existe a dor latente reconhecida pelo cliente."}]'

# -------------------------------------------------------------
# 12. OBJECOES E TRATAMENTO
# JSON array de objetos: codigo (opcional), objecao, tipo, status, tratamento
# Campos: codigo (ex: "O-001", "O-002" — opcional mas recomendado),
#         objecao (texto da objecao), tipo (Financeiro|Produto|Timing|etc),
#         status (Resolvida|Parcialmente Resolvida|Nao Resolvida),
#         tratamento (como foi tratada ou sera tratada)
# -------------------------------------------------------------
objecoes_json: '[{"codigo":"O-001","objecao":"Preco acima do esperado","tipo":"Financeiro","status":"Parcialmente Resolvida","tratamento":"Apresentado ROI em 3 meses. Cliente solicitou simulacao personalizada."},{"codigo":"O-002","objecao":"Equipe nao esta pronta para mudar processo","tipo":"Interno","status":"Nao Resolvida","tratamento":"Proposto onboarding gradual por departamento."}]'

# -------------------------------------------------------------
# 13. PROXIMOS PASSOS
# JSON array de objetos: acao, responsavel, prazo, canal, criterio
# -------------------------------------------------------------
proximos_passos_json: '[{"acao":"Enviar proposta comercial customizada","responsavel":"Pedro Vitor Pagliarin","prazo":"2026-02-18","canal":"email","criterio":"Proposta enviada e confirmada por WhatsApp"},{"acao":"Agendar reuniao de follow-up","responsavel":"Pedro Vitor Pagliarin","prazo":"2026-02-21","canal":"videochamada","criterio":"Reuniao agendada no calendario"}]'

# -------------------------------------------------------------
# 14. RISCOS E BLOQUEIOS
# JSON array de objetos ou strings simples
# -------------------------------------------------------------
riscos_json: '[{"risco":"Decisor pode se ausentar no periodo de fechamento (ferias em marco)","impacto":"Atraso de 30 dias no fechamento","mitigacao":"Acelerar proposta para fechamento antes de 01/03"},{"risco":"Budget pode ser cortado no planejamento Q1","impacto":"Deal cancelado","mitigacao":"Garantir aprovacao do budget com evidencia de ROI antes do fechamento"}]'

# -------------------------------------------------------------
# 15. CHECKLIST DE QUALIDADE
# JSON array de objetos: item (texto), done (true|false)
# -------------------------------------------------------------
quality_checklist: '[{"item":"Data e hora da interacao registrada","done":true},{"item":"Sentimento atualizado","done":true},{"item":"Status da negociacao atualizado","done":true},{"item":"Proxima acao definida com prazo e responsavel","done":true},{"item":"Dores identificadas documentadas","done":true},{"item":"Objecoes levantadas e tratadas","done":true},{"item":"Score BANT atualizado","done":true},{"item":"Valor potencial do deal atualizado","done":true},{"item":"Probabilidade de fechamento revisada","done":true},{"item":"Insights e aprendizados registrados","done":true},{"item":"Participantes registrados","done":true},{"item":"Concorrentes mapeados","done":false}]'

# -------------------------------------------------------------
# 16. TAGS DO CONTATO
# -------------------------------------------------------------
tags:
  - demo
  - interesse-alto
  - proposta-pendente

# -------------------------------------------------------------
# 17. ATA COMPLETA EM MARKDOWN (bloco de texto livre)
# Use "|" e recuo de 2 espacos para texto multilinhas.
# Este campo e o registro narrativo completo da reuniao.
# Pode incluir tabelas, listas e qualquer markdown.
# O feeder extrai automaticamente dores/objecoes/proximos-passos
# caso os campos JSON acima estejam vazios.
# -------------------------------------------------------------
summary_md: |
  # ATA DE CONTATO — Nome do Cliente (Data)

  **Data:** 2026-02-14 | **Canal:** Videochamada | **Duracao:** 1h30m
  **Tipo:** Demo inicial

  ## Resumo
  Breve descricao do que aconteceu e o tom geral da reuniao.

  ## Pontos Chave
  - Ponto 1 relevante
  - Ponto 2 relevante
  - Ponto 3 relevante

  ## DORES IDENTIFICADAS
  - Dor principal identificada durante a conversa
  - Dor secundaria mencionada

  ## OBJECOES IDENTIFICADAS E TRATAMENTO
  - Objecao levantada e como foi tratada

  ## FOLLOW-UPS E PROXIMOS PASSOS
  - Acao 1 com responsavel e prazo
  - Acao 2 com responsavel e prazo

  ## CHECKLIST DE QUALIDADE
  - [x] Item concluido
  - [ ] Item pendente
