export type MdFeederSupportedType =
  | 'feature'
  | 'epic'
  | 'spike'
  | 'spike_result'
  | 'bug'
  | 'bug_resolution'
  | 'sprint'
  | 'sprint_update'
  | 'task'
  | 'user_story'
  | 'daily'
  | 'daily_member'
  | 'feature_dependency'
  | 'risk'
  | 'retrospective'
  | 'planning_result'
  | 'baseline_metric'
  | 'marketing_campaign'
  | 'marketing_post'
  | 'team_member'
  | 'uzzapp_client'
  | 'contato_cliente';

export interface MdFeederFrontmatter {
  template?: string;
  version?: string;
  project?: string;
  sprint?: string;
  date?: string;
  author?: string;
  source?: string;
  [key: string]: unknown;
}

export interface MdFeederParsedItem {
  itemIndex: number;
  itemType: string;
  rawData: Record<string, unknown>;
}

export interface MdFeederParseResult {
  frontmatter: MdFeederFrontmatter;
  items: MdFeederParsedItem[];
  errors: string[];
}

export type MdFeederValidationContext = {
  existingByCode: Map<string, { id: string; status?: string | null }>;
  existingRisksByPublicId?: Set<string>;
  existingCampaignsByName?: Set<string>;
  existingSprintsByCode?: Set<string>;
  incomingSprintsByCode?: Set<string>;
  existingTeamMemberEmails?: Set<string>;
  existingTeamMemberNames?: Set<string>;
  existingClientEmails?: Set<string>;
  existingClientPhones?: Set<string>;
};

const STATUS_VALUES = new Set([
  'backlog',
  'todo',
  'in_progress',
  'review',
  'testing',
  'done',
  'blocked',
]);

const PRIORITY_VALUES = new Set(['P0', 'P1', 'P2', 'P3']);
const VERSION_VALUES = new Set(['MVP', 'V1', 'V2', 'V3', 'V4']);
const RISK_STATUS_VALUES = new Set(['identified', 'analyzing', 'mitigated', 'accepted', 'resolved']);
const RETRO_CATEGORY_VALUES = new Set(['worked_well', 'needs_improvement', 'experiment']);
const RETRO_STATUS_VALUES = new Set(['pending', 'in_progress', 'done', 'abandoned']);
const BASELINE_CATEGORY_VALUES = new Set(['velocity', 'quality', 'process', 'business']);
const MARKETING_CAMPAIGN_STATUS = new Set(['active', 'draft', 'completed', 'archived']);
const MARKETING_CONTENT_TYPES = new Set(['reels', 'feed', 'carrossel', 'stories', 'artigo', 'video']);
const MARKETING_PUBLICATION_STATUS = new Set(['idea', 'draft', 'scheduled', 'published', 'cancelled']);
const MARKETING_CHANNELS = new Set(['instagram', 'linkedin', 'site', 'tiktok', 'youtube', 'whatsapp']);
const SPRINT_STATUS_VALUES = new Set(['planned', 'active', 'completed', 'cancelled']);
const TASK_STATUS_VALUES = new Set(['todo', 'in_progress', 'done']);
const DEPENDENCY_TYPE_VALUES = new Set(['blocks', 'relates_to', 'duplicates']);
const TEAM_MEMBER_ROLES = new Set(['developer', 'designer', 'qa', 'product', 'devops', 'analyst', 'manager']);
const CLIENT_STATUS_VALUES = new Set(['active', 'trial', 'churned', 'paused']);
const CLIENT_PLAN_VALUES = new Set(['starter', 'pro', 'enterprise', 'custom']);
const LEAD_SOURCE_VALUES = new Set([
  'indicacao', 'linkedin', 'evento', 'cold-outreach', 'inbound', 'parceiro', 'outro',
]);
const ICP_CLASSIFICATION_VALUES = new Set(['hot', 'warm', 'cold', 'future']);
const CONTACT_SUBTYPE_VALUES = new Set(['demo', 'setup', 'negociacao', 'follow-up', 'suporte', 'feedback']);
const CONTACT_STATUS_VALUES = new Set(['rascunho', 'realizado', 'agendado', 'cancelado']);
const DEAL_OUTCOME_VALUES = new Set(['open', 'won', 'lost', 'stand_by']);
const FUNNEL_STAGE_VALUES = new Set([
  'lead-novo', 'qualificado', 'proposta', 'negociacao',
  'fechado', 'onboarding', 'cliente-ativo', 'stand-by', 'perdido',
]);
const NEGOTIATION_STATUS_VALUES = new Set(['Em Andamento', 'Stand-by', 'Fechado', 'Perdido', 'Cancelado']);
const CONTACT_PRIORITY_VALUES = new Set(['critica', 'alta', 'media', 'baixa']);
const PRODUCT_VALUES = new Set(['CHATBOT', 'SITE-BUILDER', 'UzzBIM', 'NutriTrain', 'OUTRO']);
const CHANNEL_VALUES = new Set(['presencial', 'videochamada', 'telefone', 'whatsapp', 'email']);
const SENTIMENT_VALUES = new Set(['Positivo', 'Neutro', 'Negativo']);

function parseScalar(value: string): unknown {
  const v = value.trim();
  if (v === '') return '';
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (/^-?\d+$/.test(v)) return Number.parseInt(v, 10);
  if (/^-?\d+\.\d+$/.test(v)) return Number.parseFloat(v);
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    return v.slice(1, -1);
  }
  return v;
}

function parseYamlLikeBlock(input: string): Record<string, unknown> {
  const lines = input.replace(/\r\n/g, '\n').split('\n');
  const out: Record<string, unknown> = {};

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) {
      i += 1;
      continue;
    }

    const keyMatch = /^([a-zA-Z0-9_-]+):\s*(.*)$/.exec(line);
    if (!keyMatch) {
      i += 1;
      continue;
    }

    const key = keyMatch[1];
    const rawValue = keyMatch[2];

    if (rawValue === '|') {
      i += 1;
      const chunks: string[] = [];
      while (i < lines.length) {
        const next = lines[i];
        if (/^[a-zA-Z0-9_-]+:\s*/.test(next)) break;
        if (next.startsWith('  ') || next.startsWith('\t') || next.trim() === '') {
          chunks.push(next.replace(/^(  |\t)/, ''));
          i += 1;
          continue;
        }
        break;
      }
      out[key] = chunks.join('\n').trim();
      continue;
    }

    if (rawValue === '') {
      const listValues: string[] = [];
      let j = i + 1;
      while (j < lines.length) {
        const maybe = lines[j];
        const itemMatch = /^\s*-\s+(.+)$/.exec(maybe);
        if (!itemMatch) break;
        listValues.push(String(parseScalar(itemMatch[1])));
        j += 1;
      }
      if (listValues.length > 0) {
        out[key] = listValues;
        i = j;
        continue;
      }
      out[key] = null;
      i += 1;
      continue;
    }

    out[key] = parseScalar(rawValue);
    i += 1;
  }

  return out;
}

export function parseMdFeederDocument(content: string): MdFeederParseResult {
  const errors: string[] = [];
  let normalized = content.replace(/\r\n/g, '\n');

  // Remove UTF-8 BOM when present.
  normalized = normalized.replace(/^\uFEFF/, '');

  // Tolerates pasted markdown wrapped in fenced blocks:
  // ```md ... ```
  normalized = normalized
    .replace(/^\s*```(?:md|markdown|txt)?\s*\n/i, '')
    .replace(/\n\s*```\s*$/i, '\n');

  let frontmatter: MdFeederFrontmatter = {};
  let body = normalized;

  // Accepts frontmatter with optional indentation/spaces around ---.
  const fmMatch = /^\s*---\s*\n([\s\S]*?)\n\s*---\s*\n?/.exec(normalized);
  if (fmMatch) {
    frontmatter = parseYamlLikeBlock(fmMatch[1]) as MdFeederFrontmatter;
    body = normalized.slice(fmMatch[0].length);
  } else {
    // Fallback: accepts files where frontmatter-like key/value was pasted
    // without the --- delimiters.
    const lines = normalized.split('\n');
    const candidate = lines.slice(0, 30);
    const firstHeadingIdx = candidate.findIndex((l) => /^\s*##\s+/.test(l));
    const headChunk = candidate
      .slice(0, firstHeadingIdx >= 0 ? firstHeadingIdx : candidate.length)
      .join('\n')
      .trim();
    if (/^\s*template\s*:/m.test(headChunk) || /^\s*type\s*:/m.test(headChunk)) {
      frontmatter = parseYamlLikeBlock(headChunk) as MdFeederFrontmatter;
      body = lines.slice(firstHeadingIdx >= 0 ? firstHeadingIdx : 0).join('\n');
    }
  }

  const templateValue = String(frontmatter.template ?? '').trim().toLowerCase();
  const legacyContactType = String(frontmatter.type ?? '').trim().toLowerCase();
  const isLegacyContact = legacyContactType === 'contato-cliente' || legacyContactType === 'contato_cliente';
  if (!isLegacyContact && templateValue !== 'uzzops-feeder') {
    errors.push('Frontmatter invalido: template deve ser "uzzops-feeder".');
  }
  const templateVersionValue = String(
    frontmatter.template_version ?? frontmatter.version ?? ''
  ).trim();
  if (!isLegacyContact && !templateVersionValue) {
    errors.push('Frontmatter invalido: informe template_version (ou version).');
  }

  // Accepts optional leading spaces before section headings.
  // Only parse top-level sections as items.
  // This prevents "##" inside multiline fields (e.g. summary_md: |) from becoming fake item types.
  const headingRe = /^##\s+([a-zA-Z0-9_-]+)\s*$/gm;
  const matches = Array.from(body.matchAll(headingRe));
  const items: MdFeederParsedItem[] = [];

  for (let idx = 0; idx < matches.length; idx += 1) {
    const m = matches[idx];
    const type = normalizeItemType(m[1]);
    const start = (m.index ?? 0) + m[0].length;
    const end = idx + 1 < matches.length ? (matches[idx + 1].index ?? body.length) : body.length;
    const blockText = body.slice(start, end).trim();
    const rawData = parseYamlLikeBlock(blockText);

    items.push({
      itemIndex: idx + 1,
      itemType: type,
      rawData,
    });
  }

  if (items.length === 0) {
    if (isLegacyContact) {
      items.push({
        itemIndex: 1,
        itemType: 'contato_cliente',
        rawData: {
          ...frontmatter,
          subtipo: frontmatter.subtipo ?? 'feedback',
          status: frontmatter.status ?? 'rascunho',
          cliente: frontmatter.cliente ?? '',
          contato_principal: frontmatter.contato_principal ?? '',
          empresa: frontmatter.empresa ?? '',
          estagio_funil: frontmatter.estagio_funil ?? null,
          status_negociacao: frontmatter.status_negociacao ?? null,
          probabilidade_fechamento: frontmatter.probabilidade_fechamento ?? null,
          prioridade: frontmatter.prioridade ?? null,
          valor_potencial: frontmatter.valor_potencial ?? null,
          valor_mensalidade: frontmatter.valor_mensalidade ?? null,
          valor_setup: frontmatter.valor_setup ?? null,
          data_contato: frontmatter.data_contato ?? frontmatter.date ?? '',
          hora_inicio: frontmatter.hora_inicio ?? null,
          hora_fim: frontmatter.hora_fim ?? null,
          duracao: frontmatter.duracao ?? null,
          data_proxima_interacao: frontmatter.data_proxima_interacao ?? null,
          prazo_proxima_acao: frontmatter.prazo_proxima_acao ?? null,
          responsavel_vendas: frontmatter.responsavel_vendas ?? null,
          responsavel_followup: frontmatter.responsavel_followup ?? null,
          responsavel_tecnico: frontmatter.responsavel_tecnico ?? null,
          produto: frontmatter.produto ?? null,
          projeto: frontmatter.projeto ?? frontmatter.project ?? null,
          canal: frontmatter.canal ?? null,
          sentimento_geral: frontmatter.sentimento_geral ?? null,
          tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
          summary_md: body.trim(),
        },
      });
    } else {
      errors.push('Nenhum bloco encontrado. Use seções iniciando com "## tipo".');
    }
  }

  return { frontmatter, items, errors };
}

export type Phase1ValidationStatus =
  | 'valid'
  | 'invalid'
  | 'duplicate'
  | 'duplicate_with_extras';

export type Phase1Action = 'create' | 'update' | 'skip' | 'add_observation' | null;

export interface Phase1ValidatedItem {
  itemIndex: number;
  itemType: string;
  rawData: Record<string, unknown>;
  validationStatus: Phase1ValidationStatus;
  validationErrors: string[];
  action: Phase1Action;
  entityCode: string | null;
  summary: string;
}

function asString(v: unknown): string {
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'number') return String(v);
  return '';
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => asString(x)).filter(Boolean);
}

function isIsoDate(v: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(v);
}

function normalizeItemType(type: string): string {
  return String(type || '')
    .trim()
    .toLowerCase()
    .replace(/-/g, '_');
}

function parsePercent(v: unknown): number | null {
  const raw = asString(v);
  if (!raw) return null;
  const n = Number(raw.replace('%', '').trim());
  return Number.isFinite(n) ? n : null;
}

function parseMoney(v: unknown): number | null {
  const raw = asString(v);
  if (!raw) return null;
  const normalized = raw
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^\d.-]/g, '');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

export function validatePhase1Items(
  parsedItems: MdFeederParsedItem[],
  context: MdFeederValidationContext
): Phase1ValidatedItem[] {
  const results: Phase1ValidatedItem[] = [];
  const existingByCode = context.existingByCode;
  const existingRisksByPublicId = context.existingRisksByPublicId ?? new Set<string>();
  const existingCampaignsByName = context.existingCampaignsByName ?? new Set<string>();
  const existingSprintsByCode = context.existingSprintsByCode ?? new Set<string>();
  const incomingSprintsByCode = context.incomingSprintsByCode ?? new Set<string>();
  const existingTeamMemberEmails = context.existingTeamMemberEmails ?? new Set<string>();
  const existingTeamMemberNames = context.existingTeamMemberNames ?? new Set<string>();
  const existingClientEmails = context.existingClientEmails ?? new Set<string>();
  const existingClientPhones = context.existingClientPhones ?? new Set<string>();

  for (const item of parsedItems) {
    const raw = item.rawData;
    const type = item.itemType;
    const code = asString(raw.code).toUpperCase() || null;
    const errors: string[] = [];
    let validationStatus: Phase1ValidationStatus = 'valid';
    let action: Phase1Action = 'create';
    let summary = '';

    if (
      type !== 'feature' &&
      type !== 'epic' &&
      type !== 'spike' &&
      type !== 'spike_result' &&
      type !== 'bug' &&
      type !== 'bug_resolution' &&
      type !== 'sprint' &&
      type !== 'sprint_update' &&
      type !== 'task' &&
      type !== 'user_story' &&
      type !== 'daily' &&
      type !== 'daily_member' &&
      type !== 'feature_dependency' &&
      type !== 'risk' &&
      type !== 'retrospective' &&
      type !== 'planning_result' &&
      type !== 'baseline_metric' &&
      type !== 'marketing_campaign' &&
      type !== 'marketing_post' &&
      type !== 'team_member' &&
      type !== 'uzzapp_client' &&
      type !== 'contato_cliente'
    ) {
      errors.push(`item_type "${type}" ainda nao suportado.`);
    }

    if (type === 'feature' || type === 'bug' || type === 'epic' || type === 'spike') {
      const name = asString(raw.name);
      const category = asString(raw.category);
      const priority = asString(raw.priority).toUpperCase();
      const status = asString(raw.status);
      const version = asString(raw.version).toUpperCase();
      const dueDate = asString(raw.due_date);
      const responsible = asStringArray(raw.responsible);
      const spikeTimebox = raw.spike_timebox_hours == null ? null : Number(raw.spike_timebox_hours);

      if (!name) errors.push('name obrigatorio.');
      if (!category) errors.push('category obrigatorio.');
      if (!priority || !PRIORITY_VALUES.has(priority)) {
        errors.push('priority invalido (use P0|P1|P2|P3).');
      }
      if (status && !STATUS_VALUES.has(status)) {
        errors.push('status invalido.');
      }
      if (version && !VERSION_VALUES.has(version)) {
        errors.push('version invalido.');
      }
      if (dueDate && !isIsoDate(dueDate)) {
        errors.push('due_date deve estar em YYYY-MM-DD.');
      }
      if (raw.story_points != null && Number.isNaN(Number(raw.story_points))) {
        errors.push('story_points deve ser numero.');
      }
      if (type === 'spike') {
        if (spikeTimebox == null || !Number.isInteger(spikeTimebox) || spikeTimebox <= 0) {
          errors.push('spike_timebox_hours obrigatorio e inteiro > 0 para spike.');
        }
      }
      if (responsible.length === 0 && raw.responsible != null) {
        errors.push('responsible deve ser lista de strings.');
      }

      const hasExisting = !!(code && existingByCode.has(code));
      const hasObservation = asString(raw.observation).length > 0;

      if (hasExisting) {
        if (hasObservation) {
          validationStatus = 'duplicate_with_extras';
          action = 'add_observation';
        } else {
          validationStatus = 'duplicate';
          action = 'skip';
        }
      } else {
        validationStatus = 'valid';
        action = 'create';
      }

      summary = `${type}: ${name || '(sem nome)'}`;
    }

    if (type === 'bug_resolution') {
      const status = asString(raw.status);
      if (!code) errors.push('code obrigatorio para bug_resolution.');
      if (!status || !STATUS_VALUES.has(status)) {
        errors.push('status invalido para bug_resolution.');
      }
      if (code && !existingByCode.has(code)) {
        errors.push(`code ${code} nao encontrado para bug_resolution.`);
      }
      action = 'update';
      validationStatus = 'valid';
      summary = `bug_resolution: ${code ?? '(sem code)'}`;
    }

    if (type === 'spike_result') {
      if (!code) errors.push('code obrigatorio para spike_result.');
      if (code && !existingByCode.has(code)) {
        errors.push(`code ${code} nao encontrado para spike_result.`);
      }
      if (!asString(raw.spike_outcome) && !asString(raw.outcome)) {
        errors.push('spike_outcome (ou outcome) obrigatorio para spike_result.');
      }
      if (raw.story_points != null && Number.isNaN(Number(raw.story_points))) {
        errors.push('story_points deve ser numero quando informado em spike_result.');
      }
      action = 'update';
      validationStatus = 'valid';
      summary = `spike_result: ${code ?? '(sem code)'}`;
    }

    if (type === 'sprint') {
      const codeValue = asString(raw.code).toUpperCase();
      const name = asString(raw.name);
      const sprintGoal = asString(raw.sprint_goal);
      const startDate = asString(raw.start_date);
      const endDate = asString(raw.end_date);
      const sprintStatus = asString(raw.status) || 'planned';
      const durationWeeks = raw.duration_weeks == null ? null : Number(raw.duration_weeks);

      if (!name) errors.push('name obrigatorio para sprint.');
      if (!sprintGoal || sprintGoal.length < 10) errors.push('sprint_goal obrigatorio (min 10 chars).');
      if (!startDate || !isIsoDate(startDate)) errors.push('start_date obrigatorio em YYYY-MM-DD.');
      if (!endDate || !isIsoDate(endDate)) errors.push('end_date obrigatorio em YYYY-MM-DD.');
      if (sprintStatus && !SPRINT_STATUS_VALUES.has(sprintStatus)) errors.push('status invalido para sprint.');
      if (durationWeeks != null && (!Number.isInteger(durationWeeks) || durationWeeks < 1 || durationWeeks > 4)) {
        errors.push('duration_weeks deve ser inteiro entre 1 e 4.');
      }
      if (codeValue && existingSprintsByCode.has(codeValue)) {
        validationStatus = 'duplicate';
        action = 'skip';
      } else {
        validationStatus = 'valid';
        action = 'create';
      }
      summary = `sprint: ${name || '(sem nome)'}`;
    }

    if (type === 'sprint_update') {
      const sprintCode = asString(raw.sprint_code).toUpperCase();
      const sprintId = asString(raw.sprint_id);
      const sprintStatus = asString(raw.status);
      const hasAnyPatch =
        !!sprintStatus ||
        raw.velocity_actual != null ||
        raw.velocity_target != null ||
        raw.capacity_total != null ||
        !!asString(raw.sprint_goal) ||
        !!asString(raw.end_date) ||
        !!asString(raw.start_date);

      if (!sprintCode && !sprintId) errors.push('sprint_code ou sprint_id obrigatorio para sprint_update.');
      if (sprintCode && !existingSprintsByCode.has(sprintCode) && !incomingSprintsByCode.has(sprintCode)) {
        errors.push(`sprint_code ${sprintCode} nao encontrado para sprint_update.`);
      }
      if (sprintStatus && !SPRINT_STATUS_VALUES.has(sprintStatus)) {
        errors.push('status invalido para sprint_update.');
      }
      if (asString(raw.end_date) && !isIsoDate(asString(raw.end_date))) {
        errors.push('end_date deve estar em YYYY-MM-DD.');
      }
      if (!hasAnyPatch) errors.push('sprint_update sem campos para atualizar.');
      validationStatus = 'valid';
      action = 'update';
      summary = `sprint_update: ${sprintCode || sprintId || '(sem referencia)'}`;
    }

    if (type === 'task') {
      const title = asString(raw.title);
      const featureCode = asString(raw.feature_code).toUpperCase();
      const featureId = asString(raw.feature_id);
      const taskStatus = asString(raw.status) || 'todo';
      if (!title) errors.push('title obrigatorio para task.');
      if (!featureCode && !featureId) errors.push('feature_code ou feature_id obrigatorio para task.');
      if (featureCode && !existingByCode.has(featureCode)) {
        errors.push(`feature_code ${featureCode} nao encontrado para task.`);
      }
      if (taskStatus && !TASK_STATUS_VALUES.has(taskStatus)) errors.push('status invalido para task.');
      if (raw.estimated_hours != null && Number.isNaN(Number(raw.estimated_hours))) {
        errors.push('estimated_hours deve ser numerico.');
      }
      validationStatus = 'valid';
      action = 'create';
      summary = `task: ${title || '(sem titulo)'}`;
    }

    if (type === 'user_story') {
      const featureCode = asString(raw.feature_code).toUpperCase();
      const featureId = asString(raw.feature_id);
      const asA = asString(raw.as_a);
      const iWant = asString(raw.i_want);
      const soThat = asString(raw.so_that);
      if (!featureCode && !featureId) errors.push('feature_code ou feature_id obrigatorio para user_story.');
      if (featureCode && !existingByCode.has(featureCode)) {
        errors.push(`feature_code ${featureCode} nao encontrado para user_story.`);
      }
      if (!asA) errors.push('as_a obrigatorio para user_story.');
      if (!iWant) errors.push('i_want obrigatorio para user_story.');
      if (!soThat) errors.push('so_that obrigatorio para user_story.');
      validationStatus = 'valid';
      action = 'create';
      summary = `user_story: ${featureCode || featureId || '(sem feature)'}`;
    }

    if (type === 'daily' || type === 'daily_member') {
      const logDate = asString(raw.log_date || raw.date);
      if (logDate && !isIsoDate(logDate)) errors.push('log_date/date deve estar em YYYY-MM-DD.');
      if (!asString(raw.what_did_yesterday)) errors.push('what_did_yesterday obrigatorio.');
      if (!asString(raw.what_will_do_today)) errors.push('what_will_do_today obrigatorio.');
      if (type === 'daily_member' && !asString(raw.member_name)) {
        errors.push('member_name obrigatorio para daily_member.');
      }
      validationStatus = 'valid';
      action = 'create';
      summary = `${type}: ${logDate || 'hoje'}`;
    }

    if (type === 'feature_dependency') {
      const featureCode = asString(raw.feature_code).toUpperCase();
      const dependsOnCode = asString(raw.depends_on_code).toUpperCase();
      const dependencyType = asString(raw.dependency_type) || 'blocks';
      if (!featureCode) errors.push('feature_code obrigatorio para feature_dependency.');
      if (!dependsOnCode) errors.push('depends_on_code obrigatorio para feature_dependency.');
      if (featureCode && !existingByCode.has(featureCode)) {
        errors.push(`feature_code ${featureCode} nao encontrado.`);
      }
      if (dependsOnCode && !existingByCode.has(dependsOnCode)) {
        errors.push(`depends_on_code ${dependsOnCode} nao encontrado.`);
      }
      if (featureCode && dependsOnCode && featureCode === dependsOnCode) {
        errors.push('feature_code e depends_on_code nao podem ser iguais.');
      }
      if (!DEPENDENCY_TYPE_VALUES.has(dependencyType)) {
        errors.push('dependency_type invalido para feature_dependency.');
      }
      validationStatus = 'valid';
      action = 'create';
      summary = `feature_dependency: ${featureCode || '?'} -> ${dependsOnCode || '?'}`;
    }

    if (type === 'risk') {
      const title = asString(raw.title);
      const publicId = asString(raw.public_id).toUpperCase() || null;
      const status = asString(raw.status) || 'identified';
      const g = Number(raw.gut_g);
      const u = Number(raw.gut_u);
      const t = Number(raw.gut_t);

      if (!title) errors.push('title obrigatorio para risk.');
      if (!Number.isInteger(g) || g < 1 || g > 5) errors.push('gut_g deve ser inteiro entre 1 e 5.');
      if (!Number.isInteger(u) || u < 1 || u > 5) errors.push('gut_u deve ser inteiro entre 1 e 5.');
      if (!Number.isInteger(t) || t < 1 || t > 5) errors.push('gut_t deve ser inteiro entre 1 e 5.');
      if (status && !RISK_STATUS_VALUES.has(status)) errors.push('status invalido para risk.');

      if (publicId && existingRisksByPublicId.has(publicId)) {
        validationStatus = 'duplicate';
        action = 'skip';
      } else {
        validationStatus = 'valid';
        action = 'create';
      }
      summary = `risk: ${title || '(sem titulo)'}`;
    }

    if (type === 'retrospective') {
      const actionText = asString(raw.action_text);
      const category = asString(raw.category) || 'needs_improvement';
      const status = asString(raw.status) || 'pending';
      const dueDate = asString(raw.due_date);

      if (!actionText) errors.push('action_text obrigatorio para retrospective.');
      if (!RETRO_CATEGORY_VALUES.has(category)) errors.push('category invalido para retrospective.');
      if (!RETRO_STATUS_VALUES.has(status)) errors.push('status invalido para retrospective.');
      if (dueDate && !isIsoDate(dueDate)) errors.push('due_date deve estar em YYYY-MM-DD.');

      validationStatus = 'valid';
      action = 'create';
      summary = `retrospective: ${actionText || '(sem texto)'}`;
    }

    if (type === 'planning_result') {
      const finalValue = Number(raw.final_value ?? raw.story_points ?? raw.business_value ?? raw.work_effort);
      if (!code) errors.push('code obrigatorio para planning_result.');
      if (!code || !existingByCode.has(code)) {
        errors.push(`code ${code || '(vazio)'} nao encontrado para planning_result.`);
      }
      if (!Number.isFinite(finalValue)) {
        errors.push('final_value/story_points/business_value/work_effort obrigatorio para planning_result.');
      }

      validationStatus = 'valid';
      action = 'update';
      summary = `planning_result: ${code ?? '(sem code)'}`;
    }

    if (type === 'baseline_metric') {
      const metricName = asString(raw.metric_name);
      const metricCategory = asString(raw.metric_category);
      const baselineDate = asString(raw.baseline_date);
      if (!metricName) errors.push('metric_name obrigatorio para baseline_metric.');
      if (!metricCategory || !BASELINE_CATEGORY_VALUES.has(metricCategory)) {
        errors.push('metric_category invalido para baseline_metric.');
      }
      if (!baselineDate || !isIsoDate(baselineDate)) {
        errors.push('baseline_date obrigatorio em YYYY-MM-DD para baseline_metric.');
      }
      if (raw.baseline_value != null && Number.isNaN(Number(raw.baseline_value))) {
        errors.push('baseline_value deve ser numerico.');
      }
      if (raw.target_value != null && Number.isNaN(Number(raw.target_value))) {
        errors.push('target_value deve ser numerico.');
      }
      if (raw.current_value != null && Number.isNaN(Number(raw.current_value))) {
        errors.push('current_value deve ser numerico.');
      }

      validationStatus = 'valid';
      action = 'update';
      summary = `baseline_metric: ${metricName || '(sem nome)'}`;
    }

    if (type === 'marketing_campaign') {
      const name = asString(raw.name);
      const status = asString(raw.status) || 'draft';
      const startDate = asString(raw.start_date);
      const endDate = asString(raw.end_date);
      if (!name) errors.push('name obrigatorio para marketing_campaign.');
      if (status && !MARKETING_CAMPAIGN_STATUS.has(status)) {
        errors.push('status invalido para marketing_campaign.');
      }
      if (startDate && !isIsoDate(startDate)) errors.push('start_date deve estar em YYYY-MM-DD.');
      if (endDate && !isIsoDate(endDate)) errors.push('end_date deve estar em YYYY-MM-DD.');

      if (name && existingCampaignsByName.has(name.toLowerCase())) {
        validationStatus = 'duplicate';
        action = 'skip';
      } else {
        validationStatus = 'valid';
        action = 'create';
      }
      summary = `marketing_campaign: ${name || '(sem nome)'}`;
    }

    if (type === 'marketing_post') {
      const title = asString(raw.title);
      const contentType = asString(raw.content_type);
      const channel = asString(raw.channel);
      const scheduledDate = asString(raw.scheduled_date);
      const status = asString(raw.status) || 'scheduled';
      if (!title) errors.push('title obrigatorio para marketing_post.');
      if (!contentType || !MARKETING_CONTENT_TYPES.has(contentType)) {
        errors.push('content_type invalido para marketing_post.');
      }
      if (!channel || !MARKETING_CHANNELS.has(channel)) {
        errors.push('channel invalido para marketing_post.');
      }
      if (!scheduledDate || !isIsoDate(scheduledDate)) {
        errors.push('scheduled_date obrigatorio em YYYY-MM-DD para marketing_post.');
      }
      if (status && !MARKETING_PUBLICATION_STATUS.has(status)) {
        errors.push('status invalido para marketing_post.');
      }
      validationStatus = 'valid';
      action = 'create';
      summary = `marketing_post: ${title || '(sem titulo)'}`;
    }

    if (type === 'team_member') {
      const name = asString(raw.name);
      const email = asString(raw.email).toLowerCase();
      const role = asString(raw.role).toLowerCase();
      const allocationPercent = raw.allocation_percent == null ? 100 : Number(raw.allocation_percent);
      const isActiveRaw = raw.is_active;

      if (!name) errors.push('name obrigatorio para team_member.');
      if (email && !email.includes('@')) errors.push('email invalido para team_member.');
      if (role && !TEAM_MEMBER_ROLES.has(role)) errors.push('role invalido para team_member.');
      if (!Number.isInteger(allocationPercent) || allocationPercent < 0 || allocationPercent > 100) {
        errors.push('allocation_percent deve ser inteiro entre 0 e 100.');
      }
      if (isActiveRaw != null && typeof isActiveRaw !== 'boolean') {
        errors.push('is_active deve ser boolean quando informado.');
      }
      if (raw.velocity_avg != null && Number.isNaN(Number(raw.velocity_avg))) {
        errors.push('velocity_avg deve ser numerico quando informado.');
      }

      const duplicateByEmail = !!email && existingTeamMemberEmails.has(email);
      const duplicateByName = !email && existingTeamMemberNames.has(name.toLowerCase());
      const hasObservation = asString(raw.observation).length > 0;

      if (duplicateByEmail || duplicateByName) {
        validationStatus = hasObservation ? 'duplicate_with_extras' : 'duplicate';
        action = hasObservation ? 'add_observation' : 'skip';
      } else {
        validationStatus = 'valid';
        action = 'create';
      }
      summary = `team_member: ${name || '(sem nome)'}`;
    }

    if (type === 'uzzapp_client') {
      const name = asString(raw.name);
      const email = asString(raw.email).toLowerCase();
      const phone = asString(raw.phone);
      const plan = asString(raw.plan).toLowerCase();
      const status = asString(raw.status) || 'active';
      const onboardedAt = asString(raw.onboarded_at);
      const leadSource = asString(raw.lead_source);
      const icpClassification = asString(raw.icp_classification);
      const leadDailyVolume =
        raw.lead_daily_volume == null || raw.lead_daily_volume === ''
          ? null
          : Number(raw.lead_daily_volume);
      const hasObservation = asString(raw.observation).length > 0;

      if (!name) errors.push('name obrigatorio para uzzapp_client.');
      if (email && !email.includes('@')) errors.push('email invalido para uzzapp_client.');
      if (plan && !CLIENT_PLAN_VALUES.has(plan)) errors.push('plan invalido para uzzapp_client.');
      if (status && !CLIENT_STATUS_VALUES.has(status)) errors.push('status invalido para uzzapp_client.');
      if (onboardedAt && !isIsoDate(onboardedAt)) errors.push('onboarded_at deve estar em YYYY-MM-DD.');
      if (leadSource && !LEAD_SOURCE_VALUES.has(leadSource)) {
        errors.push('lead_source invalido para uzzapp_client (use: indicacao|linkedin|evento|cold-outreach|inbound|parceiro|outro).');
      }
      if (icpClassification && !ICP_CLASSIFICATION_VALUES.has(icpClassification)) {
        errors.push('icp_classification invalido para uzzapp_client (use: hot|warm|cold|future).');
      }
      if (leadDailyVolume !== null && (!Number.isInteger(leadDailyVolume) || leadDailyVolume < 0)) {
        errors.push('lead_daily_volume deve ser inteiro >= 0.');
      }

      const duplicateByPhone = !!phone && existingClientPhones.has(phone);
      const duplicateByEmail = !!email && existingClientEmails.has(email);

      if (duplicateByPhone || duplicateByEmail) {
        validationStatus = hasObservation ? 'duplicate_with_extras' : 'duplicate';
        action = hasObservation ? 'add_observation' : 'skip';
      } else {
        validationStatus = 'valid';
        action = 'create';
      }
      summary = `uzzapp_client: ${name || '(sem nome)'}`;
    }

    if (type === 'contato_cliente') {
      const cliente = asString(raw.cliente);
      const subtype = asString(raw.subtipo);
      const status = asString(raw.status) || 'rascunho';
      const dataContato = asString(raw.data_contato);
      const probabilidade = parsePercent(raw.probabilidade_fechamento);
      const prioridade = asString(raw.prioridade);
      const estagioFunil = asString(raw.estagio_funil);
      const statusNegociacao = asString(raw.status_negociacao);
      const produto = asString(raw.produto);
      const canal = asString(raw.canal);
      const sentimento = asString(raw.sentimento_geral);
      const dealOutcome = asString(raw.deal_outcome);

      if (!cliente) errors.push('cliente obrigatorio para contato_cliente.');
      if (!subtype || !CONTACT_SUBTYPE_VALUES.has(subtype)) errors.push('subtipo invalido para contato_cliente.');
      if (status && !CONTACT_STATUS_VALUES.has(status)) errors.push('status invalido para contato_cliente.');
      if (!dataContato || !isIsoDate(dataContato)) errors.push('data_contato obrigatorio em YYYY-MM-DD.');
      if (raw.probabilidade_fechamento != null && (probabilidade == null || !Number.isInteger(probabilidade) || probabilidade < 0 || probabilidade > 100)) {
        errors.push('probabilidade_fechamento deve ser inteiro entre 0 e 100.');
      }
      if (prioridade && !CONTACT_PRIORITY_VALUES.has(prioridade)) {
        errors.push('prioridade invalida para contato_cliente.');
      }
      if (estagioFunil && !FUNNEL_STAGE_VALUES.has(estagioFunil)) {
        errors.push('estagio_funil invalido para contato_cliente.');
      }
      if (statusNegociacao && !NEGOTIATION_STATUS_VALUES.has(statusNegociacao)) {
        errors.push('status_negociacao invalido para contato_cliente.');
      }
      if (produto && !PRODUCT_VALUES.has(produto)) {
        errors.push('produto invalido para contato_cliente.');
      }
      if (canal && !CHANNEL_VALUES.has(canal)) {
        errors.push('canal invalido para contato_cliente.');
      }
      if (sentimento && !SENTIMENT_VALUES.has(sentimento)) {
        errors.push('sentimento_geral invalido para contato_cliente.');
      }
      if (dealOutcome && !DEAL_OUTCOME_VALUES.has(dealOutcome)) {
        errors.push('deal_outcome invalido para contato_cliente (use: open|won|lost|stand_by).');
      }
      if (asString(raw.hora_inicio) && !/^\d{2}:\d{2}$/.test(asString(raw.hora_inicio))) {
        errors.push('hora_inicio deve estar em HH:MM.');
      }
      if (asString(raw.hora_fim) && !/^\d{2}:\d{2}$/.test(asString(raw.hora_fim))) {
        errors.push('hora_fim deve estar em HH:MM.');
      }
      if (asString(raw.data_proxima_interacao) && !isIsoDate(asString(raw.data_proxima_interacao))) {
        errors.push('data_proxima_interacao deve estar em YYYY-MM-DD.');
      }
      if (asString(raw.prazo_proxima_acao) && !isIsoDate(asString(raw.prazo_proxima_acao))) {
        errors.push('prazo_proxima_acao deve estar em YYYY-MM-DD.');
      }
      if (raw.valor_potencial != null && parseMoney(raw.valor_potencial) == null) {
        errors.push('valor_potencial invalido para contato_cliente.');
      }
      if (raw.valor_mensalidade != null && parseMoney(raw.valor_mensalidade) == null) {
        errors.push('valor_mensalidade invalido para contato_cliente.');
      }
      if (raw.valor_setup != null && parseMoney(raw.valor_setup) == null) {
        errors.push('valor_setup invalido para contato_cliente.');
      }

      validationStatus = 'valid';
      action = 'create';
      summary = `contato_cliente: ${cliente || '(sem cliente)'}`;
    }

    if (errors.length > 0) {
      validationStatus = 'invalid';
      action = null;
    }

    results.push({
      itemIndex: item.itemIndex,
      itemType: type,
      rawData: raw,
      validationStatus,
      validationErrors: errors,
      action,
      entityCode: code,
      summary,
    });
  }

  return results;
}
