import { FeaturesTable } from '@/components/features/features-table';
import { createClient } from '@/lib/supabase/server';

export default async function FeaturesPage() {
  const supabase = await createClient();

  // Buscar projeto UzzApp pelo código
  const { data: project } = await supabase
    .from('projects')
    .select('id, code, name')
    .eq('code', 'UZZAPP')
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Features</h1>
        <p className="text-gray-500 mt-1">
          Gerencie todas as features do projeto UzzApp
        </p>
      </div>

      <FeaturesTable projectId={project?.id} />
    </div>
  );
}
