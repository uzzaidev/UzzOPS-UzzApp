'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, X } from 'lucide-react';
import { useCreateDailyLog, useMyLatestDaily } from '@/hooks/useDailyLogs';
import { toast } from 'sonner';

interface Props {
  projectId: string;
  sprintId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DailyLogModal({ projectId, sprintId, open, onOpenChange }: Props) {
  const [yesterday, setYesterday] = useState('');
  const [today, setToday] = useState('');
  const [impediments, setImpediments] = useState<string[]>([]);
  const [newImpediment, setNewImpediment] = useState('');

  const { data: latestDaily } = useMyLatestDaily(projectId);
  const createDaily = useCreateDailyLog();

  // Pre-fill "yesterday" from last daily's "today"
  useEffect(() => {
    if (latestDaily && !yesterday && open) {
      setYesterday(latestDaily.what_will_do_today ?? '');
    }
  }, [latestDaily, open]);

  const handleAddImpediment = () => {
    if (newImpediment.trim()) {
      setImpediments((prev) => [...prev, newImpediment.trim()]);
      setNewImpediment('');
    }
  };

  const handleRemoveImpediment = (idx: number) => {
    setImpediments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleClose = () => {
    setYesterday('');
    setToday('');
    setImpediments([]);
    setNewImpediment('');
    onOpenChange(false);
  };

  const handleSubmit = () => {
    createDaily.mutate(
      {
        projectId,
        sprintId: sprintId ?? null,
        whatDidYesterday: yesterday,
        whatWillDoToday: today,
        impediments,
      },
      {
        onSuccess: () => {
          toast.success('Daily log salvo!');
          handleClose();
        },
        onError: (err) => {
          toast.error(err.message ?? 'Erro ao salvar daily');
        },
      }
    );
  };

  const today_date = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Daily Scrum Log</DialogTitle>
          <p className="text-sm text-muted-foreground capitalize">{today_date}</p>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <Label htmlFor="yesterday">1. O que fiz ontem?</Label>
            <Textarea
              id="yesterday"
              value={yesterday}
              onChange={(e) => setYesterday(e.target.value)}
              placeholder="Completei a feature X, revisei o PR #123..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="today">2. O que farei hoje?</Label>
            <Textarea
              id="today"
              value={today}
              onChange={(e) => setToday(e.target.value)}
              placeholder="Vou implementar a feature Y, participar do planning..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label>3. Impedimentos? (Opcional)</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={newImpediment}
                onChange={(e) => setNewImpediment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImpediment())}
                placeholder="Ex: Bloqueado por issue de API..."
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddImpediment}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {impediments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {impediments.map((imp, idx) => (
                  <Badge key={idx} variant="destructive" className="gap-1 pr-1">
                    {imp}
                    <button
                      onClick={() => handleRemoveImpediment(idx)}
                      className="ml-1 hover:opacity-70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!yesterday.trim() || !today.trim() || createDaily.isPending}
            >
              {createDaily.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
              ) : (
                'Salvar Daily'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
