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

function escapeCsv(value: unknown) {
  const s = String(value ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
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
    const refMonth = month ?? defaultMonth;
    const range = monthRange(refMonth);

    const { data, error } = await (supabase as any)
      .from('marketing_publications')
      .select(`
        id, channel, status, scheduled_date, scheduled_time, published_at, external_url, notes,
        content_piece:marketing_content_pieces(id, code, title, content_type, project_id)
      `)
      .eq('tenant_id', membership.tenant_id)
      .gte('scheduled_date', range.from)
      .lte('scheduled_date', range.to)
      .order('scheduled_date', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let items = (data ?? []) as any[];
    if (projectId) {
      items = items.filter((i) => i.content_piece?.project_id === projectId);
    }

    const header = [
      'publication_id',
      'content_id',
      'content_code',
      'title',
      'content_type',
      'channel',
      'status',
      'scheduled_date',
      'scheduled_time',
      'published_at',
      'external_url',
      'notes',
    ];

    const lines = [
      header.join(','),
      ...items.map((item) =>
        [
          item.id,
          item.content_piece?.id ?? '',
          item.content_piece?.code ?? '',
          item.content_piece?.title ?? '',
          item.content_piece?.content_type ?? '',
          item.channel,
          item.status,
          item.scheduled_date,
          item.scheduled_time ?? '',
          item.published_at ?? '',
          item.external_url ?? '',
          item.notes ?? '',
        ]
          .map(escapeCsv)
          .join(',')
      ),
    ];

    const csv = lines.join('\n');
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="marketing_calendar_${refMonth}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting marketing publications:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
