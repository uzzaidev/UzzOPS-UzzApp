import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/tenant';

const updateContactSchema = z.object({
  contact_subtype: z.enum(['demo', 'setup', 'negociacao', 'follow-up', 'suporte', 'feedback']).optional(),
  status: z.enum(['rascunho', 'realizado', 'agendado', 'cancelado']).optional(),
  title: z.string().trim().nullable().optional(),
  contato_principal: z.string().trim().nullable().optional(),
  empresa: z.string().trim().nullable().optional(),
  estagio_funil: z.enum([
    'lead-novo', 'qualificado', 'proposta', 'negociacao',
    'fechado', 'onboarding', 'cliente-ativo', 'stand-by', 'perdido',
  ]).nullable().optional(),
  status_negociacao: z.enum([
    'Em Andamento', 'Stand-by', 'Fechado', 'Perdido', 'Cancelado',
  ]).nullable().optional(),
  probabilidade_fechamento: z.number().int().min(0).max(100).nullable().optional(),
  prioridade: z.enum(['critica', 'alta', 'media', 'baixa']).nullable().optional(),
  valor_potencial: z.number().nonnegative().nullable().optional(),
  valor_mensalidade: z.number().nonnegative().nullable().optional(),
  valor_setup: z.number().nonnegative().nullable().optional(),
  data_contato: z.string().trim().optional(),
  hora_inicio: z.string().trim().nullable().optional(),
  hora_fim: z.string().trim().nullable().optional(),
  duracao_minutos: z.number().int().min(0).nullable().optional(),
  data_proxima_interacao: z.string().trim().nullable().optional(),
  prazo_proxima_acao: z.string().trim().nullable().optional(),
  responsavel_vendas: z.string().uuid().nullable().optional(),
  responsavel_followup: z.string().uuid().nullable().optional(),
  responsavel_tecnico: z.string().uuid().nullable().optional(),
  responsavel_vendas_nome: z.string().trim().nullable().optional(),
  responsavel_followup_nome: z.string().trim().nullable().optional(),
  responsavel_tecnico_nome: z.string().trim().nullable().optional(),
  produto: z.enum(['CHATBOT', 'SITE-BUILDER', 'UzzBIM', 'NutriTrain', 'OUTRO']).nullable().optional(),
  projeto: z.string().trim().nullable().optional(),
  canal: z.enum(['presencial', 'videochamada', 'telefone', 'whatsapp', 'email']).nullable().optional(),
  sentimento_geral: z.enum(['Positivo', 'Neutro', 'Negativo']).nullable().optional(),
  tags: z.array(z.string()).optional(),
  summary_md: z.string().nullable().optional(),
  dashboard_exec: z.record(z.unknown()).optional(),
  bant_scores: z.record(z.unknown()).optional(),
  fit_scores: z.record(z.unknown()).optional(),
  dores_json: z.array(z.unknown()).optional(),
  objecoes_json: z.array(z.unknown()).optional(),
  proximos_passos_json: z.array(z.unknown()).optional(),
  riscos_json: z.array(z.unknown()).optional(),
  quality_checklist: z.array(z.unknown()).optional(),
  source: z.string().trim().nullable().optional(),
}).strict();

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: current } = await supabase
      .from('client_contacts')
      .select('id, tenant_id')
      .eq('id', id)
      .single();

    if (!current) return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    const { error: authError } = await requireTenant(supabase, { tenantId: current.tenant_id });
    if (authError) return authError;

    const { data, error } = await supabase
      .from('client_contacts')
      .select(`
        *,
        client:uzzapp_clients(id, name, company),
        owner_sales:team_members!client_contacts_responsavel_vendas_fkey(id, name),
        owner_followup:team_members!client_contacts_responsavel_followup_fkey(id, name),
        owner_tech:team_members!client_contacts_responsavel_tecnico_fkey(id, name)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: current } = await supabase
      .from('client_contacts')
      .select('id, tenant_id')
      .eq('id', id)
      .single();

    if (!current) return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    const { error: authError } = await requireTenant(supabase, { tenantId: current.tenant_id });
    if (authError) return authError;

    const body = await request.json();
    const parsed = updateContactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('client_contacts')
      .update({
        ...parsed.data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: current } = await supabase
      .from('client_contacts')
      .select('id, tenant_id')
      .eq('id', id)
      .single();

    if (!current) return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    const { error: authError } = await requireTenant(supabase, { tenantId: current.tenant_id });
    if (authError) return authError;

    const { error } = await supabase
      .from('client_contacts')
      .delete()
      .eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
