import { FeaturesTable } from '@/components/features/features-table';

export default function FeaturesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Features</h1>
        <p className="text-gray-500 mt-1">
          Gerencie todas as features do projeto UzzApp
        </p>
      </div>

      <FeaturesTable />
    </div>
  );
}
