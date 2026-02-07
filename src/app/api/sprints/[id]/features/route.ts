import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/sprints/[id]/features - Listar features vinculadas ao sprint
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: sprintId } = await params;
        const supabase = await createClient();

        // Buscar features vinculadas via sprint_features
        const { data: sprintFeatures, error } = await supabase
            .from('sprint_features')
            .select(`
                id,
                priority,
                added_at,
                feature:features (
                    id,
                    code,
                    name,
                    description,
                    status,
                    story_points,
                    priority,
                    created_at
                )
            `)
            .eq('sprint_id', sprintId)
            .order('priority', { ascending: true });

        if (error) {
            console.error('Error fetching sprint features:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Mapear para estrutura mais limpa
        const features = sprintFeatures?.map(sf => ({
            ...sf.feature,
            sprint_priority: sf.priority,
            added_to_sprint_at: sf.added_at,
            sprint_feature_id: sf.id,
        })) || [];

        return NextResponse.json({ data: features });
    } catch (error) {
        console.error('Error in GET /api/sprints/[id]/features:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

// POST /api/sprints/[id]/features - Vincular feature ao sprint
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: sprintId } = await params;
        const supabase = await createClient();
        const body = await request.json();

        console.log('[API] POST sprint features:', { sprintId, body });

        if (!body.feature_id) {
            return NextResponse.json(
                { error: 'feature_id é obrigatório' },
                { status: 400 }
            );
        }

        // Verificar se sprint existe
        const { data: sprint, error: sprintError } = await supabase
            .from('sprints')
            .select('id, status, is_protected')
            .eq('id', sprintId)
            .single();

        if (sprintError || !sprint) {
            console.error('[API] Sprint check error:', sprintError);
            return NextResponse.json(
                { error: 'Sprint não encontrado' },
                { status: 404 }
            );
        }

        // Verifica se é override
        const forceOverride = body.force_override === true;
        console.log('[API] Check protection:', { is_protected: sprint.is_protected, forceOverride });

        // PROTEÇÃO: Se sprint está protegido (ativo)
        if (sprint.is_protected) {
            if (!forceOverride) {
                return NextResponse.json(
                    {
                        error: 'Sprint ativo (escopo protegido). Confirmação necessária.',
                        code: 'SPRINT_PROTECTED'
                    },
                    { status: 403 }
                );
            }

            // Se tem override, vamos registrar a mudança
            const { error: auditError } = await supabase
                .from('sprint_scope_changes')
                .insert({
                    sprint_id: sprintId,
                    feature_id: body.feature_id,
                    action: 'ADD',
                    reason: body.reason || 'Adição forçada em sprint ativo'
                });

            if (auditError) {
                console.error('Error logging scope change:', auditError);
                // Não bloqueia a operação, mas loga o erro
            }
        }

        // Verificar se feature existe
        const { data: feature, error: featureError } = await supabase
            .from('features')
            .select('id')
            .eq('id', body.feature_id)
            .single();

        if (featureError || !feature) {
            return NextResponse.json(
                { error: 'Feature não encontrada' },
                { status: 404 }
            );
        }

        // Verificar se já está vinculada
        const { data: existing } = await supabase
            .from('sprint_features')
            .select('id')
            .eq('sprint_id', sprintId)
            .eq('feature_id', body.feature_id)
            .single();

        if (existing) {
            return NextResponse.json(
                { error: 'Feature já vinculada a este sprint' },
                { status: 400 }
            );
        }

        // Vincular feature ao sprint
        const { data: sprintFeature, error } = await supabase
            .from('sprint_features')
            .insert({
                sprint_id: sprintId,
                feature_id: body.feature_id,
                priority: body.priority || 0,
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding feature to sprint:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: sprintFeature }, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/sprints/[id]/features:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

// DELETE /api/sprints/[id]/features?feature_id=xxx - Desvincular feature do sprint
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: sprintId } = await params;
        const supabase = await createClient();

        const { searchParams } = new URL(request.url);
        const featureId = searchParams.get('feature_id');
        const forceOverride = searchParams.get('force_override') === 'true';

        if (!featureId) {
            return NextResponse.json(
                { error: 'feature_id é obrigatório' },
                { status: 400 }
            );
        }

        // Verificar se sprint existe e está protegido
        const { data: sprint } = await supabase
            .from('sprints')
            .select('id, is_protected')
            .eq('id', sprintId)
            .single();

        if (sprint?.is_protected) {
            if (!forceOverride) {
                return NextResponse.json(
                    {
                        error: 'Sprint ativo (escopo protegido). Confirmação necessária para remover.',
                        code: 'SPRINT_PROTECTED'
                    },
                    { status: 403 }
                );
            }

            // Registrar auditoria de remoção
            const { error: auditError } = await supabase
                .from('sprint_scope_changes')
                .insert({
                    sprint_id: sprintId,
                    feature_id: featureId,
                    action: 'REMOVE',
                    reason: 'Remoção forçada em sprint ativo'
                });

            if (auditError) {
                console.error('Error logging scope change remove:', auditError);
            }
        }

        // Desvincular
        const { error } = await supabase
            .from('sprint_features')
            .delete()
            .eq('sprint_id', sprintId)
            .eq('feature_id', featureId);

        if (error) {
            console.error('Error removing feature from sprint:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Feature removida do sprint com sucesso' });
    } catch (error) {
        console.error('Error in DELETE /api/sprints/[id]/features:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
