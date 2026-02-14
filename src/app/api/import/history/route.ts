import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/tenant';

function parsePositiveInt(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return parsed;
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { membership, error: authError } = await requireTenant(supabase);
    if (authError || !membership) return authError;

    const url = new URL(request.url);
    const limit = Math.min(parsePositiveInt(url.searchParams.get('limit'), 20), 100);
    const offset = parsePositiveInt(url.searchParams.get('offset'), 0);
    const projectId = url.searchParams.get('project_id');

    let query = supabase
      .from('md_feeder_imports')
      .select(
        'id, project_id, original_filename, parse_status, items_total, items_created, items_updated, items_skipped, items_failed, created_by_name, created_at, completed_at',
        { count: 'exact' }
      )
      .eq('tenant_id', membership.tenant_id)
      .order('created_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        items: data ?? [],
        count: count ?? 0,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('Error fetching md feeder history:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

