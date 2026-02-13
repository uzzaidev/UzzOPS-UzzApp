'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Loader2, Eye, ArrowRight, CheckCircle2, Users } from 'lucide-react';
import { PokerCard } from './poker-card';
import { usePokerSession, usePokerVote, useUpdatePokerSession, useFinalizePokerVote } from '@/hooks/usePlanningPoker';
import type { PokerCardValue } from '@/types';

const FIBONACCI_CARDS: PokerCardValue[] = ['0', '½', '1', '2', '3', '5', '8', '13', '21', '∞', '?', '☕'];

interface Props {
  sessionId: string;
}

export function PokerSession({ sessionId }: Props) {
  const [voterName, setVoterName] = useState('');
  const [nameSet, setNameSet] = useState(false);
  const [selectedCard, setSelectedCard] = useState<PokerCardValue | null>(null);
  const [finalValue, setFinalValue] = useState<string>('');

  const { data, isLoading, error } = usePokerSession(sessionId);
  const vote = usePokerVote(sessionId);
  const updateSession = useUpdatePokerSession(sessionId);
  const finalize = useFinalizePokerVote(sessionId);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-uzzai-primary" />
      </div>
    );
  }

  if (error || !data) {
    return <p className="text-red-600 text-sm">Erro ao carregar sessão.</p>;
  }

  const { session, features, votes, results } = data;
  const currentFeature = features[session.current_feature_index];
  const isLastFeature = session.current_feature_index >= features.length - 1;
  const progress = Math.round((results.length / features.length) * 100);

  if (!currentFeature) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-500" />
          <h3 className="text-lg font-semibold text-green-700">Sessão Concluída!</h3>
          <p className="text-sm text-green-600 mt-1">
            {results.length} feature(s) estimadas com sucesso.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!nameSet) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Identificação</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (voterName.trim()) setNameSet(true);
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="voter_name">Seu nome</Label>
              <Input
                id="voter_name"
                placeholder="Ex: Pedro, Luis..."
                value={voterName}
                onChange={(e) => setVoterName(e.target.value)}
                required
              />
            </div>
            <Button type="submit">Entrar na Sessão</Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  const currentVotes = votes.filter((v) => v.feature_id === currentFeature.id);
  const myVote = currentVotes.find((v) => v.voter_name === voterName);
  const currentResult = results.find((r) => r.feature_id === currentFeature.id);

  const handleVote = async (card: PokerCardValue) => {
    setSelectedCard(card);
    await vote.mutateAsync({
      feature_id: currentFeature.id,
      vote_value: card,
      voter_name: voterName,
    });
  };

  const handleReveal = () => {
    updateSession.mutate({ revealed: true });
  };

  const handleNext = async () => {
    if (finalValue === '' && !currentResult) return;

    const valueToSave = currentResult ? currentResult.final_value : parseInt(finalValue, 10);

    if (!currentResult) {
      await finalize.mutateAsync({
        feature_id: currentFeature.id,
        final_value: valueToSave,
        consensus_level: 'majority',
      });
    }

    if (isLastFeature) {
      updateSession.mutate({ status: 'completed', completed_at: new Date().toISOString() });
    } else {
      updateSession.mutate({
        current_feature_index: session.current_feature_index + 1,
        revealed: false,
      });
      setSelectedCard(null);
      setFinalValue('');
    }
  };

  const handleFinalize = async () => {
    const val = parseInt(finalValue, 10);
    if (isNaN(val)) return;

    await finalize.mutateAsync({
      feature_id: currentFeature.id,
      final_value: val,
      consensus_level:
        currentVotes.every((v) => v.vote_numeric === val)
          ? 'unanimous'
          : 'majority',
    });
  };

  const sessionTypeLabel = session.type === 'business_value' ? 'Business Value (BV)' : 'Work Effort (W)';

  return (
    <div className="space-y-6">
      {/* Header da sessão */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{session.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{sessionTypeLabel}</Badge>
                <Badge variant="secondary">
                  {session.current_feature_index + 1}/{features.length}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-uzzai-primary">{progress}%</p>
              <p className="text-xs text-muted-foreground">concluído</p>
            </div>
          </div>
          <Progress value={progress} className="mt-3 h-2" />
        </CardContent>
      </Card>

      {/* Feature atual */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-mono text-muted-foreground">{currentFeature.code}</p>
              <CardTitle className="text-xl mt-1">{currentFeature.name}</CardTitle>
              {currentFeature.description && (
                <p className="mt-2 text-sm text-muted-foreground">{currentFeature.description}</p>
              )}
            </div>
            <div className="flex gap-2 text-right">
              {currentFeature.story_points && (
                <Badge variant="outline">{currentFeature.story_points} pts</Badge>
              )}
              {session.type === 'business_value' && currentFeature.business_value && (
                <Badge>BV: {currentFeature.business_value}</Badge>
              )}
              {session.type === 'work_effort' && currentFeature.work_effort && (
                <Badge>W: {currentFeature.work_effort}</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Votos revelados */}
          {session.revealed && currentVotes.length > 0 && (
            <div>
              <p className="mb-3 text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Votos revelados ({currentVotes.length})
              </p>
              <div className="flex flex-wrap gap-4">
                {currentVotes.map((v) => (
                  <PokerCard
                    key={v.id}
                    value={v.vote_value as PokerCardValue}
                    revealed
                    voterName={v.voter_name}
                    size="sm"
                  />
                ))}
              </div>

              {/* Finalizar */}
              {!currentResult && (
                <div className="mt-4 flex items-end gap-3 rounded-lg border border-uzzai-primary/20 bg-uzzai-primary/5 p-4">
                  <div className="space-y-1.5 flex-1">
                    <Label htmlFor="final_value">Valor final ({sessionTypeLabel})</Label>
                    <Input
                      id="final_value"
                      type="number"
                      min={0}
                      placeholder="Ex: 8"
                      value={finalValue}
                      onChange={(e) => setFinalValue(e.target.value)}
                      className="max-w-[120px]"
                    />
                  </div>
                  <Button
                    onClick={handleFinalize}
                    disabled={finalize.isPending || finalValue === ''}
                  >
                    {finalize.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirmar
                  </Button>
                </div>
              )}

              {currentResult && (
                <div className="mt-4 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-green-700">
                    Valor final: <strong>{currentResult.final_value}</strong> pts
                  </span>
                  <Button
                    size="sm"
                    onClick={handleNext}
                    disabled={updateSession.isPending}
                    className="ml-auto"
                  >
                    {isLastFeature ? 'Concluir sessão' : 'Próxima feature'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Área de votação */}
          {!session.revealed && (
            <div className="space-y-4">
              <p className="text-sm font-medium">
                Escolha sua carta para <strong>{sessionTypeLabel}</strong>:
              </p>
              <div className="flex flex-wrap gap-3">
                {FIBONACCI_CARDS.map((card) => (
                  <PokerCard
                    key={card}
                    value={card}
                    selected={selectedCard === card || myVote?.vote_value === card}
                    onClick={() => handleVote(card)}
                    disabled={vote.isPending}
                    size="md"
                  />
                ))}
              </div>

              {myVote && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
                  <CheckCircle2 className="inline h-4 w-4 mr-1" />
                  Seu voto: <strong>{myVote.vote_value}</strong> — aguardando facilitador revelar...
                </div>
              )}

              {currentVotes.length > 0 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{currentVotes.length} voto(s) registrado(s)</span>
                  <Button variant="outline" size="sm" onClick={handleReveal} disabled={updateSession.isPending}>
                    <Eye className="mr-2 h-4 w-4" />
                    Revelar votos
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
