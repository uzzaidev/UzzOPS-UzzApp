'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Calendar, Users, AlertTriangle, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: FileText, label: 'Features', href: '/features' },
  { icon: Calendar, label: 'Sprints', href: '/sprints' },
  { icon: Users, label: 'Team', href: '/team' },
  { icon: AlertTriangle, label: 'Risks', href: '/risks' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gradient-to-b from-uzzai-primary to-uzzai-primary/90 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <span className="text-xl font-bold">Uzz</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">UzzOps</h1>
            <p className="text-xs text-white/70">Management System</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                isActive
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'hover:bg-white/10 text-white/80 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </Link>
        <div className="mt-4 px-4 text-xs text-white/50">
          <p>UzzOps v0.1.0</p>
          <p className="mt-1">© 2026 UzzAI</p>
        </div>
      </div>
    </aside>
  );
}
