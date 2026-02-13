import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { z } from 'zod';

const createPublicationSchema = z.object({
  content_piece_id: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(200).optional(),
  content_type: z.enum(['reels', 'feed', 'carrossel', 'stories', 'artigo', 'video']).optional(),
  project_id: z.string().uuid().nullable().optional(),
  channel: z.enum(['instagram', 'linkedin', 'site', 'tiktok', 'youtube', 'whatsapp']),
  scheduled_date: z.string(),
  scheduled_time: z.string().nullable().optional(),
  status: z.enum(['idea', 'draft', 'scheduled', 'published', 'cancelled']).optional(),
  caption_override: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

function getMonthRange(month: string) {
  const [year, monthStr] = month.split('-').map(Number);
  const from = new Date(Date.UTC(year, monthStr - 1, 1));
  const to = new Date(Date.UTC(year, monthStr, 0));
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

function nextCodeFromTitles(existingCount: number) {
  const n = existingCount + 1;
  return `MKT-${String(n).padStart(3, '0')}`;
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { membership, error: authError } = await requireTenant(supabase);
    if (authError || !membership) return authError;

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const month = searchParams.get('month');
    const channel = searchParams.get('channel');
    const status = searchParams.get('status');
    const contentType = searchParams.get('content_type');
    const projectId = searchParams.get('project_id');
    const contentPieceId = searchParams.get('content_piece_id');
    const search = searchParams.get('search')?.toLowerCase().trim();

    const range = month ? getMonthRange(month) : null;
    const dateFrom = from ?? range?.from;
    const dateTo = to ?? range?.to;

    let query = (supabase as any)
      .from('marketing_publications')
      .select(`
        *,
        content_piece:marketing_content_pieces(
          id, code, title, content_type, project_id, status
        )
      `)
      .eq('tenant_id', membership.tenant_id)
      .order('scheduled_date', { ascending: true });

    if (dateFrom) query = query.gte('scheduled_date', dateFrom);
    if (dateTo) query = query.lte('scheduled_date', dateTo);
    if (channel) query = query.eq('channel', channel);
    if (status) query = query.eq('status', status);
    if (contentPieceId) query = query.eq('content_piece_id', contentPieceId);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let items = (data ?? []) as any[];

    if (contentType) {
      items = items.filter((item) => item.content_piece?.content_type === contentType);
    }
    if (projectId) {
      items = items.filter((item) => item.content_piece?.project_id === projectId);
    }
    if (search) {
      items = items.filter((item) => {
        const haystack = [
          item.content_piece?.title ?? '',
          item.content_piece?.code ?? '',
          item.channel ?? '',
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(search);
      });
    }

    return NextResponse.json({ data: items });
  } catch (error) {
    console.error('Error listing marketing publications:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { user, membership, error: authError } = await requireTenant(supabase);
    if (authError || !membership || !user) return authError;

    const body = await request.json();
    const parsed = createPublicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload invalido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const payload = parsed.data;
    let contentPieceId = payload.content_piece_id ?? null;

    if (!contentPieceId) {
      if (!payload.title || !payload.content_type) {
        return NextResponse.json(
          {
            error: 'title e content_type sao obrigatorios quando content_piece_id nao for enviado',
          },
          { status: 400 }
        );
      }

      const { count } = await (supabase as any)
        .from('marketing_content_pieces')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', membership.tenant_id);

      const code = nextCodeFromTitles(count ?? 0);

      const { data: contentPiece, error: contentError } = await (supabase as any)
        .from('marketing_content_pieces')
        .insert({
          tenant_id: membership.tenant_id,
          project_id: payload.project_id ?? null,
          code,
          title: payload.title,
          content_type: payload.content_type,
          status: 'idea',
          created_by: user.id,
        })
        .select('id')
        .single();

      if (contentError || !contentPiece) {
        return NextResponse.json({ error: contentError?.message ?? 'Erro ao criar conteudo' }, { status: 500 });
      }

      contentPieceId = contentPiece.id;
    }

    const { data, error } = await (supabase as any)
      .from('marketing_publications')
      .insert({
        tenant_id: membership.tenant_id,
        content_piece_id: contentPieceId,
        channel: payload.channel,
        scheduled_date: payload.scheduled_date,
        scheduled_time: payload.scheduled_time ?? null,
        status: payload.status ?? 'scheduled',
        caption_override: payload.caption_override ?? null,
        notes: payload.notes ?? null,
        created_by: user.id,
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error creating marketing publication:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
