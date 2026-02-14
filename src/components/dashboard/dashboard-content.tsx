'use client';

import { EnterpriseDashboard } from '@/components/dashboard/enterprise-dashboard';

interface DashboardContentProps {
  projectId: string;
}

export function DashboardContent({ projectId }: DashboardContentProps) {
  return <EnterpriseDashboard projectId={projectId} />;
}
