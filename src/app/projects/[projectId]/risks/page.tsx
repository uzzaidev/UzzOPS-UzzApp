import { RisksTable } from '@/components/risks/risks-table';

export default async function RisksPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Riscos</h1>
        <p className="text-gray-500 mt-1">
          Gerencie os riscos do projeto com matriz GUT (Gravidade × Urgência × Tendência)
        </p>
      </div>

      <RisksTable projectId={projectId} />
    </div>
  );
}
