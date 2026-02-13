import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireAdmin, requireTenant } from '@/lib/tenant';
import { z } from 'zod';

const createChannelSchema = z.object({
  name: z.string().trim().min(1).max(80),
  platform: z.enum(['instagram', 'linkedin', 'tiktok', 'youtube', 'site', 'whatsapp', 'other']),
  color: z.string().trim().min(4).max(20).optional(),
  icon_key: z.string().trim().max(40).nullable().optional(),
  profile_url: z.string().url().nullable().optional(),
  is_active: z.boolean().optional(),
});

export async function GET() {
  try {
    const supabase = await createClient();
    const { membership, error: authError } = await requireTenant(supabase);
    if (authError || !membership) return authError;

    const { data, error } = await (supabase as any)
      .from('marketing_channels')
      .select('*')
      .eq('tenant_id', membership.tenant_id)
      .order('name', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    console.error('Error listing channels:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { membership, error: authError } = await requireAdmin(supabase);
    if (authError || !membership) return authError;

    const body = await request.json();
    const parsed = createChannelSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload invalido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const payload = parsed.data;
    const { data, error } = await (supabase as any)
      .from('marketing_channels')
      .insert({
        tenant_id: membership.tenant_id,
        name: payload.name,
        platform: payload.platform,
        color: payload.color ?? '#3b82f6',
        icon_key: payload.icon_key ?? null,
        profile_url: payload.profile_url ?? null,
        is_active: payload.is_active ?? true,
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error creating channel:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
