'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Clock, LogOut, RefreshCw } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';

export default function PendingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const checkStatus = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('company_members')
      .select('status, tenant:tenants(name)')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      const tenant = data.tenant as unknown as { name: string } | null;
      if (tenant?.name) setCompanyName(tenant.name);

      if (data.status === 'active') {
        router.push('/projects');
        router.refresh();
      }
    }
  }, [supabase, router]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  async function handleCheck() {
    setChecking(true);
    await checkStatus();
    setChecking(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-uzzai-primary/10 via-white to-uzzai-secondary/10 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="pt-10 pb-8 text-center space-y-6">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-10 h-10 text-amber-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Aguardando Aprovação</h1>
            <p className="text-muted-foreground">
              Sua conta foi criada com sucesso!
              {companyName ? (
                <> Um administrador de <strong>{companyName}</strong> precisa aprovar seu acesso.</>
              ) : (
                <> Um administrador precisa aprovar seu acesso antes de você entrar no sistema.</>
              )}
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            <p className="font-medium mb-1">O que acontece agora?</p>
            <ul className="text-left space-y-1 list-disc list-inside">
              <li>O admin receberá uma notificação</li>
              <li>Após aprovação, você poderá fazer login normalmente</li>
              <li>Clique em &quot;Verificar aprovação&quot; para checar seu status</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="default"
              className="w-full gap-2"
              onClick={handleCheck}
              disabled={checking}
            >
              <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
              {checking ? 'Verificando...' : 'Verificar aprovação'}
            </Button>

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Sair e voltar para o login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
