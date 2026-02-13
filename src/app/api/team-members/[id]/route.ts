import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/tenant';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const updateTeamMemberSchema = z.object({
  status: z.enum(['active', 'pending', 'inactive']).optional(),
  permission_level: z.enum(['admin', 'member']).optional(),
  name: z.string().trim().min(1).optional(),
  role: z.string().trim().min(1).optional(),
  department: z.string().nullable().optional(),
  allocation_percent: z.number().int().min(0).max(100).optional(),
}).strict();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { error: authError } = await requireAdmin(supabase);
    if (authError) return authError;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateTeamMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const payload = parsed.data;

    const updates: Record<string, unknown> = {
      ...payload,
      updated_at: new Date().toISOString(),
    };

    if (payload.status === 'active') updates.is_active = true;
    if (payload.status === 'inactive') updates.is_active = false;

    const { data, error } = await supabase
      .from('team_members')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Keep company_members aligned with approval flow from team_members.
    if (data?.user_id && (payload.status || payload.permission_level)) {
      const companyUpdates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (payload.status) {
        companyUpdates.status = payload.status;
        if (payload.status === 'active') {
          companyUpdates.joined_at = new Date().toISOString();
        }
      }

      if (payload.permission_level) {
        companyUpdates.role = payload.permission_level === 'admin' ? 'admin' : 'member';
      }

      const { error: companyError } = await supabase
        .from('company_members')
        .upsert(
          {
            user_id: data.user_id,
            tenant_id: data.tenant_id,
            role: (companyUpdates.role as string | undefined) ?? 'member',
            status: (companyUpdates.status as string | undefined) ?? 'pending',
            joined_at: (companyUpdates.joined_at as string | undefined) ?? null,
            updated_at: companyUpdates.updated_at as string,
          },
          { onConflict: 'user_id,tenant_id' }
        );

      if (companyError) {
        return NextResponse.json(
          { error: `team_members updated but company_members sync failed: ${companyError.message}` },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { error: authError } = await requireAdmin(supabase);
    if (authError) return authError;

    const { id } = await params;
    const { error } = await supabase
      .from('team_members')
      .update({ status: 'inactive', is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
