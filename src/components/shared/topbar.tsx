import { UserMenu } from './user-menu';
import { createClient } from '@/lib/supabase/server';

export async function Topbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="h-16 border-b bg-white px-6 flex items-center justify-between shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          Sistema de Gerenciamento
        </h2>
        <p className="text-sm text-gray-500">UzzApp - Chatbot WhatsApp</p>
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
