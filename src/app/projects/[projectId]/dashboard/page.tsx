import { DashboardContent } from '@/components/dashboard/dashboard-content';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();

  const { error } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
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

  return <DashboardContent projectId={projectId} />;
}
