import { BarChart3 } from 'lucide-react';
import { CrmDashboardContent } from '@/components/clients/crm-dashboard-content';

export default async function CrmDashboardPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
          <BarChart3 className="h-5 w-5 text-emerald-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">CRM Dashboard</h1>
          <p className="text-sm text-slate-500">Visao executiva de pipeline, etapas e prioridade de clientes.</p>
        </div>
      </div>

      <CrmDashboardContent projectId={projectId} />
    </div>
  );
}
