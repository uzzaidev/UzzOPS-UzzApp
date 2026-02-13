'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2, Layers } from 'lucide-react';
import { useSuggestDecomposition, useDecomposeEpic } from '@/hooks/useEpicDecomposition';
import type { Feature, DecompositionSuggestion, NewChildStory } from '@/types';

interface Props {
  epic: Feature;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STEP_LABELS = ['Confirmar Épico', 'Estratégia', 'Editar Histórias', 'Validar INVEST', 'Revisar'];

export function EpicDecompositionWizard({ epic, open, onOpenChange }: Props) {
  const [step, setStep] = useState(1);
  const [selectedStrategy, setSelectedStrategy] = useState<DecompositionSuggestion | null>(null);
  const [editedStories, setEditedStories] = useState<NewChildStory[]>([]);

  const { data: suggestions, isLoading: loadingSuggestions } = useSuggestDecomposition(
    open ? epic.id : null
  );
  const decompose = useDecomposeEpic();

  const reset = () => {
    setStep(1);
    setSelectedStrategy(null);
    setEditedStories([]);
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const handleNext = () => {
    if (step === 2 && selectedStrategy) {
      setEditedStories(selectedStrategy.stories.map((s) => ({ ...s })));
    }
    setStep((s) => s + 1);
  };

  const handleFinish = () => {
    decompose.mutate(
      { epicId: epic.id, stories: editedStories, strategy: selectedStrategy?.strategy ?? 'manual' },
      {
        onSuccess: () => {
          handleClose(false);
        },
      }
    );
  };

  const updateStory = (idx: number, field: keyof NewChildStory, value: string | number) => {
    setEditedStories((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-purple-600" />
            Decompor Épico
          </DialogTitle>
        </DialogHeader>

        {/* Progress bar */}
        <div className="flex gap-1 mb-2">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex-1 space-y-1">
              <div className={`h-1.5 rounded-full ${i + 1 <= step ? 'bg-uzzai-primary' : 'bg-muted'}`} />
              <p className={`text-[10px] text-center ${i + 1 === step ? 'text-uzzai-primary font-medium' : 'text-muted-foreground'}`}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Step 1: Confirmar épico */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              <p className="text-xs font-mono text-muted-foreground">{epic.code}</p>
              <p className="font-semibold">{epic.name}</p>
              {epic.description && <p className="text-sm text-muted-foreground">{epic.description}</p>}
              <div className="flex gap-2 flex-wrap">
                {epic.story_points && <Badge>{epic.story_points} pts</Badge>}
                {epic.priority && <Badge variant="outline">{epic.priority}</Badge>}
              </div>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
              Um épico tipicamente tem <strong>&gt; 8 story points</strong> ou não cabe em 1 sprint.
              A decomposição vai criar histórias menores e marcar este épico como decomposto.
            </div>
            <Button onClick={handleNext} className="w-full">
              Sim, decompor este épico <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 2: Estratégia */}
        {step === 2 && (
          <div className="space-y-4">
            {loadingSuggestions ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-3">
                {(suggestions ?? []).map((suggestion) => (
                  <div
                    key={suggestion.strategy}
                    onClick={() => setSelectedStrategy(suggestion)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedStrategy?.strategy === suggestion.strategy
                        ? 'border-uzzai-primary bg-uzzai-primary/5 shadow-sm'
                        : 'hover:border-uzzai-primary/40 hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{suggestion.label}</h4>
                      <Badge variant="secondary">{suggestion.stories.length} histórias</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {suggestion.stories.map((s) => s.name).join(' · ')}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
              <Button onClick={handleNext} disabled={!selectedStrategy} className="flex-1">
                Próximo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Editar histórias */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Edite as histórias antes de criar:</p>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {editedStories.map((story, idx) => (
                <div key={idx} className="border rounded-lg p-3 space-y-2">
                  <Input
                    value={story.name}
                    onChange={(e) => updateStory(idx, 'name', e.target.value)}
                    className="font-medium"
                    placeholder="Nome da história"
                  />
                  <Textarea
                    value={story.description ?? ''}
                    onChange={(e) => updateStory(idx, 'description', e.target.value)}
                    className="text-sm resize-none"
                    rows={2}
                    placeholder="Descrição"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-muted-foreground">Story Points:</label>
                    <Input
                      type="number"
                      min={1}
                      max={21}
                      value={story.story_points}
                      onChange={(e) => updateStory(idx, 'story_points', parseInt(e.target.value, 10) || 1)}
                      className="w-20 h-7 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Próximo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: INVEST */}
        {step === 4 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Verifique se as histórias seguem os critérios INVEST:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'I', label: 'Independent', desc: 'Cada história pode ser desenvolvida independentemente' },
                { key: 'N', label: 'Negotiable', desc: 'Detalhes podem ser negociados com o time' },
                { key: 'V', label: 'Valuable', desc: 'Entrega valor real para o usuário' },
                { key: 'E', label: 'Estimable', desc: 'Time consegue estimar o esforço' },
                { key: 'S', label: 'Small', desc: 'Cabe em 1 sprint' },
                { key: 'T', label: 'Testable', desc: 'Tem critérios de aceitação claros' },
              ].map((item) => (
                <div key={item.key} className="flex items-start gap-2 p-2 rounded-lg bg-green-50 border border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-green-800">
                      <span className="text-green-600">{item.key}</span> — {item.label}
                    </p>
                    <p className="text-[10px] text-green-700">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Confirmado! <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Review final */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <p className="text-sm font-medium">Serão criadas {editedStories.length} histórias:</p>
              <ul className="space-y-1">
                {editedStories.map((story, idx) => (
                  <li key={idx} className="flex items-center justify-between text-sm">
                    <span className="truncate flex-1">{story.name}</span>
                    <Badge variant="secondary" className="ml-2 flex-shrink-0">{story.story_points} pts</Badge>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground mt-2">
                O épico original será marcado como <Badge variant="outline" className="text-[10px]">decomposto</Badge> e permanecerá no backlog.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(4)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
              <Button
                onClick={handleFinish}
                disabled={decompose.isPending}
                className="flex-1"
              >
                {decompose.isPending
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando histórias...</>
                  : <>Criar {editedStories.length} histórias</>
                }
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
