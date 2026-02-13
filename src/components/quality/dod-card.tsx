'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, TrendingUp, CheckCircle2, Clock, History } from 'lucide-react';
import { useDod, useUpgradeDod } from '@/hooks/useDod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  projectId: string;
}

const LEVEL_COLORS = ['', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500'];
const LEVEL_BG = ['', 'bg-blue-50 border-blue-200', 'bg-yellow-50 border-yellow-200', 'bg-green-50 border-green-200'];
const LEVEL_TEXT = ['', 'text-blue-700', 'text-yellow-700', 'text-green-700'];

export function DodCard({ projectId }: Props) {
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [reason, setReason] = useState('');
  const { data, isLoading } = useDod(projectId);
  const upgrade = useUpgradeDod(projectId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { levels, activeLevel, canUpgrade, history } = data;
  const level = activeLevel?.level ?? 1;
  const progressPct = Math.round((level / 3) * 100);

  const handleUpgrade = () => {
    if (!activeLevel) return;
    upgrade.mutate(
      { toLevel: activeLevel.level + 1, reason: reason.trim() || 'Time atingiu critérios de maturidade' },
      { onSuccess: () => { setUpgradeOpen(false); setReason(''); } }
    );
  };

  return (
    <div className="space-y-4">
      {/* Card principal */}
      <Card className={`border ${LEVEL_BG[level]}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className={`h-5 w-5 ${LEVEL_TEXT[level]}`} />
              Definition of Done
            </CardTitle>
            <Badge className={`${LEVEL_COLORS[level]} text-white`}>
              Nível {level} — {activeLevel?.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progresso de maturidade */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Maturidade do time</span>
              <span>{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-2" />
          </div>

          {/* Critérios do nível ativo */}
          <div>
            <p className="text-sm font-medium mb-2">Critérios do Nível {level}:</p>
            <ul className="space-y-1.5">
              {(activeLevel?.criteria ?? []).map((criterion, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className={`h-4 w-4 flex-shrink-0 mt-0.5 ${LEVEL_TEXT[level]}`} />
                  <span>{criterion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Botão de upgrade */}
          {canUpgrade && level < 3 && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-3">
              <p className="text-sm font-medium text-green-800 mb-2">
                O time está pronto para evoluir para o Nível {level + 1}!
              </p>
              <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Evoluir para Nível {level + 1}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Evoluir DoD para Nível {level + 1}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="rounded-lg border p-3 space-y-1">
                      <p className="text-sm font-medium">Novos critérios do Nível {level + 1}:</p>
                      <ul className="space-y-1">
                        {levels.find((l) => l.level === level + 1)?.criteria?.map((c, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                            <span className="mt-0.5">•</span> {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="reason">Motivo (opcional)</Label>
                      <Textarea
                        id="reason"
                        placeholder="Ex: 3 sprints consecutivos com velocity estável e completion > 90%"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setUpgradeOpen(false)}>Cancelar</Button>
                      <Button onClick={handleUpgrade} disabled={upgrade.isPending}>
                        {upgrade.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirmar Evolução
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Todos os níveis */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Todos os Níveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {levels.map((l) => (
              <div
                key={l.id}
                className={`rounded-lg border p-3 ${
                  l.is_active ? LEVEL_BG[l.level] : 'bg-muted/30 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className={`text-sm font-medium ${l.is_active ? LEVEL_TEXT[l.level] : 'text-muted-foreground'}`}>
                    Nível {l.level}: {l.name}
                  </p>
                  {l.is_active && <Badge className={`${LEVEL_COLORS[l.level]} text-white text-xs`}>Ativo</Badge>}
                  {l.activated_at && !l.is_active && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(l.activated_at), 'dd/MM/yy', { locale: ptBR })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{l.criteria?.length ?? 0} critérios</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Histórico */}
      {history.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-4 w-4" />
              Histórico de Evoluções
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0 last:pb-0">
                  <span className="text-muted-foreground">
                    {h.from_level ? `Nível ${h.from_level}` : 'Inicial'} → Nível {h.to_level}
                    {h.reason && <span className="ml-1 text-xs">({h.reason})</span>}
                  </span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {format(new Date(h.changed_at), 'dd/MM/yy', { locale: ptBR })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
