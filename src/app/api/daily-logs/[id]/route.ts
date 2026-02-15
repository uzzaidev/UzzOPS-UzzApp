import { createClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/tenant';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const updateDailyLogSchema = z
  .object({
    sprintId: z.string().uuid().nullable().optional(),
    logDate: z.string().date().optional(),
    whatDidYesterday: z.string().trim().min(1).optional(),
    whatWillDoToday: z.string().trim().min(1).optional(),
    impediments: z.array(z.string()).optional(),
  })
  .strict()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'Nenhum campo para atualizar foi enviado',
  });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { membership, error: authError } = await requireTenant(supabase);
    if (authError || !membership) return authError;

    const json = await request.json();
    const parsed = updateDailyLogSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload invalido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data: existing, error: existingError } = await supabase
      .from('daily_scrum_logs')
      .select('id, project_id')
      .eq('id', id)
      .maybeSingle();

    if (existingError || !existing) {
      return NextResponse.json({ error: 'Daily log nao encontrado' }, { status: 404 });
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', existing.project_id)
      .eq('tenant_id', membership.tenant_id)
      .maybeSingle();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Acesso negado para este daily log' }, { status: 403 });
    }

    const payload = parsed.data;
    const updatePayload = {
      sprint_id: payload.sprintId,
      log_date: payload.logDate,
      what_did_yesterday: payload.whatDidYesterday,
      what_will_do_today: payload.whatWillDoToday,
      impediments: payload.impediments,
      updated_at: new Date().toISOString(),
    };

    const cleanedPayload = Object.fromEntries(
      Object.entries(updatePayload).filter(([, value]) => value !== undefined)
    );

    const { data, error } = await supabase
      .from('daily_scrum_logs')
      .update(cleanedPayload)
      .eq('id', id)
      .select(
        `
        *,
        team_member:team_members(id, name, avatar_url),
        sprint:sprints(id, name)
      `
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

