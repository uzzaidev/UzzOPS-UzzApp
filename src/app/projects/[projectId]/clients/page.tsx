import { Building2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ClientsPageContent } from '@/components/clients/clients-page-content';

export default async function ClientsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100">
          <Building2 className="h-5 w-5 text-sky-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500">
            Gestao de clientes importados e cadastrados no projeto.
          </p>
        </div>
        <div className="ml-auto">
          <Button asChild variant="outline" size="sm">
            <Link href={`/projects/${projectId}/crm-dashboard`}>Abrir CRM Dashboard</Link>
          </Button>
        </div>
      </div>

      <ClientsPageContent projectId={projectId} />
    </div>
  );
}
