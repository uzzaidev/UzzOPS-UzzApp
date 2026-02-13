import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireTenant } from '@/lib/tenant';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { error: authError } = await requireTenant(supabase);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const sprintId = searchParams.get('sprintId');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('daily_scrum_logs')
      .select(`
        *,
        team_member:team_members(id, name, avatar_url),
        sprint:sprints(id, name)
      `)
      .eq('project_id', id)
      .order('log_date', { ascending: false })
      .limit(limit);

    if (sprintId) {
      query = query.eq('sprint_id', sprintId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
