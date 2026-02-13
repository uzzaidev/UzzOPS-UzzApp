import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { z } from 'zod';

const featureCreateSchema = z.object({
  code: z.string().trim().min(1),
  name: z.string().trim().min(1),
  description: z.string().trim().nullable().optional(),
  category: z.string().trim().min(1),
  version: z.enum(['MVP', 'V1', 'V2', 'V3', 'V4']).optional(),
  status: z.enum(['backlog', 'todo', 'in_progress', 'review', 'testing', 'done', 'blocked']).optional(),
  priority: z.enum(['P0', 'P1', 'P2', 'P3']).optional(),
  moscow: z.enum(['Must', 'Should', 'Could', 'Wont']).nullable().optional(),
  gut_g: z.number().int().min(1).max(5).nullable().optional(),
  gut_u: z.number().int().min(1).max(5).nullable().optional(),
  gut_t: z.number().int().min(1).max(5).nullable().optional(),
  responsible: z.array(z.string()).nullable().optional(),
  due_date: z.string().date().nullable().optional(),
  story_points: z.number().int().min(0).nullable().optional(),
  business_value: z.number().int().min(0).nullable().optional(),
  work_effort: z.number().int().min(0).nullable().optional(),
  work_item_type: z.enum(['feature', 'bug']).optional(),
  solution_notes: z.string().trim().nullable().optional(),
  dod_custom_items: z.array(z.string().trim().min(1)).optional(),
  dod_functional: z.boolean().optional(),
  dod_tests: z.boolean().optional(),
  dod_code_review: z.boolean().optional(),
  dod_documentation: z.boolean().optional(),
  dod_deployed: z.boolean().optional(),
  dod_user_acceptance: z.boolean().optional(),
  project_id: z.string().uuid(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const supabase = await createClient();
    let scopedTenantId: string | null = null;
    if (projectId) {
      const { data: project } = await supabase
        .from('projects')
        .select('tenant_id')
        .eq('id', projectId)
        .single();
      scopedTenantId = project?.tenant_id ?? null;
    }

    const { membership, error: authError } = await requireTenant(supabase, {
      tenantId: scopedTenantId,
    });
    if (authError) return authError;

    // Filtros opcionais
    const version = searchParams.get('version');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const itemType = searchParams.get('itemType');
    const search = searchParams.get('search');
    

    // Query base
    let query = supabase
      .from('features')
      .select(`
        *,
        project:projects(id, code, name)
      `)
      .eq('tenant_id', membership!.tenant_id)
      .order('created_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (version) {
      const versions = version.split(',');
      query = query.in('version', versions);
    }

    if (status) {
      const statuses = status.split(',');
      query = query.in('status', statuses);
    }

    if (category) {
      const categories = category.split(',');
      query = query.in('category', categories);
    }

    if (priority) {
      const priorities = priority.split(',');
      query = query.in('priority', priorities);
    }

    if (itemType) {
      const itemTypes = itemType.split(',');
      query = query.in('work_item_type', itemTypes);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,code.ilike.%${search}%`);
    }

    const { data: features, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'Erro ao buscar features' }, { status: 500 });
    }

    return NextResponse.json({ data: features, total: features?.length || 0 });
  } catch (error) {
    console.error('Error fetching features:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const parsed = featureCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const payload = parsed.data;
    const { data: project } = await supabase
      .from('projects')
      .select('tenant_id')
      .eq('id', payload.project_id)
      .single();

    const { membership, error: authError } = await requireTenant(supabase, {
      tenantId: project?.tenant_id ?? null,
    });
    if (authError) return authError;

    const { data: feature, error } = await supabase
      .from('features')
      .insert({
        tenant_id: membership!.tenant_id,
        project_id: payload.project_id,
        code: payload.code,
        name: payload.name,
        description: payload.description ?? null,
        category: payload.category,
        version: payload.version ?? 'MVP',
        status: payload.status ?? 'backlog',
        priority: payload.priority ?? 'P2',
        moscow: payload.moscow ?? null,
        gut_g: payload.gut_g ?? null,
        gut_u: payload.gut_u ?? null,
        gut_t: payload.gut_t ?? null,
        responsible: payload.responsible ?? null,
        due_date: payload.due_date ?? null,
        story_points: payload.story_points ?? null,
        business_value: payload.business_value ?? null,
        work_effort: payload.work_effort ?? null,
        work_item_type: payload.work_item_type ?? 'feature',
        solution_notes: payload.solution_notes ?? null,
        dod_custom_items: payload.dod_custom_items ?? [],
        dod_functional: payload.dod_functional ?? false,
        dod_tests: payload.dod_tests ?? false,
        dod_code_review: payload.dod_code_review ?? false,
        dod_documentation: payload.dod_documentation ?? false,
        dod_deployed: payload.dod_deployed ?? false,
        dod_user_acceptance: payload.dod_user_acceptance ?? false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating feature:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: feature }, { status: 201 });
  } catch (error) {
    console.error('Error creating feature:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
