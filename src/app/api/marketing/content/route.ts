import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { z } from 'zod';

const createContentSchema = z.object({
  project_id: z.string().uuid().nullable().optional(),
  campaign_id: z.string().uuid().nullable().optional(),
  title: z.string().trim().min(1).max(200),
  topic: z.string().trim().max(120).nullable().optional(),
  content_type: z.enum(['reels', 'feed', 'carrossel', 'stories', 'artigo', 'video']),
  objective: z.string().trim().max(120).nullable().optional(),
  brief: z.string().nullable().optional(),
  caption_base: z.string().nullable().optional(),
  hashtags: z.array(z.string()).optional(),
  cta: z.string().trim().max(200).nullable().optional(),
  status: z.enum(['idea', 'briefing', 'production', 'review', 'approved', 'done', 'archived']).optional(),
  responsible_id: z.string().uuid().nullable().optional(),
  due_date: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

function nextCodeFromCount(existingCount: number) {
  return `MKT-${String(existingCount + 1).padStart(3, '0')}`;
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { membership, error: authError } = await requireTenant(supabase);
    if (authError || !membership) return authError;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const contentType = searchParams.get('content_type');
    const projectId = searchParams.get('project_id');
    const search = searchParams.get('search')?.toLowerCase().trim();

    let query = (supabase as any)
      .from('marketing_content_pieces')
      .select('*, project:projects(id, name, code)')
      .eq('tenant_id', membership.tenant_id)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (contentType) query = query.eq('content_type', contentType);
    if (projectId) query = query.eq('project_id', projectId);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let items = (data ?? []) as any[];
    if (search) {
      items = items.filter((item) =>
        [item.code ?? '', item.title ?? '', item.topic ?? '', item.objective ?? '']
          .join(' ')
          .toLowerCase()
          .includes(search)
      );
    }

    return NextResponse.json({ data: items });
  } catch (error) {
    console.error('Error listing marketing content:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { user, membership, error: authError } = await requireTenant(supabase);
    if (authError || !membership || !user) return authError;

    const body = await request.json();
    const parsed = createContentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload invalido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const payload = parsed.data;

    const { count } = await (supabase as any)
      .from('marketing_content_pieces')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', membership.tenant_id);

    const code = nextCodeFromCount(count ?? 0);

    const { data, error } = await (supabase as any)
      .from('marketing_content_pieces')
      .insert({
        tenant_id: membership.tenant_id,
        project_id: payload.project_id ?? null,
        campaign_id: payload.campaign_id ?? null,
        code,
        title: payload.title,
        topic: payload.topic ?? null,
        content_type: payload.content_type,
        objective: payload.objective ?? null,
        brief: payload.brief ?? null,
        caption_base: payload.caption_base ?? null,
        hashtags: payload.hashtags ?? [],
        cta: payload.cta ?? null,
        status: payload.status ?? 'idea',
        responsible_id: payload.responsible_id ?? null,
        due_date: payload.due_date ?? null,
        notes: payload.notes ?? null,
        created_by: user.id,
      })
      .select('*, project:projects(id, name, code)')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error creating marketing content:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
