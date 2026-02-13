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

    // Get project's tenant_id
    const { data: project } = await supabase
      .from('projects')
      .select('tenant_id')
      .eq('id', id)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const { error: authError } = await requireTenant(supabase, {
      tenantId: project.tenant_id,
    });
    if (authError) return authError;

    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('tenant_id', project.tenant_id)
      .order('status', { ascending: true }) // pending first
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
