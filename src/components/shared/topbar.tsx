import { UserMenu } from './user-menu';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ArrowLeftRight } from 'lucide-react';

interface TopbarProps {
  projectId?: string;
  projectName?: string;
}

export async function Topbar({ projectId, projectName }: TopbarProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="h-16 border-b bg-white px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            {projectName ?? 'Sistema de Gerenciamento'}
          </h2>
          <p className="text-sm text-gray-500">UzzOps — Plataforma de Gestão</p>
        </div>
        {projectId && (
          <Link
            href="/projects"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors border border-gray-200 hover:border-gray-300 rounded-md px-2 py-1"
          >
            <ArrowLeftRight className="w-3 h-3" />
            Trocar
          </Link>
        )}
      </div>

      <div className="flex items-center gap-4">
        <UserMenu
          user={{
            email: user?.email,
            name: user?.user_metadata?.name || user?.email?.split('@')[0],
          }}
        />
      </div>
    </header>
  );
}
