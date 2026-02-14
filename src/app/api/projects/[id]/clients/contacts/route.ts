import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/tenant';

const createContactSchema = z.object({
  client_id: z.string().uuid(),
  contact_subtype: z.enum(['demo', 'setup', 'negociacao', 'follow-up', 'suporte', 'feedback']),
  status: z.enum(['rascunho', 'realizado', 'agendado', 'cancelado']).optional(),
  title: z.string().trim().optional().nullable(),
  contato_principal: z.string().trim().optional().nullable(),
  empresa: z.string().trim().optional().nullable(),
  estagio_funil: z.enum([
    'lead-novo', 'qualificado', 'proposta', 'negociacao',
    'fechado', 'onboarding', 'cliente-ativo', 'stand-by', 'perdido',
  ]).optional().nullable(),
  status_negociacao: z.enum([
    'Em Andamento', 'Stand-by', 'Fechado', 'Perdido', 'Cancelado',
  ]).optional().nullable(),
  probabilidade_fechamento: z.number().int().min(0).max(100).optional().nullable(),
  prioridade: z.enum(['critica', 'alta', 'media', 'baixa']).optional().nullable(),
  valor_potencial: z.number().nonnegative().optional().nullable(),
  valor_mensalidade: z.number().nonnegative().optional().nullable(),
  valor_setup: z.number().nonnegative().optional().nullable(),
  data_contato: z.string().trim(),
  hora_inicio: z.string().trim().optional().nullable(),
  hora_fim: z.string().trim().optional().nullable(),
  duracao_minutos: z.number().int().min(0).optional().nullable(),
  data_proxima_interacao: z.string().trim().optional().nullable(),
  prazo_proxima_acao: z.string().trim().optional().nullable(),
  responsavel_vendas: z.string().uuid().optional().nullable(),
  responsavel_followup: z.string().uuid().optional().nullable(),
  responsavel_tecnico: z.string().uuid().optional().nullable(),
  responsavel_vendas_nome: z.string().trim().optional().nullable(),
  responsavel_followup_nome: z.string().trim().optional().nullable(),
  responsavel_tecnico_nome: z.string().trim().optional().nullable(),
  produto: z.enum(['CHATBOT', 'SITE-BUILDER', 'UzzBIM', 'NutriTrain', 'OUTRO']).optional().nullable(),
  projeto: z.string().trim().optional().nullable(),
  canal: z.enum(['presencial', 'videochamada', 'telefone', 'whatsapp', 'email']).optional().nullable(),
  sentimento_geral: z.enum(['Positivo', 'Neutro', 'Negativo']).optional().nullable(),
  tags: z.array(z.string()).optional(),
  summary_md: z.string().optional().nullable(),
  dashboard_exec: z.record(z.unknown()).optional(),
  bant_scores: z.record(z.unknown()).optional(),
  fit_scores: z.record(z.unknown()).optional(),
  dores_json: z.array(z.unknown()).optional(),
  objecoes_json: z.array(z.unknown()).optional(),
  proximos_passos_json: z.array(z.unknown()).optional(),
  riscos_json: z.array(z.unknown()).optional(),
  quality_checklist: z.array(z.unknown()).optional(),
  insights_json: z.array(z.unknown()).optional(),
  participants_json: z.record(z.unknown()).optional(),
  deal_outcome: z.enum(['open', 'won', 'lost', 'stand_by']).optional().nullable(),
  interaction_sequence: z.number().int().min(1).optional().nullable(),
  source: z.string().trim().optional().nullable(),
}).strict();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const url = new URL(request.url);
    const clientId = url.searchParams.get('client_id');

    const { data: project } = await supabase
      .from('projects')
      .select('id, tenant_id')
      .eq('id', id)
      .single();

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const { error: authError } = await requireTenant(supabase, { tenantId: project.tenant_id });
    if (authError) return authError;

    let query = supabase
      .from('client_contacts')
      .select(`
        *,
        client:uzzapp_clients(id, name, company),
        owner_sales:team_members!client_contacts_responsavel_vendas_fkey(id, name),
        owner_followup:team_members!client_contacts_responsavel_followup_fkey(id, name),
        owner_tech:team_members!client_contacts_responsavel_tecnico_fkey(id, name)
      `)
      .eq('tenant_id', project.tenant_id)
      .order('data_contato', { ascending: false });

    if (clientId) query = query.eq('client_id', clientId);
    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ data: data ?? [] });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: project } = await supabase
      .from('projects')
      .select('id, tenant_id')
      .eq('id', id)
      .single();
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const { user, error: authError } = await requireTenant(supabase, { tenantId: project.tenant_id });
    if (authError) return authError;

    const body = await request.json();
    const parsed = createContactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 });
    }

    const p = parsed.data;
    const { data, error } = await supabase
      .from('client_contacts')
      .insert({
        tenant_id: project.tenant_id,
        project_id: project.id,
        client_id: p.client_id,
        contact_subtype: p.contact_subtype,
        status: p.status ?? 'rascunho',
        title: p.title ?? null,
        contato_principal: p.contato_principal ?? null,
        empresa: p.empresa ?? null,
        estagio_funil: p.estagio_funil ?? null,
        status_negociacao: p.status_negociacao ?? null,
        probabilidade_fechamento: p.probabilidade_fechamento ?? null,
        prioridade: p.prioridade ?? null,
        valor_potencial: p.valor_potencial ?? null,
        valor_mensalidade: p.valor_mensalidade ?? null,
        valor_setup: p.valor_setup ?? null,
        data_contato: p.data_contato,
        hora_inicio: p.hora_inicio ?? null,
        hora_fim: p.hora_fim ?? null,
        duracao_minutos: p.duracao_minutos ?? null,
        data_proxima_interacao: p.data_proxima_interacao ?? null,
        prazo_proxima_acao: p.prazo_proxima_acao ?? null,
        responsavel_vendas: p.responsavel_vendas ?? null,
        responsavel_followup: p.responsavel_followup ?? null,
        responsavel_tecnico: p.responsavel_tecnico ?? null,
        responsavel_vendas_nome: p.responsavel_vendas_nome ?? null,
        responsavel_followup_nome: p.responsavel_followup_nome ?? null,
        responsavel_tecnico_nome: p.responsavel_tecnico_nome ?? null,
        produto: p.produto ?? null,
        projeto: p.projeto ?? null,
        canal: p.canal ?? null,
        sentimento_geral: p.sentimento_geral ?? null,
        tags: p.tags ?? [],
        summary_md: p.summary_md ?? null,
        dashboard_exec: p.dashboard_exec ?? {},
        bant_scores: p.bant_scores ?? {},
        fit_scores: p.fit_scores ?? {},
        dores_json: p.dores_json ?? [],
        objecoes_json: p.objecoes_json ?? [],
        proximos_passos_json: p.proximos_passos_json ?? [],
        riscos_json: p.riscos_json ?? [],
        quality_checklist: p.quality_checklist ?? [],
        insights_json: p.insights_json ?? [],
        participants_json: p.participants_json ?? {},
        deal_outcome: p.deal_outcome ?? null,
        interaction_sequence: p.interaction_sequence ?? null,
        source: p.source ?? null,
        created_by: user?.id ?? null,
      })
      .select('*')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
