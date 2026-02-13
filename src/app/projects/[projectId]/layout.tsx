import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/shared/sidebar';
import { Topbar } from '@/components/shared/topbar';
import { TenantContextSync } from '@/components/shared/tenant-context-sync';

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from('projects')
    .select('id, name, code, tenant_id')
    .eq('id', projectId)
    .single();

  if (!project) {
    notFound();
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <TenantContextSync tenantId={project.tenant_id} />
      <Sidebar projectId={project.id} projectName={project.name} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar projectId={project.id} projectName={project.name} />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
