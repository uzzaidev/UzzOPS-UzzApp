'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Calendar, Users, AlertTriangle, BarChart3, Star, Spade, Network, ShieldCheck, ClipboardList, Settings, FolderOpen, TrendingUp, Megaphone, Building2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  projectId: string;
  projectName: string;
}

function getMenuItems(projectId: string) {
  return [
    { icon: Home, label: 'Dashboard', href: `/projects/${projectId}/dashboard` },
    { icon: FileText, label: 'Features/Bugs', href: `/projects/${projectId}/features` },
    { icon: Calendar, label: 'Sprints', href: `/projects/${projectId}/sprints` },
    { icon: BarChart3, label: 'Métricas', href: `/projects/${projectId}/metrics` },
    { icon: TrendingUp, label: 'Progresso', href: `/projects/${projectId}/progress` },
    { icon: Megaphone, label: 'Marketing', href: `/projects/${projectId}/marketing` },
    { icon: Star, label: 'MVP Board', href: `/projects/${projectId}/mvp-board` },
    { icon: Spade, label: 'Planning Poker', href: `/projects/${projectId}/planning-poker` },
    { icon: Network, label: 'Mapa Backlog', href: `/projects/${projectId}/backlog-map` },
    { icon: ShieldCheck, label: 'DoD Evolutivo', href: `/projects/${projectId}/dod` },
    { icon: ClipboardList, label: 'Daily Scrum', href: `/projects/${projectId}/daily` },
    { icon: Users, label: 'Team', href: `/projects/${projectId}/team` },
    { icon: Building2, label: 'Clientes', href: `/projects/${projectId}/clients` },
    { icon: BarChart3, label: 'CRM Dashboard', href: `/projects/${projectId}/crm-dashboard` },
    { icon: MessageSquare, label: 'Feedbacks', href: `/projects/${projectId}/feedback` },
    { icon: AlertTriangle, label: 'Risks', href: `/projects/${projectId}/risks` },
  ];
}

export function Sidebar({ projectId, projectName }: SidebarProps) {
  const pathname = usePathname();
  const menuItems = getMenuItems(projectId);

  return (
    <aside className="flex h-full min-h-0 w-64 flex-col bg-gradient-to-b from-uzzai-primary to-uzzai-primary/90 text-white">
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

      {/* Project indicator */}
      <div className="px-6 py-3 border-b border-white/10">
        <Link
          href="/projects"
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
        >
          <FolderOpen className="w-4 h-4" />
          <span className="text-sm font-medium truncate">{projectName}</span>
          <span className="text-xs text-white/50 group-hover:text-white/70 ml-auto shrink-0">Trocar</span>
        </Link>
      </div>

      {/* Menu */}
      <nav className="sidebar-scroll flex-1 min-h-0 overflow-y-auto px-4 py-6 [scrollbar-gutter:stable]">
        <div className="space-y-1 pr-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

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
        </div>
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-white/10 p-4">
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



