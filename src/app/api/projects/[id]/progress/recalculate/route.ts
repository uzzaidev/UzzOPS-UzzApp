import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/tenant';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const supabase = await createClient();

    const { data: projectTenant, error: projectTenantError } = await supabase
      .from('projects')
      .select('tenant_id')
      .eq('id', projectId)
      .single();

    if (projectTenantError || !projectTenant?.tenant_id) {
      return NextResponse.json({ error: 'Projeto nao encontrado' }, { status: 404 });
    }

    const { membership, error: authError } = await requireAdmin(supabase, {
      tenantId: projectTenant.tenant_id,
    });
    if (authError) return authError;

    const { error: recalcError } = await (supabase as any).rpc('calculate_project_progress', {
      p_project_id: projectId,
      p_tenant_id: projectTenant.tenant_id,
      p_trigger_event: 'manual_admin',
    });

    if (recalcError) {
      return NextResponse.json({ error: recalcError.message }, { status: 500 });
    }

    const { data: latest, error: latestError } = await (supabase as any)
      .from('project_progress_snapshots')
      .select('*')
      .eq('tenant_id', projectTenant.tenant_id)
      .eq('project_id', projectId)
      .order('snapshot_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestError) {
      return NextResponse.json({ error: latestError.message }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        projectId,
        tenantId: projectTenant.tenant_id,
        recalculatedByRole: membership?.role ?? 'admin',
        latestSnapshot: latest ?? null,
      },
    });
  } catch (error) {
    console.error('Error recalculating progress:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
