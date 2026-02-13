import { createClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/tenant';
import { resolveOrProvisionTeamMember } from '@/lib/team-member';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const createDailyLogSchema = z.object({
  projectId: z.string().uuid(),
  sprintId: z.string().uuid().nullable().optional(),
  logDate: z.string().date().optional(),
  whatDidYesterday: z.string().trim().min(1),
  whatWillDoToday: z.string().trim().min(1),
  impediments: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { user, membership, error: authError } = await requireTenant(supabase);
    if (authError || !user || !membership) return authError;

    const json = await request.json();
    const parsed = createDailyLogSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload invalido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const body = parsed.data;
    const member = await resolveOrProvisionTeamMember(supabase, user, membership);

    if (!member) {
      return NextResponse.json(
        { error: 'Usuario nao esta vinculado a team_members ativo neste tenant.' },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from('daily_scrum_logs')
      .upsert(
        {
          project_id: body.projectId,
          sprint_id: body.sprintId || null,
          team_member_id: member.id,
          log_date: body.logDate || new Date().toISOString().split('T')[0],
          what_did_yesterday: body.whatDidYesterday,
          what_will_do_today: body.whatWillDoToday,
          impediments: body.impediments || [],
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'team_member_id,log_date' }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
