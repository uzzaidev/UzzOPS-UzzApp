import { createClient } from '@/lib/supabase/server';
import { SprintsTable } from '@/components/sprints/sprints-table';

export default async function SprintsPage() {
    const supabase = await createClient();

    // Buscar projeto UZZAPP
    const { data: project } = await supabase
        .from('projects')
        .select('id, tenant_id')
        .eq('code', 'UZZAPP')
        .single();

    const projectId = project?.id;
    const tenantId = project?.tenant_id;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Sprints</h1>
                    <p className="text-gray-500 mt-1">Gerencie os sprints do projeto UzzApp</p>
                </div>
            </div>

            <SprintsTable projectId={projectId} tenantId={tenantId} />
        </div>
    );
}
