import { SprintsTable } from '@/components/sprints/sprints-table';

export default async function SprintsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sprints</h1>
          <p className="text-gray-500 mt-1">Gerencie os sprints do projeto</p>
        </div>
      </div>

      <SprintsTable projectId={projectId} />
    </div>
  );
}
