import { useQuery } from '@tanstack/react-query';
import type { ProjectOverview } from '@/types';

export function useProjectOverview(projectId: string) {
  return useQuery<ProjectOverview>({
    queryKey: ['project-overview', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/overview`);
      if (!res.ok) {
        throw new Error('Falha ao buscar overview do projeto');
      }
      return res.json();
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });
}
