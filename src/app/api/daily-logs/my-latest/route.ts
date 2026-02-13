import { createClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/tenant';
import { resolveOrProvisionTeamMember } from '@/lib/team-member';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const querySchema = z.object({
  projectId: z.string().uuid().optional(),
});

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const parsedQuery = querySchema.safeParse({
      projectId: searchParams.get('projectId') ?? undefined,
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        { error: 'Query invalida', details: parsedQuery.error.flatten() },
        { status: 400 }
      );
    }

    const { projectId } = parsedQuery.data;
    const { user, membership, error: authError } = await requireTenant(supabase);
    if (authError || !user || !membership) return authError;

    const member = await resolveOrProvisionTeamMember(supabase, user, membership);

    if (!member) {
      return NextResponse.json(
        { error: 'Usuario nao esta vinculado a team_members ativo neste tenant.' },
        { status: 403 }
      );
    }

    let query = supabase
      .from('daily_scrum_logs')
      .select('*')
      .eq('team_member_id', member.id)
      .order('log_date', { ascending: false })
      .limit(1);

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data } = await query.maybeSingle();
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ data: null });
  }
}
