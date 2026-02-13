import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { z } from 'zod';

const createCampaignSchema = z.object({
  project_id: z.string().uuid().nullable().optional(),
  name: z.string().trim().min(1).max(150),
  description: z.string().nullable().optional(),
  objective: z.string().trim().max(120).nullable().optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  status: z.enum(['active', 'draft', 'completed', 'archived']).optional(),
  color: z.string().trim().min(4).max(20).optional(),
});

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { membership, error: authError } = await requireTenant(supabase);
    if (authError || !membership) return authError;

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.toLowerCase().trim();

    let query = (supabase as any)
      .from('marketing_campaigns')
      .select('*, project:projects(id, name, code)')
      .eq('tenant_id', membership.tenant_id)
      .order('created_at', { ascending: false });

    if (projectId) query = query.eq('project_id', projectId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let items = (data ?? []) as any[];
    if (search) {
      items = items.filter((item) =>
        [item.name ?? '', item.description ?? '', item.objective ?? '']
          .join(' ')
          .toLowerCase()
          .includes(search)
      );
    }

    return NextResponse.json({ data: items });
  } catch (error) {
    console.error('Error listing campaigns:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { user, membership, error: authError } = await requireTenant(supabase);
    if (authError || !membership || !user) return authError;

    const body = await request.json();
    const parsed = createCampaignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload invalido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const payload = parsed.data;

    const { data, error } = await (supabase as any)
      .from('marketing_campaigns')
      .insert({
        tenant_id: membership.tenant_id,
        project_id: payload.project_id ?? null,
        name: payload.name,
        description: payload.description ?? null,
        objective: payload.objective ?? null,
        start_date: payload.start_date ?? null,
        end_date: payload.end_date ?? null,
        status: payload.status ?? 'draft',
        color: payload.color ?? '#3b82f6',
        created_by: user.id,
      })
      .select('*, project:projects(id, name, code)')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
