import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/tenant';

const updateClientSchema = z.object({
  name: z.string().trim().min(1).optional(),
  legal_name: z.string().trim().nullable().optional(),
  cnpj: z.string().trim().nullable().optional(),
  company: z.string().trim().nullable().optional(),
  segment: z.string().trim().nullable().optional(),
  company_size: z.enum(['micro', 'pequena', 'media', 'grande']).nullable().optional(),
  city: z.string().trim().nullable().optional(),
  state: z.string().trim().nullable().optional(),
  address_full: z.string().trim().nullable().optional(),
  website: z.string().trim().nullable().optional(),
  phone: z.string().trim().nullable().optional(),
  email: z.string().trim().email().nullable().optional(),
  main_contact_name: z.string().trim().nullable().optional(),
  main_contact_role: z.string().trim().nullable().optional(),
  whatsapp_business: z.string().trim().nullable().optional(),
  plan: z.enum(['starter', 'pro', 'enterprise', 'custom']).nullable().optional(),
  status: z.enum(['active', 'trial', 'paused', 'churned']).optional(),
  funnel_stage: z.enum([
    'lead-novo', 'qualificado', 'proposta', 'negociacao',
    'fechado', 'onboarding', 'cliente-ativo', 'stand-by', 'perdido',
  ]).nullable().optional(),
  negotiation_status: z.enum([
    'Em Andamento', 'Stand-by', 'Fechado', 'Perdido', 'Cancelado',
  ]).nullable().optional(),
  closing_probability: z.number().int().min(0).max(100).nullable().optional(),
  priority: z.enum(['critica', 'alta', 'media', 'baixa']).nullable().optional(),
  potential_value: z.number().nonnegative().nullable().optional(),
  monthly_fee_value: z.number().nonnegative().nullable().optional(),
  setup_fee_value: z.number().nonnegative().nullable().optional(),
  next_interaction_date: z.string().trim().nullable().optional(),
  next_action_deadline: z.string().trim().nullable().optional(),
  sales_owner_id: z.string().uuid().nullable().optional(),
  followup_owner_id: z.string().uuid().nullable().optional(),
  technical_owner_id: z.string().uuid().nullable().optional(),
  product_focus: z.enum(['CHATBOT', 'SITE-BUILDER', 'UzzBIM', 'NutriTrain', 'OUTRO']).nullable().optional(),
  project_label: z.string().trim().nullable().optional(),
  preferred_channel: z.enum(['presencial', 'videochamada', 'telefone', 'whatsapp', 'email']).nullable().optional(),
  general_sentiment: z.enum(['Positivo', 'Neutro', 'Negativo']).nullable().optional(),
  lead_source: z.enum(['indicacao', 'linkedin', 'evento', 'cold-outreach', 'inbound', 'parceiro', 'outro']).nullable().optional(),
  icp_classification: z.enum(['hot', 'warm', 'cold', 'future']).nullable().optional(),
  business_context: z.string().trim().nullable().optional(),
  lead_daily_volume: z.number().int().min(0).nullable().optional(),
  stakeholders_json: z.array(z.unknown()).optional(),
  bant_snapshot: z.record(z.unknown()).optional(),
  fit_snapshot: z.record(z.unknown()).optional(),
  last_contact_date: z.string().trim().nullable().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().trim().nullable().optional(),
  onboarded_at: z.string().trim().nullable().optional(),
}).strict();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: current } = await supabase
      .from('uzzapp_clients')
      .select('id, tenant_id')
      .eq('id', id)
      .single();

    if (!current) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const { error: authError } = await requireTenant(supabase, {
      tenantId: current.tenant_id,
    });
    if (authError) return authError;

    const body = await request.json();
    const parsed = updateClientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updates = parsed.data;
    const { data, error } = await supabase
      .from('uzzapp_clients')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: current } = await supabase
      .from('uzzapp_clients')
      .select('*')
      .eq('id', id)
      .single();

    if (!current) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const { error: authError } = await requireTenant(supabase, {
      tenantId: current.tenant_id,
    });
    if (authError) return authError;

    return NextResponse.json({ data: current });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const url = new URL(request.url);
    const hardDelete = url.searchParams.get('hard') === 'true';

    const { data: current } = await supabase
      .from('uzzapp_clients')
      .select('id, tenant_id')
      .eq('id', id)
      .single();

    if (!current) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const { error: authError } = await requireTenant(supabase, {
      tenantId: current.tenant_id,
    });
    if (authError) return authError;

    const { error } = hardDelete
      ? await supabase
          .from('uzzapp_clients')
          .delete()
          .eq('id', id)
      : await supabase
          .from('uzzapp_clients')
          .update({
            status: 'churned',
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
