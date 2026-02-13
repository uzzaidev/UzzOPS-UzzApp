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

function previousMonth(month: string) {
  const [year, monthStr] = month.split('-').map(Number);
  const d = new Date(Date.UTC(year, monthStr - 2, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
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
    const currentMonth = month ?? defaultMonth;
    const prevMonth = previousMonth(currentMonth);
    const range = monthRange(currentMonth);
    const prevRange = monthRange(prevMonth);

    const baseQuery = (supabase as any)
      .from('marketing_publications')
      .select(`
        id, channel, status, scheduled_date, published_at,
        content_piece:marketing_content_pieces(id, content_type, project_id)
      `)
      .eq('tenant_id', membership.tenant_id);

    const [{ data: currentData, error: currentError }, { data: prevData, error: prevError }, { data: assetsData, error: assetsError }] =
      await Promise.all([
        baseQuery.gte('scheduled_date', range.from).lte('scheduled_date', range.to),
        (supabase as any)
          .from('marketing_publications')
          .select(`
            id, channel, status, scheduled_date, published_at,
            content_piece:marketing_content_pieces(id, content_type, project_id)
          `)
          .eq('tenant_id', membership.tenant_id)
          .gte('scheduled_date', prevRange.from)
          .lte('scheduled_date', prevRange.to),
        (supabase as any)
          .from('marketing_assets')
          .select('asset_type, content_piece:marketing_content_pieces(project_id)')
          .eq('tenant_id', membership.tenant_id),
      ]);

    if (currentError || prevError || assetsError) {
      return NextResponse.json(
        { error: currentError?.message ?? prevError?.message ?? assetsError?.message },
        { status: 500 }
      );
    }

    let currentItems = (currentData ?? []) as any[];
    let prevItems = (prevData ?? []) as any[];
    let assetItems = (assetsData ?? []) as any[];

    if (projectId) {
      currentItems = currentItems.filter((i) => i.content_piece?.project_id === projectId);
      prevItems = prevItems.filter((i) => i.content_piece?.project_id === projectId);
      assetItems = assetItems.filter((i) => i.content_piece?.project_id === projectId);
    }

    const currentTotal = currentItems.length;
    const prevTotal = prevItems.length;
    const postsDeltaPct = prevTotal > 0 ? Number((((currentTotal - prevTotal) / prevTotal) * 100).toFixed(2)) : null;

    const published = currentItems.filter((i) => i.status === 'published');
    const publishedOnTime = published.filter((i) => {
      if (!i.published_at) return false;
      const publishedDate = new Date(i.published_at).toISOString().slice(0, 10);
      return publishedDate <= i.scheduled_date;
    }).length;
    const publicationOnTimeRate = published.length > 0 ? Number(((publishedOnTime / published.length) * 100).toFixed(2)) : null;

    const byChannel: Record<string, number> = {};
    const byType: Record<string, number> = {};
    for (const item of currentItems) {
      byChannel[item.channel] = (byChannel[item.channel] ?? 0) + 1;
      const t = item.content_piece?.content_type ?? 'unknown';
      byType[t] = (byType[t] ?? 0) + 1;
    }

    const assetsByType: Record<string, number> = {};
    for (const asset of assetItems) {
      assetsByType[asset.asset_type] = (assetsByType[asset.asset_type] ?? 0) + 1;
    }

    return NextResponse.json({
      data: {
        month: currentMonth,
        previous_month: prevMonth,
        posts_current: currentTotal,
        posts_previous: prevTotal,
        posts_delta_pct: postsDeltaPct,
        publication_on_time_rate: publicationOnTimeRate,
        by_channel: byChannel,
        by_type: byType,
        assets_by_type: assetsByType,
      },
    });
  } catch (error) {
    console.error('Error fetching marketing dashboard:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
