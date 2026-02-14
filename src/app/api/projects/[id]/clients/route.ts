import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/tenant';

const createClientSchema = z.object({
  name: z.string().trim().min(1),
  legal_name: z.string().trim().optional().nullable(),
  cnpj: z.string().trim().optional().nullable(),
  company: z.string().trim().optional().nullable(),
  segment: z.string().trim().optional().nullable(),
  company_size: z.enum(['micro', 'pequena', 'media', 'grande']).optional().nullable(),
  city: z.string().trim().optional().nullable(),
  state: z.string().trim().optional().nullable(),
  address_full: z.string().trim().optional().nullable(),
  website: z.string().trim().optional().nullable(),
  phone: z.string().trim().optional().nullable(),
  email: z.string().trim().email().optional().nullable(),
  main_contact_name: z.string().trim().optional().nullable(),
  main_contact_role: z.string().trim().optional().nullable(),
  whatsapp_business: z.string().trim().optional().nullable(),
  plan: z.enum(['starter', 'pro', 'enterprise', 'custom']).optional(),
  status: z.enum(['active', 'trial', 'paused', 'churned']).optional(),
  funnel_stage: z.enum([
    'lead-novo', 'qualificado', 'proposta', 'negociacao',
    'fechado', 'onboarding', 'cliente-ativo', 'stand-by', 'perdido',
  ]).optional().nullable(),
  negotiation_status: z.enum([
    'Em Andamento', 'Stand-by', 'Fechado', 'Perdido', 'Cancelado',
  ]).optional().nullable(),
  closing_probability: z.number().int().min(0).max(100).optional().nullable(),
  priority: z.enum(['critica', 'alta', 'media', 'baixa']).optional().nullable(),
  potential_value: z.number().nonnegative().optional().nullable(),
  monthly_fee_value: z.number().nonnegative().optional().nullable(),
  setup_fee_value: z.number().nonnegative().optional().nullable(),
  next_interaction_date: z.string().trim().optional().nullable(),
  next_action_deadline: z.string().trim().optional().nullable(),
  sales_owner_id: z.string().uuid().optional().nullable(),
  followup_owner_id: z.string().uuid().optional().nullable(),
  technical_owner_id: z.string().uuid().optional().nullable(),
  product_focus: z.enum(['CHATBOT', 'SITE-BUILDER', 'UzzBIM', 'NutriTrain', 'OUTRO']).optional().nullable(),
  project_label: z.string().trim().optional().nullable(),
  preferred_channel: z.enum(['presencial', 'videochamada', 'telefone', 'whatsapp', 'email']).optional().nullable(),
  general_sentiment: z.enum(['Positivo', 'Neutro', 'Negativo']).optional().nullable(),
  lead_source: z.enum(['indicacao', 'linkedin', 'evento', 'cold-outreach', 'inbound', 'parceiro', 'outro']).optional().nullable(),
  icp_classification: z.enum(['hot', 'warm', 'cold', 'future']).optional().nullable(),
  business_context: z.string().trim().optional().nullable(),
  lead_daily_volume: z.number().int().min(0).optional().nullable(),
  stakeholders_json: z.array(z.unknown()).optional(),
  bant_snapshot: z.record(z.string(), z.unknown()).optional(),
  fit_snapshot: z.record(z.string(), z.unknown()).optional(),
  last_contact_date: z.string().trim().optional().nullable(),
  tags: z.array(z.string()).optional(),
  notes: z.string().trim().optional().nullable(),
  onboarded_at: z.string().trim().optional(),
}).strict();

export async function GET(
  _request: Request,
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

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const { error: authError } = await requireTenant(supabase, {
      tenantId: project.tenant_id,
    });
    if (authError) return authError;

    const { data, error } = await supabase
      .from('uzzapp_clients')
      .select('*')
      .eq('tenant_id', project.tenant_id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

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

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const { error: authError } = await requireTenant(supabase, {
      tenantId: project.tenant_id,
    });
    if (authError) return authError;

    const body = await request.json();
    const parsed = createClientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const payload = parsed.data;
    const { data, error } = await supabase
      .from('uzzapp_clients')
      .insert({
        tenant_id: project.tenant_id,
        name: payload.name,
        legal_name: payload.legal_name ?? null,
        cnpj: payload.cnpj ?? null,
        company: payload.company ?? null,
        segment: payload.segment ?? null,
        company_size: payload.company_size ?? null,
        city: payload.city ?? null,
        state: payload.state ?? null,
        address_full: payload.address_full ?? null,
        website: payload.website ?? null,
        phone: payload.phone ?? null,
        email: payload.email ?? null,
        main_contact_name: payload.main_contact_name ?? null,
        main_contact_role: payload.main_contact_role ?? null,
        whatsapp_business: payload.whatsapp_business ?? null,
        plan: payload.plan ?? null,
        status: payload.status ?? 'trial',
        funnel_stage: payload.funnel_stage ?? null,
        negotiation_status: payload.negotiation_status ?? null,
        closing_probability: payload.closing_probability ?? null,
        priority: payload.priority ?? null,
        potential_value: payload.potential_value ?? null,
        monthly_fee_value: payload.monthly_fee_value ?? null,
        setup_fee_value: payload.setup_fee_value ?? null,
        next_interaction_date: payload.next_interaction_date ?? null,
        next_action_deadline: payload.next_action_deadline ?? null,
        sales_owner_id: payload.sales_owner_id ?? null,
        followup_owner_id: payload.followup_owner_id ?? null,
        technical_owner_id: payload.technical_owner_id ?? null,
        product_focus: payload.product_focus ?? null,
        project_label: payload.project_label ?? null,
        preferred_channel: payload.preferred_channel ?? null,
        general_sentiment: payload.general_sentiment ?? null,
        lead_source: payload.lead_source ?? null,
        icp_classification: payload.icp_classification ?? null,
        business_context: payload.business_context ?? null,
        lead_daily_volume: payload.lead_daily_volume ?? null,
        stakeholders_json: payload.stakeholders_json ?? [],
        bant_snapshot: payload.bant_snapshot ?? {},
        fit_snapshot: payload.fit_snapshot ?? {},
        last_contact_date: payload.last_contact_date ?? null,
        tags: payload.tags ?? [],
        notes: payload.notes ?? null,
        onboarded_at: payload.onboarded_at ?? new Date().toISOString().slice(0, 10),
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
