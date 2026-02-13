import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireTenant } from '@/lib/tenant';

function monthRange(month: string) {
  const [year, monthStr] = month.split('-').map(Number);
  const from = new Date(Date.UTC(year, monthStr - 1, 1));
  const to = new Date(Date.UTC(year, monthStr, 0));
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { membership, error: authError } = await requireTenant(supabase);
    if (authError || !membership) return authError;

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const projectId = searchParams.get('project_id');

    const now = new Date();
    const defaultMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
    const range = monthRange(month ?? defaultMonth);

    const { data, error } = await (supabase as any)
      .from('marketing_publications')
      .select(`
        id, channel, status, scheduled_date,
        content_piece:marketing_content_pieces(id, content_type, project_id)
      `)
      .eq('tenant_id', membership.tenant_id)
      .gte('scheduled_date', range.from)
      .lte('scheduled_date', range.to);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let items = (data ?? []) as any[];
    if (projectId) {
      items = items.filter((i) => i.content_piece?.project_id === projectId);
    }

    const total = items.length;
    const scheduled = items.filter((i) => i.status === 'scheduled').length;
    const published = items.filter((i) => i.status === 'published').length;
    const cancelled = items.filter((i) => i.status === 'cancelled').length;

    const byChannel: Record<string, number> = {};
    const byType: Record<string, number> = {};
    for (const item of items) {
      byChannel[item.channel] = (byChannel[item.channel] ?? 0) + 1;
      const t = item.content_piece?.content_type ?? 'unknown';
      byType[t] = (byType[t] ?? 0) + 1;
    }

    return NextResponse.json({
      data: {
        month: month ?? defaultMonth,
        total,
        scheduled,
        published,
        cancelled,
        by_channel: byChannel,
        by_type: byType,
      },
    });
  } catch (error) {
    console.error('Error fetching marketing stats:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

