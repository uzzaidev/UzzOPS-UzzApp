import { FeaturesTable } from '../../../../components/features/features-table';

export default async function FeaturesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Features/Bugs</h1>
        <p className="text-gray-500 mt-1">Gerencie itens funcionais e correcoes do projeto</p>
      </div>

      <FeaturesTable projectId={projectId} />
    </div>
  );
}
