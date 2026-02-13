import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { z } from 'zod';

const updateCampaignSchema = z
  .object({
    project_id: z.string().uuid().nullable().optional(),
    name: z.string().trim().min(1).max(150).optional(),
    description: z.string().nullable().optional(),
    objective: z.string().trim().max(120).nullable().optional(),
    start_date: z.string().nullable().optional(),
    end_date: z.string().nullable().optional(),
    status: z.enum(['active', 'draft', 'completed', 'archived']).optional(),
    color: z.string().trim().min(4).max(20).optional(),
  })
  .strict();

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { membership, error: authError } = await requireTenant(supabase);
    if (authError || !membership) return authError;

    const { data, error } = await (supabase as any)
      .from('marketing_campaigns')
      .select('*, project:projects(id, name, code)')
      .eq('tenant_id', membership.tenant_id)
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Campanha nao encontrada' }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { membership, error: authError } = await requireTenant(supabase);
    if (authError || !membership) return authError;

    const body = await request.json();
    const parsed = updateCampaignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload invalido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data, error } = await (supabase as any)
      .from('marketing_campaigns')
      .update(parsed.data)
      .eq('tenant_id', membership.tenant_id)
      .eq('id', id)
      .select('*, project:projects(id, name, code)')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
