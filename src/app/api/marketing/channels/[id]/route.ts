import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireAdmin, requireTenant } from '@/lib/tenant';
import { z } from 'zod';

const updateChannelSchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    color: z.string().trim().min(4).max(20).optional(),
    icon_key: z.string().trim().max(40).nullable().optional(),
    profile_url: z.string().url().nullable().optional(),
    is_active: z.boolean().optional(),
  })
  .strict();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { membership, error: authError } = await requireAdmin(supabase);
    if (authError || !membership) return authError;

    const body = await request.json();
    const parsed = updateChannelSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload invalido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data, error } = await (supabase as any)
      .from('marketing_channels')
      .update(parsed.data)
      .eq('tenant_id', membership.tenant_id)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error updating channel:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

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
      .from('marketing_channels')
      .select('*')
      .eq('tenant_id', membership.tenant_id)
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Canal nao encontrado' }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching channel:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
