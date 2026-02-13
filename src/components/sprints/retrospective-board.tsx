'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus, CheckCircle2, Clock, XCircle, Trash2 } from 'lucide-react';
import {
  useRetrospectiveActions,
  useCreateRetrospectiveAction,
  useUpdateRetrospectiveAction,
  useDeleteRetrospectiveAction,
} from '@/hooks/useRetrospectives';
import type { RetrospectiveAction, RetrospectiveCategory, RetrospectiveStatus } from '@/types';

interface Props {
  sprintId: string;
  sprintName: string;
  projectId: string;
}

const CATEGORY_CONFIG: Record<
  RetrospectiveCategory,
  { label: string; emoji: string; color: string; bgColor: string }
> = {
  worked_well: {
    label: 'O que funcionou',
    emoji: '✅',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
  },
  needs_improvement: {
    label: 'O que melhorar',
    emoji: '⚠️',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50 border-yellow-200',
  },
  experiment: {
    label: 'Experimentos',
    emoji: '🧪',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
  },
};

const STATUS_CONFIG: Record<RetrospectiveStatus, { label: string; icon: typeof Clock; color: string }> = {
  pending: { label: 'Pendente', icon: Clock, color: 'text-gray-500' },
  in_progress: { label: 'Em progresso', icon: Clock, color: 'text-yellow-500' },
  done: { label: 'Concluído', icon: CheckCircle2, color: 'text-green-500' },
  abandoned: { label: 'Abandonado', icon: XCircle, color: 'text-red-400' },
};

function ActionCard({
  action,
  onStatusChange,
  onDelete,
}: {
  action: RetrospectiveAction;
  onStatusChange: (id: string, status: RetrospectiveStatus) => void;
  onDelete: (id: string) => void;
}) {
  const config = STATUS_CONFIG[action.status];
  const Icon = config.icon;

  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm space-y-2">
      <p className="text-sm leading-snug">{action.action_text}</p>
      {action.success_criteria && (
        <p className="text-xs text-muted-foreground border-l-2 border-green-300 pl-2">
          Meta: {action.success_criteria}
        </p>
      )}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Icon className={`h-3.5 w-3.5 ${config.color}`} />
          <Select
            value={action.status}
            onValueChange={(val) => onStatusChange(action.id, val as RetrospectiveStatus)}
          >
            <SelectTrigger className="h-6 text-xs border-none p-0 shadow-none focus:ring-0 w-auto gap-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(STATUS_CONFIG) as RetrospectiveStatus[]).map((s) => (
                <SelectItem key={s} value={s} className="text-xs">
                  {STATUS_CONFIG[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <button
          onClick={() => onDelete(action.id)}
          className="text-gray-300 hover:text-red-400 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function AddActionDialog({
  category,
  sprintId,
  projectId,
}: {
  category: RetrospectiveCategory;
  sprintId: string;
  projectId: string;
}) {
  const [open, setOpen] = useState(false);
  const [actionText, setActionText] = useState('');
  const [successCriteria, setSuccessCriteria] = useState('');
  const createAction = useCreateRetrospectiveAction();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionText.trim()) return;
    await createAction.mutateAsync({
      sprint_id: sprintId,
      project_id: projectId,
      category,
      action_text: actionText.trim(),
      status: 'pending',
      owner_id: null,
      due_date: null,
      success_criteria: successCriteria.trim() || null,
      outcome: null,
    });
    setActionText('');
    setSuccessCriteria('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full border-2 border-dashed text-xs">
          <Plus className="mr-1 h-3 w-3" />
          Adicionar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{CATEGORY_CONFIG[category].emoji} {CATEGORY_CONFIG[category].label}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="action_text">Ação *</Label>
            <Textarea
              id="action_text"
              placeholder="Descreva a ação ou observação..."
              value={actionText}
              onChange={(e) => setActionText(e.target.value)}
              required
              rows={3}
            />
          </div>
          {category === 'experiment' && (
            <div className="space-y-1.5">
              <Label htmlFor="success_criteria">Critério de sucesso</Label>
              <Input
                id="success_criteria"
                placeholder="Ex: WIP médio < 3 em 3 dailies consecutivos"
                value={successCriteria}
                onChange={(e) => setSuccessCriteria(e.target.value)}
              />
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createAction.isPending}>
              {createAction.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Adicionar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function RetrospectiveBoard({ sprintId, sprintName, projectId }: Props) {
  const { data: actions, isLoading } = useRetrospectiveActions(sprintId);
  const updateAction = useUpdateRetrospectiveAction();
  const deleteAction = useDeleteRetrospectiveAction();

  const handleStatusChange = (id: string, status: RetrospectiveStatus) => {
    updateAction.mutate({ id, data: { status } });
  };

  const handleDelete = (id: string) => {
    deleteAction.mutate({ id, sprintId });
  };

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-uzzai-primary" />
      </div>
    );
  }

  const allActions = actions ?? [];
  const pendingExperiments = allActions.filter(
    (a) => a.category === 'experiment' && a.status === 'pending'
  );

  return (
    <div className="space-y-6">
      {/* Aviso de ações pendentes */}
      {pendingExperiments.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm text-amber-700">
            <strong>{pendingExperiments.length} experimento(s)</strong> do sprint anterior ainda pendente(s).
            Acompanhe no próximo Sprint Planning.
          </p>
        </div>
      )}

      {/* Board 3 colunas */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {(Object.keys(CATEGORY_CONFIG) as RetrospectiveCategory[]).map((category) => {
          const config = CATEGORY_CONFIG[category];
          const categoryActions = allActions.filter((a) => a.category === category);

          return (
            <Card key={category} className={`border ${config.bgColor}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-sm font-semibold ${config.color}`}>
                    {config.emoji} {config.label}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {categoryActions.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {categoryActions.map((action) => (
                  <ActionCard
                    key={action.id}
                    action={action}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))}
                <AddActionDialog
                  category={category}
                  sprintId={sprintId}
                  projectId={projectId}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Resumo de ações */}
      {allActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Resumo das Ações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              {(Object.keys(STATUS_CONFIG) as RetrospectiveStatus[]).map((status) => {
                const count = allActions.filter((a) => a.status === status).length;
                const config = STATUS_CONFIG[status];
                const Icon = config.icon;
                return (
                  <div key={status} className="rounded-lg bg-muted/50 p-3">
                    <Icon className={`mx-auto mb-1 h-5 w-5 ${config.color}`} />
                    <p className="text-xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground">{config.label}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
