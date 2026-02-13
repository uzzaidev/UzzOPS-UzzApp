'use client';

import { useDailyLogs } from '@/hooks/useDailyLogs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, User } from 'lucide-react';
import type { DailyLogWithMember } from '@/types';

interface Props {
  projectId: string;
  sprintId?: string;
}

function DailyCard({ log }: { log: DailyLogWithMember }) {
  const date = new Date(log.log_date + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-uzzai-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-uzzai-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {log.team_member?.name ?? 'Membro'}
            </p>
            <p className="text-xs text-muted-foreground capitalize">{date}</p>
          </div>
        </div>
        {log.sprint?.name && (
          <Badge variant="outline" className="text-xs">{log.sprint.name}</Badge>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ontem</p>
          <p className="text-sm mt-0.5">{log.what_did_yesterday}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Hoje</p>
          <p className="text-sm mt-0.5">{log.what_will_do_today}</p>
        </div>
      </div>

      {log.impediments?.length > 0 && (
        <div className="pt-1">
          <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-destructive" />
            Impedimentos
          </p>
          <div className="flex flex-wrap gap-1">
            {log.impediments.map((imp, i) => (
              <Badge key={i} variant="destructive" className="text-xs font-normal">
                {imp}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function DailyLogsTimeline({ projectId, sprintId }: Props) {
  const { data: logs, isLoading, error } = useDailyLogs(projectId, sprintId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-36 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Erro ao carregar daily logs.
      </div>
    );
  }

  if (!logs?.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="font-medium">Nenhum Daily registrado ainda.</p>
        <p className="text-sm mt-1">Clique em &quot;Log Daily&quot; para começar.</p>
      </div>
    );
  }

  // Group by date
  const grouped = logs.reduce<Record<string, DailyLogWithMember[]>>((acc, log) => {
    const key = log.log_date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(log);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([date, entries]) => {
        const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
        });
        return (
          <div key={date}>
            <h3 className="text-sm font-semibold text-muted-foreground capitalize mb-2">
              {dateLabel}
              <span className="ml-2 text-xs font-normal">
                ({entries.length} {entries.length === 1 ? 'membro' : 'membros'})
              </span>
            </h3>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {entries.map((log) => (
                <DailyCard key={log.id} log={log} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
