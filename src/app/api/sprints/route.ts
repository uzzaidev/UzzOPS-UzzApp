import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/sprints?project_id=xxx
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('project_id');

        if (!projectId) {
            return NextResponse.json(
                { error: 'project_id é obrigatório' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        const { data: sprints, error } = await supabase
            .from('sprints')
            .select('*')
            .eq('project_id', projectId)
            .order('start_date', { ascending: false });

        if (error) {
            console.error('Error fetching sprints:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: sprints });
    } catch (error) {
        console.error('Error in GET /api/sprints:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

// POST /api/sprints
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        // Validações básicas
        if (!body.tenant_id || !body.project_id || !body.code || !body.name || !body.sprint_goal || !body.start_date || !body.end_date) {
            return NextResponse.json(
                { error: 'Campos obrigatórios: tenant_id, project_id, code, name, sprint_goal, start_date, end_date' },
                { status: 400 }
            );
        }

        // Validar Sprint Goal mínimo 10 caracteres
        if (body.sprint_goal && body.sprint_goal.trim().length < 10) {
            return NextResponse.json(
                { error: 'Sprint Goal deve ter no mínimo 10 caracteres' },
                { status: 400 }
            );
        }

        // Validar duração (1-4 semanas)
        if (body.duration_weeks && (body.duration_weeks < 1 || body.duration_weeks > 4)) {
            return NextResponse.json(
                { error: 'Duração deve ser entre 1 e 4 semanas' },
                { status: 400 }
            );
        }

        // Validar datas
        const startDate = new Date(body.start_date);
        const endDate = new Date(body.end_date);

        if (startDate >= endDate) {
            return NextResponse.json(
                { error: 'Data de início deve ser anterior à data de término' },
                { status: 400 }
            );
        }

        // Verificar código único no projeto
        const { data: existing } = await supabase
            .from('sprints')
            .select('id')
            .eq('project_id', body.project_id)
            .eq('code', body.code)
            .single();

        if (existing) {
            return NextResponse.json(
                { error: `Código ${body.code} já existe neste projeto` },
                { status: 400 }
            );
        }

        // Se status for "active", desativar outros sprints ativos
        if (body.status === 'active') {
            await supabase
                .from('sprints')
                .update({ status: 'completed' })
                .eq('project_id', body.project_id)
                .eq('status', 'active');
        }

        // Criar sprint
        const { data: sprint, error } = await supabase
            .from('sprints')
            .insert({
                tenant_id: body.tenant_id,
                project_id: body.project_id,
                code: body.code,
                name: body.name,
                sprint_goal: body.sprint_goal,
                duration_weeks: body.duration_weeks || 2,
                start_date: body.start_date,
                end_date: body.end_date,
                status: body.status || 'planned',
                capacity_total: body.capacity_total || null,
                velocity_target: body.velocity_target || null,
                velocity_actual: body.velocity_actual || 0,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating sprint:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: sprint }, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/sprints:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
