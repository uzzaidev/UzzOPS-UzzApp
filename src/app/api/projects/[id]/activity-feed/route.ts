import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/tenant';

type FeedItem = {
  id: string;
  module: 'dev' | 'crm' | 'marketing' | 'risk' | 'daily' | 'retro';
  title: string;
  description: string;
  at: string;
  href?: string;
};

function toIso(value: unknown) {
  if (!value) return new Date(0).toISOString();
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? new Date(0).toISOString() : d.toISOString();
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const supabase = await createClient();

    const { data: project } = await supabase
      .from('projects')
      .select('id, tenant_id')
      .eq('id', projectId)
      .single();

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const { membership, error: authError } = await requireTenant(supabase, {
      tenantId: project.tenant_id,
    });
    if (authError || !membership) return authError;

    const safe = async <T,>(
      promise: PromiseLike<{ data: T | null; error: any }>,
      fallback: T
    ): Promise<T> => {
      try {
        const { data } = await promise;
        return (data ?? fallback) as T;
      } catch {
        return fallback;
      }
    };

    const [features, risks, retros, dailies, contacts, publications] = await Promise.all([
      safe(
        supabase
          .from('features')
          .select('id, code, name, status, updated_at, created_at')
          .eq('project_id', projectId)
          .order('updated_at', { ascending: false })
          .limit(12),
        [] as Array<Record<string, any>>
      ),
      safe(
        supabase
          .from('risks')
          .select('id, title, gut_score, updated_at, created_at')
          .eq('project_id', projectId)
          .order('updated_at', { ascending: false })
          .limit(8),
        [] as Array<Record<string, any>>
      ),
      safe(
        supabase
          .from('retrospective_actions')
          .select('id, action_text, status, updated_at, created_at')
          .eq('project_id', projectId)
          .order('updated_at', { ascending: false })
          .limit(8),
        [] as Array<Record<string, any>>
      ),
      safe(
        supabase
          .from('daily_scrum_logs')
          .select('id, log_date, impediments, updated_at, created_at')
          .eq('project_id', projectId)
          .order('updated_at', { ascending: false })
          .limit(8),
        [] as Array<Record<string, any>>
      ),
      safe(
        supabase
          .from('client_contacts')
          .select('id, title, contact_subtype, status, updated_at, created_at')
          .eq('project_id', projectId)
          .order('updated_at', { ascending: false })
          .limit(8),
        [] as Array<Record<string, any>>
      ),
      safe(
        supabase
          .from('marketing_publications')
          .select('id, channel, status, updated_at, created_at, content_piece:marketing_content_pieces(project_id, title)')
          .eq('tenant_id', membership.tenant_id)
          .order('updated_at', { ascending: false })
          .limit(12),
        [] as Array<Record<string, any>>
      ),
    ]);

    const marketingItems = publications
      .filter((p) => p.content_piece?.project_id === projectId)
      .map<FeedItem>((p) => ({
        id: `mkt-${p.id}`,
        module: 'marketing',
        title: `Publicacao ${String(p.status ?? '-')}`,
        description: `${String(p.content_piece?.title ?? 'Conteudo')} (${String(p.channel ?? '-')})`,
        at: toIso(p.updated_at ?? p.created_at),
        href: `/projects/${projectId}/marketing`,
      }));

    const items: FeedItem[] = [
      ...features.map((f) => ({
        id: `dev-${f.id}`,
        module: 'dev' as const,
        title: `${String(f.code ?? 'Feature')} ${String(f.status ?? '').toUpperCase()}`,
        description: String(f.name ?? 'Feature atualizada'),
        at: toIso(f.updated_at ?? f.created_at),
        href: `/projects/${projectId}/features/${f.id}`,
      })),
      ...risks.map((r) => ({
        id: `risk-${r.id}`,
        module: 'risk' as const,
        title: `Risco GUT ${String(r.gut_score ?? '-')}`,
        description: String(r.title ?? 'Risco atualizado'),
        at: toIso(r.updated_at ?? r.created_at),
        href: `/projects/${projectId}/risks`,
      })),
      ...retros.map((r) => ({
        id: `retro-${r.id}`,
        module: 'retro' as const,
        title: `Retro ${String(r.status ?? '-')}`,
        description: String(r.action_text ?? 'Acao de retro atualizada'),
        at: toIso(r.updated_at ?? r.created_at),
        href: `/projects/${projectId}/sprints`,
      })),
      ...dailies.map((d) => {
        const impediments = Array.isArray(d.impediments) ? d.impediments.filter((x: unknown) => String(x).trim().length > 0).length : 0;
        return {
          id: `daily-${d.id}`,
          module: 'daily' as const,
          title: `Daily ${String(d.log_date ?? '-')}`,
          description: impediments > 0 ? `${impediments} impedimento(s) registrado(s)` : 'Sem impedimentos',
          at: toIso(d.updated_at ?? d.created_at),
          href: `/projects/${projectId}/daily`,
        };
      }),
      ...contacts.map((c) => ({
        id: `crm-${c.id}`,
        module: 'crm' as const,
        title: `Contato ${String(c.contact_subtype ?? '-')}`,
        description: String(c.title ?? `Status: ${String(c.status ?? '-')}`),
        at: toIso(c.updated_at ?? c.created_at),
        href: `/projects/${projectId}/clients`,
      })),
      ...marketingItems,
    ]
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, 30);

    return NextResponse.json({ data: items });
  } catch (error) {
    console.error('[Activity Feed API] unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
