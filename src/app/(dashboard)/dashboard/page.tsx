import { DashboardContent } from '@/components/dashboard/dashboard-content';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Buscar projeto UzzApp pelo código
  const { data: project, error } = await supabase
    .from('projects')
    .select('id, code, name')
    .eq('code', 'UZZAPP')
    .single();

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600 font-semibold">Erro ao buscar projeto:</p>
            <pre className="mt-2 text-sm text-red-800 bg-red-100 p-3 rounded">
              {JSON.stringify(error, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-yellow-800">Projeto UzzApp não encontrado no banco de dados.</p>
            <p className="text-sm text-yellow-700 mt-2">
              Certifique-se de que executou o seed.sql
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('[Dashboard Page] Project found:', project);

  return <DashboardContent projectId={project.id} />;
}
