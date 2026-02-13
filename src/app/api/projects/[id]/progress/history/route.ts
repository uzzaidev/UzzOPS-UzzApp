import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireTenant } from '@/lib/tenant';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const limitRaw = Number(searchParams.get('limit') ?? 30);
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(Math.trunc(limitRaw), 1), 365)
      : 30;

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
    const { data, error } = await progressTable
      .select('*')
      .eq('tenant_id', projectTenant.tenant_id)
      .eq('project_id', projectId)
      .order('snapshot_at', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        projectId,
        tenantId: projectTenant.tenant_id,
        items: data ?? [],
        count: data?.length ?? 0,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching progress history:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
