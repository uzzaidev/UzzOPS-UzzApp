import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Sprint, NewSprint, SprintUpdate } from '@/types';

// Hook: Lista de sprints de um projeto
export function useSprints(projectId?: string) {
    return useQuery<{ data: Sprint[] }>({
        queryKey: ['sprints', projectId],
        queryFn: async () => {
            if (!projectId) throw new Error('projectId é obrigatório');

            const res = await fetch(`/api/sprints?project_id=${projectId}`);
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Falha ao buscar sprints');
            }
            return res.json();
        },
        enabled: !!projectId,
    });
}

// Hook: Detalhes de um sprint específico
export function useSprint(id: string) {
    return useQuery<{ data: Sprint }>({
        queryKey: ['sprint', id],
        queryFn: async () => {
            const res = await fetch(`/api/sprints/${id}`);
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Falha ao buscar sprint');
            }
            return res.json();
        },
        enabled: !!id,
    });
}

// Hook: Criar sprint
export function useCreateSprint() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: NewSprint) => {
            const res = await fetch('/api/sprints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Falha ao criar sprint');
            }

            return res.json();
        },
        onSuccess: () => {
            // Invalidar cache de sprints e project-overview (dashboard)
            queryClient.invalidateQueries({ queryKey: ['sprints'] });
            queryClient.invalidateQueries({ queryKey: ['project-overview'] });
        },
    });
}

// Hook: Atualizar sprint
export function useUpdateSprint() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: SprintUpdate }) => {
            const res = await fetch(`/api/sprints/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Falha ao atualizar sprint');
            }

            return res.json();
        },
        onSuccess: () => {
            // Invalidar cache
            queryClient.invalidateQueries({ queryKey: ['sprints'] });
            queryClient.invalidateQueries({ queryKey: ['sprint'] });
            queryClient.invalidateQueries({ queryKey: ['project-overview'] });
        },
    });
}

// Hook: Deletar sprint
export function useDeleteSprint() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/sprints/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Falha ao deletar sprint');
            }

            return res.json();
        },
        onSuccess: () => {
            // Invalidar cache
            queryClient.invalidateQueries({ queryKey: ['sprints'] });
            queryClient.invalidateQueries({ queryKey: ['project-overview'] });
        },
    });
}

// ============================================================================
// HOOKS PARA FEATURES VINCULADAS AO SPRINT
// ============================================================================

// Hook: Buscar features vinculadas a um sprint
export function useSprintFeatures(sprintId?: string) {
    return useQuery({
        queryKey: ['sprint-features', sprintId],
        queryFn: async () => {
            if (!sprintId) throw new Error('sprintId é obrigatório');

            const res = await fetch(`/api/sprints/${sprintId}/features`);
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Falha ao buscar features do sprint');
            }
            return res.json();
        },
        enabled: !!sprintId,
    });
}

// Hook: Vincular feature a um sprint
export function useAddFeatureToSprint(sprintId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ feature_id, priority, force_override }: { feature_id: string; priority?: number; force_override?: boolean }) => {
            const res = await fetch(`/api/sprints/${sprintId}/features`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ feature_id, priority, force_override }),
            });

            if (!res.ok) {
                let errorData;
                try {
                    errorData = await res.json();
                } catch (e) {
                    errorData = { error: res.statusText };
                }

                console.error('[Hook] Error adding feature:', { status: res.status, error: JSON.stringify(errorData) });

                // Repassa o erro com código para tratamento no componente ou cria um objeto de erro padronizado
                throw {
                    status: res.status,
                    message: errorData.error || 'Erro desconhecido',
                    code: errorData.code,
                    details: errorData
                };
            }

            return res.json();
        },
        onSuccess: () => {
            // Invalidar cache de features do sprint
            queryClient.invalidateQueries({ queryKey: ['sprint-features', sprintId] });
            queryClient.invalidateQueries({ queryKey: ['sprint', sprintId] });
            queryClient.invalidateQueries({ queryKey: ['features'] });
        },
    });
}

// Hook: Remover feature de um sprint
export function useRemoveFeatureFromSprint(sprintId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ featureId, force_override }: { featureId: string; force_override?: boolean }) => {
            const queryParams = new URLSearchParams();
            queryParams.set('feature_id', featureId);
            if (force_override) queryParams.set('force_override', 'true');

            const res = await fetch(`/api/sprints/${sprintId}/features?${queryParams.toString()}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const error = await res.json();
                throw error;
            }

            return res.json();
        },
        onSuccess: () => {
            // Invalidar cache
            queryClient.invalidateQueries({ queryKey: ['sprint-features', sprintId] });
            queryClient.invalidateQueries({ queryKey: ['sprint', sprintId] });
            queryClient.invalidateQueries({ queryKey: ['features'] });
        },
    });
}
