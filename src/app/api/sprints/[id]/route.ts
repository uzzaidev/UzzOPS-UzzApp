import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/sprints/:id
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const { data: sprint, error } = await supabase
            .from('sprints')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !sprint) {
            return NextResponse.json({ error: 'Sprint não encontrado' }, { status: 404 });
        }

        return NextResponse.json({ data: sprint });
    } catch (error) {
        console.error('Error fetching sprint:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

// PATCH /api/sprints/:id
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const body = await request.json();

        // Validar sprint_goal se fornecido
        if (body.sprint_goal && body.sprint_goal.trim().length < 10) {
            return NextResponse.json(
                { error: 'Sprint Goal deve ter no mínimo 10 caracteres' },
                { status: 400 }
            );
        }

        // Validar datas se fornecidas
        if (body.start_date && body.end_date) {
            const startDate = new Date(body.start_date);
            const endDate = new Date(body.end_date);

            if (startDate >= endDate) {
                return NextResponse.json(
                    { error: 'Data de início deve ser anterior à data de término' },
                    { status: 400 }
                );
            }
        }

        // Se mudando para "active", desativar outros sprints E proteger escopo
        if (body.status === 'active') {
            // Buscar project_id do sprint atual
            const { data: currentSprint } = await supabase
                .from('sprints')
                .select('project_id, status')
                .eq('id', id)
                .single();

            if (currentSprint) {
                // Desativar outros sprints ativos do mesmo projeto
                await supabase
                    .from('sprints')
                    .update({ status: 'completed' })
                    .eq('project_id', currentSprint.project_id)
                    .eq('status', 'active')
                    .neq('id', id);

                // Ativar proteção de escopo (impede add/remove features)
                body.is_protected = true;

                // Registrar started_at se ainda não foi registrado
                if (currentSprint.status !== 'active') {
                    body.started_at = new Date().toISOString();
                }
            }
        }

        // Se mudando para "completed", registrar completed_at
        if (body.status === 'completed') {
            const { data: currentSprint } = await supabase
                .from('sprints')
                .select('status')
                .eq('id', id)
                .single();

            if (currentSprint && currentSprint.status !== 'completed') {
                body.completed_at = new Date().toISOString();
            }
        }

        // Remover campos que não devem ser atualizados
        const {
            id: _id,
            tenant_id,
            project_id,
            code, // Código não pode ser alterado
            duration_weeks, // Duração não pode ser alterada após criação
            created_at,
            updated_at,
            ...updateData
        } = body;

        const { data: sprint, error } = await supabase
            .from('sprints')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating sprint:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: sprint });
    } catch (error) {
        console.error('Error updating sprint:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

// DELETE /api/sprints/:id
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        // Verificar se há features vinculadas (futuro US-005)
        // Por enquanto, permitir deleção

        const { error } = await supabase.from('sprints').delete().eq('id', id);

        if (error) {
            console.error('Error deleting sprint:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Sprint deletado com sucesso' });
    } catch (error) {
        console.error('Error deleting sprint:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
