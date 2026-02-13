import { createClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/tenant';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const createRiskSchema = z.object({
  project_id: z.string().uuid(),
  public_id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  description: z.string().nullable().optional(),
  gut_g: z.number().int().min(1).max(5),
  gut_u: z.number().int().min(1).max(5),
  gut_t: z.number().int().min(1).max(5),
  status: z.enum(['identified', 'analyzing', 'mitigated', 'accepted', 'resolved']).optional(),
  mitigation_plan: z.string().nullable().optional(),
  owner_id: z.string().uuid().nullable().optional(),
});

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { membership, error: authError } = await requireTenant(supabase);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const projectId = searchParams.get('project_id');
    const search = searchParams.get('search');

    let query = supabase
      .from('risks')
      .select(`
        *,
        project:projects(id, code, name),
        owner:team_members(id, name, email)
      `)
      .eq('tenant_id', membership!.tenant_id)
      .order('gut_score', { ascending: false });

    if (projectId) query = query.eq('project_id', projectId);
    if (status) query = query.in('status', status.split(','));
    if (severity) query = query.in('severity_label', severity.split(','));
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,public_id.ilike.%${search}%`);

    const { data: risks, error } = await query;

    if (error) {
      console.error('Error fetching risks:', error);
      return NextResponse.json({ error: 'Erro ao buscar riscos' }, { status: 500 });
    }

    return NextResponse.json({ data: risks, total: risks?.length || 0 });
  } catch (error) {
    console.error('Error fetching risks:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { membership, error: authError } = await requireTenant(supabase);
    if (authError) return authError;

    const body = await request.json();
    const parsed = createRiskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const payload = parsed.data;

    const { data: risk, error } = await supabase
      .from('risks')
      .insert({
        tenant_id: membership!.tenant_id,
        project_id: payload.project_id,
        public_id: payload.public_id,
        title: payload.title,
        description: payload.description ?? null,
        gut_g: payload.gut_g,
        gut_u: payload.gut_u,
        gut_t: payload.gut_t,
        status: payload.status ?? 'identified',
        mitigation_plan: payload.mitigation_plan ?? null,
        owner_id: payload.owner_id ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating risk:', error);
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Código do risco já existe. Use um código único.' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: risk }, { status: 201 });
  } catch (error) {
    console.error('Error creating risk:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
