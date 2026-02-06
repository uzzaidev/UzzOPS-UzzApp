import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const supabase = await createClient();

    // Filtros opcionais
    const version = searchParams.get('version');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');
    const projectId = searchParams.get('projectId');

    // Query base
    let query = supabase
      .from('features')
      .select(`
        *,
        project:projects(id, code, name)
      `)
      .order('created_at', { ascending: false });

    // Aplicar filtros
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

    // Validação básica
    if (!body.code || !body.name || !body.category || !body.project_id || !body.tenant_id) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: code, name, category, project_id, tenant_id' },
        { status: 400 }
      );
    }

    const { data: feature, error } = await supabase
      .from('features')
      .insert({
        tenant_id: body.tenant_id,
        project_id: body.project_id,
        code: body.code,
        name: body.name,
        description: body.description || null,
        category: body.category,
        version: body.version || 'MVP',
        status: body.status || 'backlog',
        priority: body.priority || 'P2',
        moscow: body.moscow || null,
        gut_g: body.gut_g || null,
        gut_u: body.gut_u || null,
        gut_t: body.gut_t || null,
        responsible: body.responsible || null,
        due_date: body.due_date || null,
        story_points: body.story_points || null,
        business_value: body.business_value || null,
        work_effort: body.work_effort || null,
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
