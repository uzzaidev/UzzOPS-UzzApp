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
    const { error: authError } = await requireTenant(supabase);
    if (authError) return authError;

    const [clustersRes, featuresRes, dependenciesRes] = await Promise.all([
      supabase
        .from('cluster_summary')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true }),
      supabase
        .from('features')
        .select(`
          *,
          feature_cluster_members(cluster_id, position_x, position_y)
        `)
        .eq('project_id', projectId)
        .order('code', { ascending: true }),
      supabase
        .from('feature_dependencies')
        .select('*')
        .eq('project_id', projectId),
    ]);

    if (clustersRes.error) return NextResponse.json({ error: clustersRes.error.message }, { status: 500 });
    if (featuresRes.error) return NextResponse.json({ error: featuresRes.error.message }, { status: 500 });
    if (dependenciesRes.error) return NextResponse.json({ error: dependenciesRes.error.message }, { status: 500 });

    const features = (featuresRes.data ?? []).map((f) => {
      const member = f.feature_cluster_members?.[0];
      return {
        ...f,
        cluster_id: member?.cluster_id ?? null,
        cluster_position_x: member?.position_x ?? 0,
        cluster_position_y: member?.position_y ?? 0,
      };
    });

    return NextResponse.json({
      data: {
        clusters: clustersRes.data ?? [],
        features,
        dependencies: dependenciesRes.data ?? [],
      },
    });
  } catch (error) {
    console.error('Error fetching backlog map:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
