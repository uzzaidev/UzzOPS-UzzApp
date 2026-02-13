import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireTenant } from '@/lib/tenant';

export async function GET(
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

    const { error: authError } = await requireTenant(supabase, {
      tenantId: projectTenant.tenant_id,
    });
    if (authError) return authError;

    const progressTable = (supabase as any).from('project_progress_snapshots');
    const settingsTable = (supabase as any).from('project_progress_settings');

    const [snapshotRes, settingsRes] = await Promise.all([
      progressTable
        .select('*')
        .eq('tenant_id', projectTenant.tenant_id)
        .eq('project_id', projectId)
        .order('snapshot_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      settingsTable
        .select('*')
        .eq('tenant_id', projectTenant.tenant_id)
        .eq('project_id', projectId)
        .maybeSingle(),
    ]);

    if (snapshotRes.error) {
      return NextResponse.json({ error: snapshotRes.error.message }, { status: 500 });
    }

    if (settingsRes.error && settingsRes.error.code !== 'PGRST116') {
      return NextResponse.json({ error: settingsRes.error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        projectId,
        tenantId: projectTenant.tenant_id,
        latestSnapshot: snapshotRes.data ?? null,
        settings: settingsRes.data ?? null,
      },
    });
  } catch (error) {
    console.error('Error fetching progress details:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
