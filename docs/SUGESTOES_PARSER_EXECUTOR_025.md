# Sugestões de Alteração — parser.ts e phase1-executor.ts
## Referente à Migration 025 (Client Enrichment)

> Este documento descreve **exatamente** o que deve ser alterado em cada arquivo
> para suportar os novos campos adicionados pela migration 025.

---

## 1. `src/lib/md-feeder/parser.ts`

### 1.1 Novos Sets de valores válidos

Adicionar após a linha `const CLIENT_STATUS_VALUES` (linha ~84):

```typescript
const LEAD_SOURCE_VALUES = new Set([
  'indicacao', 'linkedin', 'evento', 'cold-outreach', 'inbound', 'parceiro', 'outro',
]);
const ICP_CLASSIFICATION_VALUES = new Set(['hot', 'warm', 'cold', 'future']);
const DEAL_OUTCOME_VALUES = new Set(['open', 'won', 'lost', 'stand_by']);
```

### 1.2 Validação do bloco `uzzapp_client`

Dentro do bloco `if (type === 'uzzapp_client')` (linha ~781), adicionar as validações
antes da checagem de duplicidade:

```typescript
const leadSource = asString(raw.lead_source);
const icpClassification = asString(raw.icp_classification);
const leadDailyVolume = raw.lead_daily_volume == null
  ? null
  : Number(raw.lead_daily_volume);

if (leadSource && !LEAD_SOURCE_VALUES.has(leadSource)) {
  errors.push('lead_source invalido para uzzapp_client (use: indicacao|linkedin|evento|cold-outreach|inbound|parceiro|outro).');
}
if (icpClassification && !ICP_CLASSIFICATION_VALUES.has(icpClassification)) {
  errors.push('icp_classification invalido para uzzapp_client (use: hot|warm|cold|future).');
}
if (leadDailyVolume !== null && (!Number.isInteger(leadDailyVolume) || leadDailyVolume < 0)) {
  errors.push('lead_daily_volume deve ser inteiro >= 0.');
}
```

### 1.3 Validação do bloco `contato_cliente`

Dentro do bloco `if (type === 'contato_cliente')` (linha ~809), adicionar:

```typescript
const dealOutcome = asString(raw.deal_outcome);

if (dealOutcome && !DEAL_OUTCOME_VALUES.has(dealOutcome)) {
  errors.push('deal_outcome invalido para contato_cliente (use: open|won|lost|stand_by).');
}
// participants_uzzai e participants_client são arrays livres — sem validação rígida
// insights_json é JSON string — parseado no executor, sem validação aqui
```

---

## 2. `src/lib/md-feeder/phase1-executor.ts`

### 2.1 Função `createUzzappClient` — novos campos no payload

Dentro da função `createUzzappClient` (~linha 192), adicionar ao objeto `payload`:

```typescript
lead_source: asString(raw.lead_source) || null,
icp_classification: asString(raw.icp_classification) || null,
business_context: asString(raw.business_context) || null,
lead_daily_volume: raw.lead_daily_volume == null ? null : Number(raw.lead_daily_volume),
stakeholders_json: asJsonArray(raw.stakeholders_json) ?? [],
bant_snapshot: asJsonObject(raw.bant_snapshot) ?? {},
fit_snapshot: asJsonObject(raw.fit_snapshot) ?? {},
last_contact_date: asString(raw.last_contact_date) || null,
```

### 2.2 Função `upsertUzzappClientExtras` — patch com novos campos

Dentro de `upsertUzzappClientExtras` (~linha 1008), adicionar ao bloco `patch`:

```typescript
if (asString(raw.lead_source)) patch.lead_source = asString(raw.lead_source);
if (asString(raw.icp_classification)) patch.icp_classification = asString(raw.icp_classification);
if (asString(raw.business_context)) patch.business_context = asString(raw.business_context);
if (raw.lead_daily_volume != null) patch.lead_daily_volume = Number(raw.lead_daily_volume);
if (asJsonArray(raw.stakeholders_json)) patch.stakeholders_json = asJsonArray(raw.stakeholders_json);
if (raw.last_contact_date) patch.last_contact_date = asString(raw.last_contact_date);
```

### 2.3 Função `createClientContact` — novos campos no payload

Dentro de `createClientContact` (~linha 1161), adicionar ao objeto `payload`:

```typescript
insights_json: [] as unknown[],         // preenchido abaixo
participants_json: {} as Record<string, unknown>,  // preenchido abaixo
deal_outcome: null as string | null,    // preenchido abaixo
interaction_sequence: null as number | null,  // preenchido abaixo
```

Após montar o `dashboardExec` e antes da chamada de insert, adicionar:

```typescript
// insights_json
const insights = asJsonArray(raw.insights_json) ?? [];

// participants_json
const participantsUzzai = asStringArray(raw.participants_uzzai);
const participantsClient = asStringArray(raw.participants_client);
const participantsJson =
  participantsUzzai.length > 0 || participantsClient.length > 0
    ? { uzzai: participantsUzzai, client: participantsClient }
    : {};

// deal_outcome (desnormalizado a partir de status_negociacao)
const negotiationForOutcome = asString(raw.status_negociacao);
let dealOutcomeValue: string | null = null;
if (asString(raw.deal_outcome)) {
  dealOutcomeValue = asString(raw.deal_outcome);
} else if (negotiationForOutcome === 'Fechado') {
  dealOutcomeValue = 'won';
} else if (negotiationForOutcome === 'Perdido' || negotiationForOutcome === 'Cancelado') {
  dealOutcomeValue = 'lost';
} else if (negotiationForOutcome === 'Stand-by') {
  dealOutcomeValue = 'stand_by';
} else {
  dealOutcomeValue = 'open';
}

// interaction_sequence
const { count: interactionCount } = await supabase
  .from('client_contacts')
  .select('id', { count: 'exact', head: true })
  .eq('client_id', clientId);
const interactionSequence = (interactionCount ?? 0) + 1;

// Adicionar ao payload:
payload.insights_json = insights;
payload.participants_json = participantsJson;
payload.deal_outcome = dealOutcomeValue;
payload.interaction_sequence = interactionSequence;
```

> **Nota:** o campo `clientId` já está disponível nesse ponto da função
> (logo após a resolução/criação do cliente base).

### 2.4 Nova função `syncContactToClient` + chamada após insert

Adicionar a função antes de `createClientContact` (ou após):

```typescript
async function syncContactToClient(
  supabase: SupabaseClient,
  clientId: string,
  contact: {
    estagio_funil?: string | null;
    status_negociacao?: string | null;
    probabilidade_fechamento?: number | null;
    sentimento_geral?: string | null;
    data_contato: string;
    data_proxima_interacao?: string | null;
    prazo_proxima_acao?: string | null;
    bantScores: Record<string, unknown>;
    fitScores: Record<string, unknown>;
  }
): Promise<void> {
  const patch: Record<string, unknown> = {
    last_contact_date: contact.data_contato,
  };

  if (contact.estagio_funil) patch.funnel_stage = contact.estagio_funil;
  if (contact.status_negociacao) patch.negotiation_status = contact.status_negociacao;
  if (contact.probabilidade_fechamento != null) {
    patch.closing_probability = contact.probabilidade_fechamento;
  }
  if (contact.sentimento_geral) patch.general_sentiment = contact.sentimento_geral;
  if (contact.data_proxima_interacao) {
    patch.next_interaction_date = contact.data_proxima_interacao;
  }
  if (contact.prazo_proxima_acao) {
    patch.next_action_deadline = contact.prazo_proxima_acao;
  }
  if (Object.keys(contact.bantScores).length > 0) {
    patch.bant_snapshot = {
      ...contact.bantScores,
      updated_at: contact.data_contato,
    };
  }
  if (Object.keys(contact.fitScores).length > 0) {
    patch.fit_snapshot = {
      ...contact.fitScores,
      updated_at: contact.data_contato,
    };
  }

  // Silent — não lança exceção se falhar
  await supabase.from('uzzapp_clients').update(patch).eq('id', clientId);
}
```

Chamar ao final de `createClientContact`, logo antes do `return`, após o insert com sucesso:

```typescript
// Sync automático: atualiza o card do cliente com os dados mais recentes do contato
await syncContactToClient(supabase, clientId, {
  estagio_funil: asString(raw.estagio_funil) || null,
  status_negociacao: asString(raw.status_negociacao) || null,
  probabilidade_fechamento: typeof probabilidade === 'number' && Number.isFinite(probabilidade)
    ? probabilidade : null,
  sentimento_geral: asString(raw.sentimento_geral) || null,
  data_contato: asString(raw.data_contato),
  data_proxima_interacao: asString(raw.data_proxima_interacao) || null,
  prazo_proxima_acao: asString(raw.prazo_proxima_acao) || null,
  bantScores: bantScores,
  fitScores: fitScores,
});
```

---

## 3. Resumo das alterações

| Arquivo | Seção | Tipo de mudança |
|---|---|---|
| `parser.ts` | ~linha 84 | Adicionar 3 novos Sets |
| `parser.ts` | bloco `uzzapp_client` | Adicionar 3 validações |
| `parser.ts` | bloco `contato_cliente` | Adicionar 1 validação |
| `phase1-executor.ts` | `createUzzappClient` payload | Adicionar 8 campos |
| `phase1-executor.ts` | `upsertUzzappClientExtras` patch | Adicionar 6 campos |
| `phase1-executor.ts` | `createClientContact` payload | Adicionar 4 campos + lógica |
| `phase1-executor.ts` | nova função | `syncContactToClient` |
| `phase1-executor.ts` | `createClientContact` final | Chamada ao `syncContactToClient` |

---

## 4. Campos do template_cliente_v1.md que requerem suporte no executor

| Campo no template | Bloco | Campo DB alvo | Já suportado? |
|---|---|---|---|
| `lead_source` | `uzzapp_client` | `uzzapp_clients.lead_source` | **Não** (novo) |
| `icp_classification` | `uzzapp_client` | `uzzapp_clients.icp_classification` | **Não** (novo) |
| `business_context` | `uzzapp_client` | `uzzapp_clients.business_context` | **Não** (novo) |
| `lead_daily_volume` | `uzzapp_client` | `uzzapp_clients.lead_daily_volume` | **Não** (novo) |
| `stakeholders_json` | `uzzapp_client` | `uzzapp_clients.stakeholders_json` | **Não** (novo) |
| `participants_uzzai` | `contato_cliente` | `client_contacts.participants_json.uzzai` | **Não** (novo) |
| `participants_client` | `contato_cliente` | `client_contacts.participants_json.client` | **Não** (novo) |
| `insights_json` | `contato_cliente` | `client_contacts.insights_json` | **Não** (novo) |
| `deal_outcome` | `contato_cliente` | `client_contacts.deal_outcome` | **Não** (novo, derivado) |
