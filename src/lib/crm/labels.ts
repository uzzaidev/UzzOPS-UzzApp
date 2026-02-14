export const STATUS_LABELS: Record<string, string> = {
  active: 'Ativo',
  trial: 'Trial',
  paused: 'Pausado',
  churned: 'Churn',
};

export const FUNNEL_LABELS: Record<string, string> = {
  'lead-novo': 'Lead novo',
  qualificado: 'Qualificado',
  proposta: 'Proposta',
  negociacao: 'Negociacao',
  fechado: 'Fechado',
  onboarding: 'Onboarding',
  'cliente-ativo': 'Cliente ativo',
  'stand-by': 'Stand-by',
  perdido: 'Perdido',
};

export const NEGOTIATION_LABELS: Record<string, string> = {
  'Em Andamento': 'Em andamento',
  'Stand-by': 'Stand-by',
  Fechado: 'Fechado',
  Perdido: 'Perdido',
  Cancelado: 'Cancelado',
};

export const DEAL_OUTCOME_LABELS: Record<string, string> = {
  open: 'Em aberto',
  won: 'Ganho',
  lost: 'Perdido',
  stand_by: 'Stand-by',
  'Em Andamento': 'Em andamento',
  'Stand-by': 'Stand-by',
  Fechado: 'Fechado',
  Perdido: 'Perdido',
  Cancelado: 'Cancelado',
};

export const PRIORITY_LABELS: Record<string, string> = {
  baixa: 'Baixa',
  media: 'Media',
  alta: 'Alta',
};

export const SENTIMENT_LABELS: Record<string, string> = {
  positivo: 'Positivo',
  neutro: 'Neutro',
  negativo: 'Negativo',
};

export function statusLabel(value: string | null | undefined) {
  if (!value) return '-';
  return STATUS_LABELS[value] ?? value;
}

export function funnelLabel(value: string | null | undefined) {
  if (!value) return '-';
  return FUNNEL_LABELS[value] ?? value;
}

export function negotiationLabel(value: string | null | undefined) {
  if (!value) return '-';
  return NEGOTIATION_LABELS[value] ?? value;
}

export function dealOutcomeLabel(value: string | null | undefined) {
  if (!value) return '-';
  return DEAL_OUTCOME_LABELS[value] ?? value;
}

export function priorityLabel(value: string | null | undefined) {
  if (!value) return '-';
  const key = value.trim().toLowerCase();
  return PRIORITY_LABELS[key] ?? value;
}

export function sentimentLabel(value: string | null | undefined) {
  if (!value) return '-';
  const key = value.trim().toLowerCase();
  return SENTIMENT_LABELS[key] ?? value;
}
