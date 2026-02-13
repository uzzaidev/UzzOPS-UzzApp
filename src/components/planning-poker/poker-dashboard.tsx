'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus, Spade, Play, CheckCircle2, XCircle } from 'lucide-react';
import { usePokerSessions, useCreatePokerSession } from '@/hooks/usePlanningPoker';
import { useFeatures } from '@/hooks/useFeatures';
import { PokerSession } from './poker-session';
import type { PokerSessionType, PlanningPokerSession } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  projectId: string;
}

function SessionStatusBadge({ status }: { status: PlanningPokerSession['status'] }) {
  if (status === 'active') return <Badge className="bg-green-100 text-green-700 border-green-200" variant="outline">Ativa</Badge>;
  if (status === 'completed') return <Badge className="bg-gray-100 text-gray-600" variant="outline"><CheckCircle2 className="mr-1 h-3 w-3" />Concluída</Badge>;
  return <Badge className="bg-red-100 text-red-600" variant="outline"><XCircle className="mr-1 h-3 w-3" />Cancelada</Badge>;
}

function CreateSessionDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<PokerSessionType>('business_value');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const { data: featuresResponse } = useFeatures({ projectId });
  const createSession = useCreatePokerSession();

  const features = featuresResponse?.data ?? [];
  const unestimatedFeatures = features.filter((f) =>
    type === 'business_value'
      ? !f.business_value
      : !f.work_effort
  );

  const handleToggleFeature = (id: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || selectedFeatures.length === 0) return;

    await createSession.mutateAsync({
      project_id: projectId,
      name: name.trim(),
      type,
      feature_ids: selectedFeatures,
    });

    setOpen(false);
    setName('');
    setSelectedFeatures([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Sessão
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Criar Sessão de Planning Poker</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="session_name">Nome da sessão *</Label>
            <Input
              id="session_name"
              placeholder="Ex: Sprint 5 Planning - BV"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Tipo de estimativa *</Label>
            <Select value={type} onValueChange={(v) => { setType(v as PokerSessionType); setSelectedFeatures([]); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="business_value">Business Value (BV)</SelectItem>
                <SelectItem value="work_effort">Work Effort (W)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Features para estimar ({selectedFeatures.length} selecionadas)</Label>
            <div className="max-h-48 overflow-y-auto rounded-lg border p-2 space-y-1.5">
              {unestimatedFeatures.length === 0 ? (
                <p className="text-xs text-muted-foreground p-2">
                  Todas as features já foram estimadas para {type === 'business_value' ? 'BV' : 'W'}.
                </p>
              ) : (
                unestimatedFeatures.map((feature) => (
                  <div key={feature.id} className="flex items-center gap-2 rounded p-1.5 hover:bg-muted/50">
                    <Checkbox
                      id={feature.id}
                      checked={selectedFeatures.includes(feature.id)}
                      onCheckedChange={() => handleToggleFeature(feature.id)}
                    />
                    <label htmlFor={feature.id} className="flex-1 cursor-pointer text-sm">
                      <span className="font-mono text-xs text-muted-foreground">{feature.code}</span>
                      {' '}{feature.name}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createSession.isPending || selectedFeatures.length === 0}
            >
              {createSession.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Sessão
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PokerDashboard({ projectId }: Props) {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const { data: sessions, isLoading } = usePokerSessions(projectId);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-uzzai-primary" />
      </div>
    );
  }

  if (activeSessionId) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" onClick={() => setActiveSessionId(null)}>
          ← Voltar para sessões
        </Button>
        <PokerSession sessionId={activeSessionId} />
      </div>
    );
  }

  const allSessions = sessions ?? [];
  const activeSessions = allSessions.filter((s) => s.status === 'active');
  const completedSessions = allSessions.filter((s) => s.status !== 'active');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {activeSessions.length} sessão(ões) ativa(s) · {completedSessions.length} concluída(s)
          </p>
        </div>
        <CreateSessionDialog projectId={projectId} />
      </div>

      {allSessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Spade className="mb-4 h-16 w-16 text-gray-200" />
            <h3 className="text-lg font-medium text-gray-700">Nenhuma sessão ainda</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Crie uma sessão de Planning Poker para estimar Business Value (BV) ou Work Effort (W)
              das features do backlog.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {allSessions.map((session) => (
            <Card key={session.id} className="hover:border-uzzai-primary/40 transition-colors">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{session.name}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <SessionStatusBadge status={session.status} />
                      <Badge variant="secondary" className="text-xs">
                        {session.type === 'business_value' ? 'Business Value' : 'Work Effort'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {session.feature_ids.length} features
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(session.created_at), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                  {session.status === 'active' && (
                    <Button
                      size="sm"
                      onClick={() => setActiveSessionId(session.id)}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Entrar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
