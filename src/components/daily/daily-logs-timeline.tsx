'use client';

import { useState } from 'react';
import { useDailyLogs } from '@/hooks/useDailyLogs';
import { useUpdateDailyLog } from '@/hooks/useDailyLogs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Loader2, Plus, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { DailyLogWithMember } from '@/types';

interface Props {
  projectId: string;
  sprintId?: string;
}

function DailyCard({
  log,
  onEdit,
}: {
  log: DailyLogWithMember;
  onEdit: (log: DailyLogWithMember) => void;
}) {
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
        <div className="flex items-center gap-2">
          {log.sprint?.name && (
            <Badge variant="outline" className="text-xs">{log.sprint.name}</Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => onEdit(log)}>
            Editar
          </Button>
        </div>
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
  const updateDaily = useUpdateDailyLog();

  const [editingLog, setEditingLog] = useState<DailyLogWithMember | null>(null);
  const [yesterday, setYesterday] = useState('');
  const [today, setToday] = useState('');
  const [impediments, setImpediments] = useState<string[]>([]);
  const [newImpediment, setNewImpediment] = useState('');

  function openEditor(log: DailyLogWithMember) {
    setEditingLog(log);
    setYesterday(log.what_did_yesterday ?? '');
    setToday(log.what_will_do_today ?? '');
    setImpediments(log.impediments ?? []);
    setNewImpediment('');
  }

  function closeEditor() {
    setEditingLog(null);
    setYesterday('');
    setToday('');
    setImpediments([]);
    setNewImpediment('');
  }

  function addImpediment() {
    const value = newImpediment.trim();
    if (!value) return;
    setImpediments((prev) => [...prev, value]);
    setNewImpediment('');
  }

  function removeImpediment(index: number) {
    setImpediments((prev) => prev.filter((_, i) => i !== index));
  }

  function saveEdit() {
    if (!editingLog) return;
    if (!yesterday.trim() || !today.trim()) {
      toast.error('Campos Ontem e Hoje sao obrigatorios.');
      return;
    }

    updateDaily.mutate(
      {
        id: editingLog.id,
        projectId,
        sprintId: editingLog.sprint_id,
        logDate: editingLog.log_date,
        whatDidYesterday: yesterday.trim(),
        whatWillDoToday: today.trim(),
        impediments,
      },
      {
        onSuccess: () => {
          toast.success('Daily log atualizado.');
          closeEditor();
        },
        onError: (err) => {
          toast.error(err.message ?? 'Erro ao atualizar daily log.');
        },
      }
    );
  }

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
      <Dialog open={Boolean(editingLog)} onOpenChange={(open) => !open && closeEditor()}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Editar Daily Log</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label htmlFor="edit-yesterday">Ontem</Label>
              <Textarea
                id="edit-yesterday"
                value={yesterday}
                onChange={(e) => setYesterday(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-today">Hoje</Label>
              <Textarea
                id="edit-today"
                value={today}
                onChange={(e) => setToday(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Impedimentos (opcional)</Label>
              <div className="mt-1 flex gap-2">
                <Input
                  value={newImpediment}
                  onChange={(e) => setNewImpediment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImpediment())}
                  placeholder="Adicionar impedimento"
                />
                <Button type="button" variant="outline" size="icon" onClick={addImpediment}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {impediments.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {impediments.map((impediment, index) => (
                    <Badge key={`${impediment}-${index}`} variant="destructive" className="gap-1 pr-1">
                      {impediment}
                      <button onClick={() => removeImpediment(index)} className="ml-1 hover:opacity-70">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={closeEditor}>
                Cancelar
              </Button>
              <Button onClick={saveEdit} disabled={updateDaily.isPending}>
                {updateDaily.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar alteracoes'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
                <DailyCard key={log.id} log={log} onEdit={openEditor} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
